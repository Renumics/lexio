import { useEffect, useState } from "react";
import { PDFHighlight } from "../../../types.ts";
import { CanvasDimensions } from "../types.ts";

/**
 * Default styling for PDF highlight overlays.
 * 
 * @internal
 */
const highlightStyleDefaults = {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    border: '1px solid rgba(255, 255, 0, 0.6)',
    pointerEvents: 'none',
    pointer: 'select',
    borderRadius: '5px',
    zIndex: 100,
};

/**
 * Props for the Highlight component.
 * 
 * @interface HighlightProps
 * @property {PDFHighlight["rect"]} rect - Rectangle coordinates defining the highlight position and size. Coordinates are in top-left coordinate system as defined in Rect.
 * @property {number} scale - Current zoom scale of the PDF viewer
 * @property {number} rotate - Current rotation of the PDF page in degrees. Allowed values are 0, 90, 180, and 270.
 * @property {CanvasDimensions} canvasDimensions - Current dimensions of the PDF page canvas
 */
interface HighlightProps {
    rect: PDFHighlight["rect"];
    scale: number;
    rotate: number;
    canvasDimensions: CanvasDimensions;
}

/**
 * Component for rendering highlight overlays on PDF pages.
 * Used internally by the PDFViewer to display search results or annotations.
 * 
 * @component
 * @param {HighlightProps} props - The props for the Highlight component
 * @returns {JSX.Element} A div element positioned absolutely over the PDF content
 * 
 * @remarks
 * - Handles coordinate transformation for different page rotations (0°, 90°, 180°, 270°)
 * - Automatically scales with PDF zoom level
 * - Uses semi-transparent yellow styling by default
 */
const Highlight = ({
    rect,
    scale,
    rotate,
    canvasDimensions,   
}: HighlightProps) => {
    const [highlightStyle, setHighlightStyle] = useState({});

    /**
     * Transforms PDF coordinates to screen coordinates, handling different page rotations.
     * 
     * @param {PDFHighlight["rect"]} rect - Rectangle in PDF coordinate space
     * @param {number} rotate - Page rotation in degrees
     * @returns {Object} Transformed coordinates in screen space
     * 
     * @remarks
     * - Handles all possible page rotations (0°, 90°, 180°, 270°)
     * - Normalizes negative rotations to their positive counterparts
     */
    const transformCoordinates = (rect: PDFHighlight["rect"], rotate: number) => {
        const { top, left, width, height } = rect;
        
        // Convert negative rotations to their positive counterparts
        // -90° -> 270°, -180° -> 180°, -270° -> 90°
        const normalizedRotate = ((rotate % 360) + 360) % 360;

        switch (normalizedRotate) {
            case 90:
                return {
                    // For 90° clockwise (original -270°):
                    top: left * canvasDimensions.width,
                    left: (1 - (top + height)) * canvasDimensions.height,
                    width: height * canvasDimensions.height,
                    height: width * canvasDimensions.width,
                };
            case 180:
                return {
                    // For 180° rotation (original -180°):
                    top: (1 - (top + height)) * canvasDimensions.height,
                    left: (1 - (left + width)) * canvasDimensions.width,
                    width: width * canvasDimensions.width,
                    height: height * canvasDimensions.height,
                };
            case 270:
                return {
                    // For 270° clockwise (original -90°):
                    top: (1 - (left + width)) * canvasDimensions.width,
                    left: top * canvasDimensions.height,
                    width: height * canvasDimensions.height,
                    height: width * canvasDimensions.width,
                };
            default: // 0° rotation
                return {
                    top: top * canvasDimensions.height,
                    left: left * canvasDimensions.width,
                    width: width * canvasDimensions.width,
                    height: height * canvasDimensions.height,
                };
        }
    };

    useEffect(() => {
        const transformedRect = transformCoordinates(rect, rotate);

        const newStyle = {
            ...highlightStyleDefaults,
            top: `${transformedRect.top * scale}px`,
            left: `${transformedRect.left * scale}px`,
            width: `${transformedRect.width * scale}px`,
            height: `${transformedRect.height * scale}px`,
        };
        
        setHighlightStyle(newStyle);
    }, [rect, scale, rotate, canvasDimensions]);

    return <div style={highlightStyle}></div>;
};

export { Highlight };
