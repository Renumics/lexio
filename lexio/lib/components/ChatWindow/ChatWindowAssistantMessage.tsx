import React, {ReactNode, useEffect, useMemo, useState} from "react";
import {ChatWindowStyles} from "./ChatWindow.tsx";
import Markdown from "react-markdown";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {docco} from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./AssistantMarkdownContent.css";
import {ClipboardIcon, ClipboardDocumentIcon} from "@heroicons/react/24/outline";
import {scaleFontSize} from "../../utils/scaleFontSize.tsx";
import { MessageFeedback } from "./MessageFeedback.tsx";
import { MessageHighlight } from "../../types.ts";
/**
 * Props for the AssistantMarkdownContent component.
 * @typedef {Object} AssistantMarkdownContentProps
 * @property {string} content - The markdown content to render.
 * @property {ChatWindowStyles} style - Styling options for the chat window.
 * @property {MessageHighlight[]} [highlights] - Array of highlight specifications.
 */
interface AssistantMarkdownContentProps {
    content: string;
    style: ChatWindowStyles;
    highlights?: MessageHighlight[];
}

/**
 * Applies highlight markers to the content based on the provided highlights array
 * @param content The original markdown content
 * @param highlights Array of highlight specifications
 * @returns Content with mark tags inserted at the specified positions
 */
const applyHighlights = (content: string, highlights?: MessageHighlight[]): string => {
    if (!highlights || highlights.length === 0) {
        return content;
    }

    // Sort highlights by start position (descending) to avoid position shifts when inserting tags
    const positionHighlights = highlights
        .filter(h => h.startChar !== undefined && h.endChar !== undefined)
        .sort((a, b) => (b.startChar as number) - (a.startChar as number));
    
    let result = content;
    
    // Insert mark tags for position-based highlights
    for (const highlight of positionHighlights) {
        const startChar = highlight.startChar as number;
        const endChar = highlight.endChar as number;
        
        if (startChar >= 0 && endChar > startChar && endChar <= result.length) {
            const before = result.substring(0, startChar);
            const highlighted = result.substring(startChar, endChar);
            const after = result.substring(endChar);
            
            // Find the original index of this highlight in the highlights array
            const originalIndex = highlights.indexOf(highlight);
            
            result = `${before}<mark 
                style="background-color: ${highlight.color}; padding: 0 2px; border-radius: 2px; cursor: pointer;" 
                data-highlight-index="${originalIndex}"
                data-highlight-type="position"
                >${highlighted}</mark>${after}`;
        }
    }
    
    // Handle text-based highlights
    const textHighlights = highlights.filter(h => h.text);
    for (const highlight of textHighlights) {
        const text = highlight.text as string;
        const regex = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        
        // Find the original index of this highlight in the highlights array
        const originalIndex = highlights.indexOf(highlight);
        
        result = result.replace(regex, `<mark 
            style="background-color: ${highlight.color}; padding: 0 2px; border-radius: 2px; cursor: pointer;" 
            data-highlight-index="${originalIndex}"
            data-highlight-type="text"
            >${text}</mark>`);
    }
    
    return result;
}

/**
 * Renders markdown content with enhanced features such as syntax highlighting and copy functionality.
 *
 * @param {AssistantMarkdownContentProps} props - The props for the component.
 * @returns {JSX.Element} The rendered markdown content.
 *
 * @internal
 */
const AssistantMarkdownContent: React.FC<AssistantMarkdownContentProps> = ({content, style, highlights}) => {
    // Check if content is an object with a content property
    const rawContent = typeof content === 'object' && content !== null && 'content' in content
        ? (content as any).content
        : content;
    
    const markdownRef = React.useRef<HTMLDivElement>(null);
    
    // Create mock highlights for testing if no highlights are provided
    const testHighlights = highlights && highlights.length > 0 ? highlights : [
        // Position-based highlight (first 10 characters)
        { 
            startChar: 0, 
            endChar: Math.min(10, rawContent.length), 
            color: 'rgba(255, 255, 0, 0.3)' // Light yellow
        },
        // Position-based highlight for "work traffic" if it exists
        ...((() => {
            const lowerContent = rawContent.toLowerCase();
            const workTrafficIndex = lowerContent.indexOf('traffic');
            if (workTrafficIndex >= 0) {
                return [{
                    startChar: workTrafficIndex,
                    endChar: workTrafficIndex + 'traffic'.length,
                    color: 'rgba(0, 255, 0, 0.2)' // Light green
                }];
            }
            return [];
        })())
    ];
    
    // Handle click events on mark elements
    const handleMarkClick = React.useCallback((event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName.toLowerCase() === 'mark') {
            const highlightType = target.getAttribute('data-highlight-type');
            const highlightIndex = parseInt(target.getAttribute('data-highlight-index') || '-1', 10);
            
            if (highlightType === 'position') {
                const positionHighlights = testHighlights.filter(h => h.startChar !== undefined);
                if (highlightIndex >= 0 && highlightIndex < positionHighlights.length) {
                    console.log('Position highlight clicked:', positionHighlights[highlightIndex]);
                }
            } else if (highlightType === 'text') {
                const textHighlights = testHighlights.filter(h => h.text);
                if (highlightIndex >= 0 && highlightIndex < textHighlights.length) {
                    console.log('Text highlight clicked:', textHighlights[highlightIndex]);
                }
            }
        }
    }, [testHighlights]);
    
    // Set up event listener for mark clicks
   useEffect(() => {
        const markdownElement = markdownRef.current;
        if (markdownElement) {
            markdownElement.addEventListener('click', handleMarkClick);
            
            return () => {
                markdownElement.removeEventListener('click', handleMarkClick);
            };
        }
    }, [handleMarkClick]);
    
    // Apply highlights to the content
    const markdownContent = applyHighlights(rawContent, testHighlights);
    
    return (
        <div ref={markdownRef}>
            <Markdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
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
            >
                {markdownContent}
            </Markdown>
        </div>
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
 * @property {boolean} [showFeedback] - Flag to show or hide the feedback buttons.
 * @property {MessageHighlight[]} [highlights] - Array of highlight specifications.
 */
interface ChatWindowAssistantMessageProps {
    message: string;
    messageId: string | null;
    style: ChatWindowStyles;
    roleLabel: string;
    showRoleIndicator: boolean;
    icon?: ReactNode;
    markdown?: boolean;
    isStreaming?: boolean;
    showCopy?: boolean;
    showFeedback?: boolean;
    highlights?: MessageHighlight[];
}

/**
 * Renders an assistant message within the chat window, supporting markdown, icons, and copy functionality.
 *
 * @param {ChatWindowAssistantMessageProps} props - The props for the component.
 * @returns {JSX.Element} The rendered assistant message.
 */
const ChatWindowAssistantMessage: React.FC<ChatWindowAssistantMessageProps> = ({
                                                                                   message,
                                                                                   messageId,
                                                                                   style,
                                                                                   roleLabel,
                                                                                   showRoleIndicator,
                                                                                   icon,
                                                                                   markdown,
                                                                                   isStreaming,
                                                                                   showCopy,
                                                                                   showFeedback,
                                                                                   highlights
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
                            <AssistantMarkdownContent 
                                content={message} 
                                style={style} 
                                highlights={highlights}
                            />
                        </div>
                    ) : (
                        <div className="inline whitespace-pre-wrap">
                            {typeof message === 'object' && message !== null && 'content' in message
                                ? (message as any).content
                                : message}
                        </div>
                    )}
                </div>
                {messageId && !isStreaming && (
                    <div
                        className="mt-2 flex items-center gap-2 self-end mr-3.5"
                        style={{
                            fontSize: style.roleLabelFontSize,
                            lineHeight: 'normal',
                        }}
                    >
                        {showFeedback && <MessageFeedback messageId={messageId} messageContent={message} />}
                        {showCopy && (
                            <button
                                onClick={handleCopy}
                                className="p-1.5 rounded-full transition-colors bg-gray-100 text-gray-400 hover:bg-gray-50"
                                aria-label={copied ? "Copied" : "Copy"}
                            >
                                {copied ? <ClipboardDocumentIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export {ChatWindowAssistantMessage};