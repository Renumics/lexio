import './App.css'
import {
    ChatWindow,
    LexioProvider,
    createTheme,
    SourcesDisplay, ContentDisplay, AdvancedQueryField,
    ErrorDisplay, AddUserMessageActionResponse,SetSelectedSourceActionResponse, UserAction, Message, Source
} from 'lexio'
import React from 'react'

const customTheme = createTheme({
    colors: {
        primary: '#1E88E5',
        secondary: '#64B5F6'
    }
});


function App() {
    const [interactionCount, setInteractionCount] = React.useState(0);

    const handleAction = React.useCallback((
        action: UserAction, 
        _messages: Message[], 
        sources: Source[], 
        _activeSources: Source[], 
        _selectedSource: Source | null
    ): SetSelectedSourceActionResponse| AddUserMessageActionResponse| undefined => {
        if (action.type === 'ADD_USER_MESSAGE') {
            setInteractionCount(prev => prev + 1);
            
        

            //////
            const apiPromise = new Promise<{ sources: Source[]; content: string }>(
                async (resolve, reject) => {
                try {
                    const question = action.message
                    const response = await fetch(`http://localhost:8000/query?messages=${question}`)
        
                    if (!response.ok) {
                    throw new Error(`Failed to fetch response: ${response.statusText}`)
                    }
        
                    const data = await response.json()
        
                    // Log the data to inspect its structure
                    console.log('Fetched data:', data)
        
                    // Assuming `data` is structured to match Source        
        
                const sources: Source[] = data.source_nodes.map((doc: any) => ({
                    type: 'pdf', // or derive from doc if available
                    title: doc.node.extra_info.file_name,
                    relevanceScore: doc.score,
                    Source: doc.node.extra_info.file_name,
                    highlights: [{
                        page: doc.node.extra_info.bounding_box.page_number,
                        rect: {
                            left: doc.node.extra_info.bounding_box.x0,
                            top: doc.node.extra_info.bounding_box.top,
                            width: doc.node.extra_info.bounding_box.x1 - doc.node.extra_info.bounding_box.x0,
                            height: doc.node.extra_info.bounding_box.bottom - doc.node.extra_info.bounding_box.top
                        }
                    }],
                    //metadata: doc.metadata,
                    }))
        
                    console.log('sources', sources)
        
                    resolve({
                    sources: sources,
                    content: data.response,
                    })
                } catch (error) {
                    reject(error)
                }
                }
            )
        
            const sourcesPromise = apiPromise.then((result) => result.sources)
            const responsePromise = apiPromise.then((result) => result.content)
            
            // log results of promises
            console.log('sourcesPromise', sourcesPromise)
            console.log('responsePromise', responsePromise)


            return {
                response: responsePromise,
                sources: sourcesPromise
            } 
        }    

        if (action.type === 'SET_SELECTED_SOURCE') {
            const source = sources.find(source => source.id === action.sourceId)
            if (source) {
                console.log('loading source', source)
                let url: string;
                url = `http://localhost:8000/getDataSource?source_reference=${source.title}`;
        
                const apiPromise = new Promise<Uint8Array>(
                    async (resolve, reject) => {
                        try {
                            const response = await fetch(url);
                            if (!response.ok) {
                                throw new Error(`Failed to get data source. HTTP Status: ${response.status} ${response.statusText}`);
                            }
                            const data = await response.arrayBuffer()
                            source.data = new Uint8Array(data)
                            console.log('data', data)
                            resolve(new Uint8Array(data))  
                        } catch (error) {
                            reject(error)
                        }
                    }
                )

                const sourcesPromise = apiPromise.then((result) => result)
                // ensure promise is resolved
                sourcesPromise.then(() => {
                    console.log('source loaded', source)
                })
                return {
                    sourceData: sourcesPromise
                }
            }
        }



        // Handle search sources action
        if (action.type === 'SEARCH_SOURCES') {
            return { sources: Promise.resolve<Source[]>(mockSources) }
        }

        return undefined;
    }, [interactionCount]);

    return (
        <div style={{width: '100%', height: '100vh'}}>
            {/* Main Content */}
            <div className="w-full h-full max-w-7xl mx-auto flex flex-row gap-4 p-5">
                <LexioProvider
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
                </LexioProvider>
            </div>
        </div>
    )
}

export default App
