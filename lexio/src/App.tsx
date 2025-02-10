import './App.css'
import {
    ChatWindow,
    RAGProvider2,
    QueryField,
    createTheme,
} from '../lib/main'
import { UserAction, Message, Source } from '../lib/state/rag-state-v2'

const customTheme = createTheme({
    colors: {
        primary: '#1E88E5',
        secondary: '#64B5F6'
    }
});

function App() {

    const onAddUserMessageHandler = (action: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: Source | null) => {
        console.log('onAddUserMessageHandler', action, messages, sources, activeSources, selectedSource);
        if (action.type === 'ADD_USER_MESSAGE') {
            return {
                message: Promise.resolve({
                    id: crypto.randomUUID(),
                    role: 'user',
                    content: action.message
                }),
            }
        }
    }

    return (
        <div style={{ width: '100%', height: '100vh', padding: '20px' }}>
            {/* Main Content */}
            <div className="flex-1 p-4">
                <RAGProvider2
                    theme={customTheme}
                >
                    <div className="w-full h-full max-h-full max-w-6xl mx-auto flex flex-row gap-4 p-2">
                        {/* Left side: Chat and Query */}
                        <div className="h-3/4 gap-4 w-1/4 flex flex-col">
                            <div className="shrink-0"> {/* Query field */}
                                <QueryField onAddUserMessage={onAddUserMessageHandler}/>
                            </div>
                            <div className="h-full"> {/* Chat window */}
                                <ChatWindow/>
                            </div>
                        </div>
                    </div>
                </RAGProvider2>
            </div>
        </div>
    )
}

export default App
