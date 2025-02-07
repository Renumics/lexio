// ideaSplitter.js
const { spawnSync } = require('child_process');
const OpenAI = require('openai');

/**
 * The simplest Heuristic-based splitting:
 * Splits on semicolons, colons, and further splits on the word 'and' if the fragment is long.
 */
function splitIntoIdeasHeuristic(sentence) {
  // First split by semicolons and colons.
  let parts = sentence.split(/;|:/);
  
  // Further split long parts by the conjunction "and" (this is a simple heuristic).
  const furtherSplit = parts.flatMap(part => {
    return part.trim().length > 100 ? part.split(/\band\b/) : [part];
  });
  
  return furtherSplit.map(p => p.trim()).filter(Boolean);
}

// TODO: enhance spaCE complexity
/**
 * Dependency parsing splitting:
 * Calls an external Python script (e.g., clause_extractor.py) to use a dependency parser (spaCy) 
 * for splitting the sentence into clauses.
 *
 * Note: You must have a Python script (shown below) in your project.
 */
function splitIntoIdeasDependencyParsing(sentence) {
  // Call the python script with the sentence as input.
  const processResult = spawnSync('python3', ['clause_extractor.py'], {
    input: sentence,
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024,
  });
  
  if (processResult.error) {
    console.error("Error calling dependency parser:", processResult.error);
    return [sentence];
  }
  try {
    const result = JSON.parse(processResult.stdout);
    return Array.isArray(result) && result.length ? result : [sentence];
  } catch (err) {
    console.error("Error parsing dependency parser output:", err);
    return [sentence];
  }
}

/**
 * LLM-based splitting:
 * Uses the OpenAI API to split the sentence into distinct ideas.
 * Make sure your environment variable OPENAI_API_KEY is set.
 */
async function splitIntoIdeasUsingLLM(sentence) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Please split the following sentence into a list of distinct ideas, each on a new line:\n\n"${sentence}"\n\nList:`;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.5,
      });
      
      // Corrected access to the response
      const outputText = response.choices[0].message.content;
      return outputText
        .split('\n')
        .map(line => line.replace(/^\d+[\).\s]*/, '').trim())
        .filter(Boolean);
    } catch (error) {
      console.error("Error calling LLM for idea splitting:", error);
      return [sentence];
    }
  }
  
  module.exports = {
    splitIntoIdeasHeuristic,
    splitIntoIdeasDependencyParsing,
    splitIntoIdeasUsingLLM
  };
  