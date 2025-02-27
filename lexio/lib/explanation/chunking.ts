// chunking.ts
// import { SentenceTokenizer } from "natural"; // not browser-friendly library
import { countTokens } from "./tokenizer";

// Define interfaces for sentence objects and chunks.
export interface SentenceObject {
  text: string;
  metadata?: { [key: string]: any };
  // Alternatively, you can allow any extra properties:
  // [key: string]: any;
}


export interface Chunk {
  text: string;
  sentences: SentenceObject[];
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
  // Regex explanation:
  // [^.!?]+      => match one or more characters that are not ., !, or ?
  // [.!?]+       => match the punctuation that ends a sentence
  // \s*          => match any whitespace following the sentence
  // The 'g' flag finds all matches.
  const sentenceRegex = /[^.!?]+[.!?]+[\])'"’”]*/g;
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
  sentences: SentenceObject[],
  maxTokens: number = 500
): Promise<Chunk[]> {
  const chunks: Chunk[] = [];
  let currentChunkSentences: SentenceObject[] = [];
  let currentTokenCount = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentenceObj = sentences[i];
    const sentenceTokenCount = countTokens([sentenceObj.text])[0];

    // If adding this sentence would exceed maxTokens and the current chunk is not empty,
    // then push the current chunk and start a new one.
    if (currentTokenCount + sentenceTokenCount > maxTokens && currentChunkSentences.length > 0) {
      // Create chunk with properly populated sentences array
      const chunkText = currentChunkSentences.map(s => s.text).join(" ");
      chunks.push({
        text: chunkText,
        sentences: currentChunkSentences.map(s => ({
          text: s.text,
          metadata: s.metadata || {}
        }))
      });
      currentChunkSentences = [];
      currentTokenCount = 0;
    }

    // Add the current sentence to the chunk.
    currentChunkSentences.push(sentenceObj);
    currentTokenCount += sentenceTokenCount;
  }

  // Push any remaining sentences as the final chunk.
  if (currentChunkSentences.length > 0) {
    const chunkText = currentChunkSentences.map(s => s.text).join(" ");
    chunks.push({
      text: chunkText,
      sentences: currentChunkSentences.map(s => ({
        text: s.text,
        metadata: s.metadata || {}
      }))
    });
  }

  console.log(`Chunk grouping complete: ${chunks.length} chunks`);
  return chunks;
}