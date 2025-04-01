import React, { useEffect } from 'react';
import { MessageHighlight } from '../../types';

/**
 * Normalize text by removing markdown and extra whitespace
 * @param text Text to normalize
 * @returns Normalized text without markdown formatting
 */
export const normalizeText = (text: string): string => {
    let normalized = text;
    
    // Remove markdown formatting
    normalized = normalized.replace(/^#+\s+/gm, ''); // Headers
    normalized = normalized.replace(/(\*\*|__)(.*?)\1/g, '$2'); // Bold
    normalized = normalized.replace(/(\*|_)(.*?)\1/g, '$2'); // Italic
    normalized = normalized.replace(/`([^`]+)`/g, '$1'); // Inline code
    normalized = normalized.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
    normalized = normalized.replace(/^>\s+/gm, ''); // Blockquotes
    normalized = normalized.replace(/^(\s*[-+*]|\s*\d+\.)\s+/gm, ''); // List markers
    
    // Normalize whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized;
};

/**
 * Lightly normalize text by only removing the most basic markdown
 * @param text Text to normalize
 * @returns Lightly normalized text
 */
export const lightNormalizeText = (text: string): string => {
    // Only remove the most basic markdown that would definitely affect matching
    let normalized = text;
    normalized = normalized.replace(/`([^`]+)`/g, '$1'); // Inline code
    normalized = normalized.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
    
    return normalized;
};

/**
 * Get all text nodes in a container, filtering out certain elements
 * @param node Root node to search
 * @returns Array of text nodes
 */
export const getAllTextNodes = (node: Node): Text[] => {
    const textNodes: Text[] = [];
    
    const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Skip empty text nodes
                if (!node.textContent || node.textContent.trim() === '') {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // Skip text nodes in script and style elements
                const parent = node.parentElement;
                if (parent && (
                    parent.tagName === 'SCRIPT' || 
                    parent.tagName === 'STYLE' || 
                    parent.tagName === 'NOSCRIPT'
                )) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    let currentNode: Node | null;
    while (currentNode = walker.nextNode()) {
        textNodes.push(currentNode as Text);
    }
    
    return textNodes;
};

/**
 * Find exact text matches and return ranges
 * @param textNodes Array of text nodes to search
 * @param textToFind Text to find
 * @returns Array of ranges where the text was found
 */
export const findTextRanges = (textNodes: Text[], textToFind: string): Range[] => {
    const ranges: Range[] = [];
    const textToFindLower = textToFind.toLowerCase();
    
    // First, try to find the text across nodes
    let combinedText = '';
    const nodeMap: {node: Text, startIndex: number, endIndex: number}[] = [];
    
    textNodes.forEach(node => {
        const nodeText = node.textContent || '';
        const startIndex = combinedText.length;
        combinedText += nodeText;
        const endIndex = combinedText.length;
        
        nodeMap.push({
            node,
            startIndex,
            endIndex
        });
    });
    
    // Search for the text in the combined content
    const combinedTextLower = combinedText.toLowerCase();
    let position = 0;
    let index;
    
    while ((index = combinedTextLower.indexOf(textToFindLower, position)) !== -1) {
        const startPos = index;
        const endPos = index + textToFind.length;
        
        // Find which nodes contain the start and end
        const startNodeInfo = nodeMap.find(info => 
            startPos >= info.startIndex && startPos < info.endIndex);
        const endNodeInfo = nodeMap.find(info => 
            endPos > info.startIndex && endPos <= info.endIndex);
        
        if (startNodeInfo && endNodeInfo) {
            const range = document.createRange();
            
            // Calculate offsets within the nodes
            const startOffset = startPos - startNodeInfo.startIndex;
            const endOffset = endPos - endNodeInfo.startIndex;
            
            range.setStart(startNodeInfo.node, startOffset);
            range.setEnd(endNodeInfo.node, endOffset);
            
            ranges.push(range);
        }
        
        position = index + textToFind.length;
    }
    
    return ranges;
};

/**
 * Find fuzzy text matches for when exact matching fails
 * @param textNodes Array of text nodes to search
 * @param textToFind Text to find
 * @returns Array of ranges where the text was found
 */
export const findFuzzyTextRanges = (textNodes: Text[], textToFind: string): Range[] => {
    const ranges: Range[] = [];
    const words = textToFind.split(/\s+/).filter(w => w.length > 3);
    
    if (words.length === 0) return ranges;
    
    // Try to find the longest words
    words.sort((a, b) => b.length - a.length);
    
    // Try to find the top 2 longest words
    const searchWords = words.slice(0, Math.min(2, words.length));
    
    for (const word of searchWords) {
        for (const node of textNodes) {
            const nodeText = node.textContent || '';
            const wordIndex = nodeText.toLowerCase().indexOf(word.toLowerCase());
            
            if (wordIndex >= 0) {
                // Found a match for this word
                const range = document.createRange();
                
                // Try to expand to include surrounding words
                let startOffset = wordIndex;
                let endOffset = wordIndex + word.length;
                
                // Expand backward to word boundary
                while (startOffset > 0 && !/\s/.test(nodeText[startOffset - 1])) {
                    startOffset--;
                }
                
                // Expand forward to word boundary
                while (endOffset < nodeText.length && !/\s/.test(nodeText[endOffset])) {
                    endOffset++;
                }
                
                range.setStart(node, startOffset);
                range.setEnd(node, endOffset);
                ranges.push(range);
            }
        }
    }
    
    return ranges;
};

/**
 * Find text with slight variations allowed
 * @param textNodes Array of text nodes to search
 * @param textToFind Text to find
 * @param matchThreshold Threshold for considering a match (0.0-1.0)
 * @returns Array of ranges where the text was found
 */
export const findFlexibleTextRanges = (textNodes: Text[], textToFind: string, matchThreshold: number = 0.8): Range[] => {
    const ranges: Range[] = [];
    
    // First try exact matching
    let exactRanges = findTextRanges(textNodes, textToFind);
    if (exactRanges.length > 0) {
        return exactRanges;
    }
    
    // If no exact match, try with slight normalization
    const lightNormalized = lightNormalizeText(textToFind);
    if (lightNormalized !== textToFind) {
        exactRanges = findTextRanges(textNodes, lightNormalized);
        if (exactRanges.length > 0) {
            return exactRanges;
        }
    }
    
    // If still no match, try with more flexible matching
    // This allows for small variations in whitespace and punctuation
    let combinedText = '';
    const nodeMap: {node: Text, startIndex: number, endIndex: number}[] = [];
    
    textNodes.forEach(node => {
        const nodeText = node.textContent || '';
        const startIndex = combinedText.length;
        combinedText += nodeText;
        const endIndex = combinedText.length;
        
        nodeMap.push({
            node,
            startIndex,
            endIndex
        });
    });
    
    // Prepare text for flexible matching
    const prepareForFlexibleMatch = (text: string): string => {
        return text.toLowerCase()
            .replace(/\s+/g, ' ')  // Normalize whitespace
            .replace(/[.,;:!?()]/g, ' ') // Replace punctuation with space
            .trim();
    };
    
    const textToFindFlexible = prepareForFlexibleMatch(normalizeText(textToFind));
    const combinedTextFlexible = prepareForFlexibleMatch(combinedText);
    
    // Only proceed if the text to find is substantial
    if (textToFindFlexible.length < 10) {
        return ranges;
    }
    
    // Try to find the best match
    let bestMatchIndex = -1;
    let bestMatchScore = 0;
    
    for (let i = 0; i <= combinedTextFlexible.length - textToFindFlexible.length; i++) {
        const segment = combinedTextFlexible.substring(i, i + textToFindFlexible.length);
        let matchScore = 0;
        
        // Count matching characters
        for (let j = 0; j < textToFindFlexible.length; j++) {
            if (segment[j] === textToFindFlexible[j]) {
                matchScore++;
            }
        }
        
        // Calculate match percentage
        const matchPercentage = matchScore / textToFindFlexible.length;
        
        // If match is good enough, consider it
        if (matchPercentage > matchThreshold && matchPercentage > bestMatchScore) {
            bestMatchScore = matchPercentage;
            bestMatchIndex = i;
        }
    }
    
    // If we found a good match
    if (bestMatchIndex >= 0) {
        // Find which nodes contain the start and end
        const startPos = bestMatchIndex;
        const endPos = bestMatchIndex + textToFindFlexible.length;
        
        const startNodeInfo = nodeMap.find(info => 
            startPos >= info.startIndex && startPos < info.endIndex);
        const endNodeInfo = nodeMap.find(info => 
            endPos > info.startIndex && endPos <= info.endIndex);
        
        if (startNodeInfo && endNodeInfo) {
            const range = document.createRange();
            
            // Calculate offsets within the nodes
            const startOffset = startPos - startNodeInfo.startIndex;
            const endOffset = endPos - endNodeInfo.startIndex;
            
            range.setStart(startNodeInfo.node, startOffset);
            range.setEnd(endNodeInfo.node, endOffset);
            
            ranges.push(range);
        }
    } else {
        // console.log(`No match found at threshold ${matchThreshold}. Best match score: ${bestMatchScore}`);
    }
    
    return ranges;
};

/**
 * Check if two ranges overlap significantly
 * @param range1 First range
 * @param range2 Second range
 * @returns True if ranges overlap at all
 */
export const rangesOverlap = (range1: Range, range2: Range): boolean => {
    // If ranges don't intersect at all, they don't overlap
    if (range1.compareBoundaryPoints(Range.END_TO_START, range2) > 0 || 
        range1.compareBoundaryPoints(Range.START_TO_END, range2) < 0) {
        return false;
    }
    
    // If we get here, the ranges overlap
    return true;
};

/**
 * Create highlight overlays for the found ranges
 * @param container Container element
 * @param ranges Array of ranges to highlight
 * @param highlightColor Color for the highlight
 * @param highlightIndex Index of the highlight
 * @param citationId Optional citation ID
 * @param existingRanges Existing ranges to check for overlap
 * @returns Array of created ranges
 */
export const createHighlightOverlays = (
    container: HTMLElement, 
    ranges: Range[], 
    highlightColor: string,
    highlightIndex: number,
    citationId?: string,
    existingRanges: Range[] = []
): Range[] => {
    const createdRanges: Range[] = [];
    const createdRects: {left: number, top: number, width: number, height: number}[] = [];
    
    for (const range of ranges) {
        // Check for any overlap with existing ranges
        const hasOverlap = existingRanges.some(
            existingRange => rangesOverlap(range, existingRange)
        );
        
        if (hasOverlap) {
            console.warn(`Skipping highlight ${highlightIndex} due to overlap with existing highlight`);
            continue;
        }
        
        const rects = range.getClientRects();
        const containerRect = container.getBoundingClientRect();
        
        // Skip if no visible rectangles (might be hidden or off-screen)
        if (rects.length === 0) {
            continue;
        }
        
        let addedHighlight = false;
        
        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            
            // Skip very small rectangles which might be artifacts
            if (rect.width < 5 || rect.height < 5) {
                continue;
            }
            
            // Check for overlapping rectangles we've already created
            const rectOverlap = createdRects.some(existingRect => {
                const horizontalOverlap = 
                    (rect.left < existingRect.left + existingRect.width) && 
                    (rect.left + rect.width > existingRect.left);
                    
                const verticalOverlap = 
                    (rect.top < existingRect.top + existingRect.height) && 
                    (rect.top + rect.height > existingRect.top);
                    
                return horizontalOverlap && verticalOverlap;
            });
            
            if (rectOverlap) {
                continue;
            }
            
            // Store this rect to check for future overlaps
            createdRects.push({
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            });
            
            const highlight = document.createElement('div');
            highlight.className = 'highlight-overlay';
            highlight.style.position = 'absolute';
            highlight.style.backgroundColor = highlightColor;
            highlight.style.opacity = '0.3';
            highlight.style.pointerEvents = 'auto';
            highlight.style.cursor = 'pointer';
            highlight.style.zIndex = '1';
            highlight.style.borderRadius = '2px';
            
            highlight.style.left = `${rect.left - containerRect.left}px`;
            highlight.style.top = `${rect.top - containerRect.top}px`;
            highlight.style.width = `${rect.width}px`;
            highlight.style.height = `${rect.height}px`;
            
            highlight.dataset.highlightIndex = highlightIndex.toString();
            if (citationId) {
                highlight.dataset.citationId = citationId;
            }
            
            container.style.position = 'relative';
            container.appendChild(highlight);
            addedHighlight = true;
        }
        
        if (addedHighlight) {
            createdRanges.push(range);
        }
    }
    
    return createdRanges;
};

/**
 * Find and highlight text in DOM
 * @param container Container element
 * @param textToFind Text to find
 * @param highlightColor Color for the highlight
 * @param highlightIndex Index of the highlight
 * @param citationId Optional citation ID
 * @param existingRanges Existing ranges to check for overlap
 * @returns Array of created ranges
 */
export const findAndHighlightText = (
    container: HTMLElement, 
    textToFind: string, 
    highlightColor: string,
    highlightIndex: number,
    citationId?: string,
    existingRanges: Range[] = []
): Range[] => {
    // Get all text nodes in the container
    const textNodes = getAllTextNodes(container);
    
    // Prefer text nodes that are direct children of list items for list content
    const listItemTextNodes = textNodes.filter(node => {
        let parent = node.parentElement;
        while (parent) {
            if (parent.tagName === 'LI') {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    });
    
    // Try with progressively lower thresholds
    const thresholds = [0.8, 0.7, 0.6, 0.5, 0.4];
    
    // First try with list item text nodes if the text might be in a list
    if (listItemTextNodes.length > 0 && 
        (textToFind.includes('\n1.') || 
         textToFind.includes('\n-') || 
         textToFind.includes('\n*'))) {
        for (const threshold of thresholds) {
            const ranges = findFlexibleTextRanges(listItemTextNodes, textToFind, threshold);
            
            if (ranges.length > 0) {
                // console.log(`Found list item match for highlight ${highlightIndex} at threshold: ${threshold}`);
                return createHighlightOverlays(container, ranges, highlightColor, highlightIndex, citationId, existingRanges);
            }
        }
    }
    
    // If no match in list items or not a list, try with all text nodes
    for (const threshold of thresholds) {
        const ranges = findFlexibleTextRanges(textNodes, textToFind, threshold);
        
        if (ranges.length > 0) {
            // console.log(`Found match for highlight ${highlightIndex} at threshold: ${threshold}`);
            return createHighlightOverlays(container, ranges, highlightColor, highlightIndex, citationId, existingRanges);
        }
    }
    
    // If we get here, we couldn't find a match at any threshold
    console.warn(`No matches found for highlight ${highlightIndex} text:`, textToFind);
    
    // Try one more approach - look for key words
    const keyWords = textToFind.split(/\s+/)
        .filter(word => word.length > 4)
        .map(word => word.toLowerCase());
        
    if (keyWords.length > 0) {
        // console.log(`Trying keyword matching for highlight ${highlightIndex} with:`, keyWords);
        
        // Find the node that contains the most key words
        let bestNode = null;
        let bestKeywordCount = 0;
        
        for (const node of textNodes) {
            const nodeText = node.textContent?.toLowerCase() || '';
            let keywordCount = 0;
            
            for (const word of keyWords) {
                if (nodeText.includes(word)) {
                    keywordCount++;
                }
            }
            
            if (keywordCount > bestKeywordCount) {
                bestKeywordCount = keywordCount;
                bestNode = node;
            }
        }
        
        if (bestNode && bestKeywordCount > 0) {
            // console.log(`Found node with ${bestKeywordCount} keywords for highlight ${highlightIndex}`);
            const range = document.createRange();
            range.selectNode(bestNode);
            
            // Check for significant overlap with existing ranges
            const hasSignificantOverlap = existingRanges.some(
                existingRange => rangesOverlap(range, existingRange)
            );
            
            if (hasSignificantOverlap) {
                console.warn(`Skipping keyword-based highlight ${highlightIndex} due to significant overlap with existing highlight`);
                return [];
            }
            
            return createHighlightOverlays(container, [range], highlightColor, highlightIndex, citationId, existingRanges);
        }
    }
    
    return [];
};

/**
 * Hook to manage highlights in a container
 * @param content Content to highlight
 * @param highlights Array of highlights
 * @param containerRef Reference to the container element
 * @param onHighlightClick Callback for when a highlight is clicked
 */
export const useHighlightManager = (
    content: string,
    highlights: MessageHighlight[] | undefined,
    containerRef: React.RefObject<HTMLDivElement>,
    onHighlightClick: (highlightId: string) => void
) => {
    const highlightsToUse = highlights || [];
    
    // Apply highlights to rendered content
    useEffect(() => {
        if (!containerRef.current || highlightsToUse.length === 0) return;
        
        const container = containerRef.current;
        
        // Clear existing highlights
        const existingHighlights = container.querySelectorAll('.highlight-overlay');
        existingHighlights.forEach(el => el.remove());
        
        // Keep track of all ranges to check for overlaps
        const allRanges: Range[] = [];
        
        // Sort highlights by size (smallest first) to prioritize more specific highlights
        const sortedHighlights = [...highlightsToUse].sort((a, b) => {
            // For text-based highlights, estimate size based on text length
            if (a.text && b.text) {
                return a.text.length - b.text.length;
            }
            // For char-based highlights, use the actual range
            const aSize = (a.endChar || 0) - (a.startChar || 0);
            const bSize = (b.endChar || 0) - (b.startChar || 0);
            return aSize - bSize;
        });
        
        // Process each highlight
        sortedHighlights.forEach((highlight, index) => {
            let textToHighlight: string;
            
            // Handle text-based highlights
            if (highlight.text) {
                textToHighlight = highlight.text;
            }
            // Handle char-based highlights
            else if (highlight.startChar !== undefined && highlight.endChar !== undefined) {
                const startChar = highlight.startChar as number;
                const endChar = highlight.endChar as number;
                
                if (startChar < 0 || endChar <= startChar || endChar > content.length) return;
                
                // Get the text to highlight - use the exact text from the content
                textToHighlight = content.substring(startChar, endChar);
            }
            else {
                // Skip highlights without text or char range
                console.warn(`Highlight ${index} has neither text nor char range`);
                return;
            }
            
            // Find this text in the rendered DOM and get the created ranges
            const newRanges = findAndHighlightText(
                container, 
                textToHighlight, 
                highlight.color || '#ffeb3b', 
                index, 
                highlight.citationId,
                allRanges
            );
            
            // Add the new ranges to our collection
            allRanges.push(...newRanges);
        });
        
        // Add click handler
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('highlight-overlay')) {
                const highlightIndex = parseInt(target.dataset.highlightIndex || '-1', 10);
                const citationId = target.dataset.citationId;
                
                if (citationId && highlightIndex >= 0) {
                    onHighlightClick(citationId);
                }
            }
        };
        
        container.addEventListener('click', handleClick);
        
        return () => {
            container.removeEventListener('click', handleClick);
        };
    }, [content, highlightsToUse, containerRef, onHighlightClick]);
};