import {
    ChatWindow,
    RAGProvider,
    SourcesDisplay,
    ContentDisplay,
    Message,
    GenerateStreamChunk,
    QueryField,
    ErrorDisplay,
    RetrievalResult,
    SourceReference,
    SourceContent,
    PDFSourceContent,
    TextContent,
} from 'lexio';
import {createTheme} from "../../../../rag-ui/lib/theme";

// TODO: import of Theme
// we create a custom theme for the demo which overrides the default theme values
const demoTheme = createTheme({
    colors: {
        primary: '#1D3D3C',
        contrast: '#FFFFFF',
        secondary: '#4172b6',
        background: 'white',
        toolbarBackground: '#366563',
        secondaryBackground: '#bbd5d3',
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
                            return source as SourceReference; // Direct pass-through of SourceReference objects
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
            // console.log('Generated chunk:', chunk);
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

        return responseData;
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
        <div className="w-full h-screen flex flex-col">
            {/* Modern Navbar */}
            <nav className="w-full bg-white shadow-sm px-6 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h2 className="text-2xl">
                        RAG with Lexio📚 + Langchain🦜 + ChromaDB🔥
                    </h2>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://renumics.com/open-source/docs/lexio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                            Docs
                        </a>
                        <a
                            href="https://github.com/renumics/lexio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd"
                                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                      clipRule="evenodd"/>
                            </svg>
                            GitHub
                        </a>
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
