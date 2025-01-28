import { useCallback } from 'react';
import {
    ChatWindow,
    RAGProvider,
    SourcesDisplay,
    ContentDisplay,
    AdvancedQueryField,
    ErrorDisplay,
    SourceReference,
    SourceContent,
    PDFSourceContent,
    HTMLSourceContent,
    MarkdownSourceContent
} from 'lexio'
import './App.css';



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


    const parseEvent = useCallback((data: any) => {
        // If there's an array of sources, convert them to RetrievalResult format
        if (Array.isArray(data.sources)) {
            console.log(data.sources);
            const sources = data.sources.map((item: any) => {
                // Convert null/undefined score to undefined
                const relevanceScore = item.score != null ? item.score : undefined;
                // Extract filename from path
                const fileName = item.doc_path.split('/').pop();

                // Always create a SourceReference with a fallback type of 'markdown'
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
        <div className="app-container">
            <RAGProvider
                retrieveAndGenerate={retrieveAndGenerate}
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
