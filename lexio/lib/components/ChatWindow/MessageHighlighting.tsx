import React from 'react';
import { HighlightedIdea, StreamChunk } from '../../types';
import { ChatWindowStyles } from './ChatWindow';
import { AssistantMarkdownContent } from './ChatWindowAssistantMessage';

/**
 * Hook to handle highlight click interactions
 * @param contentRef - Reference to the content container
 * @param onHighlightClick - Optional callback for highlight clicks
 */
export const useHighlightClickHandler = (
    contentRef: React.RefObject<HTMLDivElement>,
    onHighlightClick?: (ideaIndex: string) => void
) => {
    React.useEffect(() => {
        if (contentRef.current) {
            const highlights = contentRef.current.querySelectorAll('.idea-highlight');
            
            const handleHighlightClick = (e: Event) => {
                const target = e.target as HTMLElement;
                const ideaIndex = target.getAttribute('data-idea-index');
                
                if (ideaIndex !== null) {
                    onHighlightClick?.(ideaIndex);
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
 * Renders content with highlighted ideas
 * @param content - The content to render
 * @param ideas - Ideas to highlight
 * @returns Rendered content with highlights
 */
const renderHighlightedContentWithIdeas = (
    content: string, 
    ideasToUse: HighlightedIdea[],
    markdown: boolean,
    style: ChatWindowStyles,
    markdownStyling: React.CSSProperties
) => {
    if (ideasToUse && ideasToUse.length > 0) {
        let htmlContent = content;
        let hasHighlights = false;
        
        ideasToUse.forEach((idea: HighlightedIdea, index: number) => {
            const escapedText = idea.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedText})`, 'gi');
            
            if (regex.test(htmlContent)) {
                hasHighlights = true;
                htmlContent = htmlContent.replace(
                    regex, 
                    `<span 
                        style="background-color:${idea.color}; cursor: pointer;" 
                        class="idea-highlight" 
                        data-idea-index="${index}"
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
    ideas: HighlightedIdea[] | undefined,
    markdown: boolean,
    style: ChatWindowStyles,
    markdownStyling: React.CSSProperties
) => {
    // If content is a StreamChunk, extract the actual content and ideas
    if (typeof content === 'object' && content !== null) {
        const textContent = content.content || '';
        const streamIdeas = content.ideas || [];
        // Use stream ideas if available, otherwise fall back to props ideas
        const ideasToUse = streamIdeas.length > 0 ? streamIdeas : (ideas || []);
        
        return renderHighlightedContentWithIdeas(textContent, ideasToUse, markdown, style, markdownStyling);
    }

    return renderHighlightedContentWithIdeas(content, ideas || [], markdown, style, markdownStyling);
};
