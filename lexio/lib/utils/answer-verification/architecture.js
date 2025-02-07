// Current Architecture Overview
const RAGAnalysisSystem = {
  // 1. PDF Processing Pipeline
  pdfProcessing: {
    parseAndCleanPdf: "Uses Marker for PDF extraction",
    cleanAndSplitText: "Python script for text cleaning",
    chunking: "Adaptive chunking based on tokens"
  },

  // 2. Embedding Generation
  embeddingPipeline: {
    generateEmbeddings: "Creates embeddings for chunks",
    normalizeText: "Text normalization for embedding",
    chunkEmbeddings: "Stores chunk-embedding pairs"
  },

  // 3. Similarity Analysis
  similarityAnalysis: {
    cosineSimilarity: "Vector similarity calculation",
    semanticDiversity: "Ensures diverse matches",
    findTopMatches: "Identifies best matching chunks",
    findTopSentences: "Granular sentence-level matching"
  },

  // 4. Entity Extraction
  entityAnalysis: {
    extractEntities: "NLP-based entity extraction",
    extractKeyPhrases: "Key phrase identification",
    entityOverlap: "Entity-based evidence mapping"
  },

  // 5. Evidence Mapping
  evidenceMapping: {
    mapAnswerToSources: "Links answer segments to sources",
    calculateConfidence: "Confidence scoring",
    generateExplanations: "Creates detailed evidence mapping"
  }
};

// Ideas to try:
const improvedArchitecture = {
  // 3. Improved Matching
  matchingEngine: {
    bidirectionalValidation: "Source-to-answer verification (Instead of just matching answer→source)",
    SemanticMatching: "Analyzes the semantic structure (subject-verb-object) ",
    knowledgeGraphValidation: "knowledge graphs to validate relationships between concepts",
  },

  // 4. Advanced Entity Analysis:
  analysisSystem: {
    dd:"Expanded Entity Types? basic pool now"
  },
};