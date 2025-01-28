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

/**
 * Props for the ChatWindow component
 * @see {@link ChatWindow}
 */
export interface ChatWindowProps {
  /**
   * Style overrides for the component
   */
  styleOverrides?: ChatWindowStyles;
  /**
   * Whether to show role labels (User:, Assistant:) before messages
   * @default true
   */
  showRoleLabels?: boolean;
  /**
   * Custom label for user messages
   * @default "User: "
   */
  userLabel?: string;
  /**
   * Custom label for assistant messages
   * @default "Assistant: "
   */
  assistantLabel?: string;
}

/**
 * ChatWindow component displays a conversation between a user and an assistant
 * 
 * ```tsx
 * <ChatWindow 
 *   showRoleLabels={true}
 *   userLabel="You: "
 *   assistantLabel="Bot: "
 *   styleOverrides={{
 *     backgroundColor: '#f5f5f5',
 *     padding: '1rem'
 *   }}
 * />
 * ```
 */
const ChatWindow: React.FC<ChatWindowProps> = ({ 
  styleOverrides = {},
  showRoleLabels = true,
  userLabel = 'User: ',
  assistantLabel = 'Assistant: ',
}) => {
  const { messages, currentStream } = useRAGMessages();
  // Add ref for scrolling
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages or currentStream changes
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStream]);

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
      {messages.map((msg, index) => (
        <div key={index} className={`mb-2 ${msg.role}`}>
          {showRoleLabels && (
            <strong className="inline-block mr-2">{msg.role === 'user' ? userLabel : assistantLabel}</strong>
          )}
          <div className="inline" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
        </div>
      ))}
      {currentStream && (
        <div className="mb-2 assistant streaming">
          {showRoleLabels && <strong className="inline-block mr-2">{assistantLabel}</strong>}
          <div className="inline" style={{ whiteSpace: 'pre-wrap' }}>{currentStream.content}</div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
};

export { ChatWindow };