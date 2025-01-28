import { useCallback, useMemo } from 'react';
import {
    ChatWindow,
    RAGProvider,
    SourcesDisplay,
    ContentDisplay,
    AdvancedQueryField,
    ErrorDisplay,
    useSSERetrieveAndGenerateSource,
    useSSEGenerateSource,
    SourceReference,
    SourceContent,
    PDFSourceContent,
    HTMLSourceContent,
    MarkdownSourceContent,
    Message,
    RetrievalResult
} from '../lib/main'
import './App.css';
import { SSEParsedEvent } from '../lib/connectors/useSSERetrieveAndGenerateSource';



function App() {
    const getDataSource = useCallback(async (source: SourceReference): Promise<SourceContent> => {
        // Use the ID from metadata to fetch the content
        const id = source.metadata?.id;
        if (!id) {
            throw new Error('No ID provided in source metadata');
        }

        const url = `http://localhost:8000/pdfs/${encodeURIComponent(id)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to get content. HTTP Status: ${response.status} ${response.statusText}`);
        }

        // Handle different content types
        if (source.type === "pdf") {
            const arrayBuffer = await response.arrayBuffer();
            const pdfContent: PDFSourceContent = {
                type: 'pdf',
                content: new Uint8Array(arrayBuffer),
                metadata: source.metadata || {},
                highlights: source.highlights || []
            };
            return pdfContent;
        } else if (source.type === "html") {
            const text = await response.text();
            const content: HTMLSourceContent = {
                type: 'html',
                content: text,
                metadata: source.metadata || {}
            };
            return content;
        } else if (source.type === "markdown") {
            const text = await response.text();
            // Replace any existing backtick sequences with escaped versions
            const escapedText = text.replace(/`/g, '\\`');
            const content: MarkdownSourceContent = {
                type: 'markdown',
                content: `\`\`\`markdown\n${escapedText}\n\`\`\``,
                metadata: source.metadata || {}
            };
            return content;
        }

        throw new Error(`Unsupported source type: ${source.type}`);
    }, []);

    // Memoize the options for retrieve and generate
    const retrieveAndGenerateOptions = useMemo(() => ({
        endpoint: 'http://localhost:8000/api/retrieve-and-generate',
        method: 'POST' as const,
        buildRequestBody: (messages: Message[], metadata?: Record<string, any>) => ({
            query: messages[messages.length - 1].content,
            metadata: metadata
        }),
        parseEvent: (data: any): SSEParsedEvent => {
            if (Array.isArray(data.sources)) {
                const sources = data.sources.map((item: any) => {
                    const relevanceScore = item.score != null ? item.score : undefined;
                    const fileName = item.doc_path.split('/').pop();

                    return {
                        type: item.doc_path.endsWith('.pdf') ? 'pdf' :
                            item.doc_path.endsWith('.html') ? 'html' : 'markdown',
                        sourceReference: item.doc_path,
                        sourceName: fileName,
                        relevanceScore,
                        highlights: item.highlights?.map((highlight: any) => ({
                            page: highlight.page,
                            rect: {
                                left: highlight.bbox.l,
                                top: highlight.bbox.t,
                                width: highlight.bbox.r - highlight.bbox.l,
                                height: highlight.bbox.b - highlight.bbox.t
                            }
                        })),
                        metadata: {
                            id: item.id,
                            page: item.page
                        }
                    } as SourceReference;
                });
                return { sources, done: false };
            }
            if (typeof data.content === 'string') {
                return { content: data.content, done: !!data.done };
            }
            return {};
        }
    }), []);

    const generateOptions = useMemo(() => ({
        endpoint: 'http://localhost:8000/api/generate',
        method: 'POST' as const,
        buildRequestBody: (messages: Message[], sources?: RetrievalResult[]) => ({
            messages,
            source_ids: sources?.map(source => 
                'sourceReference' in source ? source.sourceReference : null
            ).filter(Boolean)
        }),
        parseEvent: (data: any): SSEParsedEvent => ({
            content: data.content,
            done: !!data.done
        })
    }), []);

    // Create the SSE-based functions using the memoized options
    const retrieveAndGenerate = useSSERetrieveAndGenerateSource(retrieveAndGenerateOptions);
    const generate = useSSEGenerateSource(generateOptions);

    return (
        <div className="app-container">
            <RAGProvider
                retrieveAndGenerate={retrieveAndGenerate}
                generate={generate}
                getDataSource={getDataSource}
                config={{
                    timeouts: {
                        stream: 10000
                    }
                }}
            >
                <div style={{
                    display: 'grid',
                    height: '100vh',
                    width: '100%',
                    gridTemplateColumns: '1fr 2fr',
                    gridTemplateRows: '1fr 100px',
                    gap: '20px',
                    gridTemplateAreas: `
            "chat viewer"
            "input viewer"
          `,
                    maxHeight: '100vh',
                    overflow: 'hidden',
                    padding: '20px',
                    boxSizing: 'border-box'
                }}>
                    {/* Main chat UI */}
                    <div style={{
                        gridArea: 'chat',
                        overflow: 'auto',
                        minWidth: 0,
                        maxWidth: '100%'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ flex: '1', overflow: 'auto', height: '50%' }}>
                                <SourcesDisplay />
                            </div>
                            <div style={{ flex: '1', overflow: 'auto', height: '50%' }}>
                                <ChatWindow />
                            </div>
                        </div>
                    </div>

                    {/* Advanced query input */}
                    <div style={{
                        gridArea: 'input',
                        height: '100px',
                        minWidth: 0,
                        maxWidth: '100%'
                    }}>
                        <AdvancedQueryField />
                    </div>

                    {/* Content viewer */}
                    <div style={{
                        gridArea: 'viewer',
                        overflow: "hidden",
                        width: '100%',
                        height: '100%'
                    }}>
                        <ContentDisplay />
                    </div>
                </div>
                {/* Handle any encountered errors */}
                <ErrorDisplay />
            </RAGProvider>
        </div>
    );
}

export default App;
