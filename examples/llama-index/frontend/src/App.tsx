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
} from 'rag-ui'
import { GenerateInput, GenerateStreamChunk } from 'rag-ui'

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
      <div style={{ width: '100%', height: '100vh', padding: '20px' }}>
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
                <div style={{ 
                    display: 'grid',
                    height: '100%',
                    gridTemplateColumns: '3fr 1fr',
                    gridTemplateRows: '1fr auto 300px',
                    gap: '20px',
                    gridTemplateAreas: `
                        "chat sources"
                        "input sources"
                        "viewer viewer"
                    `
                }}>
                    <div style={{ gridArea: 'chat', minHeight: 0, overflow: 'auto' }}>
                        <ChatWindow />
                    </div>
                    <div style={{ gridArea: 'input' }}>
                        <AdvancedQueryField />
                    </div>
                    <div style={{ gridArea: 'sources', minHeight: 0, overflow: 'auto' }}>
                        <SourcesDisplay />
                    </div>
                    <div style={{ gridArea: 'viewer', height: '300px', overflow: 'auto' }}>
                        <ContentDisplay />
                    </div>
                </div>
            </RAGProvider>
        </div>
    );
}

export default App;