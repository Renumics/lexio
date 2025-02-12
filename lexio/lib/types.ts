import {Theme} from './theme/types'

// todo: some docstrings are missing
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
 * @property {number} page - The page number where the highlight appears. Page numbers are 1-based.
 * @property {object} rect - The rectangle coordinates of the highlight
 * @property {number} rect.top - Top position of the highlight (relative to the page)
 * @property {number} rect.left - Left position of the highlight (relative to the page)
 * @property {number} rect.width - Width of the highlight (relative to the page width)
 * @property {number} rect.height - Height of the highlight (relative to the page height)
 */
export interface PDFHighlight {
  /**
   * The page number where the highlight appears. Page numbers are 1-based.
   */
  page: number;
  /**
   * The rectangle coordinates of the highlight
   */
  rect: {
    /**
     * Top position of the highlight (relative to the page)
     */
    top: number;
    /**
     * Left position of the highlight (relative to the page)
     */
    left: number;
    /**
     * Width of the highlight (relative to the page width)
     */
    width: number;
    /**
     * Height of the highlight (relative to the page height)
     */
    height: number;
  };
}

/**
 * Represents ranges to highlight on a sheet in a spreadsheet document.
 *
 * @interface SpreadsheetHighlight
 * @property {string} sheetName - The name of the sheet where the highlight appears.
 * @property {string[]} ranges - The ranges to highlight. E.g "A1:B5", "B100:F200"
 */
export interface SpreadsheetHighlight {
  /**
   * The name of the sheet where the highlight appears.
   */
  sheetName: string;
  /**
   * The ranges to highlight. E.g "A1:B5", "B100:F200"
   */
  ranges: string[];
}

/**
 * Base interface for all retrieval results, providing common properties.
 * 
 * @interface BaseRetrievalResult
 * @property {string} [sourceName] - Optional name of the source document
 * @property {number} [relevanceScore] - Optional score indicating relevance to the query
 * @property {Record<string, any>} [metadata] - Optional metadata associated with the result
 * @property {PDFHighlight[] | SpreadsheetHighlight[]} [highlights] - Optional array of PDF or spreadsheet highlights
 */
export interface BaseRetrievalResult {
  /**
   * Optional name of the source document. If not provided, the source reference will be used.
   */
  sourceName?: string;
  /**
   * Optional score indicating relevance to the query. Scores must be in the range [0, 1].
   *
   * @minimum 0
   * @maximum 1
   */
  relevanceScore?: number;
  /**
   * Optional metadata associated with the result. Can be used to store additional information.
   * @remarks Metadata is not used by the RAG provider. It is shown as-is in the SourcesDisplay component.
   * @TJS-type object
   * @TJS-additionalProperties {{ type: "any" }}
   */
  metadata?: Record<string, any>;
  /**
   * Optional array of PDF or spreadsheet highlights. Only used for PDF or spreadsheet source references.
   */
  highlights?: PDFHighlight[];

  rangesHighlights?: SpreadsheetHighlight[];
}

/**
 * Metadata type for source references with explicit page property hint
 */
export type SourceReferenceMetadata = {
  /**
   * The page number to display for PDF documents. Page numbers are 1-based.
   * @TJS-type integer
   * @minimum 1
   */
  page?: number;
} & Record<string, any>;

/**
 * Represents a reference to a source document.
 * 
 * @interface SourceReference
 * @extends {BaseRetrievalResult}
 * @property {('pdf' | 'html' | 'markdown')} [type] - The type of the source document
 * @property {string} sourceReference - Reference identifier for the source
 * @property {SourceReferenceMetadata} [metadata] - Optional metadata associated with the result. For PDF documents, you can provide a `page` property (number) to make the PdfViewer display that specific page. Page numbers are 1-based.
 */
export interface SourceReference extends Omit<BaseRetrievalResult, 'metadata'> {
  /**
   * The type of the source document. Can be either "pdf", "html", or "markdown".
   */
  type?: 'pdf' | 'html' | 'markdown' | 'xlsx' | 'csv';
  /**
   * Reference identifier for the source. This can be everything from a URL, over a unique identifier to a database key and must be handled by the user in the getDataSource function.
   * @remarks In the getDataSource function, the sourceReference is given as an argument to the function and the function should return the actual content of the source document.
   * @example
   * const getDataSource = async (source: SourceReference): Promise<SourceContent> => {
   *     const url = `http://localhost:8000/getDaa/${encodeURIComponent(source.sourceReference)}`;
   *     const response = await fetch(url);
   *     if (!response.ok) {
   *         throw new Error(`Failed to get data source. HTTP Status: ${response.status} ${response.statusText}`);
   *     }
   *     ... your code here ...
   *
   *     return pdfContent;
   * };
   */
  sourceReference: string;
  /**
   * Optional metadata associated with the result. Can be used to store additional information.
   * For PDF documents, you can provide a `page` property to make the PdfViewer display that specific page.
   * Page numbers are 1-based.
   * @remarks Metadata is not used by the RAG provider. It is shown as-is in the SourcesDisplay component.
   * @TJS-type object
   * @TJS-additionalProperties {{ type: "any" }}
   */
  metadata?: SourceReferenceMetadata;
}

/**
 * Represents extracted text content from a source.
 * 
 * @interface TextContent
 * @extends {BaseRetrievalResult}
 * @property {string} text - The content of the RetrievalResult. If you are using the ComponentDisplay component, the text will be displayed with the **MarkdownViewer** component.
 */
export interface TextContent extends BaseRetrievalResult {
  /**
   * The content of the RetrievalResult. If you are using the ComponentDisplay component, the text will be displayed with the **MarkdownViewer** component.
   */
  text: string;
}

/**
 * Base interface for all source content types.
 * 
 * @interface BaseSourceContent
 * @property {Record<string, any>} [metadata] - Optional metadata associated with the content. Can be used to store additional information.
 */
interface BaseSourceContent {
  /**
   * Optional metadata associated with the content. Can be used to store additional information.
   * @remarks Metadata is not used by the RAG provider. It is also not shown in the UI. For metadata to be displayed, it must be included in the SourceReference object.
   */
  metadata?: Record<string, any>;
}

/**
 * Represents Markdown source content.
 * 
 * @interface MarkdownSourceContent
 * @extends {BaseSourceContent}
 * @property {string} content - The Markdown content as a string
 * @property {'markdown'} type - Must be "markdown". Indicates this is Markdown content
 */
export interface MarkdownSourceContent extends BaseSourceContent {
  /**
   * The Markdown content as a string.
   */
  content: string;
  /**
   * Must be "markdown". Indicates this is Markdown content.
   *
   * @default "markdown"
   */
  type: 'markdown';
}

/**
 * Represents HTML source content.
 * 
 * @interface HTMLSourceContent
 * @extends {BaseSourceContent}
 * @property {string} content - The HTML content as a string
 * @property {'html'} type - Must be "html". Indicates this is HTML content
 */
export interface HTMLSourceContent extends BaseSourceContent {
  /**
   * The HTML content as a string.
   */
  content: string;
  /**
   * Must be "html". Indicates this is HTML content.
   *
   * @default "html"
   */
  type: 'html';
}

/**
 * Represents PDF source content.
 *
 * @remarks The PDFSourceContent value for page is automatically set if the associated SourceReference has a page property in its metadata.
 * 
 * @interface PDFSourceContent
 * @extends {BaseSourceContent}
 * @property {Uint8Array} content - The binary PDF content
 * @property {'pdf'} type - Must be "pdf". Indicates this is PDF content.
 * @property {PDFHighlight[]} [highlights] - Optional array of highlights in the PDF
 * @property {number} [page] - The page number to display when rendering the PDF. Page numbers are 1-based. If not provided, the PdfViewer will set the default page number based on the highlights (if no highlights are provided, the first page will be displayed).
 */
export interface PDFSourceContent extends BaseSourceContent {
  /**
   * The binary PDF content.
   */
  content: Uint8Array;
  /**
   * Must be "pdf". Indicates this is PDF content.
   *
   * @default "pdf"
   */
  type: 'pdf';
  /**
   * Optional array of highlights in the PDF.
   */
  highlights?: PDFHighlight[];
  /**
   * The page number to display when rendering the PDF. Page numbers are 1-based. If not provided, the PdfViewer will set the default page number based on the highlights (if no highlights are provided, the first page will be displayed).
   */
  page?: number;
}

/**
 * Represents Spreadsheet source content.
 *
 * @interface SpreadsheetSourceContent
 * @extends {BaseSourceContent}
 * @property {Uint8Array} content - The binary Spreadsheet content.
 * @property {'xlsx' | 'csv'} type - Indicates this is a Spreadsheet content.
 * @property {SpreadsheetHighlight[]} [highlights] - Optional array of ranges to highlight in the spreadsheet document.
 */
export interface SpreadsheetSourceContent extends BaseSourceContent {
  /**
   * The binary Spreadsheet content.
   */
  content: Uint8Array;
  /**
   * Indicates this is a Spreadsheet content.
   */
  type: 'xlsx' | 'csv';
  /**
   * Optional array of ranges to highlight in the spreadsheet document.
   */
  rangesHighlights?: SpreadsheetHighlight[];
}

/**
 * Union type of all possible source content types.
 * 
 * @typedef {HTMLSourceContent | PDFSourceContent | MarkdownSourceContent | SpreadsheetSourceContent} SourceContent
 *
 * @remarks This type is used in the ComponentDisplay component. The type of the content is determined by the type property of the object.
 */
export type SourceContent = HTMLSourceContent | PDFSourceContent | MarkdownSourceContent | SpreadsheetSourceContent;

export const isPDFContent = (content: SourceContent): content is PDFSourceContent => {
  return content.type === 'pdf';
};

export const isHTMLContent = (content: SourceContent): content is HTMLSourceContent => {
  return content.type === 'html';
};

export const isMarkdownContent = (content: SourceContent): content is MarkdownSourceContent => {
  return content.type === 'markdown';
};

export const isSpreadsheetContent = (content: SourceContent): content is SpreadsheetSourceContent => {
  return content.type === 'xlsx' || content.type === 'csv';
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
 *
 * @remarks This is the type of objects returned by the retrieve function.
 */
export type RetrievalResult = SourceReference | TextContent;

/**
 * Type representing the response from a retrieve operation.
 * 
 * @typedef {Promise<RetrievalResult[]>} RetrieveResponse
 *
 * @remarks The response is an array of RetrievalResult objects. These can be either SourceReference or TextContent objects.
 */
export type RetrieveResponse = Promise<RetrievalResult[]>;

/**
 * Represents the response from a retrieve and generate operation.
 *
 * @interface RetrieveAndGenerateResponse
 * @property {Promise<RetrievalResult[]>} [sources] - Optional promise resolving to an array of retrieval results.
 * @property {Promise<string> | AsyncIterable<GenerateStreamChunk>} response - The response, which can be either a promise resolving to a string or an async iterable of generate stream chunks.
 */
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