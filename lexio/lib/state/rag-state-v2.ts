import { atom } from 'jotai'
import { RetrievalResult } from "../types.ts";
import { toast } from 'react-toastify';


// ZENTRAL -> MESSAGE HISTORY
type Component =
  | 'Input'
  | 'Viewer'
  | 'ChatWindow'
  | 'SourceDisplay'

type UserAction =
  | { type: 'ADD_USER_MESSAGE', source: Component } // User message
  | { type: 'SET_ACTIVE_MESSAGE', messageId: string, source: Component } // Set active message -> can be used to rollback to a previous message
  | { type: 'CLEAR_MESSAGES', source: Component } // Clear all messages in the chat
  | { type: 'SEARCH_SOURCES', source: Component } // Search sources, retrieve function - triggered by SourceDisplay
  | { type: 'CLEAR_SOURCES', source: Component } // Clear all sources
  | { type: 'SET_ACTIVE_SOURCES', sourceIds: string[], source: Component } // Sets active sources
  | { type: 'SET_SELECTED_SOURCE', sourceId: string, source: Component } // Sets selected source -> viewers
  | { type: 'SET_FILTER_SOURCES', filter: any, source: Component }
  | { type: 'RESET_FILTER_SOURCES', source: Component }

interface AddUserMessageActionModifier {

}
interface SetActiveMessageActionModifier {

}
interface ClearMessagesActionModifier {

}
interface SearchSourcesActionModifier {

}
interface ClearSourcesActionModifier {

}
interface SetActiveSourcesActionModifier {

}
interface SetSelectedSourceActionModifier {

}
interface SetFilterSourcesActionModifier {

}
interface ResetFilterSourcesActionModifier {

}

const allowedPayloadKeys: Record<UserAction['type'], string[]> = {
  ADD_USER_MESSAGE: ['message', 'messages', 'sources', 'actionOptions'],
  SET_ACTIVE_MESSAGE: ['actionOptions']
  // Add additional mappings for other actions as needed.
};


// Input -> User message, set active source/ filter source, reset all, reset chat, reset_filter
// Viewer -> nichts
// ChatWindow ->  reset all, reset chat,
// SourceDisplay -> set active source, set selected source, filter source, clear sources, reset filter

// Flow: action in component -> triggers wrapped user function with state props -> triggers dispatch -> manipulates state
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}


export interface Source {
  id: string;
  title: string;
  type: "text" | "pdf" | "markdown" | "html";
  relevance?: number;
  data?: string | Uint8Array | null;
  /**
   * key convention to hide from display _key
   */
  metadata?: Record<string, any>;
}

// ---- central data atoms -----
// config
export interface RAGConfig {
  timeouts?: {
    stream?: number;  // Timeout between stream chunks in ms
    request?: number; // Overall request timeout in ms
  },
}

export const configAtom = atom<RAGConfig>({
  timeouts: {
    stream: 10000,  // 10 seconds default
    request: 30000  // 30 seconds default
  }
});

// message
export const completedMessagesAtom = atom<Message[]>([]);
export const currentStreamAtom = atom<Message | null>(null);
export const activeMessageAtom = atom<string | null>(null);


// sources
export const retrievedSourcesAtom = atom<Source[]>([]);
export const activeSourcesAtom = atom<Source[]>([]);
export const selectedSourceAtom = atom<Source | null>(null);

// loading state of system -> can be used to block other actions
export const loadingAtom = atom(false);

// error state of system -> can be used to block other actions
export const errorAtom = atom<string | null>(null);


type UserActionModifier = AddUserMessageActionModifier | SetActiveMessageActionModifier | ClearMessagesActionModifier | SearchSourcesActionModifier | ClearSourcesActionModifier | SetActiveSourcesActionModifier | SetSelectedSourceActionModifier | SetFilterSourcesActionModifier | ResetFilterSourcesActionModifier

type ActionHandler = {
  component: Component;
  handler: (action: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: Source | null) => ({
    message: Promise<Message> | AsyncIterable<{ content: string, done?: boolean }>
    messages?: Promise<Message[]> | any,
    sources?: Promise<Source[]>,
    actionOptions?: {
      current?: UserActionModifier,
      followUp?: UserAction,
    }
  })
}
// ---- handler registry -----
const registeredActionHandlersAtom = atom<ActionHandler[]>([]);

// register a new action handler
// handlers should be uniquely identified by component name + key TODO
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
class CrazyAgentMessageManipulator {
  private readonly messages: Message[] = [];

  public addMessage(message: Message): void {
    this.messages.push(message);
  }
}


// handling of user messages
const addUserMessageAtom = atom(
  null,
  (
    get,
    set,
    {
      message,
      messages,
      sources,
      addMessageModifier,
    }: {
      message?: Promise<Message> | AsyncIterable<{ content: string; done?: boolean }>;
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

    // Process sources independently.
    const processSources = async () => {
      if (!sources) return;
      const sourcesData = await addTimeout(
        sources.then(srcs => srcs),
        config.timeouts?.request,
        'Sources request timeout exceeded',
        abortController.signal
      );
      // Update sources-related state.
      set(retrievedSourcesAtom, sourcesData);
      set(activeSourcesAtom, []);
      set(selectedSourceAtom, null);
      return sourcesData;
    };

    // Process the user message or streaming response independently.
    const processMessage = async () => {
      if (message) {
        let accumulatedContent = '';
        if (Symbol.asyncIterator in message) {
          // Streaming response: process each chunk with its own per-chunk timeout.
          const streamTimeout = new StreamTimeout(config.timeouts?.stream);
          for await (const chunk of message as AsyncIterable<{ content: string; done?: boolean }>) {
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
              id: crypto.randomUUID(),
              role: 'assistant',
              content: accumulatedContent
            }
          ]);
          set(currentStreamAtom, null);
          return accumulatedContent;
        } else {
          // Non-streaming (single promise) response.
          const messageData = await addTimeout(
            message as Promise<Message>,
            config.timeouts?.request,
            'Response timeout exceeded',
            abortController.signal
          );
          set(completedMessagesAtom, [...get(completedMessagesAtom), messageData]);
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
        set(errorAtom, `Failed to process user message: ${error instanceof Error ? error.message : error}`);
        throw error;
      } finally {
        set(loadingAtom, false);
      }
    })().catch(err => {
      console.error('addUserMessageAtom error:', err);
    });
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

  constructor(private timeout?: number) { }

  check() {
    if (!this.timeout) return;

    const now = Date.now();
    if (now - this.lastCheck > this.timeout) {
      throw new Error('Stream timeout exceeded');
    }
    this.lastCheck = now;
  }
}

// set active message
const setActiveMessageAtom = atom(null, (_get, set, {messageId, setActiveMessageModifier}: {messageId: string, setActiveMessageModifier?: SetActiveMessageActionModifier}) => {
  set(activeMessageAtom, messageId);
});

// clear messages
const clearMessagesAtom = atom(null, (_get, set, {clearMessagesModifier}: {clearMessagesModifier?: ClearMessagesActionModifier}) => {
  set(completedMessagesAtom, []);
});


// search sources
const searchSourcesAtom = atom(
  null,
  async (
    get,
    set,
    { sources, searchSourcesModifier }: { sources?: Promise<Source[]>; searchSourcesModifier?: SearchSourcesActionModifier }
  ) => {
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
      set(activeSourcesAtom, []);
      set(selectedSourceAtom, null);

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
const clearSourcesAtom = atom(null, (_get, set, {clearSourcesModifier}: {clearSourcesModifier?: ClearSourcesActionModifier}) => {
  set(retrievedSourcesAtom, []);
  set(activeSourcesAtom, []);
  set(selectedSourceAtom, null);
});

// set active sources
const setActiveSourcesAtom = atom(null, (_get, set, {setActiveSourcesModifier}: {setActiveSourcesModifier?: SetActiveSourcesActionModifier}) => {
  set(activeSourcesAtom, []);
});

// central dispatch atom / function
export const dispatchAtom = atom(null, (get, set, action: UserAction) => {
  // Set the global loading state immediately.
  set(loadingAtom, true);

  // Find the concrete handler based on the action source.
  const handlers = get(registeredActionHandlersAtom);
  const handler = handlers.find(h => h.component === action.source);
  if (!handler) {
    console.warn(`Handler for component ${action.source} not found`);
    set(loadingAtom, false);
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

  // Check for any extra keys in the payload that we do not use.
  const allowed = allowedPayloadKeys[action.type] || [];
  const extraKeys = Object.keys(payload).filter(key => !allowed.includes(key));
  if (extraKeys.length > 0) {
    console.warn(
      `Handler for action "${action.type}" returned unused properties: ${extraKeys.join(', ')}`
    );
  }

  const { message, messages, sources, actionOptions } = payload;

  // Delegate to the concrete functionality.
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      set(addUserMessageAtom, { message, messages, sources, addMessageModifier: actionOptions?.current });
      break;
    case 'SET_ACTIVE_MESSAGE':
      set(setActiveMessageAtom, {messageId: action.messageId, setActiveMessageModifier: actionOptions?.current});
      break;
    case 'CLEAR_MESSAGES':
      set(clearMessagesAtom, {clearMessagesModifier: actionOptions?.current});
      break;
    case 'SEARCH_SOURCES':
      set(searchSourcesAtom, {sources, searchSourcesModifier: actionOptions?.current});
      break;
    case 'CLEAR_SOURCES':
      set(clearSourcesAtom, {clearSourcesModifier: actionOptions?.current});
      break;
    case 'SET_ACTIVE_SOURCES':
      set(setActiveSourcesAtom, {setActiveSourcesModifier: actionOptions?.current});
      break;
 
  

    // Other action types can be added here.
  }

  // Handle any follow-up actions.
  if (actionOptions?.followUp) {
    set(dispatchAtom, actionOptions.followUp);
  }

  // Clear the global loading state.
  set(loadingAtom, false);
});