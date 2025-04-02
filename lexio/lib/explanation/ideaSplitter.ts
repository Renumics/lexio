// ideaSplitter.ts
import { loadOpenAIChat } from './dependencies';
import { extractClauses } from './clause_extractor';

/**
 * The simplest Heuristic-based splitting:
 * Splits text into meaningful ideas while preserving markdown structure and formatting.
 */
export function splitIntoIdeasHeuristic(sentence: string): string[] {
  // Store code blocks to preserve them
  const codeBlocks: string[] = [];
  let blockCounter = 0;
  
  // Replace code blocks with placeholders
  const textWithPlaceholders = sentence.replace(/```[\s\S]*?```/g, (match) => {
    const placeholder = `__CODE_BLOCK_${blockCounter}__`;
    codeBlocks[blockCounter] = match;
    blockCounter++;
    return placeholder + '\n';  // Add newline to ensure proper separation
  });

  // First, split on markdown headers while preserving them with their content
  const headerSections = textWithPlaceholders
    .split(/(?=(?:^|\n)#{1,6} )/g)
    .map(section => section.trim())
    .filter(Boolean);

  // Process each header section
  const ideas = headerSections.flatMap(section => {
    // Split section into paragraphs, preserving code blocks
    const paragraphs = section
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(Boolean);
    
    return paragraphs.flatMap(paragraph => {
      // Handle headers (as separate items)
      if (paragraph.match(/^#{1,6} /)) {
        return [paragraph];
      }

      // Handle code blocks (already replaced with placeholders)
      if (paragraph.includes('__CODE_BLOCK_')) {
        // Keep entire code block as one idea
        return [paragraph];
      }

      // Handle lists - look for bullet points or numbered items
      if (paragraph.match(/^(?:[*-]|\d+\.)\s/m)) {
        // Split into list items while preserving the list markers
        const listItems = paragraph
          .split(/\n(?=(?:[*-]|\d+\.)\s)/)
          .map(item => item.trim())
          .filter(item => {
            // Ensure the item has actual content beyond the marker
            const content = item.replace(/^(?:[*-]|\d+\.)\s+/, '').trim();
            return content.length > 0;
          });

        // If this is a list with an introduction, separate intro and items
        if (paragraph.includes(':')) {
          const [intro, ...items] = paragraph.split(/(?<=:)/);
          if (intro && items.length) {
            return [intro.trim(), ...listItems];
          }
        }

        return listItems;
      }

      // For normal text, split on sentence boundaries while preserving context
      const sentences = paragraph
        .split(/(?<=[.!?])(?:\s+|\n+)(?=[A-Z]|$)/g)
        .map(sent => sent.trim())
        .filter(sent => {
          // Enhanced abbreviation handling
          const commonAbbrev = /(?:Mr\.|Mrs\.|Dr\.|Prof\.|etc\.|e\.g\.|i\.e\.|vs\.|Fig\.|Eq\.|Sec\.|[A-Z]\.[A-Z]\.)/i;
          return sent.length > 0 && !commonAbbrev.test(sent);
        });

      // Group closely related sentences
      return sentences.reduce<string[]>((groups, sent, i, arr) => {
        const prevSent = arr[i - 1];
        const shouldGroup = prevSent && (
          // Group if sentence is very short (likely a continuation)
          sent.length < 30 ||
          // Group if second sentence starts with connecting words
          /^(However|Therefore|Thus|Additionally|Furthermore|Moreover|Also|This|These|Those|It|They)/i.test(sent) ||
          // Group if sentence contains parentheses or is part of a definition
          (sent.includes('(') && sent.includes(')')) ||
          // Group if previous sentence ends with a colon or contains "through:"
          prevSent.endsWith(':') ||
          prevSent.includes('through:') ||
          // Group if sentences share key terms
          (prevSent && findCommonKeyTerms(prevSent, sent)) ||
          // Group if sentences are short and related
          (sent.length + prevSent.length < 100 && hasRelatedContent(prevSent, sent))
        );

        if (shouldGroup && groups.length > 0) {
          groups[groups.length - 1] += ' ' + sent;
        } else {
          groups.push(sent);
        }
        return groups;
      }, []);
    });
  });

  // Restore code blocks and clean up
  return ideas
    .map(idea => {
      let processed = idea.trim();
      // Restore code blocks
      codeBlocks.forEach((block, index) => {
        processed = processed.replace(`__CODE_BLOCK_${index}__`, block);
      });
      return processed;
    })
    .filter(idea => {
      // Enhanced filtering criteria
      const meaningfulLength = idea.length > 15;
      const hasLetters = /[a-zA-Z]/.test(idea);
      const isNotJustPunctuation = !/^[^a-zA-Z0-9]*$/.test(idea);
      const isNotPartialSentence = 
        idea.includes('```') || // Allow code blocks
        !idea.match(/^[a-z]/) || // Should start with capital
        idea.match(/^[-*\d]/) || // Allow list items
        idea.match(/^#{1,6} /);  // Allow headers
      const hasCompleteThought = 
        idea.match(/[.!?]$/) || // Ends with punctuation
        idea.includes('```') || // Is a code block
        idea.match(/^[-*\d]/) || // Is a list item
        idea.match(/^#{1,6} /) || // Is a header
        idea.includes(':'); // Ends with a colon for list introductions
      
      return meaningfulLength && hasLetters && isNotJustPunctuation && 
             isNotPartialSentence && hasCompleteThought;
    });
}

// Helper function to find common key terms between sentences
function findCommonKeyTerms(sent1: string, sent2: string): boolean {
  // Extract significant words (nouns, verbs, adjectives)
  const words1: string[] = sent1.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const words2: string[] = sent2.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  
  // Count common significant words
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length >= 2;
}

// Helper function to check if sentences have related content
function hasRelatedContent(sent1: string, sent2: string): boolean {
  // Check for parenthetical explanations
  if (sent2.includes('(') && sent2.includes(')')) return true;
  
  // Check for list-like continuations
  if (sent2.match(/^(such as|like|including|e\.g\.|i\.e\.)/i)) return true;
  
  // Check for subject continuity (e.g., "The model... It...")
  const subjects = /(model|approach|method|system|algorithm|data|results?)/i;
  if (sent1.match(subjects) && sent2.match(/\b(it|this|these|those)\b/i)) return true;
  
  return false;
}

/**
 * Dependency parsing splitting:
 * Uses a dependency parser to split the sentence into clauses.
 */
export async function splitIntoIdeasDependencyParsing(sentence: string): Promise<string[]> {
  try {
    const clauses = await extractClauses(sentence);
    return clauses && clauses.length ? clauses : [sentence];
  } catch (error) {
    console.error("Error in local dependency parsing splitting:", error);
    return [sentence];
  }
}

/**
 * LLM-based splitting:
 * Uses the OpenAI API to split the sentence into distinct ideas.
 */
export async function splitIntoIdeasUsingLLM(sentence: string): Promise<string[]> {
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
    const client = await loadOpenAIChat();
    const outputText = await client.createChatCompletion([
      { role: 'system', content: 'You are a helpful assistant that extracts meaningful, complete phrases from text.' },
      { role: 'user', content: prompt }
    ], {
      model: 'gpt-3.5-turbo',
      max_tokens: 150,
      temperature: 0.3,
    });

    const ideas = outputText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => {
        const exists = line && sentence.includes(line);
        if (!exists && line) {
          console.log('Filtered out non-matching phrase:', line);
        }
        return exists;
      });

    return ideas;
  } catch (error) {
    console.error("Error calling LLM for idea splitting:", error);
    return [sentence];
  }
}
