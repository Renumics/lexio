import { useCallback } from 'react';
import {
    ChatWindow,
    RAGProvider,
    SourcesDisplay,
    ContentDisplay,
    AdvancedQueryField,
    ErrorDisplay,
    useSSESource,
    SourceReference,
    TextContent,
    SourceContent,
    PDFSourceContent
} from '../lib/main'
import './App.css';



function App() {
    const getDataSource = useCallback(async (source: SourceReference): Promise<SourceContent> => {
        if (source.type === "pdf") {
            console.log(source);
            // Use the ID from metadata to fetch the PDF
            const id = source.metadata?.id;
            if (!id) {
                throw new Error('No ID provided in source metadata');
            }

            const url = `http://localhost:8000/pdfs/${encodeURIComponent(id)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to get PDF. HTTP Status: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const pdfContent: PDFSourceContent = {
                type: 'pdf',
                content: new Uint8Array(arrayBuffer),
                metadata: source.metadata || {},
                highlights: source.highlights || []
            };
            return pdfContent;
        }

        throw new Error(`Unsupported source type: ${source.type}`);
    }, []);


    const parseEvent = useCallback((data: any) => {
        // If there's an array of sources, convert them to RetrievalResult format
        if (Array.isArray(data.sources)) {
            console.log(data.sources);
            const sources = data.sources.map((item: any) => {
                // Convert null/undefined score to undefined
                const relevanceScore = item.score != null ? item.score : undefined;
                // Extract filename from path
                const fileName = item.doc_path.split('/').pop();

                // If the file has a recognized extension, create a SourceReference
                if (item.doc_path.endsWith('.pdf') ||
                    item.doc_path.endsWith('.md') ||
                    item.doc_path.endsWith('.html')) {
                    return {
                        type: item.doc_path.endsWith('.pdf') ? 'pdf' :
                            item.doc_path.endsWith('.md') ? 'markdown' :
                                item.doc_path.endsWith('.html') ? 'html' : undefined,
                        sourceReference: item.doc_path,
                        sourceName: fileName,
                        relevanceScore,
                        highlights: item.highlights?.map((highlight: any) => ({
                            page: highlight.page,
                            rect: {
                                left: highlight.bbox.l,
                                top: highlight.bbox.t,
                                width: highlight.bbox.r - highlight.bbox.l,
                                height: highlight.bbox.t - highlight.bbox.b
                            }
                        })),
                        metadata: {
                            id: item.id
                        }
                    } as SourceReference;
                }
                // Otherwise, create a TextContent
                return {
                    text: item.text,
                    relevanceScore,
                    metadata: {
                        id: item.id
                    }
                } as TextContent;
            });

            return { sources, done: false };
        }

        // If there's a string 'content', treat it as a chunk
        if (typeof data.content === 'string') {
            return { content: data.content, done: !!data.done };
        }

        // Otherwise, ignore this SSE message
        return {};
    }, []);

    // Create the SSE-based retrieveAndGenerate function
    const retrieveAndGenerate = useSSESource({
        endpoint: 'http://localhost:8000/api/retrieve-and-generate',
        parseEvent,
    });

    return (
        <div className="app-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <RAGProvider
                retrieveAndGenerate={retrieveAndGenerate}
                getDataSource={getDataSource}
            >
                <div style={{
                    display: 'grid',
                    height: '100vh',
                    width: '100%',
                    gridTemplateColumns: '2fr 1fr',
                    gridTemplateRows: 'minmax(0, 1fr) 100px 300px',
                    gap: '20px',
                    gridTemplateAreas: `
            "chat sources"
            "input sources"
            "viewer viewer"
          `,
                    maxHeight: '100vh',
                    overflow: 'hidden'
                }}>
                    {/* Main chat UI */}
                    <div style={{
                        gridArea: 'chat',
                        overflow: 'auto',
                        minWidth: 0,  // Prevent content from forcing growth
                        maxWidth: '100%'  // Prevent expanding beyond container
                    }}>
                        <ChatWindow />
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

                    {/* Sources panel */}
                    <div style={{
                        gridArea: 'sources',
                        overflow: 'auto',
                        minWidth: 0,
                        maxWidth: '100%'
                    }}>
                        <SourcesDisplay />
                    </div>

                    {/* Content viewer */}
                    <div style={{
                        gridArea: 'viewer',
                        height: '300px',
                        overflow: "hidden",
                        width: '100%'
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
