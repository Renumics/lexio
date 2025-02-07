// explanation.js
const nlp = require('compromise');

/**
 * Extract entities (people, places, organizations) and topics from a text.
 */
function extractEntitiesAndTopics(text) {
  const doc = nlp(text);
  const people = doc.people().out('array');
  const places = doc.places().out('array');
  const organizations = doc.organizations().out('array');
  const topics = doc.topics().out('array');
  return { people, places, organizations, topics };
}

/**
 * Extract key phrases using compromise’s topics method.
 */
function extractKeyPhrases(text) {
  const doc = nlp(text);
  return doc.topics().out('array');
}

/**
 * Map an answer segment to supporting evidence by extracting entities from both
 * the answer and the source texts and reporting overlapping entities.
 */
async function explainAnswerSegmentWithEntities(segment, sourceMatches) {
  const answerEntities = extractEntitiesAndTopics(segment);
  const keyPhrases = extractKeyPhrases(segment);
  
  return {
    answer_segment: segment,
    key_phrases: keyPhrases,
    supporting_evidence: sourceMatches.map(match => {
      const sourceEntities = extractEntitiesAndTopics(match.sentence);
      // Simple overlapping by checking if any entity from the answer appears in the source.
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
      context_summary: "See context summary here" // You can integrate a summarizeContext function if needed.
    }
  };
}

/**
 * A simple helper to highlight overlapping keywords.
 */
function highlightOverlap(sentence, matchedChunk) {
  const keywords = sentence.split(" ").filter(word => word.length > 3);
  let highlightedChunk = matchedChunk;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    highlightedChunk = highlightedChunk.replace(regex, `**${keyword}**`);
  });
  return highlightedChunk;
}

module.exports = {
  extractEntitiesAndTopics,
  extractKeyPhrases,
  explainAnswerSegmentWithEntities,
  highlightOverlap
};
