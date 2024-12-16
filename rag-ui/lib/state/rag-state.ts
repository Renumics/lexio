import { atom, WritableAtom } from 'jotai'
import { GenerateInput, GenerateResponse, GenerateStreamChunk, GetDataSourceResponse, Message, RAGConfig, RetrievalResult, RetrieveAndGenerateResponse, RetrieveResponse, SourceContent, WorkflowMode } from '../types';
import { toast } from 'react-toastify';
import { validateRetrievalResults } from './data_validation';

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


// Add active source atom
export const activeSourceAtom = atom<string | null>(null);

// Add message atom
export const addMessageAtom = atom(
  null,
  async (_get, set, message: Message) => {


    // Check if loading atom is true and throw error if that is the case
    if (_get(loadingAtom)) {
      toast.error('RAG operation already in progress');
      throw new Error('RAG operation already in progress');
    }

    const currentMode = _get(workflowModeAtom);
    const ragAtoms = _get(ragAtomsAtom);
    const previousMessages = _get(completedMessagesAtom);

    if (!ragAtoms) {
      throw new Error('RAG atoms not initialized');
    }

    // Add the message to the history
    const updatedMessages = [...previousMessages, message];
    set(completedMessagesAtom, updatedMessages);

    // Handle workflow transitions and actions
    switch (currentMode) {
      case 'init':
        // First message triggers retrieveAndGenerate
        set(ragAtoms.retrieveAndGenerateAtom, updatedMessages);
        break;  

      case 'follow-up':
        // Continue with generate
        set(ragAtoms.generateAtom, updatedMessages);
        break;

      case 'reretrieve':
        // Get new sources while preserving history
        set(ragAtoms.retrieveAndGenerateAtom, updatedMessages);
        set(workflowModeAtom, 'follow-up');
        break;

      default:
        console.warn(`Unexpected workflow mode: ${currentMode}`);
        break;
    }
  }
);

// Generate
export const createGenerateAtom = (generateFn: (input: GenerateInput) => GenerateResponse) => {
  return atom<null, [GenerateInput], GenerateResponse>(
    null,
    (_get, set, input: GenerateInput): GenerateResponse => {
      set(loadingAtom, true);
      set(errorAtom, null);

      // Track if we should abort processing
      let aborted = false;
      const abortController = new AbortController();

      const config = _get(ragConfigAtom);
      let accumulatedContent = '';

      const response = generateFn(input);

      // Function to handle errors uniformly
      const handleError = (err: any) => {
        aborted = true;
        abortController.abort();
        set(errorAtom, `Generate operation failed: ${err.message}`);
        set(loadingAtom, false);
      };

      if (typeof response === 'string' || response instanceof Promise) {
        // Handle non-streaming or Promise<string> responses
        (response as Promise<string>)
          .then(content => {
            set(currentStreamAtom, { 
              role: 'assistant', 
              content 
            });
            set(completedMessagesAtom, prev => [...prev, { 
              role: 'assistant', 
              content 
            }]);
            set(currentStreamAtom, null);
          })
          .catch(handleError)
          .finally(() => {
            set(loadingAtom, false);
          });

        return response;
      } else if (Symbol.asyncIterator in response) {
        // Handle streaming responses
        const streamIterator = response as AsyncIterable<GenerateStreamChunk>;

        const processStream = async () => {
          const streamTimeout = new StreamTimeout(config.timeouts?.stream);

          try {
            for await (const chunk of streamIterator) {
              if (aborted || abortController.signal.aborted) {
                break;
              }

              streamTimeout.check();
              accumulatedContent += chunk.content;
              
              set(currentStreamAtom, { 
                role: 'assistant', 
                content: accumulatedContent 
              });

              if (chunk.done) {
                set(completedMessagesAtom, prev => [...prev, { 
                  role: 'assistant', 
                  content: accumulatedContent 
                }]);
                set(currentStreamAtom, null);
              }
            }
          } catch (err: any) {
            handleError(err);
          } finally {
            set(loadingAtom, false);
          }
        };

        // Apply overall request timeout
        addTimeout(
          processStream(),
          config.timeouts?.request,
          'Generate request timeout exceeded',
          abortController.signal
        ).catch(handleError);

        return response;
      }

      // In case response doesn't match expected types
      set(errorAtom, 'Invalid GenerateResponse type.');
      set(loadingAtom, false);
      return response;
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
  retrieveAndGenerateFn: (query: GenerateInput, metadata?: Record<string, any>) => RetrieveAndGenerateResponse
) => {
  return atom(null, (_get, set, query: GenerateInput, metadata?: Record<string, any>) => {

    set(loadingAtom, true);
    set(errorAtom, null);

    const config = _get(ragConfigAtom);
    let accumulatedContent = '';
    
    const response = retrieveAndGenerateFn(query, metadata);

    // Create a promise that handles both sources and response
    const processingPromise = (async () => {

      // Handle sources
      if (response.sources) {
        await addTimeout(
          response.sources.then(sources => set(retrievedSourcesAtom, validateRetrievalResults(sources))),
          config.timeouts?.request,
          'Sources request timeout exceeded'
        );
      }

      // Handle streaming response
      if (Symbol.asyncIterator in response.response) {
        const processStream = async () => {
          const streamTimeout = new StreamTimeout(config.timeouts?.stream);
          
          for await (const chunk of response.response as AsyncIterable<GenerateStreamChunk>) {
            streamTimeout.check();
            accumulatedContent += chunk.content;
            
            set(currentStreamAtom, { 
              role: 'assistant', 
              content: accumulatedContent 
            });

            if (chunk.done) {
              set(completedMessagesAtom, prev => [...prev, { 
                role: 'assistant', 
                content: accumulatedContent 
              }]);
              set(currentStreamAtom, null);
              set(workflowModeAtom, 'follow-up');
            }
          }
        };

        await addTimeout(
          processStream(),
          config.timeouts?.request,
          'Stream processing timeout exceeded'
        );
      } else {
        // Handle Promise<string> response
        const content = await addTimeout(
          response.response as Promise<string>,
          config.timeouts?.request,
          'Response timeout exceeded'
        );
        
        set(currentStreamAtom, { role: 'assistant', content });
        set(completedMessagesAtom, prev => [...prev, { role: 'assistant', content }]);
        set(currentStreamAtom, null);
      }
    })();

    // Start the processing but handle errors
    processingPromise.catch(err => {
      set(errorAtom, `RAG operation failed: ${err.message}`);
    }).finally(() => {
      set(loadingAtom, false);
    });

    return response;
  });
};

const addTimeout = <T>(
  promise: Promise<T>, 
  timeout?: number, 
  message?: string,
  signal?: AbortSignal
): Promise<T> => {
  if (!timeout) return promise;
  
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(message));
      }, timeout);

      // Clean up timeout if aborted
      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId);
      });
    })
  ]);
};

// Helper classes/functions
class StreamTimeout {
  private lastCheck = Date.now();
  
  constructor(private timeout?: number) {}
  
  check() {
    if (!this.timeout) return;
    
    const now = Date.now();
    if (now - this.lastCheck > this.timeout) {
      throw new Error('Stream timeout exceeded');
    }
    this.lastCheck = now;
  }
}

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


type GenerateAtom = WritableAtom<null, [GenerateInput], GenerateResponse>;

type RetrieveAndGenerateAtom = WritableAtom<
  null,
  [GenerateInput, Record<string, any>?],
  RetrieveAndGenerateResponse
>;

type RetrieveSourcesAtom = WritableAtom<
  null,
  [string, Record<string, any>?],
  RetrieveResponse
>;

type GetDataSourceAtom = WritableAtom<
  null,
  [string, Record<string, any>?],
  GetDataSourceResponse
>;


// Container for all RAG atoms. This is necessary since the atoms are created dynamically but need to be referenced form other atoms
interface RAGAtoms {
  generateAtom: GenerateAtom;
  retrieveAndGenerateAtom: RetrieveAndGenerateAtom;
  retrieveSourcesAtom: RetrieveSourcesAtom;
  getDataSourceAtom: GetDataSourceAtom;
}

export const ragAtomsAtom = atom<RAGAtoms | null>(null);