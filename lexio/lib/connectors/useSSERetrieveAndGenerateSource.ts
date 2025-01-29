// useSSEConnector.ts

import { useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

/**
 * Minimal references to your domain-specific types
 */
import type {
  Message,
  RetrievalResult,
  GenerateStreamChunk,
  RetrieveAndGenerateResponse,
} from '../types';

/**
 * This is the shape of the object returned by your `parseEvent`.
 *  - If `sources` is an array, we treat it as a "sources" event.
 *  - If `content` is a string, we treat it as a "chunk" event.
 *  - If neither is present, we ignore the message.
 *
 * If `done` is `true`, we mark the stream as finished.
 */
export interface SSEParsedEvent {
  sources?: RetrievalResult[];
  content?: string;
  done?: boolean;
}

/**
 * The options for configuring our SSE connector hook.
 */
export interface SSEConnectorOptions {
  /**
   * The endpoint that returns SSEs. Usually a URL on your server.
   */
  endpoint: string;

  /**
   * (Optional) HTTP method to use for the request.
   * Defaults to 'POST'.
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  /**
   * (Optional) A function that builds the request body from
   * the array of messages and the optional metadata. Only used
   * if `method` != 'GET'.
   *
   * Default: it will create { query: lastMessage.content, metadata }
   */
  buildRequestBody?: (messages: Message[], metadata?: Record<string, any>) => any;

  /**
   * A user-defined function that takes the raw SSE message data (parsed from JSON)
   * and returns an `SSEParsedEvent` object (with optional `sources`, `content`, `done`).
   * If it returns neither `sources` nor `content`, the message is ignored.
   */
  parseEvent(data: any): SSEParsedEvent;
}

/**
 * A React hook returning a function you can pass to <RAGProvider retrieveAndGenerate={...}> or call directly.
 *
 * The returned function, when called with (messages, metadata):
 *  1) Constructs a request (method, body) to `options.endpoint`.
 *  2) Opens an SSE stream to that endpoint.
 *  3) For each event, calls `parseEvent(data)`:
 *     - If `parsed.sources` is present => resolves the "sources" promise
 *     - If `parsed.content` is present => yields a streaming "chunk"
 *     - If `parsed.done` is true => mark the stream finished
 *     - Otherwise => ignore the message
 *  4) Returns { sources: Promise<RetrievalResult[]>, response: AsyncIterable<GenerateStreamChunk> }
 *
 * NOTE: If `parseEvent` changes every render, the returned function changes too.
 *       You can memoize `parseEvent` for performance.
 */
export function useSSERetrieveAndGenerateSource(options: SSEConnectorOptions) {
  const {
    endpoint,
    parseEvent,
    method = 'POST',
    buildRequestBody = defaultBuildRequestBody,
  } = options;

  // Return a stable callback (unless dependencies change)
  return useCallback(
    (messages: Message[], metadata?: Record<string, any>): RetrieveAndGenerateResponse => {
      // 1) Prepare the request
      const requestInit: any = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      // If we're not GET, build the JSON body
      if (method !== 'GET') {
        const bodyObj = buildRequestBody(messages, metadata);
        requestInit.body = JSON.stringify(bodyObj);
      }

      // 2) We'll store a resolver for the sources promise
      let sourcesResolver!: (src: RetrievalResult[]) => void;
      const sourcesPromise = new Promise<RetrievalResult[]>((resolve) => {
        sourcesResolver = resolve;
      });

      // 3) Create the generator for chunk streaming
      async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
        const messageQueue: GenerateStreamChunk[] = [];
        let notifyGenerator: (() => void) | null = null;
        let finished = false;

        // Start SSE in the background (without awaiting)
        const ssePromise = (async () => {
          try {
            await fetchEventSource(endpoint, {
              ...requestInit,

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

      // 4) Return the object that <RAGProvider> or your code expects
      return {
        sources: sourcesPromise,
        response: streamChunks(),
      };
    },
    [endpoint, parseEvent, method, buildRequestBody]
  );
}

/**
 * Default way to build the request body if none is given:
 *  - Takes the messages array
 *  - Includes the metadata if present
 */
function defaultBuildRequestBody(messages: Message[], metadata?: Record<string, any>) {
  return {
    messages,
    metadata
  };
}

