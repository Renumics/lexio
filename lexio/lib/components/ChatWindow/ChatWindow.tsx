import React, { useContext } from 'react';
import { ThemeContext, removeUndefined } from '../../theme/ThemeContext';
import { useRAGMessages } from '../RAGProvider/hooks';
import { ResetWrapper } from '../../utils/ResetWrapper';
import { ChatWindowUserMessage} from "./ChatWindowUserMessage.tsx";
import { ChatWindowAssistantMessage} from "./ChatWindowAssistantMessage.tsx";
import { scaleFontSize } from '../../utils/scaleFontSize';
import { UserIcon} from "@heroicons/react/24/outline";

// Define a type for the shape of the overrides
export interface ChatWindowStyles extends React.CSSProperties {
    backgroundColor?: string;
    messageBackgroundColor?: string;
    messageBorderRadius?: string;
    messageFontSize?: string;
    roleLabelFontSize?: string;
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
   * Whether to show role labels (User, Assistant) or Icons before messages
   * @default true
   */
  showRoleIndicator?: boolean;
  /**
   * Custom label for user messages
   * @default "User"
   */
  userLabel?: string;
  /**
   * Custom label for assistant messages
   * @default "Assistant"
   */
  assistantLabel?: string;
  userIcon?: React.ReactNode
  assistantIcon?: React.ReactNode;
}

/**
 * ChatWindow component displays a conversation between a user and an assistant
 *
 * @example
 *
 * ```tsx
 * <ChatWindow 
 *   showRoleLabels={true}
 *   userLabel="You"
 *   assistantLabel="LexioAI"
 *   styleOverrides={{
 *     backgroundColor: '#f5f5f5',
 *     padding: '1rem'
 *   }}
 * />
 * ```
 */
const ChatWindow: React.FC<ChatWindowProps> = ({
  userLabel = 'User',
  userIcon = undefined,
  assistantLabel = 'Assistant',
  // assistantIcon = <UserIcon className={"w-4 h-4"} />,
  assistantIcon = undefined,
  styleOverrides = {},
  showRoleIndicator = true,
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
    messageFontSize: typography.fontSizeBase,
    roleLabelFontSize: scaleFontSize(typography.fontSizeBase, 0.8),
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
        className="w-full h-full overflow-y-auto flex flex-col gap-y-6"
        style={style}
      >
        {messages.map((msg, index) => (
          <>
            {msg.role == "user" && (
              <ChatWindowUserMessage key={index} message={msg.content} style={style} showRoleIndicator={showRoleIndicator} roleLabel={userLabel} icon={userIcon} />
            )}
            {msg.role == "assistant" && (
              <ChatWindowAssistantMessage key={index} message={msg.content} style={style} showRoleIndicator={showRoleIndicator} roleLabel={assistantLabel} icon={assistantIcon} />
            )}
          </>
        ))}
        {currentStream && (
          <ChatWindowAssistantMessage key={'stream'} message={currentStream.content} style={style} showRoleIndicator={showRoleIndicator} roleLabel={assistantLabel} icon={assistantIcon} />
        )}
          <div ref={chatEndRef} />
        </div>
    </ResetWrapper>
  );
};

export { ChatWindow }