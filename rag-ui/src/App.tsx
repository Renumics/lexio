import './App.css'
import { QueryField, ChatWindow, RAGProvider, RetrieveAndGenerateResponse, GenerateResponse, RetrievalResult, SourceContent } from '../lib/main'
import { GenerateInput, GenerateStreamChunk } from '../lib/main'

function App() {
// Function to retrieve sources from the server
const retrieveSources = async (query: string): Promise<RetrievalResult[]> => {
  const response = await fetch(`http://localhost:8000/retrieve?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to retrieve sources');
  }
  return await response.json();
};

// Function to generate text from the server
const generateText = async (input: GenerateInput): Promise<GenerateResponse> => {
  const response = await fetch(`http://localhost:8000/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: typeof input === 'string' ? input : input.map(msg => msg.content).join(' ') }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate text');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');

  async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
    while (true) {
      const { done, value } = await reader?.read() || {};
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      yield { content: text, done: false };
    }
    yield { content: '', done: true };
  }

  return streamChunks();
};

// Function to retrieve and generate text from the server
const retrieveAndGenerate = async (query: string): Promise<RetrieveAndGenerateResponse> => {
  let sources: RetrievalResult[] = [];
  
  // Create a promise that will resolve with our stream interface
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(
      `http://localhost:8000/retrieve-and-generate?query=${encodeURIComponent(query)}`
    );

    // Create our async generator
    async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
      try {
        // Create a promise queue to handle incoming messages
        const messageQueue: Promise<GenerateStreamChunk>[] = [];
        let resolveNext: ((value: GenerateStreamChunk) => void) | null = null;
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          // Store sources if they exist
          if (data.sources) {
            sources = data.sources;
          }

          // Create a new promise for this chunk
          const promise = new Promise<GenerateStreamChunk>((resolve) => {
            resolve({
              content: data.content || '',
              done: data.done || false
            });
          });

          messageQueue.push(promise);
          // If someone is waiting for the next value, resolve their promise
          resolveNext?.();
        };

        eventSource.onerror = (error) => {
          console.error("EventSource failed:", error);
          eventSource.close();
        };

        // Yield chunks as they come in
        while (true) {
          if (messageQueue.length === 0) {
            // Wait for the next message
            await new Promise(resolve => { resolveNext = resolve; });
          }
          
          const chunk = await messageQueue.shift()!;
          if (chunk.done) {
            eventSource.close();
            break;
          }
          yield chunk;
        }
      } finally {
        eventSource.close();
      }
    }

    // Create the stream
    const stream = streamChunks();
    
    // Resolve with our response object
    resolve({
      sources,
      response: stream,
    });
  });
};

const getDataSource = async (metadata: Record<string, any>): Promise<SourceContent> => {
  const url = `http://localhost:8000/pdfs/${encodeURIComponent(metadata.source)}${metadata.page !== undefined ? `?page=${metadata.page}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to get data source');
  }

  const content = await response.text();
  return {
    content,
    metadata: {},
    type: 'pdf',
  };
};


  return (
    <div className="w-full h-screen flex flex-col items-center p-4">
      <RAGProvider
        retrieve={retrieveSources}
        retrieveAndGenerate={retrieveAndGenerate}
        generate={generateText}
        getDataSource={getDataSource}
      >
        <div className="w-full max-w-3xl h-full flex flex-col gap-4">
          <div className="h-2/3 min-h-0"> {/* Takes up 2/3 of the space */}
            <ChatWindow />
          </div>
          <div className="h-1/3 min-h-0"> {/* Takes up 1/3 of the space */}
            <QueryField onSubmit={() => {}} />
          </div>
        </div>
      </RAGProvider>
    </div>
  );
}

export default App;