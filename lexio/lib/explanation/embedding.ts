// embedding.ts

// Remove dotenv, fs, and path since these are Node‑only.
import { loadCompromise, loadOpenAIEmbeddings } from './dependencies';

// No need for direct API key access here anymore
let embeddingsClient: Awaited<ReturnType<typeof loadOpenAIEmbeddings>> | null = null;

/**
 * Ensures the embeddings client is initialized
 */
async function ensureEmbeddingsClient() {
  if (!embeddingsClient) {
    embeddingsClient = await loadOpenAIEmbeddings();
  }
  return embeddingsClient;
}

/**
 * Normalizes text for embedding by expanding contractions, trimming, normalizing whitespace, and lowercasing.
 *
 * @param text - The text to normalize.
 * @returns The normalized text.
 */
export async function normalizeForEmbedding(text: string): Promise<string> {
  if (!text || typeof text !== 'string') {
    console.warn('Invalid input provided to normalizeForEmbedding');
    return '';
  }
  const nlp = await loadCompromise();
  const doc = nlp(text);
  doc.contractions().expand();
  // Additional normalization steps
  const cleanedText = doc
    .out('text')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()               // Remove leading/trailing whitespace
    .toLowerCase();       // Convert to lowercase for consistency
  return cleanedText;
}

/**
 * Generates an embedding for a given chunk of text using the OpenAI API.
 *
 * @param chunk - The text to embed.
 * @returns A Promise that resolves to an array of numbers (the embedding) or null if an error occurs.
 */
export async function getEmbedding(chunk: string): Promise<number[] | null> {
  try {
    // Always normalize before getting the embedding
    const normalizedChunk = await normalizeForEmbedding(chunk);
    const client = await ensureEmbeddingsClient();
    return await client.createEmbedding(normalizedChunk);
  } catch (error) {
    console.error("Error getting embedding:", error);
    return null;
  }
}

/**
 * Types for chunk input and processed chunks.
 */
export type ChunkInput = string | { text: string; [key: string]: any };

export interface ProcessedChunk {
  // Define your IChunk interface as needed; here's a minimal example:
  chunk: {
    text: string;
    original: string;
    normalized: string;
    sentences: any[];
    [key: string]: any;
  };
  embedding: number[];
}

/**
 * Generates embeddings for an array of text chunks.
 *
 * @param chunks - An array of chunks (either strings or objects with a 'text' property).
 * @param concurrency - The number of chunks to process concurrently (default is 5).
 * @returns A Promise that resolves to an array of processed chunks with their embeddings.
 */
export async function generateEmbeddingsForChunks(
  chunks: ChunkInput[],
  concurrency: number = 5
): Promise<ProcessedChunk[]> {
  const processedChunks: ProcessedChunk[] = [];
  const totalChunks = chunks.length;
  let index = 0;
  const MAX_CHARS = 5000;

  while (index < totalChunks) {
    const batch = chunks.slice(index, index + concurrency);
    console.log(`Processing batch ${index + 1}-${Math.min(index + concurrency, totalChunks)} of ${totalChunks}...`);

    const results = await Promise.all(
      batch.map(async (chunkObj, i): Promise<ProcessedChunk | null> => {
        // Determine the text for the current chunk
        const chunkText: string = typeof chunkObj === "string" ? chunkObj : chunkObj.text;
        if (!chunkText || typeof chunkText !== "string" || chunkText.trim() === "") {
          console.error(`❌ Skipping empty or invalid chunk at index: ${index + i}`);
          return null;
        }

        // If the chunk is too long, truncate it.
        let processedChunk = chunkText;
        if (chunkText.length > MAX_CHARS) {
          console.warn(`⚠️ Truncating chunk at index ${index + i} from ${chunkText.length} to ${MAX_CHARS} characters`);
          processedChunk = chunkText.slice(0, MAX_CHARS);
        }

        console.log(`Generating embedding for chunk ${index + i + 1}/${totalChunks}`);
        let embedding = await getEmbedding(processedChunk);

        // Retry once if the first attempt fails
        if (!embedding) {
          console.warn(`Retrying embedding for chunk ${index + i + 1}/${totalChunks}...`);
          embedding = await getEmbedding(processedChunk);
        }

        if (!embedding) {
          console.error(`❌ Failed to get embedding for chunk: "${processedChunk.slice(0, 50)}..."`);
          return null;
        }

        // Build a consistent chunk object.
        // If the original input was a string, wrap it in an object.
        const chunkData = typeof chunkObj === 'string' ? { text: chunkObj } : chunkObj;

        return {
          chunk: {
            ...chunkData,
            original: chunkText,
            normalized: await normalizeForEmbedding(chunkText),
            sentences: []  // Ensure every chunk has a `sentences` property
          },
          embedding
        };
      })
    );

    // Filter out any null results and add the valid ones.
    processedChunks.push(...results.filter((result): result is ProcessedChunk => Boolean(result)));
    index += concurrency;
  }

  return processedChunks;
}
