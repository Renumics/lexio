import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider, useSetAtom } from 'jotai';

import {
  // New hooks for reading state:
  useRAGMessages,
  useRAGSources,
  useLexioStatus,
  // New hook for dispatching actions:
  useLexio,
} from '../components/RAGProvider/hooks2'; // adjust the path as needed

import {
  // Atoms for registering/unregistering a handler:
  registerActionHandler,
  unregisterActionHandler,
  dispatchAtom,
  // other atoms if needed...
} from '../state/rag-state-v2';

import type {
  Message,
  Source,
  UUID,
  // and any other types you need…
} from '../state/rag-state-v2';

// -------------------------------------------------------------------------
// A helper component to register a fake action handler for tests.
// The handler is registered for component 'RAGProvider2' and will be used
// by dispatchAtom to process user actions.
const TestActionHandler: React.FC<{ handler: any }> = ({ handler, children }) => {
  const setRegister = useSetAtom(registerActionHandler);
  useEffect(() => {
    // Register our handler when mounted
    setRegister(handler);
    return () => {
      // (Optionally) unregister when unmounting.
      // In these tests we assume one handler is registered at a time.
      // You could call setRegister(unregisterActionHandler) if needed.
    };
  }, [handler, setRegister]);
  return <>{children}</>;
};

// A helper to render our hooks wrapped in Jotai Provider and our test handler
function renderRAGTestHooks(handler: any) {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider>
      <TestActionHandler handler={handler}>
        {children}
      </TestActionHandler>
    </Provider>
  );
  return renderHook(() => ({
    messages: useRAGMessages(),
    sources: useRAGSources(),
    status: useLexioStatus(),
    lexio: useLexio('RAGProvider2'),
  }), { wrapper });
}

// Update the advanceTime helper to properly handle Promise resolutions
const advanceTime = async (ms: number) => {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    // Flush all pending microtasks and timers
    await Promise.resolve();
    await vi.runAllTimersAsync();
  });
};

// -------------------------------------------------------------------------
// TEST SUITE
describe('RAG Workflow Tests (Jotai version)', () => {
  describe('Basic Usage Workflow', () => {
    it('should handle initial query with text sources', async () => {
      // Create a fake handler that mimics a response with text source.
      const mockHandler = {
        component: 'RAGProvider2',
        handler: (_action: any, _messages: Message[], _sources: Source[]) => {
          // For an ADD_USER_MESSAGE action we return both a response and sources.
          return {
            sources: Promise.resolve([
              {
                // In a real system these IDs would be generated;
                // here we supply a static ID for testing.
                id: 'text-source-uuid' as UUID,
                title: 'Text Document',
                type: 'text',
                data: 'This is a text source',
                metadata: { title: 'Text Document' },
              },
            ]),
            response: Promise.resolve('Response based on text source'),
          };
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      // Dispatch an ADD_USER_MESSAGE action.
      act(() => {
        result.current.lexio.addUserMessage('test query');
      });

      // Wait until loading becomes false
      await waitFor(() => {
        expect(result.current.status.loading).toBe(false);
      });

      // Check state:
      expect(result.current.status.error).toBe(null);

      // The new state now contains the original user message and the assistant's reply.
      // (In this simple example, we assume the handler appends one message each.)
      expect(result.current.messages.messages).toHaveLength(2);
      // Check that the assistant's response is as expected.
      expect(result.current.messages.messages[1]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: 'Response based on text source',
        })
      );
      // Verify that a text source has been set.
      expect(result.current.sources.sources).toHaveLength(1);
      expect(result.current.sources.sources[0]).toEqual(
        expect.objectContaining({
          type: 'text',
          data: 'This is a text source',
        })
      );
    });

    it('should handle initial query with reference sources (e.g. PDF)', async () => {
      // Fake handler returns a source that is a reference (for example, PDF).
      const mockHandler = {
        component: 'RAGProvider2',
        handler: (_action: any, _messages: Message[], _sources: Source[]) => {
          return {
            sources: Promise.resolve([
              {
                id: 'pdf-source-uuid' as UUID,
                title: 'PDF Document',
                type: 'pdf',
                metadata: { title: 'PDF Document' },
              },
            ]),
            response: Promise.resolve('Response based on PDF source'),
          };
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      act(() => {
        result.current.lexio.addUserMessage('test query');
      });
      await waitFor(() => {
        expect(result.current.status.loading).toBe(false);
      });

      expect(result.current.status.error).toBe(null);
      expect(result.current.sources.sources).toHaveLength(1);
      // We expect the source to be of type pdf.
      expect(result.current.sources.sources[0]).toEqual(
        expect.objectContaining({
          type: 'pdf',
          title: 'PDF Document',
        })
      );
    });
  });

  describe('Follow-up Questions Workflow', () => {
    it('should use generate function for follow-up questions', async () => {
      // For follow-up questions we simulate a two‑step conversation.
      // First, the initial query returns a PDF source.
      const initialSources = [
        {
          id: 'pdf-source-uuid' as UUID,
          title: 'PDF Document',
          type: 'pdf',
          metadata: { title: 'PDF Document' },
        },
      ];
      const mockHandler = {
        component: 'RAGProvider2',
        handler: (action: any, messages: Message[], _sources: Source[]) => {
          if (action.type === 'ADD_USER_MESSAGE') {
            // If this is the very first query, return initial response.
            if (messages.length === 0) {
              return {
                sources: Promise.resolve(initialSources),
                response: Promise.resolve('Initial response'),
              };
            }
            // For follow-up questions, we use the previous conversation.
            return {
              // Here we pass back the same sources.
              response: Promise.resolve('Follow-up response'),
            };
          }
          return {};
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      // Initial query:
      act(() => {
        result.current.lexio.addUserMessage('initial query');
      });
      await waitFor(() => {
        expect(result.current.status.loading).toBe(false);
      });
      expect(result.current.sources.sources).toHaveLength(1);

      // In your app you might set the active source(s) via another action.
      act(() => {
        result.current.lexio.setActiveSources(['pdf-source-uuid']);
      });
      // (For our tests we simply assert that the active source IDs were updated.)
      expect(result.current.sources.activeSourcesIds).toEqual(['pdf-source-uuid']);

      // Follow-up question:
      act(() => {
        result.current.lexio.addUserMessage('follow-up question');
      });
      await waitFor(() => {
        expect(result.current.status.loading).toBe(false);
      });

      // Now the conversation should have four messages:
      // 1. The initial user query,
      // 2. The initial assistant reply,
      // 3. The follow-up user question,
      // 4. The follow-up assistant reply.
      expect(result.current.messages.messages).toHaveLength(4);
      expect(result.current.messages.messages[3]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: 'Follow-up response',
        })
      );
    });
  });

  describe('Streaming Response Tests', () => {
    it('should handle streaming responses with partial updates', async () => {
      // For streaming responses, the fake handler returns an async generator.
      const mockHandler = {
        component: 'RAGProvider2',
        handler: (_action: any, _messages: Message[], _sources: Source[]) => {
          return {
            sources: Promise.resolve([
              {
                id: 'stream-source-uuid' as UUID,
                title: 'Text Doc',
                type: 'text',
                data: 'A text-based source',
                metadata: { title: 'Text Doc' },
              },
            ]),
            response: (async function* () {
              yield { content: 'Partial answer chunk 1...' };
              // Simulate a short delay:
              await new Promise((resolve) => setTimeout(resolve, 50));
              yield { content: 'Partial answer chunk 2...', done: true };
            })(),
          };
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      act(() => {
        result.current.lexio.addUserMessage('Stream test query');
      });

      await waitFor(() => {
        // Wait until loading is false.
        expect(result.current.status.loading).toBe(false);
        expect(result.current.messages.currentStream).toBe(null);
        expect(result.current.messages.messages).toHaveLength(2);
      });

      // The final assistant message should be the concatenation of the two chunks.
      expect(result.current.messages.messages[1]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: 'Partial answer chunk 1...Partial answer chunk 2...',
        })
      );
    });
  });

  describe('Timeout Error Handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle request timeout', async () => {
      const mockHandler = {
        component: 'RAGProvider2',
        handler: () => {
          return {
            sources: new Promise<Source[]>((resolve) => {
              setTimeout(() => {
                resolve([
                  {
                    id: 'timeout-doc-uuid' as UUID,
                    title: 'Example Document',
                    type: 'pdf',
                    metadata: { title: 'Example Document' },
                  },
                ]);
              }, 6000);
            }),
            response: new Promise<string>((resolve) => {
              setTimeout(() => {
                resolve('Response that exceeds request timeout');
              }, 6000);
            }),
          };
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      act(() => {
        result.current.lexio.addUserMessage('test query');
      });

      // Advance time in smaller increments to ensure all promises are handled
      await advanceTime(3000);
      await advanceTime(2500); // This gets us past the 5 second timeout

      // Wait for the state updates to propagate
      await waitFor(() => {
        expect(result.current.status.loading).toBe(false);
        expect(result.current.status.error).toMatch(
          /Response timeout exceeded|Sources request timeout exceeded/
        );
      });
    });

    it('should handle stream timeout', async () => {
      // In this test the fake streaming response has a gap longer than the stream timeout.
      const mockHandler = {
        component: 'RAGProvider2',
        handler: () => {
          return {
            sources: Promise.resolve([
              {
                id: 'timeout-stream-uuid' as UUID,
                title: 'Example Document',
                type: 'pdf',
                metadata: { title: 'Example Document' },
              },
            ]),
            response: (async function* () {
              yield { content: 'Starting analysis... ' };
              await new Promise((resolve) => setTimeout(resolve, 200));
              yield { content: 'Processing content... ' };
              await new Promise((resolve) => setTimeout(resolve, 200));
              // Delay longer than the stream timeout (assume 2000ms):
              yield { content: 'Long gap chunk', done: false };
              await new Promise((resolve) => setTimeout(resolve, 3000));
              yield { content: 'This will never appear', done: true };
            })(),
          };
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      act(() => {
        result.current.lexio.addUserMessage('test query');
      });

      await advanceTime(500); // let initial chunks come in
      await advanceTime(2500); // exceed stream timeout

      expect(result.current.status.loading).toBe(false);
      expect(result.current.status.error).toMatch(/Stream timeout exceeded/);
    });
  });

  describe('Additional Error Handling', () => {
    it('should perform rollback on generation error', async () => {
      // Here we simulate an error in the generation (assistant) response.
      const mockHandler = {
        component: 'RAGProvider2',
        handler: () => {
          return {
            sources: Promise.resolve([]),
            response: Promise.reject(new Error('Generation error')),
          };
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      // Dispatch the action.
      act(() => {
        result.current.lexio.addUserMessage('trigger error');
      });

      await waitFor(() => {
        expect(result.current.status.loading).toBe(false);
      });

      // We expect the error to be set and the state to have been rolled back.
      expect(result.current.status.error).toMatch(/Generation error/);
      // Depending on your rollback implementation, the messages array may remain unchanged.
    });

    it('should perform rollback on retrieval error', async () => {
      // Here we simulate an error in the sources retrieval.
      const mockHandler = {
        component: 'RAGProvider2',
        handler: () => {
          return {
            sources: Promise.reject(new Error('Retrieval error')),
            response: Promise.resolve('Some response'),
          };
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      act(() => {
        result.current.lexio.addUserMessage('trigger retrieval error');
      });

      await waitFor(() => {
        expect(result.current.status.loading).toBe(false);
      });

      expect(result.current.status.error).toMatch(/Retrieval error/);
      // Check that sources were not updated (rolled back).
      expect(result.current.sources.sources).toHaveLength(0);
    });
  });
});
