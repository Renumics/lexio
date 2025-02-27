// similarity.ts
import nlp from 'compromise';
import { getEmbedding } from './embedding';
import { splitIntoSentences } from './chunking';
import { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';

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

export interface IChunkEmbedding {
  chunk: IChunk;
  embedding: number[];
}

export interface ISentenceResult {
  sentence: string;
  similarity: number;
  embedding: number[];
  metadata: any;
  chunkIndex: number;
  originalChunk: IChunk;
}

export interface Entities {
  people: string[];
  places: string[];
  organizations: string[];
  topics: string[];
}

export interface IOverlappingEntity {
  type: string;
  entities: string[];
}

export interface IExplanationResult {
  answer_segment: string;
  supporting_evidence: {
    source_text: string;
    similarity_score: number;
    context: string;
    location: any;
    overlapping_entities: IOverlappingEntity[];
  }[];
  analysis: {
    confidence: number;
    coverage: number;
    context_summary: {
      num_sources: number;
      source_locations: (string | number)[];
      semantic_coherence: number;
    };
  };
}

export interface PDFHighlight {
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

interface IHighlight {
  text: string;
  color: string;
  page?: number;
  rect?: PDFHighlight["rect"];
}

export interface IHighlightedExplanation extends IExplanationResult {
  highlights: Array<IHighlight>;
}

/**
 * Computes the cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB)) {
    console.error("Invalid input to cosineSimilarity:", vecA, vecB);
    return 0;
  }
  if (vecA.length !== vecB.length) {
    console.error("Mismatched embedding lengths:", vecA.length, vecB.length);
    return 0;
  }

  let dot = 0.0,
    normA = 0.0,
    normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

/**
 * Returns a diverse subset of matches by removing those that are too similar.
 */
export function calculateSemanticDiversity(
  matches: IMatch[],
  similarityThreshold: number = 0.9
): IMatch[] {
  const uniqueMatches: IMatch[] = [];
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

/**
 * Finds the top K matches from chunk embeddings based on cosine similarity.
 */
export async function findTopKImproved(
  embedding: number[],
  chunkEmbeddings: IChunkEmbedding[],
  k: number = 3,
  threshold: number = 0.6
): Promise<IMatch[]> {
  const similarities: IMatch[] = await Promise.all(
    chunkEmbeddings.map(async ({ chunk, embedding: cEmb }) => {
      if (!cEmb || !Array.isArray(cEmb)) {
        console.error("Invalid chunk embedding for:", chunk);
        return { chunk, similarity: -1, embedding: cEmb } as IMatch;
      }
      const similarity = cosineSimilarity(embedding, cEmb);
      return { chunk, similarity, embedding: cEmb };
    })
  );

  similarities.sort((a, b) => b.similarity - a.similarity);
  const aboveThreshold = similarities.filter(({ similarity }) => similarity >= threshold);
  const diverseMatches = calculateSemanticDiversity(aboveThreshold);
  return diverseMatches.slice(0, k);
}

/**
 * Finds top sentences globally from the provided chunks that are semantically similar to the query.
 */
export async function findTopSentencesGlobally(
  querySegment: string,
  queryEmbedding: number[],
  topChunks: IMatch[],
  options: { topK?: number; minSimilarity?: number; minDistance?: number } = {}
): Promise<ISentenceResult[]> {
  const {
    topK = 3,
    minSimilarity = 0.75,
    minDistance = 0.15,
  } = options;

  const allSentences: ISentenceResult[] = [];
  for (const match of topChunks) {
    const { chunk } = match;
    if (!chunk) {
      console.log("No chunk found in match", match);
      continue;
    }

    // If chunk doesn't have sentences array or it's empty, split the text into sentences
    if (!chunk.sentences || chunk.sentences.length === 0) {
      const splitSentences = splitIntoSentences(chunk.text);
      chunk.sentences = splitSentences.map(text => ({
        text,
        metadata: chunk.metadata || {}
      }));
    }

    if (chunk.sentences.length === 0) {
      console.log("No sentences could be extracted from chunk", chunk);
      continue;
    }

    console.log(`Processing ${chunk.sentences.length} sentences for chunk`, chunk);

    if (!chunk || !chunk.sentences) continue;
    const chunkSentences = await Promise.all(
      chunk.sentences.map(async (sentenceObj: { text: string; metadata: any }) => {
        const sentence = sentenceObj.text.trim();
        
        if (sentence.length < 5) return null;
        const sentenceEmbedding = await getEmbedding(sentence);
        if (!sentenceEmbedding) return null;
        const similarity = cosineSimilarity(queryEmbedding, sentenceEmbedding);
        console.log(`Sentence: "${sentence}" | Similarity: ${similarity}`);

        return {
          sentence,
          similarity,
          embedding: sentenceEmbedding,
          metadata: sentenceObj.metadata,
          chunkIndex: topChunks.indexOf(match),
          originalChunk: chunk,
        } as ISentenceResult;
      })
    );
    allSentences.push(...chunkSentences.filter((s): s is ISentenceResult => s !== null));
  }

  allSentences.sort((a, b) => b.similarity - a.similarity);
  const selectedSentences: ISentenceResult[] = [];
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

/**
 * Extracts entities (people, places, organizations, topics) from the given text.
 */
export function extractEntitiesAndTopics(text: string): Entities {
  const doc = nlp(text);
  const people = doc.people().out("array");
  const places = doc.places().out("array");
  const organizations = doc.organizations().out("array");
  const topics = doc.topics().out("array");
  return { people, places, organizations, topics };
}

/**
 * Extracts key phrases from the given text.
 */
export function extractKeyPhrases(text: string): string[] {
  const doc = nlp(text);
  return doc.topics().out("array");
}

/**
 * Explains an answer segment by showing overlapping entities with supporting evidence.
 */
export async function explainAnswerSegmentWithEntities(
  segment: string,
  sourceMatches: ISentenceResult[]
): Promise<IHighlightedExplanation> {
  const answerIdeas = segment.split('\n').filter(idea => idea.trim());
  const COLORS = [
    'rgba(255, 99, 132, 0.3)',   // red
    'rgba(54, 162, 235, 0.3)',   // blue
    'rgba(255, 206, 86, 0.3)',   // yellow
    'rgba(75, 192, 192, 0.3)',   // green
    'rgba(153, 102, 255, 0.3)',  // purple
  ];

  const highlights: IHighlight[] = answerIdeas.map((idea, index) => ({
    text: idea.replace(/^[-\s]+/, ''), // Remove leading dash and spaces
    color: COLORS[index % COLORS.length]
  }));

  // Add the best matching source text as a highlight
  if (sourceMatches.length > 0) {
    const bestMatch = sourceMatches[0];
    highlights.push({
      text: bestMatch.sentence,
      color: 'rgba(255, 255, 0, 0.3)', // yellow for source matches
      page: bestMatch.metadata?.page,
      rect: bestMatch.metadata?.rect
    });
  }

  return {
    answer_segment: segment,
    highlights,
    supporting_evidence: sourceMatches.map(match => ({
      source_text: match.sentence,
      similarity_score: match.similarity,
      context: match.originalChunk?.text || '',
      location: match.metadata,
      overlapping_entities: []
    })),
    analysis: {
      confidence: Math.max(...sourceMatches.map(m => m.similarity)),
      coverage: sourceMatches.length / segment.split('.').length,
      context_summary: summarizeContext(sourceMatches)
    }
  };
}

/**
 * Calculates the coherence among a set of matches based on their embeddings.
 */
export function calculateCoherence(matches: IMatch[]): number {
  if (matches.length <= 1) return 1.0;
  const embeddings = matches.map((m) => m.embedding);
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

/**
 * Summarizes the context from a set of matches.
 */
export function summarizeContext(matches: IMatch[]): {
  num_sources: number;
  source_locations: (string | number)[];
  semantic_coherence: number;
} {
  const uniqueLocations = new Set(matches.map((m) => m.metadata?.block_id));
  return {
    num_sources: uniqueLocations.size,
    source_locations: Array.from(uniqueLocations),
    semantic_coherence: calculateCoherence(matches),
  };
}

/**
 * Highlights keywords from the final sentence in the matched chunk.
 */
export function highlightOverlap(finalSentence: string, matchedChunk: string): string {
  const keywords = finalSentence.split(" ").filter((word) => word.length > 3);
  let highlightedChunk = matchedChunk;
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    highlightedChunk = highlightedChunk.replace(regex, `**${keyword}**`);
  });
  return highlightedChunk;
}

export async function findTextBoundsInPdf(
  page: PDFPageProxy,
  searchText: string
): Promise<PDFHighlight["rect"] | null> {
  try {
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });
    
    // Clean and normalize search text
    const normalizedSearch = searchText.trim().toLowerCase();
    
    for (const item of textContent.items) {
      const text = (item as any).str;
      if (text.toLowerCase().includes(normalizedSearch)) {
        // Convert PDF coordinates to normalized viewport coordinates
        return {
          left: (item as any).transform[4] / viewport.width,
          top: 1 - ((item as any).transform[5] / viewport.height), // Flip Y coordinate
          width: ((item as any).width || 0) / viewport.width,
          height: ((item as any).height || 20) / viewport.height // Default height if not provided
        };
      }
    }
  } catch (error) {
    console.error('Error finding text bounds:', error);
  }
  return null;
}
