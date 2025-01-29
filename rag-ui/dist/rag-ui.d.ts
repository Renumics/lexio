import { CSSProperties } from 'react';
import { default as default_2 } from 'react';
import { JSX as JSX_2 } from 'react/jsx-runtime';
import { RetrievalResult as RetrievalResult_2 } from '../../types';
import { SourceContent as SourceContent_2 } from '../../types';
import { WorkflowMode as WorkflowMode_2 } from '../../types';

export declare const acceptsSources: (fn: GenerateSimple | GenerateWithSources) => fn is GenerateWithSources;

/**
 * An advanced query input component with source mention capabilities
 *
 * Features:
 * - Rich text editing with source mentions
 * - Auto-expanding editor
 * - Source filtering and selection
 * - Visual workflow status indicator
 * - Customizable styling
 * - Responsive design
 *
 * Usage:
 *
 * ```tsx
 * <AdvancedQueryField
 *   onSubmit={(message, mentions) => {
 *     console.log('Message:', message);
 *     console.log('Mentioned sources:', mentions);
 *   }}
 *   placeholder="Type @ to mention a source..."
 * />
 * ```
 */
export declare const AdvancedQueryField: default_2.FC<AdvancedQueryFieldProps>;

/**
 * Props for the AdvancedQueryField component
 * @see {@link AdvancedQueryField}
 */
declare interface AdvancedQueryFieldProps {
    /**
     * Callback triggered when a message is submitted
     * @param message The message text that was submitted
     * @param mentions Array of source mentions included in the message
     */
    onSubmit?: (message: string, mentions: Mention[]) => void;
    /**
     * Called after a source mention is inserted into the editor
     * @param source The source that was added
     * @param allIndices Updated array of all currently referenced source indices
     */
    onSourceAdded?: (source: RetrievalResult, allIndices: number[]) => void;
    /**
     * Called after a source mention is removed from the editor
     * @param source The source that was removed
     * @param allIndices Updated array of all currently referenced source indices
     */
    onSourceDeleted?: (source: RetrievalResult, allIndices: number[]) => void;
    /**
     * Callback for when the editor content changes
     * @param value The new editor content
     * @param mentions Array of current source mentions
     */
    onChange?: (value: string, mentions: Mention[]) => void;
    /**
     * Placeholder text shown when editor is empty
     * @default 'Type @ to mention a source...'
     */
    placeholder?: string;
    /**
     * Whether the editor is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Style overrides for the component
     */
    styleOverrides?: AdvancedQueryFieldStyles;
}

/**
 * Styles interface for the AdvancedQueryField component
 * @see {@link AdvancedQueryField}
 */
declare interface AdvancedQueryFieldStyles extends CSSProperties {
    /**
     * Background color of the entire query container
     */
    backgroundColor?: string;
    /**
     * Text color for the entire query container
     */
    color?: string;
    /**
     * Padding for the container
     */
    padding?: string;
    /**
     * Font family for the container text
     */
    fontFamily?: string;
    /**
     *  Font size for the container text
     */
    fontSize?: string;
    /**
     * General border color (used for the editor)
     */
    borderColor?: string;
    /**
     * Border radius for the editor container, mention chips, etc.
     */
    borderRadius?: string;
    /**
     * Background color for inserted mention chips
     */
    mentionChipBackground?: string;
    /**
     * Text color for inserted mention chips
     */
    mentionChipColor?: string;
    /**
     * Background color for the editor field
     */
    inputBackgroundColor?: string;
    /**
     * Border color for the editor field or input boxes
     */
    inputBorderColor?: string;
    /**
     * Background color for the "Send" button
     */
    buttonBackground?: string;
    /**
     * Text color for the "Send" button
     */
    buttonTextColor?: string;
    /**
     * Border radius for the button
     */
    buttonBorderRadius?: string;
    /**
     * Colors for the different workflow modes
     */
    modeInitColor?: string;
    modeFollowUpColor?: string;
    modeReRetrieveColor?: string;
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
export declare interface BaseRetrievalResult {
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
     */
    metadata?: Record<string, any>;
    /**
     * Optional array of PDF highlights. Only used for PDF source references.
     */
    highlights?: PDFHighlight[];
}

/**
 * Base interface for all source content types.
 *
 * @interface BaseSourceContent
 * @property {Record<string, any>} [metadata] - Optional metadata associated with the content. Can be used to store additional information.
 */
declare interface BaseSourceContent {
    /**
     * Optional metadata associated with the content. Can be used to store additional information.
     * @remarks Metadata is not used by the RAG provider. It is also not shown in the UI. For metadata to be displayed, it must be included in the SourceReference object.
     */
    metadata?: Record<string, any>;
}

/**
 * --- Type Definitions for Default Functions ---
 */
declare type BuildFetchRequestFn = (source: SourceReference) => {
    url: string;
    init?: RequestInit;
};

/**
 * ChatWindow component displays a conversation between a user and an assistant
 *
 * ```tsx
 * <ChatWindow
 *   showRoleLabels={true}
 *   userLabel="You: "
 *   assistantLabel="Bot: "
 *   styleOverrides={{
 *     backgroundColor: '#f5f5f5',
 *     padding: '1rem'
 *   }}
 * />
 * ```
 */
export declare const ChatWindow: default_2.FC<ChatWindowProps>;

/**
 * Props for the ChatWindow component
 * @see {@link ChatWindow}
 */
declare interface ChatWindowProps {
    /**
     * Style overrides for the component
     */
    styleOverrides?: ChatWindowStyles;
    /**
     * Whether to show role labels (User:, Assistant:) before messages
     * @default true
     */
    showRoleLabels?: boolean;
    /**
     * Custom label for user messages
     * @default "User: "
     */
    userLabel?: string;
    /**
     * Custom label for assistant messages
     * @default "Assistant: "
     */
    assistantLabel?: string;
}

declare interface ChatWindowStyles extends default_2.CSSProperties {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;
    fontSize?: string;
    borderRadius?: string;
}

/**
 * Defines the color palette used throughout the application.
 * These colors are used for various UI elements like buttons, backgrounds, and text.
 *
 * @interface Colors
 * @property {string} primary - Primary brand color for main actions and important UI elements. This is also the default button color.
 * @property {string} secondary - Secondary brand color for less prominent actions.
 * @property {string} background - Main application background color.
 * @property {string} secondaryBackground - Background for cards and secondary containers.
 * @property {string} toolbarBackground - Specific background color for toolbar of the Viewers.
 * @property {string} text - Primary text color for high contrast content.
 * @property {string} secondaryText - Secondary text color for less important content.
 * @property {string} lightText - Light text color for use on dark backgrounds
 * @property {string} success - Color indicating successful operations.
 * @property {string} warning - Color indicating warnings or cautionary states.
 * @property {string} error - Color indicating errors or destructive states and ErrorDisplay.
 */
export declare interface Colors {
    primary: string;
    contrast: string;
    secondary: string;
    background: string;
    secondaryBackground: string;
    toolbarBackground: string;
    text: string;
    secondaryText: string;
    lightText: string;
    success: string;
    warning: string;
    error: string;
}

/**
 * Defines the default styling for components in the application.
 * These values are used to provide consistent padding and border radius for components.
 *
 * @interface ComponentDefaults
 * @property {string} borderRadius - Default border radius for components.
 * @property {string} padding - Default padding for components.
 */
export declare interface ComponentDefaults {
    borderRadius: string;
    padding: string;
}

export declare const ContentDisplay: default_2.FC<ContentDisplayProps>;

declare interface ContentDisplayProps {
    styleOverrides?: ContentDisplayStyles;
}

declare interface ContentDisplayStyles extends default_2.CSSProperties {
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
}

/**
 * Creates a new theme by merging the default theme with the provided overrides.
 *
 * @param {Partial<PartialTheme>} overrides - The theme overrides to apply on top of the default theme.
 * @returns {Theme} The new theme object with the applied overrides.
 * @example
 * ```tsx
 * import { createTheme, RAGProvider } from 'lexio';
 *
 * const customTheme = createTheme({
 *    colors: {
 *      primary: '#1E88E5',
 *      secondary: '#64B5F6'
 *      }
 * });
 *
 * <RAGProvider theme={customTheme}>
 *     ... your app components ...
 * <RAGProvider />
 * ```
 */
export declare const createTheme: (overrides: Partial<PartialTheme>) => Theme;

export declare const defaultTheme: Theme;

export declare const ErrorDisplay: React.FC<ErrorDisplayProps>;

declare interface ErrorDisplayProps {
    styleOverrides?: ErrorDisplayStyles;
}

declare interface ErrorDisplayStyles {
    fontFamily?: string;
    fontSize?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    progressBarColor?: string;
}

/**
 * Type representing the input for generation, consisting of an array of messages.
 *
 * @typedef {Message[]} GenerateInput
 */
export declare type GenerateInput = Message[];

/**
 * Type representing the response from a generate operation.
 * Can be either a Promise of a string or an AsyncIterable of chunks.
 *
 * @typedef {Promise<string> | AsyncIterable<GenerateStreamChunk>} GenerateResponse
 */
export declare type GenerateResponse = Promise<string> | AsyncIterable<GenerateStreamChunk>;

export declare type GenerateSimple = (messages: Message[]) => GenerateResponse;

export declare interface GenerateStreamChunk {
    content: string;
    done?: boolean;
}

export declare type GenerateWithSources = (messages: Message[], sources: RetrievalResult[]) => GenerateResponse;

export declare type GetDataSourceResponse = Promise<SourceContent>;

/**
 * Represents HTML source content.
 *
 * @interface HTMLSourceContent
 * @extends {BaseSourceContent}
 * @property {string} content - The HTML content as a string
 * @property {'html'} type - Must be "html". Indicates this is HTML content
 */
export declare interface HTMLSourceContent extends BaseSourceContent {
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

export declare const isHTMLContent: (content: SourceContent) => content is HTMLSourceContent;

export declare const isMarkdownContent: (content: SourceContent) => content is MarkdownSourceContent;

export declare const isPDFContent: (content: SourceContent) => content is PDFSourceContent;

export declare const isTextContent: (content: RetrievalResult) => content is TextContent;

/**
 * Represents Markdown source content.
 *
 * @interface MarkdownSourceContent
 * @extends {BaseSourceContent}
 * @property {string} content - The Markdown content as a string
 * @property {'markdown'} type - Must be "markdown". Indicates this is Markdown content
 */
export declare interface MarkdownSourceContent extends BaseSourceContent {
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
 * Interface representing a source mention within the editor
 */
declare interface Mention {
    /** Unique identifier for the mention */
    id: string;
    /** Display name of the mentioned source */
    name: string;
    /** The full source object being referenced */
    source: RetrievalResult;
}

/**
 * Represents a single message in a conversation between a user and an assistant.
 *
 * @interface Message
 * @property {("user" | "assistant")} role - The role of the message sender.
 * @property {string} content - The actual text content of the message.
 */
export declare interface Message {
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

declare type ParsePDFFn = (arrayBuffer: ArrayBuffer, source: SourceReference) => PDFSourceContent;

declare type ParseTextFn = (text: string, source: SourceReference) => HTMLSourceContent | MarkdownSourceContent;

/**
 * Partial theme interface that allows for partial overrides of the main theme configuration.
 *
 * @interface PartialTheme
 * @property {Partial<Colors>} colors - Partial color palette configuration for the application.
 * @property {Partial<Typography>} typography - Partial typography settings for consistent text rendering.
 * @property {Partial<ComponentDefaults>} componentDefaults - Partial component defaults for consistent styling.
 */
export declare interface PartialTheme {
    colors: Partial<Colors>;
    typography: Partial<Typography>;
    componentDefaults: Partial<ComponentDefaults>;
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
export declare interface PDFHighlight {
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
 * Represents PDF source content.
 *
 * @interface PDFSourceContent
 * @extends {BaseSourceContent}
 * @property {Uint8Array} content - The binary PDF content
 * @property {'pdf'} type - Must be "pdf". Indicates this is PDF content.
 * @property {PDFHighlight[]} [highlights] - Optional array of highlights in the PDF
 *
 * @todo This type will change due to upcoming changes in how to define the page number for PDF content.
 */
export declare interface PDFSourceContent extends BaseSourceContent {
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
}

/**
 * A component for displaying PDF documents with advanced viewing controls.
 * Used in the ContentDisplay component to display PDF source content with highlight support.
 *
 * @component
 * @param {PdfViewerProps} props - The props for the PdfViewer
 * @returns {JSX.Element} A themed PDF viewer with navigation and zoom controls
 *
 * @remarks
 * Features include:
 * - Page navigation with keyboard shortcuts (Left/Right arrows, Space, Backspace)
 * - Zoom controls (Ctrl/Cmd + Up/Down)
 * - Page rotation (.)
 * - Support for highlight annotations
 * - Automatic page selection based on highlight density
 * - Mouse wheel zoom support
 *
 * Keyboard Shortcuts:
 * - Next Page: Right Arrow, Space
 * - Previous Page: Left Arrow, Backspace
 * - First Page: Home
 * - Last Page: End
 * - Zoom In: Ctrl/Cmd + Up
 * - Zoom Out: Ctrl/Cmd + Down
 * - Fit to View: Ctrl/Cmd + 0
 * - Rotate Page: .
 *
 * @example
 * ```tsx
 * <PdfViewer
 *   data={pdfBinaryData}
 *   highlights={[
 *     { page: 1, rect: { top: 0.1, left: 0.1, width: 0.2, height: 0.05 } }
 *   ]}
 *   page={1}
 *   styleOverrides={{
 *     contentBackground: '#ffffff',
 *     contentPadding: '20px'
 *   }}
 * />
 * ```
 *
 * @todo:
 *  - change / unify mechanism to select page based on highlights / page number
 *  - add support for text search
 */
export declare const PdfViewer: ({ data, highlights, page, styleOverrides }: PdfViewerProps) => JSX_2.Element;

/**
 * Props for the PdfViewer component.
 *
 * @interface PdfViewerProps
 * @property {Uint8Array} data - The binary PDF data to display
 * @property {any[]} [highlights] - Optional array of highlight annotations to display on the PDF
 * @property {number} [page] - Optional page number to display initially
 * @property {PdfViewerStyles} [styleOverrides] - Optional style overrides for customizing the viewer's appearance
 */
declare interface PdfViewerProps {
    data: Uint8Array;
    highlights?: any[];
    page?: number;
    styleOverrides?: PdfViewerStyles;
}

/**
 * Style configuration interface for the PdfViewer component.
 * Extends ViewerToolbarStyles to include additional styling options specific to PDF display.
 *
 * @interface PdfViewerStyles
 * @extends {ViewerToolbarStyles}
 * @property {string} [color] - Text color for the viewer
 * @property {string} [fontFamily] - Font family for text elements
 * @property {string} [contentBackground] - Background color of the PDF content area
 * @property {string} [contentPadding] - Padding around the PDF content
 */
declare interface PdfViewerStyles extends ViewerToolbarStyles {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    contentBackground?: string;
    contentPadding?: string;
    borderRadius?: string;
}

/**
 * The options for configuring our generate call.
 */
declare interface PromiseGenerateOptions {
    /**
     * The REST endpoint (URL) that returns a single response string.
     */
    endpoint: string;
    /**
     * (Optional) HTTP method to use for this request. Defaults to 'POST'.
     */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    /**
     * A function that builds the request body, only used if method != 'GET'.
     * By default, it includes { messages, sources }.
     */
    buildRequestBody?: (messages: Message[], sources: RetrievalResult[]) => any;
    /**
     * A function that parses the server's JSON response into a string (the chat response).
     */
    parseResponse: (data: any) => string | Promise<string>;
}

/**
 * The options for configuring our retrieveAndGenerate call.
 */
declare interface PromiseRetrieveAndGenerateOptions {
    /**
     * The REST endpoint (URL) that returns both sources and a response.
     */
    endpoint: string;
    /**
     * (Optional) HTTP method to use for this request. Defaults to 'POST'.
     */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    /**
     * A function that builds the request body, only used if method != 'GET'.
     * By default, it simply includes { messages }.
     */
    buildRequestBody?: (messages: Message[]) => any;
    /**
     * A function that parses the server's JSON response into:
     *  {
     *    sources: RetrievalResult[] | Promise<RetrievalResult[]>;
     *    response: string | Promise<string>;
     *  }
     */
    parseResponse: (data: any) => {
        sources: RetrievalResult[] | Promise<RetrievalResult[]>;
        response: string | Promise<string>;
    };
}

/**
 * --- Connector Options ---
 */
declare interface PromiseSourceContentConnectorOptions {
    /**
     * A function that, given a SourceReference, returns the URL and optional RequestInit for fetch.
     * Defaults to using the 'id' in source.metadata and building:
     *   http://localhost:8000/pdfs/<id>
     */
    buildFetchRequest?: BuildFetchRequestFn;
    /**
     * Parse an ArrayBuffer from PDF responses into a PDFSourceContent.
     */
    parsePDF?: ParsePDFFn;
    /**
     * Parse text responses into either HTML or Markdown content (or both).
     * We treat everything that isn't 'pdf' as text-based.
     */
    parseText?: ParseTextFn;
}

/**
 * A textarea-based input component for submitting queries with workflow status indication
 *
 * Features:
 * - Auto-expanding textarea
 * - Enter to submit (Shift+Enter for new line)
 * - Visual workflow status indicator
 * - Customizable styling
 * - Responsive design
 */
export declare const QueryField: default_2.FC<QueryFieldProps>;

/**
 * Props for the QueryField component
 */
declare interface QueryFieldProps {
    /**
     * Callback function triggered when a message is submitted
     * @param message The message text that was submitted
     */
    onSubmit: (message: string) => void;
    /**
     * Custom placeholder text for the input field
     * @default "Type a message..."
     */
    placeholder?: string;
    /**
     * Whether the input field is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Style overrides for the component
     */
    styleOverrides?: QueryFieldStyles;
}

/**
 * Styles interface for the QueryField component
 * @see {@link QueryField}
 */
declare interface QueryFieldStyles extends default_2.CSSProperties {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;
    fontSize?: string;
    borderColor?: string;
    borderRadius?: string;
    inputBackgroundColor?: string;
    inputBorderColor?: string;
    inputBorderRadius?: string;
    buttonBackground?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: string;
    modeInitColor?: string;
    modeFollowUpColor?: string;
    modeReRetrieveColor?: string;
    statusTextColor?: string;
}

export declare interface RAGConfig {
    timeouts?: {
        stream?: number;
        request?: number;
    };
}

/**
 * **RAGProvider** is a top-level context provider that:
 * - Initializes and provides a Jotai store containing state & atoms for Retrieve-And-Generate (RAG) operations.
 * - Wires up theme context, using either a custom theme or default theme.
 * - Supplies user-defined retrieval/generation logic to internal atoms.
 * - Optionally accepts a callback (`onAddMessage`) to modify the workflow mode on new messages.
 *
 * ```tsx
 * <RAGProvider
 *   retrieve={myRetrieveFn}
 *   generate={myGenerateFn}
 *   onAddMessage={(message, prev) => ({ type: 'follow-up' })}
 * >
 *   <MyRAGApp />
 * </RAGProvider>
 * ```
 */
export declare const RAGProvider: ({ children, retrieve, retrieveAndGenerate, generate, getDataSource, config, onAddMessage, theme }: RAGProviderProps) => JSX_2.Element;

export declare interface RAGProviderProps {
    children: React.ReactNode;
    retrieve?: (query: string, metadata?: Record<string, any>) => RetrieveResponse;
    retrieveAndGenerate?: (query: GenerateInput, metadata?: Record<string, any>) => RetrieveAndGenerateResponse;
    generate?: GenerateSimple | GenerateWithSources;
    getDataSource?: (source: SourceReference) => GetDataSourceResponse;
    config?: RAGConfig;
    onAddMessage?: (message: Message, previousMessages: Message[]) => RAGWorkflowActionOnAddMessage;
    theme?: Theme;
}

export declare type RAGWorkflowActionOnAddMessage = {
    type: 'follow-up';
} | {
    type: 'reretrieve';
    preserveHistory: boolean;
};

/**
 * Union type representing either a source reference or text content.
 *
 * @typedef {SourceReference | TextContent} RetrievalResult
 *
 * @remarks This is the type of objects returned by the retrieve function.
 */
export declare type RetrievalResult = SourceReference | TextContent;

/**
 * Represents the response from a retrieve and generate operation.
 *
 * @interface RetrieveAndGenerateResponse
 * @property {Promise<RetrievalResult[]>} [sources] - Optional promise resolving to an array of retrieval results.
 * @property {Promise<string> | AsyncIterable<GenerateStreamChunk>} response - The response, which can be either a promise resolving to a string or an async iterable of generate stream chunks.
 */
export declare interface RetrieveAndGenerateResponse {
    sources?: Promise<RetrievalResult[]>;
    response: Promise<string> | AsyncIterable<GenerateStreamChunk>;
}

/**
 * Type representing the response from a retrieve operation.
 *
 * @typedef {Promise<RetrievalResult[]>} RetrieveResponse
 *
 * @remarks The response is an array of RetrievalResult objects. These can be either SourceReference or TextContent objects.
 */
export declare type RetrieveResponse = Promise<RetrievalResult[]>;

/**
 * Union type of all possible source content types.
 *
 * @typedef {HTMLSourceContent | PDFSourceContent | MarkdownSourceContent} SourceContent
 *
 * @remarks This type is used in the ComponentDisplay component. The type of the content is determined by the type property of the object.
 */
export declare type SourceContent = HTMLSourceContent | PDFSourceContent | MarkdownSourceContent;

/**
 * Represents a reference to a source document.
 *
 * @interface SourceReference
 * @extends {BaseRetrievalResult}
 * @property {('pdf' | 'html' | 'markdown')} [type] - The type of the source document
 * @property {string} sourceReference - Reference identifier for the source
 */
export declare interface SourceReference extends BaseRetrievalResult {
    /**
     * The type of the source document. Can be either "pdf", "html", or "markdown".
     */
    type?: 'pdf' | 'html' | 'markdown';
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
}

/**
 * SourcesDisplay component shows a list of retrieved sources with search functionality
 *
 * ```tsx
 * <SourcesDisplay
 *   title="Search Results"
 *   searchPlaceholder="Search documents..."
 *   showSearch={true}
 *   showRelevanceScore={true}
 *   showMetadata={true}
 *   styleOverrides={{
 *     backgroundColor: '#f5f5f5',
 *     buttonBackground: '#0066cc',
 *     metadataTagBackground: '#e2e8f0'
 *   }}
 * />
 * ```
 */
export declare const SourcesDisplay: React.FC<SourcesDisplayProps>;

/**
 * Props for the SourcesDisplay component
 * @see {@link SourcesDisplay}
 */
declare interface SourcesDisplayProps {
    /**
     * The title displayed above the sources list
     * @default "Retrieved Sources"
     */
    title?: string;
    /**
     * Placeholder text for the search input field
     * @default "Search sources..."
     */
    searchPlaceholder?: string;
    /**
     * Controls visibility of the search functionality
     * @default true
     */
    showSearch?: boolean;
    /**
     * Controls visibility of relevance scores
     * @default true
     */
    showRelevanceScore?: boolean;
    /**
     * Controls visibility of metadata tags
     * @default true
     */
    showMetadata?: boolean;
    /**
     * Style customization options
     */
    styleOverrides?: SourcesDisplayStyles;
}

declare interface SourcesDisplayStyles extends React.CSSProperties {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;
    fontSize?: string;
    borderRadius?: string;
    inputBackgroundColor?: string;
    inputBorderColor?: string;
    buttonBackground?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: string;
    activeSourceBackground?: string;
    activeSourceBorderColor?: string;
    selectedSourceBackground?: string;
    selectedSourceBorderColor?: string;
    inactiveSourceBackground?: string;
    inactiveSourceBorderColor?: string;
    inputFocusRingColor?: string;
    metadataTagBackground?: string;
    metadataTagColor?: string;
    relevanceScoreColor?: string;
    sourceTypeBackground?: string;
    sourceTypeColor?: string;
}

/**
 * The options for configuring our SSE connector hook.
 */
declare interface SSEConnectorOptions {
    /**
     * The endpoint that returns SSEs. Usually a URL on your server.
     */
    endpoint: string;
    /**
     * (Optional) HTTP method to use for the request.
     * Defaults to 'POST'.
     */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    /**
     * (Optional) A function that builds the request body from
     * the array of messages and the optional metadata. Only used
     * if `method` != 'GET'.
     *
     * Default: it will create { query: lastMessage.content, metadata }
     */
    buildRequestBody?: (messages: Message[], metadata?: Record<string, any>) => any;
    /**
     * A user-defined function that takes the raw SSE message data (parsed from JSON)
     * and returns an `SSEParsedEvent` object (with optional `sources`, `content`, `done`).
     * If it returns neither `sources` nor `content`, the message is ignored.
     */
    parseEvent(data: any): SSEParsedEvent;
}

/**
 * The options for configuring our SSE generate hook.
 */
declare interface SSEGenerateConnectorOptions {
    /**
     * The endpoint that returns SSE events.
     */
    endpoint: string;
    /**
     * (Optional) HTTP method to use for this request. Defaults to 'POST'.
     */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    /**
     * (Optional) A function that builds the request body (only used if method != 'GET').
     * By default, it uses the last user message as `query` and includes `sources`.
     */
    buildRequestBody?: (messages: Message[], sources?: RetrievalResult[]) => any;
    /**
     * A user-defined function that takes SSE message data (parsed from JSON)
     * and returns an SSEParsedGenerateEvent (with optional `content`, `done`).
     * If it returns neither `content` nor `done`, the event is ignored.
     */
    parseEvent(data: any): SSEParsedGenerateEvent;
}

/**
 * This is the shape of the object returned by your `parseEvent`.
 *  - If `sources` is an array, we treat it as a "sources" event.
 *  - If `content` is a string, we treat it as a "chunk" event.
 *  - If neither is present, we ignore the message.
 *
 * If `done` is `true`, we mark the stream as finished.
 */
declare interface SSEParsedEvent {
    sources?: RetrievalResult[];
    content?: string;
    done?: boolean;
}

/**
 * The shape returned by `parseEvent(data)`.
 */
declare interface SSEParsedGenerateEvent {
    /**
     * If present, a chunk of text to yield in the streaming response.
     */
    content?: string;
    /**
     * If true, the stream ends immediately after this chunk.
     */
    done?: boolean;
}

/**
 * Represents extracted text content from a source.
 *
 * @interface TextContent
 * @extends {BaseRetrievalResult}
 * @property {string} text - The content of the RetrievalResult. If you are using the ComponentDisplay component, the text will be displayed with the **MarkdownViewer** component.
 */
export declare interface TextContent extends BaseRetrievalResult {
    /**
     * The content of the RetrievalResult. If you are using the ComponentDisplay component, the text will be displayed with the **MarkdownViewer** component.
     */
    text: string;
}

/**
 * Main theme interface that combines all theme-related configurations.
 * Used to provide consistent styling throughout the application via ThemeProvider.
 *
 * @interface Theme
 * @property {Colors} colors - Color palette configuration for the application.
 * @property {Typography} typography - Typography settings for consistent text rendering.
 * @property {ComponentDefaults} componentDefaults - Component defaults for consistent styling.
 *
 * @remarks
 * The theme is provided to the application via the RAGProvider component, which wraps the entire application.
 *
 * @example
 * ```tsx
 * import { defaultTheme, RAGProvider } from 'lexio';
 *
 * ... your code here ...
 *
 * <RAGProvider theme={defaultTheme}>
 *     ... your app components ...
 * <RAGProvider />
 * ```
 */
export declare interface Theme {
    colors: Colors;
    typography: Typography;
    componentDefaults: ComponentDefaults;
}

/**
 * Defines the typography settings used throughout the application.
 * Controls the font family, base size, and line height for consistent text rendering.
 *
 * @interface Typography
 * @property {string} fontFamily - Main font family stack for the application. The font should be imported in the global styles.
 * @property {string} fontSizeBase - Base font size from which other sizes are calculated.
 * @property {string} lineHeight - Default line height for optimal readability
 */
export declare interface Typography {
    fontFamily: string;
    /* Excluded from this release type: fontSizeBase */
    lineHeight: string;
}

export declare const useRAGMessages: () => {
    addMessage: (message: Message) => Promise<void>;
    messages: Message[];
    currentStream: Message | null;
};

export declare const useRAGSources: () => {
    sources: RetrievalResult_2[];
    currentSources: RetrievalResult_2[];
    currentSourceContent: SourceContent_2 | null;
    activeSourceIndex: number | null;
    currentSourceIndices: number[];
    setActiveSourceIndex: (index: number) => void;
    setCurrentSourceIndices: (indices: number[]) => void;
    retrieveSources: (query: string, metadata?: Record<string, any>) => Promise<RetrievalResult_2[]>;
};

export declare const useRAGStatus: () => {
    workflowMode: WorkflowMode_2;
    loading: boolean;
    error: string | null;
};

/**
 * --- The Hook ---
 * Returns a function that RAGProvider can use as getDataSource={...}.
 */
export declare function useRestContentSource(options?: PromiseSourceContentConnectorOptions): (source: SourceReference) => Promise<SourceContent>;

/**
 * A React hook returning the generate function suitable for <RAGProvider generate={...}>.
 */
export declare function useRESTGenerateSource(options: PromiseGenerateOptions): (messages: Message[], sources: RetrievalResult[]) => Promise<string>;

/**
 * A React hook returning the retrieveAndGenerate function suitable for <RAGProvider retrieveAndGenerate={...}>.
 */
export declare function useRESTRetrieveAndGenerateSource(options: PromiseRetrieveAndGenerateOptions): (messages: Message[]) => {
    sources: Promise<RetrievalResult[]>;
    response: Promise<string>;
};

/**
 * A React hook returning a function suitable for <RAGProvider generate={...}>.
 *
 * The returned function, when called with (messages, sources?):
 *  1) Constructs an SSE request to `options.endpoint`.
 *  2) For each SSE message, calls `parseEvent(data)`:
 *     * If `parsed.content` is present => yield a streaming chunk
 *     * If `parsed.done` is true => mark the stream finished
 *  3) Returns an `AsyncIterable<GenerateStreamChunk>`
 */
export declare function useSSEGenerateSource(options: SSEGenerateConnectorOptions): (messages: Message[], sources?: RetrievalResult[]) => AsyncIterable<GenerateStreamChunk>;

/**
 * A React hook returning a function you can pass to <RAGProvider retrieveAndGenerate={...}> or call directly.
 *
 * The returned function, when called with (messages, metadata):
 *  1) Constructs a request (method, body) to `options.endpoint`.
 *  2) Opens an SSE stream to that endpoint.
 *  3) For each event, calls `parseEvent(data)`:
 *     - If `parsed.sources` is present => resolves the "sources" promise
 *     - If `parsed.content` is present => yields a streaming "chunk"
 *     - If `parsed.done` is true => mark the stream finished
 *     - Otherwise => ignore the message
 *  4) Returns { sources: Promise<RetrievalResult[]>, response: AsyncIterable<GenerateStreamChunk> }
 *
 * NOTE: If `parseEvent` changes every render, the returned function changes too.
 *       You can memoize `parseEvent` for performance.
 */
export declare function useSSERetrieveAndGenerateSource(options: SSEConnectorOptions): (messages: Message[], metadata?: Record<string, any>) => RetrieveAndGenerateResponse;

declare interface ViewerToolbarStyles extends React.CSSProperties {
    fontFamily?: string;
    fontSize?: string;
    toolbarBorderRadius?: string;
    toolbarTextColor?: string;
    toolbarBackground?: string;
    toolbarSecondaryBackground?: string;
    toolbarButtonBackground?: string;
    toolbarButtonColor?: string;
    toolbarButtonBorderRadius?: string;
    toolbarBoxShadow?: string;
    toolbarChipBackground?: string;
    toolbarChipBorderRadius?: string;
    toolbarChipInputBackground?: string;
}

export declare type WorkflowMode = 'init' | 'follow-up' | 'reretrieve';

export { }
