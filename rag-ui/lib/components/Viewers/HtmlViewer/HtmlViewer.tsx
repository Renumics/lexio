import { useEffect, useRef, useState} from 'react';
import './HtmlViewer.css';
import DOMPurify from 'dompurify';
import { ViewerToolbar } from "../ViewerToolbar";
import { ZOOM_CONSTANTS } from "../types";
import { useFocusScope } from '../../../hooks/useFocusScope';

const { ZOOM_STEP, MIN_SCALE, MAX_SCALE } = ZOOM_CONSTANTS;

interface HTMLViewerProps {
    htmlContent: string;   // The raw HTML string you want to render
}

const HtmlViewer = ({htmlContent}: HTMLViewerProps) => {
    const [scale, setScale] = useState(1);
    const documentContainerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const { handleWheelEvent, setActive, clearActive } = useFocusScope({
        scopeId: 'html-viewer',
        priority: 1
    });

    const zoomIn = () => setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_SCALE));
    const zoomOut = () => setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_SCALE));

    // Measure the natural size of the HTML block so we know how to scale it
    useEffect(() => {
        if (contentRef.current) {
            // Force scale = 1 temporarily to measure natural width/height
            contentRef.current.style.transform = 'scale(1)';
            contentRef.current.style.transformOrigin = 'top left';
        }
    }, [htmlContent]);

    // Re-apply the actual scale
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.transform = `scale(${scale})`;
            // Ensure top-left origin so we can scroll to all corners
            contentRef.current.style.transformOrigin = 'top left';
        }
    }, [scale]);

    // Optional: Handle mouse wheel zoom
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            if (!handleWheelEvent(event)) return;
            
            if (event.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
            event.preventDefault();
        };

        const container = documentContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, {passive: false});
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    // Simple toolbar, similar to your PDF toolbar
    const Toolbar = () => (
        <ViewerToolbar zoomIn={zoomIn} zoomOut={zoomOut} scale={scale} fitParent={() => setScale(1.0)}>
            <div></div>
        </ViewerToolbar>
    );

    return (
        <div 
            className="h-full w-full flex flex-col"
            onMouseEnter={setActive}
            onMouseLeave={clearActive}
        >
            <Toolbar/>
            <div
                ref={documentContainerRef}
                className="p-2 flex-grow overflow-auto bg-gray-100"
            >
                <div
                    ref={contentRef}
                    className="relative inline-block html-viewer-content"
                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(htmlContent)}}
                />
            </div>
        </div>
    );
}

export {HtmlViewer};