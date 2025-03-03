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
    retrievedSourcesAtom, errorAtom} from "../state/rag-state";
import { UUID } from "../types";
import { Component } from "../types";


export const useRAGSources = () => {
    const sources = useAtomValue(retrievedSourcesAtom);
    const activeSources = useAtomValue(activeSourcesAtom);
    const activeSourcesIds = useAtomValue(activeSourcesIdsAtom);
    const selectedSource = useAtomValue(selectedSourceAtom);
    const selectedSourceId = useAtomValue(selectedSourceIdAtom);

    return {
        sources,
        activeSources,
        activeSourcesIds,
        selectedSource,
        selectedSourceId,
    };
};

// only data for now
export const useRAGMessages = () => {
    const completedMessages = useAtomValue(completedMessagesAtom);
    const currentStream = useAtomValue(currentStreamAtom);

    console.log('RAGMessages hook state:', {
        messageCount: completedMessages.length,
        messagesWithMetadata: completedMessages.filter(m => m.metadata).length,
        messages: completedMessages.map(m => ({
            id: m.id,
            role: m.role,
            hasMetadata: !!m.metadata,
            coloredIdeas: m.metadata?.coloredIdeas
        }))
    });

    return {messages: completedMessages, currentStream};
}

// all actions
export const useLexio = (component: Component) => {
    const dispatch = useSetAtom(dispatchAtom);

    const addUserMessage = (message: string) => {
        dispatch({type: 'ADD_USER_MESSAGE', message, source: component}, false);
    };

    /**
     * Set the active message in the chat window
     * @param messageId
     */
    const setActiveMessage = (messageId: string | UUID) => {
        dispatch({type: 'SET_ACTIVE_MESSAGE', messageId, source: component}, false);
    };

    const clearMessages = () => {
        dispatch({type: 'CLEAR_MESSAGES', source: component}, false);
    };

    const searchSources = (query: string) => {
        dispatch({type: 'SEARCH_SOURCES', query: query, source: component}, false);
    };

    const clearSources = () => {
        dispatch({type: 'CLEAR_SOURCES', source: component}, false);
    };

    const setActiveSources = (sourceIds: string[] | UUID[]) => {
        dispatch({type: 'SET_ACTIVE_SOURCES', sourceIds, source: component}, false);
    };

    const setSelectedSource = (sourceId: string | UUID) => {
        dispatch({type: 'SET_SELECTED_SOURCE', sourceId, source: component}, false);
    };

    const setFilterSources = (filter: any) => {
        dispatch({type: 'SET_FILTER_SOURCES', filter, source: component}, false);
    };

    const resetFilterSources = () => {
        dispatch({type: 'RESET_FILTER_SOURCES', source: component}, false);
    };

    return {
        addUserMessage,
        setActiveMessage,
        clearMessages,
        searchSources,
        clearSources,
        setActiveSources,
        setSelectedSource,
        setFilterSources,
        resetFilterSources,
    };
};

export const useLexioStatus = () => {
    const loading = useAtomValue(loadingAtom);
    const error = useAtomValue(errorAtom)

    return {
        loading,
        error,
    };
}