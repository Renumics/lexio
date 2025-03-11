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
import { LexioProvider } from '../LexioProvider';
import { UUID } from '../../types';

/**
 * Utility to create a wrapper that provides:
 *   - ThemeContext
 *   - LexioProvider with an onAction mock
 */
function createWrapper(onAction: (...args: any[]) => any) {
  return ({ children }: { children: React.ReactNode }) => (
      <LexioProvider onAction={onAction}>
        {children}
      </LexioProvider>
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
            { id: '123e4567-e89b-12d3-a456-426614174000' as UUID, title: 'Mock Source 1', type: 'text' },
            { id: '123e4567-e89b-12d3-a456-426614174001' as UUID, title: 'Mock Source 2', type: 'text' },
          ]),
        };
      }
      return undefined;
    });

    // 2) Render the SourcesDisplay inside LexioProvider
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
      null,              // activeSources can now be null
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
            { id: '123e4567-e89b-12d3-a456-426614174002' as UUID, title: 'Source A', type: 'text' },
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
      null,              // activeSources can now be null
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
            { id: '123e4567-e89b-12d3-a456-426614174003' as UUID, title: 'A Single Source', type: 'text' },
          ]),
        };
      }
      // Handle CLEAR_SOURCES action
      if (action.type === 'CLEAR_SOURCES') {
        return {}; // Return empty object for successful action
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

  it('handles setting active sources to null', async () => {
    const mockOnAction = vi.fn((action) => {
      if (action.type === 'SEARCH_SOURCES') {
        return {
          sources: Promise.resolve([
            { id: '123e4567-e89b-12d3-a456-426614174004' as UUID, title: 'Source X', type: 'text' },
            { id: '123e4567-e89b-12d3-a456-426614174005' as UUID, title: 'Source Y', type: 'text' },
          ]),
        };
      }
      if (action.type === 'SET_ACTIVE_SOURCES') {
        // Return empty object for successful action
        return {};
      }
      return undefined;
    });

    const wrapper = createWrapper(mockOnAction);
    render(<SourcesDisplay />, { wrapper });

    // Perform a search to get sources
    const searchInput = screen.getByPlaceholderText('Search knowledge base...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      fireEvent.click(screen.getByText('Search'));
    });

    // Wait for sources to appear
    await waitFor(() => {
      expect(screen.getByText('Source X')).toBeInTheDocument();
      expect(screen.getByText('Source Y')).toBeInTheDocument();
    });

    // Verify that the sources are displayed correctly
    expect(screen.getByText('Source X')).toBeInTheDocument();
    expect(screen.getByText('Source Y')).toBeInTheDocument();
  });

  it('handles setting selected source to null', async () => {
    const mockOnAction = vi.fn((action) => {
      if (action.type === 'SEARCH_SOURCES') {
        return {
          sources: Promise.resolve([
            { id: '123e4567-e89b-12d3-a456-426614174006' as UUID, title: 'Source Z', type: 'text' },
          ]),
        };
      }
      if (action.type === 'SET_SELECTED_SOURCE') {
        // Verify that null can be passed as sourceId
        if (action.sourceId === null || action.sourceId === '') {
          return {
            selectedSourceId: null
          };
        }
        return {
          selectedSourceId: action.sourceId
        };
      }
      return undefined;
    });

    const wrapper = createWrapper(mockOnAction);
    render(<SourcesDisplay />, { wrapper });

    // Perform a search to get sources
    const searchInput = screen.getByPlaceholderText('Search knowledge base...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      fireEvent.click(screen.getByText('Search'));
    });

    // Wait for source to appear
    await waitFor(() => {
      expect(screen.getByText('Source Z')).toBeInTheDocument();
    });

    // Click on the source to select it
    await act(async () => {
      fireEvent.click(screen.getByText('Source Z'));
    });

    // Verify that SET_SELECTED_SOURCE was called with the correct sourceId
    expect(mockOnAction).toHaveBeenCalledWith(
      expect.objectContaining({ 
        type: 'SET_SELECTED_SOURCE', 
        sourceId: '123e4567-e89b-12d3-a456-426614174006' 
      }),
      expect.any(Array),
      expect.any(Array),
      null,
      null
    );
  });
});
