// main.js
require('dotenv').config({ override: true });
//console.log("OpenAI API Key in use:", process.env.OPENAI_API_KEY);

const { parseAndCleanPdf } = require('./pdfParser');
const { groupSentenceObjectsIntoChunks, splitIntoSentences } = require('./chunking');
const {
  getEmbedding,
  normalizeForEmbedding,
  generateEmbeddingsForChunks
} = require('./embedding');
const {
  findTopKImproved,
  findTopSentencesGlobally,
  extractKeyPhrases
} = require('./similarity');
const ideaSplitter = require('./ideaSplitter');
const config = require('./config');

export const verifyAnswer = async () => {
  console.log("Starting script...");

}

(async () => {
  try {
    console.log("Starting script...");
    
    // A. Parse and clean the PDF
    const cleanedText = await parseAndCleanPdf(config.PDF_FILE_PATH);
    
    // B. Chunk the text - no need for normalization here as it's handled in embedding.js
    const chunks = await groupSentenceObjectsIntoChunks(cleanedText, config.MAX_TOKENS);
    console.log(`Chunking complete: ${chunks.length} chunks`);
    
    // C. Generate embeddings (normalization happens inside)
    const chunkEmbeddings = await generateEmbeddingsForChunks(chunks);
    console.log(`Chunk embeddings are ready!`);
    console.log("Number of chunk embeddings:", chunkEmbeddings.length);
    
    // D. Split the final answer into ideas using the selected approach.
    // You can choose among: "heuristic", "dependency", or "llm"
    const splittingMethod = config.IDEA_SPLITTING_METHOD; // || "heuristic";
    console.log("splittingMethod:", splittingMethod);
    
    // First, split the final answer into sentences.
    const sentences = splitIntoSentences(config.FINAL_ANSWER);
    let answerIdeas = [];
    
    // Process each sentence with the chosen splitting method.
    for (const sentence of sentences) {
      if (splittingMethod === "heuristic") {
        const ideas = ideaSplitter.splitIntoIdeasHeuristic(sentence);
        answerIdeas.push(...ideas);
      } else if (splittingMethod === "dependency") {
        const ideas = ideaSplitter.splitIntoIdeasDependencyParsing(sentence);
        answerIdeas.push(...ideas);
      } else if (splittingMethod === "llm") {
        // LLM splitting is asynchronous.
        const ideas = await ideaSplitter.splitIntoIdeasUsingLLM(sentence);
        answerIdeas.push(...ideas);
      } else {
        // Fallback: use the full sentence as a single idea.
        answerIdeas.push(sentence);
      }
    }
    
    console.log(`Processing ${answerIdeas.length} answer ideas...`);
    
    // E. Process each idea
    const explanations = [];
    for (const idea of answerIdeas) {
      const keyPhrases = extractKeyPhrases(idea);
      
      // Get embedding (normalization happens inside getEmbedding)
      const ideaEmbedding = await getEmbedding(idea);
      
      if (!ideaEmbedding) {
        console.error("Failed to get embedding for idea:", idea);
        continue;
      }
      
      const topMatches = await findTopKImproved(ideaEmbedding, chunkEmbeddings, 6, 0.75);
      
      const topSentences = await findTopSentencesGlobally(idea, ideaEmbedding, topMatches, {
        topK: 5,
        minSimilarity: 0.7, //0.75,
        minDistance: 0.1, //0.15
      });
      
      const explanation = {
        answer_idea: idea,
        key_phrases: keyPhrases,
        supporting_evidence: topSentences.map(match => ({
          source_text: match.sentence,
          similarity_score: match.similarity,
          context: match.originalChunk.text,
          location: match.metadata,
          overlapping_keywords: keyPhrases.filter(phrase => 
            match.sentence.toLowerCase().includes(phrase.toLowerCase())
          )
        })),
        analysis: {
          average_similarity: topSentences.reduce((sum, m) => sum + m.similarity, 0) / topSentences.length
        }
      };
      
      explanations.push(explanation);
      console.log(`Processed idea ${explanations.length}/${answerIdeas.length}`);
    }
    
    console.log("Final explanations mapping ideas to sources:");
    console.log(JSON.stringify(explanations, null, 2));
    
  } catch (err) {
    console.error("Error:", err);
  }
})();