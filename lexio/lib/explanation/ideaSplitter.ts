// ideaSplitter.ts
import { loadOpenAI } from './dependencies';
import { extractClauses } from './clause_extractor';

/**
 * The simplest Heuristic-based splitting:
 * Splits on semicolons, colons, and further splits on the word "and" if the fragment is long.
 */
export function splitIntoIdeasHeuristic(sentence: string): string[] {
  // First split by semicolons and colons.
  const parts = sentence.split(/;|:/);

  // Further split long parts by the conjunction "and" (this is a simple heuristic).
  const furtherSplit = parts.flatMap(part =>
    part.trim().length > 100 ? part.split(/\band\b/) : [part]
  );

  return furtherSplit.map(p => p.trim()).filter(Boolean);
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

export interface IdeaWithSnippet {
  full: string;
  snippet: string;
}

/**
 * LLM-based splitting:
 * Uses the OpenAI API to split the sentence into distinct ideas.
 */
export async function splitIntoIdeasUsingLLM(sentence: string): Promise<string[]> {
  // console.log('Input sentence:', sentence);
  
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
    const client = await loadOpenAI();
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts meaningful, complete phrases from text.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    const outputText: string = response.choices[0].message?.content || '';
    // console.log('LLM raw output:', outputText);

    const ideas = outputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        const exists = line && sentence.includes(line);
        if (!exists && line) {
          console.log('Filtered out non-matching phrase:', line);
        }
        return exists;
      });

    // console.log('Final extracted ideas:', ideas);
    return ideas;
  } catch (error) {
    console.error("Error calling LLM for idea splitting:", error);
    return [sentence];
  }
}
