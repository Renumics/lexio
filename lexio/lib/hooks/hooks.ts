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

// hooks for sources related stuff
export const useSources = (component: Component) => {
    const dispatch = useSetAtom(dispatchAtom);

    const sources = useAtomValue(retrievedSourcesAtom);
    const activeSources = useAtomValue(activeSourcesAtom);
    const activeSourcesIds = useAtomValue(activeSourcesIdsAtom);
    const selectedSource = useAtomValue(selectedSourceAtom);
    const selectedSourceId = useAtomValue(selectedSourceIdAtom);


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

// only data for now
export const useMessages = (component: Component) => {
    const dispatch = useSetAtom(dispatchAtom);

    const completedMessages = useAtomValue(completedMessagesAtom);
    const currentStream = useAtomValue(currentStreamAtom);

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

    return {
        messages: completedMessages,
        currentStream,
        addUserMessage,
        setActiveMessage,
        clearMessages,
    };
}

export const useStatus = () => {
    const loading = useAtomValue(loadingAtom);
    const error = useAtomValue(errorAtom)

    return {
        loading,
        error,
    };
}