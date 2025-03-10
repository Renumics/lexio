import { useCallback, useMemo } from 'react';
import {
    ChatWindow,
    LexioProvider,
    SourcesDisplay,
    ContentDisplay,
    AdvancedQueryField,
    ErrorDisplay,
    UserAction,
    Message,
    Source,
    createRESTContentSource, 
    ActionHandlerResponse,
} from '../lib/main';
import { ExplanationProcessor } from '../lib/explanation';
import './App.css';

// This is a temporary mocked response for testing purposes
// In the future, this will be replaced with a real response from the RAG system
const MOCKED_RESPONSE = {
    answer: "Deep learning improves traffic data imputation by automatically learning patterns without manual feature selection. The Denoising Stacked Autoencoder (DSAE) approach treats missing and observed data as a whole, enabling robust recovery through layer-wise pre-training and fine-tuning. Compared to traditional methods like ARIMA and k-NN, it maintains higher accuracy and stable error rates across different missing data levels, as demonstrated on Caltrans PeMS traffic data."
};

// Add type for source data
type SourceData = Blob | Uint8Array | ArrayBuffer;

// Add type literals for action types
const SET_ACTIVE_SOURCES = 'SET_ACTIVE_SOURCES' as const;

function App() {
    const contentSourceOptions = useMemo(() => ({
        buildFetchRequest: (_source: Source) => ({
            // url: '/pdfs/deepseek.pdf',  
            url: '/pdfs/traffic.pdf', 
            options: {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'Cache-Control': 'no-cache'
                },
                responseType: 'blob',
                credentials: 'same-origin'
            }
        }),
    }), []);

    const contentSource = createRESTContentSource(contentSourceOptions);

    const defaultSource: Source = {
        id: '12345678-1234-1234-1234-123456789012',
        title: '... Paper',
        type: 'pdf',
        relevance: 1,
        metadata: {
            id: 'id.pdf'
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
                sources: Promise.resolve(activeSourcesList),
                activeSourceIds: action.sourceIds
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
                            activeSourceIds: [sourceToLoad.id],
                            actionOptions: {
                                followUp: {
                                    type: SET_ACTIVE_SOURCES,
                                    sourceIds: [sourceToLoad.id],
                                    source: 'LexioProvider' as const
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

            // For now, use the mocked response
            // Later this will be replaced with the actual RAG system response
            const ragResponse = MOCKED_RESPONSE.answer;

            // Get the source data if available
            const sourceToProcess = selectedSource || defaultSource;
            
            // Check if we have source data
            if (sourceToProcess && sourceToProcess.data) {
                console.log('Source data available, triggering actual explanation process...');
                
                // Send the RAG response to the ExplanationProcessor
                // This will remain the same when we switch to real RAG responses
                return ExplanationProcessor.processResponse(
                    ragResponse,
                    sourceToProcess.data as Uint8Array
                )
                .then(explanationResult => {
                    console.log('Explanation process completed successfully:', explanationResult);
                    
                    // Create PDF highlights from the idea sources
                    const pdfHighlights = explanationResult.ideaSources
                        .map(source => source.supporting_evidence[0]?.highlight)
                        .filter((highlight): highlight is NonNullable<typeof highlight> => !!highlight);
                    
                    const updatedSource = {
                        ...sourceToProcess,
                        highlights: pdfHighlights,
                        metadata: {
                            ...sourceToProcess.metadata,
                            coloredIdeas: explanationResult.answerIdeas.map(idea => ({
                                text: idea.text,
                                color: idea.color,
                                originalText: idea.text
                            }))
                        }
                    };

                    // Create the assistant message with the RAG response
                    const assistantMessage: Message = {
                        id: crypto.randomUUID(),
                        role: 'assistant',
                        content: explanationResult.answer,
                        metadata: {
                            coloredIdeas: explanationResult.answerIdeas.map(idea => ({
                                text: idea.text,
                                color: idea.color,
                                originalText: idea.text
                            }))
                        }
                    };

                    const messages = [userMessage, assistantMessage];
                    const messagesPromise = Promise.resolve(messages);

                    console.log('Returning action response with messages:', messages);
                    const response: ActionHandlerResponse = {
                        response: Promise.resolve(explanationResult.answer),
                        messages: messagesPromise,
                        sources: Promise.resolve([updatedSource]),
                        actionOptions: {
                            followUp: {
                                type: SET_ACTIVE_SOURCES,
                                sourceIds: [sourceToProcess.id],
                                source: 'LexioProvider' as const
                            }
                        }
                    };

                    return response;
                })
                .catch(error => {
                    console.error('Error in explanation process:', error);
                    
                    // Fall back to a simple response if there's an error
                    console.log('Falling back to simple response due to error');
                    
                    const assistantMessage: Message = {
                        id: crypto.randomUUID(),
                        role: 'assistant',
                        content: ragResponse
                    };

                    const messages = [userMessage, assistantMessage];
                    const messagesPromise = Promise.resolve(messages);

                    return {
                        response: Promise.resolve(ragResponse),
                        messages: messagesPromise,
                        sources: Promise.resolve([sourceToProcess]),
                        actionOptions: {
                            followUp: {
                                type: SET_ACTIVE_SOURCES,
                                sourceIds: [sourceToProcess.id],
                                source: 'LexioProvider' as const
                            }
                        }
                    };
                });
            } else {
                console.log('No source data available, using simple response');
                
                // If we don't have source data, just return the RAG response without explanations
                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: ragResponse
                };

                const messages = [userMessage, assistantMessage];
                const messagesPromise = Promise.resolve(messages);

                return {
                    response: Promise.resolve(ragResponse),
                    messages: messagesPromise,
                    sources: Promise.resolve([sourceToProcess]),
                    actionOptions: {
                        followUp: {
                            type: SET_ACTIVE_SOURCES,
                            sourceIds: [sourceToProcess.id],
                            source: 'LexioProvider' as const
                        }
                    }
                };
            }
        }

        return undefined;
    }, [contentSource]);

    return (
        <div className="app-container">
            <LexioProvider
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
            </LexioProvider>
        </div>
    );
}

export default App;