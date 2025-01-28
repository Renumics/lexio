import { useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

import type {
  Message,
  RetrievalResult,
  GenerateStreamChunk,
} from '../types';

/**
 * The shape returned by `parseEvent(data)`.
 */
export interface SSEParsedGenerateEvent {
  /**
   * If present, a chunk of text to yield in the streaming response.
   */
  content?: string;

  /**
   * If true, the stream ends immediately after this chunk.
   */
  done?: boolean;
}

/**
 * The options for configuring our SSE generate hook.
 */
export interface SSEGenerateConnectorOptions {
  /**
   * The endpoint that returns SSE events.
   */
  endpoint: string;

  /**
   * (Optional) HTTP method to use for this request. Defaults to 'POST'.
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  /**
   * (Optional) A function that builds the request body (only used if method != 'GET').
   * By default, it uses the last user message as `query` and includes `sources`.
   */
  buildRequestBody?: (
    messages: Message[],
    sources?: RetrievalResult[]
  ) => any;

  /**
   * A user-defined function that takes SSE message data (parsed from JSON)
   * and returns an SSEParsedGenerateEvent (with optional `content`, `done`).
   * If it returns neither `content` nor `done`, the event is ignored.
   */
  parseEvent(data: any): SSEParsedGenerateEvent;
}

/**
 * A React hook returning a function suitable for <RAGProvider generate={...}>.
 *
 * The returned function, when called with (messages, sources?):
 *  1) Constructs an SSE request to `options.endpoint`.
 *  2) For each SSE message, calls `parseEvent(data)`:
 *     * If `parsed.content` is present => yield a streaming chunk
 *     * If `parsed.done` is true => mark the stream finished
 *  3) Returns an `AsyncIterable<GenerateStreamChunk>`
 */
export function useSSEGenerateSource(options: SSEGenerateConnectorOptions) {
  const {
    endpoint,
    method = 'POST',
    buildRequestBody = defaultBuildRequestBody, // default if none provided
    parseEvent,
  } = options;

  return useCallback(
    (messages: Message[], sources?: RetrievalResult[]): AsyncIterable<GenerateStreamChunk> => {
      // Prepare the request config
      const requestInit: any = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      // If we're not GET, build the JSON body
      if (method !== 'GET') {
        const bodyObj = buildRequestBody(messages, sources);
        requestInit.body = JSON.stringify(bodyObj);
      }

      // Our async generator for chunk streaming
      async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
        const messageQueue: GenerateStreamChunk[] = [];
        let notifyGenerator: (() => void) | null = null;
        let finished = false;

        // Fire up SSE in the background
        const ssePromise = (async () => {
          try {
            await fetchEventSource(endpoint, {
              ...requestInit,

              onmessage(ev) {
                // skip empty/ping events
                if (!ev.data) return;

                try {
                  const data = JSON.parse(ev.data);
                  const parsed = parseEvent(data);

                  if (typeof parsed.content === 'string') {
                    messageQueue.push({
                      content: parsed.content,
                      done: parsed.done,
                    });
                    if (parsed.done) {
                      finished = true;
                    }
                    notifyGenerator?.();
                  }
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
          } catch (err) {
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
              // Wait for new message or finish
              await new Promise<void>((resolve) => {
                notifyGenerator = resolve;
              });
              notifyGenerator = null;
            }

            // If no messages left and we are finished => exit
            if (messageQueue.length === 0 && finished) {
              break;
            }

            // Dequeue a chunk
            const chunk = messageQueue.shift()!;
            yield chunk;

            // If chunk says done, end
            if (chunk.done) {
              finished = true;
            }
          }
        } finally {
          // Cleanup SSE once we're done
          await ssePromise;
        }
      }

      return streamChunks();
    },
    [endpoint, method, buildRequestBody, parseEvent]
  );
}

/**
 * Default way to build the request body if none is given:
 *  - Takes the last user message as { query }
 *  - Also includes the `sources` array if present
 */
function defaultBuildRequestBody(messages: Message[], sources?: RetrievalResult[]) {
    return {
      messages,
      source_ids: sources?.map(source => 
        'sourceReference' in source ? source.sourceReference : null
      ).filter(Boolean)
    };
  }
