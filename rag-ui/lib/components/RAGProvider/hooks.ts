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
  
  return {
    sources,
    currentSources,
    currentSourceContent,
    activeSourceIndex,
    currentSourceIndices,
    setActiveSourceIndex: (index: number) => setActiveSourceIndex(index),
    setCurrentSourceIndices: (indices: number[]) => setCurrentSourceIndices(indices),
    retrieveSources: (query: string, metadata?: Record<string, any>) => retrieveSources(query, metadata),
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