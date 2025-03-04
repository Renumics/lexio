export interface RAGConfig {
  timeouts?: {
    stream?: number;  // Timeout between stream chunks in ms
    request?: number; // Overall request timeout in ms
  },
}
export interface Message {
    readonly id: UUID;
    role: "user" | "assistant";
    content: string;
}

export type MessageWithOptionalId = Partial<Pick<Message, 'id'>> & Omit<Message, 'id'>;

export interface Source {
    readonly id: UUID;
    title: string;
    type: "text" | "pdf" | "markdown" | "html";
    relevance?: number;
    data?: string | Uint8Array;
    /**
     * key convention to hide from display _key
     *
     * If type='pdf', you can set the 'page' and '_page' properties to specify the page number to display in the ContentDisplay component.
     */
    metadata?: Record<string, any> & {
        /**
       * The page number to display for PDF documents. Page numbers are 1-based.
       * @TJS-type integer
       * @minimum 1
       */
        page?: number;
        /**
       * Hidden from display. The page number to display for PDF documents. Page numbers are 1-based.
       * @TJS-type integer
       * @minimum 1
       */
        _page?: number;
    };
    /**
     * Highlight annotations in the PDF document. Only applicable for PDF sources.
     */
    highlights?: PDFHighlight[];
}// ---- central state management types -----
export type Component = 'LexioProvider' |
    'QueryField' |
    'ChatWindow' |
    'ContentDisplay' |
    'SourcesDisplay' |
    'AdvancedQueryField' |
    `QueryField-${string}` |
    `ChatWindow-${string}` |
    `ContentDisplay-${string}` |
    `SourcesDisplay-${string}` |
    `AdvancedQueryField-${string}`; // Flow: action in component -> triggers wrapped user function with state props -> triggers dispatch -> manipulates state

export type AddUserMessageAction = { 
  type: 'ADD_USER_MESSAGE'; 
  message: string; 
  source: Component; 
};

export type SetActiveMessageAction = { 
  type: 'SET_ACTIVE_MESSAGE'; 
  messageId: string; 
  source: Component; 
};

export type ClearMessagesAction = { 
  type: 'CLEAR_MESSAGES'; 
  source: Component; 
};

export type SearchSourcesAction = { 
  type: 'SEARCH_SOURCES'; 
  query: string; 
  source: Component; 
};

export type ClearSourcesAction = { 
  type: 'CLEAR_SOURCES'; 
  source: Component; 
};

export type SetActiveSourcesAction = { 
  type: 'SET_ACTIVE_SOURCES'; 
  sourceIds: string[]; 
  source: Component; 
};

export type SetSelectedSourceAction = { 
  type: 'SET_SELECTED_SOURCE'; 
  sourceId: string; 
  sourceObject?: Source; 
  source: Component; 
};

export type SetFilterSourcesAction = { 
  type: 'SET_FILTER_SOURCES'; 
  filter: any; // todo: define filter object
  source: Component; 
};

export type ResetFilterSourcesAction = { 
  type: 'RESET_FILTER_SOURCES'; 
  source: Component; 
};

export type UserAction = 
  | AddUserMessageAction       // User message
  | SetActiveMessageAction     // Set active message -> can be used to rollback to a previous message
  | ClearMessagesAction        // Clear all messages in the chat
  | SearchSourcesAction        // Search sources, retrieve function - triggered by SourceDisplay
  | ClearSourcesAction         // Clear all sources
  | SetActiveSourcesAction     // Sets active sources
  | SetSelectedSourceAction    // Sets selected source -> viewers
  | SetFilterSourcesAction     // Sets filter for sources
  | ResetFilterSourcesAction;  // Resets source filters

export interface AddUserMessageActionResponse {
    response?: Promise<string> | AsyncIterable<StreamChunk>;
    sources?: Promise<Source[]>;
    setUserMessage?: string;
    followUpAction?: UserAction;
}
export interface SetActiveMessageActionResponse {
    messageId?: string;
    followUpAction?: UserAction;
}
export interface ClearMessagesActionResponse {
    followUpAction?: UserAction;
}
export interface SearchSourcesActionResponse {
    sources?: Promise<Source[]>;
    followUpAction?: UserAction;
}
export interface ClearSourcesActionResponse {
    followUpAction?: UserAction;
}
export interface SetActiveSourcesActionResponse {
    activeSourceIds?: string[];
    followUpAction?: UserAction;
}
export interface SetSelectedSourceActionResponse {
    selectedSourceId?: string | null;
    sourceData?: Promise<string | Uint8Array>;
    followUpAction?: UserAction;
}
export interface SetFilterSourcesActionResponse {
    followUpAction?: UserAction;
}
export interface ResetFilterSourcesActionResponse {
    followUpAction?: UserAction;
}
export type UUID = `${string}-${string}-${string}-${string}-${string}`;
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
// ---- central data atoms -----

export interface ProviderConfig {
    timeouts?: {
        stream?: number; // Timeout between stream chunks in ms
        request?: number; // Overall request timeout in ms
    };
}
// ---- ActionHandler Function types -----
export type ActionHandlerResponse =
    AddUserMessageActionResponse |
    SetActiveMessageActionResponse |
    ClearMessagesActionResponse |
    SearchSourcesActionResponse |
    ClearSourcesActionResponse |
    SetActiveSourcesActionResponse |
    SetSelectedSourceActionResponse |
    SetFilterSourcesActionResponse |
    ResetFilterSourcesActionResponse;

export type ActionHandler = {
    component: Component;
    handler: (
        actionHandlerFunction: UserAction,
        messages: Message[],
        sources: Source[],
        activeSources: Source[],
        selectedSource: Source | null
    ) => ActionHandlerResponse | Promise<ActionHandlerResponse> | undefined | Promise<undefined>;
};

export type StreamChunk = { content?: string; sources?: Source[]; done?: boolean; };
