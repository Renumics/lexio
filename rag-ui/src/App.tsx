import './App.css'
import { QueryField, ChatWindow, RAGProvider, RetrieveAndGenerateResponse, RetrievalResult, SourceContent, SourcesDisplay, ErrorDisplay, GetDataSourceResponse, SourceReference, ContentDisplay, Message } from '../lib/main'
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

// In App.tsx
const generateText = (messages: Message[]): AsyncIterable<GenerateStreamChunk> => {
  // Convert input messages array to URL-safe format
  const query = encodeURIComponent(JSON.stringify({ messages: messages }));
  
  const eventSource = new EventSource(
    `http://localhost:8000/generate?messages=${query}`
  );

  const messageQueue: GenerateStreamChunk[] = [];
  let resolveNext: (() => void) | null = null;

  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const chunk: GenerateStreamChunk = {
      content: data.content || '',
      done: data.done || false
    };
    messageQueue.push(chunk);
    resolveNext?.();
  };

  eventSource.addEventListener('message', handleMessage);

  async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
    try {
      while (true) {
        if (messageQueue.length === 0) {
          await new Promise(resolve => { resolveNext = resolve; });
        }

        const chunk = messageQueue.shift()!;
        yield chunk;
        if (chunk.done) {
          break;
        }
    
      }
    } finally {
      eventSource.removeEventListener('message', handleMessage);
      eventSource.close();
    }
  }

  return streamChunks();
};

const generateTextWithSources = (
  messages: Message[],
  sources: RetrievalResult[]
): AsyncIterable<GenerateStreamChunk> => {
  // Convert both messages and sources to URL-safe format
  console.log(messages, sources);
  const query = encodeURIComponent(
    JSON.stringify({
      messages: messages,
      sources: sources
    })
  );
  
  const eventSource = new EventSource(
    `http://localhost:8000/generate?input=${query}`
  );

  const messageQueue: GenerateStreamChunk[] = [];
  let resolveNext: (() => void) | null = null;

  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const chunk: GenerateStreamChunk = {
      content: data.content || '',
      done: data.done || false
    };
    messageQueue.push(chunk);
    resolveNext?.();
  };

  eventSource.addEventListener('message', handleMessage);

  async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
    try {
      while (true) {
        if (messageQueue.length === 0) {
          await new Promise(resolve => { resolveNext = resolve; });
        }

        const chunk = messageQueue.shift()!;
        yield chunk;
        if (chunk.done) {
          break;
        }
      }
    } finally {
      eventSource.removeEventListener('message', handleMessage);
      eventSource.close();
    }
  }

  return streamChunks();
};

const retrieveAndGenerate = (messages: GenerateInput): RetrieveAndGenerateResponse => {
  // Convert messages array to URL-safe format
  const query = encodeURIComponent(JSON.stringify({messages: messages}));

  const eventSource = new EventSource(
    `http://localhost:8000/retrieve-and-generate?messages=${query}`
  );

  // Rest of the function remains the same
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
        yield chunk;
        if (chunk.done) {
          break;
        }
        
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

const getDataSource = async (source: SourceReference): GetDataSourceResponse => {
  const url = `http://localhost:8000/pdfs/${encodeURIComponent(source.source)}${source.metadata?.page !== undefined ? `?page=${source.metadata.page}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to get data source');
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  return {
    content: uint8Array, // Store as Uint8Array
    metadata: source.metadata || {},
    type: source.type,
  };
};


  return (
<div className="w-full h-screen flex flex-col items-center p-4">
  <RAGProvider
    retrieve={retrieveSources}
    retrieveAndGenerate={retrieveAndGenerate}
    generate={generateText}
    getDataSource={getDataSource}
    config={{
      timeouts: {
        stream: 10000,
        request: 60000
      }
    }}
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
        <ContentDisplay />
      </div>
      <ErrorDisplay />
    </div>
  </RAGProvider>
</div>
  );
}

export default App;