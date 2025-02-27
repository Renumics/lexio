import { useCallback, useMemo } from 'react';
import {
    ChatWindow,
    RAGProvider,
    SourcesDisplay,
    ContentDisplay,
    AdvancedQueryField,
    ErrorDisplay,
    UserAction,
    Message,
    Source,
    createRESTContentSource, 
    createSSEConnector,
    ActionHandlerResponse,
} from '../lib/main';
import { ExplanationProcessor } from '../lib/explanation';
import './App.css';

// Add this constant at the top of the file, after imports
const MOCKED_RESPONSE = "DeepSeek-R1 enhances reasoning by starting with a small set of high-quality chain-of-thought examples (cold-start data) and then using reinforcement learning to refine its outputs. This multi-stage approach not only improves accuracy but also produces clearer and more coherent reasoning, outperfrming traditional supervised fine-tuning methods.";

function App() {
    // Move connector creation outside of useMemo
    const sseConnector = createSSEConnector({
        endpoint: 'http://localhost:8000/api/retrieve-and-generate',
        defaultMode: 'both' as const,
        method: 'POST' as const,
        buildRequestBody: (messages: Omit<Message, "id">[], _sources: Source[], _metadata?: Record<string, any>) => ({
            query: messages[messages.length - 1].content
        }),
        parseEvent: (data: any) => {
            if (Array.isArray(data.sources)) {
                const sources = data.sources.map((item: any) => ({
                    title: item.doc_path.split('/').pop() || '',
                    type: item.doc_path.endsWith('.pdf') ? 'pdf'
                        : item.doc_path.endsWith('.html') ? 'html'
                            : item.doc_path.endsWith('.md') ? 'markdown'
                                : 'text',
                    relevance: item.score || 0,
                    metadata: {
                        page: item.page || undefined,
                        id: item.id || undefined,
                    },
                    content: item.text,
                    highlights: item.highlights
                        ? item.highlights.map((highlight: any) => ({
                            page: highlight.page,
                            rect: highlight.bbox
                                ? {
                                    top: highlight.bbox.t,
                                    left: highlight.bbox.l,
                                    width: highlight.bbox.r - highlight.bbox.l,
                                    height: highlight.bbox.b - highlight.bbox.t,
                                }
                                : undefined,
                        }))
                        : undefined,
                }));
                return { sources, done: false };
            }
            return {
                content: data.content,
                done: !!data.done,
            };
        },
    });

    // Move follow-up connector creation outside of useMemo
    const followUpConnector = createSSEConnector({
        endpoint: 'http://localhost:8000/api/generate',
        defaultMode: 'text' as const,
        method: 'POST' as const,
        buildRequestBody: (messages: Omit<Message, "id">[], sources: Source[], _metadata?: Record<string, any>) => ({
            messages: messages.map(m => ({
                role: m.role,
                content: m.content
            })),
            source_ids: sources.map(s => s.metadata?.id).filter(Boolean)
        }),
        parseEvent: (data: any) => ({
            content: data.content,
            done: !!data.done,
        }),
    });

    const contentSourceOptions = useMemo(() => ({
        buildFetchRequest: (source: Source) => {
            console.log('Building fetch request for source:', source);
            return {
                url: '/pdfs/deepseek.pdf',
                options: {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/pdf',
                        'Cache-Control': 'no-cache'
                    },
                    responseType: 'blob',
                    credentials: 'same-origin'
                }
            };
        },
    }), []);

    const contentSource = createRESTContentSource(contentSourceOptions);

    // Update the default source to match the new PDF
    const defaultSource: Source = {
        id: '12345678-1234-1234-1234-123456789012',
        title: 'DeepSeek Paper',
        type: 'pdf',
        relevance: 1,
        metadata: {
            id: 'deepseek.pdf'
        }
    };

    // 3) Action handler uses the SSE connector for "ADD_USER_MESSAGE"
    const onAction = useCallback((
        action: UserAction, 
        messages: Message[], 
        sources: Source[], 
        activeSources: Source[], 
        selectedSource: Source | null
    ): ActionHandlerResponse | Promise<ActionHandlerResponse> | undefined => {
        console.log('Action received:', action.type);
        console.log('Current sources:', sources);
        console.log('Active sources:', activeSources);
        console.log('Selected source:', selectedSource);

        if (action.type === 'SEARCH_SOURCES') {
            console.log('Handling search sources action');
            return {
                sources: Promise.resolve([defaultSource])
            };
        }

        if (action.type === 'SET_ACTIVE_SOURCES') {
            console.log('Setting active sources:', action.sourceIds);
            return {
                sources: Promise.resolve(action.sourceIds.map(id => 
                    sources.find(s => s.metadata?.id === id) || defaultSource
                ))
            };
        }

        if (action.type === 'ADD_USER_MESSAGE') {
            // First, immediately return the mocked response for display
            const responsePromise = Promise.resolve(MOCKED_RESPONSE);

            // Then process the explanation in the background
            responsePromise.then(async () => {
                try {
                    // Get or load the PDF data
                    const pdfSource = selectedSource || activeSources[0];
                    let sourceWithData = pdfSource;

                    if (!pdfSource?.data) {
                        sourceWithData = await contentSource(pdfSource || defaultSource);
                        console.log('Loaded source for processing:', sourceWithData);
                    }

                    if (!sourceWithData?.data) {
                        throw new Error('No PDF data available');
                    }

                    // Process the response to find matching parts in the PDF
                    const result = await ExplanationProcessor.processResponse(
                        MOCKED_RESPONSE,
                        sourceWithData.data as Uint8Array
                    );
                    console.log('Explanation processing result:', result);

                    // TODO: Use result.explanations to highlight matching parts in both
                    // the response text and the PDF source
                    // Each explanation has:
                    // - answer_idea: part of the response
                    // - supporting_evidence: matching parts in the PDF with location info

                } catch (error) {
                    console.error('Error in explanation processing:', error);
                }
            });

            return {
                response: responsePromise
            };
        } 
        
        if (action.type === 'SET_SELECTED_SOURCE') {
            const sourceToLoad = selectedSource || defaultSource;
            console.log('Attempting to load PDF source:', sourceToLoad);
            return contentSource(sourceToLoad)
                .then(async sourceWithData => {
                    console.log('Successfully loaded PDF data:', sourceWithData);
                    
                    try {
                        let finalData: Uint8Array;
                        const data = sourceWithData.data;
                        
                        // Type guard for Blob
                        if (data instanceof Blob) {
                            // First try to validate the PDF using a FileReader
                            const validateReader = new FileReader();
                            const validation = await new Promise((resolve, reject) => {
                                validateReader.onload = () => resolve(true);
                                validateReader.onerror = () => reject(new Error('Failed to read PDF file'));
                                validateReader.readAsArrayBuffer(data);
                            });

                            if (!validation) {
                                throw new Error('PDF validation failed');
                            }

                            const arrayBuffer = await data.arrayBuffer();
                            finalData = new Uint8Array(arrayBuffer);
                        } else if (data instanceof Uint8Array) {
                            finalData = data;
                        } else if (data instanceof ArrayBuffer) {
                            finalData = new Uint8Array(data);
                        } else {
                            throw new Error(`Unsupported data type: ${typeof data}`);
                        }

                        // Basic PDF validation
                        if (finalData.length < 32) {
                            throw new Error('Invalid PDF: File too small');
                        }

                        // Check PDF header (%PDF-)
                        const pdfHeader = [37, 80, 68, 70, 45];
                        const isValidPDF = pdfHeader.every((byte, i) => finalData[i] === byte);
                        
                        if (!isValidPDF) {
                            throw new Error('Invalid PDF format: Missing PDF header');
                        }

                        // Try to repair common PDF issues
                        const repairedData = await repairPDF(finalData);

                        // Return the correct type for ActionHandlerResponse
                        return {
                            sourceData: repairedData
                        } as ActionHandlerResponse;
                    } catch (error) {
                        console.error('Error processing PDF data:', error);
                        return {
                            error: {
                                message: 'Failed to load PDF: ' + (error instanceof Error ? error.message : 'Unknown error')
                            }
                        } as ActionHandlerResponse;
                    }
                })
                .catch(error => {
                    console.error('Error loading PDF:', error);
                    return {
                        error: {
                            message: 'Failed to load PDF: ' + (error instanceof Error ? error.message : 'Unknown error')
                        }
                    } as ActionHandlerResponse;
                });
        }
        
        return undefined;
    }, [sseConnector, followUpConnector, contentSource]);

    // Helper function to attempt PDF repair
    async function repairPDF(data: Uint8Array): Promise<Uint8Array> {
        // Create a copy of the data to avoid modifying the original
        const repairedData = new Uint8Array(data);
        
        try {
            // Find the start of the xref table
            const decoder = new TextDecoder();
            const text = decoder.decode(data);
            const xrefIndex = text.lastIndexOf('xref');
            
            if (xrefIndex === -1) {
                console.log('No xref table found, attempting to rebuild PDF structure');
                return repairedData;
            }

            // Check for common stream compression issues
            const streamStart = text.indexOf('stream');
            if (streamStart !== -1) {
                // Look for invalid FCHECK values and try to correct them
                for (let i = streamStart; i < data.length - 2; i++) {
                    if (data[i] === 0x78) { // zlib header
                        // Fix common FCHECK values
                        if (data[i + 1] === 0xEF) { // Bad FCHECK value
                            repairedData[i + 1] = 0x9C; // Standard zlib compression
                        }
                    }
                }
            }

            return repairedData;
        } catch (error) {
            console.warn('PDF repair attempt failed:', error);
            return data; // Return original data if repair fails
        }
    }

    // 4) Provide the SSE connector and the REST content source to the RAGProvider
    console.log('OpenAI Key exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
    return (
        <div className="app-container">
            <RAGProvider
                onAction={onAction}
                config={{
                    timeouts: {
                        stream: 10000
                    }
                }}
            // This is the key: your RAGProvider can now fetch Source data (like PDFs) via REST
            >
                <div
                    style={{
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
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Main chat UI */}
                    <div
                        style={{
                            gridArea: 'chat',
                            overflow: 'auto',
                            minWidth: 0,
                            maxWidth: '100%',
                        }}
                    >
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
                    <div
                        style={{
                            gridArea: 'input',
                            height: '100px',
                            minWidth: 0,
                            maxWidth: '100%',
                        }}
                    >
                        <AdvancedQueryField />
                    </div>

                    {/* Content viewer */}
                    <div
                        style={{
                            gridArea: 'viewer',
                            overflow: 'hidden',
                            width: '100%',
                            height: '100%',
                        }}
                    >
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
