import ApplicationLayout from "./components/ApplicationLayout.tsx";
import ApplicationMainContent from "./components/ApplicationMainContent.tsx";
import {FC, useCallback, useMemo} from "react"
import {createSSEConnector, ErrorDisplay, Message, RAGProvider, Source, UserAction} from "lexio";
import {createTheme} from "lexio";

const customTheme = createTheme({
    colors: {
        primary: '#1E88E5',
        secondary: '#64B5F6'
    }
});

const App: FC = () => {
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

    const ragProviderConfig = {
        timeouts: {
            stream: 10000
        }
    };

    return (
        <RAGProvider
            onAction={onAction}
            config={ragProviderConfig}
            theme={customTheme}
        >
            <ApplicationLayout>
                <ApplicationMainContent />
                <ErrorDisplay />
            </ApplicationLayout>
        </RAGProvider>
    )
}

export default App
