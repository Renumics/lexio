import React, { useContext } from 'react';
import { ThemeContext } from '../../theme/ThemeContext';
import { useRAGMessages } from '../RAGProvider/hooks';

// Define a type for the shape of the overrides
export interface ChatWindowStyles extends React.CSSProperties {
  backgroundColor?: string;
  color?: string;
  padding?: string;
  fontFamily?: string;
}

const ChatWindow: React.FC<ChatWindowStyles> = ({ styleOverrides = {} }) => {
  const { messages, currentStream } = useRAGMessages();

  // --- test styling ---
  // use theme
  const { theme } = useContext(ThemeContext);
  const { colors, spacing, typography } = theme;

  // Merge theme defaults + overrides
  const style: ChatWindowStyles = {
    backgroundColor: colors.background,
    color: colors.text,
    padding: spacing.md,
    ...styleOverrides, // ensure these override theme defaults
  };

  return (
    <div
      className="w-full h-full overflow-y-auto p-4 bg-gray-50 rounded-lg"
      style={style}
    >
      {messages.map((msg, index) => (
        <div key={index} className={`mb-2 ${msg.role}`}>
          <strong>{msg.role === 'user' ? 'User: ' : 'Assistant: '}</strong>
          {msg.content}
        </div>
      ))}
      {currentStream && (
        <div className="mb-2 assistant streaming">
          <strong>Assistant: </strong>
          {currentStream.content}
        </div>
      )}
    </div>
  );
};

export { ChatWindow };
