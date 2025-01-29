import {Theme} from './theme/types'

export type WorkflowMode =
  | 'init'           // Initial state, no conversation yet
  | 'follow-up'      // Using existing context and sources
  | 'reretrieve';    // Getting new sources while preserving history


/**
 * Represents a single message in a conversation between a user and an assistant.
 * 
 * @interface Message
 * @property {("user" | "assistant")} role - The role of the message sender.
 * @property {string} content - The actual text content of the message.
 */
export interface Message {
  /**
   * The role of the message sender.
   * Can be either "user" for user messages or "assistant" for AI responses.
   */
  role: "user" | "assistant";
  /**
   * The actual text content of the message.
   */
  content: string;
}

/**
 * Represents a highlight annotation in a PDF document.
 * 
 * @interface PDFHighlight
 * @property {number} page - The page number where the highlight appears
 * @property {object} rect - The rectangle coordinates of the highlight
 * @property {number} rect.top - Top position of the highlight (relative to the page)
 * @property {number} rect.left - Left position of the highlight (relative to the page)
 * @property {number} rect.width - Width of the highlight (relative to the page width)
 * @property {number} rect.height - Height of the highlight (relative to the page height)
 * @property {string} [comment] - Optional comment associated with the highlight
 */
export interface PDFHighlight {
  /**
   * The page number where the highlight appears
   */
  page: number;
  /**
   * The rectangle coordinates of the highlight
   */
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  /**
   * Optional comment associated with the highlight
   */
  comment?: string;
}

/**
 * Base interface for all retrieval results, providing common properties.
 * 
 * @interface BaseRetrievalResult
 * @property {string} [sourceName] - Optional name of the source document
 * @property {number} [relevanceScore] - Optional score indicating relevance to the query
 * @property {Record<string, any>} [metadata] - Optional metadata associated with the result
 * @property {PDFHighlight[]} [highlights] - Optional array of PDF highlights
 */
export interface BaseRetrievalResult {
  sourceName?: string;
  relevanceScore?: number;
  metadata?: Record<string, any>;
  highlights?: PDFHighlight[];
}

/**
 * Represents a reference to a source document.
 * 
 * @interface SourceReference
 * @extends {BaseRetrievalResult}
 * @property {('pdf' | 'html' | 'markdown')} [type] - The type of the source document
 * @property {string} sourceReference - Reference identifier for the source
 */
export interface SourceReference extends BaseRetrievalResult {
  type?: 'pdf' | 'html' | 'markdown';
  sourceReference: string;
}

/**
 * Represents extracted text content from a source.
 * 
 * @interface TextContent
 * @extends {BaseRetrievalResult}
 * @property {string} text - The extracted text content
 */
export interface TextContent extends BaseRetrievalResult {
  text: string;
}

/**
 * Base interface for all source content types.
 * 
 * @interface BaseSourceContent
 * @property {Record<string, any>} [metadata] - Optional metadata associated with the content
 */
interface BaseSourceContent {
  metadata?: Record<string, any>;
}

/**
 * Represents Markdown source content.
 * 
 * @interface MarkdownSourceContent
 * @extends {BaseSourceContent}
 * @property {string} content - The Markdown content
 * @property {'markdown'} type - Indicates this is Markdown content
 */
export interface MarkdownSourceContent extends BaseSourceContent {
  content: string;
  type: 'markdown';
}

/**
 * Represents HTML source content.
 * 
 * @interface HTMLSourceContent
 * @extends {BaseSourceContent}
 * @property {string} content - The HTML content
 * @property {'html'} type - Indicates this is HTML content
 */
export interface HTMLSourceContent extends BaseSourceContent {
  content: string;
  type: 'html';
}

/**
 * Represents PDF source content.
 * 
 * @interface PDFSourceContent
 * @extends {BaseSourceContent}
 * @property {Uint8Array} content - The binary PDF content
 * @property {'pdf'} type - Indicates this is PDF content
 * @property {PDFHighlight[]} [highlights] - Optional array of highlights in the PDF
 */
export interface PDFSourceContent extends BaseSourceContent {
  content: Uint8Array;
  type: 'pdf';
  highlights?: PDFHighlight[];
}

/**
 * Union type of all possible source content types.
 * 
 * @typedef {HTMLSourceContent | PDFSourceContent | MarkdownSourceContent} SourceContent
 */
export type SourceContent = HTMLSourceContent | PDFSourceContent | MarkdownSourceContent;

export const isPDFContent = (content: SourceContent): content is PDFSourceContent => {
  return content.type === 'pdf';
};

export const isHTMLContent = (content: SourceContent): content is HTMLSourceContent => {
  return content.type === 'html';
};

export const isMarkdownContent = (content: SourceContent): content is MarkdownSourceContent => {
  return content.type === 'markdown';
};

export const isTextContent = (content: RetrievalResult): content is TextContent => {
  return 'text' in content;
};

export type GetDataSourceResponse = Promise<SourceContent>;

export interface GenerateStreamChunk {
  content: string;
  done?: boolean;
}

/**
 * Union type representing either a source reference or text content.
 * 
 * @typedef {SourceReference | TextContent} RetrievalResult
 */
export type RetrievalResult = SourceReference | TextContent;

/**
 * Type representing the response from a retrieve operation.
 * 
 * @typedef {Promise<RetrievalResult[]>} RetrieveResponse
 */
export type RetrieveResponse = Promise<RetrievalResult[]>;

export interface RetrieveAndGenerateResponse {
  sources?: Promise<RetrievalResult[]>;
  response: Promise<string> | AsyncIterable<GenerateStreamChunk>;
}

// ----- Types for the generate function -----
/**
 * Type representing the input for generation, consisting of an array of messages.
 * 
 * @typedef {Message[]} GenerateInput
 */
export type GenerateInput = Message[];

/**
 * Type representing the response from a generate operation.
 * Can be either a Promise of a string or an AsyncIterable of chunks.
 * 
 * @typedef {Promise<string> | AsyncIterable<GenerateStreamChunk>} GenerateResponse
 */
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
  retrieve?: (query: string, metadata?: Record<string, any>) => RetrieveResponse;
  retrieveAndGenerate?: (
    query: GenerateInput,
    metadata?: Record<string, any>
  ) => RetrieveAndGenerateResponse;
  generate?: GenerateSimple | GenerateWithSources;
  getDataSource?: (source: SourceReference) => GetDataSourceResponse;
  config?: RAGConfig;
  onAddMessage?: (message: Message, previousMessages: Message[]) => RAGWorkflowActionOnAddMessage;
  theme?: Theme;
}

export interface RAGConfig {
  timeouts?: {
    stream?: number;  // Timeout between stream chunks in ms
    request?: number; // Overall request timeout in ms
  },

}