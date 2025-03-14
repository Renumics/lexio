import React from 'react';
import { MessageHighlight, StreamChunk } from '../../types';
import { ChatWindowStyles } from './ChatWindow';
import { AssistantMarkdownContent } from './AssistantMarkdownContent';

/**
 * Hook to handle highlight click interactions
 * @param contentRef - Reference to the content container
 * @param onHighlightClick - Optional callback for highlight clicks
 */
export const useHighlightClickHandler = (
    contentRef: React.RefObject<HTMLDivElement>,
    onHighlightClick?: (highlightIndex: string) => void
) => {
    React.useEffect(() => {
        if (contentRef.current) {
            const highlights = contentRef.current.querySelectorAll('.highlight-element');
            
            const handleHighlightClick = (e: Event) => {
                const target = e.target as HTMLElement;
                const highlightIndex = target.getAttribute('data-highlight-index');
                
                if (highlightIndex !== null) {
                    onHighlightClick?.(highlightIndex);
                }
            };
            
            highlights.forEach(highlight => {
                highlight.addEventListener('click', handleHighlightClick);
            });
            
            return () => {
                highlights.forEach(highlight => {
                    highlight.removeEventListener('click', handleHighlightClick);
                });
            };
        }
    }, [contentRef, onHighlightClick]);
};

/**
 * Renders content with highlights
 * @param content - The content to render
 * @param highlights - Highlights to apply
 * @returns Rendered content with highlights
 */
const renderHighlightedContentWithHighlights = (
    content: string, 
    highlightsToUse: MessageHighlight[],
    markdown: boolean,
    style: ChatWindowStyles,
    markdownStyling: React.CSSProperties
) => {
    if (highlightsToUse && highlightsToUse.length > 0) {
        let htmlContent = content;
        let hasHighlights = false;
        
        highlightsToUse.forEach((highlight: MessageHighlight, index: number) => {
            const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedText})`, 'gi');
            
            if (regex.test(htmlContent)) {
                hasHighlights = true;
                htmlContent = htmlContent.replace(
                    regex, 
                    `<span 
                        style="background-color:${highlight.color}; cursor: pointer;" 
                        class="highlight-element" 
                        data-highlight-index="${index}"
                    >$1</span>`
                );
            }
        });

        if (hasHighlights) {
            return (
                <div 
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    className="whitespace-pre-wrap"
                />
            );
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
