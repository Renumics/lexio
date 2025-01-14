import React, { useEffect, useRef, useState} from 'react';
import './HtmlViewer.css';
import DOMPurify from 'dompurify';
import {
    ArrowPathIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon
} from "@heroicons/react/24/solid";

// Constants for zoom logic
const ZOOM_STEP = 0.2;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

interface HTMLViewerProps {
    htmlContent: string;   // The raw HTML string you want to render
}

const HtmlViewer = ({htmlContent}: HTMLViewerProps) => {
    const [scale, setScale] = useState(1);
    const documentContainerRef = useRef<HTMLDivElement>(null);

    // A ref for the actual HTML content container
    const contentRef = useRef<HTMLDivElement>(null);

    // Zoom methods
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
            if (event.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
            // Prevent page scroll while zooming if desired
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
        <div className="px-2 bg-gray-400 gap-x-1 flex flex-row justify-end text-gray-700 z-10"
             style={{
                 borderTopLeftRadius: '0.5rem',
                 borderTopRightRadius: '0.5rem',
                 boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)', // Improved shadow
            }}
        >
            <div className="flex flex-row gap-x-1">
                <button
                    className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={zoomIn}>
                    <MagnifyingGlassPlusIcon className="size-5 text-black"/>
                </button>

                <div className="bg-white py-1 px-2 rounded">
                    Scale: {Math.round(scale * 100)}%
                </div>
                <button
                    className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={zoomOut}>
                    <MagnifyingGlassMinusIcon className="size-5 text-black"/>
                </button>
                <button
                    className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setScale(1.0)}>
                    <ArrowPathIcon className="size-5 text-black"/>
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-full w-full flex flex-col">
            <Toolbar/>
            <div
                ref={documentContainerRef}
                className="p-2 flex-grow overflow-auto flex bg-gray-100"
            >
                <div
                    ref={contentRef}
                    className="relative inline-block html-viewer-content"
                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(htmlContent)}}  // Sanitize the HTML content
                />
            </div>
        </div>
    );
}

export {HtmlViewer};