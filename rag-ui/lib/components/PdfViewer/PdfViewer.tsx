import { useEffect, useRef, useState } from 'react';
import useResizeObserver from '@react-hook/resize-observer';
import pdfjsWorkerURL from 'pdfjs-dist/build/pdf.worker?url';

let pdfjs: typeof import('pdfjs-dist');

// Initialize PDF.js
const initPdfJs = async () => {
  pdfjs = await import(/* @vite-ignore */ 'pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerURL;
};

// Initialize immediately
initPdfJs().catch(console.error);

interface PdfViewerProps {
  data: Uint8Array;
}

const PdfViewer = ({ data }: PdfViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderIdRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfPage, setPdfPage] = useState<any>(null);

  const renderPage = async (page: any, width: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Canvas context not available');
    }

    // Get the original viewport at scale 1.0
    const originalViewport = page.getViewport({ scale: 1.0 });
    
    // Calculate scale to fit width
    const scale = width / originalViewport.width;
    
    // Get the scaled viewport
    const viewport = page.getViewport({ scale });

    // Set canvas dimensions
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Set canvas CSS width to 100% and height to auto
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  };

  // Initial PDF load
  useEffect(() => {
    const currentRenderID = ++renderIdRef.current;

    const loadPDF = async () => {
      if (!containerRef.current) return;

      try {
        setLoading(true);
        const clonedData = new Uint8Array(data);
        const loadingTask = pdfjs.getDocument({ data: clonedData });
        const pdf = await loadingTask.promise;

        if (currentRenderID !== renderIdRef.current) return;

        const page = await pdf.getPage(1);
        if (currentRenderID !== renderIdRef.current) return;

        setPdfPage(page);
        await renderPage(page, containerRef.current.clientWidth);
        
        if (currentRenderID === renderIdRef.current) {
          setLoading(false);
        }
      } catch (err) {
        if (currentRenderID === renderIdRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
          setLoading(false);
        }
      }
    };

    loadPDF();
  }, [data]);

  // Handle container resizing
  useResizeObserver(containerRef, (entry) => {
    if (pdfPage) {
      renderPage(pdfPage, entry.contentRect.width);
    }
  });

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div ref={containerRef} className="w-full h-full overflow-y-auto">
      {loading && <div>Loading...</div>}
      <canvas ref={canvasRef} className="max-w-full" />
    </div>
  );
};

export { PdfViewer };