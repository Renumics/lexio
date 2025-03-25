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
    StreamChunk,
    MessageHighlight,
    PDFHighlight,
} from '../lib/main';
import { ExplanationProcessor } from '../lib/explanation';
import { generateHighlightColors } from '../lib/utils/highlightColors';
import { CitationGenerator } from '../lib/utils/citationGenerator';
import { retrievedSourcesAtom } from '../lib/state/rag-state';
import { useSetAtom } from 'jotai';
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
    const setRetrievedSources = useSetAtom(retrievedSourcesAtom);
    
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

    const onAction = useCallback(async (
        action: UserAction, 
        _messages: Message[],
        sources: Source[], 
        activeSources: Source[] | null, 
        selectedSource: Source | null
    ): Promise<ActionHandlerResponse> => {
        console.log('Action received:', action.type);
        console.log('Current sources:', sources);
        console.log('Active sources:', activeSources);
        console.log('Selected source:', selectedSource);

        if (action.type === 'SEARCH_SOURCES') {
            return {
                sources: Promise.resolve([defaultSource])
            };
        }

        if (action.type === 'SET_ACTIVE_SOURCES') {
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
            const sourceToLoad = action.sourceObject || selectedSource || defaultSource;
            
            console.log("Source to load:", sourceToLoad);
            console.log("Action source object:", action.sourceObject);
            
            // If we already have data for this source, just update the metadata
            if (sourceToLoad.data) {
                console.log("Source already has data, returning with metadata update");
                
                // Create updated source with new metadata
                const updatedSource = {
                    ...sourceToLoad,
                    metadata: {
                        ...(sourceToLoad.metadata || {}),
                        ...(action.sourceObject?.metadata || {})
                    }
                };
                
                // Update the source in state first
                const currentSources = sources.map(source => 
                    source.id === sourceToLoad.id ? updatedSource : source
                );
                setRetrievedSources(currentSources);
                
                // Return just the data - metadata is already updated in state
                return {
                    sourceData: Promise.resolve(updatedSource.data as Uint8Array),
                    followUpAction: {
                        type: SET_ACTIVE_SOURCES,
                        sourceIds: [sourceToLoad.id],
                        source: 'LexioProvider' as const
                    }
                };
            }
            
            // Otherwise, load the source data
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

                        // Create source with merged metadata
                        const updatedSource = {
                            ...sourceToLoad,
                            metadata: {
                                ...(sourceToLoad.metadata || {}),
                                ...(action.sourceObject?.metadata || {})
                            }
                        };

                        // Update source in state
                        const currentSources = sources.map(source => 
                            source.id === sourceToLoad.id ? updatedSource : source
                        );
                        setRetrievedSources(currentSources);

                        return {
                            sourceData: finalData,
                            activeSourceIds: [sourceToLoad.id],
                            followUpAction: {
                                type: SET_ACTIVE_SOURCES,
                                sourceIds: [sourceToLoad.id],
                                source: 'LexioProvider' as const
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

            // For now, use the mocked response
            const ragResponse = MOCKED_RESPONSE.answer;

            // Get the source data if available
            const sourceToProcess = selectedSource || defaultSource;
            
            // Check if we have source data
            if (sourceToProcess && sourceToProcess.data) {
                console.log('Source data available, triggering actual explanation process...');
                
                try {
                    // Process explanation and keep result for logging
                    const explanationResult = await ExplanationProcessor.processResponse(
                        ragResponse,
                        sourceToProcess.data as Uint8Array
                    );
                    console.log('Explanation result:', {
                        summary: explanationResult.summary,
                        answerIdeasCount: explanationResult.answerIdeas.length,
                        ideaSourcesCount: explanationResult.ideaSources.length,
                        // Add any other relevant metrics you want to log
                    });

                    // Generate colors once for all highlights
                    const colors = generateHighlightColors(explanationResult.ideaSources.length);

                    // Apply colors to sources
                    const ideaSources = explanationResult.ideaSources.map((source, index) => ({
                        ...source,
                        color: colors[index]
                    }));

                    // 1. Process highlights for message highlighting
                    const messageHighlights: MessageHighlight[] = ideaSources.map(source => ({
                        color: source.color,
                        startChar: explanationResult.answer.indexOf(source.answer_idea),
                        endChar: explanationResult.answer.indexOf(source.answer_idea) + source.answer_idea.length
                    }));

                    // 2. Process highlights for the PDF viewer
                    const pdfHighlights: PDFHighlight[] = ideaSources
                        .map(source => {
                            const evidence = source.supporting_evidence[0];
                            if (!evidence?.highlight) return null;

                            return {
                                page: evidence.highlight.page,
                                rect: evidence.highlight.rect,
                                highlightColorRgba: source.color,
                            };
                        })
                        .filter((h): h is NonNullable<typeof h> => h !== null);

                    // 3. Create citations using the CitationGenerator
                    const citations = CitationGenerator.createLexioCitations(
                        messageHighlights,
                        sourceToProcess,
                        pdfHighlights
                    );

                    // Update source with highlights for PDF viewer
                    const updatedSource: Source = {
                        ...sourceToProcess,
                        highlights: pdfHighlights  // These will be shown in the PDF
                    };

                    return {
                        response: Promise.resolve({
                            content: explanationResult.answer,
                            messageHighlights,
                            citations,
                            done: true
                        } as StreamChunk),
                        sources: Promise.resolve([updatedSource]),
                        followUpAction: {
                            type: SET_ACTIVE_SOURCES,
                            sourceIds: [sourceToProcess.id],
                            source: 'LexioProvider' as const
                        }
                    };
                } catch (error) {
                    console.error('Error in explanation processing:', error);
                    // Handle error appropriately
                    return {
                        response: Promise.resolve({
                            content: '',
                            highlights: [],
                            done: true
                        } as StreamChunk)
                    };
                }
            } else {
                console.log('No source data available, using simple response');
                
                const response: ActionHandlerResponse = {
                    response: Promise.resolve({
                        content: ragResponse,
                        highlights: [],
                        done: true
                    } as StreamChunk),
                    sources: Promise.resolve([sourceToProcess]),
                    followUpAction: {
                        type: SET_ACTIVE_SOURCES,
                        sourceIds: [sourceToProcess.id],
                        source: 'LexioProvider' as const
                    }
                };

                return response;
            }
        }

        return {
            response: Promise.resolve({
                content: '',
                highlights: [],
                done: true
            } as StreamChunk)
        };
    }, [contentSource, setRetrievedSources]);

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