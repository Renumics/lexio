import React from 'react';
import { MessageHighlight, StreamChunk } from '../../types';
import { ChatWindowStyles } from './ChatWindow';
import { AssistantMarkdownContent } from './AssistantMarkdownContent';

interface HighlightOverlayProps {
    text: string;
    highlight: MessageHighlight;
    highlights: MessageHighlight[];
    onHighlightClick?: (highlightIndex: string) => void;
    startChar: number;
    endChar: number;
}

const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
    text,
    highlight,
    highlights,
    onHighlightClick,
    startChar,
    endChar
}) => {
    const handleClick = () => {
        onHighlightClick?.(`${startChar}:${endChar}`);
    };

    return (
        <span
            onClick={handleClick}
            style={{
                backgroundColor: highlight.color,
                cursor: 'pointer',
            }}
            className="highlight-element"
        >
            {text}
        </span>
    );
};

const HighlightedContent: React.FC<{
    content: string;
    highlights: MessageHighlight[];
    markdown: boolean;
    style: ChatWindowStyles;
    markdownStyling: React.CSSProperties;
    onHighlightClick?: (highlightIndex: string) => void;
}> = ({ content, highlights, markdown, style, markdownStyling, onHighlightClick }) => {
    if (!highlights.length) {
        return markdown ? (
            <div className="assistant-markdown-content" style={markdownStyling}>
                <AssistantMarkdownContent 
                    content={content} 
                    style={style}
                />
            </div>
        ) : (
            <div className="inline whitespace-pre-wrap">
                {content}
            </div>
        );
    }

    const segments: { text: string; highlight?: MessageHighlight; startChar?: number; endChar?: number }[] = [];
    let currentPosition = 0;

    const sortedHighlights = [...highlights].sort((a, b) => a.startChar - b.startChar);

    sortedHighlights.forEach((highlight) => {
        const beforeText = content.slice(currentPosition, highlight.startChar);
        if (beforeText) {
            segments.push({ text: beforeText });
        }

        segments.push({
            text: content.slice(highlight.startChar, highlight.endChar),
            highlight,
            startChar: highlight.startChar,
            endChar: highlight.endChar
        });

        currentPosition = highlight.endChar;
    });

    if (currentPosition < content.length) {
        segments.push({
            text: content.slice(currentPosition)
        });
    }

    return (
        <div className="whitespace-pre-wrap">
            {segments.map((segment, idx) => 
                segment.highlight ? (
                    <HighlightOverlay
                        key={idx}
                        text={segment.text}
                        highlight={segment.highlight}
                        highlights={highlights}
                        startChar={segment.startChar!}
                        endChar={segment.endChar!}
                        onHighlightClick={onHighlightClick}
                    />
                ) : (
                    <span key={idx}>{segment.text}</span>
                )
            )}
        </div>
    );
};

/**
 * Renders content with highlights, handling both streaming and static content
 */
export const renderHighlightedContent = (
    content: string | StreamChunk,
    markdown: boolean,
    style: ChatWindowStyles,
    markdownStyling: React.CSSProperties,
    onHighlightClick?: (highlightIndex: string) => void
) => {
    // Add logging to see what content we receive
    console.log('renderHighlightedContent received:', {
        content,
        isObject: typeof content === 'object',
        isString: typeof content === 'string'
    });

    if (typeof content === 'object' && content !== null) {
        const textContent = content.content || '';
        const streamHighlights = content.highlights || [];
        const highlightsToUse = streamHighlights.length > 0 ? streamHighlights : [];
        
        console.log('StreamChunk highlights:', {
            streamHighlights,
            highlightsToUse
        });

        return (
            <HighlightedContent
                content={textContent}
                highlights={highlightsToUse}
                markdown={markdown}
                style={style}
                markdownStyling={markdownStyling}
                onHighlightClick={onHighlightClick}
            />
        );
    }

    // Add logging for string content case
    console.log('String content case, no highlights');

    return (
        <HighlightedContent
            content={content}
            highlights={[]}
            markdown={markdown}
            style={style}
            markdownStyling={markdownStyling}
            onHighlightClick={onHighlightClick}
        />
    );
};
