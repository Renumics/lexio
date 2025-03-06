import {useAtomValue, useSetAtom} from "jotai";
import {
    dispatchAtom,
    loadingAtom,
    completedMessagesAtom,
    currentStreamAtom,
    activeSourcesAtom,
    activeSourcesIdsAtom,
    selectedSourceAtom,
    selectedSourceIdAtom,
    retrievedSourcesAtom,
    errorAtom
} from "../state/rag-state";
import { UUID } from "../types";
import { Component } from "../types";

/**
 * Hook to read and manipulate sources state.
 * @param component - The component name to identify the source of a action source.
 * @returns An object containing source state and functions to manipulate sources.
 */
export const useSources = (component: Component) => {
    const dispatch = useSetAtom(dispatchAtom);

    /**
     * Get the sources from the state
     */
    const sources = useAtomValue(retrievedSourcesAtom);
    /**
     * Get the active sources from the state
     */
    const activeSources = useAtomValue(activeSourcesAtom);
    /**
     * Get the active sources IDs from the state
     */
    const activeSourcesIds = useAtomValue(activeSourcesIdsAtom);
    /**
     * Get the selected source from the state
     */
    const selectedSource = useAtomValue(selectedSourceAtom);
    /**
     * Get the selected source ID from the state
     */
    const selectedSourceId = useAtomValue(selectedSourceIdAtom);

    /**
     * Search for sources using the provided query.
     * @param query - The search query string to find relevant sources.
     */
    const searchSources = (query: string) => {
        dispatch({type: 'SEARCH_SOURCES', query: query, source: component}, false);
    };

    /**
     * Clear all sources from the state.
     */
    const clearSources = () => {
        dispatch({type: 'CLEAR_SOURCES', source: component}, false);
    };

    /**
     * Set the active sources by their IDs.
     * @param sourceIds - Array of source IDs to set as active, or null to clear active sources.
     */
    const setActiveSources = (sourceIds: string[] | UUID[] | null) => {
        dispatch({type: 'SET_ACTIVE_SOURCES', sourceIds: sourceIds || [], source: component}, false);
    };

    /**
     * Set a single source as the selected source.
     * @param sourceId - ID of the source to select, or null to clear selection.
     */
    const setSelectedSource = (sourceId: string | UUID | null) => {
        dispatch({type: 'SET_SELECTED_SOURCE', sourceId: sourceId || '', source: component}, false);
    };

    /**
     * Apply a filter to the sources.
     * @param filter - The filter criteria to apply to sources.
     */
    const setFilterSources = (filter: any) => {
        dispatch({type: 'SET_FILTER_SOURCES', filter, source: component}, false);
    };

    /**
     * Reset any applied filters on sources.
     */
    const resetFilterSources = () => {
        dispatch({type: 'RESET_FILTER_SOURCES', source: component}, false);
    };

    return {
        sources,
        activeSources,
        activeSourcesIds,
        selectedSource,
        selectedSourceId,
        searchSources,
        clearSources,
        setActiveSources,
        setSelectedSource,
        setFilterSources,
        resetFilterSources,
    };
};

/**
 * Hook to read and manipulate message state.
 * @param component - The component name to identify the source of an action.
 * @returns An object containing message state and functions to manipulate messages.
 */
export const useMessages = (component: Component) => {
    const dispatch = useSetAtom(dispatchAtom);

    /**
     * Read the array of completed messages in the chat history.
     */
    const completedMessages = useAtomValue(completedMessagesAtom);
    
    /**
     * Read the currently streaming message, if any.
     * This represents a message that is still being received/generated.
     */
    const currentStream = useAtomValue(currentStreamAtom);

    /**
     * Add a new user message to the chat.
     * @param message - The content of the user message to add.
     */
    const addUserMessage = (message: string) => {
        dispatch({type: 'ADD_USER_MESSAGE', message, source: component}, false);
    };

    /**
     * Set the active message in the chat window.
     * @param messageId - ID of the message to set as active.
     */
    const setActiveMessage = (messageId: string | UUID | null) => {
        dispatch({type: 'SET_ACTIVE_MESSAGE', messageId: messageId || '', source: component}, false);
    };

    /**
     * Clear all messages from the chat.
     */
    const clearMessages = () => {
        dispatch({type: 'CLEAR_MESSAGES', source: component}, false);
    };

    return {
        messages: completedMessages,
        currentStream,
        addUserMessage,
        setActiveMessage,
        clearMessages,
    };
}

/**
 * Hook to access the current loading and error state.
 * @returns An object containing the current loading state and any error information.
 */
export const useStatus = () => {
    /**
     * Read the current loading state.
     */ 
    const loading = useAtomValue(loadingAtom);

    /**
     * Read any error information.
     */
    const error = useAtomValue(errorAtom)

    return {
        loading,
        error,
    };
}