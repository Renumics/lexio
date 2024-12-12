import './App.css'
import { QueryField, ChatWindow, RAGProvider, RetrieveAndGenerateResponse, GenerateResponse, RetrievalResult, SourceContent, SourcesDisplay } from '../lib/main'
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

const retrieveAndGenerate = (query: string): RetrieveAndGenerateResponse => {
  const eventSource = new EventSource(
    `http://localhost:8000/retrieve-and-generate?query=${encodeURIComponent(query)}`
  );

  // Create a promise to resolve sources
  const sourcesPromise = new Promise<RetrievalResult[]>((resolve, reject) => {
    const handleSources = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.sources) {
        resolve(data.sources);
        eventSource.removeEventListener('message', handleSources);
      }
    };

    eventSource.addEventListener('message', handleSources);
    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
      reject(new Error('Failed to retrieve sources'));
    };
  });

  // Create the response stream
  const messageQueue: GenerateStreamChunk[] = [];
  let resolveNext: (() => void) | null = null;

  const handleContent = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    // Skip source-only messages
    if (!data.content && !data.done) return;
    
    const chunk: GenerateStreamChunk = {
      content: data.content || '',
      done: data.done || false
    };
    messageQueue.push(chunk);
    resolveNext?.();
  };

  eventSource.addEventListener('message', handleContent);

  async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
    try {
      while (true) {
        if (messageQueue.length === 0) {
          await new Promise(resolve => { resolveNext = resolve; });
        }

        const chunk = messageQueue.shift()!;
        if (chunk.done) {
          break;
        }
        yield chunk;
      }
    } finally {
      eventSource.removeEventListener('message', handleContent);
      eventSource.close();
    }
  }

  return {
    sources: sourcesPromise,
    response: streamChunks(),
  };
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
    <div className="w-full max-w-6xl h-full flex gap-4">
      {/* Left side: Chat and Query */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="h-2/3 min-h-0"> {/* Chat window */}
          <ChatWindow />
        </div>
        <div className="h-1/3 min-h-0"> {/* Query field */}
          <QueryField onSubmit={() => {}} />
        </div>
      </div>
      
      {/* Right side: Sources */}
      <div className="w-1/3 h-full"> {/* Sources panel */}
        <SourcesDisplay />
      </div>
    </div>
  </RAGProvider>
</div>
  );
}

export default App;