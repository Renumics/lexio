import { useCallback, useRef } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import Fuse from 'fuse.js';

export interface SearchMatch {
    text: string;
    pageNum: number;
    // Add rect when implementing highlight positioning
}

export function usePDFSearch(document: PDFDocumentProxy | null) {
    // Cache extracted text content per page
    const pageTextCache = useRef<Map<number, string>>(new Map());
    // Cache search results per page and search term
    const searchCache = useRef<Map<string, SearchMatch[]>>(new Map());
    
    // Extract text from a single page
    const extractPageText = useCallback(async (pageNum: number): Promise<string> => {
        if (!document) return '';
        
        // Return cached text if available
        const cachedText = pageTextCache.current.get(pageNum);
        if (cachedText) return cachedText;

        try {
            const page = await document.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            
            pageTextCache.current.set(pageNum, pageText);
            return pageText;
        } catch (error) {
            console.error(`Failed to extract text from page ${pageNum}:`, error);
            return '';
        }
    }, [document]);

    // Search text in a specific page
    const searchPage = useCallback(async (searchText: string, pageNum: number): Promise<SearchMatch[]> => {
        if (!searchText.trim()) return [];
        
        const cacheKey = `${pageNum}-${searchText}`;
        const cachedResults = searchCache.current.get(cacheKey);
        if (cachedResults) return cachedResults;

        const pageText = await extractPageText(pageNum);
        if (!pageText) return [];

        const fuse = new Fuse([pageText], {
            threshold: 0.3,
            minMatchCharLength: 2
        });

        const results = fuse.search(searchText);
        const matches = results.map(result => ({
            text: searchText,
            pageNum
        }));

        searchCache.current.set(cacheKey, matches);
        return matches;
    }, [extractPageText]);

    // Clear caches
    const clearCache = useCallback(() => {
        pageTextCache.current.clear();
        searchCache.current.clear();
    }, []);

    return {
        searchPage,
        clearCache
    };
}