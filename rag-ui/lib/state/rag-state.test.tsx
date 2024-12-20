import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRetrieveAndGenerateAtom, loadingAtom, errorAtom, workflowModeAtom, completedMessagesAtom, currentStreamAtom } from './rag-state';
import { useAtom } from 'jotai';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import type { GenerateInput, RetrieveAndGenerateResponse, Message, GenerateStreamChunk } from '../types';
import React from 'react';

// Mock functions
const mockPromiseBasedFn = vi.fn((messages: GenerateInput): RetrieveAndGenerateResponse => ({
  sources: Promise.resolve([{ text: 'test source', metadata: {} }]),
  response: Promise.resolve('Generated content')
}));

const mockStreamingFn = vi.fn((messages: GenerateInput): RetrieveAndGenerateResponse => ({
  sources: Promise.resolve([{ text: 'test source', metadata: {} }]),
  response: (async function* () {
    yield { content: 'Part 1', done: false };
    yield { content: ' Part 2', done: true };
  })()
}));

describe('Atom State Tests', () => {
  let store: ReturnType<typeof createStore>;
  let wrapper: React.FC<{ children: React.ReactNode }>;
  
  beforeEach(() => {
    store = createStore();
    wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );
  });

  it('should handle Promise-based response correctly', async () => {
    const retrieveAndGenerateAtom = createRetrieveAndGenerateAtom(mockPromiseBasedFn);
    const { result: retrieveResult } = renderHook(() => useAtom(retrieveAndGenerateAtom), { wrapper });
    const { result: loadingResult } = renderHook(() => useAtom(loadingAtom), { wrapper });
    const { result: errorResult } = renderHook(() => useAtom(errorAtom), { wrapper });
    const { result: workflowResult } = renderHook(() => useAtom(workflowModeAtom), { wrapper });
    const { result: messagesResult } = renderHook(() => useAtom(completedMessagesAtom), { wrapper });

    const testMessages: Message[] = [{ role: 'user', content: 'test query' }];

    let response;
    await act(async () => {
      response = retrieveResult.current[1](testMessages);
      await response.sources;
      await response.response;
    });

    await waitFor(() => {
      expect(loadingResult.current[0]).toBe(false);
      expect(workflowResult.current[0]).toBe('follow-up');
      expect(messagesResult.current[0]).toContainEqual({
        role: 'assistant',
        content: 'Generated content'
      });
    });

    expect(errorResult.current[0]).toBe(null);
  });

  it('should handle streaming response correctly', async () => {
    const retrieveAndGenerateAtom = createRetrieveAndGenerateAtom(mockStreamingFn);
    const { result: retrieveResult } = renderHook(() => useAtom(retrieveAndGenerateAtom), { wrapper });
    const { result: loadingResult } = renderHook(() => useAtom(loadingAtom), { wrapper });
    const { result: errorResult } = renderHook(() => useAtom(errorAtom), { wrapper });
    const { result: workflowResult } = renderHook(() => useAtom(workflowModeAtom), { wrapper });
    const { result: streamResult } = renderHook(() => useAtom(currentStreamAtom), { wrapper });
    const { result: messagesResult } = renderHook(() => useAtom(completedMessagesAtom), { wrapper });

    const testMessages: Message[] = [{ role: 'user', content: 'test query' }];

    // Just call the atom with the messages
    await act(async () => {
      retrieveResult.current[1](testMessages);
    });

    // Wait for all state updates to complete
    await waitFor(() => {
      const messages = messagesResult.current[0];
      expect(messages).toContainEqual({
        role: 'assistant',
        content: 'Part 1 Part 2'
      });
      expect(loadingResult.current[0]).toBe(false);
      expect(workflowResult.current[0]).toBe('follow-up');
      expect(streamResult.current[0]).toBe(null);
    });

    expect(errorResult.current[0]).toBe(null);
});

  it('should handle errors correctly and update errorAtom', async () => {
    const errorFn = vi.fn((messages: GenerateInput): RetrieveAndGenerateResponse => ({
      sources: Promise.reject(new Error('Test error')),
      response: Promise.reject(new Error('Test error'))
    }));
    
    const retrieveAndGenerateAtom = createRetrieveAndGenerateAtom(errorFn);
    const { result: retrieveResult } = renderHook(() => useAtom(retrieveAndGenerateAtom), { wrapper });
    const { result: errorResult } = renderHook(() => useAtom(errorAtom), { wrapper });
    const { result: workflowResult } = renderHook(() => useAtom(workflowModeAtom), { wrapper });

    const testMessages: Message[] = [{ role: 'user', content: 'test query' }];

    await act(async () => {
      const response = retrieveResult.current[1](testMessages);
      await Promise.allSettled([response.sources, response.response]);
    });

    await waitFor(() => {
      expect(errorResult.current[0]).toBe('RAG operation failed: Test error');
      // Workflow mode should not change on error
      expect(workflowResult.current[0]).toBe('init');
    });
  });

  it('should handle timeouts correctly and update errorAtom', async () => {
    vi.useFakeTimers();
    
    const retrieveAndGenerateAtom = createRetrieveAndGenerateAtom((messages: GenerateInput): RetrieveAndGenerateResponse => ({
      sources: new Promise(() => {}),
      response: new Promise(() => {})
    }));

    const { result: retrieveResult } = renderHook(() => useAtom(retrieveAndGenerateAtom), { wrapper });
    const { result: errorResult } = renderHook(() => useAtom(errorAtom), { wrapper });
    const { result: workflowResult } = renderHook(() => useAtom(workflowModeAtom), { wrapper });

    const testMessages: Message[] = [{ role: 'user', content: 'test query' }];

    await act(async () => {
      retrieveResult.current[1](testMessages);
    });

    // Advance time and run timers in small increments
    for (let i = 0; i < 31; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await vi.runAllTimersAsync();
      });
    }

    // Check final state
    expect(errorResult.current[0]).toBe('RAG operation failed: Sources request timeout exceeded');
    // Workflow mode should not change on timeout
    expect(workflowResult.current[0]).toBe('init');
    
    vi.useRealTimers();
  });
});