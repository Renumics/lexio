import React, { useState } from 'react';
import { MessageHighlight, Citation } from '../../types';

interface ChatWindowContextType {
  highlights: MessageHighlight[];
  citations: Citation[];
  setHighlights: (highlights: MessageHighlight[]) => void;
  setCitations: (citations: Citation[]) => void;
  clearHighlightsAndCitations: () => void;
}

export const ChatWindowContext = React.createContext<ChatWindowContextType | null>(null);

export const ChatWindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highlights, setHighlights] = useState<MessageHighlight[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);

  const value = {
    highlights,
    citations,
    setHighlights: (newHighlights: MessageHighlight[]) => {
      setHighlights(newHighlights);
    },
    setCitations: (newCitations: Citation[]) => {
      setCitations(newCitations);
    },
    clearHighlightsAndCitations: () => {
      setHighlights([]);
      setCitations([]);
    }
  };

  return (
    <ChatWindowContext.Provider value={value}>
      {children}
    </ChatWindowContext.Provider>
  );
};
