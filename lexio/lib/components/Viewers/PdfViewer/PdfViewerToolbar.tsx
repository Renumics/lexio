import {ViewerToolbar, ViewerToolbarStyles} from "../ViewerToolbar.tsx";
import {CanvasDimensions} from "../types.ts";
import {ArrowUturnDownIcon, ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/solid";
import {useEffect, useState} from "react";

/**
 * PdfViewerToolbarProps interface
 */
export interface PdfViewerToolbarProps {
    numPages: number | null;
    pageNumber: number | null;
    scale: number;
    rotate: number;
    canvasDimensions: CanvasDimensions;
    documentContainerRef: React.RefObject<HTMLDivElement>;
    wrappedActions: {
        previousPage: () => void;
        nextPage: () => void;
        rotatePage: () => void;
        zoomIn: () => void;
        zoomOut: () => void;
        fitParent: () => void;
    }
    style: ViewerToolbarStyles;
    changePageTo: (pageNumber: number) => void;
}

/**
 * PdfViewerToolbar component extends ViewerToolbar and adds the functionality to navigate through the pages of the PDF
 *
 * @internal
 *
 * @param numPages - Total number of pages in the PDF, null if Document is not loaded
 * @param pageNumber - Current page number
 * @param scale - Current scale value
 * @param canvasDimensions - Dimensions of the canvas
 * @param rotate - Current rotation value
 * @param documentContainerRef - Reference to the document container to calculate the scale percentage
 * @param wrappedActions - Wrapped actions for the toolbar
 * @param style - Style overrides for the toolbar
 * @constructor
 */
const PdfViewerToolbar = ({
    numPages,
    pageNumber,
    scale,
    canvasDimensions,
    rotate,
    documentContainerRef,
    wrappedActions,
    style,
    changePageTo,
}: PdfViewerToolbarProps) => {
    const [pageNumberInput, setPageNumberInput] = useState<string>('');
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

    // Update the page number input when the page number changes
    useEffect(() => {
        setPageNumberInput(pageNumber?.toString() || '');
    }, [pageNumber]);

    // Set the page number from the input field
    const setPageNumberFromInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (numPages === null) {
            return;
        }
        if (e.key === 'Enter') {
            const inputValue = (e.target as HTMLInputElement).value;
            // Reset input value to current page number if input is empty
            if (inputValue === '') {
                setPageNumberInput(pageNumber?.toString() || '');
                return;
            }

            // Parse input value to integer and clamp it to the allowed range
            const newPageNumber = parseInt(inputValue, 10);
            if (!isNaN(newPageNumber)) {
                // Clamp value between 1 and numPages
                const clampedPageNumber = Math.max(1, Math.min(newPageNumber, numPages!));
                changePageTo(clampedPageNumber);
                setPageNumberInput(clampedPageNumber.toString());
            }
        }
    };

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
                    <div className="m-auto px-1"
                        style={{
                            color: style.toolbarTextColor,
                            backgroundColor: style.toolbarChipBackground,
                            borderRadius: style.toolbarChipBorderRadius,
                        }}
                    >
                        {numPages !== null ? (
                            <>
                                <input
                                    type="text"
                                    pattern="[0-9]*"
                                    value={pageNumberInput}
                                    onChange={(e) => setPageNumberInput(e.target.value)}
                                    onKeyDown={setPageNumberFromInput}
                                    className="text-center rounded-md mx-1 w-8"
                                    style={{
                                        backgroundColor: style.toolbarChipInputBackground,
                                    }}
                                    defaultValue={pageNumber || (numPages ? 1 : '--')}
                                    placeholder="Page"
                                    aria-label="Enter page number"
                                    aria-live="polite"
                                /> /
                                <span className="text-gray-600 mx-1"> {numPages || '--'}</span>
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
};

export {PdfViewerToolbar};