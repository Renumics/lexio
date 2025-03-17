import React from 'react';
import { MessageHighlight, StreamChunk } from '../../types';
import { ChatWindowStyles } from './ChatWindow';
import { AssistantMarkdownContent } from './AssistantMarkdownContent';

/**
 * Renders content with highlights
 */
const renderHighlightedContentWithHighlights = (
    content: string, 
    highlightsToUse: MessageHighlight[],
    markdown: boolean,
    style: ChatWindowStyles,
    markdownStyling: React.CSSProperties
) => {
    if (highlightsToUse && highlightsToUse.length > 0) {
        // Split content into segments and create React elements
        let segments: React.ReactNode[] = [content];
        
        highlightsToUse.forEach((highlight: MessageHighlight, index: number) => {
            segments = segments.flatMap(segment => {
                if (typeof segment !== 'string') return [segment];
                
                const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedText})`, 'gi');
                const parts = segment.split(regex);
                
                return parts.map((part, i) => {
                    if (part.toLowerCase() === highlight.text.toLowerCase()) {
                        return (
                            <span
                                key={`${index}-${i}`}
                                style={{ backgroundColor: highlight.color }}
                            >
                                {part}
                            </span>
                        );
                    }
                    return part;
                });
            });
        });

        if (segments.some(segment => React.isValidElement(segment))) {
            return <div className="whitespace-pre-wrap">{segments}</div>;
        }
    }

    // If no highlights or markdown is enabled, use existing rendering
    return markdown ? (
        <div className="assistant-markdown-content" style={markdownStyling}>
            <AssistantMarkdownContent 
                content={typeof content === 'object' && content !== null && 'content' in content 
                    ? (content as StreamChunk).content || '' 
                    : String(content)} 
                style={style}
            />
        </div>
    ) : (
        <div className="inline whitespace-pre-wrap">
            {content}
        </div>
    );
};

/**
 * Renders content with highlights, handling both streaming and static content
 */
export const renderHighlightedContent = (
    content: string | StreamChunk,
    highlights: MessageHighlight[] | undefined,
    markdown: boolean,
    style: ChatWindowStyles,
    markdownStyling: React.CSSProperties
) => {
    // If content is a StreamChunk, extract the actual content and highlights
    if (typeof content === 'object' && content !== null) {
        const textContent = content.content || '';
        const streamHighlights = content.highlights || [];
        // Use stream highlights if available, otherwise fall back to props highlights
        const highlightsToUse = streamHighlights.length > 0 ? streamHighlights : (highlights || []);
        
        return renderHighlightedContentWithHighlights(textContent, highlightsToUse, markdown, style, markdownStyling);
    }

    return renderHighlightedContentWithHighlights(content, highlights || [], markdown, style, markdownStyling);
};
