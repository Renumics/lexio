import {
    createTheme,
    ErrorDisplay,
    GenerateStreamChunk,
    Message,
    PDFSourceContent,
    RAGProvider,
    RetrievalResult,
    SourceContent,
    SourceReference,
    TextContent,
} from 'lexio';
import {ApplicationLayout} from "./components/ApplicationLayout.tsx";
import ApplicationMainContent from "./components/ApplicationMainContent.tsx";

// we create a custom theme for the demo which overrides the default theme values
const demoTheme = createTheme({
    colors: {
        primary: '#1D3D3C',
        contrast: '#FFFFFF',
        secondary: '#4172b6',
        background: 'white',
        toolbarBackground: '#366563',
        secondaryBackground: '#bbd5d3',
    },
    typography: {
        // fontFamily: 'Arial',
        fontSizeBase: '1.0rem',
    },
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
            <ApplicationLayout>
                <ApplicationMainContent />
                <ErrorDisplay/>
            </ApplicationLayout>
        </RAGProvider>
    )
}

export default App
