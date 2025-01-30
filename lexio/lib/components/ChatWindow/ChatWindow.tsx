import React, {useContext} from 'react';
import {ThemeContext} from '../../theme/ThemeContext';
import {Message} from '../../types';
import {useRAGMessages} from '../RAGProvider/hooks';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// todo: css for markdown

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
     * Whether to interpret message.content as markdown and render it
     * @default true
     */
    renderAsMarkdown?: boolean;
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
                                                   userLabel = '',
                                                   assistantLabel = 'Assistant:',
                                                   renderAsMarkdown = true,
                                               }) => {
    const {messages, currentStream} = useRAGMessages();
    // Add ref for scrolling
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    // Scroll to bottom whenever messages or currentStream changes
    React.useEffect(() => {
        chatEndRef.current?.scrollIntoView({behavior: 'smooth'});
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

    const renderContent = (content: string) => {
        if (!renderAsMarkdown) {
            return content;
        }
        return (
            <Markdown remarkPlugins={[remarkGfm]}>
                {content}
            </Markdown>
        );
    }

    const renderMessage = ({index, msg}: { index: number, msg: Message }) => {
        return (
            <div
                key={index}
                className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div
                    className={`px-3 py-2 rounded-lg w-fit max-w-[90%] flex items-start`}
                    style={{backgroundColor: msg.role === 'user' ? style.textBackground : style.assistantTextBackground, borderRadius: style.borderRadius}}
                >
                    {showRoleLabels && msg.role === 'assistant' && (
                        <strong className="mr-2 whitespace-nowrap">
                            {assistantLabel}
                        </strong>
                    )}
                    <div className="whitespace-pre-wrap">{renderContent(msg.content)}</div>
                    {showRoleLabels && msg.role === 'user' && userLabel !== '' && (
                        <strong className="ml-2 whitespace-nowrap">
                            {userLabel}
                        </strong>
                    )}
                </div>
            </div>
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
                        className={`px-3 py-2 w-fit max-w-[90%] flex items-start`}
                        style={{backgroundColor: style.assistantTextBackground, borderRadius: style.borderRadius}}
                    >
                        {showRoleLabels && <strong className="inline-block mr-2">{assistantLabel}</strong>}
                        <div className="inline" style={{whiteSpace: 'pre-wrap'}}>{renderContent(currentStream.content)}</div>
                    </div>
                </div>
            )}
            <div ref={chatEndRef}/>
        </div>
    );
};

export {ChatWindow};