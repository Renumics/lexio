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
  const [currentSourceContent] = useAtom(currentSourceContentAtom);
  const [activeSourceIndex] = useAtom(activeSourceIndexAtom);
  const setActiveSourceIndex = useSetAtom(setActiveSourceIndexAtom);
  const retrieveSources = useSetAtom(retrieveSourcesAtom);
  
  return {
    sources,
    currentSourceContent,
    activeSourceIndex,
    setActiveSourceIndex: (index: number) => setActiveSourceIndex(index),
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