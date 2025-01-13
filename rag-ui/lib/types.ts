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
  metadata?: Record<string, any>;  // todo: define abstract type for metadata ? makes it easier to use
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

// ----- Types for the generate function -----
export type GenerateInput = Message[];
export type GenerateResponse = Promise<string> | AsyncIterable<GenerateStreamChunk>;
export type GenerateSimple = (messages: Message[]) => GenerateResponse;
export type GenerateWithSources = (messages: Message[], sources: RetrievalResult[]) => GenerateResponse;

// Type guard to check if the supplied generate function accepts sources
export const acceptsSources = (
  fn: GenerateSimple | GenerateWithSources
): fn is GenerateWithSources => fn.length === 2;

// ----- Workflow Action Types -----
export type RAGWorkflowActionOnAddMessage = 
  | { type: 'follow-up' }
  | { type: 'reretrieve', preserveHistory: boolean }


// ----- RAG Provider Types -----
export interface RAGProviderProps {
  children: React.ReactNode;
  retrieve: (query: string, metadata?: Record<string, any>) => RetrieveResponse;
  retrieveAndGenerate: (
    query: GenerateInput,
    metadata?: Record<string, any>
  ) => RetrieveAndGenerateResponse;
  generate: GenerateSimple | GenerateWithSources;
  getDataSource: (source: SourceReference) => GetDataSourceResponse;
  config?: RAGConfig;
  onAddMessage?: (message: Message, previousMessages: Message[]) => RAGWorkflowActionOnAddMessage;
}

export interface RAGConfig {
  timeouts?: {
    stream?: number;  // Timeout between stream chunks in ms
    request?: number; // Overall request timeout in ms
  },

}