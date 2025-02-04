import { useCallback, useMemo } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import Fuse from 'fuse.js';

export interface SearchMatch {
    text: string;
    pageNum: number;
    score: number;
}

export interface SearchOptions {
    threshold?: number;
    minMatchCharLength?: number;
}

export function usePDFSearch(
    document: PDFDocumentProxy | null,
    options: SearchOptions = {
        threshold: 0.0,
        minMatchCharLength: 2
    }
) {
    const memoizedOptions = useMemo(() => ({
        threshold: options.threshold ?? 0.3,
        minMatchCharLength: options.minMatchCharLength ?? 2
    }), [options.threshold, options.minMatchCharLength]);

    const extractPageText = useCallback(async (pageNum: number): Promise<string> => {
        if (!document) {
            console.warn('PDF document is not loaded');
            return '';
        }

        try {
            const page = await document.getPage(pageNum);
            if (!page) {
                throw new Error(`Failed to get page ${pageNum}`);
            }

            const textContent = await page.getTextContent();
            return textContent.items
                .map((item: any) => item.str)
                .join(' ');
        } catch (error) {
            console.error(`Failed to extract text from page ${pageNum}:`, error);
            return '';
        }
    }, [document]);

    const createWindows = (text: string, searchText: string): string[] => {
        const windows: string[] = [];
        const sentences = text.split(/[.!?]+\s+/);
        
        // If search text is long (contains multiple sentences), use sentence-based windows
        if (searchText.split(/[.!?]+\s+/).length > 1) {
            const windowSize = 3; // Number of sentences per window
            const slideSize = 1;  // Slide by one sentence
            
            for (let i = 0; i < sentences.length - windowSize + 1; i += slideSize) {
                const window = sentences.slice(i, i + windowSize).join('. ').trim();
                if (window.length > 0) {
                    windows.push(window);
                }
            }
        } else {
            // For shorter searches, use word-based windows
            const words = text.split(/\s+/);
            const windowSize = 10; // Number of words per window
            const slideSize = 5;   // Slide by half the window size
            
            for (let i = 0; i < words.length - windowSize + 1; i += slideSize) {
                const window = words.slice(i, i + windowSize).join(' ').trim();
                if (window.length > 0) {
                    windows.push(window);
                }
            }
        }
        
        return windows;
    };

    const searchPage = useCallback(async (
        searchText: string, 
        pageNum: number
    ): Promise<SearchMatch[]> => {
        if (!searchText.trim()) return [];
        
        const pageText = await extractPageText(pageNum);
        console.log("pageText", pageText);
        if (!pageText) return [];

        const windows = createWindows(pageText, searchText);

        const fuse = new Fuse(windows, {
            // threshold: memoizedOptions.threshold,
            minMatchCharLength: memoizedOptions.minMatchCharLength,
            includeScore: true,
        });

        const results = fuse.search(searchText);
        
        return results
            .filter(result => result.score && result.score < 0.7)
            .map(result => ({
                text: result.item,
                pageNum,
                score: result.score ?? 1
            }));
    }, [extractPageText, memoizedOptions]);

    return {
        searchPage
    };
}