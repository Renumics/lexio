// ideaSplitter.ts
import OpenAI from 'openai';
import nlp from 'compromise';
import { extractClauses } from './clause_extractor';

// Use Vite's environment variables for the API key.
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('VITE_OPENAI_API_KEY is not defined in your environment variables.');
}

const client = new OpenAI({ 
  apiKey, 
  dangerouslyAllowBrowser: true 
});

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
 * This example calls a Python script using spawnSync, but you could also use the local clause extractor.
 */
// export function splitIntoIdeasDependencyParsing(sentence: string): string[] {
//   // Option 1: Use the local TypeScript clause extractor (using compromise)
//   try {
//     const clauses = extractClauses(sentence);
//     return clauses && clauses.length ? clauses : [sentence];
//   } catch (error) {
//     console.error("Error in local dependency parsing splitting:", error);
//   }

//   // Option 2: Call the Python script (uncomment below to use)
//   /*
//   const processResult = spawnSync('python3', ['clause_extractor.py'], {
//     input: sentence,
//     encoding: 'utf-8',
//     maxBuffer: 1024 * 1024,
//   });

//   if (processResult.error) {
//     console.error("Error calling dependency parser:", processResult.error);
//     return [sentence];
//   }
//   try {
//     const result = JSON.parse(processResult.stdout);
//     return Array.isArray(result) && result.length ? result : [sentence];
//   } catch (err) {
//     console.error("Error parsing dependency parser output:", err);
//     return [sentence];
//   }
//   */
//   return [sentence]; // Fallback
// }

export function splitIntoIdeasDependencyParsing(sentence: string): string[] {
  try {
    const clauses = extractClauses(sentence);
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
  const prompt = `Please split the following sentence into a list of distinct ideas, each on a new line:\n\n"${sentence}"\n\nList:`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo', // Change to your desired model (e.g., 'gpt-4o')
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    // Access the output text from the first choice.
    const outputText: string = response.choices[0].message?.content || '';
    return outputText
      .split('\n')
      .map(line => line.replace(/^\d+[\).\s]*/, '').trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Error calling LLM for idea splitting:", error);
    return [sentence];
  }
}
