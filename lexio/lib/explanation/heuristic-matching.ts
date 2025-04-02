import { splitIntoSentences } from './chunking';

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

/**
 * Calculates text similarity score using heuristic methods without embeddings
 */
export function calculateHeuristicSimilarity(text1: string, text2: string): number {
  // Normalize texts
  const normalize = (text: string) => text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const normalizedText1 = normalize(text1);
  const normalizedText2 = normalize(text2);

  // Get words and create word sets
  const words1 = new Set(normalizedText1.split(' '));
  const words2 = new Set(normalizedText2.split(' '));

  // Calculate word overlap
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  // Jaccard similarity for word overlap
  const wordOverlapScore = intersection.size / union.size;

  // Calculate importance-weighted word overlap
  const importantWords = new Set([...intersection].filter(word => 
    word.length > 4 && // Longer words tend to be more meaningful
    !['about', 'above', 'after', 'again', 'along', 'could', 'every', 'from', 
      'their', 'there', 'these', 'thing', 'think', 'those', 'what', 'when', 
      'where', 'which', 'while', 'would'].includes(word)
  ));

  const importanceScore = importantWords.size / intersection.size || 0;

  // Substring matching for phrases
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
    Math.min(normalizedText1.length, normalizedText2.length);

  // Combine scores with weights
  return (
    0.4 * wordOverlapScore +
    0.4 * importanceScore +
    0.2 * phraseScore
  );
}

/**
 * Finds the top K matches using heuristic similarity instead of embeddings
 */
export function findTopKHeuristic(
  query: string,
  chunks: IChunk[],
  k: number = 3,
  threshold: number = 0.3
): IMatch[] {
  const similarities: IMatch[] = chunks.map(chunk => {
    const similarity = calculateHeuristicSimilarity(query, chunk.text);
    return { chunk, similarity, embedding: [] }; // Empty embedding as we don't use it
  });

  // Sort by similarity and filter by threshold
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities
    .filter(({ similarity }) => similarity >= threshold)
    .slice(0, k);
}

/**
 * Finds top sentences globally using heuristic matching
 */
export function findTopSentencesGloballyHeuristic(
  query: string,
  topChunks: IMatch[],
  options: { topK?: number; minSimilarity?: number; minDistance?: number } = {}
): ISentenceResult[] {
  const {
    topK = 3,
    minSimilarity = 0.3,
    minDistance = 0.15,
  } = options;

  const allSentences: ISentenceResult[] = [];
  
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

    const chunkSentences = chunk.sentences.map(sentenceObj => {
      const sentence = sentenceObj.text.trim();
      if (sentence.length < 5) return null;
      
      const similarity = calculateHeuristicSimilarity(query, sentence);
      
      return {
        sentence,
        similarity,
        embedding: [], // Empty embedding as we don't use it
        metadata: sentenceObj.metadata,
        chunkIndex: topChunks.indexOf(match),
        originalChunk: chunk,
      } as ISentenceResult;
    });

    allSentences.push(...chunkSentences.filter((s): s is ISentenceResult => s !== null));
  }

  // Sort by similarity
  allSentences.sort((a, b) => b.similarity - a.similarity);

  // Select diverse results
  const selectedSentences: ISentenceResult[] = [];
  for (const result of allSentences) {
    if (selectedSentences.length >= topK) break;
    if (result.similarity < minSimilarity) break;

    // Check if this sentence is sufficiently different from already selected ones
    let isDiverse = true;
    for (const selected of selectedSentences) {
      const similarity = calculateHeuristicSimilarity(result.sentence, selected.sentence);
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