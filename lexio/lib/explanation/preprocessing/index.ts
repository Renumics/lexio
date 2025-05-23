// Export all types
export * from './types';

// Import dependencies for the main function
import { parsePdf } from './parser';
import { cleanAndSplitText } from './text_processor';
import { TextWithMetadata } from './types';  // Only needed for type annotation

/**
 * Main function to parse a PDF file and then clean/split the text.
 * This is the primary entry point for the preprocessing module.
 */
export async function parseAndCleanPdf(file: File): Promise<TextWithMetadata[]> {
  const { blocks } = await parsePdf(file);
  if (!blocks) {
    console.error("Parsed data is empty. Skipping cleaning.");
    return [];
  }
  return cleanAndSplitText(blocks);
}