// ---- Data types -----
/**
 * Configuration options for the Lexio provider.
 * 
 * @interface ProviderConfig
 * @property {object} [timeouts] - Optional timeout configuration settings
 * @property {number} [timeouts.stream] - Timeout between stream chunks in milliseconds
 * @property {number} [timeouts.request] - Overall request timeout in milliseconds
 */
export interface ProviderConfig {
  timeouts?: {
    stream?: number; // Timeout between stream chunks in ms
    request?: number; // Overall request timeout in ms
  };
}

/**
 * A UUID string in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".
 * Used as unique identifiers for messages, sources, and other entities in the system.
 */
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

/**
 * Represents a highlight annotation in a PDF document.
 * Used to visually highlight text regions in PDF sources.
 *
 * @interface PDFHighlight
 * @property {number} page - The page number where the highlight appears (1-based)
 * @property {object} rect - The rectangle coordinates of the highlight
 * @property {number} rect.top - Top position of the highlight (relative to the page)
 * @property {number} rect.left - Left position of the highlight (relative to the page)
 * @property {number} rect.width - Width of the highlight (relative to the page width)
 * @property {number} rect.height - Height of the highlight (relative to the page height)
 * @property {string} highlightColorRgba - RGBA color string for the highlight (e.g., 'rgba(255, 255, 0, 0.3)')
 */
export interface PDFHighlight {
  /**
   * The page number where the highlight appears. Page numbers are 1-based.
   * @TJS-type integer
   * @minimum 1
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
  /**
   * RGBA color string for the highlight
   * @example 'rgba(255, 255, 0, 0.3)'
   */
  highlightColorRgba?: string;
}

/**
 * Represents a text segment to be highlighted in the assistant's message.
 * Used for visual emphasis in the displayed message.
 *
 * @interface MessageHighlight
 * @property {string} color - Color for the highlight in any valid CSS format
 * @property {string} [text] - The exact text to highlight
 * @property {number} [startChar] - Starting character position in the message
 * @property {number} [endChar] - Ending character position in the message
 */
export type MessageHighlight = {
  color: string;
  citationId?: UUID; // for passing citation Id to message display if necessary
} & (
    | { text: string; startChar?: never; endChar?: never } // either text or startChar/endChar, not both
    | { text?: never; startChar: number; endChar: number }
  );

/**
 * Links message highlights to their supporting evidence in source documents.
 * Used to connect highlighted message parts with their source evidence.
 *
 * @interface Citation
 * @property {MessageHighlight} messageHighlight - The message highlight this citation supports
 * @property {PDFHighlight} sourceHighlight - The highlight in the source document
 */
export type Citation = {
  readonly id: UUID;
  messageHighlight: MessageHighlight;
  sourceHighlight: PDFHighlight;
  messageId?: UUID; // for storing citation internally does nto have to be returned to the user
} & (
  | { sourceId: string; sourceIndex?: never } // either sourceId or sourceIndex, not both
  | { sourceId?: never; sourceIndex: number }
);

/**
 * Represents a chat message in the conversation.
 * 
 * @interface Message
 * @property {UUID} id - Unique identifier for the message. This is automatically generated by Lexio.
 * @property {"user" | "assistant"} role - Role of the message sender
 * @property {string} content - Text content of the message
 * @property {MessageHighlight[]} [highlights] - Highlights to highlight in assistant messages
 *                                         Only used for completed (non-streaming) messages
 */
export interface Message {
  readonly id: UUID;
  role: "user" | "assistant";
  content: string;
  highlights?: MessageHighlight[];  // renamed from ideas
}

/**
 * A Message type where the id property is optional.
 * Used when creating new messages where the id may be generated later.
 * This is useful when you need to create a message object before it's added to the state.
 */
export type MessageWithOptionalId = Partial<Pick<Message, 'id'>> & Omit<Message, 'id'>;

/**
 * Represents a source of information that can be displayed and referenced.
 * 
 * @interface Source
 * @property {UUID} id - Unique identifier for the source. This is automatically generated by Lexio.
 * @property {string} title - Title of the source displayed in the SourcesDisplay component
 * @property {"text" | "pdf" | "markdown" | "html"} type - Type of the source, determines how the source is displayed in the ContentDisplay component
 * @property {string} [description] - Optional description of the source displayed in SourcesDisplay
 * @property {number} [relevance] - Optional relevance score displayed as a bar in SourcesDisplay. Should be a value between 0 and 1.
 * @property {string} [href] - Optional link to the source
 * @property {string | Uint8Array} [data] - Optional content data of the source
 * @property {object} [metadata] - Optional metadata for the source
 * @property {PDFHighlight[]} [highlights] - Optional highlight annotations for PDF sources
 */
export interface Source {
  readonly id: UUID;
  /**
   * Title of the source displayed in the SourcesDisplay component.
   */
  title: string;
  /**
   * Type of the source, used to determine the type of data to display in the ContentDisplay component.
   */
  type: "text" | "pdf" | "markdown" | "html";
  /**
   * Description of the source displayed in the SourcesDisplay component if provided.
   */
  description?: string;
  /**
   * Relevance score of the source. It is displayed in the SourcesDisplay component as bar chart.
   * Should be a value between 0 and 1.
   * 
   * @minimum 0
   * @maximum 1
   */
  relevance?: number;
  /**
   * Optional href to display a link to the source in the SourcesDisplay component.
   */
  href?: string;
  /**
   * Optional data to display in the ContentDisplay component. This can be set initially
   * or lazily loaded when the `SET_SELECTED_SOURCE` action is handled. Simply return the data 
   * from your `onAction()` function as `sourceData\` in the response.
   * 
   * For PDF sources, this should be a Uint8Array containing the binary PDF data.
   * For text, markdown, and HTML sources, this should be a string.
   * 
   * @TJS-type [string, bytes]
   * @python-type Union[str, bytes]
   */
  data?: string | Uint8Array;
  /**
   * Optional metadata associated with the source.
   *
   * If type='pdf', you can set the 'page' and '_page' properties to specify the page number to display in the SourcesDisplay component.
   * Properties with a leading underscore (e.g., '_page') are hidden from display in the UI.
   *  
   * @remarks metadata is not used by the LexioProvider. It is shown as-is in the SourcesDisplay component. 
   * 
   * @TJS-type object
   * @python-type Dict[str, any]
   * @TJS-extra allow
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
   * These highlights will be visually displayed in the PDF viewer.
   */
  highlights?: PDFHighlight[];
}

// ---- central state management types -----
/**
 * Identifies a component in the Lexio system.
 * Can be a standard component or a custom component with an optional identifier suffix.
 * The suffix allows multiple instances of the same component type to be used in the application
 * while maintaining separate state and handlers.
 */
export type Component = 'LexioProvider' |
  'QueryField' |
  'ChatWindow' |
  'ContentDisplay' |
  'SourcesDisplay' |
  'AdvancedQueryField' |
  'MessageFeedback' |
  `QueryField-${string}` |
  `ChatWindow-${string}` |
  `ContentDisplay-${string}` |
  `SourcesDisplay-${string}` |
  `AdvancedQueryField-${string}` |
  `MessageFeedback-${string}` |
  `CustomComponent` |
  `CustomComponent-${string}`;

// Flow: action in component -> triggers wrapped user function with state props -> triggers dispatch -> manipulates state
/**
 * Action to add a user message to the chat.
 * This is typically triggered when a user submits a message in the QueryField component.
 * 
 * @property {string} type - The action type identifier
 * @property {string} message - The message content to add
 * @property {Component} source - The component that triggered the action
 */
export type AddUserMessageAction = {
  type: 'ADD_USER_MESSAGE';
  message: string;
  source: Component;
};

/**
 * Action to set a message as active in the chat.
 * 
 * @property {string} type - The action type identifier
 * @property {string} messageId - ID of the message to set as active
 * @property {Component} source - The component that triggered the action
 */
export type SetActiveMessageAction = {
  type: 'SET_ACTIVE_MESSAGE';
  messageId: string;
  source: Component;
};

/**
 * Action to clear all messages from the chat.
 * 
 * @property {string} type - The action type identifier
 * @property {Component} source - The component that triggered the action
 */
export type ClearMessagesAction = {
  type: 'CLEAR_MESSAGES';
  source: Component;
};

/**
 * Action to search for sources using a query.
 * 
 * @property {string} type - The action type identifier
 * @property {string} query - The search query
 * @property {Component} source - The component that triggered the action
 */
export type SearchSourcesAction = {
  type: 'SEARCH_SOURCES';
  query: string;
  source: Component;
};

/**
 * Action to clear all sources.
 * 
 * @property {string} type - The action type identifier
 * @property {Component} source - The component that triggered the action
 */
export type ClearSourcesAction = {
  type: 'CLEAR_SOURCES';
  source: Component;
};

/**
 * Action to set active sources by their IDs.
 * 
 * @property {string} type - The action type identifier
 * @property {string[]} sourceIds - Array of source IDs to set as active
 * @property {Component} source - The component that triggered the action
 */
export type SetActiveSourcesAction = {
  type: 'SET_ACTIVE_SOURCES';
  sourceIds: string[];
  source: Component;
};

/**
 * Action to set a selected source.
 * 
 * @property {string} type - The action type identifier
 * @property {string} sourceId - ID of the source to select
 * @property {Source} [sourceObject] - Optional source object to use
 * @property {Component} source - The component that triggered the action
 */
export type SetSelectedSourceAction = {
  type: 'SET_SELECTED_SOURCE';
  sourceId: string;
  sourceObject?: Source; // ToDo: this is filled in by the handler. the user uses sourceId, improbe typing for caller!
  pdfPageOverride?: number;
  source: Component;
};

/**
 * Action to set a filter for sources.
 * 
 * @property {string} type - The action type identifier
 * @property {any} filter - Filter criteria to apply
 * @property {Component} source - The component that triggered the action
 */
export type SetFilterSourcesAction = {
  type: 'SET_FILTER_SOURCES';
  filter: any; // todo: define filter object
  source: Component;
};

/**
 * Action to reset source filters.
 * 
 * @property {string} type - The action type identifier
 * @property {Component} source - The component that triggered the action
 */
export type ResetFilterSourcesAction = {
  type: 'RESET_FILTER_SOURCES';
  source: Component;
};

/**
 * Action to submit feedback for a message.
 * 
 * @property {string} type - The action type identifier
 * @property {string} messageId - ID of the message receiving feedback
 * @property {'positive' | 'negative' | null} feedback - The feedback type
 * @property {string} [comment] - Optional comment explaining the feedback
 * @property {string} [messageContent] - The content of the message receiving feedback (for convenience)
 * @property {Component} source - The component that triggered the action
 */
export type SetMessageFeedbackAction = {
  type: 'SET_MESSAGE_FEEDBACK';
  messageId: string;
  feedback: 'positive' | 'negative' | null;
  comment?: string;
  messageContent?: string;
  source: Component;
};

/**
 * Union type of all possible user actions in the system.
 */
export type UserAction =
  | AddUserMessageAction       // User message
  | SetActiveMessageAction     // Set active message -> can be used to rollback to a previous message
  | ClearMessagesAction        // Clear all messages in the chat
  | SearchSourcesAction        // Search sources, retrieve function - triggered by SourceDisplay
  | ClearSourcesAction         // Clear all sources
  | SetActiveSourcesAction     // Sets active sources
  | SetSelectedSourceAction    // Sets selected source -> viewers
  | SetFilterSourcesAction     // Sets filter for sources
  | ResetFilterSourcesAction   // Resets source filters
  | SetMessageFeedbackAction;  // Sets feedback for a message

// ---- UserActionResponse types -----
/**
 * Response for the ADD_USER_MESSAGE action.
 * 
 * To handle a NO-OP, return an empty object -> {}.
 * 
 * @interface AddUserMessageActionResponse
 * @property {Promise<string> | AsyncIterable<StreamChunk>} [response] - The assistant's response. Can be a Promise resolving to a string or an AsyncIterable for streaming responses.
 * @property {Promise<Source[]>} [sources] - Sources related to the message. These will be displayed in the SourcesDisplay component.
 * @property {Promise<Citation[]>} [citations] - Citations related to the message. These will be displayed in the SourcesDisplay component.
 * @property {string} [setUserMessage] - Updated user message. Can be used to modify the user's message before it's added to the chat.
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes. Useful for chaining actions.
 */
export interface AddUserMessageActionResponse {
  response?: Promise<string | StreamChunk> | AsyncIterable<StreamChunk>;
  sources?: Promise<Omit<Source, 'id'>[] | Source[]>; // id is generated here
  citations?: Promise<Citation[] | Omit<Citation, 'id'>[]>;
  setUserMessage?: string;
  followUpAction?: UserAction;
}

/**
 * Response for the SET_ACTIVE_MESSAGE action.
 * 
 * @interface SetActiveMessageActionResponse
 * @property {string} [messageId] - ID of the active message
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export interface SetActiveMessageActionResponse {
  messageId?: string;
  followUpAction?: UserAction;
}

/**
 * Response for the CLEAR_MESSAGES action.
 * 
 * @interface ClearMessagesActionResponse
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export interface ClearMessagesActionResponse {
  followUpAction?: UserAction;
}

/**
 * Response for the SEARCH_SOURCES action.
 * 
 * @interface SearchSourcesActionResponse
 * @property {Promise<Source[]>} [sources] - Sources found by the search
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export interface SearchSourcesActionResponse {
  sources?: Promise<Source[]>;
  followUpAction?: UserAction;
}

/**
 * Response for the CLEAR_SOURCES action.
 * 
 * @interface ClearSourcesActionResponse
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export interface ClearSourcesActionResponse {
  followUpAction?: UserAction;
}

/**
 * Response for the SET_ACTIVE_SOURCES action.
 * 
 * @interface SetActiveSourcesActionResponse
 * @property {string[]} [activeSourceIds] - IDs of the active sources
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export interface SetActiveSourcesActionResponse {
  activeSourceIds?: string[];
  followUpAction?: UserAction;
}

/**
 * Response for the SET_SELECTED_SOURCE action.
 * This response is used when a source is selected in the SourcesDisplay component.
 * 
 * @interface SetSelectedSourceActionResponse
 * @property {string | null} [selectedSourceId] - ID of the selected source. Set to null to deselect.
 * @property {Promise<string | Uint8Array>} [sourceData] - Data for the selected source. This will be displayed in the ContentDisplay component.
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export interface SetSelectedSourceActionResponse {
  selectedSourceId?: string | null;
  sourceData?: Promise<string | Uint8Array>;
  followUpAction?: UserAction;
}

/**
 * Response for the SET_FILTER_SOURCES action.
 * 
 * @interface SetFilterSourcesActionResponse
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export interface SetFilterSourcesActionResponse {
  followUpAction?: UserAction;
}

/**
 * Response for the RESET_FILTER_SOURCES action.
 * 
 * @interface ResetFilterSourcesActionResponse
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export interface ResetFilterSourcesActionResponse {
  followUpAction?: UserAction;
}

/**
 * Response for the SET_MESSAGE_FEEDBACK action.
 * 
 * @interface SetMessageFeedbackActionResponse
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export interface SetMessageFeedbackActionResponse {
  followUpAction?: UserAction;
}

/**
 * Union type of all possible action handler responses.
 */
export type ActionHandlerResponse =
  AddUserMessageActionResponse |
  SetActiveMessageActionResponse |
  ClearMessagesActionResponse |
  SearchSourcesActionResponse |
  ClearSourcesActionResponse |
  SetActiveSourcesActionResponse |
  SetSelectedSourceActionResponse |
  SetFilterSourcesActionResponse |
  ResetFilterSourcesActionResponse |
  SetMessageFeedbackActionResponse |
  undefined; // allow undefined responses for unhandled actions

/**
 * Defines an action handler for a specific component.
 * 
 * @interface ActionHandler
 * @property {Component} component - The component this handler is associated with
 * @property {Function} handler - Function that processes actions and returns responses
 */
export type ActionHandler = {
  component: Component;
  /**
   * Handler function that processes actions and returns responses.
   * 
   * @param {UserAction} actionHandlerFunction - The action to handle
   * @param {Message[]} messages - Current messages in the conversation
   * @param {Source[]} sources - Available sources
   * @param {Source[] | null} activeSources - Currently active sources, if any
   * @param {Source | null} selectedSource - Currently selected source, if any
   * @returns {ActionHandlerResponse | Promise<ActionHandlerResponse> | undefined | Promise<undefined>} - Response to the action
   */
  handler: (
    actionHandlerFunction: UserAction,
    messages: Message[],
    sources: Source[],
    activeSources: Source[] | null,
    selectedSource: Source | null
  ) => ActionHandlerResponse | Promise<ActionHandlerResponse> | undefined | Promise<undefined>;
};

/**
 * Represents a chunk of streamed content.
 * Used for streaming responses from the assistant in real-time.
 * 
 * @interface StreamChunk
 * @property {string} [content] - Text content in this chunk
 * @property {Source[]} [sources] - Sources related to this chunk that can be displayed alongside the content
 * @property {MessageHighlight[]} [highlights] - Highlights to highlight in the final message
 *                                         Only included in the final chunk (when done=true)
 * @property {boolean} [done] - Indicates if this is the final chunk in the stream
 *                             When true, highlights will be used for highlighting
 * @property {Citation[]} [citations] - Citations related to this chunk
 */
export interface StreamChunk {
  content?: string;
  sources?: Source[];
  citations?: Citation[] | Omit<Citation, 'id'>[];
  done?: boolean;
}
