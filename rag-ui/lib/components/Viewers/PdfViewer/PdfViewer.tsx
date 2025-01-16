import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    ArrowUturnDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/solid";
import {Highlight} from "./Highlight.tsx";
import {pdfjs, Document, Page} from 'react-pdf';
import type { PDFPageProxy } from 'pdfjs-dist';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ViewerToolbar } from "../ViewerToolbar";
import { CanvasDimensions, ZOOM_CONSTANTS } from "../types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const { ZOOM_STEP, MIN_SCALE, MAX_SCALE } = ZOOM_CONSTANTS;

interface PdfViewerProps {
    data: Uint8Array;
    highlights?: any[];
    page?: number;
}

// todo: fix highlights + rotate
const PdfViewer = ({data, highlights, page}: PdfViewerProps) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1); // Scale of the PDF page
    const [rotate, setRotate] = useState<number>(0);
    const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({width: 600, height: 800}); // Store page size
    const documentContainerRef = useRef<HTMLDivElement | null>(null); // Ref to the container to calculate the size dynamically

    // parse data object to file object which can be consumed by react-pdf
    const file = useMemo(() => ({data: data}), [data]);

    // Function to handle successful loading of the document
    const onDocumentLoadSuccess = ({numPages}: {numPages: number}) => {
        setNumPages(numPages);
    };

    useEffect(() => {
        if (data && page) {
            setPageNumber(page);
            fitParent();
        }
    }, [data]);

    // Function to handle successful loading of the PDF page and retrieve its original dimensions
    const onPageLoadSuccess = (page: PDFPageProxy) => {
        const {width: pageWidth, height: pageHeight} = page.getViewport({scale: 1}); // Get original page width and height
        if (pageWidth !== canvasDimensions.width || pageHeight !== canvasDimensions.height) {
            setCanvasDimensions({width: pageWidth, height: pageHeight});
        }
    };

    // Function to handle errors when loading a page
    const onDocumentLoadError = () => {
        setNumPages(null);
    };

    // Function to calculate the scale based on the container size
    const calculateScale = useCallback(() => {
        if (documentContainerRef.current) {
            const containerWidth = documentContainerRef.current?.clientWidth;
            const containerHeight = documentContainerRef.current?.clientHeight;

            // Check if the page is rotated
            const isRotated = rotate % 180 !== 0;
            const pageWidth = isRotated ? canvasDimensions.height : canvasDimensions.width;
            const pageHeight = isRotated ? canvasDimensions.width : canvasDimensions.height;

            // Set scale based on the container size to fill the width or height while maintaining aspect ratio
            const calculatedScale = Math.min(containerWidth / pageWidth, containerHeight / pageHeight);
            setScale(calculatedScale);
        }
    }, [canvasDimensions, rotate]);

    const changePage = (offset: number) => setPageNumber(prevPageNumber => prevPageNumber + offset);
    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);
    const zoomIn = () => {
        setScale((prevScale) => Math.min(prevScale + ZOOM_STEP, MAX_SCALE));
    };
    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - ZOOM_STEP, MIN_SCALE));
    };
    const fitParent = () => {
        calculateScale();
    };
    const rotatePage = () => {
        setRotate((prevRotate) => (prevRotate - 90) % 360);
    }

    // Hook to zoom when the mouse wheel is used, but only when the cursor is over the PDF container
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            // Prevent default scrolling behavior when zooming
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                if (event.deltaY < 0) {
                    zoomIn();
                } else {
                    zoomOut();
                }
            }
        };

        const pdfContainer = documentContainerRef.current;

        if (pdfContainer) {
            pdfContainer.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (pdfContainer) {
                pdfContainer.removeEventListener('wheel', handleWheel);
            }
        };
    }, [zoomIn, zoomOut]); // Dependencies on zoomIn and zoomOut

    const setPageNumberFromInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const inputValue = (e.target as HTMLInputElement).value;
            if (inputValue === '') {
                setPageNumber(1); // Default to page 1 if input is empty
                return;
            }
            if (numPages === null) {
                return;
            }
            const newPageNumber = parseInt(inputValue, 10);
            if (!isNaN(newPageNumber)) {
                // Clamp value between 1 and numPages
                const clampedPageNumber = Math.max(1, Math.min(newPageNumber, numPages!));
                setPageNumber(clampedPageNumber);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle keyboard events if PDF is loaded
            if (numPages === null) return;

            // Handle zoom controls with Ctrl/Cmd + Up/Down
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'ArrowUp':
                        event.preventDefault();
                        zoomIn();
                        return;
                    case 'ArrowDown':
                        event.preventDefault();
                        zoomOut();
                        return;
                    case '0':
                        event.preventDefault();
                        fitParent();
                        return;
                }
            }

            // Handle page navigation
            switch (event.key) {
                case 'ArrowRight':
                case ' ': // Spacebar
                    if (pageNumber < numPages) {
                        event.preventDefault(); // Prevent scrolling with space
                        nextPage();
                    }
                    break;
                case 'ArrowLeft':
                case 'Backspace':
                    if (pageNumber > 1) {
                        event.preventDefault();
                        previousPage();
                    }
                    break;
                case 'Home':
                    event.preventDefault();
                    setPageNumber(1);
                    break;
                case 'End':
                    event.preventDefault();
                    setPageNumber(numPages);
                    break;
                default:
                    break;
            }
        };

        // Add event listener to window to catch keyboard events
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [pageNumber, numPages, nextPage, previousPage, zoomIn, zoomOut, fitParent]);

    const Toolbar = () => {
        // Initialize scalePercentage with scale
        let scalePercentage = scale;
        
        // Calculate actual scale percentage if we have the container width
        if (documentContainerRef.current && canvasDimensions.width > 0 && numPages !== null) {
            const isRotated = rotate % 180 !== 0;
            const pageWidth = isRotated ? canvasDimensions.height : canvasDimensions.width;
            const containerWidth = documentContainerRef.current?.clientWidth;
            if (containerWidth > 0) {
                scalePercentage = (scale * pageWidth) / containerWidth;
            }
        }

        return (
            <ViewerToolbar 
                zoomIn={zoomIn} 
                zoomOut={zoomOut} 
                scale={scalePercentage} 
                fitParent={fitParent}
                isLoaded={numPages !== null}
            >
                <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-row gap-x-1 text-md">
                        <button
                            className="px-2 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={pageNumber <= 1 || data === null}
                            onClick={previousPage}>
                            <ChevronLeftIcon className="size-4 text-black"/>
                        </button>
                        <div className="m-auto min-w-14 flex items-center justify-center bg-gray-200 rounded-md">
                            {numPages !== null ? (
                                <>
                                    <input
                                        className="text-center w-8 bg-gray-100 rounded-md mr-1"
                                        onKeyDown={setPageNumberFromInput}
                                        defaultValue={pageNumber || (numPages ? 1 : '--')}
                                        placeholder="Page"
                                        aria-label="Enter page number"
                                        aria-live="polite"
                                    /> /
                                    <span className="text-gray-600 ml-1 w-8"> {numPages || '--'}</span>
                                </>
                            ) : '--'
                            }
                        </div>
                        <button
                            className="px-2 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={numPages === null || pageNumber >= numPages}
                            onClick={nextPage}>
                            <ChevronRightIcon className="size-4 text-black"/>
                        </button>
                    </div>
                    <button
                        className="px-2 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={rotatePage}>
                        <ArrowUturnDownIcon className="size-5 text-black"/>
                    </button>
                </div>
            </ViewerToolbar>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-gray-50 text-gray-700 rounded-lg">
            <Toolbar/>
            <div className="flex justify-center items-start flex-grow overflow-auto relative w-full"
                style={{textAlign: 'center'}}
                ref={documentContainerRef}
            >
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    className="w-full h-full"
                    noData={<div>No data</div>}
                >
                    <div
                        style={{
                            position: 'relative',
                            display: 'inline-block',
                        }}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            className="max-w-full max-h-full block shadow-lg"
                            renderMode="canvas"
                            rotate={rotate}
                            onLoadSuccess={onPageLoadSuccess}
                        />
                        {highlights && highlights.filter((highlight) => highlight.page === pageNumber).map((highlight, index) => (
                            <Highlight
                                key={index}
                                rect={highlight.rect}
                                scale={scale}
                                rotate={rotate}
                                canvasDimensions={canvasDimensions}
                            />
                        ))}
                    </div>
                </Document>
            </div>
        </div>
    );
}

export {PdfViewer};