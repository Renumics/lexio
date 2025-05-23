import { ParseResult, TextWithMetadata, TextItem } from './types';
import { loadSbd } from '../dependencies';
import { isSectionHeader, isGraphElement } from './layout_analyzer';

/**
 * Clean text and split into sentences.
 */
export async function cleanAndSplitText(rawBlocks: ParseResult['blocks']): Promise<TextWithMetadata[]> {
    let textsWithMetadata: TextWithMetadata[] = [];
    
    if (rawBlocks && rawBlocks.block_type === "Document") {
        const sbd = await loadSbd();
        
        // Get ALL text items from ALL pages upfront
        const allTextItems = rawBlocks.children.flatMap(page => 
            page.textItems.flat().map(item => ({
                ...item,
                page: page.page  // Make sure to include page number
            }))
        );
        
        // Get ALL line boxes
        const allLineBoxes = rawBlocks.children.flatMap(page => page.lineBoxes || []);
        
        for (const pageBlock of rawBlocks.children) {
            if (!pageBlock.text || typeof pageBlock.text !== "string") continue;
            
            // Get items for this page but use ALL items for header detection
            const pageItems = allTextItems.filter(item => item.page === pageBlock.page);
            
            // Filter out layout elements using layout_analyzer with complete context
            const filteredItems = pageItems.filter(item => {
                // Check for headers first
                if (isSectionHeader(item, allTextItems, allLineBoxes)) {
                    const exactPosition = {
                        ...item.position,
                        isHeader: true
                    };

                    textsWithMetadata.push({
                        text: item.text.trim(),
                        metadata: {
                            page: pageBlock.page,
                            position: exactPosition,
                            linePositions: [exactPosition],
                            isHeader: true
                        }
                    });
                    return false;
                }

                // Then check for graph elements
                if (isGraphElement(item, allTextItems)) {
                    // We don't need to store graph elements, just filter them out
                    return false;
                }

                return true;
            });

            // Pre-clean individual text items
            const cleanedItems = filteredItems
                .map(item => ({
                    ...item,
                    text: cleanTextItem(item.text)
                }))
                .filter(item => item.text.length > 0);

            // Split into sentences and track positions
            const sentences = await splitIntoSentences(cleanedItems, pageBlock, sbd);
            textsWithMetadata.push(...sentences);
        }
    }
    
    return textsWithMetadata;
}

function cleanTextItem(text: string): string {
    return text
        // Remove standalone numbers at start
        .replace(/^(?:\d+\s+)/, '')
        // Remove common artifacts
        .replace(/(?:\*|†|‡)\s*/g, '')
        // PDF artifacts
        .replace(/WWW\.[A-Z]+\.[A-Z]+/gi, '')
        .replace(/(?:©|Copyright)\s*\d{4}/gi, '')
        .replace(/\b(?:Page|p\.?)\s*\d+\s*(?:of|\/)\s*\d+\b/gi, '')
        // Remove emails and URLs
        .replace(/(?:[A-Za-z0-9._%+-]+(?:@|\.(?:com|edu|org|net|gov))\b)[^\n.]*,?\s*/gi, '')
        // Remove citation references
        .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
        .trim();
}

/**
 * Split concatenated text into sentences while preserving position information
 */
async function splitIntoSentences(
    cleanedItems: TextItem[],
    pageBlock: any,
    sbd: any
): Promise<TextWithMetadata[]> {
    const textsWithMetadata: TextWithMetadata[] = [];
    
    // Create a continuous text string with markers for text item boundaries
    let fullText = '';
    const itemPositions: { start: number; item: TextItem; }[] = [];
    
    cleanedItems.forEach(item => {
        const startPos = fullText.length;
        fullText += item.text + ' ';
        itemPositions.push({ start: startPos, item });
    });
    
    // Clean the text while preserving original positions
    const cleanedText = fullText
        .replace(/\n+/g, ' ')    // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Normalize spaces
        .trim();
    
    // Split into sentences using dynamically loaded SBD
    const sentences = sbd.sentences(cleanedText, { newline_boundaries: true });
    
    for (const sentence of sentences) {
        let cleanedSentence = sentence.trim();
        if (!cleanedSentence) continue;
        
        // Additional sentence-level cleaning
        cleanedSentence = cleanedSentence
            .replace(/^(?:\d+\s+)/, '')     // Remove numbers at start
            .replace(/^In\s+this\s+/, '')   // Remove "In this" at start
            .trim();
        
        // Find sentence position in text
        let searchText = cleanedSentence;
        let sentenceStart = findSentencePosition(cleanedText, searchText);
        
        if (sentenceStart === -1) continue;
        
        // Find text items that correspond to this sentence
        const relevantItems = findRelevantItems(
            itemPositions,
            sentenceStart,
            searchText.length
        );
        
        if (relevantItems.length > 0) {
            const linePositions = createLinePositions(relevantItems);
            
            textsWithMetadata.push({
                text: cleanedSentence,
                metadata: {
                    page: pageBlock.page,
                    linePositions
                }
            });
        }
    }
    
    return textsWithMetadata;
}

/**
 * Find the position of a sentence in text, handling edge cases
 */
function findSentencePosition(text: string, sentence: string): number {
    let start = text.indexOf(sentence);
    
    // Try without "The" if not found
    if (start === -1 && sentence.startsWith('The ')) {
        const withoutThe = sentence.slice(4);
        start = text.indexOf(withoutThe);
        
        // Adjust start to include "The" if possible
        if (start > 4) {
            const prefix = text.slice(start - 4, start);
            if (prefix.trim().toLowerCase() === 'the') {
                start -= 4;
            }
        }
    }
    
    // Try fuzzy matching if still not found
    if (start === -1) {
        const words = sentence.split(/\s+/);
        const firstWords = words.slice(0, 3).join(' ');
        start = text.indexOf(firstWords);
        
        if (start !== -1) {
            const lastWords = words.slice(-3).join(' ');
            const approxEnd = start + sentence.length;
            const context = text.slice(start, approxEnd + 20);
            const endMatch = context.indexOf(lastWords);
            if (endMatch !== -1) {
                // Position found through fuzzy matching
                return start;
            }
        }
    }
    
    return start;
}

/**
 * Find text items that correspond to a sentence
 */
function findRelevantItems(
    itemPositions: { start: number; item: TextItem; }[],
    sentenceStart: number,
    sentenceLength: number
): TextItem[] {
    const relevantItems: TextItem[] = [];
    const sentenceEnd = sentenceStart + sentenceLength;
    
    for (const {start, item} of itemPositions) {
        const itemEnd = start + item.text.length;
        if (start <= sentenceEnd && itemEnd >= sentenceStart) {
            relevantItems.push(item);
        }
    }
    
    return relevantItems;
}

/**
 * Create line positions from text items
 */
function createLinePositions(items: TextItem[]): any[] {
    // Sort items by vertical position first, then horizontal
    items.sort((a, b) => {
        const yDiff = Math.abs(a.position.top - b.position.top);
        if (yDiff < 0.005) { // If on same line
            return a.position.left - b.position.left;
        }
        return a.position.top - b.position.top;
    });
    
    // Group items into lines
    const lines: TextItem[][] = [];
    let currentLine: TextItem[] = [items[0]];
    
    for (let i = 1; i < items.length; i++) {
        const curr = items[i];
        const prev = items[i-1];
        
        const verticalGap = Math.abs(curr.position.top - prev.position.top);
        if (verticalGap < 3) { // 3 points tolerance for same line
            currentLine.push(curr);
        } else {
            lines.push([...currentLine]);
            currentLine = [curr];
        }
    }
    lines.push(currentLine);
    
    // Create precise line positions
    return lines.map(lineItems => {
        const left = Math.min(...lineItems.map(item => item.position.left));
        const right = Math.max(...lineItems.map(item => 
            item.position.left + item.position.width));
        const top = Math.min(...lineItems.map(item => item.position.top));
        const bottom = Math.max(...lineItems.map(item => 
            item.position.top + item.position.height));
            
        const { pageWidth, pageHeight } = lineItems[0].position;
            
        return {
            top,
            left,
            width: right - left,
            height: bottom - top,
            pageWidth,
            pageHeight
        };
    });
} 