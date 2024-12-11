import { useContext } from 'react';
import { RAGContext } from './context';
import { completedMessagesAtom, loadingAtom, currentStreamAtom } from '../../state/rag-state';
import { useAtom } from 'jotai';

export const useRAG = () => {

  // Get state from atoms
  const [messages] = useAtom(completedMessagesAtom);
  const [currentStream] = useAtom(currentStreamAtom);
  const [loading] = useAtom(loadingAtom);

  return {
    // State
    messages,
    currentStream,
    loading
  };
};