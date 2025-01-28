import { SourceReference, SourceContent, HTMLSourceContent, MarkdownSourceContent, PDFSourceContent } from "../types";
import { useCallback } from "react";
/**
 * --- Connector Options ---
 */
export interface PromiseSourceContentConnectorOptions {
    /**
     * A function that, given a SourceReference, returns the URL and optional RequestInit for fetch.
     * Defaults to using the 'id' in source.metadata and building:
     *   http://localhost:8000/pdfs/<id>
     */
    buildFetchRequest?: (
      source: SourceReference
    ) => {
      url: string;
      init?: RequestInit;
    };
  
    /**
     * Parse an ArrayBuffer from PDF responses into a PDFSourceContent.
     */
    parsePDF?: (
      arrayBuffer: ArrayBuffer,
      source: SourceReference
    ) => PDFSourceContent;
  
    /**
     * Parse text responses into either HTML or Markdown content (or both).
     * We treat everything that isn't 'pdf' as text-based.
     */
    parseText?: (
      text: string,
      source: SourceReference
    ) => HTMLSourceContent | MarkdownSourceContent;
  
    /**
     * (Optional) Called if you want to reject references that do not have `.type` or some unknown type.
     * By default, we do NOT call this, because we assume:
     *   'pdf' => parsePDF
     *    else => parseText
     */
    onUnsupportedType?: (source: SourceReference) => never;
  }
  
  /**
   * --- Defaults ---
   */
  
  // 1) Default buildFetchRequest
  function defaultBuildFetchRequest(source: SourceReference) {
    const id = source.metadata?.id;
    if (!id) {
      throw new Error('No ID provided in source metadata');
    }
    const url = `http://localhost:8000/pdfs/${encodeURIComponent(id)}`;
    return { url };
  }
  
  // 2) Default parsePDF
  function defaultParsePDF(
    arrayBuffer: ArrayBuffer,
    source: SourceReference
  ): PDFSourceContent {
    return {
      type: 'pdf',
      content: new Uint8Array(arrayBuffer),
      metadata: source.metadata || {},
      highlights: source.highlights || [],
    };
  }
  
  // 3) Default parseText (handles "html" vs. "markdown" or anything else)
  function defaultParseText(text: string, source: SourceReference) {
    return {
      type: source.type || 'markdown',
      content: text,
      metadata: source.metadata || {},
    } as HTMLSourceContent | MarkdownSourceContent;
  }
  
  // 4) Default onUnsupportedType (never called by default code path, but you can use it)
  function defaultOnUnsupportedType(source: SourceReference): never {
    throw new Error(`Unsupported source type: ${source.type}`);
  }
  
  /**
   * --- The Hook ---
   * Returns a function that RAGProvider can use as getDataSource={...}.
   */
  export function useRestContentSource(
    options: PromiseSourceContentConnectorOptions = {}
  ) {
    const {
      buildFetchRequest = defaultBuildFetchRequest,
      parsePDF = defaultParsePDF,
      parseText = defaultParseText,
      onUnsupportedType = defaultOnUnsupportedType,
    } = options;
  
    /**
     * The function for retrieving the actual content from a SourceReference.
     */
    const getDataSource = useCallback(async (source: SourceReference): Promise<SourceContent> => {
      // 1) Figure out where/what to fetch
      const { url, init } = buildFetchRequest(source);
  
      // 2) Fetch
      const response = await fetch(url, init);
      if (!response.ok) {
        throw new Error(
          `Failed to get content. HTTP Status: ${response.status} ${response.statusText}`
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
      onUnsupportedType,
    ]);
  
    return getDataSource;
  }