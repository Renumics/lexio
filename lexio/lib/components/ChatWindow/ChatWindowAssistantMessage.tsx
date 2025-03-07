import React, {ReactNode, useMemo, useState} from "react";
import {ChatWindowStyles} from "./ChatWindow.tsx";
import Markdown from "react-markdown";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {docco} from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";
import "./AssistantMarkdownContent.css";
import {ClipboardIcon, ClipboardDocumentIcon} from "@heroicons/react/24/outline";
import {scaleFontSize} from "../../utils/scaleFontSize.tsx";
import { Feedback } from "./Feedback.tsx";
/**
 * Props for the AssistantMarkdownContent component.
 * @typedef {Object} AssistantMarkdownContentProps
 * @property {string} content - The markdown content to render.
 * @property {ChatWindowStyles} style - Styling options for the chat window.
 */
interface AssistantMarkdownContentProps {
    content: string;
    style: ChatWindowStyles;
}

/**
 * Renders markdown content with enhanced features such as syntax highlighting and copy functionality.
 *
 * @param {AssistantMarkdownContentProps} props - The props for the component.
 * @returns {JSX.Element} The rendered markdown content.
 *
 * @internal
 */
const AssistantMarkdownContent: React.FC<AssistantMarkdownContentProps> = ({content, style}) => {
    return (
        <Markdown
            components={{
                /**
                 * Custom renderer for code blocks to include syntax highlighting and a copy button.
                 *
                 * @param {Object} props - Properties passed to the code component.
                 * @param {Object} props.node - The AST node.
                 * @param {string} props.className - The class name for the code block.
                 * @param {React.ReactNode} props.children - The code content.
                 * @returns {JSX.Element} The customized code block.
                 */
                code({node, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : 'plaintext';
                    const [copied, setCopied] = React.useState(false);

                    /**
                     * Handles copying the code content to the clipboard.
                     */
                    const handleCopy = () => {
                        navigator.clipboard.writeText(String(children));
                        setCopied(true);
                        setTimeout(() => {
                            setCopied(false);
                        }, 3000); // Reset copied state after 3 seconds
                    }

                    // Block code (triple ```)
                    return (
                        <div style={{
                            position: 'relative',
                            marginBottom: '1rem'
                        }} {...(props as React.HTMLProps<HTMLDivElement>)}>
                            {match && (
                                <div
                                    style={{
                                        marginLeft: '0.33rem',
                                        fontSize: 'var(--font-size-small)',
                                        fontWeight: 'bold',
                                        background: '#f5f5f5',
                                        padding: '0 8px',
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

                                <div
                                    className="absolute top-1 right-1 px-1.5 pt-0.5 text-sm rounded-md hover:shadow-md "
                                    style={{
                                        backgroundColor: style.messageBackgroundColor,
                                    }}
                                >
                                    <button
                                        onClick={handleCopy}
                                    >
                                        {copied ? <ClipboardDocumentIcon className={"w-5 h-5"} /> : <ClipboardIcon className={"w-5 h-5"} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                },
            }}
            remarkPlugins={[remarkGfm]}>
            {content}
        </Markdown>
    );
}

/**
 * Props for the ChatWindowAssistantMessage component.
 * @typedef {Object} ChatWindowAssistantMessageProps
 * @property {string} message - The assistant message content.
 * @property {ChatWindowStyles} style - Styling options for the chat window / assistant message
 * @property {string} roleLabel - Label indicating the role of the assistant.
 * @property {boolean} showRoleIndicator - Flag to show or hide the role indicator.
 * @property {ReactNode} [icon] - Optional icon to display alongside the message.
 * @property {boolean} [markdown] - Flag indicating if the message content is markdown.
 * @property {boolean} [isStreaming] - Flag indicating if the message is being streamed.
 * @property {boolean} [showCopy] - Flag to show or hide the copy button.
 */
interface ChatWindowAssistantMessageProps {
    message: string;
    style: ChatWindowStyles;
    roleLabel: string;
    showRoleIndicator: boolean;
    icon?: ReactNode;
    markdown?: boolean;
    isStreaming?: boolean;
    showCopy?: boolean;
}

/**
 * Renders an assistant message within the chat window, supporting markdown, icons, and copy functionality.
 *
 * @param {ChatWindowAssistantMessageProps} props - The props for the component.
 * @returns {JSX.Element} The rendered assistant message.
 */
const ChatWindowAssistantMessage: React.FC<ChatWindowAssistantMessageProps> = ({
                                                                                   message,
                                                                                   style,
                                                                                   roleLabel,
                                                                                   showRoleIndicator,
                                                                                   icon,
                                                                                   markdown,
                                                                                   isStreaming,
                                                                                   showCopy
                                                                               }) => {
    const [copied, setCopied] = useState(false);
    // show icon if showRoleIndicator is true and icon is not null
    const showIcon = showRoleIndicator && !!icon;
    // show label if showRoleIndicator is true and roleLabel is not null and icon is not shown
    const showLabel = showRoleIndicator && !!roleLabel && !showIcon;

    /**
     * Handles copying the message content to the clipboard.
     */
    const handleCopy = () => {
        navigator.clipboard.writeText(String(message));
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1500); // Reset copied state after 1.5 seconds
    }

    /**
     * Styles for the markdown content, setting the base font size.
     */
    const assistantMarkdownContentStyling = useMemo(() => {
        return {
            "--font-size-h1": scaleFontSize(style.messageFontSize || '1rem', 1.6),
            "--font-size-h2": scaleFontSize(style.messageFontSize || '1rem', 1.4),
            "--font-size-h3": scaleFontSize(style.messageFontSize || '1rem', 1.25),
            "--font-size-h4": scaleFontSize(style.messageFontSize || '1rem', 1.1),
            "--font-size-base": style.messageFontSize || '1rem',
            "--font-size-code": scaleFontSize(style.messageFontSize || '1rem', 1),
            "--font-size-small": scaleFontSize(style.messageFontSize || '1rem', 0.75),
            "--accent-color": style.accent
        } as React.CSSProperties;
    }, [style.messageFontSize, style.color]);

    return (
        <div className={`w-full flex ${showIcon ? 'justify-start' : 'flex-col items-start'} pe-10`}>
            {showLabel && <strong className="inline-block ml-2 mb-1" style={{
                fontSize: style.roleLabelFontSize,
                lineHeight: 'normal',
            }}>{roleLabel}</strong>}
            {showIcon && (
                <div className="flex flex-col items-center m-2">
                    <div className="w-fit h-fit p-1 rounded-3xl" style={{
                        backgroundColor: style.messageBackgroundColor,
                    }}>
                        {icon}
                    </div>
                </div>
            )}
            <div className="flex flex-col">
                <div className="py-1 px-3.5 shadow-sm w-fit max-w-full" style={{
                    backgroundColor: style.messageBackgroundColor,
                    borderRadius: style.messageBorderRadius,
                    fontSize: style.messageFontSize,
                }}>
                    {markdown ? (
                        <div className={"assistant-markdown-content"}
                             style={assistantMarkdownContentStyling}>
                            <AssistantMarkdownContent content={message} style={style}/>
                        </div>
                    ) : (
                        <div className="inline whitespace-pre-wrap">
                            {message}
                        </div>
                    )}
                </div>
                {!isStreaming && showCopy && (
                    <div
                        className="mt-2 flex items-center gap-2 self-end mr-3.5"
                        style={{
                            fontSize: style.roleLabelFontSize,
                            lineHeight: 'normal',
                        }}
                    >
                        <Feedback />
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                            aria-label={copied ? "Copied" : "Copy"}
                        >
                            {copied ? <ClipboardDocumentIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export {ChatWindowAssistantMessage};