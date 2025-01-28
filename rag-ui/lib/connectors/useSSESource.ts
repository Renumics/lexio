// useSSEConnector.ts

import { useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

/**
 * -------------------------------------------------------
 *  Minimal references to external or domain-specific types
 * -------------------------------------------------------
 */
import type {
  Message,
  RetrievalResult,
  GenerateStreamChunk,
  RetrieveAndGenerateResponse,
} from '../types';

/**
 * This is the shape of the object returned by your `parseEvent`.
 * We do not require a "type" field. Instead:
 *  - If `sources` is an array, we treat it as a "sources" event.
 *  - Else if `content` is a string, we treat it as a "chunk" event.
 *  - If neither is present, we ignore the message.
 *
 * If `done` is `true`, we mark the stream as finished.
 */
export interface SSEParsedEvent {
  /** If present, we treat this as a "sources" event and fulfill the sources promise. */
  sources?: RetrievalResult[];

  /** If present, we treat this as a "chunk" of text to yield in the streaming response. */
  content?: string;

  /** If true, we end the stream once this event is processed. */
  done?: boolean;
}

/**
 * The options for configuring our SSE connector hook.
 */
export interface SSEConnectorOptions {
  /**
   * The endpoint to POST the (last user message) query to.
   * This endpoint must produce Server-Sent Events.
   */
  endpoint: string;

  /**
   * A user-defined function that takes the raw SSE message data (parsed from JSON)
   * and returns an `SSEParsedEvent` object, with optional `sources`, `content`, and `done`.
   *
   * If it returns no keys (an empty object), or something that doesn't have `sources` or `content`,
   * the hook will ignore that SSE message.
   */
  parseEvent(data: any): SSEParsedEvent;
}

/**
 * A React hook returning a function you can pass to <RAGProvider retrieveAndGenerate={...}>.
 *
 * The returned function, when called with (messages, metadata):
 *  - Opens an SSE stream to `options.endpoint`
 *  - For each event, calls `parseEvent(data)`:
 *     * If `parsed.sources` is present => it resolves the "sources" promise
 *     * If `parsed.content` is present => it yields a streaming "chunk"
 *     * If `parsed.done` is true => mark the stream finished
 *     * Otherwise => ignore the message
 *  - Returns { sources: Promise<RetrievalResult[]>, response: AsyncIterable<GenerateStreamChunk> }
 *
 * NOTE: If `parseEvent` changes every render, the returned function changes too.
 *       You can memoize `parseEvent` for performance.
 */
export function useSSESource(options: SSEConnectorOptions) {
  const { endpoint, parseEvent } = options;

  // We return a stable callback unless endpoint/parseEvent change.
  return useCallback(
    (messages: Message[], metadata?: Record<string, any>): RetrieveAndGenerateResponse => {
      // 1) The last user message is our "query"
      const lastMessage = messages[messages.length - 1];
      const query = lastMessage?.content ?? '';

      // 2) We'll store a resolver for the sources promise
      let sourcesResolver!: (src: RetrievalResult[]) => void;
      const sourcesPromise = new Promise<RetrievalResult[]>((resolve) => {
        sourcesResolver = resolve;
      });

      // 3) Our async generator for chunk streaming
      async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
        const messageQueue: GenerateStreamChunk[] = [];
        let notifyGenerator: (() => void) | null = null;
        let finished = false;

        // Start SSE in the background (without awaiting)
        const ssePromise = (async () => {
          try {
            await fetchEventSource(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              // You can also include your metadata in the POST body if needed:
              body: JSON.stringify({ query, metadata }),

              onmessage(ev) {
                // skip if empty/ping
                if (!ev.data) return;

                try {
                  const data = JSON.parse(ev.data);
                  const parsed = parseEvent(data);

                  // Decide if this event has 'sources', 'content', or is ignored
                  const isSources = Array.isArray(parsed.sources);
                  const isChunk = typeof parsed.content === 'string';

                  if (isSources) {
                    // If there's an array of "sources", fulfill the sources promise
                    sourcesResolver(parsed.sources!);
                    if (parsed.done) {
                      finished = true;
                    }
                  } else if (isChunk) {
                    // If there's "content", yield it as a chunk
                    messageQueue.push({
                      content: parsed.content!,
                      done: parsed.done,
                    });
                    if (parsed.done) {
                      finished = true;
                    }
                  }
                  // If neither is present => ignore

                  // Wake up the generator
                  notifyGenerator?.();
                } catch (err) {
                  console.warn('Failed to parse SSE event:', ev.data, err);
                }
              },

              onerror(err) {
                console.error('SSE onerror:', err);
                finished = true;
                notifyGenerator?.();
                throw err;
              },

              onclose() {
                finished = true;
                notifyGenerator?.();
              },
            });
          } catch (err: unknown) {
            console.error('SSE stream error:', err);
            finished = true;
            const notify: () => void = notifyGenerator!;
            notify();
          }
        })();

        // The generator loop: yield chunks as they come in
        try {
          while (true) {
            if (messageQueue.length === 0 && !finished) {
              // Wait until there's a new message or we finish
              await new Promise<void>((resolve) => {
                notifyGenerator = resolve;
              });
              notifyGenerator = null;
            }

            if (messageQueue.length === 0 && finished) {
              break;
            }

            const chunk = messageQueue.shift()!;
            yield chunk;

            if (chunk.done) {
              finished = true;
            }
          }
        } finally {
          // Ensure SSE is cleaned up
          await ssePromise;
        }
      }

      // 4) Return the object that <RAGProvider> expects
      return {
        sources: sourcesPromise,
        response: streamChunks(),
      };
    },
    [endpoint, parseEvent]
  );
}