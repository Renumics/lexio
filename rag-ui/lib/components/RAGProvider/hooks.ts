import { completedMessagesAtom, loadingAtom, currentStreamAtom, addMessageAtom } from '../../state/rag-state';
import { useAtom, useSetAtom } from 'jotai';

export const useRAG = () => {

  // Get state from atoms
  const addMessage = useSetAtom(addMessageAtom);
  const [messages] = useAtom(completedMessagesAtom);
  const [currentStream] = useAtom(currentStreamAtom);
  const [loading] = useAtom(loadingAtom);

  return {
    // State
    addMessage,
    messages,
    currentStream,
    loading
  };
};