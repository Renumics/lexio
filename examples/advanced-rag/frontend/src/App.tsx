import React from 'react';
import { 
  RAGProvider, 
  ChatWindow, 
  AdvancedQueryField, 
  SourcesDisplay, 
  ErrorDisplay, 
  GenerateStreamChunk, 
  RetrievalResult 
} from 'lexio';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import './App.css';

interface Message {
  role: string;
  content: string;
}

interface Source {
  doc_path: string;
  text: string;
  id: string;
  score: number;
}

function App() {
  return (
    <div className="app-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <RAGProvider
        retrieveAndGenerate={(messages: Message[]) => {
          // The last user message to pass as 'query'
          const lastMessage = messages[messages.length - 1];

          // We'll use this resolver to pass the retrieval sources to the RAGProvider
          let sourcesResolver: (sources: RetrievalResult[]) => void;
          const sourcesPromise = new Promise<RetrievalResult[]>(resolve => {
            sourcesResolver = resolve;
          });

          /**
           * This async generator streams chunks from SSE in real-time
           */
          async function* streamChunks(query: string): AsyncIterable<GenerateStreamChunk> {
            // A simple FIFO queue for incoming chunks
            const messageQueue: GenerateStreamChunk[] = [];

            // A function to wake up the generator when new chunks arrive
            let notifyGenerator: (() => void) | null = null;

            // Track if the stream is finished (due to 'done' or errors)
            let finished = false;

            // Start the SSE, but *do not* await this call
            const ssePromise = (async () => {
              try {
                await fetchEventSource('http://localhost:8000/api/retrieve-and-generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ query }),
                  onmessage(ev) {
                    try {
                      // Skip empty messages or ping messages
                      if (!ev.data) {
                        return;
                      }

                      const data = JSON.parse(ev.data);

                      // If the server sends sources, resolve them
                      if (data.sources) {
                        sourcesResolver(
                          data.sources.map((source: any) => ({
                            text: source.text,
                            sourceName: source.doc_path,
                            relevanceScore: source.score || 0,
                            metadata: { id: source.id },
                          }))
                        );
                        return;
                      }

                      // Otherwise, push chunk content to the queue
                      messageQueue.push({
                        content: data.content ?? '',
                        done: !!data.done,
                      });

                      // If there's a "done" signal from the server, mark the stream finished
                      if (data.done) {
                        finished = true;
                      }

                      // Wake up the generator
                      notifyGenerator?.();
                    } catch (err) {
                      console.warn('Failed to parse SSE message:', ev.data, err);
                      // Don't throw here - just skip invalid messages
                    }
                  },
                  onerror(err) {
                    console.error('EventSource onerror:', err);
                    finished = true;
                    notifyGenerator?.();
                    throw err;
                  },
                  onclose() {
                    // If the server closes the stream, consider it finished
                    finished = true;
                    notifyGenerator?.();
                  },
                });
              } catch (err) {
                console.error('SSE Stream error:', err);
                finished = true;
                notifyGenerator?.();
              }
            })();

            // The generator loop that yields chunks as soon as they appear
            try {
              while (true) {
                // Wait if no chunks are available and we're not finished
                if (messageQueue.length === 0 && !finished) {
                  await new Promise<void>((resolve) => {
                    notifyGenerator = resolve;
                  });
                  notifyGenerator = null;
                }

                // If we're finished and there are no more queued chunks, break
                if (messageQueue.length === 0 && finished) {
                  break;
                }

                // Dequeue and yield the next chunk
                const chunk = messageQueue.shift()!;
                yield chunk;

                // If chunk.done was set, mark finished (or break directly)
                if (chunk.done) {
                  finished = true;
                }
              }
            } finally {
              // Ensure the SSE promise completes for cleanup
              await ssePromise;
            }
          }

          // Return the streams: the sources promise + the chunk generator
          return {
            sources: sourcesPromise,
            response: streamChunks(lastMessage.content),
          };
        }}
      >
        <div style={{ 
          display: 'grid',
          height: '100vh',
          gridTemplateColumns: '3fr 1fr',
          gridTemplateRows: '1fr auto 300px',
          gap: '20px',
          gridTemplateAreas: `
            "chat sources"
            "input sources"
            "viewer viewer"
          `
        }}>
          {/* Main chat UI */}
          <div style={{ gridArea: 'chat' }}>
            <ChatWindow />
          </div>

          {/* Advanced query input */}
          <div style={{ gridArea: 'input' }}>
            <AdvancedQueryField />
          </div>

          {/* Sources panel */}
          <div style={{ gridArea: 'sources' }}>
            <SourcesDisplay />
          </div>

          {/* Content viewer */}
          <div style={{ 
            gridArea: 'viewer',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            overflowY: 'auto'
          }}>
            <h3>Content Viewer</h3>
            {/* Add additional UI or content display logic if desired */}
          </div>
        </div>
        {/* Handle any encountered errors */}
        <ErrorDisplay />
      </RAGProvider>
    </div>
  );
}

export default App;
