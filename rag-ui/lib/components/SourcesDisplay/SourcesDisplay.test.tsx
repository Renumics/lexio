import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';  // For DOM matchers like toBeInTheDocument
import { SourcesDisplay } from './SourcesDisplay';
import { RAGProvider } from '../RAGProvider';
import type { RetrieveAndGenerateResponse, Message, SourceReference, GetDataSourceResponse } from '../../types';

interface MockFns {
  retrieveAndGenerate?: (messages: Message[]) => RetrieveAndGenerateResponse;
  generate?: (messages: Message[]) => AsyncGenerator<{ content: string, done: boolean }>;
  getDataSource?: (source: SourceReference) => GetDataSourceResponse;
}

describe('SourcesDisplay Component', () => {
  const createWrapper = (mockFns: MockFns = {}) => {
    return ({ children }: { children: React.ReactNode }) => (
      <RAGProvider
        retrieveAndGenerate={mockFns.retrieveAndGenerate}
        generate={mockFns.generate}
        getDataSource={mockFns.getDataSource}
        config={{
          timeouts: { stream: 1000, request: 5000 }
        }}
      >
        {children}
      </RAGProvider>
    );
  };

  describe('Source Selection', () => {
    it('should display sources and handle selection', async () => {
      const mockGetDataSource = vi.fn(async () => ({
        type: 'pdf',
        content: new Uint8Array([1,2,3]),
        metadata: {}
      }));

      const wrapper = createWrapper({ getDataSource: mockGetDataSource });
      
      render(<SourcesDisplay />, { wrapper });

      // Verify source list is displayed
      const sourceElement = screen.getByText('source1');
      expect(sourceElement).toBeInTheDocument();

      // Test source selection
      fireEvent.click(sourceElement);
      expect(mockGetDataSource).toHaveBeenCalled();
    });

    it('should handle source content loading states', async () => {
      const mockGetDataSource = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          type: 'pdf',
          content: new Uint8Array([1,2,3]),
          metadata: {}
        };
      });

      const wrapper = createWrapper({ getDataSource: mockGetDataSource });
      
      render(<SourcesDisplay />, { wrapper });

      const sourceElement = screen.getByText('source1');
      fireEvent.click(sourceElement);

      // Check loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for content to load
      await screen.findByTestId('source-content');
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Source Search', () => {
    it('should handle source search functionality', async () => {
      const mockRetrieveAndGenerate = vi.fn(() => ({
        sources: Promise.resolve([{ text: 'search result', metadata: {} }]),
        response: Promise.resolve('response')
      }));

      const wrapper = createWrapper({ retrieveAndGenerate: mockRetrieveAndGenerate });
      
      render(<SourcesDisplay />, { wrapper });

      const searchInput = screen.getByPlaceholderText('Search sources...');
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);

      expect(mockRetrieveAndGenerate).toHaveBeenCalledWith([{
        role: 'user',
        content: 'test query'
      }]);

      // Wait for search results
      await screen.findByText('search result');
    });
  });

  describe('Error Handling', () => {
    it('should display error state when source loading fails', async () => {
      const mockGetDataSource = vi.fn(async () => {
        throw new Error('Failed to load source');
      });

      const wrapper = createWrapper({ getDataSource: mockGetDataSource });
      
      render(<SourcesDisplay />, { wrapper });

      const sourceElement = screen.getByText('source1');
      fireEvent.click(sourceElement);

      await screen.findByText('Error: Failed to load source');
    });
  });
}); 