import { atom, WritableAtom } from 'jotai'
import { GenerateInput, GenerateResponse, GenerateStreamChunk, Message, RAGConfig, RetrievalResult, RetrieveAndGenerateResponse, SourceContent, WorkflowMode } from '../types';

export const workflowModeAtom = atom<WorkflowMode>('init');

export const ragConfigAtom = atom<RAGConfig>({
  timeouts: {
    stream: 10000,  // 10 seconds default
    request: 30000  // 30 seconds default
  }
});

export const completedMessagesAtom = atom<Message[]>([]);
export const currentStreamAtom = atom<Message | null>(null);
export const loadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);

export const addMessageAtom = atom(
  null,
  async (_get, set, message: Message) => {
    const currentMode = _get(workflowModeAtom);
    const ragAtoms = _get(ragAtomsAtom);

    if (!ragAtoms) {
      throw new Error('RAG atoms not initialized');
    }

    // Add the message to the history
    set(completedMessagesAtom, (prev) => [...prev, message]);

    // Handle workflow transitions and actions
    switch (currentMode) {
      case 'init':
        // First message triggers retrieveAndGenerate
        await set(ragAtoms.retrieveAndGenerateAtom, message.content);
        set(workflowModeAtom, 'follow-up');
        break;  

      case 'follow-up':
        // Continue with generate
        await set(ragAtoms.generateAtom, message.content);
        break;

      case 'reretrieve':
        // Get new sources while preserving history
        await set(ragAtoms.retrieveAndGenerateAtom, message.content);
        set(workflowModeAtom, 'follow-up');
        break;

      default:
        console.warn(`Unexpected workflow mode: ${currentMode}`);
        break;
    }
  }
);


// Generate
export const createGenerateAtom = (generateFn: (input: GenerateInput) => Promise<GenerateResponse>) => {
  return atom(
    null,
    async (_get, set, input: GenerateInput) => {
      set(loadingAtom, true);
      
      try {
        const response = await generateFn(input);
        
        if (typeof response === 'string') {
          // For non-streaming responses
          set(currentStreamAtom, { role: 'assistant', content: response });
          set(completedMessagesAtom, (prev) => [...prev, { 
            role: 'assistant', 
            content: response 
          }]);
          set(currentStreamAtom, null);
        } else {
          // For streaming responses
          let accumulatedContent = '';
          
          for await (const chunk of response) {
            accumulatedContent += chunk.content;
            set(currentStreamAtom, { 
              role: 'assistant', 
              content: accumulatedContent 
            });
            
            // Optional: Update completed messages only on stream end
            if (chunk.done) {
              set(completedMessagesAtom, (prev) => [...prev, { 
                role: 'assistant', 
                content: accumulatedContent 
              }]);
              set(currentStreamAtom, null);
            }
          }
        }
        
        return response;
      } finally {
        set(loadingAtom, false);
      }
    }
  );
};

// Retrieve sources
export const retrievedSourcesAtom = atom<RetrievalResult[]>([]);
export const currentSourcesAtom = atom<RetrievalResult[]>([]);

export const createRetrieveSourcesAtom = (retrieveFn: (query: string, metadata?: Record<string, any>) => Promise<RetrievalResult[]>) => {
  return atom(
    null,
    async (_get, set, query: string, metadata?: Record<string, any>) => {
      set(loadingAtom, true);
      try {
        const sources = await retrieveFn(query, metadata);
        set(retrievedSourcesAtom, sources);
        return sources; // Add this return statement
      } finally {
        set(loadingAtom, false);
      }
    }
  );
};

export const createRetrieveAndGenerateAtom = (
  retrieveAndGenerateFn: (query: string, metadata?: Record<string, any>) => RetrieveAndGenerateResponse
) => {
  return atom(
    null,
    (_get, set, query: string, metadata?: Record<string, any>) => {
      set(loadingAtom, true);

      const response = retrieveAndGenerateFn(query, metadata);
      let accumulatedContent = '';

      // Handle sources if present
      if (response.sources) {
        response.sources.then(resolvedSources => {
          set(retrievedSourcesAtom, resolvedSources);
        });
      }

      const responseObject = response.response;
      // Handle response based on type
      if (responseObject instanceof Promise) {
        // Handle Promise response
        responseObject.then(resolvedResponse => {
          set(currentStreamAtom, { role: 'assistant', content: resolvedResponse });
          set(completedMessagesAtom, (prev) => [...prev, { 
            role: 'assistant', 
            content: resolvedResponse 
          }]);
          set(currentStreamAtom, null);
          set(loadingAtom, false);
        });
      } else if (Symbol.asyncIterator in responseObject) {
        // Handle AsyncIterator response
        (async () => {
          for await (const chunk of responseObject) {
            accumulatedContent += chunk.content;
            set(currentStreamAtom, { 
              role: 'assistant', 
              content: accumulatedContent 
            });
            
            if (chunk.done) {
              set(completedMessagesAtom, (prev) => [...prev, { 
                role: 'assistant', 
                content: accumulatedContent 
              }]);
              set(currentStreamAtom, null);
              break;
            }
          }
          set(loadingAtom, false);
        })();
      } else {
        set(errorAtom, 'Invalid response type');
      }

      return response;
    }
  );
};

export const createGetDataSourceAtom = (getDataSourceFn: (metadata: Record<string, any>) => Promise<SourceContent>) => {
  return atom(
    null,
    async (_get, set, source: string, metadata?: Record<string, any>) => {
      set(loadingAtom, true);
      
      try {
        const mergedMetadata = {
          source,
          ...metadata
        };
        
        const response = await getDataSourceFn(mergedMetadata);
        return response;
      } finally {
        set(loadingAtom, false);
      }
    }
  );
};


type GenerateAtom = WritableAtom<null, [GenerateInput], Promise<GenerateResponse>>;

type RetrieveAndGenerateAtom = WritableAtom<
  null,
  [string, Record<string, any>?],
  RetrieveAndGenerateResponse
>;

type RetrieveSourcesAtom = WritableAtom<
  null,
  [string, Record<string, any>?],
  Promise<RetrievalResult[]>
>;

type GetDataSourceAtom = WritableAtom<
  null,
  [string, Record<string, any>?],
  Promise<SourceContent>
>;


// Container for all RAG atoms. This is necessary since the atoms are created dynamically but need to be referenced form other atoms
interface RAGAtoms {
  generateAtom: GenerateAtom;
  retrieveAndGenerateAtom: RetrieveAndGenerateAtom;
  retrieveSourcesAtom: RetrieveSourcesAtom;
  getDataSourceAtom: GetDataSourceAtom;
}

export const ragAtomsAtom = atom<RAGAtoms | null>(null);