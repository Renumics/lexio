import { atom } from 'jotai'
import { ActionHandler, ProviderConfig, UUID } from "../types";
import { AddUserMessageActionModifier, ClearMessagesActionModifier, ClearSourcesActionModifier, ResetFilterSourcesActionModifier, SearchSourcesActionModifier, SetActiveMessageActionModifier, SetActiveSourcesActionModifier, SetFilterSourcesActionModifier, SetSelectedSourceActionModifier, UserAction } from "../types";
import { Message, Source } from '../types';

const allowedModifiers: Record<UserAction['type'], object> = {
    ADD_USER_MESSAGE: { setUserMessage: '' },
    SET_ACTIVE_MESSAGE: { messageId: '' },
    CLEAR_MESSAGES: {},
    SEARCH_SOURCES: {},
    CLEAR_SOURCES: {},
    SET_ACTIVE_SOURCES: { activeSourceIds: [] },
    SET_SELECTED_SOURCE: { selectedSourceId: '' },
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
                    // Streaming response: process each chunk.
                    const streamTimeout = new StreamTimeout(config.timeouts?.stream);
                    for await (const chunk of response as AsyncIterable<{ content: string; done?: boolean }>) {
                        if (abortController.signal.aborted) break;
                        streamTimeout.check();
                        accumulatedContent += chunk.content;
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
                    set(completedMessagesAtom, [
                        ...get(completedMessagesAtom),
                        {
                            id: crypto.randomUUID() as UUID,
                            role: 'assistant',
                            content: messageData,
                        } as Message,
                    ]);
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
const setSelectedSourceAtom = atom(null, (_get, set, { sourceId, setSelectedSourceModifier }: {
    sourceId?: UUID,
    setSelectedSourceModifier?: SetSelectedSourceActionModifier
}) => {
    const selectedSourceId = setSelectedSourceModifier?.selectedSourceId ?? sourceId;
    if (selectedSourceId) {
        set(selectedSourceIdAtom, selectedSourceId);
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


// ----- MAIN: central dispatch atom / function -----
export const dispatchAtom = atom(
    null,
    async (get, set, action: UserAction, recursiveCall: boolean = false) => {
        // Exit if not a recursive call and we're already loading.
        if (!recursiveCall && get(loadingAtom)) {
            set(setErrorAtom, "RAG Operation already in progress");
            return;
        }

        // Set the global loading state and clear error (only for top-level calls)
        if (!recursiveCall) {
            console.log("set loadingAtom to true");
            set(loadingAtom, true);
            set(errorAtom, null);
        }

        // Find the handler.
        const handlers = get(registeredActionHandlersAtom);
        // (For now we assume the RAGProvider is used; you might later use action.source.)
        const handler = handlers.find(h => h.component === 'RAGProvider');
        if (!handler) {
            console.warn(`Handler for component ${action.source} not found`);
            if (!recursiveCall) {
                set(loadingAtom, false);
            }
            return;
        }

        // Call the handler and wrap its return value so that it always returns a promise.
        // This handles both synchronous and asynchronous handlers.
        const payload = await Promise.resolve(
            handler.handler(
                action,
                get(completedMessagesAtom),
                get(retrievedSourcesAtom),
                get(activeSourcesAtom),
                get(selectedSourceAtom)
            )
        );

        // Validate payload keys.
        const allowedKeys = allowedPayloadKeys[action.type] || [];
        if (payload) {
            const extraKeys = Object.keys(payload).filter(key => !allowedKeys.includes(key));
            if (extraKeys.length > 0) {
                console.warn(
                    `Handler for action "${action.type}" returned unused properties: ${extraKeys.join(', ')}`
                );
            }
        }

        // Validate modifiers.
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

        // Destructure payload values.
        const { response, messages, sources } = payload ?? {};

        // Collect all write-atom calls in an array of promises.
        // Each call is wrapped with Promise.resolve() so that synchronous and asynchronous atoms
        // are handled uniformly.
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
                    setSelectedSourceModifier: actionOptions?.current as SetSelectedSourceActionModifier,
                });
                promises.push(Promise.resolve(result));
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

        // Handle any follow-up actions recursively.
        if (actionOptions?.followUp) {
            const followUpResult = set(dispatchAtom, actionOptions.followUp, true);
            promises.push(Promise.resolve(followUpResult));
        }

        // Wait for all write operations to finish.
        try {
            await Promise.all(promises);
        } catch (error) {
            console.error("Error in dispatch async writes:", error);
        } finally {
            if (!recursiveCall) {
                console.log("set loadingAtom to false");
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