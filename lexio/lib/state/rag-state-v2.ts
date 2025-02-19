import {atom} from 'jotai'

// ---- central state management types -----
export type Component =
    | 'RAGProvider'
    | 'QueryField'
    | 'ChatWindow'
    | 'SourcesDisplay'
    | 'AdvancedQueryField'
    | `QueryField-${string}`
    | `ChatWindow-${string}`
    | `SourcesDisplay-${string}`
    | `AdvancedQueryField-${string}`

// Flow: action in component -> triggers wrapped user function with state props -> triggers dispatch -> manipulates state
export type UserAction =
    | { type: 'ADD_USER_MESSAGE', message: string, source: Component } // User message
    | { type: 'SET_ACTIVE_MESSAGE', messageId: string, source: Component } // Set active message -> can be used to rollback to a previous message
    | { type: 'CLEAR_MESSAGES', source: Component } // Clear all messages in the chat
    | { type: 'SEARCH_SOURCES', query: string, source: Component } // Search sources, retrieve function - triggered by SourceDisplay
    | { type: 'CLEAR_SOURCES', source: Component } // Clear all sources
    | { type: 'SET_ACTIVE_SOURCES', sourceIds: string[], source: Component } // Sets active sources
    | { type: 'SET_SELECTED_SOURCE', sourceId: string, source: Component } // Sets selected source -> viewers
    | { type: 'SET_FILTER_SOURCES', filter: any, source: Component } // todo: define filter object
    | { type: 'RESET_FILTER_SOURCES', source: Component }

interface AddUserMessageActionModifier {
    setUserMessage?: string
}

interface SetActiveMessageActionModifier {
    messageId: string
}

interface ClearMessagesActionModifier {

}

interface SearchSourcesActionModifier {

}

interface ClearSourcesActionModifier {

}

interface SetActiveSourcesActionModifier {
    activeSourceIds: string[]
}

interface SetSelectedSourceActionModifier {
    selectedSourceId: string | null
}

interface SetFilterSourcesActionModifier {

}

interface ResetFilterSourcesActionModifier {

}

const allowedModifiers: Record<UserAction['type'], object> = {
    ADD_USER_MESSAGE: {setUserMessage: ''},
    SET_ACTIVE_MESSAGE: {messageId: ''},
    CLEAR_MESSAGES: {},
    SEARCH_SOURCES: {},
    CLEAR_SOURCES: {},
    SET_ACTIVE_SOURCES: {activeSourceIds: []},
    SET_SELECTED_SOURCE: {selectedSourceId: ''},
    SET_FILTER_SOURCES: {},
    RESET_FILTER_SOURCES: {}
};

const allowedPayloadKeys: Record<UserAction['type'], string[]> = {
    ADD_USER_MESSAGE: ['response', 'message', 'messages', 'sources', 'actionOptions'],
    SET_ACTIVE_MESSAGE: ['messageId', 'actionOptions'],
    CLEAR_MESSAGES: ['actionOptions'],
    SEARCH_SOURCES: ['sources', 'actionOptions'],
    CLEAR_SOURCES: ['actionOptions'],
    SET_ACTIVE_SOURCES: ['sourceIds', 'actionOptions'],
    SET_SELECTED_SOURCE: ['sourceId', 'actionOptions'],
    SET_FILTER_SOURCES: ['filter', 'actionOptions'],
    RESET_FILTER_SOURCES: ['actionOptions']
};

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

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export interface Message {
    readonly id: UUID;  // todo: make sure this is unique -> validate changes
    role: "user" | "assistant";
    content: string;
}

export interface Source {
    readonly id: UUID;  // todo: make sure this is unique -> validate changes
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
}

// ---- central data atoms -----
export interface ProviderConfig {
    timeouts?: {
        stream?: number;  // Timeout between stream chunks in ms
        request?: number; // Overall request timeout in ms
    },
}

export const configAtom = atom<ProviderConfig>({
    timeouts: {
        stream: 2000,  // 2 seconds default
        request: 5000  // 5 seconds default
    }
});

// message, active message, messages, and stream
export const completedMessagesAtom = atom<Message[]>([]);
export const currentStreamAtom = atom<Message | null>(null);
export const activeMessageIdAtom = atom<string | null>(null);

export const activeMessageAtom = atom(
    (get) => {
        const activeMessageId = get(activeMessageIdAtom);
        const completedMessages = get(completedMessagesAtom);
        return activeMessageId ? completedMessages.find(message => message.id === activeMessageId) ?? null : null;
    }
);


// sources, active sources, selected source
export const retrievedSourcesAtom = atom<Source[]>([]);
export const activeSourcesIdsAtom = atom<string[]>([]);
export const selectedSourceIdAtom = atom<string | null>(null);

export const activeSourcesAtom = atom(
    (get) => {
        const retrievedSources = get(retrievedSourcesAtom);
        const activeIds = get(activeSourcesIdsAtom);
        return retrievedSources.filter(source => activeIds.includes(source.id));
    }
);

export const selectedSourceAtom = atom(
    (get) => {
        const retrievedSources = get(retrievedSourcesAtom);
        const selectedId = get(selectedSourceIdAtom);
        return selectedId ? retrievedSources.find(source => source.id === selectedId) ?? null : null;
    }
);

// loading state of system -> can be used to block other actions
export const loadingAtom = atom(false);

// error state of system -> can be used to block other actions
export const errorAtom = atom<string | null>(null);

// centralized error setter
export const setErrorAtom = atom(
    null, // read value not needed
    (_get, set, message: string) => {
        set(errorAtom, `${new Date().toISOString()}: ${message}`);
    }
);


// ---- ActionHandler Function types -----
// todo: replace with allowedModifiers
type UserActionModifier =
    AddUserMessageActionModifier
    | SetActiveMessageActionModifier
    | ClearMessagesActionModifier
    | SearchSourcesActionModifier
    | ClearSourcesActionModifier
    | SetActiveSourcesActionModifier
    | SetSelectedSourceActionModifier
    | SetFilterSourcesActionModifier
    | ResetFilterSourcesActionModifier

export type ActionHandlerResponse = {
    response?: Promise<string> | AsyncIterable<{ content: string, done?: boolean }>
    messages?: Promise<Message[]> | any,
    sources?: Promise<Source[]>,
    actionOptions?: {
        current?: UserActionModifier,
        followUp?: UserAction,
    }
}

export type ActionHandler = {
    component: Component;
    handler: (actionHandlerFunction: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: Source | null) => ActionHandlerResponse
}

// ---- handler registry -----
export const registeredActionHandlersAtom = atom<ActionHandler[]>([]);

// register a new action handler: handlers should be uniquely identified by component name + key
export const registerActionHandler = atom(null, (get, set, handler: ActionHandler) => {
    const existingHandlers = get(registeredActionHandlersAtom);
    const existingHandler = existingHandlers.find(h => h.component === handler.component);
    if (existingHandler) {
        throw new Error(`Handler for component ${handler.component} already registered`);
    }
    set(registeredActionHandlersAtom, [...get(registeredActionHandlersAtom), handler]);
})

// unregister an action handler
export const unregisterActionHandler = atom(null, (get, set, handler: ActionHandler) => {
    const existingHandlers = get(registeredActionHandlersAtom);
    const updatedHandlers = existingHandlers.filter(h => h.component !== handler.component);
    if (updatedHandlers.length === existingHandlers.length) {
        throw new Error(`Handler for component ${handler.component} not found`);
    }
    set(registeredActionHandlersAtom, updatedHandlers);
})


// ---- some dummy for crazy agent message manipulation -----
// todo: implement for agents later on
// @ts-ignore
class CrazyAgentMessageManipulator { 
    private readonly messages: Message[] = [];

    public addMessage(message: Message): void {
        this.messages.push(message);
    }
}

// ---- Action Atoms -----
// handling of user messages
const addUserMessageAtom = atom(
    null,
    (
        get,
        set,
        {
            message,
            response,
            messages,
            sources,
            addMessageModifier,
        }: {
            message: string;
            response?: Promise<string> | AsyncIterable<{ content: string; done?: boolean }>;
            messages?: Promise<Message[]>;
            sources?: Promise<Source[]>;
            addMessageModifier?: AddUserMessageActionModifier;
        }
    ) => {
        // Save previous state for rollback.
        const previousMessages = get(completedMessagesAtom);
        const previousSources = get(retrievedSourcesAtom);

        // Read configuration and create a common AbortController.
        const config = get(configAtom);
        const abortController = new AbortController();

        // handle user message modification
        if (addMessageModifier?.setUserMessage) {
            set(completedMessagesAtom, [...get(completedMessagesAtom), {
                id: crypto.randomUUID() as UUID,
                role: 'user',
                content: addMessageModifier.setUserMessage
            }]);
        } else {
            set(completedMessagesAtom, [...get(completedMessagesAtom), {
                id: crypto.randomUUID(),
                role: 'user',
                content: message
            }]);
        }

        // Process sources independently.
        const processSources = async () => {
            if (!sources) return; // if no sources are provided in action response, skip this step  
            const sourcesData: Source[] = await addTimeout(
                sources.then(srcs => srcs),
                config.timeouts?.request,
                'Sources request timeout exceeded',
                abortController.signal
            );
            
            // Add a UUID to each source if it's missing (or always assign a new UUID)
            const sourcesDataWithIds = sourcesData.map(source => ({
                ...source,
                id: source.id || (crypto.randomUUID() as UUID),
            }));

            // Update sources-related state.
            set(retrievedSourcesAtom, sourcesDataWithIds);
            set(activeSourcesIdsAtom, []);
            set(selectedSourceIdAtom, null);
            return sourcesDataWithIds;
        };

        // Process the user message or streaming response independently.
        const processMessage = async () => {
            if (response) {
                let accumulatedContent = '';
                if (Symbol.asyncIterator in response) {
                    // Streaming response: process each chunk with its own per-chunk timeout.
                    const streamTimeout = new StreamTimeout(config.timeouts?.stream);
                    for await (const chunk of response as AsyncIterable<{ content: string; done?: boolean }>) {
                        if (abortController.signal.aborted) break;
                        streamTimeout.check();
                        accumulatedContent += chunk.content;
                        // Provide immediate feedback as streaming chunks arrive.
                        set(currentStreamAtom, {
                            id: crypto.randomUUID(),
                            role: 'assistant',
                            content: accumulatedContent
                        });
                    }
                    // Finalize streaming: update the completed messages.
                    set(completedMessagesAtom, [
                        ...get(completedMessagesAtom),
                        {
                            id: crypto.randomUUID() as UUID,
                            role: 'assistant',
                            content: accumulatedContent
                        }
                    ]);
                    set(currentStreamAtom, null);
                    return accumulatedContent;
                } else {
                    // Non-streaming (single promise) response.
                    const messageData = await addTimeout(
                        response as Promise<string>,
                        config.timeouts?.request,
                        'Response timeout exceeded',
                        abortController.signal
                    );
                    set(completedMessagesAtom, [...get(completedMessagesAtom),
                        {
                            id: crypto.randomUUID() as UUID,
                            role: 'assistant',
                            content: messageData
                        } as Message
                    ]);
                    return messageData;
                }
            }
            if (messages) {
                throw new Error('Not implemented yet. Should serve more agentic use cases lateron.');
            }
        };

        // Execute sources and message processing concurrently.
        (async () => {
            // The concrete function manages its own loading state.
            set(loadingAtom, true);
            try {
                const results = await Promise.allSettled([processSources(), processMessage()]);
                const errors = results.filter(result => result.status === 'rejected');

                if (errors.length > 0) {
                    // Abort any remaining work and restore the previous state.
                    abortController.abort();
                    set(completedMessagesAtom, previousMessages);
                    set(retrievedSourcesAtom, previousSources);
                    set(currentStreamAtom, null);

                    // Aggregate error messages.
                    const errorMessages = errors
                        .map((e: PromiseRejectedResult) =>
                            e.reason instanceof Error ? e.reason.message : String(e.reason)
                        )
                        .join('; ');
                    throw new Error(errorMessages);
                }
            } catch (error) {
                // Notify about the error and propagate it.
                set(setErrorAtom, `Failed to process user message: ${error instanceof Error ? error.message : error}`);
                throw error;
            } finally {
                set(loadingAtom, false);
            }
        })().catch(err => {
            console.error('addUserMessageAtom error:', err);
        });
    }
);

// set active message
const setActiveMessageAtom = atom(null, (_get, set, {setActiveMessageModifier}: {
    setActiveMessageModifier?: SetActiveMessageActionModifier
}) => {
    set(activeMessageIdAtom, setActiveMessageModifier?.messageId ?? null);
});

// clear messages
const clearMessagesAtom = atom(null, (_get, set, {clearMessagesModifier}: {
    clearMessagesModifier?: ClearMessagesActionModifier
}) => {
    console.log('clearMessagesAtom', clearMessagesModifier);
    set(completedMessagesAtom, []);
});

// search sources
const searchSourcesAtom = atom(
    null,
    async (
        get,
        set,
        {query, sources, searchSourcesModifier}: {
            query: string,
            sources?: Promise<Source[]>;
            searchSourcesModifier?: SearchSourcesActionModifier
        }
    ) => {
        // todo: make use of query and searchSourcesModifier
        console.log('searchSourcesAtom', query, searchSourcesModifier);
        // Save previous state for rollback.
        const previousSources = get(retrievedSourcesAtom);

        // Retrieve timeout configuration.
        const config = get(configAtom);
        const abortController = new AbortController();

        // Set the loading state to block concurrent operations.
        set(loadingAtom, true);

        try {
            // If no sources promise is provided, skip updating and return early.
            if (!sources) {
                console.warn("No sources provided to searchSourcesAtom. Operation skipped.");
                return previousSources;
            }

            // Await the sources, applying the configured timeout.
            const timedSources = await addTimeout(
                sources,
                config.timeouts?.request,
                'Sources request timeout exceeded in searchSourcesAtom',
                abortController.signal
            );

            // If successful, update the retrieved sources.
            set(retrievedSourcesAtom, timedSources);

            // Optionally reset related state associated with sources.
            set(activeSourcesIdsAtom, []);
            set(selectedSourceIdAtom, null);

            return timedSources;
        } catch (error) {
            // Abort any further processing if an error occurs.
            abortController.abort();

            // Roll back to the previous state.
            set(retrievedSourcesAtom, previousSources);

            // Store the error message in the global error state.
            set(
                errorAtom,
                `Failed to search sources: ${error instanceof Error ? error.message : String(error)}`
            );

            // Propagate the error for any higher-level handling.
            throw error;
        } finally {
            // Clear loading state irrespective of outcome.
            set(loadingAtom, false);
        }
    }
);

// clear sources
const clearSourcesAtom = atom(null, (_get, set, {clearSourcesModifier}: {
    clearSourcesModifier?: ClearSourcesActionModifier
}) => {
    console.log('clearSourcesAtom', clearSourcesModifier);
    set(retrievedSourcesAtom, []);
    set(activeSourcesIdsAtom, []);
    set(selectedSourceIdAtom, null);
});

// set active sources
const setActiveSourcesAtom = atom(null, (_get, set, {sourceIds, setActiveSourcesModifier}: {
    sourceIds?: UUID[],
    setActiveSourcesModifier?: SetActiveSourcesActionModifier
}) => {
    const activeSourceIds = setActiveSourcesModifier?.activeSourceIds ?? sourceIds;
    if (activeSourceIds) {
        set(activeSourcesIdsAtom, activeSourceIds);
    }
});

// set selected source
const setSelectedSourceAtom = atom(null, (_get, set, {sourceId, setSelectedSourceModifier}: {
    sourceId?: UUID,
    setSelectedSourceModifier?: SetSelectedSourceActionModifier
}) => {
    const selectedSourceId = setSelectedSourceModifier?.selectedSourceId ?? sourceId;
    if (selectedSourceId) {
        set(selectedSourceIdAtom, selectedSourceId);
    }
});

// set filter sources
const setFilterSourcesAtom = atom(null, (_get, _set, {setFilterSourcesModifier}: {
    setFilterSourcesModifier?: SetFilterSourcesActionModifier
}) => {
    console.log('setFilterSourcesAtom', setFilterSourcesModifier);
    throw new Error('Not implemented yet');
});

// reset filter sources
const resetFilterSourcesAtom = atom(null, (_get, _set, {resetFilterSourcesModifier}: {
    resetFilterSourcesModifier?: ResetFilterSourcesActionModifier
}) => {
    console.log('resetFilterSourcesAtom', resetFilterSourcesModifier);
    throw new Error('Not implemented yet');
});


// ----- MAIN: central dispatch atom / function -----
export const dispatchAtom = atom(null, (get, set, action: UserAction, recursiveCall: boolean = false) => {
    // Exit if loading is already true
    if (!recursiveCall && get(loadingAtom)) return;

    // Set the global loading state immediately.
    if (!recursiveCall) {
        set(loadingAtom, true);
        set(errorAtom, null);
    }

    // Find the concrete handler based on the action source.  TODO -> remove this and only take main handler
    const handlers = get(registeredActionHandlersAtom);
    // const handler = handlers.find(h => h.component === action.source);
    const handler = handlers.find(h => h.component === 'RAGProvider');
    if (!handler) {
        console.warn(`Handler for component ${action.source} not found`);
        if (!recursiveCall) {
            set(loadingAtom, false);
        }
        return;
    }

    // Let the handler construct the concrete async tasks.
    const payload = handler.handler(
        action,
        get(completedMessagesAtom),
        get(retrievedSourcesAtom),
        get(activeSourcesAtom),
        get(selectedSourceAtom)
    );

    // Validate payload keys
    const allowedKeys = allowedPayloadKeys[action.type] || [];
    if (payload) {
        const extraKeys = Object.keys(payload).filter(key => !allowedKeys.includes(key));
        if (extraKeys.length > 0) {
            console.warn(
                `Handler for action "${action.type}" returned unused properties: ${extraKeys.join(', ')}`
            );
        }
    }

    // Validate modifiers
    const { actionOptions } = payload ?? {};
    if (actionOptions?.current) {
        const allowedModifierKeys = Object.keys(allowedModifiers[action.type] || {});
        const currentModifierKeys = Object.keys(actionOptions.current);
        const extraModifierKeys = currentModifierKeys.filter(key => !allowedModifierKeys.includes(key));
        
        if (extraModifierKeys.length > 0) {
            console.warn(
                `Handler for action "${action.type}" used invalid modifiers: ${extraModifierKeys.join(', ')}`
            );
        }
    }

    // Destructure with default to empty object if payload is undefined
    const { response, messages, sources } = payload ?? {};

    // Delegate to the concrete functionality.
    switch (action.type) {
        case 'ADD_USER_MESSAGE':
            const addMessageModifier = actionOptions?.current as AddUserMessageActionModifier;
            set(addUserMessageAtom, {
                message: action.message,
                response,
                messages,
                sources,
                addMessageModifier: addMessageModifier
            });
            break;
        case 'SET_ACTIVE_MESSAGE':
            const setActiveMessageModifier = actionOptions?.current as SetActiveMessageActionModifier;
            set(setActiveMessageAtom, {setActiveMessageModifier: setActiveMessageModifier});
            break;
        case 'CLEAR_MESSAGES':
            const clearMessagesModifier = actionOptions?.current as ClearMessagesActionModifier;
            set(clearMessagesAtom, {clearMessagesModifier: clearMessagesModifier});
            break;
        case 'SEARCH_SOURCES':
            const searchSourcesModifier = actionOptions?.current as SearchSourcesActionModifier;
            set(searchSourcesAtom, {query: action.query, sources, searchSourcesModifier: searchSourcesModifier});
            break;
        case 'CLEAR_SOURCES':
            const clearSourcesModifier = actionOptions?.current as ClearSourcesActionModifier;
            set(clearSourcesAtom, {clearSourcesModifier: clearSourcesModifier});
            break;
        case 'SET_ACTIVE_SOURCES':
            const setActiveSourcesModifier = actionOptions?.current as SetActiveSourcesActionModifier;
            set(setActiveSourcesAtom, {sourceIds: action.sourceIds as UUID[], setActiveSourcesModifier: setActiveSourcesModifier});
            break;
        case 'SET_SELECTED_SOURCE':
            const setSelectedSourceModifier = actionOptions?.current as SetSelectedSourceActionModifier;
            set(setSelectedSourceAtom, {sourceId: action.sourceId as UUID, setSelectedSourceModifier: setSelectedSourceModifier});
            break;
        case 'SET_FILTER_SOURCES':
            const setFilterSourcesModifier = actionOptions?.current as SetFilterSourcesActionModifier;
            set(setFilterSourcesAtom, {setFilterSourcesModifier: setFilterSourcesModifier});
            break;
        case 'RESET_FILTER_SOURCES':
            const resetFilterSourcesModifier = actionOptions?.current as ResetFilterSourcesActionModifier;
            set(resetFilterSourcesAtom, {resetFilterSourcesModifier: resetFilterSourcesModifier});
            break;



        // Other action types can be added here.
    }

    // Handle any follow-up actions.
    if (actionOptions?.followUp) {
        set(dispatchAtom, actionOptions.followUp, true);
    }

    // Clear the global loading state.
    if (!recursiveCall) {
        set(loadingAtom, false);
    }
});


// ---- helpers for handling stream timeout and stream abortion ----
const addTimeout = <T>(
    promise: Promise<T>,
    timeout?: number,
    message?: string,
    signal?: AbortSignal
): Promise<T> => {
    if (!timeout) return promise;

    return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(message));
            }, timeout);

            // Clean up timeout if aborted
            signal?.addEventListener('abort', () => {
                clearTimeout(timeoutId);
            });
        })
    ]);
};

// Helper classes/functions
class StreamTimeout {
    private lastCheck = Date.now();

    constructor(private timeout?: number) {
    }

    check() {
        if (!this.timeout) return;

        const now = Date.now();
        if (now - this.lastCheck > this.timeout) {
            throw new Error('Stream timeout exceeded');
        }
        this.lastCheck = now;
    }
}