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
    MessageWithOptionalId
} from '../lib/main';
import './App.css';

function App() {

    const chatConnectorOptions = useMemo(() => ({
        endpoint: 'http://localhost:8000/api/chat',
        defaultMode: 'both' as const,
        method: 'POST' as const,
        buildRequestBody: (messages: MessageWithOptionalId[], sources: Source[], metadata?: Record<string, any>) => {
            const requestBody = {
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content
                })),
                source_ids: metadata?.useExistingSources 
                    ? sources.map(s => s.metadata?.id).filter(Boolean)
                    : undefined
            };
            
            console.log('Request body being sent to backend:', requestBody);
            return requestBody;
        },
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
    }), []);
    // Combine both connectors into a single unified connector
    const chatConnector = createSSEConnector(chatConnectorOptions);

    const contentSourceOptions = useMemo(() => ({
        buildFetchRequest: (source: Source) => {
            const id = source.metadata?.id;
            if (!id) {
                throw new Error('No ID in source metadata');
            }
            return {
                url: `http://localhost:8000/pdfs/${encodeURIComponent(id)}`
            };
        },
    }), []);

    const contentSource = createRESTContentSource(contentSourceOptions);

    // 3) Action handler uses the SSE connector for "ADD_USER_MESSAGE"
    const onAction = useCallback((action: UserAction, messages: Message[], _sources: Source[], activeSources: Source[], _selectedSource: Source | null) => {
        if (action.type === 'ADD_USER_MESSAGE') {
            const newMessages = [...messages, { content: action.message, role: 'user' as const }];
            
            console.log('activeSources', activeSources);
            
            const useExistingSources = activeSources.length > 0;
            
            console.log('Chat action metadata:', {
                useExistingSources,
                activeSourceCount: activeSources.length
            });
            
            // When using existing sources, set mode to 'text' to prevent sources update
            // When not using existing sources, use 'both' to get new sources
            const { response, sources: newSources } = chatConnector({
                messages: newMessages,
                sources: activeSources,
                mode: useExistingSources ? 'text' : 'both',
                metadata: {
                    useExistingSources
                }
            });
            
            // Only return new sources if we're not using existing ones
            return { 
                response, 
                sources: useExistingSources ? undefined : newSources 
            };
        } else if (action.type === 'SET_SELECTED_SOURCE') {
            if (!action.sourceObject?.metadata?.id) {
                return undefined;
            }

            // Return a SetSelectedSourceActionResponse object
            return {
                // The sourceData should be a Promise<string | Uint8Array>
                sourceData: contentSource(action.sourceObject).then(sourceWithData => sourceWithData.data)
            };
        }
        return undefined;
    }, [chatConnector, contentSource]);

    // 4) Provide the SSE connector and the REST content source to the RAGProvider
    return (
        <div className="app-container">
            <RAGProvider
                onAction={onAction}
                config={{
                    timeouts: {
                        stream: 10000,
                    },
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
