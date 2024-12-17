export type WorkflowMode = 
  | 'init'           // Initial state, no conversation yet
  | 'follow-up'      // Using existing context and sources
  | 'reretrieve';    // Getting new sources while preserving history

export interface Message {
  role: string;
  content: string;
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
  content: Uint8Array | string;
  metadata?: Record<string, any>;
  type?: 'pdf';
}

export type GetDataSourceResponse = Promise<SourceContent>;

export interface GenerateStreamChunk {
  content: string;
  done?: boolean;
}

export type RetrievalResult = SourceReference | TextContent;

export interface RetrieveAndGenerateResponse {
  sources?: Promise<RetrievalResult[]>;
  response: Promise<string> | AsyncIterable<GenerateStreamChunk>;
}

export type RetrieveResponse = Promise<RetrievalResult[]>;

export type GenerateInput = Message[];
export type GenerateResponse = Promise<string> | AsyncIterable<GenerateStreamChunk>;

export interface RAGProviderProps {
  children: React.ReactNode;
  retrieve: (query: string, metadata?: Record<string, any>) => RetrieveResponse;
  retrieveAndGenerate: (
    query: GenerateInput,
    metadata?: Record<string, any>
  ) => RetrieveAndGenerateResponse;
  generate: (input: GenerateInput) => GenerateResponse;
  getDataSource: (source: SourceReference) => GetDataSourceResponse;
  config?: RAGConfig;
}

export interface RAGConfig {
  timeouts?: {
    stream?: number;  // Timeout between stream chunks in ms
    request?: number; // Overall request timeout in ms
  }
}