import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useContext,
    FC,
    PropsWithChildren,
    useMemo,
    forwardRef,
    ElementRef
} from "react";
import {Highlight} from "./Highlight.tsx"
import {pdfjs, Document, Page} from 'react-pdf';
import type { PDFPageProxy } from 'pdfjs-dist';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ViewerToolbarStyles } from "../ViewerToolbar";
import { CanvasDimensions, ZOOM_CONSTANTS } from "../types";
import {useHotkeys, Options} from 'react-hotkeys-hook';
import { ThemeContext, removeUndefined } from "../../../theme/ThemeContext";
import { PDFHighlight } from "../../../types";
import {FileViewerContainer} from "../../ui/FileViewerContainer.tsx";
import {FitPdfContentToParentContainer, PageSwitcher, RotatePdf, ZoomInAndOut} from "./PdfViewerToolbar.tsx";
import {File} from "react-pdf/src/shared/types.ts";

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
    fontSize?: string;
    contentBackground?: string;
    contentPadding?: string;
    borderRadius?: string;
}

/**
 * Props for the PdfViewer component.
 *
 * @interface PdfViewerProps
 * @property {Uint8Array} data - The binary PDF data to display
 * @property {PDFHighlight[]} [highlights] - Optional array of highlight annotations to display on the PDF
 * @property {number} [page] - Optional page number to display initially
 * @property {PdfViewerStyles} [styleOverrides] - Optional style overrides for customizing the viewer's appearance
 */
interface PdfViewerProps {
    data: Uint8Array;
    highlights?: PDFHighlight[];
    page?: number;
    styleOverrides?: PdfViewerStyles;
    fileName?: string | undefined;
}

/**
 * A component for displaying PDF documents with advanced viewing controls.
 * Used in the ContentDisplay component to display PDF source content with highlight support.
 *
 * If no `page` number is provided, the component will automatically select the most frequently highlighted page.
 *
 * @component
 * @param {PdfViewerProps} props - The props for the PdfViewer
 * @returns {JSX.Element} A themed PDF viewer with navigation and zoom controls
 *
 * @remarks
 * **Features:**
 * - Page navigation with keyboard shortcuts (Left/Right arrows, Space, Backspace)
 * - Zoom controls (Ctrl/Cmd + Up/Down)
 * - Page rotation (.)
 * - Support for highlight annotations
 * - Automatic page selection based on highlight density
 * - Mouse wheel zoom support
 *
 * @remarks
 * **Keyboard Shortcuts:**
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
 *
 * ```tsx
 * <PdfViewer
 *   data={pdfBinaryData as Uint8Array}
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
 */
const PdfViewer = ({data, highlights, page, styleOverrides = {}, fileName}: PdfViewerProps) => {
    const pdfData = useMemo<{ data: Uint8Array }>(() => {
        return { data: new Uint8Array(data) };
    }, [data]);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [renderedPageNumber, setRenderedPageNumber] = useState<number>(1);
    const [rotate, setRotate] = useState<number>(0);

    // state variables for scale of the PDF page
    const [scale, setScale] = useState<number>(1); // Scale of the PDF page
    const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({width: 600, height: 800}); // Store page size
   const documentContainerRef = useRef<HTMLDivElement | null>(null); // Ref to the container to calculate the size dynamically
   const documentContainerRefFullScreen = useRef<HTMLDivElement | null>(null); // Ref to the container to calculate the size dynamically

    // --- use theme ---
    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error('ThemeContext is undefined');
    }
    const { colors, typography, componentDefaults } = theme.theme;

    // --- merge theme defaults + overrides ---
    const style: PdfViewerStyles = {
        color: colors.text,
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSizeBase,
        contentBackground: "#d1d5dc",
        contentPadding: 'none',
        borderRadius: componentDefaults.borderRadius,

        toolbarBorderRadius: '0.35rem',
        toolbarBoxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
        toolbarChipBackground: '#ffffff',
        toolbarChipBorderRadius: '0.375rem',
        toolbarChipInputBackground: '#ffffff',

        toolbarButtonBackground: colors.primary,
        toolbarButtonColor: colors.contrast,
        toolbarButtonBorderRadius: '0.5rem',
        ...removeUndefined(styleOverrides),
    };

    // Function to handle successful loading of the document
    const onDocumentLoadSuccess = ({numPages}: {numPages: number}) => {
        setNumPages(numPages);
    };

    // useEffect(() => {
    //     // parse data object to file object which can be consumed by react-pdf. we run it only once when data is set
    //     setPdfData({data: new Uint8Array(data)});
    // }, [data]);

    // Function to calculate the target page based on the highlights
    useEffect(() => {
        if (data) {
            let targetPage = 1; // default to first page

            // Set target page based on the provided page prop
            if (page) {
                targetPage = page;

            // Otherwise, set target page based on the most frequent page in the highlights
            } else if (highlights && highlights.length > 0) {
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

    const changePageTo = (newPage: number) => setPageNumber(newPage);
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
    const containerRefFullScreen = useRef<HTMLDivElement | null>(null);

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
        containerRefFullScreen.current?.focus();
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

    // Function to create a copy of the Uint8Array
    const duplicateUint8Array = (original: Uint8Array) => {
        const copy = new Uint8Array(original.length);
        copy.set(original);
        return copy;
    };

    const pdfDataCopy = duplicateUint8Array(data);

    const content = (
        <FileViewerContainer
            fileName={fileName ?? ""}
            optionsLeft={[
                {
                    label: "Page selection",
                    icon: <PageSwitcher
                        style={style}
                        pageNumber={pageNumber}
                        numPages={numPages}
                        previousPage={wrappedActions.previousPage}
                        nextPage={wrappedActions.nextPage}
                        changePageTo={changePageTo}
                    />,
                }
            ]}
            optionsRight={[
                {
                    label: "Rotate Page",
                    icon: <RotatePdf
                        rotatePage={wrappedActions.rotatePage}
                        isDisabled={numPages === null}
                        style={style}
                    />,
                    onClick: wrappedActions.rotatePage,
                },
                {
                    label: "Zoom",
                    icon: <ZoomInAndOut
                        zoomIn={wrappedActions.zoomIn}
                        zoomOut={wrappedActions.zoomOut}
                        scale={scale}
                        style={style}
                        isLoaded={numPages !== null}
                    />,
                },
                {
                    label: "Fit document to parent",
                    icon: <FitPdfContentToParentContainer
                        style={style}
                        fitParent={wrappedActions.fitParent}
                        isLoaded={numPages !== null}
                    />,
                    onClick: wrappedActions.fitParent,
                },
            ]}
            contentToShowOnFullScreen={
                <FileViewerContainer
                    fileName={fileName ?? ""}
                    optionsLeft={[
                        {
                            label: "Page selection",
                            icon: <PageSwitcher
                                style={style}
                                pageNumber={pageNumber}
                                numPages={numPages}
                                previousPage={wrappedActions.previousPage}
                                nextPage={wrappedActions.nextPage}
                                changePageTo={changePageTo}
                            />,
                        }
                    ]}
                    optionsRight={[
                        {
                            label: "Rotate Page",
                            icon: <RotatePdf
                                rotatePage={wrappedActions.rotatePage}
                                isDisabled={numPages === null}
                                style={style}
                            />,
                            onClick: wrappedActions.rotatePage,
                        },
                        {
                            label: "Zoom",
                            icon: <ZoomInAndOut
                                zoomIn={wrappedActions.zoomIn}
                                zoomOut={wrappedActions.zoomOut}
                                scale={scale}
                                style={style}
                                isLoaded={numPages !== null}
                            />,
                        },
                        {
                            label: "Fit document to parent",
                            icon: <FitPdfContentToParentContainer
                                style={style}
                                fitParent={wrappedActions.fitParent}
                                isLoaded={numPages !== null}
                            />,
                            onClick: wrappedActions.fitParent,
                        },
                    ]}
                >
                    <div
                        className="h-full w-full flex flex-col focus:outline-none"
                        // tabIndex enables the div to receive focus, -1 keeps it out of tab order
                        tabIndex={-1}
                        ref={(element: HTMLDivElement | null) => {
                            if (element) {
                                containerRefFullScreen.current = element;
                                combineRefs(element);
                            }
                        }}
                        style={{
                            color: style.color,
                            fontFamily: style.fontFamily,
                            backgroundColor: style.contentBackground,
                        }}
                    >
                        <div
                            className="flex justify-center items-start flex-grow overflow-auto relative w-full"
                            style={{
                                textAlign: 'center',
                                padding: style.contentPadding,
                                backgroundColor: style.contentBackground,
                                borderBottomRightRadius: style.borderRadius,
                                borderBottomLeftRadius: style.borderRadius
                            }}
                            ref={documentContainerRefFullScreen}
                        >
                            <PdfDocument
                                data={{data: pdfDataCopy}}
                                renderedPageNumber={renderedPageNumber}
                                pageNumber={pageNumber}
                                scale={scale}
                                rotate={rotate}
                                highlights={highlights}
                                canvasDimensions={canvasDimensions}
                                onDocumentLoadSuccess={onDocumentLoadSuccess}
                                onDocumentLoadError={onDocumentLoadError}
                                onPageLoadSuccess={onPageLoadSuccess}
                                setRenderedPageNumber={setRenderedPageNumber}
                            />
                        </div>
                    </div>
                </FileViewerContainer>
            }
        >
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
                    color: style.color,
                    fontFamily: style.fontFamily,
                    backgroundColor: style.contentBackground,
                }}
            >
                <div
                    className="flex justify-center items-start flex-grow overflow-auto relative w-full"
                    // className="grid auto-cols-auto items-center content-center justify-items-center justify-content-center overflow-auto w-full"
                    style={{
                        textAlign: 'center',
                        // padding: style.contentPadding,
                        backgroundColor: style.contentBackground,
                        borderBottomRightRadius: style.borderRadius,
                        borderBottomLeftRadius: style.borderRadius
                    }}
                    ref={documentContainerRef}
                >
                    <PdfDocument
                        data={pdfData}
                        renderedPageNumber={renderedPageNumber}
                        pageNumber={pageNumber}
                        scale={scale}
                        rotate={rotate}
                        highlights={highlights}
                        canvasDimensions={canvasDimensions}
                        onDocumentLoadSuccess={onDocumentLoadSuccess}
                        onDocumentLoadError={onDocumentLoadError}
                        onPageLoadSuccess={onPageLoadSuccess}
                        setRenderedPageNumber={setRenderedPageNumber}
                    />
                </div>
            </div>
        </FileViewerContainer>
    );

    return (
        content
    );
}

type PropsPdfDocument = {
    data: { data: File } | undefined;
    renderedPageNumber: number;
    pageNumber: number;
    scale: number;
    rotate: number;
    highlights?: PDFHighlight[];
    canvasDimensions: CanvasDimensions;
    onDocumentLoadSuccess: ({numPages}: { numPages: number }) => void;
    onDocumentLoadError: () => void;
    onPageLoadSuccess: (page: PDFPageProxy) => void,
    setRenderedPageNumber: (pageNUmber: number) => void;
}
const PdfDocument: FC<PropsPdfDocument> = (props) => {
    const {
        data,
        renderedPageNumber,
        pageNumber,
        scale,
        rotate,
        canvasDimensions,
        onDocumentLoadSuccess,
        onDocumentLoadError,
        onPageLoadSuccess,
        setRenderedPageNumber,
    } = props;

    return (
        <Document
            file={data as File}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="w-full h-full"
            noData={<div>No data</div>}
        >
            <div
                className={"relative inline-block"}
            >
                {renderedPageNumber !== pageNumber ? (
                    //* Render the previous page to avoid flickering when changing pages, see https://github.com/wojtekmaj/react-pdf/issues/418 */
                    <Page
                        key={renderedPageNumber}
                        pageNumber={renderedPageNumber}
                        scale={scale}
                        className="max-w-full max-h-full block shadow-lg"
                        renderMode="canvas"
                        rotate={rotate}
                        onLoadSuccess={onPageLoadSuccess}
                    />
                ) : null}
                <Page
                    key={pageNumber}
                    pageNumber={pageNumber}
                    scale={scale}
                    className={`${renderedPageNumber !== pageNumber ? 'hidden' : ''} max-w-full max-h-full block shadow-lg`}
                    renderMode="canvas"
                    rotate={rotate}
                    onLoadSuccess={onPageLoadSuccess}
                    onRenderSuccess={() => {
                        setRenderedPageNumber(pageNumber);
                    }}
                />
                {props.highlights && props.highlights.filter((highlight) => highlight.page === pageNumber).map((highlight, index) => (
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
    );
}
PdfDocument.displayName = "PdfDocument";

type PropsDocumentContainer = PropsWithChildren & {
    style: PdfViewerStyles;
    combineRefs: (element: HTMLDivElement) => void;
}
const DocumentContainer = forwardRef<ElementRef<"div">, PropsDocumentContainer>((props, ref) => {
    const {
        style,
        combineRefs,
        children,
    } = props;

    // Each useHotkeys() call returns a function ref that activates its hotkey when the element receives focus
    // See: https://react-hotkeys-hook.vercel.app/docs/documentation/useHotkeys/scoping-hotkeys
    const containerRef = useRef<HTMLDivElement | null>(null);

    // const documentContainerRef = useRef<HTMLDivElement | null>(null); // Ref to the container to calculate the size dynamically

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
                color: style.color,
                fontFamily: style.fontFamily,
                backgroundColor: style.contentBackground,
            }}
        >
            <div
                className="flex justify-center items-start flex-grow overflow-auto relative w-full"
                style={{
                    textAlign: 'center',
                    padding: style.contentPadding,
                    backgroundColor: style.contentBackground,
                    borderBottomRightRadius: style.borderRadius,
                    borderBottomLeftRadius: style.borderRadius
                }}
                ref={ref}
            >
                {children}
            </div>
        </div>
    );
})
DocumentContainer.displayName = "DocumentContainer";

export {PdfViewer};
