// preprocessing.ts
import { pdfjs } from 'react-pdf';
import sbd from 'sbd';

// Set the pdfjs worker source from the CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface TextPosition {
  top: number;
  left: number;
  width: number;
  height: number;
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
    console.log(`Processing page ${i}/${numPages}`);
    
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    console.log(`Page ${i}: Found ${content.items.length} text items`);

    // Group text items by their vertical position to form lines
    const lines: TextItem[][] = [];
    let currentLine: TextItem[] = [];
    let lastY: number | null = null;
    const Y_THRESHOLD = 5; // pixels threshold for considering items on the same line
    let currentPosition = 0;

    content.items.forEach((item: any, index: number) => {
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

    console.log(`Page ${i}: Formed ${lines.length} lines from text items`);

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
 * Escape RegExp special characters.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remove specified tokens and collapse whitespace.
 */
function removeSpecialTokens(text: string, tokens: string[] = ["<EOS>", "<pad>"]): string {
  const pattern = new RegExp(tokens.map(escapeRegExp).join('|'), 'g');
  let cleanedText = text.replace(pattern, "");
  cleanedText = cleanedText.replace(/\s+/g, " ").trim();
  return cleanedText;
}

/**
 * Clean text and split into sentences.
 */
function cleanAndSplitText(rawBlocks: ParseResult['blocks'], metadata: any): TextWithMetadata[] {
    let textsWithMetadata: TextWithMetadata[] = [];
    
    if (rawBlocks && rawBlocks.block_type === "Document") {
        for (const pageBlock of rawBlocks.children) {
            if (!pageBlock.text || typeof pageBlock.text !== "string") continue;
            
            // Get all text items for this page and flatten them
            const allTextItems = pageBlock.textItems.flat();
            
            // Create a continuous text string with markers for text item boundaries
            let fullText = '';
            const itemPositions: { start: number; item: TextItem; }[] = [];
            
            allTextItems.forEach(item => {
                const startPos = fullText.length;
                fullText += item.text + ' ';
                itemPositions.push({ start: startPos, item });
            });
            
            // Clean the text while preserving original positions
            const cleanedText = fullText
                .replace(/-\s*\n/g, '')
                .replace(/\n+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            // Split into sentences
            const sentences = sbd.sentences(cleanedText, { newline_boundaries: true });
            
            for (const sentence of sentences) {
                const cleanedSentence = sentence.trim();
                if (!cleanedSentence) continue;
                
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
                        text: searchText,
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
  const { blocks, metadata } = await parsePdfWithMarker(file);
  if (!blocks) {
    console.error("Parsed data is empty. Skipping cleaning.");
    return [];
  }
  console.log('blocks metadata', metadata)
  return cleanAndSplitText(blocks, metadata);
}
