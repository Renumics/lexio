import React, {useContext} from 'react';
import {ThemeContext, removeUndefined} from '../../theme/ThemeContext';
import {useMessages} from '../../hooks';
import DocumentPlusIcon from '@heroicons/react/24/outline/esm/DocumentPlusIcon';
import { Message, HighlightedIdea } from '../../types';
import {ResetWrapper} from '../../utils/ResetWrapper';
import {ChatWindowUserMessage} from "./ChatWindowUserMessage";
import {ChatWindowAssistantMessage} from "./ChatWindowAssistantMessage";
import {addOpacity, scaleFontSize} from '../../utils/scaleFontSize';

// todo: Add docu for new components, remove border around icon, add longer description

// Define a type for the shape of the overrides
export interface ChatWindowStyles extends React.CSSProperties {
    backgroundColor?: string;
    messageBackgroundColor?: string;
    messageBorderRadius?: string;
    messageFontSize?: string;
    roleLabelFontSize?: string;
    accent?: string;
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
    /**
     * Custom icon for user messages. Must be a ReactElement. If provided, this will be shown instead of the role label
     */
    userIcon?: React.ReactElement
    /**
     * Custom icon for assistant messages. Must be a ReactElement. If provided, this will be shown instead of the role label
     */
    assistantIcon?: React.ReactElement;
    /**
     * Whether to render markdown in assistant messages
     * @default true
     */
    markdown?: boolean;
    /**
     * Whether to show the copy button in assistant messages
     * @default true
     */
    showCopy?: boolean;
    componentKey?: string;
}

/**
 * The ChatWindow component displays a conversation between a user and an assistant. It supports the display
 * of **markdown-formatted** messages, **role indicators**, and **custom icons** for user and assistant messages.
 *
 * This component is responsible for rendering a dynamic chat interface using messages provided by
 * the `LexioProvider` (via the `useMessages` hook). It supports both **static and streaming messages**,
 * and automatically scrolls to the most recent message upon updates.
 *
 * The appearance of the ChatWindow is primarily determined by theme defaults from the `ThemeContext`
 * but can be customized via the `styleOverrides` prop. These overrides merge with the default theme styles,
 * ensuring a consistent yet flexible look and feel.
 * 
 * @component
 * 
 * Features:
 * - Distinct styling for user and assistant messages
 * - Markdown rendering for assistant messages
 * - Code syntax highlighting with copy functionality
 * - Automatic scrolling to the latest message
 * - Customizable role labels and icons
 * - Responsive design
 * 
 * @example
 *
 * ```tsx
 * <ChatWindow
 *   userLabel="Customer"
 *   userIcon={<UserIcon className="w-5 h-5" />}
 *   assistantLabel="Support"
 *   assistantIcon={<BotIcon className="w-5 h-5" />}
 *   styleOverrides={{
 *     backgroundColor: '#f5f5f5',
 *     padding: '1rem',
 *     messageBackgroundColor: '#ffffff',
 *     borderRadius: '8px',
 *   }}
 *   showRoleIndicator={true}
 *   markdown={true}
 *   showCopy={true}
 *   componentKey="support-chat"
 * />
 * ```
 *
 * @see ChatWindowUserMessage for details on rendering user messages.
 * @see ChatWindowAssistantMessage for details on rendering assistant messages.
 */
const ChatWindow: React.FC<ChatWindowProps> = ({
                                                   userLabel = 'User',
                                                   userIcon = undefined,
                                                   assistantLabel = 'Assistant',
                                                   assistantIcon = undefined,
                                                   styleOverrides = {},
                                                   showRoleIndicator = true,
                                                   markdown = true,
                                                   showCopy = true,
                                                   componentKey = undefined,
                                               }) => {
    const {messages, currentStream, clearMessages} = useMessages(componentKey ? `ChatWindow-${componentKey}` : 'ChatWindow');
        // Add ref for scrolling
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    // Scroll to bottom whenever messages or currentStream changes
    React.useEffect(() => {
        // If there are no messages and no currentStream, don't scroll
        if (messages.length === 0 && !currentStream) {
            return;
        }
        // Get the parent element of the chatEndRef and scroll to the bottom
        const container = chatEndRef.current?.parentElement;
        if (container) {
            // Scroll to the bottom of the container by setting scrollTop to scrollHeight
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, currentStream]);

    // --- use theme ---
    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error('ThemeContext is undefined');
    }
    const {colors, typography, componentDefaults} = theme.theme;

    // Merge theme defaults + overrides
    const style: ChatWindowStyles = {
        backgroundColor: colors.background,
        messageBackgroundColor: addOpacity(colors.primary, 0.12), // add opacity
        messageBorderRadius: componentDefaults.borderRadius,
        messageFontSize: typography.fontSizeBase,
        roleLabelFontSize: scaleFontSize(typography.fontSizeBase, 0.8),
        accent: addOpacity(colors.primary, 0.3),  // add opacity
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
                {messages.map((msg, index) => (
                    <React.Fragment key={msg.id || index}>
                        {msg.role == "user" && (
                            <ChatWindowUserMessage
                                message={msg.content}
                                style={style}
                                showRoleIndicator={showRoleIndicator}
                                roleLabel={userLabel}
                                icon={userIcon || undefined}
                            />
                        )}
                        {msg.role == "assistant" && (
                            <ChatWindowAssistantMessage
                                message={msg.content}
                                messageId={msg.id}
                                style={style}
                                showRoleIndicator={showRoleIndicator}
                                roleLabel={assistantLabel}
                                icon={assistantIcon || undefined}
                                markdown={markdown}
                                showCopy={showCopy}
                                ideas={msg.ideas || []}
                            />
                        )}
                    </React.Fragment>
                ))}
                {currentStream && (
                    <ChatWindowAssistantMessage
                        key={'stream'}
                        messageId={null}
                        message={currentStream.content}
                        style={style}
                        showRoleIndicator={showRoleIndicator}
                        roleLabel={assistantLabel}
                        icon={assistantIcon || undefined}
                        markdown={markdown}
                        isStreaming={true}
                        ideas={currentStream.ideas || []}
                    />
                )}
                <div ref={chatEndRef}/>
            </div>
        </ResetWrapper>
    );
};

export {ChatWindow}