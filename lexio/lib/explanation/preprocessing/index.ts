// Export all types
export * from './types';

// Import dependencies for the main function
import { parsePdf } from './parser';
import { cleanAndSplitText } from './text_finalizer';
import { TextWithMetadata } from './types';  // Only needed for type annotation

/**
 * Main function to parse a PDF file and process its contents through the pipeline:
 * 1. PDF Parsing: Extracts raw text and layout information
 * 2. Layout Analysis: Identifies headers, graph elements, and text structure
 * 3. Text Finalization: Cleans and splits text into well-formed sentences
 * 
 * The layout analysis is integrated within the text finalization step through
 * the cleanAndSplitText function which internally uses the layout analyzer.
 */
export async function parseAndCleanPdf(file: File): Promise<TextWithMetadata[]> {
  // Step 1: Parse PDF to extract raw content with layout information
  const { blocks } = await parsePdf(file);
  if (!blocks) {
    console.error("Parsed data is empty. Skipping processing.");
    return [];
  }

  // Step 2 & 3: Process text through layout analysis and finalization
  // (layout analysis is integrated within cleanAndSplitText)
  return cleanAndSplitText(blocks);
}