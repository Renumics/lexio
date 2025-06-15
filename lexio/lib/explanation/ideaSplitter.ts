// ideaSplitter.ts
import { loadOpenAIChat } from './dependencies';
import { extractClauses } from './clause_extractor';

/**
 * Splits a block of text into an array of sentence strings,
 * removing markdown formatting and bullet points while preserving content.
 *
 * @param text - The text to split.
 * @returns An array of clean sentence strings without markdown formatting.
 */
export function splitIntoSentences(text: string): string[] {
  // First, preserve markdown sections by splitting on paragraph breaks
  const paragraphs = text.split(/\n\n+/);
  const segments: string[] = [];

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    
    // Skip empty paragraphs
    if (!trimmedParagraph) continue;
    
    // Check if it's a markdown header and clean it
    if (/^#{1,6}\s.+/.test(trimmedParagraph)) {
      // Remove the heading markers (#) and extract content
      const cleanHeader = trimmedParagraph.replace(/^#{1,6}\s+/, '');
      segments.push(cleanHeader);
      continue;
    }
    
    // Check if it's a section header (single line ending with colon)
    if (!trimmedParagraph.includes('\n') && trimmedParagraph.endsWith(':')) {
      continue;  // Skip section headers
    }
    
    // Check if it's a section with lists
    if (trimmedParagraph.includes('\n')) {
      const lines = trimmedParagraph.split('\n');
      let currentSegment = '';
      
      // Skip the first line if it's a section header
      const startIndex = (lines[0].endsWith(':') && lines[1].trim() === '') ? 2 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;  // Skip empty lines
        
        // Check if this is a new list item
        if (/^\d+\./.test(line) || /^[-*+]/.test(line)) {
          // Save previous segment if exists
          if (currentSegment) {
            segments.push(currentSegment);
            currentSegment = '';
          }
          
          // Clean the line: remove bullet points, numbers, etc.
          if (/^\d+\./.test(line)) {
            currentSegment = line.replace(/^\d+\.\s*/, '');
          } else {
            currentSegment = line.replace(/^[-*+]\s*/, '');
          }
        } else if (currentSegment) {
          // Continue previous segment
          currentSegment += ' ' + line;
        } else {
          // New standalone line
          currentSegment = line;
        }
      }
      
      // Add the last segment
      if (currentSegment) {
        segments.push(currentSegment);
      }
      continue;
    }
    
    // Check if it's a markdown list and clean it
    if (/^(\s*[-*+]|\s*\d+\.)\s/.test(trimmedParagraph)) {
      const lines = trimmedParagraph.split('\n');
      let currentItem = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Check if this is a new list item and clean it
        if (/^\d+\./.test(trimmedLine) || /^[-*+]/.test(trimmedLine)) {
          if (currentItem) {
            segments.push(currentItem);
          }
          
          // Clean the line by removing list markers
          let cleanLine = trimmedLine;
          if (/^\d+\./.test(trimmedLine)) {
            cleanLine = trimmedLine.replace(/^\d+\.\s*/, '');
          } else if (/^[-*+]/.test(trimmedLine)) {
            cleanLine = trimmedLine.replace(/^[-*+]\s*/, '');
          }
          
          currentItem = cleanLine;
        } else if (trimmedLine) {
          // Continue previous item
          currentItem += ' ' + trimmedLine;
        }
      }
      
      // Add the last item
      if (currentItem) {
        segments.push(currentItem);
      }
      continue;
    }
    
    // For regular paragraphs, split by sentences
    const sentenceRegex = /[^.!?]+[.!?]+[\])'"'"]*/g;
    const sentences = trimmedParagraph.match(sentenceRegex) || [];
    
    // If no sentences were found and the paragraph is not empty, add it as a whole
    if (sentences.length === 0 && trimmedParagraph.length > 0) {
      segments.push(trimmedParagraph);
    } else {
      segments.push(...sentences.map(s => s.trim()).filter(s => s.length > 0));
    }
  }

  return segments;
}

/**
 * Heuristic-based idea splitting that uses a two-step process:
 * 1. Normalize and segment text into sentences
 * 2. Further refine each sentence using heuristic rules
 */
export async function splitIntoIdeasHeuristic(text: string): Promise<string[]> {
  // Step 1: Get clean sentences using our markdown-aware splitting
  const initialSentences = splitIntoSentences(text);

  // Step 2: Apply heuristic splitting to each sentence
  const allClaims = initialSentences.flatMap(sentence => 
    splitSentenceByHeuristics(sentence)
  );
  
  return allClaims;
}

/**
 * Applies heuristic rules to split a single sentence into multiple claims
 * based on conjunctions, punctuation, and other linguistic markers.
 * 
 * @param sentence - A single sentence to split into claims
 * @returns An array of distinct claims extracted from the sentence
 */
function splitSentenceByHeuristics(sentence: string): string[] {
  // Skip short sentences or those that don't seem to contain multiple ideas
  if (sentence.length < 15 || !containsConjunctionsOrDelimiters(sentence)) {
    return [sentence];
  }

  // Split on common coordinating conjunctions and punctuation that often separate ideas
  const splitRegex = /\s*(?:[,;]|(?:\s+(?:and|but|or|while|whereas|however|yet|though|although)\s+))/i;
  
  const rawClaims = sentence.split(splitRegex);
  
  // Process and filter the claims
  const claims = rawClaims
    .map(claim => claim.trim())
    .filter(claim => {
      // Remove empty claims or those that are too short to be meaningful
      if (!claim || claim.length < 5) return false;
      
      // Ensure claim has both a subject and a verb (basic check)
      const hasSubjectAndVerb = /\w+\s+\w+/.test(claim);
      
      return hasSubjectAndVerb;
    });

  // If splitting produced no valid claims, return original sentence
  return claims.length > 0 ? claims : [sentence];
}

/**
 * Helper function to check if a sentence likely contains multiple ideas
 * by looking for common conjunctions and delimiters
 */
function containsConjunctionsOrDelimiters(sentence: string): boolean {
  const conjunctionPattern = /(?:,\s+|\s+(?:and|but|or|while|whereas|however|yet|though|although)\s+|;)/i;
  return conjunctionPattern.test(sentence);
}

/**
 * Dependency parsing splitting:
 * Uses a dependency parser to extract sub-ideas from each sentence.
 * This method provides more granular idea extraction than simple sentence splitting.
 * For full documents, first splits into sentences using markdown-aware parsing,
 * then further breaks down each sentence into smaller idea units.
 */
export async function splitIntoIdeasDependencyParsing(text: string): Promise<string[]> {
  try {
    // First split text into sentences using markdown-aware function
    const sentences = splitIntoSentences(text);
    
    // Only apply dependency parsing to longer sentences that might contain multiple ideas
    const ideasPromises = sentences.map(async (sentence) => {
      // Skip further processing for headers, section titles and short sentences
      if (sentence.length < 15) {
        return [sentence];
      }
      
      try {
        const clauses = await extractClauses(sentence);
        return clauses && clauses.length ? clauses : [sentence];
      } catch (error) {
        console.error("Error in dependency parsing for sentence:", error);
        return [sentence];
      }
    });
    
    // Flatten the array of arrays into a single array of ideas
    const results = await Promise.all(ideasPromises);
    return results.flat();
  } catch (error) {
    console.error("Error in dependency parsing splitting:", error);
    return [text];
  }
}

/**
 * LLM-based idea extraction:
 * Uses an LLM to extract more granular ideas from each sentence.
 * This is the most sophisticated method but requires API calls.
 * For full documents, first splits into sentences using markdown-aware parsing,
 * then uses an LLM to extract specific ideas from longer sentences.
 */
export async function splitIntoIdeasUsingLLM(text: string): Promise<string[]> {
  try {
    // First split text into sentences using markdown-aware function
    const sentences = splitIntoSentences(text);
    
    // For efficiency, only send reasonable-sized text chunks to the LLM
    const MAX_CHARS = 1000; // Reasonable chunk size for LLM processing
    
    // Process each sentence with LLM
    const allIdeas: string[] = [];
    
    for (const sentence of sentences) {
      // Skip processing for short sentences - just use them as-is
      if (sentence.length < 40) {
        allIdeas.push(sentence);
        continue;
      }
      
      // For longer sentences, use LLM to extract ideas
      if (sentence.length > MAX_CHARS) {
        console.warn(`Sentence too long (${sentence.length} chars), truncating for LLM processing`);
        // Process the truncated sentence
        const truncatedSentence = sentence.substring(0, MAX_CHARS);
        const ideas = await processWithLLM(truncatedSentence);
        allIdeas.push(...ideas);
      } else {
        const ideas = await processWithLLM(sentence);
        allIdeas.push(...ideas);
      }
    }
    
    return allIdeas;
  } catch (error) {
    console.error("Error in LLM idea splitting:", error);
    return splitIntoSentences(text); // Fallback to sentence splitting
  }
}

/**
 * Helper function to process text with LLM for idea extraction
 */
async function processWithLLM(sentence: string): Promise<string[]> {
  const prompt = `Extract key phrases from this text that represent complete, distinct ideas. Each phrase must be an exact word-for-word match from the original text.

Original text: "${sentence}"

Rules:
1. Only use words that appear exactly in the original text
2. Include subject/context when important (e.g., "The model learns" rather than just "learns")
3. Keep related concepts together (e.g., "examples and data" rather than separate)
4. Each phrase should be complete enough to stand alone (typically 5-15 words)
5. Do not add any numbering or formatting
6. Do not modify or paraphrase the text

Example:
Text: "The model learns from examples and uses reinforcement learning to improve performance over time."
Output:
The model learns from examples
uses reinforcement learning to improve performance
improve performance over time

Now extract phrases from the original text:`;

  try {
    console.log('Attempting OpenAI API call...');
    const client = await loadOpenAIChat();
    console.log('OpenAI client loaded');
    
    const outputText = await client.createChatCompletion([
      { role: 'system', content: 'You are a helpful assistant that extracts meaningful, complete phrases from text.' },
      { role: 'user', content: prompt }
    ], {
      model: 'gpt-3.5-turbo',
      max_tokens: 150,
      temperature: 0.3,
    });
    console.log('OpenAI API call successful');

    const ideas = outputText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => {
        // Add a word count check to filter out tiny fragments
        const wordCount = line.split(/\s+/).length;
        const exists = line && sentence.includes(line) && wordCount > 1;
        if (!exists && line) {
          console.log('Filtered out non-matching or too-short phrase:', line);
        }
        return exists;
      });

    return ideas.length > 0 ? ideas : [sentence];
  } catch (error) {
    console.error("Detailed error in processWithLLM:", error);
    throw error; // Re-throw to see if it's being caught
  }
}
