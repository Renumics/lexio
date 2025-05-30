import { splitIntoSentences } from './chunking';
import nlp from 'compromise';

export interface IChunk {
  text: string;
  sentences: { text: string; metadata: any }[];
  [key: string]: any;
}



export interface IMatch {
  chunk?: IChunk;
  embedding: number[];
  similarity: number;
  metadata?: any;
  sentence?: string;
  originalChunk?: IChunk;
  [key: string]: any;
}

export interface ISentenceResult {
  sentence: string;
  similarity: number;
  embedding: number[];
  metadata: any;
  chunkIndex: number;
  originalChunk: IChunk;
}

// Basic porter stemmer implementation
function porterStem(word: string): string {
  word = word.toLowerCase();
  
  // Step 1a
  word = word.replace(/sses$/, 'ss')
             .replace(/ies$/, 'i')
             .replace(/s$/, match => match === 'ss' ? 'ss' : '');

  // Step 1b
  if (word.match(/(eed|eedly)$/)) {
    const stem = word.replace(/(eed|eedly)$/, '');
    if (countVowelConsonantSequences(stem) > 0) {
      word = stem + 'ee';
    }
  } else {
    const match = word.match(/((ed|edly|ing|ingly)$)/);
    if (match && word.slice(0, -match[0].length).match(/[aeiouy]/)) {
      word = word.slice(0, -match[0].length);
      if (word.match(/(at|bl|iz)$/)) {
        word += 'e';
      } else if (word.match(/([^aeiouylsz])\1$/)) {
        word = word.slice(0, -1);
      } else if (countVowelConsonantSequences(word) === 1 && word.match(/[^aeiou][aeiouy][^aeiouwxy]$/)) {
        word += 'e';
      }
    }
  }

  // Step 1c
  if (word.match(/y$/) && word.slice(0, -1).match(/[aeiouy]/)) {
    word = word.slice(0, -1) + 'i';
  }

  return word;
}

function countVowelConsonantSequences(word: string): number {
  const m = word.match(/[aeiouy][^aeiouy]*/g);
  return m ? m.length : 0;
}

/**
 * Extracts key terms and entities from text using compromise and applies stemming
 */
function extractKeyTerms(text: string): { terms: Set<string>, technicalTerms: Set<string>, conceptPairs: Set<string> } {
  const doc: any = nlp(text);
  const terms = new Set<string>();
  const technicalTerms = new Set<string>();
  const conceptPairs = new Set<string>();  // Track related concept pairs

  // Technical term patterns - focusing on structure rather than specific domains
  const technicalPatterns = [
    /\b[A-Z]{2,}\b/,  // Acronyms (e.g., API, JSON, XML)
    /\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/,  // CamelCase terms
    /\b[a-z]+(?:[-_][a-z]+)+\b/,  // Hyphenated or snake_case terms
    /\b(?:\d+(?:\.\d+)?%?|\d+(?:st|nd|rd|th))\b/,  // Numbers with optional decimals, percentages, or ordinals
    /\b[a-z]+\d+[a-z]*\b/i,  // Alphanumeric combinations (e.g., h1, utf8, 3d)
    // Domain-agnostic technical patterns
    /\b(?:[a-z]+(?:ing|tion|ment|ity|ism|or|er|ic))\b/i,  // Common technical suffixes
    /\b(?:[a-z]+-(?:based|driven|oriented|specific|level))\b/i,  // Common technical compound patterns
    /\b(?:high|low|multi|inter|intra|pre|post|sub|super)-[a-z]+\b/i,  // Common technical prefixes
    /\b[a-z]+(?:wise|fold|type|mode|space|time)\b/i,  // Common technical suffixes
    /\b(?:non|semi|pseudo|auto|co|re)-[a-z]+\b/i,  // Additional technical prefixes
    /\b[a-z]+(?:ability|ization|ification|ology|ometry|onomy)\b/i,  // Additional academic suffixes
    /\b(?:micro|macro|meta|proto|poly|mono|uni|bi|tri)-[a-z]+\b/i  // Scientific prefixes
  ];

  // Get nouns and apply stemming
  doc.nouns().forEach((n: any) => {
    const text = n.text().toLowerCase();
    const stemmed = porterStem(text);
    terms.add(stemmed);
    terms.add(text);
    
    // Check if it's a technical term based on patterns
    if (technicalPatterns.some(pattern => pattern.test(n.text()))) {
      technicalTerms.add(text);
      technicalTerms.add(stemmed);
    }

    // Multi-word technical terms detection with improved heuristics
    if (text.split(/\s+/).length > 1) {
      // Check for technical compound terms
      if (
        // Terms with technical prepositions
        /\b(?:of|in|for|to|by|with|between|through|via)\b/.test(text) ||
        // Terms with measurements or units
        /\b(?:rate|level|degree|factor|index|ratio|scale|constant|coefficient|parameter)\b/i.test(text) ||
        // Terms with academic/scientific words
        /\b(?:theory|method|process|system|mechanism|structure|function|analysis|model)\b/i.test(text) ||
        // Terms with numbers or special characters
        /[\d\-_.]/.test(text) ||
        // Terms with common academic prepositions
        /\b(?:based|dependent|invariant|relative)\s+(?:on|to|in)\b/i.test(text)
      ) {
        technicalTerms.add(text);
        technicalTerms.add(stemmed);
        
        // Also add individual parts of hyphenated terms
        if (text.includes('-')) {
          text.split('-').forEach((part: string) => {
            if (part.length > 2) {
              technicalTerms.add(part);
              technicalTerms.add(porterStem(part));
            }
          });
        }
      }
    }
  });

  // Find operational relationships between technical terms
  const words = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const pair = words[i] + ' ' + words[i + 1];
    // Look for terms connected by operational words
    if (/(?:uses?|utilizes?|with|through|via|by|for|between|among)\s+\w+/.test(pair)) {
      conceptPairs.add(pair);
    }
    // Look for terms in subject-verb-object relationships
    if (/(?:reduces?|improves?|enhances?|enables?|allows?|achieves?|produces?|generates?|transforms?)\s+\w+/.test(pair)) {
      conceptPairs.add(pair);
    }
  }

  // Get verbs in infinitive form and apply stemming
  doc.verbs().toInfinitive().forEach((v: any) => {
    const text = v.text().toLowerCase();
    const stemmed = porterStem(text);
    terms.add(stemmed);
    terms.add(text);
    
    // Check for technical verbs
    if (/(?:process|compute|normalize|encode|decode|stack|connect|train|learn|reduce|improve|enable|allow)/i.test(text)) {
      technicalTerms.add(text);
      technicalTerms.add(stemmed);
    }
  });

  return { terms, technicalTerms, conceptPairs };
}

/**
 * Analyzes sentence structure to determine if it's explanatory vs attributive
 */
function analyzeSentenceStructure(text: string): {
  isExplanatory: boolean;
  structureScore: number;
} {
  const doc: any = nlp(text);
  let structureScore = 0;

  // Check for subject-verb-object structure (explanatory pattern)
  const svoMatches = doc.match('#Noun+ #Verb+ #Noun+');
  if (svoMatches.length > 0) {
    structureScore += 0.3;
  }

  // Check for causal/explanatory relationships
  const causalMatches = doc.match('(leads|results|enables|allows|reduces|improves|causes|helps|makes)');
  if (causalMatches.length > 0) {
    structureScore += 0.2;
  }

  // Check for technical relationships
  const technicalRelations = doc.match('(uses|utilizes|through|via|using|with|by)');
  if (technicalRelations.length > 0) {
    structureScore += 0.2;
  }

  // Detect attributive patterns (lower the score)
  const attributivePatterns = [
    doc.match('^#ProperNoun'), // Starts with name
    doc.match('(proposed|suggested|introduced|created|developed|designed)'),
    doc.match('(by|from|at) #ProperNoun')
  ];
  
  const hasAttributivePattern = attributivePatterns.some(pattern => pattern.length > 0);
  if (hasAttributivePattern) {
    structureScore -= 0.3;
  }

  // Detect comparative/analytical structure
  const analyticalMatches = doc.match('(compared|versus|rather|than|while|whereas|however|instead)');
  if (analyticalMatches.length > 0) {
    structureScore += 0.2;
  }

  // Look for quantitative/measurable statements
  const quantitativeMatches = doc.match('#Value #Noun+');
  if (quantitativeMatches.length > 0) {
    structureScore += 0.1;
  }

  return {
    isExplanatory: structureScore > 0,
    structureScore: Math.max(-1, Math.min(1, structureScore)) // Normalize to [-1, 1]
  };
}

/**
 * Calculates semantic similarity using compromise, stemming, and enhanced heuristics
 */
export function calculateHeuristicSimilarity(text1: string, text2: string): { 
  similarity: number; 
  overlappingKeywords: string[];
} {
  // Normalize texts
  const normalize = (text: string) => text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const normalizedText1 = normalize(text1);
  const normalizedText2 = normalize(text2);

  // Extract key terms and technical terms
  const { terms: terms1, technicalTerms: techTerms1, conceptPairs: pairs1 } = extractKeyTerms(text1);
  const { terms: terms2, technicalTerms: techTerms2, conceptPairs: pairs2 } = extractKeyTerms(text2);

  // Calculate semantic term overlap with technical term boosting
  const termIntersection = new Set([...terms1].filter(x => terms2.has(x)));
  const techTermIntersection = new Set([...techTerms1].filter(x => techTerms2.has(x)));
  const conceptPairIntersection = new Set([...pairs1].filter(x => pairs2.has(x)));
  
  // Calculate overlapping keywords (technical terms)
  const overlappingKeywords = [...techTermIntersection].map(term => {
    // Return original form (before stemming) if available
    const originalTerm = [...techTerms1].find(t => porterStem(t) === term) || term;
    return originalTerm;
  });

  // More lenient semantic score calculation with increased technical term boost
  const semanticScore = (
    termIntersection.size / Math.min(terms1.size, terms2.size) +
    (techTermIntersection.size > 0 ? 0.5 : 0) +  // Technical term boost
    (conceptPairIntersection.size > 0 ? 0.3 : 0)  // Boost for matching operational relationships
  );

  // Get words and create word sets with stemming for basic overlap
  const words1 = new Set(normalizedText1.split(' ').map(porterStem));
  const words2 = new Set(normalizedText2.split(' ').map(porterStem));

  // Calculate word overlap with stemmed words using more lenient scoring
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const wordOverlapScore = intersection.size / Math.min(words1.size, words2.size);

  // Calculate importance-weighted word overlap with expanded stopwords
  const stopwords = new Set([
    'about', 'above', 'after', 'again', 'along', 'could', 'every', 'from',
    'their', 'there', 'these', 'thing', 'think', 'those', 'what', 'when',
    'where', 'which', 'while', 'would', 'this', 'that', 'they', 'will',
    'have', 'has', 'had', 'been', 'being', 'with', 'the', 'and', 'for',
    'our', 'can', 'use', 'using', 'used', 'very', 'also', 'then', 'than'
  ]);

  const importantWords = new Set([...intersection].filter(word => 
    word.length > 2 && !stopwords.has(word)
  ));

  const importanceScore = importantWords.size / Math.max(1, intersection.size);

  // Substring matching for phrases with technical term boost
  const longestCommonSubstring = (str1: string, str2: string) => {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    let maxLength = 0;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          maxLength = Math.max(maxLength, dp[i][j]);
        }
      }
    }

    return maxLength;
  };

  const phraseScore = longestCommonSubstring(normalizedText1, normalizedText2) / 
    Math.max(3, Math.min(normalizedText1.length, normalizedText2.length));

  // Add structure analysis
  const structure1 = analyzeSentenceStructure(text1);
  const structure2 = analyzeSentenceStructure(text2);
  
  // Boost score if both texts are explanatory
  const structureBoost = (structure1.isExplanatory && structure2.isExplanatory) ? 
    0.2 * (structure1.structureScore + structure2.structureScore) / 2 : 0;

  // Adjust weights based on query length and technical content
  const queryLength = text1.split(' ').length;
  const isShortQuery = queryLength <= 3;
  const hasTechnicalTerms = techTermIntersection.size > 0;

  // Combine scores with dynamic weights
  const combinedScore = isShortQuery ? (
    // For short queries, give more weight to exact matches
    0.4 * semanticScore +     
    0.3 * wordOverlapScore +  
    0.2 * importanceScore +   
    0.1 * phraseScore +
    0.1 * structureBoost  // Add structure component
  ) : (
    // For longer queries, balance between semantic and word overlap
    0.35 * semanticScore +     
    0.3 * wordOverlapScore +  
    0.25 * importanceScore +    
    0.15 * phraseScore +
    0.1 * structureBoost  // Add structure component
  );

  // Boost score for matches with technical terms and operational relationships
  const boostedScore = (hasTechnicalTerms || conceptPairIntersection.size > 0) ? 
    combinedScore * (1.3 + (conceptPairIntersection.size * 0.1)) : // Additional boost for operational matches
    combinedScore;

  // Use adaptive power scaling based on score
  const scalingFactor = boostedScore >= 0.5 ? 1.1 : 1.0; // Less aggressive scaling
  const finalScore = Math.pow(boostedScore, scalingFactor);

  return {
    similarity: finalScore,
    overlappingKeywords
  };
}

/**
 * Finds the top K matches using enhanced semantic similarity with adaptive thresholding
 */
export function findTopKHeuristic(
  query: string,
  chunks: IChunk[],
  k: number = 6,
  threshold: number = 0.25
): IMatch[] {
  const similarities: IMatch[] = chunks.map(chunk => {
    const { similarity, overlappingKeywords } = calculateHeuristicSimilarity(query, chunk.text);
    
    // Calculate normalized score to prevent bias toward very short chunks
    // Shorter chunks often score higher because they have less opportunity for irrelevant content
    let normalizedSimilarity = similarity;
    
    // Only apply normalization to chunks that are significantly shorter than average
    if (chunk.text.length < 100) {  // For very short chunks
      // Apply modest penalty to very short chunks (less than 100 chars)
      normalizedSimilarity = similarity * (0.8 + (chunk.text.length / 500));
    }
    
    return { 
      chunk, 
      similarity: normalizedSimilarity, 
      embedding: [],
      metadata: { 
        overlappingKeywords,
        originalSimilarity: similarity, // Store original score for reference
        textLength: chunk.text.length   // Store text length for debugging
      }
    };
  });

  // Sort by similarity
  similarities.sort((a, b) => b.similarity - a.similarity);

  // If we have matches, use adaptive thresholding based on best match
  if (similarities.length > 0) {
    const bestScore = similarities[0].similarity;
    const adaptiveThreshold = Math.max(
      threshold,
      bestScore * 0.3 // More lenient threshold for better recall
    );

    return similarities
      .filter(({ similarity }) => similarity >= adaptiveThreshold)
      .slice(0, k);
  }

  return [];
}

/**
 * Finds top sentences globally using heuristic matching with adaptive thresholding
 */
export function findTopSentencesGloballyHeuristic(
  query: string,
  topChunks: IMatch[],
  options: { topK?: number; minSimilarity?: number; minDistance?: number } = {}
): ISentenceResult[] {
  const {
    topK = 5,
    minSimilarity = 0.3,
    minDistance = 0.4,  // Increased from 0.25 to 0.4 for better diversity
  } = options;

  const allSentences: ISentenceResult[] = [];
  const processedSentences = new Set<string>();
  const seenContent = new Set<string>();  // Track semantic content

  for (const match of topChunks) {
    const { chunk } = match;
    if (!chunk) continue;

    // If chunk doesn't have sentences array or it's empty, split the text into sentences
    if (!chunk.sentences || chunk.sentences.length === 0) {
      const splitSentences = splitIntoSentences(chunk.text);
      chunk.sentences = splitSentences.map(text => ({
        text,
        metadata: chunk.metadata || {}
      }));
    }

    // Process each sentence in the chunk
    const chunkSentences = chunk.sentences.map(sentenceObj => {
      const sentence = sentenceObj.text.trim();
      
      // Skip very short sentences or sentences we've already processed
      if (sentence.length < 10 || processedSentences.has(sentence)) return null;
      
      // Extract key terms for content similarity check
      const { terms: sentenceTerms } = extractKeyTerms(sentence);
      const contentKey = Array.from(sentenceTerms).sort().join(' ');
      
      // Skip if we've seen very similar content
      if (seenContent.has(contentKey)) return null;
      
      processedSentences.add(sentence);
      seenContent.add(contentKey);
      
      const { similarity, overlappingKeywords } = calculateHeuristicSimilarity(query, sentence);
      const { structureScore } = analyzeSentenceStructure(sentence);
      
      // Modify similarity score based on sentence structure
      let normalizedSimilarity = similarity * (1 + (overlappingKeywords.length * 0.1));
      
      // Boost explanatory sentences
      if (structureScore > 0) {
        normalizedSimilarity *= (1 + (structureScore * 0.2));
      }
      
      // Apply length normalization
      if (sentence.length < 40) {
        normalizedSimilarity *= (0.85 + (sentence.length / 200));
      }
      
      // Penalize conclusion sentences unless they contain highly relevant technical details
      if (/^(?:Conclusion|In conclusion|To conclude|Finally,)/i.test(sentence) && overlappingKeywords.length < 3) {
        normalizedSimilarity *= 0.7;
      }
      
      return {
        sentence,
        similarity: normalizedSimilarity,
        embedding: [],
        metadata: { 
          ...sentenceObj.metadata,
          overlappingKeywords,
          originalSimilarity: similarity,
          sentenceLength: sentence.length
        },
        chunkIndex: topChunks.indexOf(match),
        originalChunk: chunk,
      } as ISentenceResult;
    });

    allSentences.push(...chunkSentences.filter((s): s is ISentenceResult => s !== null));
  }

  // Sort by similarity
  allSentences.sort((a, b) => b.similarity - a.similarity);

  // Get best score for adaptive thresholding
  const bestScore = allSentences.length > 0 ? allSentences[0].similarity : 0;
  const adaptiveMinSimilarity = Math.max(
    minSimilarity,
    bestScore * 0.4
  );

  // Select diverse results with adaptive threshold
  const selectedSentences: ISentenceResult[] = [];
  for (const result of allSentences) {
    if (selectedSentences.length >= topK) break;
    if (result.similarity < adaptiveMinSimilarity) break;

    // Check if this sentence is sufficiently different from already selected ones
    let isDiverse = true;
    for (const selected of selectedSentences) {
      const { similarity } = calculateHeuristicSimilarity(result.sentence, selected.sentence);
      if (similarity > (1 - minDistance)) {
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