import { useEffect, useRef, useState } from 'react';
import * as pdfjs from "pdfjs-dist";
import pdfJSWorkerURL from "pdfjs-dist/build/pdf.worker?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfJSWorkerURL;

interface PdfViewerProps {
  url: string;
  scale?: number;
}

const PdfViewer = ({ url, scale = 1.5 }: PdfViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderIdRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentRenderID = ++renderIdRef.current;

    const renderPage = async () => {
      if (!canvasRef.current) return;

      try {
        setLoading(true);
        
        // Load the PDF document
        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;

        // Check if this is still the most recent render request
        if (currentRenderID !== renderIdRef.current) return;

        // Get the first page
        const page = await pdf.getPage(1);
        if (currentRenderID !== renderIdRef.current) return;

        // Prepare canvas using PDF page dimensions
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Canvas context not available');
        }

        // Get viewport of the page at required scale
        const viewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        
        // Only update state if this is still the most recent render
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

    renderPage();
  }, [url, scale]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {loading && <div>Loading...</div>}
      <canvas ref={canvasRef} />
    </div>
  );
};

export { PdfViewer };