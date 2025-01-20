import {
  ChatWindow,
  RAGProvider,
  Message,
  GenerateStreamChunk,
  ContentDisplay,
  SourcesDisplay,
  QueryField,
  ErrorDisplay,
  RetrievalResult,
  SourceReference,
  GetDataSourceResponse,
  RetrieveAndGenerateResponse
} from '@lexio'

function App() {
  const generateText = async function* (messages: Message[]): AsyncIterable<GenerateStreamChunk> {
    const response = await fetch('http://localhost:8000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({ messages: messages })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          yield { content: '', done: true };
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            yield {
              content: data.content || '',
              done: data.done || false
            };
            if (data.done) break;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  // Mock functions for RAGProvider
  const retrieve = async (query: string): Promise<RetrievalResult[]> => {
    const response = await fetch(`http://localhost:8000/retrieve?query=${encodeURIComponent(query)}`);
    return await response.json();
  };

  const retrieveAndGenerate = async (messages: Message[]): Promise<RetrieveAndGenerateResponse> => {
    const sources = await retrieve(messages[messages.length - 1].content);
    const response = generateText(messages);
    
    return {
      sources: sources,
      response: response
    };
  };

  const getDataSource = async (source: SourceReference): GetDataSourceResponse => {
    // For PDF files
    if (source.type === 'pdf') {
      const response = await fetch(`http://localhost:8000/pdfs/${encodeURIComponent(source.source)}`);
      const arrayBuffer = await response.arrayBuffer();
      return {
        content: new Uint8Array(arrayBuffer),
        type: 'pdf',
        metadata: source.metadata,
        highlights: source.highlights
      };
    }
    // For HTML files
    else {
      const response = await fetch(`http://localhost:8000/htmls/${encodeURIComponent(source.source)}`);
      const content = await response.text();
      return {
        content,
        type: 'html',
        metadata: source.metadata
      };
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Modern Navbar */}
      <nav className="w-full bg-white shadow-sm px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h2 className="text-2xl">
            RAG with Lexio📚 + Langchain🦜 + ChromaDB🔥
          </h2>
          <div className="flex items-center gap-4">
            <a 
              href="https://renumics.com/open-source/docs/lexio" 
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
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <RAGProvider 
          generate={generateText}
          retrieve={retrieve}
          retrieveAndGenerate={retrieveAndGenerate}
          getDataSource={getDataSource}
        >
          <div className="w-full h-full max-w-6xl mx-auto flex flex-row gap-4 p-2">
            {/* Left side: Chat and Query */}
            <div className="h-3/4 gap-4 w-1/4 flex flex-col">
                <div className="bg-gray-200 rounded-lg p-2 shrink-0"> {/* Query field */}
                  <QueryField onSubmit={() => {}} />
                </div>
                <div className="bg-gray-200 rounded-lg flex-1 min-h-0"> {/* Chat window */}
                    <ChatWindow />
                </div>
            </div>
            <div className="w-1/6 h-full bg-gray-200 rounded-lg"> {/* Sources panel */}
                <SourcesDisplay />
            </div>
            <div className="w-1/3 h-full flex-1 overflow-hidden bg-gray-200 rounded-lg"> {/* Sources panel */}
                <ContentDisplay />
            </div>
            <ErrorDisplay />
          </div>
        </RAGProvider>
      </div>
    </div>
  )
}

export default App
