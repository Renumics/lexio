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
    PDFHighlight,
} from '../lib/main';
import { ExplanationProcessor } from '../lib/explanation';
import './App.css';

// Update the MOCKED_RESPONSE constant to include structured data
const MOCKED_RESPONSE = {
    summary: "DeepSeek-R1 enhances reasoning through multi-stage learning",
    final_answer: "DeepSeek-R1 enhances reasoning by starting with a small set of high-quality chain-of-thought examples (cold-start data) and then using reinforcement learning to refine its outputs. This multi-stage approach not only improves accuracy but also produces clearer and more coherent reasoning, outperfrming traditional supervised fine-tuning methods.",
    answer_ideas: [
        "Uses high-quality chain-of-thought examples",
        "Employs reinforcement learning for refinement",
        "Implements a multi-stage approach",
        "Improves accuracy and coherence"
    ],
    explanations: [
        {
            idea: "Uses high-quality chain-of-thought examples",
            supporting_evidence: [{
                source_text: "starting with a small set of high-quality chain-of-thought examples (cold-start data)",
                location: { page: 1 }
            }]
        },
        {
            idea: "Employs reinforcement learning for refinement",
            supporting_evidence: [{
                source_text: "using reinforcement learning to refine its outputs",
                location: { page: 1 }
            }]
        },
        {
            idea: "Implements a multi-stage approach",
            supporting_evidence: [{
                source_text: "This multi-stage approach",
                location: { page: 1 }
            }]
        },
        {
            idea: "Improves accuracy and coherence",
            supporting_evidence: [{
                source_text: "improves accuracy but also produces clearer and more coherent reasoning",
                location: { page: 1 }
            }]
        }
    ]
};

// Add type for source data
type SourceData = Blob | Uint8Array | ArrayBuffer;

// Add type literals for action types
const SET_ACTIVE_SOURCES = 'SET_ACTIVE_SOURCES' as const;

function App() {
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

    const defaultSource: Source = {
        id: '12345678-1234-1234-1234-123456789012',
        title: 'DeepSeek Paper',
        type: 'pdf',
        relevance: 1,
        metadata: {
            id: 'deepseek.pdf'
        }
    };

    const onAction = useCallback((
        action: UserAction, 
        _messages: Message[], // Add underscore to indicate intentionally unused
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
            const activeSourcesList = action.sourceIds.map(id => 
                sources.find(s => s.id === id) || 
                sources.find(s => s.metadata?.id === id) || 
                defaultSource
            );
            return {
                sources: Promise.resolve(activeSourcesList)
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
                        const data = sourceWithData.data as SourceData;
                        
                        if (data instanceof Blob) {
                            const arrayBuffer = await data.arrayBuffer();
                            finalData = new Uint8Array(arrayBuffer);
                        } else if (data instanceof Uint8Array) {
                            finalData = data;
                        } else if (data instanceof ArrayBuffer) {
                            finalData = new Uint8Array(data);
                        } else {
                            throw new Error(`Unsupported data type: ${typeof data}`);
                        }

                        return {
                            sourceData: finalData,
                            actionOptions: {
                                followUp: {
                                    type: SET_ACTIVE_SOURCES,
                                    sourceIds: [sourceToLoad.id],
                                    source: 'RAGProvider' as const
                                }
                            }
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
        
        if (action.type === 'ADD_USER_MESSAGE') {
            console.log('ADD_USER_MESSAGE action started');

            // Create messages
            const userMessage: Message = {
                id: crypto.randomUUID(),
                role: 'user',
                content: action.message
            };

            // Just use the plain text response
            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: MOCKED_RESPONSE.final_answer
            };

            const messages = [userMessage, assistantMessage];
            console.log('Messages array created with length:', messages.length);

            // Directly resolve the array
            const messagesPromise = Promise.resolve(messages);

            // Create the source updates with highlights
            const COLORS = [
                'rgba(255, 99, 132, 0.3)',   // red
                'rgba(54, 162, 235, 0.3)',   // blue
                'rgba(255, 206, 86, 0.3)',   // yellow
                'rgba(75, 192, 192, 0.3)',   // green
                'rgba(153, 102, 255, 0.3)',  // purple
                'rgba(255, 159, 64, 0.3)',   // orange
            ];

            // Get the source data if available
            const sourceToProcess = selectedSource || defaultSource;
            
            // Check if we have source data
            if (sourceToProcess && sourceToProcess.data) {
                console.log('Source data available, triggering actual explanation process...');
                
                // Actually call the ExplanationProcessor
                return ExplanationProcessor.processResponse(
                    MOCKED_RESPONSE.final_answer,
                    sourceToProcess.data as Uint8Array
                )
                .then(explanationResult => {
                    console.log('Explanation process completed successfully:', explanationResult);
                    
                    // Map the explanation results to highlights
                    const coloredIdeas = explanationResult.explanations.map((explanation, index) => {
                        // Get the first piece of supporting evidence
                        const evidence = explanation.supporting_evidence[0];
                        
                        return {
                            text: explanation.answer_idea,
                            color: COLORS[index % COLORS.length],
                            evidence: {
                                text: evidence.source_text,
                                location: evidence.location,
                                // Use the highlight from the evidence if available, or create a default one
                                highlight: evidence.location.rect ? {
                                    page: evidence.location.page,
                                    rect: evidence.location.rect,
                                    color: COLORS[index % COLORS.length]
                                } : {
                                    page: evidence.location.page,
                                    rect: {
                                        left: 0.1,
                                        top: 0.1 + (index * 0.1),
                                        width: 0.8,
                                        height: 0.05
                                    },
                                    color: COLORS[index % COLORS.length]
                                }
                            }
                        };
                    });

                    // Create PDF highlights from the evidence
                    const pdfHighlights = coloredIdeas.map(idea => idea.evidence.highlight);

                    const updatedSource = {
                        ...sourceToProcess,
                        highlights: pdfHighlights,
                        metadata: {
                            ...sourceToProcess.metadata,
                            coloredAnswerIdeas: coloredIdeas
                        }
                    };

                    console.log('Returning action response with processed explanations');
                    const response: ActionHandlerResponse = {
                        response: Promise.resolve(explanationResult.finalAnswer),
                        messages: messagesPromise,
                        sources: Promise.resolve([updatedSource]),
                        actionOptions: {
                            followUp: {
                                type: SET_ACTIVE_SOURCES,
                                sourceIds: [sourceToProcess.id],
                                source: 'RAGProvider' as const
                            }
                        }
                    };

                    return response;
                })
                .catch(error => {
                    console.error('Error in explanation process:', error);
                    
                    // Fall back to mocked response if there's an error
                    console.log('Falling back to mocked response due to error');
                    
                    // Map our mocked explanations to the format needed for highlighting
                    const coloredIdeas = MOCKED_RESPONSE.explanations.map((explanation, index) => {
                        // Get the first piece of supporting evidence
                        const evidence = explanation.supporting_evidence[0];
                        
                        return {
                            text: explanation.idea,
                            color: COLORS[index % COLORS.length],
                            evidence: {
                                text: evidence.source_text,
                                location: evidence.location,
                                // Add a highlight for this evidence in the PDF
                                highlight: {
                                    page: evidence.location.page || 1,
                                    rect: {
                                        left: 0.1,
                                        top: 0.1 + (index * 0.1),
                                        width: 0.8,
                                        height: 0.05
                                    },
                                    color: COLORS[index % COLORS.length]
                                }
                            }
                        };
                    });

                    // Create PDF highlights from the evidence
                    const pdfHighlights = coloredIdeas.map(idea => idea.evidence.highlight);

                    const updatedSource = {
                        ...sourceToProcess,
                        highlights: pdfHighlights,
                        metadata: {
                            ...sourceToProcess.metadata,
                            coloredAnswerIdeas: coloredIdeas
                        }
                    };

                    return {
                        response: Promise.resolve(MOCKED_RESPONSE.final_answer),
                        messages: messagesPromise,
                        sources: Promise.resolve([updatedSource]),
                        actionOptions: {
                            followUp: {
                                type: SET_ACTIVE_SOURCES,
                                sourceIds: [sourceToProcess.id],
                                source: 'RAGProvider' as const
                            }
                        }
                    };
                });
            } else {
                console.log('No source data available, using mocked response');
                
                // If we don't have source data, use the mocked response
                // Map our mocked explanations to the format needed for highlighting
                const coloredIdeas = MOCKED_RESPONSE.explanations.map((explanation, index) => {
                    // Get the first piece of supporting evidence
                    const evidence = explanation.supporting_evidence[0];
                    
                    return {
                        text: explanation.idea,
                        color: COLORS[index % COLORS.length],
                        evidence: {
                            text: evidence.source_text,
                            location: evidence.location,
                            // Add a highlight for this evidence in the PDF
                            highlight: {
                                page: evidence.location.page || 1,
                                rect: {
                                    left: 0.1,
                                    top: 0.1 + (index * 0.1),
                                    width: 0.8,
                                    height: 0.05
                                },
                                color: COLORS[index % COLORS.length]
                            }
                        }
                    };
                });

                // Create PDF highlights from the evidence
                const pdfHighlights = coloredIdeas.map(idea => idea.evidence.highlight);

                const updatedSource = {
                    ...sourceToProcess,
                    highlights: pdfHighlights,
                    metadata: {
                        ...sourceToProcess.metadata,
                        coloredAnswerIdeas: coloredIdeas
                    }
                };

                return {
                    response: Promise.resolve(MOCKED_RESPONSE.final_answer),
                    messages: messagesPromise,
                    sources: Promise.resolve([updatedSource]),
                    actionOptions: {
                        followUp: {
                            type: SET_ACTIVE_SOURCES,
                            sourceIds: [sourceToProcess.id],
                            source: 'RAGProvider' as const
                        }
                    }
                };
            }
        }

        return undefined;
    }, [contentSource]);

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
                <ErrorDisplay />
            </RAGProvider>
        </div>
    );
}

export default App;