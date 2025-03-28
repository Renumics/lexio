// clause_extractor.ts
// This file provides a heuristic clause extractor in TypeScript using the "compromise" NLP library.
// Note: Unlike the original Python/spaCy version, this does not perform true dependency parsing.

import { loadCompromise } from './dependencies';

export async function extractClauses(text: string): Promise<string[]> {
  // Use compromise to split the text into sentences.
  const nlp = await loadCompromise();
  const doc = nlp(text);
  const sentences = doc.sentences().out('array');
  const clauses: string[] = [];

  // For each sentence, further split by semicolons and colons.
  for (const sentence of sentences) {
    const parts = sentence.split(/;|:/);
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) {
        clauses.push(trimmed);
      }
    }
  }

  return clauses;
}
