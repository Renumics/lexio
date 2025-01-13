import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    ArrowsPointingOutIcon,
    ChevronLeftIcon,
    ChevronRightIcon, MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon
} from "@heroicons/react/24/solid";
import {pdfjs, Document, Page} from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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

const highlightStyleDefaults = {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    border: '1px solid rgba(255, 255, 0, 0.6)',
    pointerEvents: 'none',
    pointer: 'select',
    borderRadius: '5px',
    zIndex: 100,
}

interface PdfViewerProps {
    data: Uint8Array;
    page?: number;
}

const PdfViewer = ({data, page}: PdfViewerProps) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1); // Scale of the PDF page
    const [pageContainerDimensions, setPageContainerDimensions] = useState({width: 600, height: 800}); // Store page size
    const [pageDimensions, setPageDimensions] = useState({width: 600, height: 800}); // Store page size
    const documentContainerRef = useRef(null); // Ref to the container to calculate the size dynamically
    const pageContainerRef = useRef(null); // Ref to the page container to calculate the size dynamically

    // parse data object to file object which can be consumed by react-pdf
    const file = useMemo(() => ({data: data}), [data]);

    // Function to handle successful loading of the document
    const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    };

    useEffect(() => {
        if (data && page) {
            setPageNumber(page + 1);
        }
    }, [data]);

    // Function to handle successful loading of the PDF page and retrieve its original dimensions
    const onPageLoadSuccess = (page) => {
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
            // Set scale based on the container size to fill the width or height while maintaining aspect ratio
            const calculatedScale = Math.min(containerWidth / pageDimensions.width, containerHeight / pageDimensions.height);
            setScale(calculatedScale);
        }
    }, [pageDimensions]);

    const changePage = (offset) => setPageNumber(prevPageNumber => prevPageNumber + offset);
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

    // Hook to zoom when the mouse wheel is used, but only when the cursor is over the PDF container
    useEffect(() => {
        const handleWheel = (event) => {
            if (event.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        };

        const pdfContainer = documentContainerRef.current;

        if (pdfContainer) {
            pdfContainer.addEventListener('wheel', handleWheel);
        }

        return () => {
            if (pdfContainer) {
                pdfContainer.removeEventListener('wheel', handleWheel);
            }
        };
    }, [zoomIn, zoomOut]); // Dependencies on zoomIn and zoomOut

    const PDFViewerNavigation = () => {
        return (
            <div className="px-1 bg-gray-400 gap-x-1 flex flex-row justify-between text-gray-700">
                <div className="flex flex-row gap-x-1 text-md">
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={pageNumber <= 1 || data === null}
                        onClick={previousPage}
                    >
                        <ChevronLeftIcon className="size-4 text-black" />
                        {/*<ArrowBackIcon />*/}
                    </button>
                    <div className="m-auto min-w-14 text-center bg-gray-100 rounded-md">
                        {pageNumber || (numPages ? 1 : '--')} / {numPages || '--'}
                    </div>
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={pageNumber >= numPages}
                        onClick={nextPage}
                    >
                        <ChevronRightIcon className="size-4 text-black" />
                    </button>
                </div>
                <div className="flex flex-row gap-x-1">
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"onClick={zoomIn}>
                        <MagnifyingGlassPlusIcon className="size-5 text-black" />
                    </button>
                    <div className="m-auto min-w-14 text-center bg-gray-100 rounded-md">
                        {documentContainerRef.current ? `${((scale * pageDimensions.width) / documentContainerRef.current.clientWidth * 100).toFixed(0)}%` : '--'}
                    </div>
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={zoomOut}>
                        <MagnifyingGlassMinusIcon className="size-5 text-black" />
                    </button>
                    <button
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={fitParent}>
                        <ArrowsPointingOutIcon className="size-5 text-black" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col min-w-[400px] bg-gray-50 text-gray-700 rounded-lg">
            <PDFViewerNavigation/>
            <div ref={documentContainerRef} className="flex-grow relative overflow-scroll w-full">
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="w-full h-full flex justify-center items-center"
                    noData={<div variant="body2">No data</div>}
                    options={options}
                >
                    <div style={{position: 'relative'}} ref={pageContainerRef}>
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            className="max-w-full max-h-full display-block m-auto "
                            renderMode="svg"
                            onLoadSuccess={onPageLoadSuccess}
                        />
                    </div>
                </Document>
            </div>
        </div>
    );

}

export {PdfViewer};