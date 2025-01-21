import React, { useContext } from 'react';
import { ThemeContext } from '../../theme/ThemeContext';
import { useRAGMessages } from '../RAGProvider/hooks';

// Define a type for the shape of the overrides
export interface ChatWindowStyles extends React.CSSProperties {
  backgroundColor?: string;
  color?: string;
  padding?: string;
  fontFamily?: string;
  fontSize?: string;
  borderRadius?: string;
}

// Define the props interface
export interface ChatWindowProps {
  styleOverrides?: ChatWindowStyles;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ styleOverrides = {} }) => {
  const { messages, currentStream } = useRAGMessages();

  // --- use theme ---
  const theme = useContext(ThemeContext);
  if (!theme) {
      throw new Error('ThemeContext is undefined');
  }
  const { colors, borderRadius, spacing, typography } = theme.theme;

  // Merge theme defaults + overrides
  const style: ChatWindowStyles = {
    backgroundColor: colors.background,
    color: colors.text,
    padding: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    borderRadius: borderRadius.md,
    ...styleOverrides, // ensure these override theme defaults
  };

  return (
    <div
      className="w-full h-full overflow-y-auto"
      style={style}
    >
      {/* todo: style the messages */}
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
