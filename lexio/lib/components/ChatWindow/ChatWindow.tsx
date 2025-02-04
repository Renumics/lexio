import React, { useContext } from 'react';
import { ThemeContext, removeUndefined } from '../../theme/ThemeContext';
import { useRAGMessages } from '../RAGProvider/hooks';
import { ResetWrapper } from '../../utils/ResetWrapper';
import { ChatWindowUserMessage} from "./ChatWindowUserMessage.tsx";
import { ChatWindowAssistantMessage} from "./ChatWindowAssistantMessage.tsx";

// Define a type for the shape of the overrides
export interface ChatWindowStyles extends React.CSSProperties {
    backgroundColor?: string;
    messageBackgroundColor?: string;
    messageBorderRadius?: string;
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
  showRoleLabel?: boolean;
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
 * @example
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
  showRoleLabel = true,
  userLabel = 'User',
  assistantLabel = 'Assistant',
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
  const { colors, typography, componentDefaults } = theme.theme;

  // Merge theme defaults + overrides
  const style: ChatWindowStyles = {
    backgroundColor: colors.background,
    messageBackgroundColor: colors.primary + '20',  // add opacity to primary color ~ 12.5%
    messageBorderRadius: componentDefaults.borderRadius,
    color: colors.text,
    padding: componentDefaults.padding,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    borderRadius: componentDefaults.borderRadius,
    ...removeUndefined(styleOverrides), // ensure these override theme defaults
  };

  return (
    <ResetWrapper>
      <div
        className="w-full h-full overflow-y-auto"
        style={style}
      >
        {messages.map((msg, index) => (
          <>
            {msg.role == "user" && (
              <ChatWindowUserMessage key={index} message={msg.content} style={style} showRoleLabel={showRoleLabel} roleLabel={userLabel} />
            )}
            {msg.role == "assistant" && (
              <ChatWindowAssistantMessage key={index} message={msg.content} style={style} showRoleLabel={showRoleLabel} roleLabel={assistantLabel} />
            )}
          </>
        ))}
        {currentStream && (
          <ChatWindowAssistantMessage key={'stream'} message={currentStream.content} style={style} showRoleLabel={showRoleLabel} roleLabel={assistantLabel} />
        )}
          <div ref={chatEndRef} />
        </div>
    </ResetWrapper>
  );
};

export { ChatWindow }