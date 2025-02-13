import { 
  completedMessagesAtom, 
  loadingAtom, 
  currentStreamAtom, 
  addMessageAtom,
  retrievedSourcesAtom,
  currentSourceContentAtom,
  activeSourceIndexAtom,
  setActiveSourceIndexAtom,
  workflowModeAtom,
  errorAtom,
  retrieveSourcesAtom,
  currentSourcesAtom,
  setCurrentSourceIndicesAtom,
  currentSourceIndicesAtom,
} from '../../state/rag-state';
import { useAtom, useSetAtom } from 'jotai';
import { Message } from '../../types';
import {useState} from "react";

export const useRAGMessages = () => {
  const addMessage = useSetAtom(addMessageAtom);
  const [messages] = useAtom(completedMessagesAtom);
  const [currentStream] = useAtom(currentStreamAtom);
  
  return {
    addMessage: (message: Message) => addMessage(message),
    messages,
    currentStream,
  };
};

export const useRAGSources = () => {
  const [sources] = useAtom(retrievedSourcesAtom);
  const [currentSources] = useAtom(currentSourcesAtom);
  const [currentSourceContent] = useAtom(currentSourceContentAtom);
  const [activeSourceIndex] = useAtom(activeSourceIndexAtom);
  const [currentSourceIndices] = useAtom(currentSourceIndicesAtom);
  const setActiveSourceIndex = useSetAtom(setActiveSourceIndexAtom);
  const setCurrentSourceIndices = useSetAtom(setCurrentSourceIndicesAtom);
  const retrieveSources = useSetAtom(retrieveSourcesAtom);
  const [isRetrievedSourcesComponentOpen, setIsRetrievedSourcesComponentOpen] = useState<boolean>(false);
  const [isFileViewerComponentOpen, setIsFileViewerComponentOpen] = useState<boolean>(false);

  return {
    sources,
    currentSources,
    currentSourceContent,
    activeSourceIndex,
    currentSourceIndices,
    setActiveSourceIndex: (index: number) => setActiveSourceIndex(index),
    setCurrentSourceIndices: (indices: number[]) => setCurrentSourceIndices(indices),
    retrieveSources: (query: string, metadata?: Record<string, any>) => retrieveSources(query, metadata),
    isRetrievedSourcesComponentOpen,
    toggleIsRetrievedSourcesComponentOpen: () => setIsRetrievedSourcesComponentOpen((prevState) => !prevState),
    isFileViewerComponentOpen,
    toggleIsFileViewerComponentOpen: () => setIsFileViewerComponentOpen((prevState) => !prevState),
  };
};

export const useRAGStatus = () => {
  const [workflowMode] = useAtom(workflowModeAtom);
  const [loading] = useAtom(loadingAtom);
  const [error] = useAtom(errorAtom);
  
  return {
    workflowMode,
    loading,
    error,
  };
};