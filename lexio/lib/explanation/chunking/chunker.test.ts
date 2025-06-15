import { describe, it, expect } from 'vitest';
import { cleanAndSplitText } from '../preprocessing/text_finalizer';
import {
  groupSentenceObjectsIntoChunks,
  groupSentenceObjectsIntoChunksHeuristic,
  Chunk,
} from './chunker';
import testData from '../preprocessing/jsons/textContent2.json';

// Helper ─ ensures no header appears after the 1st sentence in any chunk
const headersAppearOnlyAsFirst = (chunks: Chunk[]) =>
  chunks.every(
    (c) =>
      c.sentences.slice(1).find((s) => s.metadata.isHeader) === undefined,
  );

describe('Chunker – header-aware chunk generation', () => {
  it('token-based chunking respects headers & pages', async () => {
    const sentences = await cleanAndSplitText(testData.blocks);
    const tokenChunks = await groupSentenceObjectsIntoChunks(sentences, 500);

    // basic sanity
    expect(tokenChunks.length).toBeGreaterThan(0);
    expect(
      tokenChunks.reduce((sum, c) => sum + c.sentences.length, 0),
    ).toBe(sentences.length);

    // header boundaries
    expect(headersAppearOnlyAsFirst(tokenChunks)).toBe(true);

    // page boundaries – a chunk never mixes pages
    const violatesPage = tokenChunks.some((c) => {
      const pages = new Set(c.sentences.map((s) => s.metadata.page));
      return pages.size > 1;
    });
    expect(violatesPage).toBe(false);
  });

  it('heuristic chunking respects headers & semantic rules', async () => {
    const sentences = await cleanAndSplitText(testData.blocks);
    const heuristicChunks = await groupSentenceObjectsIntoChunksHeuristic(
      sentences,
      8,
      2,
    );

    // basic sanity
    expect(heuristicChunks.length).toBeGreaterThan(0);
    expect(
      heuristicChunks.reduce((sum, c) => sum + c.sentences.length, 0),
    ).toBe(sentences.length);

    // header boundaries
    expect(headersAppearOnlyAsFirst(heuristicChunks)).toBe(true);

    // page boundaries – a chunk never mixes pages
    const violatesPage = heuristicChunks.some((c) => {
      const pages = new Set(c.sentences.map((s) => s.metadata.page));
      return pages.size > 1;
    });
    expect(violatesPage).toBe(false);
  });
});