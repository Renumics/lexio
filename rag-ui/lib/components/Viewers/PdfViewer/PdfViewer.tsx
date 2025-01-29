import {useCallback, useEffect, useMemo, useRef, useState, useContext} from "react";
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
import { ViewerToolbar, ViewerToolbarStyles } from "../ViewerToolbar";
import { CanvasDimensions, ZOOM_CONSTANTS } from "../types";
import {useHotkeys, Options} from 'react-hotkeys-hook';
import { ThemeContext, removeUndefined } from "../../../theme/ThemeContext";

// Configure PDF.js worker - we explicitly use the pdfjs worker from the react-pdf package to avoid conflicts with the worker versions.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

/**
 * Constants for the PdfViewer component's zoom functionality.
 * 
 * @internal
 */
const { ZOOM_STEP, MIN_SCALE, MAX_SCALE } = ZOOM_CONSTANTS;

/**
 * Style configuration interface for the PdfViewer component.
 * Extends ViewerToolbarStyles to include additional styling options specific to PDF display.
 * 
 * @interface PdfViewerStyles
 * @extends {ViewerToolbarStyles}
 * @property {string} [color] - Text color for the viewer
 * @property {string} [fontFamily] - Font family for text elements
 * @property {string} [contentBackground] - Background color of the PDF content area
 * @property {string} [contentPadding] - Padding around the PDF content
 */
export interface PdfViewerStyles extends ViewerToolbarStyles {
    color?: string;
    fontFamily?: string;
    contentBackground?: string;
    contentPadding?: string;
}

/**
 * Props for the PdfViewer component.
 * 
 * @interface PdfViewerProps
 * @property {Uint8Array} data - The binary PDF data to display
 * @property {any[]} [highlights] - Optional array of highlight annotations to display on the PDF
 * @property {number} [page] - Optional page number to display initially
 * @property {PdfViewerStyles} [styleOverrides] - Optional style overrides for customizing the viewer's appearance
 */
interface PdfViewerProps {
    data: Uint8Array;
    highlights?: any[];
    page?: number;
    styleOverrides?: PdfViewerStyles;
}

/**
 * A component for displaying PDF documents with advanced viewing controls.
 * Used in the ContentDisplay component to display PDF source content with highlight support.
 * 
 * @component
 * @param {PdfViewerProps} props - The props for the PdfViewer
 * @returns {JSX.Element} A themed PDF viewer with navigation and zoom controls
 * 
 * @remarks
 * Features include:
 * - Page navigation with keyboard shortcuts (Left/Right arrows, Space, Backspace)
 * - Zoom controls (Ctrl/Cmd + Up/Down)
 * - Page rotation (.)
 * - Support for highlight annotations
 * - Automatic page selection based on highlight density
 * - Mouse wheel zoom support
 * 
 * Keyboard Shortcuts:
 * - Next Page: Right Arrow, Space
 * - Previous Page: Left Arrow, Backspace
 * - First Page: Home
 * - Last Page: End
 * - Zoom In: Ctrl/Cmd + Up
 * - Zoom Out: Ctrl/Cmd + Down
 * - Fit to View: Ctrl/Cmd + 0
 * - Rotate Page: .
 * 
 * @example
 * ```tsx
 * <PdfViewer
 *   data={pdfBinaryData}
 *   highlights={[
 *     { page: 1, rect: { top: 0.1, left: 0.1, width: 0.2, height: 0.05 } }
 *   ]}
 *   page={1}
 *   styleOverrides={{
 *     contentBackground: '#ffffff',
 *     contentPadding: '20px'
 *   }}
 * />
 * ```
 * 
 * @todo: 
 *  - change / unify mechanism to select page based on highlights / page number
 *  - add support for text search
 */
const PdfViewer = ({data, highlights, page, styleOverrides = {}}: PdfViewerProps) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1); // Scale of the PDF page
    const [rotate, setRotate] = useState<number>(0);
    const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({width: 600, height: 800}); // Store page size
    const documentContainerRef = useRef<HTMLDivElement | null>(null); // Ref to the container to calculate the size dynamically
    
    // --- use theme ---
    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error('ThemeContext is undefined');
    }
    const { colors, spacing, borderRadius, typography } = theme.theme;

    // --- merge theme defaults + overrides ---
    const style: PdfViewerStyles = {
        color: colors.text,
        fontFamily: typography.fontFamily,
        contentBackground: colors.secondaryBackground,
        contentPadding: spacing.none,
        
        toolbarDisplayBackground: '#f0f0f0',
        toolbarDisplayBorderRadius: borderRadius.md,
        toolbarDisplayInputBackground: '#ffffff',
        toolbarBorderRadius: borderRadius.md,
        toolbarButtonBorderRadius: borderRadius.md,
        toolbarSecondaryBackground: colors.secondaryBackground,
        toolbarButtonBackground: colors.primary,
        toolbarButtonColor: 'white',
        ...removeUndefined(styleOverrides),
    };

    // parse data object to file object which can be consumed by react-pdf
    const file = useMemo(() => ({data: data}), [data]);

    // Function to handle successful loading of the document
    const onDocumentLoadSuccess = ({numPages}: {numPages: number}) => {
        setNumPages(numPages);
    };

    useEffect(() => {
        if (data) {
            let targetPage = 1; // default to first page
            
            if (highlights && highlights.length > 0) {
                // Count page occurrences in highlights
                const pageCount = highlights.reduce((acc: {[key: number]: number}, highlight) => {
                    const highlightPage = highlight.page;
                    acc[highlightPage] = (acc[highlightPage] || 0) + 1;
                    return acc;
                }, {});
                
                // Find the most frequent page
                const mostFrequentPage = Object.entries(pageCount)
                    .reduce((a, b) => (b[1] > a[1] ? b : a))[0];
                
                targetPage = parseInt(mostFrequentPage) || page || 1;
            } else if (page) {
                targetPage = page;
            }

            setPageNumber(targetPage);
            fitParent();
        }
    }, [data, highlights, page]);

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

    // ---- Mouse wheel zoom ----
    // Hook to zoom when the mouse wheel is used, but only when the cursor is over the PDF container
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            // Prevent default scrolling behavior when zooming
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                if (event.deltaY < 0) {
                    wrappedActions.zoomIn();
                } else {
                    wrappedActions.zoomOut();
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
    }, [zoomIn, zoomOut]); 

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


    // ---- Hotkeys ----
    // Common options for hotkeys
    const hotkeyOptions: Options = {
        enableOnFormTags: false,
        enabled: numPages !== null,
        // No need for filter function as the ref handles the scoping
    };

    // Use the ref returned by useHotkeys
    const zoomInRef = useHotkeys('ctrl+up, cmd+up', 
        (event) => {
            event.preventDefault();
            zoomIn();
        }, 
        hotkeyOptions,
        [zoomIn]
    );

    const zoomOutRef = useHotkeys('ctrl+down, cmd+down', 
        (event) => {
            event.preventDefault();
            zoomOut();
        }, 
        hotkeyOptions,
        [zoomOut]
    );

    const fitRef = useHotkeys('ctrl+0, cmd+0', 
        (event) => {
            event.preventDefault();
            fitParent();
        }, 
        hotkeyOptions,
        [fitParent]
    );

    const nextRef = useHotkeys('right, space', 
        (event) => {
            if (pageNumber < numPages!) {
                event.preventDefault();
                nextPage();
            }
        }, 
        hotkeyOptions,
        [nextPage, pageNumber, numPages]
    );

    const prevRef = useHotkeys('left, backspace', 
        (event) => {
            if (pageNumber > 1) {
                event.preventDefault();
                previousPage();
            }
        }, 
        hotkeyOptions,
        [previousPage, pageNumber]
    );

    const homeRef = useHotkeys('home', 
        (event) => {
            event.preventDefault();
            setPageNumber(1);
        }, 
        hotkeyOptions,
        []
    );

    const endRef = useHotkeys('end', 
        (event) => {
            event.preventDefault();
            setPageNumber(numPages!);
        }, 
        hotkeyOptions,
        [numPages]
    );

    const rotateRef = useHotkeys('.', 
        (event) => {
            event.preventDefault();
            rotatePage();
        }, 
        hotkeyOptions,
        [rotatePage]
    );

    // Each useHotkeys() call returns a function ref that activates its hotkey when the element receives focus
    // See: https://react-hotkeys-hook.vercel.app/docs/documentation/useHotkeys/scoping-hotkeys
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Combines multiple hotkey refs into a single ref callback
    // This is necessary because each useHotkeys() returns its own ref,
    // but we can only attach one ref to a DOM element
    // Triggering all hotkey refs activates them all
    const combineRefs = (element: HTMLDivElement) => {
        [zoomInRef, zoomOutRef, fitRef, nextRef, prevRef, homeRef, endRef, rotateRef]
            .forEach(ref => {
                if (typeof ref === 'function') ref(element);
                else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
            });
    };

    // Helper function to focus the container
    const focusContainer = () => {
        containerRef.current?.focus();
    };

    // Wrap the existing actions with focus
    const wrappedActions = {
        previousPage: () => {
            previousPage();
            focusContainer();
        },
        nextPage: () => {
            nextPage();
            focusContainer();
        },
        zoomIn: () => {
            zoomIn();
            focusContainer();
        },
        zoomOut: () => {
            zoomOut();
            focusContainer();
        },
        fitParent: () => {
            fitParent();
            focusContainer();
        },
        rotatePage: () => {
            rotatePage();
            focusContainer();
        }
    };

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
                zoomIn={wrappedActions.zoomIn} 
                zoomOut={wrappedActions.zoomOut} 
                scale={scalePercentage} 
                fitParent={wrappedActions.fitParent}
                isLoaded={numPages !== null}
                styleOverrides={{
                    toolbarBorderRadius: style.toolbarBorderRadius,
                    toolbarBackground: style.toolbarBackground,
                    toolbarButtonBackground: style.toolbarButtonBackground,
                    toolbarButtonColor: style.toolbarButtonColor,
                    toolbarButtonBorderRadius: style.toolbarButtonBorderRadius,
                    toolbarTextColor: style.toolbarTextColor,
                    toolbarBoxShadow: style.toolbarBoxShadow,
                }}
            >
                <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-row gap-x-1 text-md">
                        <button
                            className="px-2 py-1 transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                color: style.toolbarButtonColor,
                                backgroundColor: style.toolbarButtonBackground,
                                borderRadius: style.toolbarButtonBorderRadius,
                            }}
                            disabled={pageNumber <= 1 || numPages === null}
                            onClick={wrappedActions.previousPage}
                            title="Previous Page (Left Arrow, Backspace)">
                            <ChevronLeftIcon className="size-4"/>
                        </button>
                        <div className="m-auto min-w-16 text-center" // todo: fix width
                            style={{
                                color: style.toolbarTextColor,
                                backgroundColor: style.toolbarDisplayBackground,
                                borderRadius: style.toolbarDisplayBorderRadius,
                            }}
                        >
                            {numPages !== null ? (
                                <>
                                    <input
                                        className="text-center w-6 rounded-md mr-1"
                                        style={{
                                            backgroundColor: style.toolbarDisplayInputBackground,
                                        }}
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
                            
                            className="px-2 py-1 transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                color: style.toolbarButtonColor,
                                backgroundColor: style.toolbarButtonBackground,
                                borderRadius: style.toolbarButtonBorderRadius,
                            }}
                            disabled={numPages === null || pageNumber >= numPages}
                            onClick={wrappedActions.nextPage}
                            title="Next Page (Right Arrow, Space)">
                            <ChevronRightIcon className="size-4"/>
                        </button>
                    </div>
                    <button
                        className="px-2 py-1 transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            color: style.toolbarButtonColor,
                            backgroundColor: style.toolbarButtonBackground,
                            borderRadius: style.toolbarButtonBorderRadius,
                        }}
                        onClick={wrappedActions.rotatePage}
                        disabled={numPages === null}
                        title="Rotate Page (.)">
                        <ArrowUturnDownIcon className="size-5"/>
                    </button>
                </div>
            </ViewerToolbar>
        );
    }

    return (
        <div 
            className="h-full w-full flex flex-col focus:outline-none"
            // tabIndex enables the div to receive focus, -1 keeps it out of tab order
            tabIndex={-1}
            ref={(element: HTMLDivElement | null) => {
                if (element) {
                    containerRef.current = element;
                    combineRefs(element);
                }
            }}
            style={{
                ...{
                    color: style.color,
                    fontFamily: style.fontFamily,
                }
            }}
        >
            <Toolbar />
            <div 
                className="flex justify-center items-start flex-grow overflow-auto relative w-full"
                style={{
                    textAlign: 'center',
                    padding: style.contentPadding,
                    backgroundColor: style.contentBackground,
                }}
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