import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import { SourcesDisplay } from './SourcesDisplay';
import { RAGProvider } from '../RAGProvider';

/**
 * Utility to create a wrapper that provides:
 *   - ThemeContext
 *   - RAGProvider with an onAction mock
 */
function createWrapper(onAction: (...args: any[]) => any) {
  return ({ children }: { children: React.ReactNode }) => (
      <RAGProvider onAction={onAction}>
        {children}
      </RAGProvider>
  );
}

describe('SourcesDisplay (with onAction-based SEARCH_SOURCES)', () => {
  it('shows "No sources available" initially, then displays sources after searching', async () => {
    // 1) Our mock onAction returns a list of sources for SEARCH_SOURCES
    const mockOnAction = vi.fn((action) => {
      if (action.type === 'SEARCH_SOURCES') {
        return {
          // The store will update with these sources after the promise resolves
          sources: Promise.resolve([
            { id: 'source1-id', title: 'Mock Source 1', type: 'text' },
            { id: 'source2-id', title: 'Mock Source 2', type: 'text' },
          ]),
        };
      }
      return undefined;
    });

    // 2) Render the SourcesDisplay inside RAGProvider
    const wrapper = createWrapper(mockOnAction);
    render(<SourcesDisplay />, { wrapper });

    // Initially, we expect "No sources available"
    expect(screen.getByText('No sources available')).toBeInTheDocument();

    // Type into the search input and click "Search"
    const searchInput = screen.getByPlaceholderText('Search knowledge base...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'some query' } });
      fireEvent.click(screen.getByText('Search'));
    });

    // Check that an action { type: 'SEARCH_SOURCES', query: 'some query' } was dispatched
    expect(mockOnAction).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SEARCH_SOURCES', query: 'some query' }),
      expect.any(Array), // messages
      expect.any(Array), // sources
      expect.any(Array), // activeSources
      null               // selectedSource on first usage is typically null
    );

    // Wait for the new mock sources to be displayed
    await waitFor(() => {
      expect(screen.getByText('Mock Source 1')).toBeInTheDocument();
      expect(screen.getByText('Mock Source 2')).toBeInTheDocument();
    });
  });

  it('should trigger search on Enter key press', async () => {
    const mockOnAction = vi.fn((action) => {
      if (action.type === 'SEARCH_SOURCES') {
        return {
          sources: Promise.resolve([
            { id: 'sourceA', title: 'Source A', type: 'text' },
          ]),
        };
      }
      return undefined;
    });

    const wrapper = createWrapper(mockOnAction);
    render(<SourcesDisplay />, { wrapper });

    const searchInput = screen.getByPlaceholderText('Search knowledge base...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'enter query' } });
      fireEvent.keyDown(searchInput, { key: 'Enter' });
    });

    // Confirm "SEARCH_SOURCES" was dispatched
    expect(mockOnAction).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SEARCH_SOURCES', query: 'enter query' }),
      expect.any(Array),
      expect.any(Array),
      expect.any(Array),
      null
    );
  });

  it('disables Clear button when no sources exist', () => {
    const mockOnAction = vi.fn();
    const wrapper = createWrapper(mockOnAction);
    render(<SourcesDisplay />, { wrapper });

    // Because the store is empty, button says "No sources to clear"
    const clearButton = screen.getByRole('button', { name: /No sources to clear/i });
    expect(clearButton).toBeDisabled();
  });

  it('enables Clear button after a search, and clears sources when clicked', async () => {
    const mockOnAction = vi.fn((action) => {
      if (action.type === 'SEARCH_SOURCES') {
        // Return a single source
        return {
          sources: Promise.resolve([
            { id: 'source1', title: 'A Single Source', type: 'text' },
          ]),
        };
      }
      return undefined;
    });

    const wrapper = createWrapper(mockOnAction);
    render(<SourcesDisplay />, { wrapper });

    // Perform a search to get 1 source
    const searchInput = screen.getByPlaceholderText('Search knowledge base...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      fireEvent.click(screen.getByText('Search'));
    });

    // Wait for that source to appear
    await waitFor(() => {
      expect(screen.getByText('A Single Source')).toBeInTheDocument();
    });

    // Now the clear button should read "Clear all sources" and be enabled
    const clearButton = screen.getByRole('button', { name: /Clear all sources/i });
    expect(clearButton).not.toBeDisabled();

    // Click the clear button
    await act(async () => {
      fireEvent.click(clearButton);
    });

    // The store is cleared, so "No sources available" should reappear
    await waitFor(() => {
      expect(screen.getByText('No sources available')).toBeInTheDocument();
    });
  });
});
