import { PDFHighlight } from "../types";
import Fuse from 'fuse.js';

export interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  dir: string;
  fontName: string;
}

export interface SearchResult {
  page: number;
  highlights: PDFHighlight[];
  score: number;
  text: string;
}

export const calculateHighlightRect = (item: TextItem, pageHeight: number) => {
  // PDF coordinates start from bottom-left, we need to convert to top-left
  const [a, b, c, d, e, f] = item.transform;
  
  // Calculate position and dimensions
  return {
    left: e / pageHeight,
    // Convert from bottom-up to top-down coordinate system
    top: 1 - (f + item.height) / pageHeight,
    width: item.width / pageHeight,
    height: item.height / pageHeight,
  };
};

export const createPdfSearcher = async (file: ArrayBuffer) => {
  const { getDocument } = await import('pdfjs-dist');
  const doc = await getDocument(file).promise;
  const pageCount = doc.numPages;
  
  // Store page content for searching
  const pageContents: Array<{
    text: string;
    items: TextItem[];
    height: number;
  }> = [];

  // Load all pages
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });
    
    pageContents.push({
      text: textContent.items.map((item: TextItem) => item.str).join(' '),
      items: textContent.items as TextItem[],
      height: viewport.height
    });
  }

  // Configure Fuse.js for fuzzy searching
  const fuse = new Fuse(pageContents.map((content, i) => ({
    text: content.text,
    page: i + 1
  })), {
    keys: ['text'],
    includeScore: true,
    threshold: 0.3,
    minMatchCharLength: 3
  });

  return {
    search: (query: string): SearchResult[] => {
      const fuseResults = fuse.search(query);
      
      return fuseResults.map(result => {
        const pageIndex = result.item.page - 1;
        const pageContent = pageContents[pageIndex];
        
        // Find matching text positions and create highlights
        const highlights: PDFHighlight[] = [];
        const words = query.toLowerCase().split(/\s+/);
        
        pageContent.items.forEach((item: TextItem) => {
          const itemText = item.str.toLowerCase();
          if (words.some(word => itemText.includes(word))) {
            highlights.push({
              page: result.item.page,
              rect: calculateHighlightRect(item, pageContent.height)
            });
          }
        });

        return {
          page: result.item.page,
          highlights,
          score: result.score || 1,
          text: pageContent.text.substring(0, 200) + '...' // Preview text
        };
      });
    }
  };
}; 