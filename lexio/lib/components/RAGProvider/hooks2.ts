import { ActionHandler, completedMessagesAtom, currentStreamAtom } from "../../state/rag-state-v2";
import { useEffect } from "react";
import { dispatchAtom, registerActionHandler, Component } from "../../state/rag-state-v2";
import { useAtomValue, useSetAtom } from "jotai";

export const useRAGData= () => {
    const completedMessages = useAtomValue(completedMessagesAtom);
    const currentStream = useAtomValue(currentStreamAtom);

    return {messages: completedMessages, currentStream};
}
    
export const useAPI2 = (component: Component, actionHandler: ActionHandler['handler']) => {
    useEffect(() => {
        const register = useSetAtom(registerActionHandler);  // todo inconsistent naming
        register({component: component, handler: actionHandler});
    }, [actionHandler, component]); 

    // User action utility functions
    const addUserMessage = (message: string) => {
        const dispatch = useSetAtom(dispatchAtom);
        dispatch({type: 'ADD_USER_MESSAGE', message, source: component});
    };

    const setActiveMessage = (messageId: string) => {
        const dispatch = useSetAtom(dispatchAtom);
        dispatch({type: 'SET_ACTIVE_MESSAGE', messageId, source: component});
    };

    const clearMessages = () => {
        const dispatch = useSetAtom(dispatchAtom);
        dispatch({type: 'CLEAR_MESSAGES', source: component});
    };

    const searchSources = () => {
        const dispatch = useSetAtom(dispatchAtom);
        dispatch({type: 'SEARCH_SOURCES', source: component});
    };

    const clearSources = () => {
        const dispatch = useSetAtom(dispatchAtom);
        dispatch({type: 'CLEAR_SOURCES', source: component});
    };

    const setActiveSources = (sourceIds: string[]) => {
        const dispatch = useSetAtom(dispatchAtom);
        dispatch({type: 'SET_ACTIVE_SOURCES', sourceIds, source: component});
    };

    const setSelectedSource = (sourceId: string) => {
        const dispatch = useSetAtom(dispatchAtom);
        dispatch({type: 'SET_SELECTED_SOURCE', sourceId, source: component});
    };

    const setFilterSources = (filter: any) => {
        const dispatch = useSetAtom(dispatchAtom);
        dispatch({type: 'SET_FILTER_SOURCES', filter, source: component});
    };

    const resetFilterSources = () => {
        const dispatch = useSetAtom(dispatchAtom);
        dispatch({type: 'RESET_FILTER_SOURCES', source: component});
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