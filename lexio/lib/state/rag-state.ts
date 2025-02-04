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
      set(errorAtom, 'RAG operation already in progress');
      return;
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

    // Check available atoms for workflow management
    const hasGenerateAtom = ragAtoms.generateAtom !== null;
    const hasRetrieveAndGenerateAtom = ragAtoms.retrieveAndGenerateAtom !== null;

    // Check if we have any generation capability
    if (!hasRetrieveAndGenerateAtom && !hasGenerateAtom) {
      toast.error('No generation capability available');
      throw new Error('No generation capability available');
    }

    // Prepare rollback state
    const rollbackState = {
      messages: previousMessages,
      workflowMode: currentMode,
      sources: currentSources
    };

    try {
      // Handle custom workflow actions if provided
      if (onAddMessage) {
        const action = onAddMessage(message, previousMessages);
        const updatedMessages = action.type === 'reretrieve' && !action.preserveHistory ?
          [message] :
          [...previousMessages, message];

        set(completedMessagesAtom, updatedMessages);

        if (action.type === 'reretrieve') {
          if (!hasRetrieveAndGenerateAtom) {
            toast.error('Retrieval and generation not available');
            throw new Error('Retrieval and generation not available');
          }
          set(workflowModeAtom, 'reretrieve');
          set(ragAtoms.retrieveAndGenerateAtom!, updatedMessages, undefined);
          return;
        }

        if (action.type === 'follow-up') {
          if (hasGenerateAtom && currentMode === 'follow-up') {
            await set(ragAtoms.generateAtom!, updatedMessages);
            return;
          }
          // Fall back to retrieveAndGenerate if not in follow-up mode or generate not available
          if (hasRetrieveAndGenerateAtom) {
            set(ragAtoms.retrieveAndGenerateAtom!, updatedMessages, undefined);
            if (hasGenerateAtom) {
              set(workflowModeAtom, 'follow-up');
            }
            return;
          }
          toast.error('No generation capability available');
          throw new Error('No generation capability available');
        }

        toast.error('Unexpected workflow action');
        throw new Error('Unexpected workflow action');
      }

      // Handle default workflow
      const updatedMessages = [...previousMessages, message];
      set(completedMessagesAtom, updatedMessages);

      // If retrieveAndGenerate is available, always use it in init/reretrieve mode
      if (hasRetrieveAndGenerateAtom && (currentMode === 'init' || currentMode === 'reretrieve')) {
        set(ragAtoms.retrieveAndGenerateAtom!, updatedMessages, undefined);
        // Switch to follow-up mode if generate is available, otherwise stay in reretrieve
        if (hasGenerateAtom) {
          set(workflowModeAtom, 'follow-up');
        } else {
          set(workflowModeAtom, 'reretrieve');
        }
        return;
      }

      // Use generate for follow-up if available
      if (hasGenerateAtom && currentMode === 'follow-up') {
        set(ragAtoms.generateAtom!, updatedMessages);
        return;
      }

      // If we only have retrieveAndGenerate, use it for everything and stay in reretrieve mode
      if (hasRetrieveAndGenerateAtom) {
        set(ragAtoms.retrieveAndGenerateAtom!, updatedMessages, undefined);
        set(workflowModeAtom, 'reretrieve');
        return;
      }

    } catch (err) {
      console.error("Error in addMessageAtom", err);
      // On failure, rollback state
      set(workflowModeAtom, rollbackState.workflowMode);
      set(completedMessagesAtom, rollbackState.messages);
      set(retrievedSourcesAtom, rollbackState.sources);
      throw err;
    }
  }
);

/**
 * Creates an atom that handles the generation process.
 * This atom manages response generation with proper error handling and state management.
 * Supports both streaming and non-streaming responses, with optional source context.
 */
export const createGenerateAtom = (generateFn: GenerateSimple | GenerateWithSources) => {
  return atom<null, [GenerateInput], GenerateResponse>(
    null,
    (_get, set, messages: GenerateInput): GenerateResponse => {
      // Initialize state and control variables
      set(loadingAtom, true);
      set(errorAtom, null);
      
      let aborted = false;
      const abortController = new AbortController();
      const config = _get(ragConfigAtom);
      let accumulatedContent = '';

      // Get response from the provided function, including sources if supported
      const response = acceptsSources(generateFn)
        ? (generateFn as GenerateWithSources)(
            messages, 
            _get(currentSourcesAtom).length > 0 ? _get(currentSourcesAtom) : _get(retrievedSourcesAtom)
          )
        : (generateFn as GenerateSimple)(messages);

      /**
       * Response Processing
       * Handles different types of responses (string, Promise, or Stream)
       * Updates UI state as content becomes available.
       */
      const processingPromise = (async () => {
        try {
          if (typeof response === 'string' || response instanceof Promise) {
            // Handle direct string or Promise<string> response
            const content = await addTimeout(
              response as Promise<string>,
              config.timeouts?.request,
              'Response timeout exceeded',
              abortController.signal
            );
            
            // Update message history with complete response
            set(currentStreamAtom, { role: 'assistant', content });
            set(completedMessagesAtom, prev => [...prev, { role: 'assistant', content }]);
            set(currentStreamAtom, null);
          } else if (Symbol.asyncIterator in response) {
            // Handle streaming response
            const processStream = async () => {
              const streamTimeout = new StreamTimeout(config.timeouts?.stream);
              
              for await (const chunk of response as AsyncIterable<GenerateStreamChunk>) {
                if (aborted || abortController.signal.aborted) {
                  break;
                }

                // Check for chunk timeout and update content
                streamTimeout.check();
                accumulatedContent += chunk.content;
                
                // Update UI with current stream
                set(currentStreamAtom, {
                  role: 'assistant',
                  content: accumulatedContent
                });

                if (chunk.done) {
                  // On completion, update message history
                  set(completedMessagesAtom, prev => [...prev, {
                    role: 'assistant',
                    content: accumulatedContent
                  }]);
                  set(currentStreamAtom, null);
                }
              }
            };

            // Add overall timeout for stream processing
            await addTimeout(
              processStream(),
              config.timeouts?.request,
              'Stream processing timeout exceeded',
              abortController.signal
            );
          } else {
            throw new Error('Invalid GenerateResponse type');
          }
        } catch (error) {
          aborted = true;
          abortController.abort();
          set(currentStreamAtom, null);
          throw error;
        }
      })();

      /**
       * Completion Tracking
       * Manages loading state and error handling for the operation
       */
      processingPromise.catch(error => {
        set(errorAtom, `Generate operation failed: ${error instanceof Error ? error.message : String(error)}`);
        set(currentStreamAtom, null);
      }).finally(() => {
        set(loadingAtom, false);
      });

      return response;
    }
  );
};

// Retrieve sources
export const retrievedSourcesAtom = atom<RetrievalResult[]>([]);
export const currentSourceIndicesAtom = atom<number[]>([]);

// Derive current sources from the selected indices
export const currentSourcesAtom = atom((get) => {
  const sources = get(retrievedSourcesAtom);
  const indices = get(currentSourceIndicesAtom);

  if (indices.length === 0) {
    return [];
  }

  // Filter and sort indices to ensure they're valid and in order
  const validIndices = indices
    .filter(index => index >= 0 && index < sources.length)
    .sort((a, b) => a - b);

  // Return current sources in order
  return validIndices.map(index => sources[index]);
});

// Update setter atom to handle multiple indices
export const setCurrentSourceIndicesAtom = atom(
  null,
  (_get, set, indices: number[]) => {
    set(currentSourceIndicesAtom, indices);
  }
);


export const createRetrieveSourcesAtom = (retrieveFn: (query: string, metadata?: Record<string, any>) => Promise<RetrievalResult[]>) => {
  return atom(
    null,
    async (_get, set, query: string, metadata?: Record<string, any>) => {
      set(loadingAtom, true);
      try {
        const sources = await retrieveFn(query, metadata);
        set(retrievedSourcesAtom, sources);
        set(currentSourceIndicesAtom, []); // Reset active source indices
        set(activeSourceIndexAtom, null);  // Reset active source index
        return sources;
      } finally {
        set(loadingAtom, false);
      }
    }
  );
};

export const retrieveSourcesAtom = atom(
  null,
  async (_get, set, query: string, metadata?: Record<string, any>) => {
    // Validate processing state
    if (_get(loadingAtom)) {
      toast.error('RAG operation already in progress');
      throw new Error('RAG operation already in progress');
    }

    // Get current state
    const ragAtoms = _get(ragAtomsAtom);
    const currentSources = _get(retrievedSourcesAtom);
    const currentMode = _get(workflowModeAtom);

    if (!ragAtoms) {
      throw new Error('RAG atoms not initialized');
    }

    if (!ragAtoms.retrieveSourcesAtom) {
      throw new Error('Retrieve sources not available');
    }

    // Prepare rollback state
    const rollbackState = {
      workflowMode: currentMode,
      sources: currentSources
    };

    try {
      // Trigger the retrieve operation
      const retrieveSourcesAtom = ragAtoms.retrieveSourcesAtom as RetrieveSourcesAtom;
      const sources = await set(retrieveSourcesAtom, query, metadata);
      set(workflowModeAtom, 'follow-up');
      return sources;
    } catch (err: any) {
      // Rollback state on error
      set(workflowModeAtom, rollbackState.workflowMode);
      set(retrievedSourcesAtom, rollbackState.sources);
      set(errorAtom, `Retrieve sources operation failed: ${err.message}`);
      throw err;
    }
  }
);

/**
 * Creates an atom that handles the RAG (Retrieval-Augmented Generation) process.
 * This atom manages both source retrieval and response generation independently
 * while maintaining proper error handling and state management.
 */
export const createRetrieveAndGenerateAtom = (
  retrieveAndGenerateFn: (query: GenerateInput, metadata?: Record<string, any>) => RetrieveAndGenerateResponse
) => {
  return atom(null, (_get, set, messages: GenerateInput, metadata?: Record<string, any>): RetrieveAndGenerateResponse => {
    // Initialize state and control variables
    set(loadingAtom, true);
    set(errorAtom, null);
    
    let aborted = false;
    const abortController = new AbortController();
    const config = _get(ragConfigAtom);
    let accumulatedContent = '';

    // Get the response object from the provided function
    // This contains potentially both sources and response promises
    const response = retrieveAndGenerateFn(messages, metadata);

    /**
     * Source Processing
     * Handles the retrieval and validation of sources independently.
     * Updates UI state as soon as sources are available.
     */
    const wrappedSources = response.sources && addTimeout(
      response.sources.then(sources => {
        if (!aborted) {
          // Update UI with validated sources
          const validatedSources = validateRetrievalResults(sources);
          set(retrievedSourcesAtom, validatedSources);
          set(currentSourceIndicesAtom, []);
          set(activeSourceIndexAtom, null);
        }
        return sources;
      }),
      config.timeouts?.request,
      'Sources request timeout exceeded',
      abortController.signal
    );

    /**
     * Response Processing
     * Handles the generation response independently from sources.
     * Supports both streaming and non-streaming responses.
     * Updates UI state as content becomes available.
     */
    const wrappedResponse = (async () => {
      try {
        if (Symbol.asyncIterator in response.response) {
          // Handle streaming response
          const processStream = async () => {
            const streamTimeout = new StreamTimeout(config.timeouts?.stream);
            
            for await (const chunk of response.response as AsyncIterable<GenerateStreamChunk>) {
              if (aborted || abortController.signal.aborted) {
                break;
              }

              // Check for chunk timeout and update content
              streamTimeout.check();
              accumulatedContent += chunk.content;
              
              // Update UI with current stream
              set(currentStreamAtom, { 
                role: 'assistant', 
                content: accumulatedContent 
              });
              
              if (chunk.done) {
                // On completion, update message history
                set(completedMessagesAtom, prev => [...prev, { 
                  role: 'assistant', 
                  content: accumulatedContent 
                }]);
                set(currentStreamAtom, null);
              }
            }
            return accumulatedContent;
          };

          // Add overall timeout for stream processing
          await addTimeout(
            processStream(),
            config.timeouts?.request,
            'Stream processing timeout exceeded',
            abortController.signal
          );
          return accumulatedContent;
        } else {
          // Handle non-streaming response
          const content = await addTimeout(
            response.response as Promise<string>,
            config.timeouts?.request,
            'Response timeout exceeded',
            abortController.signal
          );
          
          // Update message history with complete response
          set(completedMessagesAtom, prev => [...prev, { 
            role: 'assistant', 
            content 
          }]);
          set(currentStreamAtom, null);
          return content;
        }
      } catch (error) {
        aborted = true;
        abortController.abort();
        set(currentStreamAtom, null);
        set(loadingAtom, false);
        set(errorAtom, `Response processing failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    })();

    /**
     * Completion Tracking
     * Manages loading state and error handling for both operations.
     * Loading state is only cleared when both operations complete or on error
     */
    let responseComplete = false;
    let sourcesComplete = !wrappedSources; // If no sources, mark as complete
    let hasError = false;

    // Handle sources completion
    if (wrappedSources) {
      wrappedSources.catch(error => {
        hasError = true;
        set(errorAtom, `Sources processing failed: ${error instanceof Error ? error.message : String(error)}`);
        set(loadingAtom, false); // Reset loading state on error
      }).finally(() => {
        sourcesComplete = true;
        if (responseComplete && !hasError) {
          set(loadingAtom, false);
        }
      });
    }

    // Handle response completion
    wrappedResponse.catch(error => {
      hasError = true;
      set(errorAtom, `Response processing failed: ${error instanceof Error ? error.message : String(error)}`);
      set(loadingAtom, false); // Reset loading state on error
    }).finally(() => {
      responseComplete = true;
      if (sourcesComplete && !hasError) {
        set(loadingAtom, false);
      }
    });

    // Return wrapped promises while maintaining the original interface
    return {
      sources: wrappedSources,
      response: wrappedResponse
    };
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

  constructor(private timeout?: number) { }

  check() {
    if (!this.timeout) return;

    const now = Date.now();
    if (now - this.lastCheck > this.timeout) {
      throw new Error('Stream timeout exceeded');
    }
    this.lastCheck = now;
  }
}

export const createGetDataSourceAtom = (getDataSourceFn: ((source: SourceReference) => GetDataSourceResponse) | null) => {
  return atom<null, [RetrievalResult], Promise<SourceContent>>(
    null,
    (_get, set, retrievalResult: RetrievalResult): Promise<SourceContent> => {
      set(loadingAtom, true);
      set(errorAtom, null);
      
      try {
        // Handle text content directly
        if ('text' in retrievalResult) {
          const response: SourceContent = {
            content: retrievalResult.text,
            metadata: retrievalResult.metadata,
            type: 'markdown'
          };
          set(currentSourceContentAtom, response);
          set(loadingAtom, false);
          return Promise.resolve(response);
        }

        // If no getDataSourceFn is provided, throw an error for source references
        if (!getDataSourceFn) {
          const error = new Error('Source content retrieval is not configured. Only text sources are supported.');
          set(errorAtom, error.message);
          set(loadingAtom, false);
          return Promise.reject(error);
        }

        // For SourceReference, use the getDataSourceFn
        return getDataSourceFn(retrievalResult)
          .then(response => {
            // Set page number for PDFSourceContent if not provided
            if (response.type && response.type === 'pdf' && !response.page) {
              // Set page number from metadata if available
              if (retrievalResult.metadata && retrievalResult.metadata?.page && typeof retrievalResult.metadata?.page === 'number') {
                response.page = retrievalResult.metadata.page;
              }
            }
            set(currentSourceContentAtom, response);
            return response;
          })
          .finally(() => {
            set(loadingAtom, false);
          });
      } catch (err) {
        set(errorAtom, `Failed to fetch source content: ${err instanceof Error ? err.message : String(err)}`);
        set(loadingAtom, false);
        return Promise.reject(err);
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
  [RetrievalResult],
  GetDataSourceResponse
>;

// Container for all RAG atoms. This is necessary since the atoms are created dynamically but need to be referenced form other atoms
interface RAGAtoms {
  generateAtom: GenerateAtom | null;
  retrieveAndGenerateAtom: RetrieveAndGenerateAtom | null;
  retrieveSourcesAtom: RetrieveSourcesAtom | null;
  getDataSourceAtom: GetDataSourceAtom | null;
}

export const ragAtomsAtom = atom<RAGAtoms | null>(null);
