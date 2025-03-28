import { atom } from 'jotai'
import { ActionHandler, AddUserMessageAction, AddUserMessageActionResponse, Citation, ClearMessagesAction, ClearMessagesActionResponse, ClearSourcesAction, ClearSourcesActionResponse, ProviderConfig, ResetFilterSourcesAction, ResetFilterSourcesActionResponse, SearchSourcesAction, SearchSourcesActionResponse, SetActiveMessageAction, SetActiveMessageActionResponse, SetActiveSourcesAction, SetActiveSourcesActionResponse, SetFilterSourcesAction, SetFilterSourcesActionResponse, SetMessageFeedbackAction, SetMessageFeedbackActionResponse, SetSelectedSourceAction, SetSelectedSourceActionResponse, StreamChunk, UserAction, UUID } from "../types";
import { Message, Source } from '../types';


const allowedActionReturnValues: Record<UserAction['type'], string[]> = {
    ADD_USER_MESSAGE: ['response', 'sources', 'setUserMessage', 'followUpAction'],
    SET_ACTIVE_MESSAGE: ['followUpAction'],
    CLEAR_MESSAGES: ['followUpAction'],
    SEARCH_SOURCES: ['sources', 'followUpAction'],
    CLEAR_SOURCES: ['followUpAction'],
    SET_ACTIVE_SOURCES: ['followUpAction'],
    SET_SELECTED_SOURCE: ['sourceData', 'followUpAction'],
    SET_FILTER_SOURCES: ['followUpAction'],
    RESET_FILTER_SOURCES: ['followUpAction'],
    SET_MESSAGE_FEEDBACK: ['followUpAction']
};

export const configAtom = atom<ProviderConfig>({
    timeouts: {
        stream: 2000,  // 2 seconds default
        request: 5000  // 5 seconds default
    }
});

// Create a base atom with _ prefix to store raw messages
export const _completedMessagesAtom = atom<Message[]>([]);

// Create a derived atom that enhances messages with citation information
export const completedMessagesAtom = atom(
  (get) => {
    const baseMessages = get(_completedMessagesAtom);
    const allCitations = get(citationsAtom);
    
    // Return messages with citations information added
    return baseMessages.map(message => {
      // Find citations for this message
      const messageCitations = allCitations.filter(
        citation => citation.messageId === message.id
      );
      
      // If no citations for this message, return the message as is
      if (messageCitations.length === 0) {
        return message;
      }
      
      // Extract message highlights from citations
      const messageHighlights = messageCitations.map(
        citation => ({
          ...citation.messageHighlight,
          citationId: citation.id
        })
      );
      
      // Return enhanced message with highlights and citations
      return {
        ...message,
        highlights: messageHighlights,
      };
    });
  }
);

// message, active message, messages, and stream
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
export const _retrievedSourcesAtom = atom<Source[]>([]);
export const retrievedSourcesAtom = atom(
  (get) => {
    const baseSources = get(_retrievedSourcesAtom);
    const allCitations = get(citationsAtom);
    
    // Return sources with citation highlights added
    return baseSources.map(source => {
      // Find citations for this source
      const sourceCitations = allCitations.filter(
        citation => 'sourceId' in citation && citation.sourceId === source.id
      );
      
      // If no citations for this source, return the source as is
      if (sourceCitations.length === 0) {
        return source;
      }
      
      // Extract source highlights from citations
      const sourceHighlights = sourceCitations.map(
        citation => citation.sourceHighlight
      );
      
      // Return enhanced source with highlights from citations
      return {
        ...source,
        highlights: [...(source.highlights || []), ...sourceHighlights]
      };
    });
  }
);

export const activeSourcesIdsAtom = atom<string[] | null>(null);
export const selectedSourceIdAtom = atom<string | null>(null);

export const activeSourcesAtom = atom(
    (get) => {
        const retrievedSources = get(retrievedSourcesAtom);
        const activeIds = get(activeSourcesIdsAtom);

        // If activeIds is null, return null
        if (activeIds === null) {
            return null;
        }

        // Otherwise filter sources to only include those with IDs in the activeIds array
        return retrievedSources.filter(source => activeIds.includes(source.id));
    }
);

export const selectedSourceAtom = atom(
    (get) => {
        const retrievedSources = get(retrievedSourcesAtom);
        console.log('retrievedSourcesAtom:', retrievedSources);
        const selectedId = get(selectedSourceIdAtom);
        const selectedSource = selectedId ? retrievedSources.find(source => source.id === selectedId) ?? null : null;
        console.log('selectedSourceAtom:', selectedSource);
        return selectedSource;
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
export const addUserMessageAtom = atom(
    null,
    async (
        get,
        set,
        {
            action,
            response
        }: {
            action: AddUserMessageAction,
            response: AddUserMessageActionResponse
        }
    ) => {
        console.log('addUserMessageAtom', action, response);
        // Save previous state for rollback.
        const previousMessages = get(_completedMessagesAtom);
        const previousSources = get(_retrievedSourcesAtom);
        const previousCitations = get(citationsAtom);

        // Read configuration and create a common AbortController.
        const config = get(configAtom);
        const abortController = new AbortController();

        // Handle user message modification.
        if (response.setUserMessage) {
            set(_completedMessagesAtom, [
                ...get(_completedMessagesAtom),
                {
                    id: crypto.randomUUID() as UUID,
                    role: 'user',
                    content: response.setUserMessage,
                },
            ]);
        } else {
            set(_completedMessagesAtom, [
                ...get(_completedMessagesAtom),
                {
                    id: crypto.randomUUID(),
                    role: 'user',
                    content: action.message,
                },
            ]);
        }

        // Process sources independently.
        const processSources = async () => {
            if (!response.sources) return; // Skip if no sources provided.
            const sourcesData = await addTimeout(
                response.sources.then(srcs => srcs),
                config.timeouts?.request,
                'Sources request timeout exceeded',
                abortController.signal
            );

            // Add a UUID to each source if it's missing.
            const sourcesDataWithIds = sourcesData.map(source => {
                // Check if 'id' exists on the source object
                if ('id' in source && source.id) {
                    return source;
                } else {
                    // If no id, create a new object with an id
                    return {
                        ...source,
                        id: crypto.randomUUID() as UUID,
                    };
                }
            });

            // Update sources-related state.
            set(_retrievedSourcesAtom, sourcesDataWithIds);
            set(activeSourcesIdsAtom, null);
            set(selectedSourceIdAtom, null);
            return sourcesDataWithIds;
        };

        // Process the user message or streaming response independently.
        const processMessage = async () => {
            if (response.response) {
                let accumulatedContent = '';
                let messageId: UUID;
                
                if (Symbol.asyncIterator in response.response) {
                    // Create a single consistent ID for the entire streaming message
                    messageId = crypto.randomUUID() as UUID;

                    // Streaming response: process each chunk.
                    const streamTimeout = new StreamTimeout(config.timeouts?.stream);
                    for await (const chunk of response.response as AsyncIterable<StreamChunk>) {
                        if (abortController.signal.aborted) break;
                        streamTimeout.check();
                        accumulatedContent += chunk.content ?? '';
                        // Provide immediate feedback as streaming chunks arrive.
                        set(currentStreamAtom, {
                            id: messageId, // Use the same ID for all updates
                            role: 'assistant',
                            content: accumulatedContent,
                        });
                    }
                    // Finalize streaming.
                    set(_completedMessagesAtom, [
                        ...get(_completedMessagesAtom),
                        {
                            id: messageId, // Use the same ID for the final message
                            role: 'assistant',
                            content: accumulatedContent,
                        },
                    ]);
                    set(currentStreamAtom, null);
                    return { messageId, content: accumulatedContent };
                } else {
                    // Non-streaming (single promise) response.
                    const messageData = await addTimeout(
                        response.response as Promise<string>,
                        config.timeouts?.request,
                        'Response timeout exceeded',
                        abortController.signal
                    );
                    messageId = crypto.randomUUID() as UUID;
                    set(_completedMessagesAtom, [
                        ...get(_completedMessagesAtom),
                        {
                            id: messageId,
                            role: 'assistant',
                            content: messageData,
                        } as Message,
                    ]);
                    return { messageId, content: messageData };
                }
            }
        };

        // Process citations and store them in the citations atom
        const processCitations = async (messageId?: UUID) => {
            if (!response.citations) return; // Skip if no citations provided
            
            try {
                const citationsData = await addTimeout(
                    response.citations,
                    config.timeouts?.request,
                    'Citations request timeout exceeded',
                    abortController.signal
                );
                
                // Get current sources to resolve sourceIndex to sourceId if needed
                const currentSources = get(_retrievedSourcesAtom);
                
                // Add messageId and unique id to each citation, and resolve sourceIndex to sourceId if needed
                const enhancedCitations = citationsData.map(citation => {
                    // Create a new citation object with id and messageId
                    let enhancedCitation: Omit<Citation, 'sourceId' | 'sourceIndex'> & { sourceId?: string; sourceIndex?: number } = {
                        ...citation,
                        id: crypto.randomUUID() as UUID,
                        messageId: messageId
                    };
                    
                    // If citation has sourceIndex but no sourceId, resolve sourceIndex to sourceId
                    if ('sourceIndex' in citation && citation.sourceIndex !== undefined && 
                        (!('sourceId' in citation) || !citation.sourceId)) {
                        
                        // Check if sourceIndex is valid
                        if (citation.sourceIndex >= 0 && citation.sourceIndex < currentSources.length) {
                            const sourceId = currentSources[citation.sourceIndex].id;
                            
                            // Set sourceId and explicitly delete the sourceIndex property
                            enhancedCitation.sourceId = sourceId;
                            delete enhancedCitation.sourceIndex;
                        } else {
                            console.error(`Invalid sourceIndex: ${citation.sourceIndex}. Sources length: ${currentSources.length}`);
                            throw new Error(`Invalid sourceIndex: ${citation.sourceIndex}`);
                        }
                    }
                    
                    // If citation already has sourceId, ensure sourceIndex is removed
                    if ('sourceId' in citation && citation.sourceId) {
                        enhancedCitation.sourceId = citation.sourceId;
                        delete enhancedCitation.sourceIndex;
                    }
                    
                    // Final check - citation must have a sourceId at this point
                    if (!enhancedCitation.sourceId) {
                        console.error('Citation missing sourceId after processing:', citation);
                        throw new Error('Citation missing sourceId after processing');
                    }
                    
                    // Return as properly typed Citation (now that we've ensured it has sourceId and no sourceIndex)
                    return enhancedCitation as Citation;
                });
                
                // Store citations in the dedicated atom
                set(citationsAtom, [...get(citationsAtom), ...enhancedCitations]);
                
                return enhancedCitations;
            } catch (error) {
                console.error('Failed to process citations:', error);
                throw error;
            }
        };

        // --- The key elegant change: since this function is async, it automatically returns a promise.
        try {
            // Process sources and message in parallel
            const [sourcesResult, messageResult] = await Promise.all([
                processSources().catch(error => {
                    console.error('Error processing sources:', error);
                    return null;
                }),
                processMessage().catch(error => {
                    console.error('Error processing message:', error);
                    return null;
                })
            ]);

            // Process citations after message is processed (if we have a messageId)
            if (messageResult?.messageId && response.citations) {
                await processCitations(messageResult.messageId).catch(error => {
                    console.error('Error processing citations:', error);
                    return null;
                });
            }

            return { sourcesResult, messageResult };
        } catch (error) {
            // Abort remaining work and restore previous state.
            abortController.abort();
            set(_completedMessagesAtom, previousMessages);
            set(_retrievedSourcesAtom, previousSources);
            set(citationsAtom, previousCitations);
            set(currentStreamAtom, null);

            // Notify about the error and propagate it.
            set(setErrorAtom, `Failed to process user message: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
    }
);


// set active message
const setActiveMessageAtom = atom(null, (_get, set, { action, response }: {
    action: SetActiveMessageAction,
    response: SetActiveMessageActionResponse
}) => {
    console.log('setActiveMessageAtom', action, response);
    // Use response.messageId if provided, otherwise use action.messageId
    // If messageId is null or empty string, set to null
    const messageId = response.messageId ?? action.messageId;
    set(activeMessageIdAtom, !messageId ? null : messageId);
});

// clear messages
export const clearMessagesAtom = atom(
    null,
    (_get, set, { action, response }: { action: ClearMessagesAction, response: ClearMessagesActionResponse }) => {
        console.log('clearMessagesAtom', action, response);
        set(_completedMessagesAtom, []);
        set(currentStreamAtom, null);
        set(citationsAtom, []); // Clear citations when messages are cleared
    }
);

// search sources
const searchSourcesAtom = atom(
    null,
    async (
        get,
        set,
        { action, response }: {
            action: SearchSourcesAction,
            response: SearchSourcesActionResponse
        }
    ) => {
        console.log('searchSourcesAtom', action, response);
        // Save previous state for rollback.
        const previousSources = get(retrievedSourcesAtom);

        // Retrieve timeout configuration.
        const config = get(configAtom);
        const abortController = new AbortController();

        try {
            // Set loading state
            set(loadingAtom, true);

            // If no sources promise is provided, skip updating and return early.
            if (!response.sources) {
                console.warn("No sources provided to searchSourcesAtom. Operation skipped.");
                return previousSources;
            }

            // Await the sources, applying the configured timeout.
            const sourcesData = await addTimeout(
                response.sources,
                config.timeouts?.request,
                'Sources request timeout exceeded in searchSourcesAtom',
                abortController.signal
            );

            // Add a UUID to each source if it's missing.
            const sourcesDataWithIds = sourcesData.map(source => {
                // Check if 'id' exists on the source object
                if ('id' in source && source.id) {
                    return source;
                } else {
                    // If no id, create a new object with an id
                    return {
                        ...source,
                        id: crypto.randomUUID() as UUID,
                    };
                }
            });

            // If successful, update the retrieved sources.
            set(_retrievedSourcesAtom, sourcesDataWithIds);

            // Optionally reset related state associated with sources.
            set(activeSourcesIdsAtom, null);
            set(selectedSourceIdAtom, null);

            return sourcesDataWithIds;
        } catch (error) {
            // Abort any further processing if an error occurs.
            abortController.abort();

            // Roll back to the previous state.
            set(_retrievedSourcesAtom, previousSources);

            // Store the error message in the global error state.
            set(
                errorAtom,
                `Failed to search sources: ${error instanceof Error ? error.message : String(error)}`
            );

            // Propagate the error for any higher-level handling.
            throw error;
        } finally {
            // Always reset loading state
            set(loadingAtom, false);
        }
    }
);

// clear sources
const clearSourcesAtom = atom(null, (_get, set, { action, response }: {
    action: ClearSourcesAction,
    response: ClearSourcesActionResponse
}) => {
    console.log('clearSourcesAtom', action, response);
    set(_retrievedSourcesAtom, []);
    set(activeSourcesIdsAtom, null);
    set(selectedSourceIdAtom, null);
});

// set active sources
const setActiveSourcesAtom = atom(null, (_get, set, { action, response }: {
    action: SetActiveSourcesAction,
    response: SetActiveSourcesActionResponse
}) => {
    console.log('setActiveSourcesAtom', action, response);
    // Use response.activeSourceIds if provided, otherwise use action.sourceIds
    // Ensure we never set to null - empty array is used for reset
    const activeSourceIds = response.activeSourceIds ?? action.sourceIds;

    // Convert null to empty array to ensure we never set null directly
    set(activeSourcesIdsAtom, activeSourceIds === null ? [] : activeSourceIds);
});

// set selected source
const setSelectedSourceAtom = atom(null, async (get, set, { action, response }: {
    action: SetSelectedSourceAction,
    response: SetSelectedSourceActionResponse
}) => {
    console.log('setSelectedSourceAtom', action, response);

    if (action.sourceId === null || action.sourceId === '') {
        set(selectedSourceIdAtom, null);
        return;
    }

    // Use the base sources without citations
    const baseSources = get(_retrievedSourcesAtom);
    const targetSource = baseSources.find(source => source.id === action.sourceId);

    if (!targetSource) {
        console.warn(`Source with id ${action.sourceId} not found`);
        return;
    }

    set(selectedSourceIdAtom, action.sourceId);

    // Add page override if provided
    if (action.pdfPageOverride !== undefined) {
        const updatedSources = baseSources.map(source =>
            source.id === action.sourceId
                ? {
                    ...source,
                    metadata: {
                        ...(source.metadata || {}),
                        _pdfPageOverride: action.pdfPageOverride
                    }
                }
                : source
        );
        set(_retrievedSourcesAtom, updatedSources);
    }

    // Only validate and update data if sourceData is provided
    if (response.sourceData) {
        if (targetSource.data) {
            console.warn(`Source ${action.sourceId} already has data but new data was provided`);
            return;
        }

        try {
            const resolvedData = await response.sourceData;

            const updatedSources = baseSources.map(source =>
                source.id === action.sourceId
                    ? { ...source, data: resolvedData }
                    : source
            );
            set(_retrievedSourcesAtom, updatedSources);
        } catch (error) {
            console.error(`Failed to load data for source ${action.sourceId}:`, error);
            set(errorAtom, `Failed to load source data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
});

// set filter sources
const setFilterSourcesAtom = atom(null, (_get, _set, { action, response }: {
    action: SetFilterSourcesAction,
    response: SetFilterSourcesActionResponse
}) => {
    console.log('setFilterSourcesAtom', action, response);
    throw new Error('Not implemented yet');
});

// reset filter sources
const resetFilterSourcesAtom = atom(null, (_get, _set, { action, response }: {
    action: ResetFilterSourcesAction,
    response: ResetFilterSourcesActionResponse
}) => {
    console.log('resetFilterSourcesAtom', action, response);
    throw new Error('Not implemented yet');
});

const isBlockingAction = (action: UserAction): boolean => {
    switch (action.type) {
        // Example: these actions might trigger an async operation that we consider blocking
        case "ADD_USER_MESSAGE":
        case "SEARCH_SOURCES":
        case "CLEAR_MESSAGES":
            return true;

        // Example: these actions do small or UI-only state updates
        case "SET_SELECTED_SOURCE":
        case "SET_ACTIVE_SOURCES":
        case "SET_FILTER_SOURCES":
        case "RESET_FILTER_SOURCES":
            return false;

        // Provide a default
        default:
            return false;
    }
}


// ----- MAIN: central dispatch atom / function -----
export const dispatchAtom = atom(
    null,
    async (get, set, action: UserAction, recursiveCall: boolean = false) => {

        // ---- 2) If action is blocking, check if we're already busy
        if (!recursiveCall && isBlockingAction(action) && get(loadingAtom)) {
            set(setErrorAtom, "RAG Operation already in progress");
            return;
        }

        // ---- 3) If this is the top-level call and the action is blocking, mark loading
        if (!recursiveCall && isBlockingAction(action)) {
            set(loadingAtom, true);
            set(errorAtom, null); // clear any old error
        }

        try {
            // ---- Handler resolution (unchanged)
            const handlers = get(registeredActionHandlersAtom);
            const handler = handlers.find(h => h.component === 'LexioProvider');
            if (!handler) {
                console.warn(`Handler for component ${action.source} not found`);

                // If we turned on loading, we should turn it off before returning
                if (!recursiveCall && isBlockingAction(action)) {
                    set(loadingAtom, false);
                }
                return;
            }
            // ---- Fetch additional data for certain actions ---
            if (action.type === 'SET_SELECTED_SOURCE') {
                const source = get(retrievedSourcesAtom).find(source => source.id === action.sourceId);
                if (source) {
                    action.sourceObject = source;
                }
            }

            const retrievedSources = get(retrievedSourcesAtom);

            // const activeSourcesIds = get(activeSourcesIdsAtom);

            const activeSources = get(activeSourcesAtom);

            // ---- Call the handler
            const payload = await Promise.resolve(
                handler.handler(
                    action,
                    get(completedMessagesAtom),
                    retrievedSources,
                    activeSources,
                    get(selectedSourceAtom)
                )
            );

            // ---- Validate payload keys
            const allowedKeys = allowedActionReturnValues[action.type] || [];
            if (payload) {
                const extraKeys = Object.keys(payload).filter(key => !allowedKeys.includes(key));
                // we currently have no required keys, if we plan to add some in the future -> type guard is required -> throw error
                if (extraKeys.length > 0) {
                    console.warn(
                        `Handler for action "${action.type}" returned unused properties: ${extraKeys.join(', ')}`
                    );
                }
            }

            // ---- Collect all atom write operations
            const promises: Promise<any>[] = [];

            switch (action.type) {
                case 'ADD_USER_MESSAGE': {
                    const typedAction = action as AddUserMessageAction;
                    const typedResponse = payload as AddUserMessageActionResponse;
                    // set Atom returns either a value or a promise
                    const result = set(addUserMessageAtom, {
                        action: typedAction,
                        response: typedResponse,
                    });
                    // Promise.resolve is used to ensure that the result is a promise -> required for Promise.all
                    // This is not necessary if the result is already a promise but it allows sync and async ActionHandlerResponse values
                    promises.push(Promise.resolve(result));  // resolve(value) directly returns a promise
                    break;
                }
                case 'SET_ACTIVE_MESSAGE': {
                    const typedAction = action as SetActiveMessageAction;
                    const typedResponse = payload as SetActiveMessageActionResponse;
                    const result = set(setActiveMessageAtom, {
                        action: typedAction,
                        response: typedResponse,
                    });
                    promises.push(Promise.resolve(result));
                    break;
                }
                case 'CLEAR_MESSAGES': {
                    const typedAction = action as ClearMessagesAction;
                    const typedResponse = payload as ClearMessagesActionResponse;
                    const result = set(clearMessagesAtom, {
                        action: typedAction,
                        response: typedResponse,
                    });
                    promises.push(Promise.resolve(result));
                    break;
                }
                case 'SEARCH_SOURCES': {
                    const typedAction = action as SearchSourcesAction;
                    const typedResponse = payload as SearchSourcesActionResponse;
                    const result = set(searchSourcesAtom, {
                        action: typedAction,
                        response: typedResponse,
                    });
                    promises.push(Promise.resolve(result));
                    break;
                }
                case 'CLEAR_SOURCES': {
                    const typedAction = action as ClearSourcesAction;
                    const typedResponse = payload as ClearSourcesActionResponse;
                    const result = set(clearSourcesAtom, {
                        action: typedAction,
                        response: typedResponse,
                    });
                    promises.push(Promise.resolve(result));
                    break;
                }
                case 'SET_ACTIVE_SOURCES': {
                    const typedAction = action as SetActiveSourcesAction;
                    const typedResponse = payload as SetActiveSourcesActionResponse;
                    const result = set(setActiveSourcesAtom, {
                        action: typedAction,
                        response: typedResponse,
                    });
                    promises.push(Promise.resolve(result));
                    break;
                }
                case 'SET_SELECTED_SOURCE': {
                    const typedAction = action as SetSelectedSourceAction;
                    const typedResponse = payload as SetSelectedSourceActionResponse;
                    const result = set(setSelectedSourceAtom, {
                        action: typedAction,
                        response: typedResponse,
                    });
                    promises.push(Promise.resolve(result));
                    break;
                }
                case 'SET_FILTER_SOURCES': {
                    const typedAction = action as SetFilterSourcesAction;
                    const typedResponse = payload as SetFilterSourcesActionResponse;
                    const result = set(setFilterSourcesAtom, {
                        action: typedAction,
                        response: typedResponse,
                    });
                    promises.push(Promise.resolve(result));
                    break;
                }
                case 'RESET_FILTER_SOURCES': {
                    const typedAction = action as ResetFilterSourcesAction;
                    const typedResponse = payload as ResetFilterSourcesActionResponse;
                    const result = set(resetFilterSourcesAtom, {
                        action: typedAction,
                        response: typedResponse,
                    });
                    promises.push(Promise.resolve(result));
                    break;
                }
                case 'SET_MESSAGE_FEEDBACK': {
                    const typedAction = action as SetMessageFeedbackAction;
                    const typedResponse = payload as SetMessageFeedbackActionResponse;
                    const result = set(setMessageFeedbackAtom, {
                        action: typedAction,
                        response: typedResponse,
                    });
                    promises.push(Promise.resolve(result));
                    break;
                }
                default:
                    console.warn(`Unhandled action type: ${(action as any).type}`);
            }

            // ---- Process any follow-up action (recursive)
            if (payload && payload.followUpAction) {
                promises.push(Promise.resolve(set(dispatchAtom, payload.followUpAction, true)));
            }

            // ---- Wait for all writes
            await Promise.all(promises);

        } catch (error) {
            console.error("Error in dispatch async writes:", error);
            // Optionally set an error message
            set(setErrorAtom, `Dispatch failed: ${error instanceof Error ? error.message : String(error)}`);

        } finally {
            // ---- 4) If top-level and action was blocking, release the loading lock
            if (!recursiveCall && isBlockingAction(action)) {
                set(loadingAtom, false);
            }
        }
    }
);





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

// Add a simple handler for SET_MESSAGE_FEEDBACK action
const setMessageFeedbackAtom = atom(null, (_get, _set, { action, response }: {
    action: SetMessageFeedbackAction,
    response: SetMessageFeedbackActionResponse
}) => {
    console.log('setMessageFeedbackAtom', action, response);
    // This is just a pass-through handler that logs the action
    // The feedback is stored locally in the component's state
    // You could add API calls here if needed
});

// Add a dedicated atom for citations
export const citationsAtom = atom<Citation[]>([]);

// Add a helper atom to get citations for a specific message
export const getCitationsForMessageAtom = atom(
    (get) => (messageId: UUID) => {
        const allCitations = get(citationsAtom);
        return allCitations.filter(citation => citation.messageId === messageId);
    }
);