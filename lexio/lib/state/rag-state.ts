import { atom } from 'jotai'
import { ActionHandler, ProviderConfig, StreamChunk, UUID } from "../types";
import { AddUserMessageActionModifier, ClearMessagesActionModifier, ClearSourcesActionModifier, ResetFilterSourcesActionModifier, SearchSourcesActionModifier, SetActiveMessageActionModifier, SetActiveSourcesActionModifier, SetFilterSourcesActionModifier, SetSelectedSourceActionModifier, UserAction } from "../types";
import { Message, Source } from '../types';

const allowedModifiers: Record<UserAction['type'], object> = {
    ADD_USER_MESSAGE: { setUserMessage: '' },
    SET_ACTIVE_MESSAGE: {},
    CLEAR_MESSAGES: {},
    SEARCH_SOURCES: {},
    CLEAR_SOURCES: {},
    SET_ACTIVE_SOURCES: {},
    SET_SELECTED_SOURCE: {},
    SET_FILTER_SOURCES: {},
    RESET_FILTER_SOURCES: {}
};

const allowedPayloadKeys: Record<UserAction['type'], string[]> = {
    ADD_USER_MESSAGE: ['response', 'message', 'messages', 'sources', 'actionOptions'],
    SET_ACTIVE_MESSAGE: ['actionOptions'],
    CLEAR_MESSAGES: ['actionOptions'],
    SEARCH_SOURCES: ['sources', 'actionOptions'],
    CLEAR_SOURCES: ['actionOptions'],
    SET_ACTIVE_SOURCES: ['sources', 'activeSourceIds', 'actionOptions'],
    SET_SELECTED_SOURCE: ['sourceData', 'actionOptions', 'activeSourceIds'],
    SET_FILTER_SOURCES: ['actionOptions'],
    RESET_FILTER_SOURCES: ['actionOptions']
};

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
            message,
            response,
            messages,
            sources,
            addMessageModifier,
        }: {
            message: string;
            response?: Promise<string> | AsyncIterable<StreamChunk>;
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

        // Handle user message modification.
        if (addMessageModifier?.setUserMessage) {
            set(completedMessagesAtom, [
                ...get(completedMessagesAtom),
                {
                    id: crypto.randomUUID() as UUID,
                    role: 'user',
                    content: addMessageModifier.setUserMessage,
                },
            ]);
        } else {
            set(completedMessagesAtom, [
                ...get(completedMessagesAtom),
                {
                    id: crypto.randomUUID(),
                    role: 'user',
                    content: message,
                },
            ]);
        }

        // Process sources independently.
        const processSources = async () => {
            if (!sources) return; // Skip if no sources provided.
            const sourcesData: Source[] = await addTimeout(
                sources.then(srcs => srcs),
                config.timeouts?.request,
                'Sources request timeout exceeded',
                abortController.signal
            );

            // Add a UUID to each source if it's missing.
            const sourcesDataWithIds = sourcesData.map(source => ({
                ...source,
                id: source.id || (crypto.randomUUID() as UUID),
            }));

            // Get current active sources
            const currentActiveSourceIds = get(activeSourcesIdsAtom);
            const currentSelectedId = get(selectedSourceIdAtom);

            // Update sources while preserving active state
            set(retrievedSourcesAtom, sourcesDataWithIds);
            
            // Only clear active sources if we don't have any active sources
            if (currentActiveSourceIds.length === 0) {
                set(activeSourcesIdsAtom, []);
            }
            
            // Only clear selected source if we don't have one
            if (!currentSelectedId) {
                set(selectedSourceIdAtom, null);
            }
            
            return sourcesDataWithIds;
        };

        // Process the user message or streaming response independently.
        const processMessage = async () => {
            if (response) {
                let accumulatedContent = '';
                if (Symbol.asyncIterator in response) {
                    // Streaming response: process each chunk.
                    const streamTimeout = new StreamTimeout(config.timeouts?.stream);
                    for await (const chunk of response as AsyncIterable<StreamChunk>) {
                        if (abortController.signal.aborted) break;
                        streamTimeout.check();
                        accumulatedContent += chunk.content ?? '';
                        // Provide immediate feedback as streaming chunks arrive.
                        set(currentStreamAtom, {
                            id: crypto.randomUUID(),
                            role: 'assistant',
                            content: accumulatedContent,
                        });
                    }
                    // Finalize streaming.
                    set(completedMessagesAtom, [
                        ...get(completedMessagesAtom),
                        {
                            id: crypto.randomUUID() as UUID,
                            role: 'assistant',
                            content: accumulatedContent,
                            ...(messages && Array.isArray(messages) && messages.length > 0 ? 
                                { metadata: messages[messages.length - 1].metadata } : {})
                        },
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
                    if (messages) {
                        const resolvedMessages = await messages;
                        set(completedMessagesAtom, [
                            ...get(completedMessagesAtom),
                            ...resolvedMessages
                        ]);
                    } else {
                        set(completedMessagesAtom, [
                            ...get(completedMessagesAtom),
                            {
                                id: crypto.randomUUID() as UUID,
                                role: 'assistant',
                                content: messageData,
                            } as Message,
                        ]);
                    }
                    return messageData;
                }
            }
            if (messages) {
                throw new Error('Not implemented yet. Should serve more agentic use cases lateron.');
            }
        };

        // --- The key elegant change: since this function is async, it automatically returns a promise.
        try {
            const results = await Promise.allSettled([processSources(), processMessage()]);
            const errors = results.filter(result => result.status === 'rejected');

            if (errors.length > 0) {
                // Abort remaining work and restore previous state.
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
            return results;
        } catch (error) {
            // Notify about the error and propagate it.
            set(setErrorAtom, `Failed to process user message: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
    }
);


// set active message
const setActiveMessageAtom = atom(null, (_get, set, { setActiveMessageModifier }: {
    setActiveMessageModifier?: SetActiveMessageActionModifier
}) => {
    set(activeMessageIdAtom, setActiveMessageModifier?.messageId ?? null);
});

// clear messages
const clearMessagesAtom = atom(null, (_get, set, { clearMessagesModifier }: {
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
        { query, sources, searchSourcesModifier }: {
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
        }
    }
);

// clear sources
const clearSourcesAtom = atom(null, (_get, set, { clearSourcesModifier }: {
    clearSourcesModifier?: ClearSourcesActionModifier
}) => {
    console.log('clearSourcesAtom', clearSourcesModifier);
    set(retrievedSourcesAtom, []);
    set(activeSourcesIdsAtom, []);
    set(selectedSourceIdAtom, null);
});

// set active sources
const setActiveSourcesAtom = atom(null, (_get, set, { sourceIds, setActiveSourcesModifier }: {
    sourceIds?: UUID[],
    setActiveSourcesModifier?: SetActiveSourcesActionModifier
}) => {
    const activeSourceIds = setActiveSourcesModifier?.activeSourceIds ?? sourceIds;
    if (activeSourceIds) {
        set(activeSourcesIdsAtom, activeSourceIds);
    }
});

// set selected source
const setSelectedSourceAtom = atom(null, (get, set, { sourceId, sourceData }: {
    sourceId: UUID,
    sourceData?: string | Uint8Array | null
}) => {
    const currentSources = get(retrievedSourcesAtom);
    const targetSource = currentSources.find(source => source.id === sourceId);
    
    if (!targetSource) {
        console.warn(`Source with id ${sourceId} not found`);
        return;
    }

    // Always set the selected source ID
    set(selectedSourceIdAtom, sourceId);

    // Only validate and update data if sourceData is provided and not null
    if (sourceData !== undefined && sourceData !== null) {
        // Warn if trying to update a source that already has data
        if (targetSource.data) {
            console.warn(`Source ${sourceId} already has data but new data was provided`);
            return;
        }

        const updatedSources = currentSources.map(source => 
            source.id === sourceId 
                ? { ...source, data: sourceData }
                : source
        );
        set(retrievedSourcesAtom, updatedSources);
    }
});

// set filter sources
const setFilterSourcesAtom = atom(null, (_get, _set, { setFilterSourcesModifier }: {
    setFilterSourcesModifier?: SetFilterSourcesActionModifier
}) => {
    console.log('setFilterSourcesAtom', setFilterSourcesModifier);
    throw new Error('Not implemented yet');
});

// reset filter sources
const resetFilterSourcesAtom = atom(null, (_get, _set, { resetFilterSourcesModifier }: {
    resetFilterSourcesModifier?: ResetFilterSourcesActionModifier
}) => {
    console.log('resetFilterSourcesAtom', resetFilterSourcesModifier);
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
        const handler = handlers.find(h => h.component === 'RAGProvider');
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


        // ---- Call the handler
        const payload = await Promise.resolve(
          handler.handler(
            action,
            get(completedMessagesAtom),
            get(retrievedSourcesAtom),
            get(activeSourcesAtom),
            get(selectedSourceAtom)
          )
        );
  
        // ---- Validate payload keys
        const allowedKeys = allowedPayloadKeys[action.type] || [];
        if (payload) {
          const extraKeys = Object.keys(payload).filter(key => !allowedKeys.includes(key));
          if (extraKeys.length > 0) {
            console.warn(
              `Handler for action "${action.type}" returned unused properties: ${extraKeys.join(', ')}`
            );
          }
        }
  
        // ---- Validate modifiers
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
  
        // ---- Destructure the useful pieces from payload
        const { response, messages, sources, sourceData } = payload ?? {};
  
        // ---- Collect all atom write operations
        const promises: Promise<any>[] = [];
  
        switch (action.type) {
          case 'ADD_USER_MESSAGE': {
            const result = set(addUserMessageAtom, {
              message: action.message,
              response,
              messages,
              sources,
              addMessageModifier: actionOptions?.current as AddUserMessageActionModifier,
            });
            promises.push(Promise.resolve(result));
            break;
          }
          case 'SET_ACTIVE_MESSAGE': {
            const result = set(setActiveMessageAtom, {
              setActiveMessageModifier: actionOptions?.current as SetActiveMessageActionModifier,
            });
            promises.push(Promise.resolve(result));
            break;
          }
          case 'CLEAR_MESSAGES': {
            const result = set(clearMessagesAtom, {
              clearMessagesModifier: actionOptions?.current as ClearMessagesActionModifier,
            });
            promises.push(Promise.resolve(result));
            break;
          }
          case 'SEARCH_SOURCES': {
            const result = set(searchSourcesAtom, {
              query: action.query,
              sources,
              searchSourcesModifier: actionOptions?.current as SearchSourcesActionModifier,
            });
            promises.push(Promise.resolve(result));
            break;
          }
          case 'CLEAR_SOURCES': {
            const result = set(clearSourcesAtom, {
              clearSourcesModifier: actionOptions?.current as ClearSourcesActionModifier,
            });
            promises.push(Promise.resolve(result));
            break;
          }
          case 'SET_ACTIVE_SOURCES': {
            const result = set(setActiveSourcesAtom, {
              sourceIds: action.sourceIds as UUID[],
              setActiveSourcesModifier: actionOptions?.current as SetActiveSourcesActionModifier,
            });
            promises.push(Promise.resolve(result));
            break;
          }
          case 'SET_SELECTED_SOURCE': {
            const result = set(setSelectedSourceAtom, {
              sourceId: action.sourceId as UUID,
              sourceData: sourceData,
            });
            promises.push(Promise.resolve(result));

            // Add this block to handle activeSourceIds with proper type casting
            if (payload?.activeSourceIds) {
              const activeResult = set(setActiveSourcesAtom, {
                sourceIds: payload.activeSourceIds as UUID[],
              });
              promises.push(Promise.resolve(activeResult));
            }
            break;
          }
          case 'SET_FILTER_SOURCES': {
            const result = set(setFilterSourcesAtom, {
              setFilterSourcesModifier: actionOptions?.current as SetFilterSourcesActionModifier,
            });
            promises.push(Promise.resolve(result));
            break;
          }
          case 'RESET_FILTER_SOURCES': {
            const result = set(resetFilterSourcesAtom, {
              resetFilterSourcesModifier: actionOptions?.current as ResetFilterSourcesActionModifier,
            });
            promises.push(Promise.resolve(result));
            break;
          }
          default:
            console.warn(`Unhandled action type: ${(action as any).type}`);
        }
  
        // ---- Process any follow-up action (recursive)
        if (actionOptions?.followUp) {
          promises.push(Promise.resolve(set(dispatchAtom, actionOptions.followUp, true)));
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