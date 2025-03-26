import { Source } from "../types";
import { useCallback } from "react";
/**
 * --- Type Definitions for Default Functions ---
 */
export type BuildFetchRequestFn = (source: Source) => {
  url: string;
  init?: RequestInit;
};

export type ParsePDFFn = (
  arrayBuffer: ArrayBuffer,
  source: Source
) => Source;

export type ParseTextFn = (
  text: string,
  source: Source
) => Source;

/**
 * --- Connector Options ---
 */
export interface PromiseSourceContentConnectorOptions {
  /**
   * A function that, given a SourceReference, returns the URL and optional RequestInit for fetch.
   * Defaults to using the 'id' in source.metadata and building:
   *   http://localhost:8000/pdfs/<id>
   */
  buildFetchRequest?: BuildFetchRequestFn;

  /**
   * Parse an ArrayBuffer from PDF responses into a PDFSourceContent.
   */
  parsePDF?: ParsePDFFn;

  /**
   * Parse text responses into either HTML or Markdown content (or both).
   * We treat everything that isn't 'pdf' as text-based.
   */
  parseText?: ParseTextFn;

}

/**
 * --- Defaults ---
 */

// 1) Default buildFetchRequest
const defaultBuildFetchRequest: BuildFetchRequestFn = (source) => {
  const id = source.metadata?.id;
  if (!id) {
    throw new Error('No ID provided in source metadata');
  }
  const url = `http://localhost:8000/pdfs/${encodeURIComponent(id)}`;
  return { url };
};

// 2) Default parsePDF
const defaultParsePDF: ParsePDFFn = (arrayBuffer, source) => {
  return {
    ...source,
    type: 'pdf',
    data: new Uint8Array(arrayBuffer),
    metadata: source.metadata || {},
  };
};

// 3) Default parseText (handles "html" vs. "markdown" or anything else)
const defaultParseText: ParseTextFn = (text, source) => {
  return {
    ...source,
    type: source.type || 'markdown',
    data: text,
    metadata: source.metadata || {},
  };
};

/**
 * --- The Hook ---
 * Returns a function that RAGProvider can use as getDataSource={...}.
 */
export function createRESTContentSource(
  options: PromiseSourceContentConnectorOptions = {}
) {
  const {
    buildFetchRequest = defaultBuildFetchRequest,
    parsePDF = defaultParsePDF,
    parseText = defaultParseText,
  } = options;

  /**
   * The function for retrieving the actual content from a Source.
   */
  const getDataSource = useCallback(async (source: Source): Promise<Source> => {
    // 1) Figure out where/what to fetch
    const result = buildFetchRequest(source);

    // 2) Fetch
    let response;
    if (result.init) {
      response = await fetch(result.url, result.init);
    } else {
      response = await fetch(result.url);
    }
    if (!response.ok) {
      throw new Error(
        `Failed to fetch content from ${result.url}. HTTP Status: ${response.status} ${response.statusText}`
      );
    }

    // 3) Decide if it's PDF or text
    if (source.type === 'pdf') {
      // Binary path
      const arrayBuffer = await response.arrayBuffer();
      return parsePDF(arrayBuffer, source);
    } else {
      // Everything else => text path
      // (includes 'html', 'markdown', or any custom string)
      const text = await response.text();
      return parseText(text, source);
    }
  }, [
    buildFetchRequest,
    parsePDF,
    parseText,
  ]);

  return getDataSource;
}