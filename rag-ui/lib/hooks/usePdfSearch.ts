import { useState, useEffect } from 'react';
import { createPdfSearcher } from '../utils/pdf-search';
import type { SearchResult } from '../utils/pdf-search';

export const usePdfSearch = (file: ArrayBuffer | null) => {
  const [searcher, setSearcher] = useState<{ search: (query: string) => SearchResult[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!file) return;

    setIsLoading(true);
    createPdfSearcher(file)
      .then(newSearcher => {
        setSearcher(newSearcher);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setSearcher(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [file]);

  const search = (query: string): SearchResult[] => {
    if (!searcher || !query.trim()) return [];
    return searcher.search(query);
  };

  return {
    search,
    isLoading,
    error,
    isReady: !!searcher
  };
}; 