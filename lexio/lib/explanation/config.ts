export interface Config {
    // File and Path Configuration
    EMBEDDINGS_FILE: string;
    PDF_FILE_PATH: string;

    // OpenAI Configuration
    OPENAI_EMBEDDING_MODEL: string;
    MAX_TOKENS: number;

    // Processing Configuration
    CONCURRENCY: number;
    MAX_CHARS: number;
    IDEA_SPLITTING_METHOD: string;
    MATCHING_METHOD: 'heuristic' | 'embedding';
    FINAL_ANSWER: string;
    DEBUG: boolean;  // Debug flag to control logging

    // Similarity Search Configuration
    TOP_K_MATCHES: number;
    SIMILARITY_THRESHOLD: number;
    TOP_K_SENTENCES: number;
    MIN_SIMILARITY: number;
    MIN_DISTANCE: number;

    // Provider Configuration
    timeouts: {
        stream: number;  // Timeout between stream chunks in ms
        request: number; // Overall request timeout in ms
    };
    llms: {
        OPENAI_API_KEY: string;
        OPENAI_ENDPOINT: string;
        ideaSplittingMethod: "llm" | "heuristic";
    };
}

// File and Path Configuration
const PUBLIC_PATH = 'public/pdfs';
const PDF_FILE_NAME = 'deepseek.pdf';
export const EMBEDDINGS_FILE = 'embeddings.json';
export const PDF_FILE_PATH = `${PUBLIC_PATH}/${PDF_FILE_NAME}`;

// OpenAI Configuration
export const OPENAI_EMBEDDING_MODEL = 'text-embedding-ada-002';
export const MAX_TOKENS = 500;

// Processing Configuration
export const CONCURRENCY = 5;
export const MAX_CHARS = 5000;
export const IDEA_SPLITTING_METHOD = 'llm'; //'heuristic'; //'llm';
export const MATCHING_METHOD = 'embedding'; //'heuristic'; //'embedding' as const;
export const FINAL_ANSWER = '';  // This will be overridden by App.tsx
export const DEBUG = true;  // Debug flag, defaults to false

// Similarity Search Configuration
export const TOP_K_MATCHES = 6;
export const SIMILARITY_THRESHOLD = 0.75;
export const TOP_K_SENTENCES = 5;
export const MIN_SIMILARITY = 0.5;
export const MIN_DISTANCE = 0.05;

// Provider Configuration
export const DEFAULT_STREAM_TIMEOUT = 10000;  // 10 seconds
export const DEFAULT_REQUEST_TIMEOUT = 30000; // 30 seconds
export const DEFAULT_OPENAI_ENDPOINT = 'https://api.openai.com/v1';

export default {
    // File and Path Configuration
    EMBEDDINGS_FILE,
    PDF_FILE_PATH,

    // OpenAI Configuration
    OPENAI_EMBEDDING_MODEL,
    MAX_TOKENS,

    // Processing Configuration
    CONCURRENCY,
    MAX_CHARS,
    IDEA_SPLITTING_METHOD,
    MATCHING_METHOD,
    FINAL_ANSWER,
    DEBUG,  // Add debug flag

    // Similarity Search Configuration
    TOP_K_MATCHES,
    SIMILARITY_THRESHOLD,
    TOP_K_SENTENCES,
    MIN_SIMILARITY,
    MIN_DISTANCE,

    // Provider Configuration
    timeouts: {
        stream: DEFAULT_STREAM_TIMEOUT,
        request: DEFAULT_REQUEST_TIMEOUT
    },
    llms: {
        OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
        OPENAI_ENDPOINT: DEFAULT_OPENAI_ENDPOINT,
        ideaSplittingMethod: IDEA_SPLITTING_METHOD as "llm" | "heuristic"
    }
} as Config;