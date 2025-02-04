import { ResetWrapper } from '../../utils/ResetWrapper';
import React, {useContext, useMemo} from 'react';
import {ThemeContext} from '../../theme/ThemeContext';
import {useRAGMessages} from '../RAGProvider/hooks';
import { ChatWindowMessage, ChatWindowMessageContent } from './ChatWindowMessage';

const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

// Define a type for the shape of the overrides
export interface ChatWindowStyles extends React.CSSProperties {
    backgroundColor?: string;
    textBackground?: string;
    assistantTextBackground?: string;
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
    /**
     * Whether to interpret message.content as markdown and render it as such
     * @default true
     */
    asMarkdown?: boolean;
    /**
     * Whether to add a "Copy" button to code blocks
     * @default true
     */
    addCopyCode?: boolean;
    /**
     * Whether to add a "Copy" button to assistant messages
     * @default true
     */
    addCopy?: boolean;
}

/**
 * ChatWindow component displays a conversation between a user and an assistant.
 *
 * @remarks This component uses the RAGProvider context and displays the messages and currentStream.
 *
 * @remarks This component uses react-markdown and react-syntax-highlighter for rendering markdown and code blocks.
 *
 * @example
 *
 * ```tsx
 * <ChatWindow
 *   addCopy={false}
 *   addCopyCode={false}
 *   asMarkdown={true}
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
                                                   addCopy = true,
                                                   addCopyCode = true,
                                                   showRoleLabels = true,
                                                   userLabel = undefined,
                                                   assistantLabel = 'Assistant:',
                                                   asMarkdown = true,
                                                   styleOverrides = {},
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
        textBackground: `rgba(${hexToRgb(colors.primary)}, 0.15)`,
        assistantTextBackground: `rgba(${hexToRgb(colors.secondary)}, 0.15)`,
        color: colors.text,
        padding: componentDefaults.padding,
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSizeBase,
        borderRadius: componentDefaults.borderRadius,
        ...styleOverrides, // ensure these override theme defaults
    };

    // use this to set the fontBaseSize as css-var for the markdown container
    const animateMarkdownContainerStyle = useMemo(() => {
        return { "--base-font-size": `1rem` } as React.CSSProperties;
    }, [typography.fontSizeBase]);

    return (
        <ResetWrapper>
            <div
                className="w-full h-full overflow-y-auto"
                style={{
                    backgroundColor: style.backgroundColor,
                    borderRadius: style.borderRadius,
                    color: style.color,
                    padding: style.padding,
                    fontFamily: style.fontFamily,
                    fontSize: style.fontSize
                }}
            >
                {messages.map((msg, index) =>
                    <ChatWindowMessage
                        key={index}
                        index={index}
                        msg={msg}
                        addCopy={addCopy}
                        addCopyCode={addCopyCode}
                        showRoleLabels={showRoleLabels}
                        userLabel={userLabel}
                        assistantLabel={assistantLabel}
                        style={style}
                        asMarkdown={asMarkdown}
                        animateMarkdownContainerStyle={animateMarkdownContainerStyle}
                    />
                )}
                {currentStream && (
                    <div className="mb-2 flex assistant streaming justify-start">
                        <div
                            className={`px-3 py-2 w-full max-w-[90%] flex items-start`}
                            style={{
                                backgroundColor: style.assistantTextBackground,
                                borderRadius: style.borderRadius
                            }}
                        >
                            {showRoleLabels && <strong className="inline-block mr-2">{assistantLabel}</strong>}
                            <div className="inline whitespace-pre-wrap">
                                <ChatWindowMessageContent
                                    content={currentStream.content}
                                    asMarkdown={asMarkdown}
                                    animateMarkdownContainerStyle={animateMarkdownContainerStyle}
                                    addCopyCode={addCopyCode}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef}/>
            </div>
        </ResetWrapper>
    );
};

export { ChatWindow }