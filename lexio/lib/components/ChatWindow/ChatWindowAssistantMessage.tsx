import React, {ReactNode, useMemo, useState, useContext, useEffect} from "react";
import {ChatWindowStyles} from "./ChatWindow.tsx";
import "./AssistantMarkdownContent.css";
import {ClipboardIcon, ClipboardDocumentIcon} from "@heroicons/react/24/outline";
import {scaleFontSize} from "../../utils/scaleFontSize.tsx";
import {MessageFeedback} from "./MessageFeedback.tsx";
import {MessageHighlight, Citation} from '../../types';
import {renderHighlightedContent} from './MessageHighlighting';
import { useSources } from '../../hooks';
import { ChatWindowContext } from './ChatWindowContext';

/**
 * Props for the ChatWindowAssistantMessage component.
 * @typedef {Object} ChatWindowAssistantMessageProps
 * @property {string} message - The assistant message content.
 * @property {string | null} messageId - ID of the message, null for streaming messages
 * @property {ChatWindowStyles} style - Styling options for the chat window / assistant message
 * @property {string} roleLabel - Label indicating the role of the assistant.
 * @property {boolean} showRoleIndicator - Flag to show or hide the role indicator.
 * @property {ReactNode} [icon] - Optional icon to display alongside the message.
 * @property {boolean} [markdown] - Flag indicating if the message content is markdown.
 * @property {boolean} [isStreaming] - Flag indicating if the message is being streamed.
 * @property {boolean} [showCopy] - Flag to show or hide the copy button.
 * @property {boolean} [showFeedback] - Flag to show or hide the feedback buttons.
 * @property {MessageHighlight[]} [highlights] - Highlights to highlight in the message, used for completed messages
 * @property {Citation[]} [citations] - Citations to link message portions to source documents
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
    citations?: Citation[];
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
                                                                                   highlights = [],
                                                                                   citations = []
                                                                               }) => {
    const context = useContext(ChatWindowContext);
    const { setSelectedSource } = useSources('ChatWindow');
    const [copied, setCopied] = useState(false);
    // show icon if showRoleIndicator is true and icon is not null
    const showIcon = showRoleIndicator && !!icon;
    // show label if showRoleIndicator is true and roleLabel is not null and icon is not shown
    const showLabel = showRoleIndicator && !!roleLabel && !showIcon;

    // Update context with highlights/citations from props
    useEffect(() => {
        if (highlights?.length > 0 || citations?.length > 0) {
            context?.setHighlights(highlights);
            context?.setCitations(citations);
        }
    }, [highlights, citations]);

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

    const handleHighlightClick = (positionKey: string) => {
        const [startChar, endChar] = positionKey.split(':').map(Number);
        
        // Find matching citation by checking all types of overlaps
        const citation = citations.find(c => 
            (c.messageStartChar <= startChar && c.messageEndChar >= startChar) ||
            (c.messageStartChar <= endChar && c.messageEndChar >= endChar) ||
            (startChar <= c.messageStartChar && endChar >= c.messageEndChar)
        );

        if (citation) {
            setSelectedSource(citation.sourceId, {
                highlight: citation.highlight,
                page: citation.highlight.page
            });
        }
    };

    console.log('ChatWindowAssistantMessage rendering with:', {
        message,
        highlights,
        citations
    });

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
                    {renderHighlightedContent(
                        {
                            content: message,
                            highlights: highlights,
                            citations: citations
                        },
                        markdown || false,
                        style,
                        assistantMarkdownContentStyling,
                        handleHighlightClick
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