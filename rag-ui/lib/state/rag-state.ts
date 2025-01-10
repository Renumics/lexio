import { atom, WritableAtom } from 'jotai'
import { acceptsSources, GenerateInput, GenerateResponse, GenerateSimple, GenerateStreamChunk, GenerateWithSources, GetDataSourceResponse, Message, RAGConfig, RAGWorkflowActionOnAddMessage, RetrievalResult, RetrieveAndGenerateResponse, RetrieveResponse, SourceContent, SourceReference, WorkflowMode } from '../types';
import { toast } from 'react-toastify';
import { validateRetrievalResults } from './data_validation';

export const workflowModeAtom = atom<WorkflowMode>('init');

export const ragConfigAtom = atom<RAGConfig>({
  timeouts: {
    stream: 10000,  // 10 seconds default
    request: 30000  // 30 seconds default
  }
});

// Current definition (might be wrong)
export const onAddMessageAtom = atom<((message: Message, previousMessages: Message[]) => RAGWorkflowActionOnAddMessage) | null>(null);

export const completedMessagesAtom = atom<Message[]>([]);
export const currentStreamAtom = atom<Message | null>(null);
export const loadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);


// Active source index atom
export const activeSourceIndexAtom = atom<number | null>(null);

// Update setActiveSourceIndexAtom to use getDataSourceAtom directly
export const setActiveSourceIndexAtom = atom(
  null,
  (_get, set, index: number | null) => {
    set(activeSourceIndexAtom, index);
    if (index !== null) {
      const sources = _get(retrievedSourcesAtom);
      const ragAtoms = _get(ragAtomsAtom);
      if (ragAtoms?.getDataSourceAtom && sources[index]) {
        set(ragAtoms.getDataSourceAtom, sources[index]);
      }
    }
  }
);

export const currentSourceContentAtom = atom<SourceContent | null>(null);


// Add message atom
export const addMessageAtom = atom(
  null,
  async (_get, set, message: Message) => {
    // Validate processing state
    if (_get(loadingAtom)) {
      toast.error('RAG operation already in progress');
      throw new Error('RAG operation already in progress');
    }

    // Get current state
    const currentMode = _get(workflowModeAtom);
    const ragAtoms = _get(ragAtomsAtom);
    const onAddMessage = _get(onAddMessageAtom);
    const previousMessages = _get(completedMessagesAtom);
    const currentSources = _get(retrievedSourcesAtom);

    if (!ragAtoms) {
      throw new Error('RAG atoms not initialized');
    }

    // Prepare rollback state
    const rollbackState = {
      messages: previousMessages,
      workflowMode: currentMode,
      sources: currentSources
    };

    // Handle custom workflow actions
    if (onAddMessage) {
      const action = onAddMessage(message, previousMessages);
      
      if (action.type === 'follow-up') {
        const updatedMessages = [...previousMessages, message];
        set(completedMessagesAtom, updatedMessages);
        set(ragAtoms.generateAtom, updatedMessages, rollbackState);
        return;
      } 
      
      if (action.type === 'reretrieve') {
        const updatedMessages = action.preserveHistory ? 
          [...previousMessages, message] : 
          [message];
        
        // Update UI state
        set(workflowModeAtom, 'reretrieve');
        set(completedMessagesAtom, updatedMessages);
        
        // Trigger processing
        set(ragAtoms.retrieveAndGenerateAtom, updatedMessages, undefined, rollbackState);
        return;
      }
      
      toast.error('Unexpected workflow action');
      throw new Error('Unexpected workflow action');
    }

    // Handle default workflow
    const updatedMessages = [...previousMessages, message];
    set(completedMessagesAtom, updatedMessages);

    // Default workflow transitions
    switch (currentMode) {
      case 'init':
      case 'reretrieve':
        set(ragAtoms.retrieveAndGenerateAtom, updatedMessages, undefined, rollbackState);
        break;

      case 'follow-up':
        set(ragAtoms.generateAtom, updatedMessages, rollbackState);
        break;

      default:
        console.warn(`Unexpected workflow mode: ${currentMode}`);
        break;
    }
  }
);

// Generate
export const createGenerateAtom = (generateFn: GenerateSimple | GenerateWithSources) => {
  return atom<null, [GenerateInput, RollbackState?], GenerateResponse>(
    null,
    (_get, set, messages: GenerateInput, rollbackState?: RollbackState): GenerateResponse => {
      set(loadingAtom, true);
      set(errorAtom, null);

      // Add back abort tracking
      let aborted = false;
      const abortController = new AbortController();

      const config = _get(ragConfigAtom);
      let accumulatedContent = '';

      const response = acceptsSources(generateFn)
        ? (generateFn as GenerateWithSources)(messages, _get(retrievedSourcesAtom))
        : (generateFn as GenerateSimple)(messages);

      const processingPromise = (async () => {
        try {
          if (typeof response === 'string' || response instanceof Promise) {
            // Handle Promise<string> response
            const content = await addTimeout(
              response as Promise<string>,
              config.timeouts?.request,
              'Response timeout exceeded',
              abortController.signal
            );
            
            set(currentStreamAtom, { role: 'assistant', content });
            set(completedMessagesAtom, prev => [...prev, { role: 'assistant', content }]);
            set(currentStreamAtom, null);
          } else if (Symbol.asyncIterator in response) {
            const processStream = async () => {
              const streamTimeout = new StreamTimeout(config.timeouts?.stream);
              
              for await (const chunk of response as AsyncIterable<GenerateStreamChunk>) {
                // Add back abort check
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
            };

            await addTimeout(
              processStream(),
              config.timeouts?.request,
              'Stream processing timeout exceeded',
              abortController.signal
            );
          } else {
            throw new Error('Invalid GenerateResponse type');
          }
        } catch (err) {
          // Abort on error
          aborted = true;
          abortController.abort();
          
          // Rollback state
          if (rollbackState) {
            set(workflowModeAtom, rollbackState.workflowMode);
            set(completedMessagesAtom, rollbackState.messages);
            set(retrievedSourcesAtom, rollbackState.sources);
          }
          set(currentStreamAtom, null);
          throw err;
        }
      })();

      // Handle errors and loading state
      processingPromise.catch(err => {
        set(errorAtom, `Generate operation failed: ${err.message}`);
      }).finally(() => {
        set(loadingAtom, false);
      });

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

interface RollbackState {
  messages: Message[];
  workflowMode: WorkflowMode;
  sources: RetrievalResult[];
}

export const createRetrieveAndGenerateAtom = (
  retrieveAndGenerateFn: (query: GenerateInput, metadata?: Record<string, any>) => RetrieveAndGenerateResponse
) => {
  return atom(null, (_get, set, messages: GenerateInput, metadata?: Record<string, any>, rollbackState?: RollbackState) => {
    // Initialize processing state
    set(loadingAtom, true);
    set(errorAtom, null);
    
    // Add abort tracking
    let aborted = false;
    const abortController = new AbortController();
    
    const config = _get(ragConfigAtom);
    let accumulatedContent = '';
    
    const response = retrieveAndGenerateFn(messages, metadata);

    const processingPromise = (async () => {
      try {
        // Handle sources
        if (response.sources) {
          await addTimeout(
            response.sources.then(sources => set(retrievedSourcesAtom, validateRetrievalResults(sources))),
            config.timeouts?.request,
            'Sources request timeout exceeded',
            abortController.signal
          );
        }

        // Handle streaming response
        if (Symbol.asyncIterator in response.response) {
          const processStream = async () => {
            const streamTimeout = new StreamTimeout(config.timeouts?.stream);
            
            for await (const chunk of response.response as AsyncIterable<GenerateStreamChunk>) {
              // Check for abort
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
          };

          await addTimeout(
            processStream(),
            config.timeouts?.request,
            'Stream processing timeout exceeded',
            abortController.signal
          );
          // Success state
          set(workflowModeAtom, 'follow-up');
        } else {
          // Handle Promise<string> response
          const content = await addTimeout(
            response.response as Promise<string>,
            config.timeouts?.request,
            'Response timeout exceeded',
            abortController.signal
          );
          
          set(completedMessagesAtom, prev => [...prev, { role: 'assistant', content }]);
          set(currentStreamAtom, null);
          // Success state
          set(workflowModeAtom, 'follow-up');
        }
      } catch (err) {
        // Abort on error
        aborted = true;
        abortController.abort();

        // Rollback all state on error
        if (rollbackState) {
          set(workflowModeAtom, rollbackState.workflowMode);
          set(completedMessagesAtom, rollbackState.messages);
          set(retrievedSourcesAtom, rollbackState.sources);
        }
        set(currentStreamAtom, null);
        throw err;
      }
    })();

    // Handle errors and loading state
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

export const createGetDataSourceAtom = (getDataSourceFn: (source: SourceReference) => GetDataSourceResponse) => {
  return atom(
    null,
    async (_get, set, retrievalResult: RetrievalResult) => {
      set(loadingAtom, true);
      
      try {
        let response: SourceContent;
        
        // If it's a TextContent, convert it directly to SourceContent
        if ('text' in retrievalResult) {
          response = {
            content: retrievalResult.text,
            metadata: retrievalResult.metadata
          };
        } else {
          // Otherwise, use the getDataSourceFn for SourceReference
          response = await getDataSourceFn(retrievalResult);
        }
        
        // Store the fetched content
        set(currentSourceContentAtom, response);
        return response;
      } finally {
        set(loadingAtom, false);
      }
    }
  );
};


type GenerateAtom = WritableAtom<null, [GenerateInput, RollbackState?], GenerateResponse>;

type RetrieveAndGenerateAtom = WritableAtom<
  null,
  [GenerateInput, Record<string, any>?, RollbackState?],
  RetrieveAndGenerateResponse
>;

type RetrieveSourcesAtom = WritableAtom<
  null,
  [string, Record<string, any>?],
  RetrieveResponse
>;

type GetDataSourceAtom = WritableAtom<
  null,
  [RetrievalResult],
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