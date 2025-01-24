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
                sourceReference: doc.node.extra_info.file_name,
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
    
        return {
          sources: sourcesPromise,
          response: responsePromise,
        }
      }
    
      const getDataSource = async (source: SourceReference): Promise<SourceContent> => {
        let url: string;
        url = `http://localhost:8000/getDataSource?source_reference=${source.sourceReference}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to get data source. HTTP Status: ${response.status} ${response.statusText}`);
        }

        if (source.type === "html") {
            const text = await response.text();
            const htmlContent: HTMLSourceContent = {
                type: 'html',
                content: `<div class="source-content">${text}</div>`,
                metadata: source.metadata || {}
            };
            return htmlContent;
        } else if (source.type === "markdown") {
            const text = await response.text();
            const markdownContent: MarkdownSourceContent = {
                type: 'markdown',
                content: text,
                metadata: source.metadata || {}
            };
            return markdownContent
        } else if (source.type === "pdf") {
            const arrayBuffer = await response.arrayBuffer();
            const pdfContent: PDFSourceContent = {
                type: 'pdf',
                content: new Uint8Array(arrayBuffer),
                metadata: source.metadata || {},
                highlights: source.highlights || []
            };
            return pdfContent;
        }

        throw new Error("Invalid source type");
    };



    return (
      <div style={{ width: '100%', height: '100vh', padding: '20px' }}>
          <h1>RAG UI</h1>
            <RAGProvider
                retrieve={() => {}}
                retrieveAndGenerate={retrieveAndGenerate}
                generate={() => {}}
                getDataSource={getDataSource}
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
                <ErrorDisplay />
            </RAGProvider>
        </div>
    );
}

export default App;