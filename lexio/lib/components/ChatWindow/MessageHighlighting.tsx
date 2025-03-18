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
        // Sort highlights by startChar to process them in order
        const sortedHighlights = [...highlightsToUse].sort((a, b) => a.startChar - b.startChar);
        
        let lastIndex = 0;
        const segments: React.ReactNode[] = [];

        // Process each highlight in order
        sortedHighlights.forEach((highlight, index) => {
            // Add non-highlighted text before this highlight
            if (highlight.startChar > lastIndex) {
                segments.push(content.slice(lastIndex, highlight.startChar));
            }

            // Add highlighted segment
            segments.push(
                <span
                    key={`highlight-${index}`}
                    style={{ backgroundColor: highlight.color }}
                >
                    {content.slice(highlight.startChar, highlight.endChar)}
                </span>
            );

            lastIndex = highlight.endChar;
        });

        // Add any remaining text after the last highlight
        if (lastIndex < content.length) {
            segments.push(content.slice(lastIndex));
        }

        return <div className="whitespace-pre-wrap">{segments}</div>;
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
        const streamCitations = content.citations || [];
        // Extract highlights from citations
        const highlightsToUse = streamCitations.map(citation => citation.messageHighlight);
        
        return renderHighlightedContentWithHighlights(textContent, highlightsToUse, markdown, style, markdownStyling);
    }

    return renderHighlightedContentWithHighlights(content, highlights || [], markdown, style, markdownStyling);
};
