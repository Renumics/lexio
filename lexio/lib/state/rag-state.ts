import { atom } from 'jotai'
import { ActionHandler, AddUserMessageAction, AddUserMessageActionResponse, Citation, ClearMessagesAction, ClearMessagesActionResponse, ClearSourcesAction, ClearSourcesActionResponse, ProviderConfig, ResetFilterSourcesAction, ResetFilterSourcesActionResponse, SearchSourcesAction, SearchSourcesActionResponse, SetActiveMessageAction, SetActiveMessageActionResponse, SetActiveSourcesAction, SetActiveSourcesActionResponse, SetFilterSourcesAction, SetFilterSourcesActionResponse, SetMessageFeedbackAction, SetMessageFeedbackActionResponse, SetSelectedSourceAction, SetSelectedSourceActionResponse, StreamChunk, UserAction, UUID } from "../types";
import { Message, Source } from '../types';


const allowedActionReturnValues: Record<UserAction['type'], string[]> = {
    ADD_USER_MESSAGE: ['response', 'sources', 'setUserMessage', 'setUserMessageId', 'setAssistantMessageId', 'followUpAction'],
    SET_ACTIVE_MESSAGE: ['messageId', 'followUpAction'],
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
        const selectedId = get(selectedSourceIdAtom);
        const selectedSource = selectedId ? retrievedSources.find(source => source.id === selectedId) ?? null : null;
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

        // todo: new
        let userMessageId = crypto.randomUUID() as UUID;
        let assistantMessageId = crypto.randomUUID() as UUID;

        // Handle user message modification.
        if (response.setUserMessage) {
            set(_completedMessagesAtom, [
                ...get(_completedMessagesAtom),
                {
                    id: userMessageId,
                    role: 'user',
                    content: response.setUserMessage,
                },
            ]);
        } else {
            set(_completedMessagesAtom, [
                ...get(_completedMessagesAtom),
                {
                    id: userMessageId,
                    role: 'user',
                    content: action.message,
                },
            ]);
        }

        // Process sources independently.
        const processSources = async () => {
            if (!response.sources) return; // Skip if no sources provided.
            try {
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
            } catch (error) {
                console.error("Error processing sources:", error);
                // Convert error to string before setting
                set(errorAtom, `Error processing sources: ${error instanceof Error ? error.message : String(error)}`);
                throw error;
            }
        };

        // Process the user message or streaming response independently.
        const processMessage = async () => {
            if (response.response) {
                let accumulatedContent = '';
                
                if (Symbol.asyncIterator in response.response) {
                    // Streaming response: process each chunk.
                    const streamTimeout = new StreamTimeout(config.timeouts?.stream);
                    for await (const chunk of response.response as AsyncIterable<StreamChunk>) {
                        if (abortController.signal.aborted) break;
                        streamTimeout.check();
                        accumulatedContent += chunk.content ?? '';
                        // Provide immediate feedback as streaming chunks arrive.
                        set(currentStreamAtom, {
                            id: assistantMessageId, // Use the same ID for all updates
                            role: 'assistant',
                            content: accumulatedContent,
                        });
                    }
                    // Finalize streaming.
                    set(_completedMessagesAtom, [
                        ...get(_completedMessagesAtom),
                        {
                            id: assistantMessageId, // Use the same ID for the final message
                            role: 'assistant',
                            content: accumulatedContent,
                        },
                    ]);
                    set(currentStreamAtom, null);
                    return { assistantMessageId, content: accumulatedContent };
                } else {
                    // Non-streaming (single promise) response.
                    const messageData = await addTimeout(
                        response.response as Promise<string>,
                        config.timeouts?.request,
                        'Response timeout exceeded',
                        abortController.signal
                    );

                    set(_completedMessagesAtom, [
                        ...get(_completedMessagesAtom),
                        {
                            id: assistantMessageId,
                            role: 'assistant',
                            content: messageData,
                        } as Message,
                    ]);
                    return { assistantMessageId, content: messageData };
                }
            }
        };

        // Process citations if they're part of the response
        const processCitations = async () => {
            if (!response.citations) return; // Skip if no citations provided
            
            try {
                // Get configuration for timeout
                const config = get(configAtom);
                const abortController = new AbortController();
                
                const citationsData = await addTimeout(
                    response.citations,
                    config.timeouts?.request,
                    'Citations request timeout exceeded',
                    abortController.signal
                );
                
                // Get the last message ID to use for citations
                const messages = get(_completedMessagesAtom);
                const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
                
                if (!lastMessageId) {
                    console.warn('Cannot process citations: no messages exist');
                    return;
                }
                
                // Get existing citations
                const existingCitations = get(citationsAtom);
                
                // Get sources to resolve sourceIndex to sourceId if needed
                const sources = get(_retrievedSourcesAtom);
                
                // Add unique id to each citation and resolve sourceIndex to sourceId if needed
                const enhancedCitations = citationsData.map(citation => {
                    // Handle sourceIndex if present
                    let sourceId = citation.sourceId;
                    if ('sourceIndex' in citation && citation.sourceIndex !== undefined) {
                        // Convert sourceIndex to sourceId
                        if (citation.sourceIndex >= 0 && citation.sourceIndex < sources.length) {
                            sourceId = sources[citation.sourceIndex].id;
                        } else {
                            console.warn(`Invalid sourceIndex: ${citation.sourceIndex}, sources length: ${sources.length}`);
                            return null; // Skip this citation
                        }
                    }
                    
                    // Skip if no valid sourceId could be determined
                    if (!sourceId) {
                        console.warn('Citation missing sourceId and has invalid sourceIndex');
                        return null;
                    }
                    
                    return {
                        ...citation,
                        id: crypto.randomUUID() as UUID,
                        sourceId: sourceId,
                        messageId: citation.messageId || lastMessageId // Use last message ID if not provided
                    } as Citation;
                }).filter(Boolean) as Citation[]; // Remove null entries
                
                // Store citations in the dedicated atom (append to existing)
                set(citationsAtom, [...existingCitations, ...enhancedCitations]);
                
                return enhancedCitations;
            } catch (error) {
                console.error('Failed to process citations:', error);
                throw error;
            }
        };

        // --- The key elegant change: since this function is async, it automatically returns a promise.
        try {
            // First, process sources and messages
            const [sourcesResult, messageResult] = await Promise.allSettled([
                processSources(),
                processMessage()
            ]);
            
            // Check if either process failed
            const initialErrors = [sourcesResult, messageResult].filter(result => result.status === 'rejected');
            
            if (initialErrors.length > 0) {
                // Get the first error
                const error = (initialErrors[0] as PromiseRejectedResult).reason;
                
                // Restore previous state
                set(_completedMessagesAtom, previousMessages);
                set(_retrievedSourcesAtom, previousSources);
                set(citationsAtom, previousCitations);
                
                // Set appropriate error message based on which process failed
                if (sourcesResult.status === 'rejected') {
                    set(errorAtom, `Error processing sources: ${error instanceof Error ? error.message : String(error)}`);
                } else {
                    set(errorAtom, `Error processing message: ${error instanceof Error ? error.message : String(error)}`);
                }
                
                throw error;
            }

            // todo: potentially wrap with addTimeout -> analogous to processCitations
            if (response.setUserMessageId) {
                const userMessageIdResolved = await response.setUserMessageId

                // set the user message id in the completed messages to the awaited value
                const currentMessages = get(_completedMessagesAtom);
                set(_completedMessagesAtom, currentMessages.map(message => {
                    if (message.id === userMessageId) {
                        return { ...message, id: userMessageIdResolved };
                    }
                    return message;
                }));
            }
            // todo;
            if (response.setAssistantMessageId) {
                const assistantMessageIdResolved = await response.setAssistantMessageId
                const currentMessages = get(_completedMessagesAtom);
                set(_completedMessagesAtom, currentMessages.map(message => {
                    if (message.id === assistantMessageId) {
                        return { ...message, id: assistantMessageIdResolved };  
                    }
                    return message;
                }));
            }
            
            // Now that sources and messages are processed, handle citations
            if (response.citations) {
                try {
                    // Process citations now that sources and messages are available
                    await processCitations();
                } catch (citationError) {
                    console.error('Error processing citations:', citationError);
                    // We don't need to roll back everything for citation errors
                    // Just set an error message
                    set(errorAtom, `Error processing citations: ${citationError instanceof Error ? citationError.message : String(citationError)}`);
                    // Don't throw here - we want to continue even if citations fail
                }
            }
            
            return { success: true };
        } catch (error) {
            console.error("Unexpected error:", error);
            // Restore previous state
            set(_completedMessagesAtom, previousMessages);
            set(_retrievedSourcesAtom, previousSources);
            set(citationsAtom, previousCitations);
            
            set(errorAtom, `Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
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

    // Save previous state for rollback if needed
    const previousSources = get(_retrievedSourcesAtom);
    const previousCitations = get(citationsAtom);
    
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

    // Process citations if provided
    const processCitations = async () => {
        if (!response.citations) return; // Skip if no citations provided
        
        try {
            // Get configuration for timeout
            const config = get(configAtom);
            const abortController = new AbortController();
            
            const citationsData = await addTimeout(
                response.citations,
                config.timeouts?.request,
                'Citations request timeout exceeded in setSelectedSourceAtom',
                abortController.signal
            );
            
            // Get the last message ID to use for citations without messageId
            const messages = get(_completedMessagesAtom);
            const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
            
            if (!lastMessageId && citationsData.some(citation => !citation.messageId)) {
                console.warn('Cannot process citations without messageId: no messages exist');
                return;
            }
            
            // Get existing citations to check for duplicates
            const existingCitations = get(citationsAtom);
            
            // Add sourceId and unique id to each citation
            const enhancedCitations = citationsData.map(citation => {
                // Start with a base citation object
                const baseCitation = {
                    ...citation,
                    id: crypto.randomUUID() as UUID,
                    sourceId: action.sourceId as string, // We know this is valid from checks above
                    messageId: citation.messageId || lastMessageId // Use last message ID if not provided
                };
                
                // All citations must have messageId, sourceId, and sourceHighlight
                return {
                    id: baseCitation.id,
                    sourceId: baseCitation.sourceId,
                    messageId: baseCitation.messageId,
                    messageHighlight: baseCitation.messageHighlight || {}, // Provide empty object if missing
                    sourceHighlight: baseCitation.sourceHighlight
                } as Citation;
            });
            
            // Filter out any citations that might be duplicates
            // A citation is considered a duplicate if it has the same sourceId, messageId, and sourceHighlight
            const newCitations = enhancedCitations.filter(newCitation => {
                return !existingCitations.some(existingCitation => 
                    existingCitation.sourceId === newCitation.sourceId &&
                    existingCitation.messageId === newCitation.messageId &&
                    JSON.stringify(existingCitation.sourceHighlight) === JSON.stringify(newCitation.sourceHighlight)
                );
            });
            
            if (newCitations.length !== enhancedCitations.length) {
                console.warn(`Filtered out ${enhancedCitations.length - newCitations.length} duplicate citations`);
            }
            
            // Store only new citations in the dedicated atom (append to existing)
            set(citationsAtom, [...existingCitations, ...newCitations]);
            
            return newCitations;
        } catch (error) {
            console.error('Failed to process citations for source:', error);
            throw error;
        }
    };

    // Process the source data if provided
    const processSourceData = async () => {
        // Only validate and update data if sourceData is provided
        if (!response.sourceData) return;
        
        if (targetSource.data) {
            console.warn(`Source ${action.sourceId} already has data but new data was provided`);
            return;
        }

        try {
            const config = get(configAtom);
            const abortController = new AbortController();
            
            const resolvedData = await addTimeout(
                response.sourceData,
                config.timeouts?.request,
                'Source data request timeout exceeded',
                abortController.signal
            );

            const updatedSources = baseSources.map(source =>
                source.id === action.sourceId
                    ? { ...source, data: resolvedData }
                    : source
            );
            set(_retrievedSourcesAtom, updatedSources);
            return resolvedData;
        } catch (error) {
            console.error(`Failed to load data for source ${action.sourceId}:`, error);
            set(errorAtom, `Failed to load source data: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    };

    try {
        // Process source data and citations in parallel using Promise.allSettled
        const results = await Promise.allSettled([
            processSourceData(),
            processCitations()
        ]);
        
        // Check if any promises were rejected
        const errors = results.filter(result => result.status === 'rejected');
        
        if (errors.length > 0) {
            // Get the first error
            const error = (errors[0] as PromiseRejectedResult).reason;
            
            // Restore previous state
            set(_retrievedSourcesAtom, previousSources);
            set(citationsAtom, previousCitations);
            
            // Set appropriate error message based on which process failed
            if (results[0].status === 'rejected') {
                set(errorAtom, `Failed to process source data: ${error instanceof Error ? error.message : String(error)}`);
            } else {
                set(errorAtom, `Failed to process citations: ${error instanceof Error ? error.message : String(error)}`);
            }
            
            throw error;
        }
        
        return { success: true };
    } catch (error) {
        // This catch block handles any errors in the Promise.allSettled itself
        console.error("Unexpected error in setSelectedSourceAtom:", error);
        
        // Restore previous state
        set(_retrievedSourcesAtom, previousSources);
        set(citationsAtom, previousCitations);
        
        set(errorAtom, `Unexpected error processing selected source: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
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
                const source = get(_retrievedSourcesAtom).find(source => source.id === action.sourceId);
                if (source) {
                    action.sourceObject = source;
                }
            }

            const retrievedSources = get(_retrievedSourcesAtom);

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

            // // ---- Process any follow-up action (recursive)
            if (payload && payload.followUpAction) {
                promises.push(Promise.resolve((dispatchAtom.write as any)(get, set, payload.followUpAction, true)));
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