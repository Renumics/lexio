export type WorkflowMode = 
  | 'init'           // Initial state, no conversation yet
  | 'follow-up'      // Using existing context and sources
  | 'reretrieve';    // Getting new sources while preserving history

export interface Message {
  role: string;
  content: string;
}

export interface PDFHighlight {
  page: number;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  comment?: string;
}

export interface BaseRetrievalResult {
  relevanceScore?: number;
  metadata?: Record<string, any>;
  highlights?: PDFHighlight[];
}

export interface SourceReference extends BaseRetrievalResult {
  type?: 'pdf' | 'html';
  source: string;
}

export interface TextContent extends BaseRetrievalResult {
  text: string;
}

interface BaseSourceContent {
  metadata?: Record<string, any>;
}

export interface HTMLSourceContent extends BaseSourceContent {
  content: string;
  type: 'html';
}

export interface PDFSourceContent extends BaseSourceContent {
  content: Uint8Array;
  type: 'pdf';
  highlights?: PDFHighlight[];
}

export type SourceContent = HTMLSourceContent | PDFSourceContent;

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