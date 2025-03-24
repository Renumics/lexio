import React from 'react';
import { MessageHighlight, StreamChunk, Citation, UUID } from '../../types';
import { ChatWindowStyles } from './ChatWindow';
import { AssistantMarkdownContent } from './AssistantMarkdownContent';
import { useSetAtom } from 'jotai';
import { dispatchAtom } from '../../state/rag-state';

/**
 * Renders content with highlights
 */
const renderHighlightedContentWithHighlights = (
    content: string, 
    highlightsToUse: MessageHighlight[],
    citations: Citation[] | undefined,
    markdown: boolean,
    style: ChatWindowStyles,
    markdownStyling: React.CSSProperties
) => {
    const dispatch = useSetAtom(dispatchAtom);

    const handleHighlightClick = (highlight: MessageHighlight) => {
        if (!citations) return;
        
        // Find the citation that matches this highlight
        const citation = citations.find(c => 
            c.messageHighlight.startChar === highlight.startChar && 
            c.messageHighlight.endChar === highlight.endChar
        );

        console.log("Citation found:", citation);

        if (citation) {
            // First select the source
            dispatch({
                type: 'SET_SELECTED_SOURCE',
                sourceId: citation.sourceId as UUID,
                source: 'CustomComponent',
                sourceObject: {
                    id: citation.sourceId as UUID,
                    title: '',  // These will be merged with existing source
                    type: 'text',
                    metadata: {
                        page: citation.sourceHighlight.page
                    }
                }
            }, false);
        }
    };

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

            // Add highlighted segment with click handler
            segments.push(
                <span
                    key={`highlight-${index}`}
                    style={{ 
                        backgroundColor: highlight.color,
                        cursor: citations ? 'pointer' : 'default'
                    }}
                    onClick={() => handleHighlightClick(highlight)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleHighlightClick(highlight);
                        }
                    }}
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
        
        return renderHighlightedContentWithHighlights(textContent, highlightsToUse, streamCitations, markdown, style, markdownStyling);
    }

    return renderHighlightedContentWithHighlights(content, highlights || [], undefined, markdown, style, markdownStyling);
};

