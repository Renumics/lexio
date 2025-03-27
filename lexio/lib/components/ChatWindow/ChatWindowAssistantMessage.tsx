import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { ChatWindowStyles } from "./ChatWindow.tsx";
import Markdown from "react-markdown";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";
import "./AssistantMarkdownContent.css";
import { ClipboardIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { scaleFontSize } from "../../utils/scaleFontSize.tsx";
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
 * Renders markdown content with enhanced features such as syntax highlighting and copy functionality.
 *
 * @param {AssistantMarkdownContentProps} props - The props for the component.
 * @returns {JSX.Element} The rendered markdown content.
 *
 * @internal
 */
const AssistantMarkdownContent: React.FC<AssistantMarkdownContentProps> = ({ content, style, highlights }) => {
    // Check if content is an object with a content property
    const rawContent = typeof content === 'object' && content !== null && 'content' in content
        ? (content as any).content
        : content;

    const markdownRef = React.useRef<HTMLDivElement>(null);

    // Create highlights array from provided highlights
    const highlightsToUse = highlights || [];

    // Handle click events on mark elements
    const handleMarkClick = React.useCallback((event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName.toLowerCase() === 'mark') {
            const highlightIndex = parseInt(target.getAttribute('data-highlight-index') || '-1', 10);
            if (highlightIndex >= 0 && highlightIndex < highlightsToUse.length) {
                console.log('Highlight clicked:', highlightsToUse[highlightIndex]);
            }
        }
    }, [highlightsToUse]);

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

    // Store the original text segments to highlight
    const textSegmentsToHighlight = useMemo(() => {
        return highlightsToUse
            .filter(h => h.startChar !== undefined && h.endChar !== undefined)
            .map(highlight => {
                const startChar = highlight.startChar as number;
                const endChar = highlight.endChar as number;
                if (startChar >= 0 && endChar > startChar && endChar <= rawContent.length) {
                    // Extract the text to highlight
                    const text = rawContent.substring(startChar, endChar);

                    // For the first highlight that might include markdown formatting
                    // Try to extract the actual content without markdown syntax
                    let cleanText = text;
                    
                    // Handle heading syntax
                    if (startChar === 0 && text.startsWith('#')) {
                        cleanText = text.replace(/^#+\s*/, '');
                    }

                    return {
                        text: cleanText,
                        color: highlight.color,
                        index: highlightsToUse.indexOf(highlight)
                    };
                }
                return null;
            })
            .filter(Boolean);
    }, [rawContent, highlightsToUse]);

    // Apply highlights after markdown rendering
    useEffect(() => {
        if (!markdownRef.current || textSegmentsToHighlight.length === 0) return;

        const container = markdownRef.current;

        // Apply text-based highlights from position-based highlights
        for (const segment of textSegmentsToHighlight) {
            if (!segment) continue;

            // Find all text nodes
            const allTextNodes: Text[] = [];
            const walker = document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT,
                null
            );

            let node: Node | null;
            while ((node = walker.nextNode()) !== null) {
                if (node.nodeType === Node.TEXT_NODE) {
                    allTextNodes.push(node as Text);
                }
            }

            // Process each text node to find all occurrences
            for (let i = 0; i < allTextNodes.length; i++) {
                const textNode: Text = allTextNodes[i];
                const nodeText = textNode.textContent || '';
                let index = nodeText.indexOf(segment.text);

                // If we find the text in this node
                if (index >= 0) {
                    // We need to handle the case where the same text appears multiple times in a node
                    // Each time we find and highlight text, the node structure changes

                    // Split the text node and insert our mark
                    const beforeText: Text = textNode.splitText(index);
                    const afterText: Text = beforeText.splitText(segment.text.length);

                    const markElement = document.createElement('mark');
                    markElement.style.backgroundColor = segment.color;
                    markElement.style.padding = '0 2px';
                    markElement.style.borderRadius = '2px';
                    markElement.style.cursor = 'pointer';
                    markElement.dataset.highlightIndex = segment.index.toString();

                    // Replace the text node with our mark
                    beforeText.parentNode?.replaceChild(markElement, beforeText);
                    markElement.appendChild(beforeText);

                    // After splitting and replacing, we need to update our node reference
                    // The next node to check is afterText
                    allTextNodes[i] = afterText;
                    i--; // Reprocess the same index since we've updated the node
                }
            }

            // Special handling for the first highlight if it wasn't found
            if (segment.index === 0) {
                let found = false;
                for (const node of allTextNodes) {
                    if (node.parentNode?.querySelector('mark[data-highlight-index="0"]')) {
                        found = true;
                        break;
                    }
                }

                if (!found && allTextNodes.length > 0) {
                    // For the first highlight, try to find the first text node
                    const firstNode = allTextNodes[0];
                    const nodeText = firstNode.textContent || '';

                    // Highlight the beginning of the first text node
                    const length = Math.min(segment.text.length, nodeText.length);
                    if (length > 0) {
                        const beforeText = firstNode.splitText(0);
                        beforeText.splitText(length);

                        const markElement = document.createElement('mark');
                        markElement.style.backgroundColor = segment.color;
                        markElement.style.padding = '0 2px';
                        markElement.style.borderRadius = '2px';
                        markElement.style.cursor = 'pointer';
                        markElement.dataset.highlightIndex = segment.index.toString();

                        // Replace the text node with our mark
                        beforeText.parentNode?.replaceChild(markElement, beforeText);
                        markElement.appendChild(beforeText);
                    }
                }
            }
        }
    }, [textSegmentsToHighlight]);

    return (
        <div ref={markdownRef}>
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
                {rawContent}
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

export { ChatWindowAssistantMessage };