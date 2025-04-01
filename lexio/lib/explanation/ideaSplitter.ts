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
    return placeholder;
  });

  // Split the text into sections based on headers and major breaks
  const sections = textWithPlaceholders
    // First split on markdown headers (# or ## etc)
    .split(/(?=(?:^|\n)#{1,6} )/g)
    .flatMap(section => {
      // For each section, split on double newlines (paragraph breaks)
      return section.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
    });

  // Process each section to extract ideas
  const ideas = sections.flatMap(section => {
    // If it's a list, keep it as one unit unless very long
    if (section.match(/^(?:[*-]|\d+\.)\s/m)) {
      if (section.length > 200) {
        // For long lists, split on list items but keep the markers
        return section
          .split(/(?=(?:^|\n)(?:[*-]|\d+\.)\s)/m)
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }
      return [section];
    }

    // For normal text, split on sentence boundaries while preserving context
    return section
      .split(/(?<=[.!?])\s+(?=[A-Z])/g)
      .map(sent => sent.trim())
      .filter(sent => {
        // Don't split if it's part of a common abbreviation
        const commonAbbrev = /(?:Mr\.|Mrs\.|Dr\.|Prof\.|etc\.|e\.g\.|i\.e\.|vs\.|Fig\.|Eq\.|Sec\.)/i;
        return sent.length > 0 && !commonAbbrev.test(sent);
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
      const meaningfulLength = idea.length > 15; // Increased minimum length
      const hasLetters = /[a-zA-Z]/.test(idea);
      const isNotJustPunctuation = !/^[^a-zA-Z0-9]*$/.test(idea);
      const isNotPartialSentence = !idea.match(/^[a-z]/) || idea.match(/^[A-Z]/); // Should start with capital unless it's a code block
      return meaningfulLength && hasLetters && isNotJustPunctuation && isNotPartialSentence;
    });
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
