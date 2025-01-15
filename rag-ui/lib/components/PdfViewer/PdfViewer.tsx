import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    ArrowsPointingOutIcon, ArrowUturnDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon, MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon
} from "@heroicons/react/24/solid";
import {Highlight} from "./Highlight";
import {pdfjs, Document, Page} from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFPageProxy } from 'pdfjs-dist/types/src/display/api'; //TODO: use import from react-pdf

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const ZOOM_STEP = 0.2;  // Zoom step for increasing or decreasing scale
const MIN_SCALE = 0.5;  // Minimum scale to prevent too much zoom out
const MAX_SCALE = 3;    // Maximum scale to prevent excessive zoom in
const options = {
    withCredentials: true,
}

interface PdfViewerProps {
    data: Uint8Array;
    highlights?: any[];
    page?: number;
}

export interface PageDimensions {
    width: number;
    height: number;
}

const PdfViewer = ({data, highlights, page}: PdfViewerProps) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1); // Scale of the PDF page
    const [rotate, setRotate] = useState(0);
    const [pageDimensions, setPageDimensions] = useState<PageDimensions>({width: 600, height: 800}); // Store page size
    const documentContainerRef = useRef<HTMLDivElement>(null); // Ref to the container to calculate the size dynamically
    const pageContainerRef = useRef<HTMLDivElement>(null); // Ref to the page container to calculate the size dynamically

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
        if (pageWidth !== pageDimensions.width || pageHeight !== pageDimensions.height) {
            setPageDimensions({width: pageWidth, height: pageHeight});
        }
    };

    // Function to calculate the scale based on the container size
    const calculateScale = useCallback(() => {
        if (documentContainerRef.current) {
            const containerWidth = documentContainerRef.current.clientWidth;
            const containerHeight = documentContainerRef.current.clientHeight;
            const isRotated = rotate % 180 !== 0;
            const pageWidth = isRotated ? pageDimensions.height : pageDimensions.width;
            const pageHeight = isRotated ? pageDimensions.width : pageDimensions.height;
            // Set scale based on the container size to fill the width or height while maintaining aspect ratio
            const calculatedScale = Math.min(containerWidth / pageWidth, containerHeight / pageHeight);
            setScale(calculatedScale);
        }
    }, [pageDimensions, rotate]);

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

    const Toolbar = () => {
        return (
            <div className="px-2 bg-gray-400 gap-x-1 flex flex-row justify-between text-gray-700 z-10"
                 style={{
                     borderTopLeftRadius: '0.5rem',
                     borderTopRightRadius: '0.5rem',
                     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)', // Improved shadow
                }}
            >
                <div className="flex flex-row gap-x-1 text-md">
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={pageNumber <= 1 || data === null}
                        onClick={previousPage}
                    >
                        <ChevronLeftIcon className="size-4 text-black"/>
                    </button>
                    <div className="m-auto min-w-14 text-center bg-gray-100 rounded-md">
                        {pageNumber || (numPages ? 1 : '--')} / {numPages || '--'}
                    </div>
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={numPages === null || pageNumber >= numPages}
                        onClick={nextPage}
                    >
                        <ChevronRightIcon className="size-4 text-black"/>
                    </button>
                </div>
                <div className="flex flex-row gap-x-1">
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={zoomIn}>
                        <MagnifyingGlassPlusIcon className="size-5 text-black"/>
                    </button>
                    <div className="m-auto min-w-14 text-center bg-gray-100 rounded-md">
                        {documentContainerRef.current ? `${((scale * pageDimensions.width) / documentContainerRef.current.clientWidth * 100).toFixed(0)}%` : '--'}
                    </div>
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={zoomOut}>
                        <MagnifyingGlassMinusIcon className="size-5 text-black"/>
                    </button>
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={fitParent}>
                        <ArrowsPointingOutIcon className="size-5 text-black"/>
                    </button>
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={rotatePage}>
                        <ArrowUturnDownIcon className="size-5 text-black"/>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-gray-50 text-gray-700 rounded-lg">
            <Toolbar/>
            <div className="flex justify-center items-start flex-grow overflow-auto relative w-full"
                 ref={documentContainerRef}
                 style={{textAlign: 'center'}}
            >
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="w-full h-full"
                    noData={<div>No data</div>}
                    options={options}
                >
                    <div style={{position: 'relative'}} ref={pageContainerRef}>
                        <div
                            ref={pageContainerRef}
                            style={{
                                position: 'relative',
                                display: 'inline-block',  // so it can be centered by text-align
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
                                    pageDimensions={pageDimensions}
                                />
                            ))
                            }
                        </div>
                    </div>
                </Document>
            </div>
        </div>
    );
}

export {PdfViewer};