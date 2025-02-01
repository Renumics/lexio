import React, {useContext, useMemo} from 'react';
import {ThemeContext} from '../../theme/ThemeContext';
import {Message} from '../../types';
import {useRAGMessages} from '../RAGProvider/hooks';
// markdown rendering
import Markdown from 'react-markdown'
import remarkGfm from "remark-gfm";
import "./ChatWindowMarkdown.css"
// syntax highlighting
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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
                                                   styleOverrides = {},
                                                   showRoleLabels = true,
                                                   userLabel = '',
                                                   assistantLabel = 'Assistant:',
                                                   asMarkdown = true,
                                                   addCopyCode = true,
                                                   addCopy = true,
                                               }) => {
    // todo: this component re-renders on every message update. Optimize this by using a memoized version of the messages
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

    // todo: we can introduce a new directive to render a custom component for the message content based on regex match

    // render the content of the message either as plain text or markdown with syntax highlighting
    const renderContent = (content: string) => {
        if (!asMarkdown) {
            return content;
        }
        return (
            <div
                className={"prose lg:prose-md prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent chat-markdown-content"}
                style={{...animateMarkdownContainerStyle, overflowX: 'auto', maxWidth: '100%'}}
                >
                <Markdown
                    components={{
                        // We override the code block rendering to add a copy button and syntax highlighting
                        code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : 'plaintext';

                            const handleCopy = () => {
                                navigator.clipboard.writeText(String(children));
                            }

                            return (
                                <div style={{position: 'relative', marginBottom: '1rem'}} {...(props as React.HTMLProps<HTMLDivElement>)} >
                                    {match && (
                                        <div
                                            style={{
                                                marginLeft: '0.33rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: '#f5f5f5',
                                                padding: '4px 8px',
                                                borderTopLeftRadius: '5px',
                                                borderTopRightRadius: '5px',
                                                borderBottom: '1px solid #ccc',
                                                display: 'inline-block',
                                            }}
                                        >
                                            {language}
                                        </div>
                                    )}
                                    <div className="relative">
                                        <SyntaxHighlighter
                                            style={docco}
                                            language={language}
                                            PreTag="div"
                                            wrapLongLine={true}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                        {addCopyCode && (
                                            <div
                                                className="absolute top-1 right-1 p-1 text-sm bg-white rounded-md hover:bg-gray-200 active:bg-gray-300 transition"
                                            >
                                                <button
                                                    onClick={handleCopy}
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        },
                    }}
                    remarkPlugins={[remarkGfm]}>
                        {content}
                </Markdown>
            </div>
        );
    }

    const renderMessage = ({index, msg}: { index: number, msg: Message }) => {
        return (
            <>
                <div
                    key={index}
                    className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`px-3 py-2 rounded-lg w-fit max-w-[90%] flex items-start drop-shadow-sm`}
                        style={{backgroundColor: msg.role === 'user' ? style.textBackground : style.assistantTextBackground, borderRadius: style.borderRadius}}
                    >
                        {showRoleLabels && msg.role === 'assistant' && (
                            <strong className="mr-2 whitespace-nowrap">
                                {assistantLabel}
                            </strong>
                        )}
                        <div className="whitespace-pre-wrap overflow-scroll">{renderContent(msg.content)}</div>
                        {showRoleLabels && msg.role === 'user' && userLabel !== '' && (
                            <strong className="ml-2 whitespace-nowrap">
                                {userLabel}
                            </strong>
                        )}
                    </div>
                </div>
                {addCopy && msg.role === 'assistant' && (
                    <div
                        className={`flex place-self-center p-1 text-sm rounded-md hover:bg-gray-200 active:bg-gray-300 transition`}
                    >
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(msg.content);
                            }}
                        >
                            Copy
                        </button>
                    </div>
                )}
            </>
        );
    }

    return (
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
            {messages.map((msg, index) => renderMessage({index: index, msg}))}
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
                        <div className="inline whitespace-pre-wrap overflow-scroll">{renderContent(currentStream.content)}</div>
                    </div>
                </div>
            )}
            <div ref={chatEndRef}/>
        </div>
    );
};

export {ChatWindow};