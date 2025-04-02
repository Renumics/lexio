// chunking.ts
// import { SentenceTokenizer } from "natural"; // not browser-friendly library
import { countTokens } from "./tokenizer";
import { TextWithMetadata } from "./preprocessing"; // Import the interface we need

// Define interfaces for sentence objects and chunks.
export interface TextPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface SentenceObject {
  text: string;
  metadata?: {
    page: number;
    position?: TextPosition;
    linePositions?: TextPosition[];
  };
  // Alternatively, you can allow any extra properties:
  // [key: string]: any;
}

export interface Chunk {
  text: string;
  sentences: TextWithMetadata[];
  page?: number;  // Keep just the page number for reference
}

// // Initialize Natural's sentence tokenizer.
// const sentenceTokenizer = new SentenceTokenizer([]); // Provide an empty array if no abbreviations are needed.

/**
 * Splits a block of text into an array of sentence strings.
 *
 * This implementation uses a regex that attempts to split sentences based on
 * punctuation (periods, exclamation points, question marks) followed by whitespace.
 * You can adjust the regex if you encounter edge cases.
 *
 * @param text - The text to split.
 * @returns An array of sentence strings.
 */
// export function splitIntoSentences(text: string): string[] {
//   return sentenceTokenizer
//     .tokenize(text)
//     .map((sentence: string) => sentence.trim())
//     .filter((sentence: string) => sentence.length > 0);
// }
export function splitIntoSentences(text: string): string[] {
  const sentenceRegex = /[^.!?]+[.!?]+[\])'"'"]*/g;
  const sentences = text.match(sentenceRegex) || [];
  return sentences.map(sentence => sentence.trim()).filter(sentence => sentence.length > 0);
}

/**
 * Groups an array of sentence objects into chunks so that the total token count
 * does not exceed the specified maxTokens per chunk.
 *
 * @param sentences - An array of SentenceObject (each with a `text` property).
 * @param maxTokens - The maximum token count per chunk (default is 500).
 * @returns A promise that resolves to an array of Chunk objects.
 */
export async function groupSentenceObjectsIntoChunks(
  sentences: TextWithMetadata[],
  maxTokens: number = 500
): Promise<Chunk[]> {
  console.log(`Starting chunk grouping with ${sentences.length} sentences`);
  const chunks: Chunk[] = [];
  let currentChunkSentences: TextWithMetadata[] = [];
  let currentTokenCount = 0;
  let currentPage = sentences[0]?.metadata.page;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const tokenCounts = await countTokens([sentence.text]);  // Add await here
    const sentenceTokenCount = tokenCounts[0];
    const nextSentence = sentences[i + 1];

    // Create a new chunk if:
    // 1. Adding this sentence would exceed maxTokens, OR
    // 2. We're moving to a new page and current chunk has content
    const shouldCreateNewChunk = (
      (currentTokenCount + sentenceTokenCount > maxTokens && currentChunkSentences.length > 0) ||
      (nextSentence && 
       currentPage !== nextSentence.metadata.page && 
       currentChunkSentences.length > 0)
    );

    if (shouldCreateNewChunk) {
      // Get the page range for this chunk
      const chunkPages = new Set(currentChunkSentences.map(s => s.metadata.page));
      
      chunks.push({
        text: currentChunkSentences.map(s => s.text).join(" "),
        sentences: currentChunkSentences,
        page: Math.min(...Array.from(chunkPages)) // Use the first page as reference
      });

      console.log(`Created chunk with ${currentChunkSentences.length} sentences spanning pages ${Array.from(chunkPages).join(', ')}`);
      
      currentChunkSentences = [];
      currentTokenCount = 0;
      currentPage = sentence.metadata.page;
    }

    currentChunkSentences.push(sentence);
    currentTokenCount += sentenceTokenCount;
    currentPage = sentence.metadata.page;
  }

  // Handle remaining sentences
  if (currentChunkSentences.length > 0) {
    const chunkPages = new Set(currentChunkSentences.map(s => s.metadata.page));
    
    chunks.push({
      text: currentChunkSentences.map(s => s.text).join(" "),
      sentences: currentChunkSentences,
      page: Math.min(...Array.from(chunkPages)) // Use the first page as reference
    });

    console.log(`Created final chunk with ${currentChunkSentences.length} sentences spanning pages ${Array.from(chunkPages).join(', ')}`);
  }

  console.log(`Chunk grouping complete: ${chunks.length} chunks created`);
  return chunks;
}

/**
 * Groups sentences into chunks optimized for heuristic matching.
 * This approach focuses on semantic coherence and natural language boundaries
 * rather than strict token counts.
 */
export async function groupSentenceObjectsIntoChunksHeuristic(
  sentences: TextWithMetadata[],
  maxSentences: number = 10
): Promise<Chunk[]> {
  const chunks: Chunk[] = [];
  let currentChunkSentences: TextWithMetadata[] = [];
  let currentPage = sentences[0]?.metadata.page;

  const shouldStartNewChunk = (
    currentSentences: TextWithMetadata[],
    nextSentence: TextWithMetadata
  ): boolean => {
    // Always start new chunk on page boundary
    if (currentPage !== nextSentence.metadata.page) return true;
    
    // Start new chunk if we hit max sentences
    if (currentSentences.length >= maxSentences) return true;
    
    // If this is the first sentence, don't start new chunk
    if (currentSentences.length === 0) return false;
    
    const lastSentence = currentSentences[currentSentences.length - 1].text;
    const nextSentenceText = nextSentence.text;
    
    // Start new chunk on topic shifts or semantic boundaries
    const topicShiftIndicators = [
      'However,', 'Nevertheless,', 'In contrast,', 'On the other hand,',
      'Moving on', 'Furthermore,', 'Additionally,', 'Moreover,'
    ];
    
    // Check for topic shift indicators
    if (topicShiftIndicators.some(indicator => 
      nextSentenceText.startsWith(indicator))) {
      return true;
    }
    
    // Check for semantic continuity using common key terms
    const words1 = new Set(lastSentence.toLowerCase().match(/\b[a-z]{4,}\b/g) || []);
    const words2 = new Set(nextSentenceText.toLowerCase().match(/\b[a-z]{4,}\b/g) || []);
    const commonWords = [...words1].filter(word => words2.has(word));
    
    // Start new chunk if there's low word overlap
    return commonWords.length < 2;
  };

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const nextSentence = sentences[i + 1];

    currentChunkSentences.push(sentence);
    
    if (
      nextSentence && 
      shouldStartNewChunk(currentChunkSentences, nextSentence)
    ) {
      chunks.push({
        text: currentChunkSentences.map(s => s.text).join(" "),
        sentences: currentChunkSentences,
        page: currentPage
      });
      
      currentChunkSentences = [];
      currentPage = nextSentence.metadata.page;
    }
  }

  // Handle remaining sentences
  if (currentChunkSentences.length > 0) {
    chunks.push({
      text: currentChunkSentences.map(s => s.text).join(" "),
      sentences: currentChunkSentences,
      page: currentPage
    });
  }

  return chunks;
}