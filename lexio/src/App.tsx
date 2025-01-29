import './App.css'
import {
    ChatWindow,
    RAGProvider,
    SourcesDisplay,
    ContentDisplay,
    QueryField,
    ErrorDisplay,
    Message,
    AdvancedQueryField,
    RetrievalResult,
    SourceReference,
    SourceContent,
    HTMLSourceContent,
    PDFSourceContent,
    GenerateStreamChunk,
    TextContent,
    MarkdownSourceContent,
    createTheme
} from '../lib/main'

const customTheme = createTheme({
    colors: {
        primary: '#1E88E5',
        secondary: '#64B5F6'
    }
});

function App() {
    const retrieveAndGenerate = (messages: Message[]) => {
        // Convert input messages array to URL-safe format
        const query = encodeURIComponent(JSON.stringify({messages: messages}));
        const eventSource = new EventSource(
            `http://localhost:8000/retrieve-and-generate?messages=${query}`
        );

        // Retrieve sources from the server
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

    /*
      * This is a simple retrieval function that sends a query to the server and returns a list of sources.
     */
    const retrieve = async (query: string): Promise<RetrievalResult[]> => {
        const response = await fetch(`http://localhost:8000/retrieve?query=${encodeURIComponent(query)}`);

        // Read and log the response content
        const responseData = await response.json();
        //console.log('Response Content:', responseData);

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

        async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
            try {
                while (true) {
                    if (messageQueue.length === 0) {
                        await new Promise(resolve => {
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
                eventSource.removeEventListener('message', handleMessage);
                eventSource.close();
            }
        }

        return streamChunks();
    };

    const getDataSource = async (source: SourceReference): Promise<SourceContent> => {
        // We allow only PDF files in this demo
        if (source.type !== "pdf") {
            throw new Error("Invalid source type");
        }

        const url = `http://localhost:8000/sources/${encodeURIComponent(source.sourceReference)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to get data source. HTTP Status: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const pdfContent: PDFSourceContent = {
            type: 'pdf',
            content: new Uint8Array(arrayBuffer),
            metadata: source.metadata || {},
            highlights: source.highlights || []
        };
        return pdfContent;
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
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 p-4">
                <RAGProvider
                    retrieve={retrieve}
                    retrieveAndGenerate={retrieveAndGenerate}
                    getDataSource={getDataSource}
                    config={{
                        timeouts: {
                            stream: 10000,
                            request: 60000
                        }
                    }}
                    onAddMessage={() => {
                        return {
                            type: 'reretrieve',
                            preserveHistory: false
                        }
                    }}
                    theme={demoTheme}
                >
                    <div className="w-full h-full max-h-full max-w-6xl mx-auto flex flex-row gap-4 p-2">
                        {/* Left side: Chat and Query */}
                        <div className="h-3/4 gap-4 w-1/4 flex flex-col">
                            <div className="shrink-0"> {/* Query field */}
                                <QueryField onSubmit={() => {
                                }}/>
                            </div>
                            <div className="h-full"> {/* Chat window */}
                                <ChatWindow/>
                            </div>
                        </div>
                        <div className="w-1/6 h-full"> {/* Sources panel */}
                            <SourcesDisplay/>
                        </div>
                        <div className="w-2/3 h-full overflow-hidden"> {/* Sources panel */}
                            <ContentDisplay/>
                        </div>
                        <ErrorDisplay/>
                    </div>
                </RAGProvider>
            </div>
        </div>
    )
}

export default App
