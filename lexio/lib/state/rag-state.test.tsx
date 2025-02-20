import React, { useEffect } from 'react';
import { describe, it, expect } from 'vitest'; // Removed beforeEach, afterEach
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider, useSetAtom } from 'jotai';

import { registerActionHandler } from './rag-state'; // Removed unregisterActionHandler
import type { Message, Source, UUID } from '../types'; // Import from ../types (or wherever these types actually live)

// --- NEW HOOKS (adjust import path as needed) ---
import {
  useRAGMessages,
  useRAGSources,
  useLexio,
  useLexioStatus,
} from '../hooks'; // <- Replace with your correct hooks path

// -------------------------------------------------------------------------
// A helper component to register a fake action handler for tests.
interface TestActionHandlerProps {
  handler: any;
  children?: React.ReactNode;
}

const TestActionHandler: React.FC<TestActionHandlerProps> = ({
  handler,
  children,
}) => {
  const setRegister = useSetAtom(registerActionHandler);

  useEffect(() => {
    // Register our handler when mounted
    setRegister(handler);
    // Optionally unregister when unmounting
    return () => {
      // ...
    };
  }, [handler, setRegister]);

  return <>{children}</>;
};

// A helper to render our hooks wrapped in Jotai's <Provider> plus the test handler
function renderRAGTestHooks(handler: any) {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider>
      <TestActionHandler handler={handler}>{children}</TestActionHandler>
    </Provider>
  );

  return renderHook(
    () => {
      const ragMessages = useRAGMessages();
      const ragSources = useRAGSources();
      const ragStatus = useLexioStatus();
      const lexio = useLexio('RAGProvider');
      return { ragMessages, ragSources, ragStatus, lexio };
    },
    { wrapper }
  );
}

// -------------------------------------------------------------------------
// TEST SUITE
describe('RAG Workflow Tests (Jotai version, new hooks)', () => {
  describe('Basic Usage Workflow', () => {
    it('should handle initial query with text sources', async () => {
      const mockHandler = {
        component: 'RAGProvider',
        handler: (_action: any, _messages: Message[], _sources: Source[]) => {
          // For an ADD_USER_MESSAGE action, return both response + sources
          return {
            sources: Promise.resolve([
              {
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

      // 1) Dispatch action to add user message
      act(() => {
        result.current.lexio.addUserMessage('test query');
      });

      // 2) Wait for final state: we expect 2 messages (user + assistant)
      //    and a single text source
      await waitFor(() => {
        expect(result.current.ragMessages.messages).toHaveLength(2);
      });

      // Check for no errors
      expect(result.current.ragStatus.error).toBe(null);

      // The second message should be assistant's
      expect(result.current.ragMessages.messages[1]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: 'Response based on text source',
        })
      );

      // Verify that a text source has been added
      expect(result.current.ragSources.sources).toHaveLength(1);
      expect(result.current.ragSources.sources[0]).toEqual(
        expect.objectContaining({
          type: 'text',
          data: 'This is a text source',
        })
      );
    });

    it('should handle initial query with a PDF (reference) source', async () => {
      const mockHandler = {
        component: 'RAGProvider',
        handler: (_action: any) => {
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

      // Wait until messages appear
      await waitFor(() => {
        expect(result.current.ragMessages.messages).toHaveLength(2);
      });

      // Ensure no error
      expect(result.current.ragStatus.error).toBe(null);

      // Source is of type PDF
      expect(result.current.ragSources.sources).toHaveLength(1);
      expect(result.current.ragSources.sources[0]).toEqual(
        expect.objectContaining({
          type: 'pdf',
          title: 'PDF Document',
        })
      );
    });
  });

  describe('Follow-up Questions Workflow', () => {
    it('should handle a two-step conversation with follow-up questions', async () => {
      const mockHandler = {
        component: 'RAGProvider',
        handler: (action: any, messages: Message[]) => {
          if (action.type === 'ADD_USER_MESSAGE') {
            // If no prior messages, treat it as the first query
            if (messages.length === 0) {
              return {
                response: Promise.resolve('Initial response'),
              };
            }
            // Otherwise, a follow-up
            return {
              response: Promise.resolve('Follow-up response'),
            };
          }
          return {};
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      // 1) Initial query
      act(() => {
        result.current.lexio.addUserMessage('initial query');
      });
      await waitFor(() => {
        expect(result.current.ragMessages.messages).toHaveLength(2);
      });

      // 2) Follow-up question
      act(() => {
        result.current.lexio.addUserMessage('follow-up question');
      });

      // Wait for 4 total messages (2 from first round + 2 from second round)
      await waitFor(() => {
        expect(result.current.ragMessages.messages).toHaveLength(4);
      });

      // The last message should be assistant's "Follow-up response"
      expect(
        result.current.ragMessages.messages[
          result.current.ragMessages.messages.length - 1
        ]
      ).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: 'Follow-up response',
        })
      );
    });
  });

  describe('Additional Error Handling', () => {
    it('should perform rollback on generation error', async () => {
      const mockHandler = {
        component: 'RAGProvider',
        handler: () => {
          return {
            sources: Promise.resolve([]),
            response: Promise.reject(new Error('Generation error')),
          };
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      act(() => {
        result.current.lexio.addUserMessage('trigger error');
      });

      // Wait for the error to appear
      await waitFor(() => {
        expect(result.current.ragStatus.error).toMatch(/Generation error/);
      });

      // After rollback, confirm messages or sources are left in a consistent state
      // (e.g., no new assistant message was appended)
      expect(result.current.ragMessages.messages).toHaveLength(0);
      expect(result.current.ragSources.sources).toHaveLength(0);
    });

    it('should perform rollback on retrieval error', async () => {
      const mockHandler = {
        component: 'RAGProvider',
        handler: () => {
          return {
            // This will fail
            sources: Promise.reject(new Error('Retrieval error')),
            // But we do have a valid response
            response: Promise.resolve('Some response'),
          };
        },
      };

      const { result } = renderRAGTestHooks(mockHandler);

      act(() => {
        result.current.lexio.addUserMessage('trigger retrieval error');
      });

      // Wait for the error
      await waitFor(() => {
        expect(result.current.ragStatus.error).toMatch(/Retrieval error/);
      });

      // Check that no sources were persisted
      expect(result.current.ragSources.sources).toHaveLength(0);

      // The user message might still show up, but the assistant's response is rolled back
      expect(result.current.ragMessages.messages).toHaveLength(0);
    });
  });
});
