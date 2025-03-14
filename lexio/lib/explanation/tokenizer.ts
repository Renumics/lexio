// tokenizer.ts
import { getEncoding } from "js-tiktoken";

// Initialize the encoder using the "cl100k_base" encoding.
const enc = getEncoding("cl100k_base");

/**
 * Count tokens for an array of sentence strings.
 *
 * @param sentences - An array of sentences.
 * @returns An array of token counts corresponding to each sentence.
 */
export function countTokens(sentences: string[]): number[] {
  return sentences.map((sentence) => enc.encode(sentence).length);
}
