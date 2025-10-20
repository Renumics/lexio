import { countTokens } from './tokenizer';
import { TextWithMetadata } from '../preprocessing';
import config from '../config';

// Debug logger
const debug = (...args: any[]) => {
  if (config.DEBUG) console.log('[Chunker]', ...args);
};

/* ------------------------------------------------------------------ */
/*  Shared helpers / types                                             */
/* ------------------------------------------------------------------ */
export interface Chunk {
  text: string;
  sentences: TextWithMetadata[];
  /** First (lowest) page number contained in this chunk */
  page?: number;
}

/**
 * Regex-based sentence splitter (unchanged behaviour).
 */
export function splitIntoSentences(text: string): string[] {
  const sentenceRegex = /[^.!?]+[.!?]+[\])'"'"]*/g;
  const sentences = text.match(sentenceRegex) || [];
  return sentences.map(s => s.trim()).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/*  Token–limited, header-aware chunking                               */
/* ------------------------------------------------------------------ */
export async function groupSentenceObjectsIntoChunks(
  sentences: TextWithMetadata[],
  maxTokens: number = 500
): Promise<Chunk[]> {
  if (sentences.length === 0) return [];

  const tokenCounts = await countTokens(sentences.map(s => s.text));
  const chunks: Chunk[] = [];

  let currentChunk: TextWithMetadata[] = [];
  let currentTokenTotal = 0;
  let currentPage = sentences[0].metadata.page;

  const flush = () => {
    if (!currentChunk.length) return;
    const pages = new Set(currentChunk.map(s => s.metadata.page));
    chunks.push({
      text: currentChunk.map(s => s.text).join(' '),
      sentences: currentChunk,
      page: Math.min(...Array.from(pages)),
    });
    currentChunk = [];
    currentTokenTotal = 0;
  };

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const isHeader = s.metadata?.isHeader ?? false;
    const sTokens = tokenCounts[i];

    /* 1. Header boundary – start a new chunk BEFORE the header */
    if (isHeader && currentChunk.length) flush();

    /* Skip adding headers to chunk content - they're only used for boundaries */
    if (isHeader) {
      debug(`Skipping header from chunk content: "${s.text}"`);
      continue;
    }

    /* 2. Token limit */
    if (
      currentTokenTotal + sTokens > maxTokens &&
      currentChunk.length
    ) {
      flush();
    }

    /* Add current sentence */
    currentChunk.push(s);
    currentTokenTotal += sTokens;
    currentPage = s.metadata.page;

    /* 3. Page change - finish chunk */
    const next = sentences[i + 1];
    if (next && next.metadata.page !== currentPage) flush();
  }

  /* Remaining sentences */
  flush();
  debug(`Created ${chunks.length} token-based chunks`);
  return chunks;
}

/* ------------------------------------------------------------------ */
/*  Heuristic, header-aware chunking                                   */
/* ------------------------------------------------------------------ */
export async function groupSentenceObjectsIntoChunksHeuristic(
  sentences: TextWithMetadata[],
  maxSentences = 10,
  minSentences = 2
): Promise<Chunk[]> {
  if (sentences.length === 0) return [];

  const chunks: Chunk[] = [];
  let currentChunk: TextWithMetadata[] = [];

  const flush = () => {
    if (!currentChunk.length) return;
    const pages = new Set(currentChunk.map(s => s.metadata.page));
    chunks.push({
      text: currentChunk.map(s => s.text).join(' '),
      sentences: currentChunk,
      page: Math.min(...Array.from(pages)),
    });
    currentChunk = [];
  };

  const topicShiftMarkers = [
    'However,', 'Nevertheless,', 'In contrast,', 'On the other hand,',
    'Moving on', 'Furthermore,', 'Additionally,', 'Moreover,',
    'First,', 'Second,', 'Third,', 'Finally,', 'In conclusion,',
  ];

  const shouldSplit = (next: TextWithMetadata): boolean => {
    /* Header or page break always splits */
    if (next.metadata?.isHeader) return true;
    if (currentChunk[0].metadata.page !== next.metadata.page) return true;

    /* Sentence-count constraints */
    if (currentChunk.length >= maxSentences) return true;
    if (currentChunk.length < minSentences) return false;

    /* Topic-shift heuristics */
    const lastText = currentChunk[currentChunk.length - 1].text;
    if (topicShiftMarkers.some(m => next.text.startsWith(m))) return true;

    /* Word-overlap heuristic */
    const w = (t: string) => new Set((t.toLowerCase().match(/\b[a-z]{4,}\b/g) || []));
    const overlap = [...w(lastText)].filter(x => w(next.text).has(x));
    return overlap.length < 2;
  };

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];

    /* Header starting a new section */
    if (s.metadata?.isHeader && currentChunk.length) flush();

    /* Skip adding headers to chunk content - they're only used for boundaries */
    if (s.metadata?.isHeader) {
      debug(`Skipping header from chunk content: "${s.text}"`);
      continue;
    }

    currentChunk.push(s);

    const next = sentences[i + 1];
    if (next && shouldSplit(next)) flush();
  }
  flush();

  debug(`Created ${chunks.length} heuristic chunks`);
  return chunks;
}