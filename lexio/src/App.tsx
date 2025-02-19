import './App.css'
import {
    ChatWindow,
    RAGProvider,
    createTheme,
    SourcesDisplay, ContentDisplay, AdvancedQueryField,
    ErrorDisplay,
} from '../lib/main'
import {UserAction, Message, Source, ActionHandlerResponse} from '../lib/state/rag-state-v2'
import React from 'react'

const customTheme = createTheme({
    colors: {
        primary: '#1E88E5',
        secondary: '#64B5F6'
    }
});

export const myOnActionFn = (action: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: Source | null) => {
    console.log("myOnActionFn", action, messages, sources, activeSources, selectedSource)

    // Mock sources data
    const mockSources = [
        {
            title: "Source 1",
            type: "text",
            data: 'Hello from myOnActionFn',
        } as Source,
        {
            title: "Source 2",
            type: "text",
            data: 'Hello from myOnActionFn 2',
        } as Source,
        {
            title: "Source 3",
            type: "text",
            data: 'Hello from myOnActionFn 3',
        } as Source,
    ];

    if (action.type === 'ADD_USER_MESSAGE') {
        if (messages.length <= 1) {  // First interaction (0 or 1 message)
            // First message - quick streaming response
            return {
                response: (async function* () {
                    yield { content: "Let me think about that... " };
                    await new Promise(resolve => setTimeout(resolve, 500));
                    yield { content: "Based on the available information, " };
                    await new Promise(resolve => setTimeout(resolve, 500));
                    yield { content: "I can tell you that this is the first message response!", done: true };
                })(),
                sources: Promise.resolve(mockSources),
            }
        } else if (messages.length <= 3) {  // Second interaction (2 or 3 messages)
            // Second message - slower streaming response
            return {
                response: (async function* () {
                    yield { content: "Processing your second question... " };
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    yield { content: "After careful consideration, " };
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    yield { content: "I can provide you with a detailed answer!", done: true };
                })(),
                sources: Promise.resolve(mockSources),
            }
        } else {  // Third interaction and beyond (4+ messages)
            // Third message and beyond - normal streaming but delayed sources
            return {
                response: (async function* () {
                    yield { content: "Working on your question... " };
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    yield { content: "While I gather the relevant sources, " };
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    yield { content: "here's what I can tell you about your query!", done: true };
                })(),
                sources: new Promise(resolve => 
                    setTimeout(() => resolve(mockSources), 6000) // Sources take > 5 seconds
                ),
            }
        }
    }

    // Handle search sources action
    if (action.type === 'SEARCH_SOURCES') {
        return {
            sources: Promise.resolve(mockSources),
        } as ActionHandlerResponse
    }
}

function App() {
    const [interactionCount, setInteractionCount] = React.useState(0);

    const handleAction = React.useCallback((action: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: Source | null) => {
        if (action.type === 'ADD_USER_MESSAGE') {
            setInteractionCount(prev => prev + 1);
        }
        
        // Mock sources data
        const mockSources = [
            {
                title: "Source 1",
                type: "text",
                data: 'Hello from myOnActionFn',
            } as Source,
            {
                title: "Source 2",
                type: "text",
                data: 'Hello from myOnActionFn 2',
            } as Source,
            {
                title: "Source 3",
                type: "text",
                data: 'Hello from myOnActionFn 3',
            } as Source,
        ];

        if (action.type === 'ADD_USER_MESSAGE') {
            if (interactionCount === 0) {  // First interaction
                return {
                    response: (async function* () {
                        yield { content: "Let me think about that... " };
                        await new Promise(resolve => setTimeout(resolve, 500));
                        yield { content: "Based on the available information, " };
                        await new Promise(resolve => setTimeout(resolve, 500));
                        yield { content: "I can tell you that this is the first message response!", done: true };
                    })(),
                    sources: Promise.resolve(mockSources),
                }
            } else if (interactionCount === 1) {  // Second interaction
                return {
                    response: (async function* () {
                        yield { content: "Processing your second question... " };
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        yield { content: "After careful consideration, " };
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        yield { content: "I can provide you with a detailed answer!", done: true };
                    })(),
                    sources: Promise.resolve(mockSources),
                }
            } else {  // Third interaction and beyond
                return {
                    response: (async function* () {
                        yield { content: "Working on your question... " };
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        yield { content: "While I gather the relevant sources, " };
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        yield { content: "here's what I can tell you about your query!", done: true };
                    })(),
                    sources: new Promise(resolve => 
                        setTimeout(() => resolve(mockSources), 6000)
                    ),
                }
            }
        }

        // Handle search sources action
        if (action.type === 'SEARCH_SOURCES') {
            return {
                sources: Promise.resolve(mockSources),
            } as ActionHandlerResponse
        }
    }, [interactionCount]);

    return (
        <div style={{width: '100%', height: '100vh'}}>
            {/* Main Content */}
            <div className="w-full h-full max-w-7xl mx-auto flex flex-row gap-4 p-5">
                <RAGProvider
                    onAction={handleAction}
                    theme={customTheme}
                >
                    {/* Left side: Chat and Query */}
                    <div className="flex flex-col h-full w-1/3">
                        <div className="flex-none"> {/* Changed from shrink-0 */}
                            <AdvancedQueryField />
                        </div>
                        <div className="flex-1 min-h-0"> {/* Added min-h-0 and flex-1 */}
                            <ChatWindow />
                        </div>
                    </div>

                    <div className="h-full w-1/3"> {/* Query field */}
                       <SourcesDisplay />
                    </div>
                    <div className={"h-full w-1/3"}>
                        <ContentDisplay />
                    </div>
                    <ErrorDisplay />
                </RAGProvider>
            </div>
        </div>
    )
}

export default App
