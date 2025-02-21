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
} from '../lib/main'
import './App.css';




function App() {

    const connectorOptions = useMemo(() => ({
        endpoint: 'http://localhost:8000/api/retrieve-and-generate',
        defaultMode: 'both' as const,
        method: 'POST' as const,
        buildRequestBody: (messages: Message[], sources: Source[], metadata?: Record<string, any>) => ({
            query: messages[messages.length - 1].content,
            metadata
        }),
        parseEvent: (data: any) => {
            if (Array.isArray(data.sources)) {
                const sources = data.sources.map((item: any) => ({
                    type: item.doc_path.endsWith('.pdf') ? 'pdf' :
                        item.doc_path.endsWith('.html') ? 'html' : 'markdown',
                    sourceReference: item.doc_path,
                    sourceName: item.doc_path.split('/').pop(),
                    relevanceScore: item.score,
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
                }));
                return { sources, done: false };
            }
            return {
                content: data.content,
                done: !!data.done
            };
        }
    }), []);

    const sseConnector = createSSEConnector(connectorOptions);

    const onAction = useCallback((action: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: Source | null) => {
        if (action.type === 'ADD_USER_MESSAGE') {
            const newMessages = [...messages, { content: action.message, role: 'user', id: "dummyid" as string}];
            
            // Now we can use the new request object syntax
            return sseConnector({
                messages: newMessages,
                sources,
                mode: action.metadata?.mode, // Will fall back to defaultMode if not specified
                metadata: action.metadata
            });
        }
        return undefined;
    }, []);

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
