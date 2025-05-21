import { ParseResult, TextWithMetadata, TextItem } from './types';
import { loadSbd } from '../dependencies';
import { isSectionHeader } from './section_analyzer';
import { detectAndExtractFigures} from './figure_processor';


/**
 * Clean text and split into sentences.
 */
export async function cleanAndSplitText(rawBlocks: ParseResult['blocks']): Promise<TextWithMetadata[]> {
    let textsWithMetadata: TextWithMetadata[] = [];
    
    if (rawBlocks && rawBlocks.block_type === "Document") {
        const sbd = await loadSbd();  // Load SBD dynamically
        
        for (const pageBlock of rawBlocks.children) {
            if (!pageBlock.text || typeof pageBlock.text !== "string") continue;
            
            // Get all text items for this page and flatten them
            const allTextItems = pageBlock.textItems.flat();
            
            // First detect and extract figures
            const { figures, remainingItems } = detectAndExtractFigures(allTextItems);
            
            // Process figures separately if needed
            figures.forEach(figure => {
                textsWithMetadata.push({
                    text: `[Figure ${figure.number}] ${figure.caption}`,
                    metadata: {
                        page: pageBlock.page,
                        position: figure.position,
                        isFigure: true,
                        figureNumber: figure.number
                    }
                });
            });
            
            // Create a continuous text string with markers for text item boundaries
            let fullText = '';
            const itemPositions: { start: number; item: TextItem; }[] = [];
            
            // Filter out likely header/footer items based on position
            const filteredItems = remainingItems.filter(item => {
                // Filter out items at very top or bottom of page (typical header/footer locations)
                if (item.position.top < 0.1 || item.position.top > 0.9) {
                    // Keep only if it looks like a meaningful page number
                    const isPageNumber = /^\d+$/.test(item.text.trim());
                    return isPageNumber;
                }
                
                // Check if it's a paper title
                const isPaperTitle = isSectionHeader(item, remainingItems) && 
                item.position.top < 0.3 && // Near top of page
                /^(?!(?:\d+\.|Abstract|Introduction|References))[A-Z]/.test(item.text); // Starts with capital, not a regular section

                // If it's a paper title, we want to keep it but mark it for special handling
                if (isPaperTitle) {
                    // Calculate the vertical adjustment
                    // PDF coordinates are from bottom-up, but we want top-down coordinates
                    const exactPosition = {
                        ...item.position,
                        // Adjust the vertical position by moving it up
                        top: Math.max(0, item.position.top - item.position.height),
                        isTitle: true
                    };

                    textsWithMetadata.push({
                        text: item.text.trim(),
                        metadata: {
                            page: pageBlock.page,
                            position: exactPosition,
                            linePositions: [exactPosition]
                        }
                    });
                    // Remove it from regular text processing
                    return false;
                } 
                
                // Filter out regular section headers
                if (isSectionHeader(item, remainingItems)) {
                    return false;
                }
                
                return true;
            });

            // Pre-clean individual text items before joining
            const cleanedItems = filteredItems.map(item => {
                let cleanedText = item.text
                    // Remove standalone numbers at start of text
                    .replace(/^(?:\d+\s+)/, '')
                    // Remove common artifacts
                    .replace(/(?:\*|†|‡)\s*/g, '')
                    // Move PDF artifact removal to item level
                    .replace(/WWW\.[A-Z]+\.[A-Z]+/gi, '')
                    .replace(/(?:©|Copyright)\s*\d{4}/gi, '')
                    .replace(/\b(?:Page|p\.?)\s*\d+\s*(?:of|\/)\s*\d+\b/gi, '')
                    .replace(/(?:[A-Za-z0-9._%+-]+(?:@|\.(?:com|edu|org|net|gov))\b)[^\n.]*,?\s*/gi, '')
                    .replace(/\[\d+(?:,\s*\d+)*\]/g, '')  // Remove citation references
                    .trim();
                
                // Calculate position adjustment based on removed prefix content
                const prefixDiff = item.text.length - cleanedText.length;
                const charWidth = item.position.width / item.text.length;

                return {
                    ...item,
                    text: cleanedText,
                    position: {
                        ...item.position,
                        left: item.position.left + (prefixDiff * charWidth),
                        width: cleanedText.length * charWidth
                    }
                };
            }).filter(item => item.text.length > 0);  // Remove empty items after cleaning

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
                    // Remove any remaining numbers at start of sentence
                    .replace(/^(?:\d+\s+)/, '')
                    // Remove "In this" at start if present
                    .replace(/^In\s+this\s+/, '')
                    .trim();
                
                // Find all occurrences of this sentence
                let searchText = cleanedSentence;
                let sentenceStart = cleanedText.indexOf(searchText);
                
                // If not found and starts with "The", try without it
                if (sentenceStart === -1 && searchText.startsWith('The ')) {
                    searchText = searchText.slice(4);
                    sentenceStart = cleanedText.indexOf(searchText);
                    // Adjust start to include "The"
                    if (sentenceStart > 4) {
                        const prefix = cleanedText.slice(sentenceStart - 4, sentenceStart);
                        if (prefix.trim().toLowerCase() === 'the') {
                            sentenceStart -= 4;
                            searchText = cleanedSentence; // Restore original search text
                        }
                    }
                }
                
                if (sentenceStart === -1) {
                    // Try fuzzy matching if exact match fails
                    const words = searchText.split(/\s+/);
                    const firstWords = words.slice(0, 3).join(' ');
                    sentenceStart = cleanedText.indexOf(firstWords);
                    
                    if (sentenceStart !== -1) {
                        // Find the best matching end position
                        const lastWords = words.slice(-3).join(' ');
                        const approxEnd = sentenceStart + searchText.length;
                        const context = cleanedText.slice(sentenceStart, approxEnd + 20);
                        const endMatch = context.indexOf(lastWords);
                        if (endMatch !== -1) {
                            searchText = context.slice(0, endMatch + lastWords.length);
                        }
                    }
                }
                
                if (sentenceStart === -1) continue;
                
                // Find text items that correspond to this sentence
                const relevantItems: TextItem[] = [];
                const sentenceEnd = sentenceStart + searchText.length;
                
                for (const {start, item} of itemPositions) {
                    const itemEnd = start + item.text.length;
                    // Check if this item overlaps with the sentence
                    if (start <= sentenceEnd && itemEnd >= sentenceStart) {
                        relevantItems.push(item);
                    }
                }
                
                if (relevantItems.length > 0) {
                    // Sort items by vertical position first, then horizontal
                    relevantItems.sort((a, b) => {
                        const yDiff = Math.abs(a.position.top - b.position.top);
                        if (yDiff < 0.005) { // If on same line
                            return a.position.left - b.position.left;
                        }
                        return a.position.top - b.position.top;
                    });
                    
                    // Group items into lines
                    const lines: TextItem[][] = [];
                    let currentLine: TextItem[] = [relevantItems[0]];
                    
                    for (let i = 1; i < relevantItems.length; i++) {
                        const curr = relevantItems[i];
                        const prev = relevantItems[i-1];
                        
                        if (Math.abs(curr.position.top - prev.position.top) < 0.005) {
                            currentLine.push(curr);
                        } else {
                            lines.push([...currentLine]);
                            currentLine = [curr];
                        }
                    }
                    lines.push(currentLine);
                    
                    // Create precise line positions
                    const linePositions = lines.map(lineItems => {
                        const left = Math.min(...lineItems.map(item => item.position.left));
                        const right = Math.max(...lineItems.map(item => 
                            item.position.left + item.position.width));
                        const top = Math.min(...lineItems.map(item => item.position.top));
                        const bottom = Math.max(...lineItems.map(item => 
                            item.position.top + item.position.height));
                            
                        return {
                            top,
                            left,
                            width: right - left,
                            height: bottom - top
                        };
                    });
                    
                    textsWithMetadata.push({
                        text: cleanedSentence,  // Use the fully cleaned sentence
                        metadata: {
                            page: pageBlock.page,
                            linePositions
                        }
                    });
                }
            }
        }
    }
    
    return textsWithMetadata;
} 