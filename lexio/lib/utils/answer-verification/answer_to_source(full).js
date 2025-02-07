require('dotenv').config();
const { execSync } = require('child_process');

const fs = require('fs');
const path = require("path"); 
const { spawnSync } = require("child_process");

const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDINGS_FILE = 'embeddings.json';

const nlp = require('compromise');


/// PREPROCESSING
// should be improved for larger-file; image-based text extraction could be added (pdf2image or pdfplumber)
async function parsePdfWithMarker(filePath) {
  console.log(`Parsing PDF using Marker: ${filePath}`);
  const outputDir = "marker";
  
  // Include the --quiet flag if Marker supports it
  const markerArgs = [
    filePath,
    "--output_dir", outputDir,
    "--output_format", "json",
    "--paginate_output",
    //"--quiet"
  ];
  
  const markerProcess = spawnSync(
    "marker_single", 
    markerArgs,
    {
      encoding: "utf-8",
    }
  );

  if (markerProcess.error) {
    throw new Error(`Failed to run Marker: ${markerProcess.error.message}`);
  }
  
  if (markerProcess.stderr) {
    console.error("Marker stderr:", markerProcess.stderr);
  }

  let markerOutput = null;
  
  // Try to extract JSON from stdout
  const stdoutText = markerProcess.stdout;
  const jsonStartIndex = stdoutText.indexOf('{');
  if (jsonStartIndex !== -1) {
    try {
      const jsonString = stdoutText.slice(jsonStartIndex);
      markerOutput = JSON.parse(jsonString);
    } catch (err) {
      console.error("Error parsing JSON from stdout:", err);
    }
  } else {
    console.error("No JSON found in Marker stdout.");
  }
  
  // If we didn't get JSON from stdout, fallback to reading an output file.
  if (!markerOutput) {
    // Marker may write the output file in one of two locations.
    // Option 1: marker/<basename>/<basename>.json
    // Option 2: marker/<basename>.json
    const basename = path.basename(filePath, path.extname(filePath));
    const possiblePaths = [
      path.join(outputDir, basename, `${basename}.json`),
      path.join(outputDir, `${basename}.json`)
    ];
    
    let foundPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }
    
    if (!foundPath) {
      throw new Error(`Marker did not produce an output JSON file in any of these locations: ${possiblePaths.join(', ')}`);
    }
    
    const markerFileContents = fs.readFileSync(foundPath, "utf-8");
    try {
      markerOutput = JSON.parse(markerFileContents);
    } catch (err) {
      throw new Error(`Error parsing Marker JSON file: ${err.message}`);
    }
  }
  
  //console.log("Marker raw JSON output:", markerOutput);
  return {
    blocks: markerOutput,  // send the entire document JSON
    metadata: markerOutput.metadata || {}
  };
  
}

function cleanAndSplitText(rawBlocks, metadata) {
  // Instead of sending { rawText, metadata }, send { rawBlocks, metadata }
  const inputJson = JSON.stringify({ rawBlocks, metadata });
  const pythonProcess = spawnSync("python3", ["clean_and_split.py"], {
    input: inputJson,
    encoding: "utf-8",
  });

  if (pythonProcess.error) {
    throw new Error(`Failed to start Python script: ${pythonProcess.error.message}`);
  }
  if (pythonProcess.stderr) {
    console.error("Python stderr:", pythonProcess.stderr);
  }
  try {
    return JSON.parse(pythonProcess.stdout);
  } catch (parseError) {
    console.error("Error parsing Python output:", parseError);
    throw new Error("Failed to process text with Python script.");
  }
}

// 1. Parse & Clean
async function parseAndCleanPdf(filePath) {
  // Adjust parsePdfWithMarker to return the full Marker JSON.
  const { blocks, metadata } = await parsePdfWithMarker(filePath);
  if (!blocks) {
    console.error("Parsed data is empty. Skipping cleaning.");
    return [];
  }
  return cleanAndSplitText(blocks, metadata);
}

// // Example usage:
// (async () => {
//   const filePath = 'attention.pdf';
//   try {
//     const result = await parseAndCleanPdf(filePath);
//     console.log(JSON.stringify(result.slice(0, 30), null, 2));
//   } catch (error) {
//     console.error("Error processing PDF:", error);
//   }
// })();
 

/// CHUNKING
const natural = require("natural");

// Initialize Natural’s sentence tokenizer.
const sentenceTokenizer = new natural.SentenceTokenizer();

/**
 * Batch count tokens for an array of strings using an external Python tokenizer.
 */
function countTokensBatch(sentences) {
  const inputJson = JSON.stringify(sentences);
  const pythonProcess = spawnSync("python3", ["tokenizer.py"], {
    input: inputJson,
    encoding: "utf-8",
    maxBuffer: 1024 * 1024,
  });

  if (pythonProcess.error) {
    console.error("Error in Python process:", pythonProcess.error);
    return sentences.map(s => s.split(/\s+/).length);
  }
  if (pythonProcess.stderr) {
    console.error("Python stderr:", pythonProcess.stderr);
  }
  
  try {
    return JSON.parse(pythonProcess.stdout);
  } catch (parseError) {
    console.error("Error parsing Python output:", parseError);
    return sentences.map(s => s.split(/\s+/).length);
  }
}

/**
 * Use Natural's sentence tokenizer to split text into sentences.
 */
function splitIntoSentences(text) {
  // Use Natural's sentence tokenizer for more robust segmentation.
  return sentenceTokenizer.tokenize(text).map(sentence => sentence.trim()).filter(Boolean);
}

/**
 * Group an array of sentence objects (each with { text, metadata })
 * into chunks that do not exceed maxTokens tokens.
 */
async function groupSentenceObjectsIntoChunks(sentences, maxTokens = 500) {
  // First, count tokens for each sentence using your Python tokenizer.
  const sentenceTexts = sentences.map(s => s.text);
  const tokenCounts = countTokensBatch(sentenceTexts);
  
  const chunks = [];
  let currentChunkSentences = [];
  let currentTokenCount = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentenceObj = sentences[i];
    const sentenceTokenCount = tokenCounts[i];
    
    // If adding this sentence would exceed the maxTokens limit,
    // finalize the current chunk.
    if (currentTokenCount + sentenceTokenCount > maxTokens && currentChunkSentences.length > 0) {
      chunks.push({
        text: currentChunkSentences.map(s => s.text).join(" "),
        sentences: currentChunkSentences.slice()  // preserve sentence-level metadata
      });
      currentChunkSentences = [];
      currentTokenCount = 0;
    }
    
    currentChunkSentences.push(sentenceObj);
    currentTokenCount += sentenceTokenCount;
  }
  
  // Push any remaining sentences as a final chunk.
  if (currentChunkSentences.length > 0) {
    chunks.push({
      text: currentChunkSentences.map(s => s.text).join(" "),
      sentences: currentChunkSentences.slice()
    });
  }
  
  console.log(`Chunk grouping complete: ${chunks.length} chunks`);
  return chunks;
}

// //Example usage:
// (async () => {
//   const filePath = 'attention.pdf';
//   const result = await parseAndCleanPdf(filePath);

//   const chunks = await chunkBlocksAdaptive(result, 500);
//   console.log(JSON.stringify(chunks.slice(0, 5), null, 2));

// })();


///EMBEDDING
/**
 * Normalize text using compromise before sending it for embedding.
 */
function normalizeForEmbedding(text) {
  let doc = nlp(text);
  // Expand contractions and clean up text
  doc.contractions().expand();

  // Remove punctuation or other extraneous symbols if needed
  let cleanedText = doc.out('text');
  
  // Optionally, you could remove stopwords if that fits your use-case
  // (Note: compromise has limited stopword support, so you might combine it with another library.)
  
  return cleanedText;
}


async function getEmbedding(chunk) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: [chunk], // Ensure input is an array of strings
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    return null;
  }
}

async function saveEmbeddingsToFile(embeddings) {
  fs.writeFileSync(EMBEDDINGS_FILE, JSON.stringify(embeddings, null, 2));
  console.log(`Embeddings saved to ${EMBEDDINGS_FILE}`);
}

function loadEmbeddingsFromFile() {
  if (fs.existsSync(EMBEDDINGS_FILE)) {
    console.log(`Loading embeddings from ${EMBEDDINGS_FILE}`);
    return JSON.parse(fs.readFileSync(EMBEDDINGS_FILE, "utf8"));
  }
  return null;
}

async function generateEmbeddingsForChunks(chunks, concurrency = 5) {
  let chunkEmbeddings = loadEmbeddingsFromFile(); // Try to load from cache

  if (chunkEmbeddings) {
    console.log("Using cached embeddings.");
    chunkEmbeddings = chunkEmbeddings.filter(({ chunk, embedding }) =>
      chunk && typeof chunk.text === "string" && chunk.text.trim() !== "" &&
      Array.isArray(embedding) && embedding.length === 1536
    );
    console.log(`Cleaned up embeddings. Remaining valid embeddings: ${chunkEmbeddings.length}`);
  }

  if (!chunkEmbeddings || chunkEmbeddings.length === 0) {
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    chunkEmbeddings = [];

    const totalChunks = chunks.length;
    let index = 0;
    const MAX_CHARS = 5000;  // Limit to prevent API errors

    while (index < totalChunks) {
      const batch = chunks.slice(index, index + concurrency);
      console.log(`Processing batch ${index + 1}-${Math.min(index + concurrency, totalChunks)} of ${totalChunks}...`);

      const results = await Promise.all(
        batch.map(async (chunkObj, i) => {
          // If chunkObj is an object, extract its text property
          const chunk = typeof chunkObj === "string" ? chunkObj : chunkObj.text;
          if (!chunk || typeof chunk !== "string" || chunk.trim() === "") {
            console.error(`❌ Skipping empty or invalid chunk at index: ${index + i}`);
            return null;
          }

          let processedChunk = chunk;
          if (chunk.length > MAX_CHARS) {
            console.warn(`⚠️ Truncating chunk at index ${index + i} from ${chunk.length} to ${MAX_CHARS} characters`);
            processedChunk = chunk.slice(0, MAX_CHARS);
          }

          console.log(`Generating embedding for chunk ${index + i + 1}/${totalChunks}`);

          let embedding = await getEmbedding(processedChunk);

          if (!embedding) {
            console.warn(`Retrying embedding for chunk ${index + i + 1}/${totalChunks}...`);
            embedding = await getEmbedding(processedChunk);
          }

          if (!embedding) {
            console.error(`❌ Failed to get embedding for chunk: "${processedChunk.slice(0, 50)}..."`);
            return null;
          }

          // Optionally, you could preserve metadata by storing the original chunk object
          return { chunk: chunkObj, embedding };
        })
      );

      chunkEmbeddings.push(...results.filter(Boolean));

      if (index % (concurrency * 2) === 0) {
        saveEmbeddingsToFile(chunkEmbeddings);
      }

      index += concurrency;
    }

    saveEmbeddingsToFile(chunkEmbeddings);
  }

  return chunkEmbeddings;
}


/// COMPAIRING HELPER FUNCS
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB)) {
    console.error("Invalid input to cosineSimilarity:", vecA, vecB);
    return 0;
  }
  if (vecA.length !== vecB.length) {
    console.error("Mismatched embedding lengths:", vecA.length, vecB.length);
    return 0;
  }

  let dot = 0.0, normA = 0.0, normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

function calculateSemanticDiversity(matches, similarityThreshold = 0.9) {
  const uniqueMatches = [];
  
  for (const match of matches) {
    let isDuplicate = false;
    
    // Compare with already accepted matches
    for (const uniqueMatch of uniqueMatches) {
      // Compare sentences using cosine similarity of their embeddings
      const similarity = cosineSimilarity(match.embedding, uniqueMatch.embedding);
      
      if (similarity > similarityThreshold) {
        isDuplicate = true;
        // Keep the match with higher similarity to the query
        if (match.similarity > uniqueMatch.similarity) {
          // Replace the existing match with the better one
          const index = uniqueMatches.indexOf(uniqueMatch);
          uniqueMatches[index] = match;
        }
        break;
      }
    }
    
    if (!isDuplicate) {
      uniqueMatches.push(match);
    }
  }
  
  return uniqueMatches;
}

// Modify your findTopK function to include deduplication
async function findTopKImproved(embedding, chunkEmbeddings, k = 3, threshold = 0.6) {
  const similarities = await Promise.all(chunkEmbeddings.map(async ({ chunk, embedding: cEmb }) => {
    if (!cEmb || !Array.isArray(cEmb)) {
      console.error("Invalid chunk embedding for:", chunk);
      return { chunk, similarity: -1, embedding: cEmb };
    }
  
    const similarity = cosineSimilarity(embedding, cEmb);
    return { chunk, similarity, embedding: cEmb };
  }));
  
  // Sort by similarity
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  // First filter by threshold
  const aboveThreshold = similarities.filter(({ similarity }) => similarity >= threshold);
  
  // Then apply semantic diversity filtering
  const diverseMatches = calculateSemanticDiversity(aboveThreshold);
  
  // Return top K diverse matches
  return diverseMatches.slice(0, k);
}

// Add this helper function to analyze match quality
function analyzeMatchQuality(matches) {
  const analysis = {
    averageSimilarity: 0,
    similaritySpread: 0,
    matchLocations: new Set(),
    potentialDuplicates: []
  };
  
  if (matches.length === 0) return analysis;
  
  // Calculate average similarity
  analysis.averageSimilarity = matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length;
  
  // Calculate similarity spread
  const similarities = matches.map(m => m.similarity);
  analysis.similaritySpread = Math.max(...similarities) - Math.min(...similarities);
  
  // Track match locations and find potential duplicates
  for (let i = 0; i < matches.length; i++) {
    const location = matches[i].chunk.metadata?.[0]?.block_id;
    if (location) analysis.matchLocations.add(location);
    
    for (let j = i + 1; j < matches.length; j++) {
      const similarity = cosineSimilarity(matches[i].embedding, matches[j].embedding);
      if (similarity > 0.9) {
        analysis.potentialDuplicates.push({
          index1: i,
          index2: j,
          similarity
        });
      }
    }
  }
  
  return analysis;
}

// 5. Find top-K
// function findTopK(embedding, chunkEmbeddings, k = 3, threshold = 0.6) {
//   // Compute a dynamic threshold based on the current embedding
//   // const threshold = dynamicThreshold(embedding, baseThreshold);
  
//   const similarities = chunkEmbeddings.map(({ chunk, embedding: cEmb }) => {
//     if (!cEmb || !Array.isArray(cEmb)) {
//       console.error("Invalid chunk embedding for:", chunk);
//       return { chunk, similarity: -1 };
//     }
  
//     const similarity = cosineSimilarity(embedding, cEmb);
//     return { chunk, similarity };
//   });
  
//   similarities.sort((a, b) => b.similarity - a.similarity);
//   return similarities.slice(0, k).filter(({ similarity }) => similarity >= threshold);
// }

// Enhanced re-ranking function to find multiple relevant sentences
// async function reRankInsideChunkMulti(querySegment, matchedChunk, queryEmbedding, options = {}) {
//   const {
//     minSimilarity = 0.75,  // Minimum similarity threshold for relevant sentences
//     maxSentences = 3,      // Maximum number of sentences to return
//     minDistance = 0.15     // Minimum semantic distance between selected sentences
//   } = options;

//   const sentencesWithMetadata = matchedChunk.sentences;
//   if (!sentencesWithMetadata || sentencesWithMetadata.length === 0) {
//     console.error("No sentence-level metadata available for this chunk.");
//     return [];
//   }

//   // Get embeddings and similarities for all sentences
//   const sentenceResults = await Promise.all(
//     sentencesWithMetadata.map(async (sentenceObj) => {
//       const sentence = sentenceObj.text.trim();
//       if (sentence.length < 5) return null;

//       const sentenceEmbedding = await getEmbedding(sentence);
//       if (!sentenceEmbedding) return null;

//       const similarity = cosineSimilarity(queryEmbedding, sentenceEmbedding);
//       return {
//         sentence,
//         similarity,
//         embedding: sentenceEmbedding,
//         metadata: sentenceObj.metadata
//       };
//     })
//   );

//   // Filter out nulls and sort by similarity
//   const validResults = sentenceResults
//     .filter(result => result !== null)
//     .sort((a, b) => b.similarity - a.similarity);

//   // Select diverse, relevant sentences
//   const selectedSentences = [];
//   for (const result of validResults) {
//     if (selectedSentences.length >= maxSentences) break;
//     if (result.similarity < minSimilarity) break;

//     // Check if this sentence is semantically different enough from already selected ones
//     let isDiverse = true;
//     for (const selected of selectedSentences) {
//       const distance = 1 - cosineSimilarity(result.embedding, selected.embedding);
//       if (distance < minDistance) {
//         isDiverse = false;
//         break;
//       }
//     }

//     if (isDiverse) {
//       selectedSentences.push(result);
//     }
//   }

//   return selectedSentences;
// }

async function findTopSentencesGlobally(querySegment, queryEmbedding, topChunks, options = {}) {
  const {
    topK = 3,               // Number of top sentences to return
    minSimilarity = 0.75,   // Minimum similarity threshold
    minDistance = 0.15      // Minimum semantic distance between selected sentences
  } = options;

  // Collect all sentences from all chunks with their metadata
  const allSentences = [];
  for (const match of topChunks) {
    const { chunk } = match;
    const sentencesWithMetadata = chunk.sentences;
    
    // Get embeddings and similarities for all sentences in this chunk
    const chunkSentences = await Promise.all(
      sentencesWithMetadata.map(async (sentenceObj) => {
        const sentence = sentenceObj.text.trim();
        if (sentence.length < 5) return null;

        const sentenceEmbedding = await getEmbedding(sentence);
        if (!sentenceEmbedding) return null;

        const similarity = cosineSimilarity(queryEmbedding, sentenceEmbedding);
        return {
          sentence,
          similarity,
          embedding: sentenceEmbedding,
          metadata: sentenceObj.metadata,
          chunkIndex: topChunks.indexOf(match),
          originalChunk: chunk
        };
      })
    );

    allSentences.push(...chunkSentences.filter(s => s !== null));
  }

  // Sort all sentences by similarity
  allSentences.sort((a, b) => b.similarity - a.similarity);

  // Select diverse, top sentences
  const selectedSentences = [];
  for (const result of allSentences) {
    if (selectedSentences.length >= topK) break;
    if (result.similarity < minSimilarity) break;

    // Check if this sentence is semantically different enough from already selected ones
    let isDiverse = true;
    for (const selected of selectedSentences) {
      const distance = 1 - cosineSimilarity(result.embedding, selected.embedding);
      if (distance < minDistance) {
        isDiverse = false;
        break;
      }
    }

    if (isDiverse) {
      selectedSentences.push(result);
    }
  }

  return selectedSentences;
}

// 6. New: Add this function for structured explanation output
/**
 * Enhance the explanation by including entity overlap between the answer segment and the source matches.
 */
/**
 * Extracts entities and topics from a text using compromise.
 */
function extractEntitiesAndTopics(text) {
  let doc = nlp(text);

  // Extract common types of named entities
  const people = doc.people().out('array');
  const places = doc.places().out('array');
  const organizations = doc.organizations().out('array');

  // Extract topics or noun phrases
  const topics = doc.topics().out('array');

  return { people, places, organizations, topics };
}

function extractKeyPhrases(text) {
  let doc = nlp(text);
  // Use compromise’s nounPhrase extraction or topics
  return doc.topics().out('array');  // or doc.nouns().out('array')
}


async function explainAnswerSegmentWithEntities(segment, sourceMatches) {
  // Extract entities from the final answer segment
  const answerEntities = extractEntitiesAndTopics(segment);

  return {
    answer_segment: segment,
    supporting_evidence: sourceMatches.map(match => {
      // Extract entities from the source sentence
      const sourceEntities = extractEntitiesAndTopics(match.sentence);

      // Calculate overlapping entities (this is a simple approach; you could do more advanced matching)
      const overlappingEntities = [];
      ['people', 'places', 'organizations', 'topics'].forEach(type => {
        const overlap = sourceEntities[type].filter(entity => answerEntities[type].includes(entity));
        if (overlap.length > 0) {
          overlappingEntities.push({ type, entities: overlap });
        }
      });

      return {
        source_text: match.sentence,
        similarity_score: match.similarity,
        context: match.originalChunk.text,
        location: match.metadata,
        overlapping_entities: overlappingEntities
      };
    }),
    analysis: {
      confidence: Math.max(...sourceMatches.map(m => m.similarity)),
      coverage: sourceMatches.length / segment.split('.').length,
      context_summary: summarizeContext(sourceMatches)
    }
  };
}


function calculateCoherence(matches) {
  if (matches.length <= 1) return 1.0;

  const embeddings = matches.map(m => m.embedding);
  let totalCoherence = 0;
  let comparisons = 0;

  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
      totalCoherence += similarity;
      comparisons++;
    }
  }

  // Average pairwise similarity, normalized to [0, 1]
  return totalCoherence / comparisons;
}

// Helper function for context summarization
function summarizeContext(matches) {
  const uniqueLocations = new Set(matches.map(m => m.metadata.block_id));
  return {
    num_sources: uniqueLocations.size,
    source_locations: Array.from(uniqueLocations),
    semantic_coherence: calculateCoherence(matches)
  };
}

// Highlight overlapping keywords in the matched sentence
function highlightOverlap(finalSentence, matchedChunk) {
  const keywords = finalSentence.split(" ").filter(word => word.length > 3);
  let highlightedChunk = matchedChunk;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    highlightedChunk = highlightedChunk.replace(regex, `**${keyword}**`);
  });
  return highlightedChunk;
}


/// ALL TOGETHER
(async () => {
  try {
    console.log("Starting script...");

    // A. Parse PDFs
    const filePath = 'attention.pdf';
    const cleanedText = await parseAndCleanPdf(filePath);
    // console.log("DEBUG: Parsed text sample:", JSON.stringify(cleanedText.slice(0, 5), null, 2));
    // console.log("Text extracted!");

    // B. Chunk the text (adaptive chunking by paragraphs, then fallback to sentences)
    const chunks = await groupSentenceObjectsIntoChunks(cleanedText, 500);
    // console.log("DEBUG: First 5 chunks:", JSON.stringify(chunks.slice(0, 5), null, 2));
    // console.log(`Chunking complete: ${chunks.length} chunks`);

    // C. Generate embeddings for chunks
    const chunkEmbeddings = await generateEmbeddingsForChunks(chunks);
    console.log(`Chunk embeddings are ready!`);
    console.log("Number of chunk embeddings:", chunkEmbeddings.length);

    // D. Define final answer and split into meaningful segments
    const finalAnswer = "In Attention Is All You Need, the authors introduce the Transformer—a novel architecture that depends entirely on self-attention to process both inputs and outputs. By removing recurrence and convolution, the Transformer trains faster and achieves state-of-the-art results on machine translation tasks such as English-to-German and English-to-French."
    const answerIdeas = splitIntoSentences(finalAnswer);
    //const finalAnswerSegments = [];
    // for (let i = 0; i < finalAnswerSentences.length; i += 2) {
    //   const segment = finalAnswerSentences.slice(i, i + 2).join(". ");
    //   finalAnswerSegments.push(segment);
    // }

    // // E. Map final answer segments to PDF chunks
    // const explanations = [];
    // for (const segment of finalAnswerSegments) {
    //   // 1. Embed the segment
    //   const segmentNormalized = normalizeForEmbedding(segment);
    //   const segmentEmbedding = await getEmbedding(segmentNormalized);
    //   if (!segmentEmbedding) {
    //     console.error("Failed to get embedding for segment:", segment);
    //     continue;
    //   }
    // C. For each idea, map it to the source
      const explanations = [];
      for (const idea of answerIdeas) {
        // 1. Optionally extract key phrases (if you want to provide extra explanation)
        const keyPhrases = extractKeyPhrases(idea);
        
        // 2. Compute embedding for the idea
        const ideaNormalized = normalizeForEmbedding(idea);
        const ideaEmbedding = await getEmbedding(ideaNormalized);
        if (!ideaEmbedding) {
          console.error("Failed to get embedding for idea:", idea);
          continue;
        }

      // 2. Find top-K chunk matches
      // const topMatches = findTopK(segmentEmbedding, chunkEmbeddings, 6, 0.75);
      const topMatches = await findTopKImproved(ideaEmbedding, chunkEmbeddings, 6, 0.75);
  
      // 3. Print the segment and top matches
      // console.log("\n=== TEST RAG ANSWER (generated) ===");
      // console.log(segment);
      // Find best sentences globally across all top chunks
      const topSentences = await findTopSentencesGlobally(idea, ideaEmbedding, topMatches, {
        topK: 5,
        minSimilarity: 0.75,
        minDistance: 0.15
      });
    

      if (!topMatches.length) {
        console.log("No high-similarity chunks found above threshold.");
        continue;
      }

      // 4. For each top match, re-rank and print a short excerpt along with metadata.
      // console.log("\nTop matching sentences across all chunks:");
      // for (const [index, result] of topSentences.entries()) {
      //   console.log(`\n[Match #${index + 1}]  (Similarity = ${result.similarity.toFixed(3)})`);
      //   console.log("Chunk text:");
      //   console.log(result.originalChunk.text);
        
      //   console.log("\nBest matching sentence (from chunk):", result.sentence);
      //   console.log(`Sentence similarity: ${result.similarity.toFixed(3)}`);
      //   console.log("Best sentence metadata:", JSON.stringify(result.metadata, null, 2));
        
      //   const highlighted = highlightOverlap(segment, result.sentence);
      //   console.log("Highlighted best sentence:");
      //   console.log(highlighted);
      // }
      // explanations.push(await explainAnswerSegmentWithEntities(segment, topSentences));
      // console.log("Final Explanations with Enhanced Entity Data:");
      // console.log(JSON.stringify(explanations, null, 2));
      // 5. Build explanation object
      const explanation = {
        answer_idea: idea,
        key_phrases: keyPhrases,
        supporting_evidence: topSentences.map(match => ({
          source_text: match.sentence,
          similarity_score: match.similarity,
          context: match.originalChunk.text,
          location: match.metadata,
          // For overlapping keywords, you might compare keyPhrases to keywords in match.sentence
          overlapping_keywords: keyPhrases.filter(phrase => match.sentence.includes(phrase))
        })),
        analysis: {
          // You can compute additional statistics, e.g.:
          average_similarity: topSentences.reduce((sum, m) => sum + m.similarity, 0) / topSentences.length
        }
      };
      
      explanations.push(explanation);
    }
    
    console.log("Final explanations mapping ideas to sources:");
    console.log(JSON.stringify(explanations, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
})();