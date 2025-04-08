// preprocessing.ts
import { pdfjs } from 'react-pdf';
import { loadSbd } from './dependencies';

// Set the pdfjs worker source from the CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface TextPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  isTitle?: boolean;
}

export interface TextItem {
  text: string;
  position: TextPosition;
  startIndex: number;
  endIndex: number;
}

export interface TextWithMetadata {
  text: string;
  metadata: {
    page: number;
    position?: TextPosition;
    linePositions?: TextPosition[]; // Store positions of all text items in the line
  };
}

export interface ParseResult {
  blocks: {
    block_type: string;
    children: Array<{
      id: string;
      block_type: string;
      text: string;
      page: number;
      textItems: TextItem[][];  // Array of lines, each line is array of text items
    }>;
  };
  metadata: {
    numPages: number;
    fileName: string;
  };
}

/**
 * Helper function to apply viewport transform to coordinates
 */
function applyTransform(point: [number, number], transform: number[]): [number, number] {
  const x = transform[0] * point[0] + transform[2] * point[1] + transform[4];
  const y = transform[1] * point[0] + transform[3] * point[1] + transform[5];
  return [x, y];
}

/**
 * Parses a PDF file using pdfjs from react-pdf.
 */
export async function parsePdfWithMarker(file: File): Promise<ParseResult> {
  console.log(`Starting PDF parsing: ${file.name}`);

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  console.log(`PDF loaded successfully. Total pages: ${numPages}`);

  const blocks: ParseResult['blocks'] = {
    block_type: "Document",
    children: [],
  };

  // Process each page
  for (let i = 1; i <= numPages; i++) {
    // console.log(`Processing page ${i}/${numPages}`);
    
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    // console.log(`Page ${i}: Found ${content.items.length} text items`);

    // Group text items by their vertical position to form lines
    const lines: TextItem[][] = [];
    let currentLine: TextItem[] = [];
    let lastY: number | null = null;
    const Y_THRESHOLD = 5; // pixels threshold for considering items on the same line
    let currentPosition = 0;

    content.items.forEach((item: any) => {
      const [x, y] = applyTransform([item.transform[4], item.transform[5]], viewport.transform);
      
      const textItem: TextItem = {
        text: item.str,
        position: {
          top: y / viewport.height,
          left: x / viewport.width,
          width: (item.width || item.str.length * 5) / viewport.width,
          height: (item.height || 12) / viewport.height
        },
        startIndex: currentPosition,
        endIndex: currentPosition + item.str.length
      };
      currentPosition += item.str.length + 1; // +1 for space

      if (lastY === null || Math.abs(y - lastY) < Y_THRESHOLD) {
        currentLine.push(textItem);
      } else {
        if (currentLine.length > 0) {
          lines.push([...currentLine]);
        }
        currentLine = [textItem];
      }
      lastY = y;
    });

    // Don't forget the last line
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // console.log(`Page ${i}: Formed ${lines.length} lines from text items`);

    // Create a block for the page
    blocks.children.push({
      id: `page_${i}`,
      block_type: "Page",
      text: content.items.map((item: any) => item.str).join(" "),
      textItems: lines,
      page: i,
    });
  }

  const metadata = {
    numPages,
    fileName: file.name,
  };

  console.log('PDF parsing completed successfully');
  return { blocks, metadata };
}

/**
 * Checks if a text item appears to be a section header based on various characteristics
 */
function isSectionHeader(item: TextItem, allItems: TextItem[]): boolean {
  // Check if it's followed by a period and number (e.g., "1. Introduction")
  const hasSectionNumber = /^\d+\.\s+/.test(item.text);
  
  // Check if it's a short phrase followed by a period
  const isShortHeader = item.text.length < 50 && item.text.trim().endsWith('.');
  
  // Check if it's in a larger font or bold (based on relative height and width)
  const avgHeight = allItems.reduce((sum, i) => sum + i.position.height, 0) / allItems.length;
  const avgWidth = allItems.reduce((sum, i) => {
    // Calculate average character width for this item
    const charWidth = i.position.width / i.text.length;
    return sum + charWidth;
  }, 0) / allItems.length;
  
  // Calculate this item's average character width
  const thisCharWidth = item.position.width / item.text.length;
  
  // Text is likely bold if its character width is significantly larger than average
  const isBold = thisCharWidth > avgWidth * 1.2;
  const isLargerFont = item.position.height > avgHeight * 1.2;
  
  // Check for common section header patterns
  const headerPattern = /^(?:[A-Z][a-z]+\s*)+[:.]\s*|^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/;
  const isHeaderFormat = headerPattern.test(item.text.trim());
  
  // Check if this item starts a new line by looking at its position
  const isNewLine = allItems.every(other => {
    if (other === item) return true;
    
    // Check if there's any text item directly to the left of this one
    // Use a small threshold for vertical position comparison
    const sameVerticalPosition = Math.abs(other.position.top - item.position.top) < 0.01;
    const isToTheLeft = other.position.left + other.position.width < item.position.left;
    
    return !sameVerticalPosition || !isToTheLeft;
  });
  
  // Additional patterns for academic paper section headers
  const academicHeaderPatterns = [
    /^Abstract\b/,
    /^Introduction\b/,
    /^Related Work\b/,
    /^Method\b/,
    /^Experiments?\b/,
    /^Results?\b/,
    /^Discussion\b/,
    /^Conclusion\b/,
    /^References\b/,
    /^(?:(?:[A-Z][a-z]+\s*)+Learning)\b/, // Matches "Self-supervised Learning", "Unsupervised Learning", etc.
  ];
  
  const isAcademicHeader = academicHeaderPatterns.some(pattern => pattern.test(item.text.trim()));
  
  // Add paper title detection patterns
  const paperTitlePatterns = [
    // Common paper title formats
    /^(?:[A-Z][a-z]*(?:\s+(?:[A-Z][a-z]*|[A-Z]+|[a-z]+|is|the|and|or|in|on|of|to|for|with|by))*[:.!?]?)$/,
    // Specific well-known paper titles
    /^Attention Is All You Need$/,
    /^BERT:/,
    /^GPT:/,
    /^Transformer:/
  ];
  
  const isPaperTitle = paperTitlePatterns.some(pattern => pattern.test(item.text.trim()));
  
  // Consider it a paper title if:
  // 1. It matches paper title patterns AND
  // 2. It's either larger or bolder than normal text AND
  // 3. It appears near the top of the page
  const isNearTop = item.position.top < 0.3; // Top 30% of page
  
  const isPaperTitleHeader = isPaperTitle && isNearTop && (isLargerFont || isBold);
  
  // Consider it a section header if:
  // 1. It has a section number, or
  // 2. It matches academic header patterns and starts a new line, or
  // 3. It's a short header with either larger font or bold text and starts a new line
  return hasSectionNumber || 
         (isAcademicHeader && isNewLine) ||
         (isShortHeader && isNewLine && (isLargerFont || isBold || isHeaderFormat)) ||
         isPaperTitleHeader;
}

/**
 * Clean text and split into sentences.
 */
async function cleanAndSplitText(rawBlocks: ParseResult['blocks']): Promise<TextWithMetadata[]> {
    let textsWithMetadata: TextWithMetadata[] = [];
    
    if (rawBlocks && rawBlocks.block_type === "Document") {
        const sbd = await loadSbd();  // Load SBD dynamically
        
        for (const pageBlock of rawBlocks.children) {
            if (!pageBlock.text || typeof pageBlock.text !== "string") continue;
            
            // Get all text items for this page and flatten them
            const allTextItems = pageBlock.textItems.flat();
            
            // Create a continuous text string with markers for text item boundaries
            let fullText = '';
            const itemPositions: { start: number; item: TextItem; }[] = [];
            
            // Filter out likely header/footer items based on position
            const filteredItems = allTextItems.filter(item => {
                // Filter out items at very top or bottom of page (typical header/footer locations)
                if (item.position.top < 0.1 || item.position.top > 0.9) {
                    // Keep only if it looks like a meaningful page number
                    const isPageNumber = /^\d+$/.test(item.text.trim());
                    return isPageNumber;
                }
                
                // Check if it's a paper title
                const isPaperTitle = isSectionHeader(item, allTextItems) && 
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
                if (isSectionHeader(item, allTextItems)) {
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
                    .replace(/\b(?:Fig\.|Figure|Table|Algorithm)\s+\d+/gi, '')  // Remove figure/table references
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

/**
 * Main function to parse a PDF file and then clean/split the text.
 */
export async function parseAndCleanPdf(file: File): Promise<TextWithMetadata[]> {
  const { blocks } = await parsePdfWithMarker(file);
  if (!blocks) {
    console.error("Parsed data is empty. Skipping cleaning.");
    return [];
  }
  return cleanAndSplitText(blocks);
}
