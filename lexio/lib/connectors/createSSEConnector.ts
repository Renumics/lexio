import { useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { Message, Source, StreamChunk } from '../types';

/**
 * The connector options, including an explicit mode.
 *  'text' => ignore parsed.sources
 *  'sources' => ignore parsed.content
 *  'both' => use both
 */
export interface SSEConnectorOptions {
  endpoint: string;
  mode: 'text' | 'sources' | 'both';
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  /**
   * parseEvent() is how you interpret each SSE event's data (already JSON-parsed).
   * Return { content?, sources?, done? } as needed.
   */
  parseEvent(data: any): StreamChunk;

  /**
   * Optional method to build the request body (when method != 'GET').
   * By default: { messages, metadata }
   */
  buildRequestBody?: (messages: Message[], sources: Source[], metadata?: Record<string, any>) => any;
}

/**
 * A React Hook returning a function that, when called, opens an SSE stream
 * and yields { response, sources }.
 */
export function createSSEConnector(options: SSEConnectorOptions) {
  const {
    endpoint,
    mode,
    method = 'POST',
    parseEvent,
    buildRequestBody = (messages, metadata) => ({ messages, metadata }),
  } = options;

  // Return a stable callback that uses the provided options
  return useCallback(
    (messages: Message[], sources: Source[], metadata?: Record<string, any>) => {
      // 1) Build the RequestInit object
      const requestInit: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (method !== 'GET') {
        requestInit.body = JSON.stringify(buildRequestBody(messages, sources, metadata));
      }

      // 2) Prepare data structures for text streaming & source collection
      const textQueue: StreamChunk[] = [];
      let notifyGenerator: (() => void) | null = null;
      let finished = false;

      const allSources: Source[] = [];
      let sourcesResolved = false;
      let sourcesResolver!: (val: Source[]) => void;
      let sourcesRejecter!: (err: any) => void;
      const sourcesPromise = new Promise<Source[]>((resolve, reject) => {
        sourcesResolver = resolve;
        sourcesRejecter = reject;
      });

      // 3) Start SSE in the background
      const sseTask = (async () => {
        try {
          await fetchEventSource(endpoint, {
            // Because fetchEventSource's `headers` must be Record<string,string>, cast it:
            method: requestInit.method,
            body: requestInit.body,
            headers: requestInit.headers as Record<string, string>,

            onmessage(ev) {
              if (!ev.data) return; // skip ping or empty

              try {
                const data = JSON.parse(ev.data);
                const parsed = parseEvent(data);
                const { content, sources, done } = parsed;

                // a) If mode includes text, handle content
                if ((mode === 'text' || mode === 'both') && typeof content === 'string') {
                  textQueue.push({ content, done });
                  notifyGenerator?.();
                }

                // b) If mode includes sources, handle sources
                if ((mode === 'sources' || mode === 'both') && Array.isArray(sources)) {
                  const normalized = sources.map(s => ({
                    ...s,
                    id: s.id ?? crypto.randomUUID(),
                  }));
                  allSources.push(...normalized);
                }

                // c) If done => mark finished
                if (done) {
                  finished = true;
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
          // If fetchEventSource throws, reject the sources if not already
          finished = true;
          const notify: () => void = notifyGenerator!;
          notify();
          if (!sourcesResolved) {
            sourcesRejecter(err);
            sourcesResolved = true;
          }
        } finally {
          // On final closure, if we haven't resolved sources yet, do so now
          if (!sourcesResolved) {
            sourcesResolver(allSources);
            sourcesResolved = true;
          }
        }
      })();

      // 4) The text streaming generator
      async function* streamText(): AsyncIterable<StreamChunk> {
        try {
          while (true) {
            // If no text queued and not finished, wait
            if (textQueue.length === 0 && !finished) {
              await new Promise<void>((resolve) => (notifyGenerator = resolve));
              notifyGenerator = null;
            }
            // If finished and no queued text => break
            if (finished && textQueue.length === 0) {
              break;
            }
            // Dequeue
            const chunk = textQueue.shift();
            if (chunk) {
              yield chunk;
              if (chunk.done) {
                finished = true;
              }
            }
          }
        } finally {
          // Cleanup SSE
          await sseTask;
        }
      }

      // 5) Return the final shape
      return {
        response: streamText(),  // async iterator of StreamChunk
        sources: sourcesPromise, // promise of Source[]
      };
    },
    [endpoint, mode, method, parseEvent, buildRequestBody]
  );
}
