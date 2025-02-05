import React, {useContext} from 'react';
import {ThemeContext, removeUndefined} from '../../theme/ThemeContext';
import {useRAGMessages} from '../RAGProvider/hooks';
import {ResetWrapper} from '../../utils/ResetWrapper';
import {ChatWindowUserMessage} from "./ChatWindowUserMessage.tsx";
import {ChatWindowAssistantMessage} from "./ChatWindowAssistantMessage.tsx";
import {scaleFontSize} from '../../utils/scaleFontSize';

// todo: Add docu for new components, remove border around icon, add longer description

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
}

/**
 * ChatWindow component displays a conversation between a user and an assistant.
 *
 * @example
 *
 * ```tsx
 * <ChatWindow 
 *   showRoleLabels={true}
 *   userIcon={<UserIcon className="w-6 h-6" />}
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
                                                   assistantIcon = undefined,
                                                   styleOverrides = {},
                                                   showRoleIndicator = true,
                                                   markdown = true,
                                                   showCopy = true,
                                               }) => {
    const {messages, currentStream} = useRAGMessages();
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
        messageBackgroundColor: colors.primary + '15',  // add opacity to primary color ~ 12.5%
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
                            <ChatWindowUserMessage
                                key={index}
                                message={msg.content}
                                style={style}
                                showRoleIndicator={showRoleIndicator}
                                roleLabel={userLabel}
                                icon={userIcon || undefined}
                            />
                        )}
                        {msg.role == "assistant" && (
                            <ChatWindowAssistantMessage
                                key={index}
                                message={msg.content}
                                style={style}
                                showRoleIndicator={showRoleIndicator}
                                roleLabel={assistantLabel}
                                icon={assistantIcon || undefined}
                                markdown={markdown}
                                showCopy={showCopy}
                            />
                        )}
                    </>
                ))}
                {currentStream && (
                    <ChatWindowAssistantMessage
                        key={'stream'}
                        message={currentStream.content}
                        style={style}
                        showRoleIndicator={showRoleIndicator}
                        roleLabel={assistantLabel}
                        icon={assistantIcon || undefined}
                        markdown={markdown}
                        isStreaming={true}
                    />
                )}
                <div ref={chatEndRef}/>
            </div>
        </ResetWrapper>
    );
};

export {ChatWindow}