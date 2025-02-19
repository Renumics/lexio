import React, { useContext } from 'react';
import { ThemeContext } from '../../theme/ThemeContext';
import { useLexio, useRAGMessages } from '../RAGProvider/hooks';
import { ResetWrapper } from '../../utils/ResetWrapper';
import DocumentPlusIcon from '@heroicons/react/24/outline/esm/DocumentPlusIcon';

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
   * Unique key for the component which can be used to identify the source of UserAction's if multiple ChatWindow components are used.
   * The default is 'ChatWindow', if key is provided it will be appended to the default key as following 'ChatWindow-${key}'.
   */
  componentKey?: string;
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
  componentKey,
  styleOverrides = {},
  showRoleLabels = true,
  userLabel = 'User: ',
  assistantLabel = 'Assistant: ',
}) => {
  const { messages, currentStream } = useRAGMessages();
  const { clearMessages } = useLexio(componentKey ? `ChatWindow-${componentKey}` : 'ChatWindow');


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
    padding: componentDefaults.padding,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    borderRadius: componentDefaults.borderRadius,
    ...styleOverrides, // ensure these override theme defaults
  };

  return (
    <ResetWrapper>
      <div
        className="w-full h-full flex flex-col"
        style={style}
      >
        {/* Fixed header */}
        <div className="flex justify-end p-2 h-14 flex-none">
          <button
            onClick={clearMessages}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{
              color: colors.text,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            title="New conversation"
            aria-label="New conversation"
          >
            <DocumentPlusIcon className="size-5" />
          </button>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.role}`}>
                {showRoleLabels && (
                  <strong className="inline-block mr-2">
                    {msg.role === 'user' ? userLabel : assistantLabel}
                  </strong>
                )}
                <div className="inline" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {currentStream && (
              <div className="mb-2 assistant streaming">
                {showRoleLabels && (
                  <strong className="inline-block mr-2">{assistantLabel}</strong>
                )}
                <div className="inline" style={{ whiteSpace: 'pre-wrap' }}>
                  {currentStream.content}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    </ResetWrapper>
  );
};

export { ChatWindow }