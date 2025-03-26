// tokenizer.ts
import { loadTiktoken } from './dependencies';

let encoder: any = null;

/**
 * Initialize the encoder lazily.
 */
async function initializeEncoder() {
  if (!encoder) {
    const tiktoken = await loadTiktoken();
    encoder = tiktoken.getEncoding("cl100k_base");
  }
  return encoder;
}

/**
 * Count tokens for an array of sentence strings.
 *
 * @param sentences - An array of sentences.
 * @returns A promise that resolves to an array of token counts corresponding to each sentence.
 */
export async function countTokens(sentences: string[]): Promise<number[]> {
  const enc = await initializeEncoder();
  return sentences.map((sentence) => enc.encode(sentence).length);
}
