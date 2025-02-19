import React, {useContext, useEffect} from 'react';
import {ThemeContext} from '../../theme/ThemeContext';
import {useRAGMessages} from '../RAGProvider/hooks';
import {ResetWrapper} from '../../utils/ResetWrapper';
import {MessageBubbleComponent} from "../ui/MessageBubbleComponent.tsx";
import {CardContainer} from "../ui/card.tsx";
import PromptExample from "../ui/promptExample.tsx";

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

  onExampleSelection?: (() => void) | undefined;
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
  showRoleLabels = true,
  userLabel = "User",
  assistantLabel = "Assistant",
  onExampleSelection,
}) => {
  const { messages, currentStream, addMessage } = useRAGMessages();
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
    color: colors.text,
    // padding: componentDefaults.padding,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    borderRadius: componentDefaults.borderRadius,
    ...styleOverrides, // ensure these override theme defaults
  };

  const handleExampleSelection = (text: string) => {
    addMessage({ role: "user", content: text });
    if (!onExampleSelection) return;
    onExampleSelection();
  }

  return (
    <ResetWrapper>
    <div
      className="grid grid-cols-1 gap-2.5 overflow-y-auto"
      style={style}
    >
      {messages.length === 0 ?
          <PromptExample onItemSelection={handleExampleSelection} /> : null
      }
      {messages.map((msg, index) => (
          <div key={index} className={`${msg.role}`}>
            {showRoleLabels &&
                <MessageBubbleComponent
                    text={msg.content}
                    name={<p className={"text-xs font-thin"}>{msg.role === "user" ? userLabel : assistantLabel}</p>}
                    isFromUser={msg.role === "user"}
                />
            }
          </div>
      ))}
      {currentStream &&
          <div className="assistant streaming">
            {showRoleLabels &&
                <MessageBubbleComponent
                    text={currentStream.content}
                    name={<p className={"text-xs font-thin"}>{assistantLabel}</p>}
                    isFromUser={false}
                />
            }
          </div>
      }
      <div ref={chatEndRef}/>
    </div>
    </ResetWrapper>
  );
};

export {ChatWindow}