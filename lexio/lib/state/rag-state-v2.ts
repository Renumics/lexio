import { atom } from 'jotai'
import {RetrievalResult} from "../types.ts";

// ZENTRAL -> MESSAGE HISTORY
type Component =
    | 'Input'
    | 'Viewer'
    | 'ChatWindow'
    | 'SourceDisplay'

type UserAction =
    | { type: 'ADD_USER_MESSAGE', source: Component } // User message
    | { type: 'SET_ACTIVE_MESSAGE', messageId: string , source: Component } // Set active message -> can be used to rollback to a previous message
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
    handler: (action: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: Source) => ({
        message: Promise<Message> | AsyncIterable<{content: string, done?: boolean}>
        messages?: Promise<Message[]> | any,
        sources?: Promise<Source[]>,
        actionOptions?: {
            current?: UserActionModifier,
            followUp?: UserAction,
        }
    })
}
// ---- handler registry -----
export const registeredActionHandlersAtom = atom<ActionHandler[]>([]);


// central dispatch atom / function
export const dispatchAtom = atom(null, (_get, set, action) => {
  if (action === 'INC') {
    set(incAtom)
  } else if (action === 'DEC') {
    set(decAtom)
  } else {
    throw new Error('unknown action')
  }
})