import { useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { Message, Source, StreamChunk } from '../types';

/**
 * The connector options, including a parseEvent function (once).
 *  'text' => only text stream
 *  'sources' => only sources promise
 *  'both' => both text stream & sources promise
 */
export interface SSEConnectorOptions<TData = any> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  /**
   * parseEvent is the single place to translate incoming SSE data
   * into your text content, any sources, and a `done` signal.
   */
  parseEvent(data: TData): {
    content?: string;
    sources?: Source[];
    done?: boolean;
  };

  /**
   * If you need to build a request body differently, override this.
   */
  buildRequestBody?: (
    messages: Omit<Message, 'id'>[],
    sources: Source[],
    metadata?: Record<string, any>
  ) => any;

  /**
   * Default mode if not specified at request time.
   */
  defaultMode?: 'text' | 'sources' | 'both';
}

export interface SSEConnectorRequest {
  messages: Omit<Message, 'id'>[];
  sources: Source[];
  metadata?: Record<string, any>;

  /**
   * Allows overriding mode for this specific request.
   */
  mode?: 'text' | 'sources' | 'both';
}

/**
 * Create an SSE connector as a React hook, returning a function you call to open a stream.
 * The returned function will:
 *   - Start the SSE using fetchEventSource
 *   - Return either:
 *       { response: AsyncIterable<StreamChunk> }            // if mode === 'text'
 *       { sources: Promise<Source[]> }                      // if mode === 'sources'
 *       { response: AsyncIterable<StreamChunk>, sources: Promise<Source[]> } // if 'both'
 */
export function createSSEConnector(options: SSEConnectorOptions) {
  return useCallback(
    (
      messagesOrRequest: Message[] | SSEConnectorRequest,
      sources?: Source[],
      metadata?: Record<string, any>
    ) => {
      // 1) Normalize input to a consistent SSEConnectorRequest
      const request: SSEConnectorRequest = Array.isArray(messagesOrRequest)
        ? { messages: messagesOrRequest, sources: sources ?? [], metadata }
        : messagesOrRequest;

      const {
        endpoint,
        method = 'POST',
        parseEvent,
        buildRequestBody = (msgs, srcs, meta) => ({ messages: msgs, sources: srcs, metadata: meta }),
        defaultMode = 'both',
      } = options;

      // Final mode (per-request overrides default)
      const mode = request.mode || defaultMode;

      // 2) Build fetch config
      const requestInit: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (method !== 'GET') {
        requestInit.body = JSON.stringify(
          buildRequestBody(request.messages, request.sources, request.metadata)
        );
      }

      // 3) Prepare text streaming structures
      const textQueue: StreamChunk[] = [];
      let textNotify: (() => void) | null = null; // to unblock the generator
      let finished = false; // signals no more events

      // 4) Prepare sources Promise
      const allSources: Source[] = [];
      let sourcesResolved = false;
      let resolveSources!: (val: Source[]) => void;
      let rejectSources!: (err: any) => void;

      const sourcesPromise = new Promise<Source[]>((resolve, reject) => {
        resolveSources = resolve;
        rejectSources = reject;
      });

      // 5) Start SSE in the background
      const sseTask = (async () => {
        try {
          await fetchEventSource(endpoint, {
            method: requestInit.method,
            body: requestInit.body,
            headers: requestInit.headers as Record<string, string>,

            onmessage(ev) {
              if (!ev.data) return; // skip pings or empty events

              try {
                const { content, sources: newSources, done } = parseEvent(JSON.parse(ev.data));

                // a) Text (if mode includes it)
                if ((mode === 'text' || mode === 'both') && content) {
                  textQueue.push({ content, done: !!done });
                  textNotify?.();
                }

                // b) Sources (if mode includes it)
                if ((mode === 'sources' || mode === 'both') && Array.isArray(newSources)) {
                  const normalized = newSources.map(s => ({
                    ...s,
                    id: s.id ?? crypto.randomUUID(),
                  }));
                  allSources.push(...normalized);

                  // If not yet resolved and we have at least one source, resolve now
                  // (i.e. do NOT wait for `done` or end of stream)
                  if (!sourcesResolved && allSources.length > 0) {
                    sourcesResolved = true;
                    resolveSources([...allSources]);
                  }
                }

                // c) Check if done
                if (done) {
                  finished = true;
                  textNotify?.();
                  // We no longer resolveSources here, because
                  // we already did it immediately upon receiving sources
                }
              } catch (err) {
                console.warn('Failed to parse SSE event:', ev.data, err);
              }
            },

            onerror(err) {
              console.error('SSE onerror:', err);
              finished = true;
              textNotify?.();
              throw err;
            },

            onclose() {
              finished = true;
              textNotify?.();
            },
          });
        } catch (err) {
          // If fetchEventSource throws, reject sources if not already
          if (!sourcesResolved) {
            rejectSources(err);
            sourcesResolved = true;
          }
          throw err;
        } finally {
          // SSE has ended for any reason
          // If sources have never arrived, we still resolve with whatever we have (empty or partial)
          if (!sourcesResolved) {
            sourcesResolved = true;
            resolveSources([...allSources]);
          }
        }
      })();

      // 6) The async generator for text
      async function* streamText(): AsyncIterable<StreamChunk> {
        try {
          while (true) {
            // If no text queued and not finished, wait
            if (textQueue.length === 0 && !finished) {
              await new Promise<void>((resolve) => (textNotify = resolve));
              textNotify = null;
            }
            // If finished and no queued text => break
            if (finished && textQueue.length === 0) {
              break;
            }
            // Dequeue and yield
            const chunk = textQueue.shift();
            if (chunk) {
              yield chunk;
              if (chunk.done) {
                finished = true;
              }
            }
          }
        } finally {
          // Clean up SSE
          await sseTask;
        }
      }

      // 7) Return shape based on mode
      if (mode === 'text') {
        // Only text stream
        return { response: streamText() };
      } else if (mode === 'sources') {
        // Only sources
        return { sources: sourcesPromise };
      } else {
        // Both text and sources
        return {
          response: streamText(),
          sources: sourcesPromise,
        };
      }
    },
    [options]
  );
}
