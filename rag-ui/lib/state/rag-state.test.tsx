import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

import {
  RAGProvider
} from '../components/RAGProvider';

import {
  useRAGMessages,
  useRAGSources,
  useRAGStatus,
} from '../components/RAGProvider/hooks';

import type {
  Message,
  RetrievalResult,
  RetrieveAndGenerateResponse,
  GetDataSourceResponse,
  GenerateResponse,
  SourceReference,
  PDFSourceContent,
  TextContent,
  RAGConfig,
} from '../types';

interface MockProviderProps {
  retrieveAndGenerate?: (messages: Message[], metadata?: Record<string, any>) => RetrieveAndGenerateResponse;
  generate?: (messages: Message[], sources?: RetrievalResult[]) => GenerateResponse;
  getDataSource?: (source: SourceReference) => GetDataSourceResponse;
  retrieve?: (query: string, metadata?: Record<string, any>) => Promise<RetrievalResult[]>;
  config?: RAGConfig;
}

/**
 * --- MOCK CREATORS ---
 */
const createMockRetrieveAndGenerate = () =>
  vi.fn(
    (_messages: Message[], _metadata?: Record<string, any>): RetrieveAndGenerateResponse => ({
      sources: Promise.resolve([
        {
          text: 'This is a text source',
          metadata: { title: 'Text Document' },
        } as TextContent,
      ]),
      response: Promise.resolve('Response based on text source'),
    })
  );

const createMockGenerate = () =>
  vi.fn(
    (_messages: Message[], _sources?: RetrievalResult[]): GenerateResponse =>
      Promise.resolve('Generated response')
  );

const createMockGetDataSource = () =>
  vi.fn(async (_source: SourceReference): Promise<PDFSourceContent> => ({
    type: 'pdf',
    content: new Uint8Array([1, 2, 3]),
    metadata: { title: 'PDF Document' },
  }));

/**
 * Helper to advance Jest timers. This simulates the passage of real time
 * in an environment using fake timers.
 */
const advanceTime = async (ms: number) => {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await vi.runAllTimersAsync();
  });
};

/**
 * --- HOOK TEST RENDERER ---
 * Utility to reduce duplication across tests.
 */
function renderRAGHooks(
  mocks: MockProviderProps = {},
  timeouts?: Partial<RAGConfig['timeouts']>
) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RAGProvider
      retrieveAndGenerate={mocks.retrieveAndGenerate ?? createMockRetrieveAndGenerate()}
      generate={mocks.generate ?? createMockGenerate()}
      getDataSource={mocks.getDataSource ?? createMockGetDataSource()}
      retrieve={mocks.retrieve}
      config={{
        timeouts: {
          stream: 1000,
          request: 5000,
          ...(timeouts ?? {}),
        },
      }}
    >
      {children}
    </RAGProvider>
  );

  const { result } = renderHook(
    () => ({
      messages: useRAGMessages(),
      sources: useRAGSources(),
      status: useRAGStatus(),
    }),
    { wrapper }
  );

  /**
   * Helper to add a user message and automatically wait
   * for any returned promises (like `response` and `sources`) to resolve.
   */
  async function addUserMessage(content: string) {
    await act(async () => {
      const response = result.current.messages.addMessage({
        role: 'user',
        content,
      });
      if (response && typeof response === 'object' && 'sources' in response && 'response' in response) {
        await response.sources;
        await response.response;
      }
    });
  }

  /**
   * Helper to wait until loading is set to `false`.
   */
  async function waitUntilNotLoading() {
    await waitFor(() => {
      expect(result.current.status.loading).toBe(false);
    });
  }

  return {
    result,
    addUserMessage,
    waitUntilNotLoading,
  };
}

/**
 * --- TEST SUITE ---
 */
describe('RAG Workflow Tests', () => {
  describe('Basic Usage Workflow', () => {
    it('should handle initial query with text sources', async () => {
      const mockRetrieveAndGenerate = createMockRetrieveAndGenerate();
      const { result, addUserMessage, waitUntilNotLoading } = renderRAGHooks({
        retrieveAndGenerate: mockRetrieveAndGenerate,
      });

      await addUserMessage('test query');
      await waitUntilNotLoading();

      // Assertions
      expect(result.current.status.error).toBe(null);
      expect(result.current.status.workflowMode).toBe('follow-up');
      expect(result.current.messages.messages).toHaveLength(2);
      expect(result.current.sources.sources).toHaveLength(1);
      expect('text' in result.current.sources.sources[0]).toBe(true);
      expect(mockRetrieveAndGenerate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'test query' }),
        ]),
        undefined
      );
    });

    it('should handle initial query with reference sources', async () => {
      // Mock that returns a PDF reference instead of text
      const mockRetrieveAndGenerate = vi.fn(
        (): RetrieveAndGenerateResponse => ({
          sources: Promise.resolve([
            {
              sourceReference: 'example.pdf',
              type: 'pdf' as const,
              metadata: { title: 'PDF Document' },
            } as SourceReference,
          ]),
          response: Promise.resolve('Response based on PDF source'),
        })
      );

      const mockGetDataSource = createMockGetDataSource();
      const { result, addUserMessage, waitUntilNotLoading } = renderRAGHooks({
        retrieveAndGenerate: mockRetrieveAndGenerate,
        getDataSource: mockGetDataSource,
      });

      await addUserMessage('test query');
      await waitUntilNotLoading();

      // Assertions
      expect(result.current.status.error).toBe(null);
      expect(result.current.sources.sources).toHaveLength(1);
      expect('sourceReference' in result.current.sources.sources[0]).toBe(true);

      const source = result.current.sources.sources[0] as SourceReference;
      expect(source.sourceReference).toBe('example.pdf');
    });
  });

  describe('Follow-up Questions Workflow', () => {
    it('should use generate function for follow-up questions', async () => {
      const initialSources = [
        {
          sourceReference: 'example.pdf',
          type: 'pdf' as const,
          metadata: { title: 'PDF Document' },
        } as SourceReference,
      ];

      const mockGenerate = vi.fn(
        (_messages: Message[], _sources?: RetrievalResult[]): GenerateResponse => {
          return Promise.resolve('Follow-up response');
        }
      );
      const mockRetrieveAndGenerate = vi.fn(() => ({
        sources: Promise.resolve(initialSources),
        response: Promise.resolve('Initial response'),
      }));

      const { result, addUserMessage, waitUntilNotLoading } = renderRAGHooks({
        retrieveAndGenerate: mockRetrieveAndGenerate,
        generate: mockGenerate,
      });

      // Initial query
      await addUserMessage('initial query');
      await waitUntilNotLoading();
      expect(result.current.sources.sources).toHaveLength(1);

      // Set current sources
      await act(async () => {
        result.current.sources.setCurrentSourceIndices([0]);
      });
      expect(result.current.sources.currentSourceIndices).toEqual([0]);

      // Follow-up question
      await addUserMessage('follow-up question');
      await waitUntilNotLoading();

      expect(result.current.messages.messages).toHaveLength(4);

      // Check the generate call arguments
      expect(mockGenerate).toHaveBeenCalledWith(
        [
          { role: 'user', content: 'initial query' },
          { role: 'assistant', content: 'Initial response' },
          { role: 'user', content: 'follow-up question' },
        ],
        initialSources
      );
    });
  });

  describe('Source Management', () => {
    it('should handle source content loading for different types', async () => {
      const mockGetDataSource = vi
        .fn()
        .mockImplementationOnce(async () => ({
          type: 'pdf' as const,
          content: new Uint8Array([1, 2, 3]),
          metadata: { title: 'PDF Document' },
        }));

      const mockRetrieveAndGenerate = vi.fn(
        (): RetrieveAndGenerateResponse => ({
          sources: Promise.resolve([
            {
              sourceReference: 'example.pdf',
              type: 'pdf' as const,
              metadata: { title: 'PDF Document' },
            } as SourceReference,
          ]),
          response: Promise.resolve('Response based on PDF source'),
        })
      );

      const { result, addUserMessage, waitUntilNotLoading } = renderRAGHooks({
        getDataSource: mockGetDataSource,
        retrieveAndGenerate: mockRetrieveAndGenerate,
      });

      // Add message to trigger retrieving sources
      await addUserMessage('test query');
      await waitUntilNotLoading();
      expect(result.current.sources.sources).toHaveLength(1);

      // Set active source index
      await act(async () => {
        result.current.sources.setActiveSourceIndex(0);
      });

      // Wait for the source content to be loaded
      await waitFor(() => {
        expect(result.current.status.loading).toBe(false);
        const content = result.current.sources.currentSourceContent;
        expect(content).toBeTruthy();
        expect(content?.type).toBe('pdf');
      });

      // Verify the mock was called
      expect(mockGetDataSource).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceReference: 'example.pdf',
          type: 'pdf',
        })
      );
    });

    it('should handle source search with metadata', async () => {
      const mockRetrieve = vi.fn((_query: string, _metadata?: Record<string, any>) =>
        Promise.resolve([
          {
            text: 'result 1',
            metadata: { score: 0.9, category: 'docs' },
          },
          {
            text: 'result 2',
            metadata: { score: 0.8, category: 'code' },
          },
        ])
      );

      const { result } = renderRAGHooks({ retrieve: mockRetrieve });

      await act(async () => {
        await result.current.sources.retrieveSources('test search', { category: 'docs' });
      });

      expect(result.current.sources.sources).toHaveLength(2);
      expect(mockRetrieve).toHaveBeenCalledWith('test search', { category: 'docs' });
    });
  });

  describe('Streaming Response Tests', () => {
    it('should handle streaming responses with partial updates', async () => {
      const mockRetrieveAndGenerate = vi.fn(() => ({
        sources: Promise.resolve([
          { text: 'A text-based source', metadata: { title: 'Text Doc' } },
        ]),
        response: (async function* () {
          yield { content: 'Partial answer chunk 1...' };
          await new Promise((resolve) => setTimeout(resolve, 50));
          yield { content: 'Partial answer chunk 2...', done: true };
        })(),
      }));

      const { result, addUserMessage, waitUntilNotLoading } = renderRAGHooks({
        retrieveAndGenerate: mockRetrieveAndGenerate,
      });

      await addUserMessage('Stream test query');

      // Wait for streaming to complete
      await waitUntilNotLoading();

      // Check final state
      expect(result.current.messages.messages).toHaveLength(2);
      expect(result.current.messages.messages[1]).toEqual({
        role: 'assistant',
        content: 'Partial answer chunk 1...Partial answer chunk 2...',
      });
      expect(result.current.messages.currentStream).toBe(null);
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
      const mockRetrieveAndGenerate = vi.fn((): RetrieveAndGenerateResponse => ({
        sources: new Promise<RetrievalResult[]>((resolve) => {
          // 6 seconds -> longer than 5s request timeout
          setTimeout(() => {
            resolve([
              {
                sourceReference: 'example-doc.pdf',
                type: 'pdf' as const,
                metadata: { title: 'Example Document' },
              },
            ]);
          }, 6000);
        }),
        response: new Promise((resolve) => {
          setTimeout(() => {
            resolve('Response that exceeds request timeout');
          }, 6000);
        }),
      }));

      const { result, addUserMessage } = renderRAGHooks(
        {
          retrieveAndGenerate: mockRetrieveAndGenerate,
        },
        {
          // Override the default request timeout to 5s
          stream: 2000,
          request: 5000,
        }
      );

      await addUserMessage('test query');

      // Advance time past 5 seconds
      await advanceTime(5500);

      expect(result.current.status.loading).toBe(false);
      expect(result.current.status.error).toBe(
        'Response processing failed: Response timeout exceeded'
      );
    });

    it('should handle stream timeout', async () => {
      const mockRetrieveAndGenerate = vi.fn(() => ({
        sources: Promise.resolve([
          {
            sourceReference: 'example-doc.pdf',
            type: 'pdf' as const,
            metadata: { title: 'Example Document' },
          },
        ]),
        response: (async function* () {
          yield { content: 'Starting analysis... ' };
          await new Promise((resolve) => setTimeout(resolve, 200));

          yield { content: 'Processing content... ' };
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Simulate a long gap (3s) -> exceeds 2s stream timeout
          yield { content: '\n\nProcessing additional details...' };
          await new Promise((resolve) => setTimeout(resolve, 3000));

          yield { content: 'This will never appear because of the timeout' };
        })(),
      }));

      const { result, addUserMessage } = renderRAGHooks(
        {
          retrieveAndGenerate: mockRetrieveAndGenerate,
        },
        {
          stream: 2000,
          request: 5000,
        }
      );

      // Add message -> begin streaming
      await addUserMessage('test query');

      // Let the first chunk or two happen
      await advanceTime(500);

      // Then advance past stream timeout
      await advanceTime(2500);

      expect(result.current.status.loading).toBe(false);
      expect(result.current.status.error).toBe(
        'Response processing failed: Stream timeout exceeded'
      );
    });
  });
  describe('Additional Error Handling', () => {
    it('should perform rollback on generation error', async () => {
     
    });
    it('should perform rollback on retrieval error', async () => {
     
    });
  });

});
