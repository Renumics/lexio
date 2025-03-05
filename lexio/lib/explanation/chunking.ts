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

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceTokenCount = countTokens([sentence.text])[0];

    if (currentTokenCount + sentenceTokenCount > maxTokens && currentChunkSentences.length > 0) {
      chunks.push({
        text: currentChunkSentences.map(s => s.text).join(" "),
        sentences: currentChunkSentences,
        page: currentChunkSentences[0].metadata.page  // Keep track of the page
      });

      console.log(`Created chunk with ${currentChunkSentences.length} sentences`);
      
      currentChunkSentences = [];
      currentTokenCount = 0;
    }

    currentChunkSentences.push(sentence);
    currentTokenCount += sentenceTokenCount;
  }

  // Handle remaining sentences
  if (currentChunkSentences.length > 0) {
    chunks.push({
      text: currentChunkSentences.map(s => s.text).join(" "),
      sentences: currentChunkSentences,
      page: currentChunkSentences[0].metadata.page
    });

    console.log(`Created final chunk with ${currentChunkSentences.length} sentences`);
  }

  console.log(`Chunk grouping complete: ${chunks.length} chunks created`);
  return chunks;
}