import './App.css'
import {
    ChatWindow,
    RAGProvider2,
    createTheme,
    SourcesDisplay, ContentDisplay, AdvancedQueryField,
} from '../lib/main'
import {UserAction, Message, Source, ActionHandlerResponse} from '../lib/state/rag-state-v2'
import React from "react";

const customTheme = createTheme({
    colors: {
        primary: '#1E88E5',
        secondary: '#64B5F6'
    }
});

export const myOnActionFn = (action: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: Source | null) => {
    console.log("myOnActionFn", action, messages, sources, activeSources, selectedSource)

    if (action.type === 'ADD_USER_MESSAGE') {
        if (messages.length === 0) {
            return {
                response: Promise.resolve("Hello from myOnActionFn"),
                sources: Promise.resolve([
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
                ]),
            } as ActionHandlerResponse
        }
        return {
            response: Promise.resolve("Hello from myOnActionFn"),
        } as ActionHandlerResponse
    }
}

function App() {
    return (
        <div style={{width: '100%', height: '100vh'}}>
            {/* Main Content */}
            <div className="w-full h-full max-w-7xl mx-auto flex flex-row gap-4 p-5">
                <RAGProvider2
                    onAction={myOnActionFn}
                    theme={customTheme}
                >
                    {/* Left side: Chat and Query */}
                    <div className="h-full gap-4 w-1/3 flex flex-col">
                        <div className="shrink-0"> {/* Query field */}
                            {/*<QueryField />*/}
                            <AdvancedQueryField />
                        </div>
                        <div className="h-full"> {/* Chat window */}
                            <ChatWindow />
                        </div>
                    </div>

                    <div className="h-full w-1/3"> {/* Query field */}
                       <SourcesDisplay />
                    </div>
                    <div className={"h-full w-1/3"}>
                        <ContentDisplay />
                    </div>
                </RAGProvider2>
            </div>
        </div>
    )
}

export default App
