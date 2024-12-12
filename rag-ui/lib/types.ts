export type WorkflowMode = 
  | 'init'           // Initial state, no conversation yet
  | 'follow-up'      // Using existing context and sources
  | 'reretrieve';    // Getting new sources while preserving history

export interface Message {
  role: string;
  content: string;
  sources?: RetrievalResult[];
}

export interface BaseRetrievalResult {
  relevanceScore?: number;
  metadata?: Record<string, any>;
}

export interface SourceReference extends BaseRetrievalResult {
  type?: 'pdf';
  source: string;
}

export interface TextContent extends BaseRetrievalResult {
  text: string;
}

export interface SourceContent {
  content: string;
  metadata?: Record<string, any>;
  type?: 'pdf';
}

export interface GenerateStreamChunk {
  content: string;
  done?: boolean;
}

export interface RetrieveAndGenerateResponse {
  sources?: Promise<RetrievalResult[]>;
  response: Promise<string> | AsyncIterable<GenerateStreamChunk>;
}

export type RetrievalResult = SourceReference | TextContent;
export type GenerateInput = string | Message[];
export type GenerateResponse = string | AsyncIterable<GenerateStreamChunk>;

export interface RAGProviderProps<T = Record<string, any>, M = Record<string, any>> {
  children: React.ReactNode;
  retrieve: (query: string, metadata?: T) => Promise<RetrievalResult[]>;
  retrieveAndGenerate: (
    query: string,
    metadata?: T
  ) => RetrieveAndGenerateResponse
  generate: (input: GenerateInput) => Promise<GenerateResponse>;
  getDataSource: (metadata: M) => Promise<SourceContent>;
  config?: RAGConfig;
}

export interface RAGConfig {
  timeouts?: {
    stream?: number;  // Timeout between stream chunks in ms
    request?: number; // Overall request timeout in ms
  }
}