import './App.css'
import {
    QueryField,
    ChatWindow,
    RAGProvider,
    RetrieveAndGenerateResponse,
    RetrievalResult,
    SourceContent,
    SourcesDisplay,
    ErrorDisplay,
    GetDataSourceResponse,
    SourceReference,
    ContentDisplay,
    Message,
    AdvancedQueryField
} from '../../../../lib/main'
import { GenerateInput, GenerateStreamChunk } from '../../../../lib/main'

function App() {
    const retrieveAndGenerate = (input: GenerateInput): RetrieveAndGenerateResponse => {
        const apiPromise = new Promise<{ sources: SourceReference[]; content: string }>(
          async (resolve, reject) => {
            try {
              const question = input[input.length - 1].content
              const response = await fetch(`http://localhost:8000/query?messages=${question}`)
    
              if (!response.ok) {
                throw new Error(`Failed to fetch response: ${response.statusText}`)
              }
    
              const data = await response.json()
    
              // Log the data to inspect its structure
              console.log('Fetched data:', data)
    
              // Assuming `data` is structured to match SourceReference
              const sources: SourceReference[] = data.source_nodes.map((doc: any) => ({
                type: 'pdf', // or derive from doc if available
                relevanceScore: doc.score,
                source: doc.node.extra_info.file_name,
                //metadata: doc.metadata,
              }))
    
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
    
        return {
          sources: sourcesPromise,
          response: responsePromise,
        }
      }



    return (
        <div className="w-full h-screen flex flex-col items-center p-4">
            <h1>RAG UI</h1>
            <RAGProvider
                retrieve={() => {}}
                retrieveAndGenerate={retrieveAndGenerate}
                generate={() => {}}
                getDataSource={() => {}}
                config={{
                    timeouts: {
                        stream: 10000,
                        request: 60000
                    }
                }}
                // onAddMessage={() => {
                //     return {
                //         type: 'reretrieve',
                //         preserveHistory: false
                //     }
                // }}
            >
                <div className="w-full max-w-6xl h-full flex gap-4">
                    
                    {/* Left side: Chat and Query */}
                    <div className="flex flex-1 flex-col gap-4 w-1/3">
                        <div className="h-1/3 min-h-0"> {/* Chat window */}
                            <ChatWindow />
                        </div>
                        <div className="min-h-0"> {/* Query field */}
                            {/* <QueryField onSubmit={() => {
                            }} /> */}
                            <AdvancedQueryField />
                        </div>

                        <div className="h-1/3 flex-1"> {/* Sources panel */}
                            <SourcesDisplay />
                        </div>
                    </div>

                    <div className="w-2/3 h-full overflow-hidden"> {/* Sources panel */}
                        <ContentDisplay />
                    </div>
                    <ErrorDisplay />
                </div>
            </RAGProvider>
        </div>
    );
}

export default App;