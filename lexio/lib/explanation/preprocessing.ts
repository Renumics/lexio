// preprocessing.ts
import { pdfjs } from 'react-pdf';
import sbd from 'sbd';

// Set the pdfjs worker source from the CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface ParseResult {
  blocks: any;
  metadata: any;
}

export interface TextWithMetadata {
  text: string;
  metadata: { [key: string]: any };
}

/**
 * Parses a PDF file using pdfjs from react-pdf.
 */
export async function parsePdfWithMarker(file: File): Promise<ParseResult> {
  console.log(`Parsing PDF: ${file.name}`);

  // Read the file as an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Load the PDF document using pdfjs (from react-pdf)
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const blocks: any = {
    block_type: "Document",
    children: [] as any[],
  };

  // Process each page
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Combine text items from the page
    const pageText = content.items.map((item: any) => item.str).join(" ");

    // Create a block for the page
    blocks.children.push({
      id: `page_${i}`,
      block_type: "Page",
      text: pageText,
    });
  }

  const metadata = {
    numPages,
    fileName: file.name,
  };

  return { blocks, metadata };
}

/**
 * Remove HTML tags from a string.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

/**
 * Recursively traverse block structure and collect text.
 */
function traverseAndCollectText(
  block: any,
  parentMetadata: { [key: string]: any } = {}
): TextWithMetadata[] {
  const collected: TextWithMetadata[] = [];
  const currentMetadata = {
    block_id: block.id,
    block_type: block.block_type,
  };
  const metadata = { ...parentMetadata, ...currentMetadata };

  if (block.text && typeof block.text === "string" && block.text.trim()) {
    collected.push({
      text: block.text.trim(),
      metadata,
    });
  } else if (block.html && typeof block.html === "string") {
    const stripped = stripHtml(block.html).trim();
    if (stripped) {
      collected.push({
        text: stripped,
        metadata,
      });
    }
  }

  if (Array.isArray(block.children)) {
    for (const child of block.children) {
      collected.push(...traverseAndCollectText(child, metadata));
    }
  }
  return collected;
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
function cleanAndSplitText(rawBlocks: any, metadata: any): TextWithMetadata[] {
  let textsWithMetadata: TextWithMetadata[] = [];

  if (rawBlocks && rawBlocks.block_type === "Document") {
    textsWithMetadata = traverseAndCollectText(rawBlocks);
  } else {
    const rawText = metadata.rawText || "";
    textsWithMetadata = [{ text: rawText, metadata: {} }];
  }

  const processedSentences: TextWithMetadata[] = [];

  for (const item of textsWithMetadata) {
    let text = item.text;
    text = text.replace(/-\s*\n/g, "");       // Merge hyphenated words
    text = text.replace(/\n+/g, "\n");         // Collapse multiple newlines
    text = text.replace(/sourcetarget/g, "source-target");
    text = text.replace(/^#+\s+/gm, "");        // Remove markdown headers
    text = text.trim();
    text = removeSpecialTokens(text, ["<EOS>", "<pad>"]);

    // Split the text into sentences using sbd
    const sentences = sbd.sentences(text, { newline_boundaries: true });
    for (const sentence of sentences) {
      const cleanedSentence = sentence.replace(/\s+/g, " ").trim();
      if (cleanedSentence) {
        processedSentences.push({
          text: cleanedSentence,
          metadata: item.metadata,
        });
      }
    }
  }

  return processedSentences;
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
  return cleanAndSplitText(blocks, metadata);
}
