import { fetchEventSource } from '@microsoft/fetch-event-source';
import {
    ChatWindow,
    LexioProvider,
    SourcesDisplay,
    ContentDisplay,
    Message,
    Source,
    ErrorDisplay,
    createTheme, AdvancedQueryField, 
} from 'lexio';
import LexioLogo from './assets/lexio.svg';
import LexioIcon from './assets/icon.svg';
import {ActionHandlerResponse, UserAction} from "lexio";

// define the API base URL
// @ts-ignore
const API_BASE_URL = __API_BASE_URL__;

// we create a custom theme for the demo which overrides the default theme values
const demoTheme = createTheme({
    colors: {
        primary: '#1D3D3C',
        contrast: '#FFFFFF',
        secondary: '#4172b6',
        background: 'white',
        toolbarBackground: '#366563',
        secondaryBackground: '#bbd5d3',
    },
    typography: {
        fontSizeBase: '1.0rem',
    },
});

const myOnActionFn = (action: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: Source | null): ActionHandlerResponse => {
    const TIMEOUT_MS = 10000; // 10 seconds timeout
    console.log("myOnActionFn", action, messages, sources, activeSources, selectedSource)

    if (action.type === 'ADD_USER_MESSAGE') {
        let sourcesResolve: (sources: Source[]) => void;
        const sourcesPromise = new Promise<Source[]>(resolve => {
            sourcesResolve = resolve;
        });

        return {
            response: (async function* () {
                const controller = new AbortController();
                const queue: { content: any; done: any; }[] = [];
                let resolver: ((value: unknown) => void) | null = null;

                const waitForData = () => Promise.race([
                    new Promise(resolve => resolver = resolve),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout waiting for response')), TIMEOUT_MS)
                    )
                ]);

                try {
                    fetchEventSource(API_BASE_URL + '/on-message', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: action.message,
                            messages: messages,
                            // remove the data field from sources to avoid sending the data over the network
                            sources: sources.map(source => ({ ...source, data: undefined })), // todo: talk about this
                            activeSources: activeSources ? activeSources.map(source => ({ ...source, data: undefined })) : [],
                            selectedSource: selectedSource ?  {...selectedSource, data: undefined} : undefined,
                        }),
                        signal: controller.signal,
                        onmessage(ev) {
                            const data = JSON.parse(ev.data);
                            if (data.sources) {
                                sourcesResolve(data.sources);
                            }
                            if (data.content !== undefined) {
                                queue.push({ content: data.content, done: data.done });
                                // @ts-ignore
                                if (resolver) resolver();
                            }
                        },
                    });

                    while (true) {
                        if (queue.length === 0) await waitForData();
                        const next = queue.shift();
                        if (next) {
                            yield next;
                            if (next.done) break;
                        }
                    }
                } catch (error) {
                    console.error('Streaming timeout:', error);
                    yield { content: '\n\nConnection timed out.', done: true };
                }
            })(),
            sources: sourcesPromise
        };
    }

    // Handle search sources action
    if (action.type === 'SEARCH_SOURCES') {
        // implement call to backend for fetching source
        return {
            sources: (async () => {
                try {
                    const response = await fetch(API_BASE_URL + '/search?query=' + encodeURIComponent(action.query));
                    const data = await response.json();

                    // check for error response
                    if (!response.ok) {
                        // get error message from body or default to response statusText
                        const error = (data && data.message) || response.statusText;
                        throw new Error(`Error in fetching search sources endpoint ${error}`);
                    }
                    return data;
                } catch (error) {
                    console.error('There was an error!', error);
                    return [];
                }
            })()
        };
    }

    // Load the data from the API
    if (action.type === 'SET_SELECTED_SOURCE') {
        const selected = sources.filter(source => source.id === action.sourceId)[0];
        if (!selected) return {};

        return {
            sourceData: (async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/${selected.metadata?._href}`);

                    // Check the content type of the response
                    const contentType = response.headers.get('content-type');

                    if (contentType?.includes('application/pdf')) {
                        // For PDFs, return the array buffer wrapped in a Uint8Array
                        return new Uint8Array(await response.arrayBuffer());
                    } else if (contentType?.includes('text/html')) {
                        // For HTML, return the text content
                        return await response.text();
                    } else {
                        throw new Error(`Unsupported content type: ${contentType}`);
                    }
                } catch (error) {
                    console.error('Failed to load source:', error);
                    throw error;
                }
            })()
        };
    }

    return {}
}


function App() {
    return (
        <div className="w-full h-full flex flex-col">
            {/* Modern Navbar */}
            <nav className="w-full bg-white shadow-sm p-2">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
                    <img src={LexioLogo} alt="Lexio Logo" className="h-10" />
                    <h2 className="text-2xl">
                        PDF RAG with Lexio <img src={LexioIcon} alt="Lexio Logo" className="h-8 inline-block" /> + Langchain🦜 + ChromaDB🔥
                    </h2>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://renumics.com/lexio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                            Docs
                        </a>
                        <a
                            href="https://github.com/renumics/lexio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd"
                                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                      clipRule="evenodd"/>
                            </svg>
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 h-full max-h-full overflow-y-hidden p-4">
                <LexioProvider
                    onAction={myOnActionFn}
                    theme={demoTheme}
                >
                    <div className="w-full h-full max-h-full max-w-full mx-auto flex flex-row gap-6 p-4">
                        <div className="gap-4 w-1/4 flex flex-col h-full">
                            <div className="shrink-0"> {/* Query field */}
                                <AdvancedQueryField/>
                            </div>
                            <div className="h-full overflow-y-scroll"> {/* Chat window */}
                                <ChatWindow/>
                            </div>
                        </div>
                        <div className="w-1/2 h-full overflow-hidden flex flex-col"> {/* Sources panel */}
                            <ContentDisplay/>
                        </div>
                        <div className="w-1/4 h-full"> {/* Sources panel */}
                            <SourcesDisplay/>
                        </div>
                        <ErrorDisplay/>
                    </div>
                </LexioProvider>
            </div>
        </div>
    )
}

export default App
