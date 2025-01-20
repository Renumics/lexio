import React, { useContext } from 'react';
import { ThemeContext } from '../../theme/ThemeContext';
import { useRAGMessages } from '../RAGProvider/hooks';

// Define a type for the shape of the overrides
export interface ChatWindowStyleOverrides extends React.CSSProperties {
  backgroundColor?: string;
  color?: string;
}

// Define the overall props for the ChatWindow
export interface ChatWindowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional style overrides that will merge with the theme-based styles
   */
  overrides?: ChatWindowStyleOverrides;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ overrides = {}, ...restProps }) => {
  const { messages, currentStream } = useRAGMessages();
  // use theme
  const { theme } = useContext(ThemeContext);
  const { colors, spacing, typography } = theme;

  // Merge theme defaults + overrides
  const finalStyles: React.CSSProperties = {
    backgroundColor: colors.background,
    color: colors.text,
    padding: spacing.md,
    fontFamily: typography.fontFamily,
    ...overrides, // ensure these override theme defaults
  };

  return (
    <div
      className="w-full h-full overflow-y-auto p-4 bg-gray-50 rounded-lg"
      style={finalStyles}
      {...restProps} // allow other valid <div> props like `id`, `onClick`, etc.
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
