import './App.css'
import {
    ChatWindow,
    RAGProvider,
    SourcesDisplay,
    ContentDisplay,
    Message,
    AdvancedQueryField,
    RetrievalResult,
    SourceReference,
    SourceContent,
    HTMLSourceContent,
    PDFSourceContent,
    GenerateStreamChunk,
    TextContent,
    MarkdownSourceContent
} from '../lib/main'
import {defaultTheme} from "../lib/theme";

export const customTheme = {
  ...defaultTheme,
  /*colors: {
    ...defaultTheme.colors,
    background: '#FF0000', // custom brand color
  },*/
};

function App() {
    const retrieveAndGenerate = (messages: Message[]) => {
        const query = encodeURIComponent(JSON.stringify({ messages }));
        const eventSource = new EventSource(
            `http://localhost:8000/retrieve-and-generate?messages=${query}`
        );

        const sourcesPromise = new Promise<RetrievalResult[]>((resolve, reject) => {
            const handleSources = (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                if (data.sources) {
                    // Transform sources to match the expected format
                    const transformedSources = data.sources.map((source: any) => {
                        if ('text' in source) {
                            return {
                                text: source.text,
                                sourceName: source.sourceName,
                                relevanceScore: source.relevanceScore,
                                metadata: source.metadata || {}
                            } as TextContent;
                        } else {
                            return {
                                sourceReference: source.sourceReference,
                                type: source.type,
                                sourceName: source.sourceName,
                                relevanceScore: source.relevanceScore,
                                metadata: source.metadata || {},
                                highlights: source.highlights || []
                            } as SourceReference;
                        }
                    });
                    resolve(transformedSources);
                    eventSource.removeEventListener('message', handleSources);
                }
            };

            eventSource.addEventListener('message', handleSources);
            eventSource.onerror = (error) => {
                console.error("EventSource failed:", error);
                eventSource.close();
                reject(new Error('Failed to retrieve sources'));
            };
        });

        const messageQueue: GenerateStreamChunk[] = [];
        let resolveNext: (() => void) | null = null;

        const handleContent = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            // Skip source-only messages
            if (!data.content && !data.done) return;

            // Only use content and done fields, ignore role
            const chunk: GenerateStreamChunk = {
                content: data.content || '',
                done: !!data.done
            };
            messageQueue.push(chunk);
            resolveNext?.();
        };

        eventSource.addEventListener('message', handleContent);

        async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
            try {
                while (true) {
                    if (messageQueue.length === 0) {
                        await new Promise<void>(resolve => {
                            resolveNext = resolve;
                        });
                    }

                    const chunk = messageQueue.shift()!;
                    yield chunk;
                    if (chunk.done) {
                        break;
                    }
                }
            } finally {
                eventSource.removeEventListener('message', handleContent);
                eventSource.close();
            }
        }

        return {
            sources: sourcesPromise,
            response: streamChunks()
        };
    };

    const generate = (messages: Message[], sources: RetrievalResult[]) => {
        const query = encodeURIComponent(
            JSON.stringify({
                messages,
                sources
            })
        );

        const eventSource = new EventSource(
            `http://localhost:8000/generate?messages=${query}`
        );

        const messageQueue: GenerateStreamChunk[] = [];
        let resolveNext: (() => void) | null = null;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            // Only use content and done fields, ignore role
            const chunk: GenerateStreamChunk = {
                content: data.content || '',
                done: !!data.done
            };
            messageQueue.push(chunk);
            resolveNext?.();
        };
  
        eventSource.addEventListener('message', handleMessage);
  
        eventSource.addEventListener('error', (err) => {
            console.warn("EventSource error or connection closed:", err);
            if (eventSource.readyState === EventSource.CLOSED) {
                console.log("EventSource connection closed normally.");
            } else {
                console.error("Unexpected EventSource error:", err);
            }
            eventSource.close();
        });
  
        async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
            try {
                while (true) {
                    if (messageQueue.length === 0) {
                        console.log("Waiting for new message...");
                        await new Promise(resolve => {
                            resolveNext = resolve;
                        });
                    }
        
                    const chunk = messageQueue.shift()!;
                    console.log("Yielding chunk:", chunk);
                    yield chunk;
                    if (chunk.done) {
                        console.log("Streaming complete.");
                        break;
                    }
                }
            } catch (error) {
                console.error("Error while streaming chunks:", error);
            } finally {
                console.log("Cleaning up event source.");
                eventSource.removeEventListener('message', handleMessage);
                eventSource.close();
            }
        }
  
        return streamChunks();
      };
  
  
    // Mock functions for RAGProvider
    const retrieve = async (query: string): Promise<RetrievalResult[]> => {
      const response = await fetch(`http://localhost:8000/retrieve?query=${encodeURIComponent(query)}`);
  
      // Read and log the response content
      const responseData = await response.json();
      //console.log('Response Content:', responseData);
  
      return responseData;
    };

    const getDataSource = async (source: SourceReference): Promise<SourceContent> => {
        let url: string;
        if (source.type === "pdf") {
            url = `http://localhost:8000/pdfs/${encodeURIComponent(source.sourceReference)}`;
        } else if (source.type === "html") {
            url = `http://localhost:8000/htmls/${encodeURIComponent(source.sourceReference)}`;
        } else if (source.type === "markdown") {
            url = `http://localhost:8000/markdowns/${encodeURIComponent(source.sourceReference)}`;
        } else {
            throw new Error(`Unsupported source type: ${source.type}`);
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to get data source. HTTP Status: ${response.status} ${response.statusText}`);
        }

        if (source.type === "html") {
            const text = await response.text();
            const htmlContent: HTMLSourceContent = {
                type: 'html',
                content: `<div class="source-content">${text}</div>`,
                metadata: source.metadata || {}
            };
            return htmlContent;
        } else if (source.type === "markdown") {
            const text = await response.text();
            const markdownContent: MarkdownSourceContent = {
                type: 'markdown',
                content: text,
                metadata: source.metadata || {}
            };
            return markdownContent
        } else if (source.type === "pdf") {
            const arrayBuffer = await response.arrayBuffer();
            const pdfContent: PDFSourceContent = {
                type: 'pdf',
                content: new Uint8Array(arrayBuffer),
                metadata: source.metadata || {},
                highlights: source.highlights || []
            };
            return pdfContent;
        }

        throw new Error("Invalid source type");
    };

    return (
        <div style={{ width: '100%', height: '100vh', padding: '20px' }}>
            <RAGProvider
                retrieveAndGenerate={retrieveAndGenerate}
                generate={generate}
                getDataSource={getDataSource}
                config={{
                    timeouts: {
                        stream: 10000,
                        request: 60000
                    }
                }}
                theme={customTheme}
            >
                <div style={{ 
                    display: 'grid',
                    height: '100%',
                    gridTemplateColumns: '3fr 1fr',
                    gridTemplateRows: '1fr auto 300px',
                    gap: '20px',
                    gridTemplateAreas: `
                        "chat sources"
                        "input sources"
                        "viewer viewer"
                    `
                }}>
                    <div style={{ gridArea: 'chat', minHeight: 0, overflow: 'auto' }}>
                        <ChatWindow />
                    </div>
                    <div style={{ gridArea: 'input' }}>
                        <AdvancedQueryField />
                    </div>
                    <div style={{ gridArea: 'sources', minHeight: 0, overflow: 'auto' }}>
                        <SourcesDisplay />
                    </div>
                    <div style={{ gridArea: 'viewer', height: '300px', overflow: 'auto' }}>
                        <ContentDisplay />
                    </div>
                </div>
            </RAGProvider>
        </div>
      </div>
    )
  }
  
  export default App
  