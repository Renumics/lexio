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

// sources
export const retrievedSourcesAtom = atom<Source[]>([]);
export const activeSourcesAtom = atom<Source[]>([]);
export const selectedSourceAtom = atom<Source | null>(null);

// loading state of system -> can be used to block other actions
export const loadingAtom = atom(false);


type UserActionModifier = any

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

const addUserMessageAtom = atom(null, (get, set, { message, messages, sources, addMessageModifier }:
  { 
    message?: Promise<Message> | AsyncIterable<{ content: string, done?: boolean }>, 
    messages?: Promise<Message[]>, 
    sources?: Promise<Source[]>, 
    addMessageModifier?: UserActionModifier 
  }
) => {
  if (message && messages) {
    throw new Error('addUserMessageAtom: message and messages cannot be set at the same time');
  }

  // Get the configuration for timeouts (and any other settings)
  const config = get(configAtom);

  // Process any provided sources with a timeout.
  if (sources) {
    const abortController = new AbortController();
    addTimeout(
      sources.then(sourcesData => {
        set(retrievedSourcesAtom, sourcesData);
        set(activeSourcesAtom, []);
        set(selectedSourceAtom, null);
        return sourcesData;
      }),
      config.timeouts?.request,
      'Sources request timeout exceeded',
      abortController.signal
    ).catch(error => {
      toast.error(`Failed to process sources: ${error.message}`);
    });
  }

  // Process a single message (response)
  if (message) {
    const abortController = new AbortController();
    let accumulatedContent = '';

    // Check if the message is a streaming response (AsyncIterable)
    if (Symbol.asyncIterator in message) {
      const processStream = async () => {
        // Create a stream timeout checker with the configured stream timeout.
        const streamTimeout = new StreamTimeout(config.timeouts?.stream);
        for await (const chunk of message as AsyncIterable<{ content: string, done?: boolean }>) {
          if (abortController.signal.aborted) break;
          streamTimeout.check(); // ensure each chunk arrives on time

          accumulatedContent += chunk.content;
          
          // Update the current stream state as chunks arrive.
          set(currentStreamAtom, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: accumulatedContent
          });

          if (chunk.done) {
            // Finalize the streaming message by appending it to completed messages.
            set(completedMessagesAtom, prev => [...prev, {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: accumulatedContent
            }]);
            set(currentStreamAtom, null);
          }
        }
        return accumulatedContent;
      };

      // Enforce an overall timeout for the streaming process.
      addTimeout(
        processStream(),
        config.timeouts?.request,
        'Stream processing timeout exceeded',
        abortController.signal
      ).catch(error => {
        toast.error(`Stream processing failed: ${error.message}`);
      }).finally(() => {
        set(loadingAtom, false);
      });
    }
    // Process a non-streaming message (Promise based response)
    else {
      addTimeout(
        message as Promise<Message>,
        config.timeouts?.request,
        'Response timeout exceeded',
        abortController.signal
      ).then(messageData => {
        set(completedMessagesAtom, prev => [...prev, messageData]);
      }).catch(error => {
        toast.error(`Failed to process message: ${error.message}`);
      }).finally(() => {
        set(loadingAtom, false);
      });
    }
  }

  // Process an array of messages if provided.
  if (messages) {
    throw new Error('Not implemented yet. Should serve more agentic use cases lateron.');
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


// central dispatch atom / function
export const dispatchAtom = atom(null, (get, set, action: UserAction) => {
  set(loadingAtom, true);
  const handlers = get(registeredActionHandlersAtom);
  const handler = handlers.find(h => h.component === action.source);
  if (!handler) {
    toast.warning(`Handler for component ${action.source} not found`);
    set(loadingAtom, false);
    return;
  }
  const { message, messages, sources, actionOptions } = handler.handler(action, get(completedMessagesAtom), get(retrievedSourcesAtom), get(activeSourcesAtom), get(selectedSourceAtom));

  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      set(addUserMessageAtom, { message, messages, sources, addMessageModifier: actionOptions?.current });
      break;
  }


  set(loadingAtom, false);
})