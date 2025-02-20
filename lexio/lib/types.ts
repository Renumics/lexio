export interface RAGConfig {
  timeouts?: {
    stream?: number;  // Timeout between stream chunks in ms
    request?: number; // Overall request timeout in ms
  },
}
export interface Message {
    readonly id: UUID; // todo: make sure this is unique -> validate changes
    role: "user" | "assistant";
    content: string;
}

export interface Source {
    readonly id: UUID; // todo: make sure this is unique -> validate changes
    title: string;
    type: "text" | "pdf" | "markdown" | "html";
    relevance?: number;
    data?: string | Uint8Array | null;
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
export type Component = 'RAGProvider' |
    'QueryField' |
    'ChatWindow' |
    'SourcesDisplay' |
    'AdvancedQueryField' |
    `QueryField-${string}` |
    `ChatWindow-${string}` |
    `SourcesDisplay-${string}` |
    `AdvancedQueryField-${string}`; // Flow: action in component -> triggers wrapped user function with state props -> triggers dispatch -> manipulates state

export type UserAction = { type: 'ADD_USER_MESSAGE'; message: string; source: Component; } // User message
    |

{ type: 'SET_ACTIVE_MESSAGE'; messageId: string; source: Component; } // Set active message -> can be used to rollback to a previous message
    |

{ type: 'CLEAR_MESSAGES'; source: Component; } // Clear all messages in the chat
    |

{ type: 'SEARCH_SOURCES'; query: string; source: Component; } // Search sources, retrieve function - triggered by SourceDisplay
    |

{ type: 'CLEAR_SOURCES'; source: Component; } // Clear all sources
    |

{ type: 'SET_ACTIVE_SOURCES'; sourceIds: string[]; source: Component; } // Sets active sources
    |

{ type: 'SET_SELECTED_SOURCE'; sourceId: string; source: Component; } // Sets selected source -> viewers
    |

{ type: 'SET_FILTER_SOURCES'; filter: any; source: Component; } // todo: define filter object
    |

{ type: 'RESET_FILTER_SOURCES'; source: Component; };
export interface AddUserMessageActionModifier {
    setUserMessage?: string;
}
export interface SetActiveMessageActionModifier {
    messageId: string;
}
export interface ClearMessagesActionModifier {
}
export interface SearchSourcesActionModifier {
}
export interface ClearSourcesActionModifier {
}
export interface SetActiveSourcesActionModifier {
    activeSourceIds: string[];
}
export interface SetSelectedSourceActionModifier {
    selectedSourceId: string | null;
}
export interface SetFilterSourcesActionModifier {
}
export interface ResetFilterSourcesActionModifier {
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
// todo: replace with allowedModifiers
type UserActionModifier =
    AddUserMessageActionModifier |
    SetActiveMessageActionModifier |
    ClearMessagesActionModifier |
    SearchSourcesActionModifier |
    ClearSourcesActionModifier |
    SetActiveSourcesActionModifier |
    SetSelectedSourceActionModifier |
    SetFilterSourcesActionModifier |
    ResetFilterSourcesActionModifier;

export type ActionHandlerResponse = {
    response?: Promise<string> | AsyncIterable<{ content: string; done?: boolean; }>;
    messages?: Promise<Message[]> | any;
    sources?: Promise<Source[]>;
    actionOptions?: {
        current?: UserActionModifier;
        followUp?: UserAction;
    };
};

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

