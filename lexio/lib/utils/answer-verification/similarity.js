// similarity.js
const nlp = require('compromise');

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
    for (const uniqueMatch of uniqueMatches) {
      const similarity = cosineSimilarity(match.embedding, uniqueMatch.embedding);
      if (similarity > similarityThreshold) {
        isDuplicate = true;
        if (match.similarity > uniqueMatch.similarity) {
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

async function findTopKImproved(embedding, chunkEmbeddings, k = 3, threshold = 0.6) {
  const similarities = await Promise.all(chunkEmbeddings.map(async ({ chunk, embedding: cEmb }) => {
    if (!cEmb || !Array.isArray(cEmb)) {
      console.error("Invalid chunk embedding for:", chunk);
      return { chunk, similarity: -1, embedding: cEmb };
    }
    const similarity = cosineSimilarity(embedding, cEmb);
    return { chunk, similarity, embedding: cEmb };
  }));
  
  similarities.sort((a, b) => b.similarity - a.similarity);
  const aboveThreshold = similarities.filter(({ similarity }) => similarity >= threshold);
  const diverseMatches = calculateSemanticDiversity(aboveThreshold);
  return diverseMatches.slice(0, k);
}

async function findTopSentencesGlobally(querySegment, queryEmbedding, topChunks, options = {}) {
  const {
    topK = 3,
    minSimilarity = 0.75,
    minDistance = 0.15
  } = options;

  const allSentences = [];
  for (const match of topChunks) {
    const { chunk } = match;
    const chunkSentences = await Promise.all(
      chunk.sentences.map(async (sentenceObj) => {
        const sentence = sentenceObj.text.trim();
        if (sentence.length < 5) return null;
        const sentenceEmbedding = await require('./embedding').getEmbedding(sentence);
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

  allSentences.sort((a, b) => b.similarity - a.similarity);
  const selectedSentences = [];
  for (const result of allSentences) {
    if (selectedSentences.length >= topK) break;
    if (result.similarity < minSimilarity) break;
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

function extractEntitiesAndTopics(text) {
  let doc = nlp(text);
  const people = doc.people().out('array');
  const places = doc.places().out('array');
  const organizations = doc.organizations().out('array');
  const topics = doc.topics().out('array');
  return { people, places, organizations, topics };
}

function extractKeyPhrases(text) {
  let doc = nlp(text);
  return doc.topics().out('array');
}

async function explainAnswerSegmentWithEntities(segment, sourceMatches) {
  const answerEntities = extractEntitiesAndTopics(segment);
  return {
    answer_segment: segment,
    supporting_evidence: sourceMatches.map(match => {
      const sourceEntities = extractEntitiesAndTopics(match.sentence);
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
  return totalCoherence / comparisons;
}

function summarizeContext(matches) {
  const uniqueLocations = new Set(matches.map(m => m.metadata.block_id));
  return {
    num_sources: uniqueLocations.size,
    source_locations: Array.from(uniqueLocations),
    semantic_coherence: calculateCoherence(matches)
  };
}

function highlightOverlap(finalSentence, matchedChunk) {
  const keywords = finalSentence.split(" ").filter(word => word.length > 3);
  let highlightedChunk = matchedChunk;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    highlightedChunk = highlightedChunk.replace(regex, `**${keyword}**`);
  });
  return highlightedChunk;
}

module.exports = {
  cosineSimilarity,
  calculateSemanticDiversity,
  findTopKImproved,
  findTopSentencesGlobally,
  extractEntitiesAndTopics,
  extractKeyPhrases,
  explainAnswerSegmentWithEntities,
  calculateCoherence,
  summarizeContext,
  highlightOverlap,
};
