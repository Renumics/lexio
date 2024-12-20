import { describe, it, expect, vi } from 'vitest';
import { createRetrieveAndGenerateAtom, loadingAtom, errorAtom } from './rag-state';
import { useAtom } from 'jotai';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { GenerateInput, RetrieveAndGenerateResponse, Message } from '../types';

// Mock function with correct types
const mockRetrieveAndGenerateFn = vi.fn((messages: GenerateInput): RetrieveAndGenerateResponse => ({
  sources: Promise.resolve([{ text: 'test source', metadata: {} }]),
  response: Promise.resolve('Generated content')
}));

describe('Atom State Tests', () => {
  it('should handle basic functionality and update atoms', async () => {
    const retrieveAndGenerateAtom = createRetrieveAndGenerateAtom(mockRetrieveAndGenerateFn);
    const { result: retrieveResult } = renderHook(() => useAtom(retrieveAndGenerateAtom));
    const { result: loadingResult } = renderHook(() => useAtom(loadingAtom));
    const { result: errorResult } = renderHook(() => useAtom(errorAtom));

    const testMessages: Message[] = [{ role: 'user', content: 'test query' }];

    let response;
    await act(async () => {
      response = retrieveResult.current[1](testMessages);
      await response.sources;
      await response.response;
    });

    await waitFor(() => {
      expect(loadingResult.current[0]).toBe(false);
    });

    expect(response).toEqual({
      sources: expect.any(Promise),
      response: expect.any(Promise)
    });
    expect(errorResult.current[0]).toBe(null);
  });

  it('should handle errors correctly and update errorAtom', async () => {
    const errorFn = vi.fn((messages: GenerateInput): RetrieveAndGenerateResponse => ({
      sources: Promise.reject(new Error('Test error')),
      response: Promise.reject(new Error('Test error'))
    }));
    
    const retrieveAndGenerateAtom = createRetrieveAndGenerateAtom(errorFn);
    const { result: retrieveResult } = renderHook(() => useAtom(retrieveAndGenerateAtom));
    const { result: errorResult } = renderHook(() => useAtom(errorAtom));

    const testMessages: Message[] = [{ role: 'user', content: 'test query' }];

    await act(async () => {
      const response = retrieveResult.current[1](testMessages);
      await Promise.allSettled([response.sources, response.response]);
    });

    await waitFor(() => {
      expect(errorResult.current[0]).toBe('RAG operation failed: Test error');
    });
  });

  it('should handle timeouts correctly and update errorAtom', async () => {
    vi.useFakeTimers();
    
    const retrieveAndGenerateAtom = createRetrieveAndGenerateAtom((messages: GenerateInput): RetrieveAndGenerateResponse => ({
      sources: new Promise(() => {}),
      response: new Promise(() => {})
    }));

    const { result: retrieveResult } = renderHook(() => useAtom(retrieveAndGenerateAtom));
    const { result: errorResult } = renderHook(() => useAtom(errorAtom));

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
    
    vi.useRealTimers();
  });
});