import React, { ReactNode, useMemo, useState } from "react";
import { ChatWindowStyles } from "./ChatWindow.tsx";
import Markdown from "react-markdown";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";
import "./AssistantMarkdownContent.css";
import {ClipboardIcon, ClipboardDocumentIcon} from "@heroicons/react/24/outline";
import {scaleFontSize, addOpacity} from "../../utils/scaleFontSize.tsx";
import { MessageFeedback } from "./MessageFeedback.tsx";
import { MessageHighlight } from "../../types.ts";
import { useCitations } from '../../hooks/hooks';
import { useHighlightManager } from './highlightUtils';

/**
 * Props for the SourcesFootnote component.
 * @typedef {Object} SourcesFootnoteProps
 * @property {MessageHighlight[]} highlights - Array of highlight specifications.
 * @property {ChatWindowStyles} style - Styling options for the chat window.
 */
interface SourcesFootnoteProps {
    highlights: MessageHighlight[];
    style: ChatWindowStyles;
}

/**
 * Renders a simple preview of sources as footnotes when highlights are present.
 * Shows up to 3 sources and abbreviates if there are more.
 *
 * @param {SourcesFootnoteProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered sources footnote or null if no highlights with citationId.
 */
const SourcesFootnote: React.FC<SourcesFootnoteProps> = ({ 
    highlights,
    style 
}) => {
    const { getCitationById, navigateToCitation } = useCitations('ChatWindow');
    
    // Filter highlights that have citationIds
    const highlightsWithCitations = highlights.filter(h => h.citationId);
    
    if (highlightsWithCitations.length === 0) {
        return null;
    }
    
    // Take only the first 3 for display
    const displayHighlights = highlightsWithCitations.slice(0, 3);
    const hasMoreHighlights = highlightsWithCitations.length > 3;

    // Helper to truncate long titles
    const truncateTitle = (title: string, maxLength: number = 30) => {
        return title.length > maxLength 
            ? title.substring(0, maxLength) + '...' 
            : title;
    };
    
    return (
        <div className="text-xs mt-2 text-gray-500" style={{ 
            fontSize: scaleFontSize(style.messageFontSize || '1rem', 0.7),
        }}>
            <div className="font-medium mb-1">Sources:</div>
            {displayHighlights.map((highlight, index) => {
                const citation = highlight.citationId ? getCitationById(highlight.citationId) : null;
                
                // Try to get a source name for display
                let sourceName = 'Source ' + (index + 1);
                if (citation) {
                    if ('sourceId' in citation && citation.sourceId) {
                        // Use last part of sourceId if it has slashes or dots
                        if (citation.sourceId.includes('/') || citation.sourceId.includes('.')) {
                            const parts = citation.sourceId.split(/[\/\.]/);
                            sourceName = parts[parts.length - 1];
                        } else {
                            sourceName = citation.sourceId;
                        }
                    }
                }
                
                return (
                    <div 
                        key={index} 
                        className="cursor-pointer hover:underline flex items-center"
                        style={{ 
                            borderLeft: `2px solid ${highlight.color}`,
                            paddingLeft: '6px',
                            marginBottom: '4px'
                        }}
                        onClick={() => {
                            if (highlight.citationId) {
                                navigateToCitation(highlight.citationId);
                            }
                        }}
                    >
                        <span>{truncateTitle(sourceName)}</span>
                        {citation?.sourceHighlight?.page && (
                            <span className="ml-1 text-gray-400">p.{citation.sourceHighlight.page}</span>
                        )}
                    </div>
                );
            })}
            {hasMoreHighlights && (
                <div className="text-gray-400 font-medium mt-1">
                    +{highlightsWithCitations.length - 3} more sources
                </div>
            )}
        </div>
    );
};

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
 * Renders markdown content with enhanced features such as syntax highlighting and copy functionality.
 *
 * @param {AssistantMarkdownContentProps} props - The props for the component.
 * @returns {JSX.Element} The rendered markdown content.
 *
 * @internal
 */
const AssistantMarkdownContent: React.FC<AssistantMarkdownContentProps> = ({ 
    content, 
    style, 
    highlights
}) => {
    const { navigateToCitation } = useCitations('ChatWindow');
    const markdownRef = React.useRef<HTMLDivElement>(null);
    
    // Use the highlight manager from our utility
    useHighlightManager(
        content,
        highlights,
        markdownRef,
        navigateToCitation
    );
    
    // Styles for the markdown content
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
        <div ref={markdownRef} style={assistantMarkdownContentStyling}>
            <Markdown
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
                    code({ node, className, children, ...props }) {
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
                                        wrapLongLines={true}
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
                {content}
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

    console.log(highlights)

    const [copied, setCopied] = useState(false);
    // show icon if showRoleIndicator is true and icon is not null
    const showIcon = showRoleIndicator && !!icon;
    // show label if showRoleIndicator is true and roleLabel is not null and icon is not shown
    const showLabel = showRoleIndicator && !!roleLabel && !showIcon;

    // No need for complex type checking since message is always a string
    const messageContent = message;
    const messageHighlights = highlights || [];

    /**
     * Handles copying the message content to the clipboard.
     */
    const handleCopy = () => {
        navigator.clipboard.writeText(messageContent);
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
            {showLabel && (
                <strong className="inline-block ml-2 mb-1" style={{
                    fontSize: style.roleLabelFontSize,
                    lineHeight: 'normal',
                }}>
                    {roleLabel}
                </strong>
            )}
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
                                content={messageContent}
                                style={style}
                                highlights={messageHighlights}
                            />
                        </div>
                    ) : (
                        <div className="inline whitespace-pre-wrap">
                            {messageContent}
                        </div>
                    )}
                    
                    {/* Show sources footnote when highlights with citations are present */}
                    {!isStreaming && messageHighlights.length > 0 && messageHighlights.some(h => h.citationId) && (
                        <SourcesFootnote 
                            highlights={messageHighlights} 
                            style={style} 
                        />
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
                        {showFeedback && <MessageFeedback messageId={messageId} messageContent={messageContent} />}
                        {showCopy && (
                            <button
                                onClick={handleCopy}
                                className="p-1.5 rounded-full transition-colors"
                                style={{
                                    backgroundColor: copied
                                        ? addOpacity(style.accent || '#4b5563', 0.15)
                                        : addOpacity(style.accent || '#9ca3af', 0.1),
                                    color: copied
                                        ? style.accent
                                        : addOpacity(style.color || '#6b7280', 0.7),
                                    borderRadius: '9999px'
                                }}
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

export { ChatWindowAssistantMessage };