export interface Config {
    EMBEDDINGS_FILE: string;
    MAX_TOKENS: number;
    CONCURRENCY: number;
    MAX_CHARS: number;
    OPENAI_EMBEDDING_MODEL: string;
    PDF_FILE_PATH: string;
    FINAL_ANSWER: string;
    IDEA_SPLITTING_METHOD: string;
    TOP_K_MATCHES: number;
    SIMILARITY_THRESHOLD: number;
    TOP_K_SENTENCES: number;
    MIN_SIMILARITY: number;
    MIN_DISTANCE: number;
}

// Update paths to match your setup
const PUBLIC_PATH = 'public/pdfs';
const PDF_FILE_NAME = 'deepseek.pdf';

export const EMBEDDINGS_FILE = 'embeddings.json';
export const MAX_TOKENS = 500;
export const CONCURRENCY = 5;
export const MAX_CHARS = 5000;
export const OPENAI_EMBEDDING_MODEL = 'text-embedding-ada-002';
export const PDF_FILE_PATH = `${PUBLIC_PATH}/${PDF_FILE_NAME}`;

// The FINAL_ANSWER will come from App.tsx, so we can set a default here
export const FINAL_ANSWER = '';  // This will be overridden by App.tsx
export const IDEA_SPLITTING_METHOD = 'llm';

// Add the similarity configuration values
export const TOP_K_MATCHES = 6;
export const SIMILARITY_THRESHOLD = 0.75;
export const TOP_K_SENTENCES = 5;
export const MIN_SIMILARITY = 0.5;
export const MIN_DISTANCE = 0.05;

export default {
    EMBEDDINGS_FILE,
    MAX_TOKENS,
    CONCURRENCY,
    MAX_CHARS,
    OPENAI_EMBEDDING_MODEL,
    PDF_FILE_PATH,
    FINAL_ANSWER,
    IDEA_SPLITTING_METHOD,
    TOP_K_MATCHES,
    SIMILARITY_THRESHOLD,
    TOP_K_SENTENCES,
    MIN_SIMILARITY,
    MIN_DISTANCE,
} as Config;