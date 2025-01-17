import { atom, PrimitiveAtom, WritableAtom } from 'jotai'
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
      if (ragAtoms?.getDataSourceAtom && sources[index] && isGetDataSourceAtom(ragAtoms.getDataSourceAtom)) {
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

    // Check available atoms for workflow management
    const hasGenerateAtom = isGenerateAtom(ragAtoms.generateAtom);
    const hasRetrieveAndGenerateAtom = isRetrieveAndGenerateAtom(ragAtoms.retrieveAndGenerateAtom);

    console.log("hasRetrieveAndGenerateAtom", hasRetrieveAndGenerateAtom);

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
          const retrieveAndGenerateAtom = ragAtoms.retrieveAndGenerateAtom as RetrieveAndGenerateAtom;
          await set(retrieveAndGenerateAtom, updatedMessages, undefined,);
          return;
        }

        if (action.type === 'follow-up') {
          if (hasGenerateAtom && currentMode === 'follow-up') {
            const generateAtom = ragAtoms.generateAtom as GenerateAtom;
            await set(generateAtom, updatedMessages);
            return;
          }
          // Fall back to retrieveAndGenerate if not in follow-up mode or generate not available
          if (hasRetrieveAndGenerateAtom) {
            const retrieveAndGenerateAtom = ragAtoms.retrieveAndGenerateAtom as RetrieveAndGenerateAtom;
            await set(retrieveAndGenerateAtom, updatedMessages, undefined);
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
        const retrieveAndGenerateAtom = ragAtoms.retrieveAndGenerateAtom as RetrieveAndGenerateAtom;
        await set(retrieveAndGenerateAtom, updatedMessages, undefined);
        // Switch to follow-up mode if generate is available
        if (hasGenerateAtom) {
          set(workflowModeAtom, 'follow-up');
        }
        return;
      }

      // Use generate for follow-up if available
      if (hasGenerateAtom && currentMode === 'follow-up') {
        const generateAtom = ragAtoms.generateAtom as GenerateAtom;
        await set(generateAtom, updatedMessages);
        return;
      }

      // If we only have retrieveAndGenerate, use it for everything
      if (hasRetrieveAndGenerateAtom) {
        const retrieveAndGenerateAtom = ragAtoms.retrieveAndGenerateAtom as RetrieveAndGenerateAtom;
        await set(retrieveAndGenerateAtom, updatedMessages, undefined);
        return;
      }

    } catch (err) {
      // On failure, rollback state
      set(workflowModeAtom, rollbackState.workflowMode);
      set(completedMessagesAtom, rollbackState.messages);
      set(retrievedSourcesAtom, rollbackState.sources);
      throw err;
    }
  }
);

// Generate
export const createGenerateAtom = (generateFn: GenerateSimple | GenerateWithSources) => {
  return atom<null, [GenerateInput], GenerateResponse>(
    null,
    (_get, set, messages: GenerateInput): GenerateResponse => {
      set(loadingAtom, true);
      set(errorAtom, null);

      let aborted = false;
      const abortController = new AbortController();
      const config = _get(ragConfigAtom);
      let accumulatedContent = '';

      const response = acceptsSources(generateFn)
        ? (generateFn as GenerateWithSources)(messages, _get(currentSourcesAtom))
        : (generateFn as GenerateSimple)(messages);

      const processingPromise = (async () => {
        try {
          if (typeof response === 'string' || response instanceof Promise) {
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
          aborted = true;
          abortController.abort();
          set(currentStreamAtom, null);
          throw err;
        }
      })();

      processingPromise.catch(err => {
        set(errorAtom, `Generate operation failed: ${err.message}`);
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
        set(workflowModeAtom, 'follow-up');
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

    if (!isRetrieveSourcesAtom(ragAtoms.retrieveSourcesAtom)) {
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

// Retrieve and generate

interface RollbackState {
  messages: Message[];
  workflowMode: WorkflowMode;
  sources: RetrievalResult[];
}

export const createRetrieveAndGenerateAtom = (
  retrieveAndGenerateFn: (query: GenerateInput, metadata?: Record<string, any>) => RetrieveAndGenerateResponse
) => {
  return atom(null, (_get, set, messages: GenerateInput, metadata?: Record<string, any>) => {
    // Initialize processing state
    set(loadingAtom, true);
    set(errorAtom, null);

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
            response.sources.then(sources => {
              set(retrievedSourcesAtom, validateRetrievalResults(sources));
              set(currentSourceIndicesAtom, []);
              set(activeSourceIndexAtom, null);
            }),
            config.timeouts?.request,
            'Sources request timeout exceeded',
            abortController.signal
          );
        }

        // Handle response
        if (typeof response.response === 'string' || response.response instanceof Promise) {
          const content = await addTimeout(
            Promise.resolve(response.response),
            config.timeouts?.request,
            'Response timeout exceeded',
            abortController.signal
          );

          set(completedMessagesAtom, prev => [...prev, { role: 'assistant', content }]);
          set(currentStreamAtom, null);
        } else if (Symbol.asyncIterator in response.response) {
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
        }
      } catch (err) {
        aborted = true;
        abortController.abort();
        set(currentStreamAtom, null);
        throw err;
      }
    })();

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
            metadata: retrievalResult.metadata,
            type: 'html'
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

type NullAtom = PrimitiveAtom<null>;

const isGetDataSourceAtom = (atom: NullAtom | GetDataSourceAtom): atom is GetDataSourceAtom => {
  return 'write' in atom && atom.write.length === 3; // WritableAtom with 3 parameters (get, set, value)
};

const isGenerateAtom = (
  atom: NullAtom | GenerateAtom
): atom is WritableAtom<null, [Message[], RollbackState?], GenerateResponse> => {
  return 'write' in atom && atom.write.length === 4;
};

const isRetrieveAndGenerateAtom = (
  atom: NullAtom | RetrieveAndGenerateAtom
): atom is RetrieveAndGenerateAtom => {
  console.log("atom.write", atom.write);
  console.log("atom.write length", atom.write.length);
  return 'write' in atom && atom.write.length === 4;
};

const isRetrieveSourcesAtom = (
  atom: NullAtom | RetrieveSourcesAtom
): atom is WritableAtom<null, [string, Record<string, any>?], RetrieveResponse> => {
  return 'write' in atom && atom.write.length === 3;
};

// Container for all RAG atoms. This is necessary since the atoms are created dynamically but need to be referenced form other atoms
interface RAGAtoms {
  generateAtom: GenerateAtom | NullAtom;
  retrieveAndGenerateAtom: RetrieveAndGenerateAtom | NullAtom;
  retrieveSourcesAtom: RetrieveSourcesAtom | NullAtom;
  getDataSourceAtom: GetDataSourceAtom | NullAtom;
}

export const ragAtomsAtom = atom<RAGAtoms | null>(null);
