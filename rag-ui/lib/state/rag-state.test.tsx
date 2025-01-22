import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { 
  Message, 
  RetrievalResult, 
  RetrieveAndGenerateResponse, 
  GetDataSourceResponse,
  GenerateResponse,
  SourceReference,
  PDFSourceContent,
  TextContent,
  RAGConfig
} from '../types';
import React from 'react';
import { RAGProvider } from '../components/RAGProvider';
import { useRAGMessages, useRAGSources, useRAGStatus } from '../components/RAGProvider/hooks';

interface MockProviderProps {
  retrieveAndGenerate?: (messages: Message[], metadata?: Record<string, any>) => RetrieveAndGenerateResponse;
  generate?: (messages: Message[], sources?: RetrievalResult[]) => GenerateResponse;
  getDataSource?: (source: SourceReference) => GetDataSourceResponse;
  retrieve?: (query: string) => Promise<RetrievalResult[]>;
  config?: RAGConfig;
}

// Create mock functions for each provider capability
const createMockRetrieveAndGenerate = () => vi.fn((messages: Message[], metadata?: Record<string, any>): RetrieveAndGenerateResponse => ({
  sources: Promise.resolve([
    {
      text: 'This is a text source',
      metadata: { title: 'Text Document' }
    } as TextContent
  ]),
  response: Promise.resolve('Response based on text source')
}));

const createMockGenerate = () => vi.fn((messages: Message[], sources?: RetrievalResult[]): GenerateResponse => 
  Promise.resolve('Generated response')
);

const createMockGetDataSource = () => vi.fn(async (source: SourceReference): Promise<PDFSourceContent> => ({
  type: 'pdf',
  content: new Uint8Array([1, 2, 3]),
  metadata: { title: 'PDF Document' }
}));

// Helper to advance timers in small increments
const advanceTimersBySmallIncrements = async (totalMs: number, incrementMs = 1000) => {
  const iterations = totalMs / incrementMs;
  for (let i = 0; i < iterations; i++) {
    await act(async () => {
      vi.advanceTimersByTime(incrementMs);
      await vi.runAllTimersAsync();
    });
  }
};

describe('RAG Workflow Tests', () => {
  const createWrapper = (mocks: MockProviderProps = {}) => {
    return ({ children }: { children: React.ReactNode }) => (
      <RAGProvider
        retrieveAndGenerate={mocks.retrieveAndGenerate ?? createMockRetrieveAndGenerate()}
        generate={mocks.generate ?? createMockGenerate()}
        getDataSource={mocks.getDataSource ?? createMockGetDataSource()}
        retrieve={mocks.retrieve}
        config={{
          timeouts: { stream: 1000, request: 5000 }
        }}
      >
        {children}
      </RAGProvider>
    );
  };

  describe('Basic Usage Workflow', () => {
    it('should handle initial query with text sources', async () => {
      const mockRetrieveAndGenerate = createMockRetrieveAndGenerate();
      const wrapper = createWrapper({ retrieveAndGenerate: mockRetrieveAndGenerate });
      
      const { result } = renderHook(
        () => ({
          messagesHook: useRAGMessages(),
          sourcesHook: useRAGSources(),
          statusHook: useRAGStatus()
        }), 
        { wrapper }
      );

      let response;
      await act(async () => {
        response = await result.current.messagesHook.addMessage({
          role: 'user',
          content: 'test query'
        });
        // Wait for the response to complete
        if (response) {
          await response.sources;
          await response.response;
        }
      });

      // Wait for all state updates to complete
      await waitFor(() => {
        expect(result.current.statusHook.loading).toBe(false);
        expect(result.current.statusHook.workflowMode).toBe('follow-up');
        expect(result.current.messagesHook.messages).toHaveLength(2);
        expect(result.current.sourcesHook.sources).toHaveLength(1);
        expect('text' in result.current.sourcesHook.sources[0]).toBe(true);
      });

      expect(result.current.statusHook.error).toBe(null);
      expect(mockRetrieveAndGenerate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: 'test query'
          })
        ]),
        undefined
      );
    });

    it('should handle initial query with reference sources', async () => {
      const mockRetrieveAndGenerate = vi.fn((): RetrieveAndGenerateResponse => ({
        sources: Promise.resolve([
          {
            sourceReference: 'example.pdf',
            type: 'pdf' as const,
            metadata: { title: 'PDF Document' }
          } as SourceReference
        ]),
        response: Promise.resolve('Response based on PDF source')
      }));

      const mockGetDataSource = createMockGetDataSource();
      const wrapper = createWrapper({ 
        retrieveAndGenerate: mockRetrieveAndGenerate,
        getDataSource: mockGetDataSource
      });
      
      const { result } = renderHook(
        () => ({
          messagesHook: useRAGMessages(),
          sourcesHook: useRAGSources(),
          statusHook: useRAGStatus()
        }), 
        { wrapper }
      );

      let response;
      await act(async () => {
        response = await result.current.messagesHook.addMessage({
          role: 'user',
          content: 'test query'
        });
        if (response) {
          await response.sources;
          await response.response;
        }
      });

      await waitFor(() => {
        expect(result.current.statusHook.loading).toBe(false);
        expect(result.current.sourcesHook.sources).toHaveLength(1);
        expect('sourceReference' in result.current.sourcesHook.sources[0]).toBe(true);
      });

      const source = result.current.sourcesHook.sources[0] as SourceReference;
      expect(source.sourceReference).toBe('example.pdf');
    });
  });

  describe('Follow-up Questions Workflow', () => {
    it('should use generate function for follow-up questions', async () => {
      const initialSources = [{
        sourceReference: 'example.pdf',
        type: 'pdf' as const,
        metadata: { title: 'PDF Document' }
      } as SourceReference];

      const mockGenerate = vi.fn((messages: Message[], sources?: RetrievalResult[]): GenerateResponse => 
        Promise.resolve('Follow-up response')
      );
      const mockRetrieveAndGenerate = vi.fn(() => ({
        sources: Promise.resolve(initialSources),
        response: Promise.resolve('Initial response')
      }));

      const wrapper = createWrapper({ 
        retrieveAndGenerate: mockRetrieveAndGenerate,
        generate: mockGenerate
      });
      
      const { result } = renderHook(
        () => ({
          messagesHook: useRAGMessages(),
          sourcesHook: useRAGSources(),
          statusHook: useRAGStatus()
        }), 
        { wrapper }
      );

      // Initial query
      let response;
      await act(async () => {
        response = await result.current.messagesHook.addMessage({
          role: 'user',
          content: 'initial query'
        });
        if (response) {
          await response.sources;
          await response.response;
        }
      });

      await waitFor(() => {
        expect(result.current.statusHook.loading).toBe(false);
        expect(result.current.sourcesHook.sources).toHaveLength(1);
      });

      // Set current sources and wait for them to be set
      await act(async () => {
        result.current.sourcesHook.setCurrentSourceIndices([0]);
      });

      await waitFor(() => {
        expect(result.current.sourcesHook.currentSourceIndices).toEqual([0]);
      });

      // Follow-up question
      await act(async () => {
        await result.current.messagesHook.addMessage({
          role: 'user',
          content: 'follow-up question'
        });
      });

      await waitFor(() => {
        expect(result.current.statusHook.loading).toBe(false);
        expect(result.current.messagesHook.messages).toHaveLength(4);
      });

      // Check the generate call
      expect(mockGenerate).toHaveBeenCalledWith(
        [
          { role: 'user', content: 'initial query' },
          { role: 'assistant', content: 'Initial response' },
          { role: 'user', content: 'follow-up question' }
        ],
        initialSources
      );
    });
  });

  describe('Source Management', () => {
    it('should handle source content loading for different types', async () => {
      const mockGetDataSource = vi.fn()
        .mockImplementationOnce(async () => ({
          type: 'pdf' as const,
          content: new Uint8Array([1, 2, 3]),
          metadata: { title: 'PDF Document' }
        }));

      const mockRetrieveAndGenerate = vi.fn((): RetrieveAndGenerateResponse => ({
        sources: Promise.resolve([
          {
            sourceReference: 'example.pdf',
            type: 'pdf' as const,
            metadata: { title: 'PDF Document' }
          } as SourceReference
        ]),
        response: Promise.resolve('Response based on PDF source')
      }));

      const wrapper = createWrapper({ 
        getDataSource: mockGetDataSource,
        retrieveAndGenerate: mockRetrieveAndGenerate 
      });
      
      const { result } = renderHook(
        () => ({
          messagesHook: useRAGMessages(),
          sourcesHook: useRAGSources(),
          statusHook: useRAGStatus()
        }), 
        { wrapper }
      );

      // Add message to trigger source retrieval
      await act(async () => {
        result.current.messagesHook.addMessage({
          role: 'user',
          content: 'test query'
        });
      });

      // Wait for sources to be loaded and loading state to finish
      await waitFor(() => {
        expect(result.current.statusHook.loading).toBe(false);
        expect(result.current.sourcesHook.sources).toHaveLength(1);
      });

      // Now set active source index
      await act(async () => {
        result.current.sourcesHook.setActiveSourceIndex(0);
      });

      // Wait for the source content to be loaded
      await waitFor(() => {
        expect(result.current.statusHook.loading).toBe(false);
        const content = result.current.sourcesHook.currentSourceContent;
        expect(content).toBeTruthy();
        expect(content?.type).toBe('pdf');
      }, { timeout: 2000 }); // Increase timeout for source loading

      // Verify the mock was called correctly
      expect(mockGetDataSource).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceReference: 'example.pdf',
          type: 'pdf'
        })
      );
    });

    it('should handle source search with metadata', async () => {
      const mockRetrieve = vi.fn((query: string) => Promise.resolve([
        { 
          text: 'result 1',
          metadata: { score: 0.9, category: 'docs' }
        },
        {
          text: 'result 2',
          metadata: { score: 0.8, category: 'code' }
        }
      ]));

      const wrapper = createWrapper({ 
        retrieve: mockRetrieve // Use retrieve instead of retrieveAndGenerate for source search
      });
      
      const { result } = renderHook(() => useRAGSources(), { wrapper });

      await act(async () => {
        await result.current.retrieveSources('test search', { category: 'docs' });
      });

      await waitFor(() => {
        expect(result.current.sources).toHaveLength(2);
      });

      expect(mockRetrieve).toHaveBeenCalledWith('test search', { category: 'docs' });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle request timeout', async () => {
      const mockRetrieveAndGenerate = vi.fn((): RetrieveAndGenerateResponse => ({
        sources: new Promise<RetrievalResult[]>((resolve) => {
          setTimeout(() => {
            resolve([{
              sourceReference: "example-doc.pdf",
              type: "pdf" as const,
              metadata: { title: "Example Document" }
            }]);
          }, 6000); // Will timeout after 5s (request timeout)
        }),
        response: new Promise((resolve) => {
          setTimeout(() => {
            resolve("This response won't be shown due to request timeout");
          }, 6000);
        })
      }));

      const wrapper = createWrapper({ 
        retrieveAndGenerate: mockRetrieveAndGenerate,
        config: {
          timeouts: {
            stream: 2000,   // 2 seconds between stream chunks
            request: 5000   // 5 seconds for the entire request
          }
        }
      });
      
      const { result } = renderHook(
        () => ({
          messagesHook: useRAGMessages(),
          statusHook: useRAGStatus()
        }), 
        { wrapper }
      );

      // Add message and start timeout
      await act(async () => {
        result.current.messagesHook.addMessage({
          role: 'user',
          content: 'test query'
        });
      });

      // Advance time to trigger timeout
      await advanceTimersBySmallIncrements(5500); // Just past the request timeout

      // Check error state
      expect(result.current.statusHook.loading).toBe(false);
      expect(result.current.statusHook.error).toBe('Response processing failed: Response timeout exceeded');
    });

    it('should handle stream timeout', async () => {
      const mockRetrieveAndGenerate = vi.fn(() => ({
        sources: Promise.resolve([{
          sourceReference: "example-doc.pdf",
          type: "pdf" as const,
          metadata: { title: "Example Document" }
        }]),
        response: (async function* () {
          yield { content: "Starting analysis... " };
          await new Promise(resolve => setTimeout(resolve, 200));
          
          yield { content: "Processing content... " };
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Simulate a processing hang (3s > 2s timeout)
          yield { content: "\n\nProcessing additional details..." };
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          yield { content: "This content will never appear due to stream timeout" };
        })()
      }));

      const wrapper = createWrapper({ 
        retrieveAndGenerate: mockRetrieveAndGenerate,
        config: {
          timeouts: {
            stream: 2000,   // 2 seconds between stream chunks
            request: 5000   // 5 seconds for the entire request
          }
        }
      });
      
      const { result } = renderHook(
        () => ({
          messagesHook: useRAGMessages(),
          statusHook: useRAGStatus()
        }), 
        { wrapper }
      );

      // Add message and start stream
      await act(async () => {
        result.current.messagesHook.addMessage({
          role: 'user',
          content: 'test query'
        });
      });

      // Advance time to get first chunks
      await advanceTimersBySmallIncrements(500);

      // Advance time to trigger stream timeout
      await advanceTimersBySmallIncrements(2500); // Past the stream timeout

      // Check error state
      expect(result.current.statusHook.loading).toBe(false);
      expect(result.current.statusHook.error).toBe('Response processing failed: Stream timeout exceeded');
    });
  });
});