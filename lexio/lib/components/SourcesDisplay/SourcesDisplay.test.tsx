// todo: create new for new-api
// import React, { act } from 'react';
// import {
//   render,
//   fireEvent,
//   screen,
//   waitFor,
// } from '@testing-library/react';
// import { describe, it, expect, vi } from 'vitest';
// import '@testing-library/jest-dom'; // for DOM matchers like toBeInTheDocument
//
// import { SourcesDisplay } from './SourcesDisplay';
// import { RAGProvider } from '../RAGProvider';
// import type {
//   SourceReference,
//   GetDataSourceResponse,
//   RAGConfig,
//   RetrievalResult,
// } from '../../types';
//
// /**
//  * Mock interfaces for RAGProvider props
//  */
// interface MockFns {
//   retrieve?: (query: string, metadata?: Record<string, any>) => Promise<RetrievalResult[]>;
//   getDataSource?: (source: SourceReference) => GetDataSourceResponse;
//   // We can add other mocks if needed
// }
//
// /**
//  * Utility to create the RAGProvider test wrapper
//  */
// function createWrapper(mockFns: MockFns = {}, config?: Partial<RAGConfig['timeouts']>) {
//   return ({ children }: { children: React.ReactNode }) => (
//     <RAGProvider
//       retrieve={mockFns.retrieve}
//       getDataSource={mockFns.getDataSource}
//       config={{
//         timeouts: {
//           stream: 1000,
//           request: 5000,
//           ...(config ?? {}),
//         },
//       }}
//     >
//       {children}
//     </RAGProvider>
//   );
// }
//
// describe('SourcesDisplay Component', () => {
//     describe('Source Selection', () => {
//       it('should display sources after a search and handle selection', async () => {
//         const mockRetrieve = vi.fn(async () => [
//           { text: 'source1', metadata: {} },
//           { text: 'source2', metadata: {} },
//         ]);
//
//         const wrapper = createWrapper({ retrieve: mockRetrieve });
//         render(<SourcesDisplay />, { wrapper });
//
//         expect(screen.getByText('No sources available')).toBeInTheDocument();
//
//         const searchInput = screen.getByPlaceholderText('Search sources...');
//         await act(async () => {
//           fireEvent.change(searchInput, {
//             target: { value: 'some query' },
//           });
//           fireEvent.click(screen.getByText('Search'));
//         });
//
//         expect(mockRetrieve).toHaveBeenCalledWith('some query', undefined);
//         await waitFor(() => {
//           expect(screen.getByText('source1')).toBeInTheDocument();
//         });
//
//         await act(async () => {
//           fireEvent.click(screen.getByText('source1'));
//         });
//       });
//     });
//
//     describe('Source Search', () => {
//       it('should handle source search functionality', async () => {
//         const mockRetrieve = vi.fn(async (query: string) => {
//           return [
//             { text: `search result for "${query}"`, metadata: {} },
//           ];
//         });
//
//         const wrapper = createWrapper({ retrieve: mockRetrieve });
//         render(<SourcesDisplay />, { wrapper });
//
//         const searchInput = screen.getByPlaceholderText('Search sources...');
//         await act(async () => {
//           fireEvent.change(searchInput, { target: { value: 'test query' } });
//           fireEvent.click(screen.getByText('Search'));
//         });
//
//         expect(mockRetrieve).toHaveBeenCalledWith('test query', undefined);
//         await waitFor(() => {
//           expect(screen.getByText('search result for "test query"')).toBeInTheDocument();
//         });
//       });
//
//       it('should trigger search on Enter key press', async () => {
//         const mockRetrieve = vi.fn(async () => [
//           { text: 'source1', metadata: {} },
//         ]);
//
//         const wrapper = createWrapper({ retrieve: mockRetrieve });
//         render(<SourcesDisplay />, { wrapper });
//
//         const searchInput = screen.getByPlaceholderText('Search sources...');
//         await act(async () => {
//           fireEvent.change(searchInput, { target: { value: 'test query' } });
//           fireEvent.keyDown(searchInput, { key: 'Enter' });
//         });
//
//         expect(mockRetrieve).toHaveBeenCalledWith('test query', undefined);
//       });
//     });
//   });