import { pdfjs } from 'react-pdf';
import config from '../../../config';
const { OPS } = pdfjs;

// Debug logging utility
const debugLog = (...args: any[]) => {
    if (config.DEBUG) {
        console.log(...args);
    }
};

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface VisualElement {
    type: 'Image' | 'FormXObject';
    pageNumber: number;
    boundingBox: BoundingBox;
    operatorInfo: {
        operator: string;
        args: any;
    };
}

interface TextItem {
    transform: number[];
    width: number;
    height: number;
    str: string;
}

interface ProcessedPageContent {
    visualElements: VisualElement[];
    filteredText: TextItem[];
}

interface ParserResult {
    metadata: {
        file: string;
        numPages: number;
    };
    total: number;
    elements: VisualElement[];
}

/**
 * Parses a PDF file to extract figures, Form XObjects, and filtered text content
 */
export async function parseVisualElements(file: File): Promise<ParserResult> {
    debugLog(`Starting PDF visual elements parsing: ${file.name}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const elements: VisualElement[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        const pageW = viewport.width;
        const pageH = viewport.height;

        const opList = await page.getOperatorList();
        let ctm: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];

        for (let i = 0; i < opList.fnArray.length; i++) {
            const fn = opList.fnArray[i];
            const args = opList.argsArray[i] as any;

            if (fn === OPS.transform) {
                ctm = args as [number, number, number, number, number, number];
            }
            else if (fn === OPS.paintFormXObjectBegin || fn === OPS.paintImageXObject) {
                const [a, , , d, e, f] = ctm;
                
                let boxX = e;
                let boxY = f;
                let boxW: number;
                let boxH: number;

                if (fn === OPS.paintImageXObject) {
                    boxW = a;
                    boxH = d;
                } else {
                    // Form XObject:
                    const [, , w0, h0] = args[1] as number[];
                    boxW = w0 * a;
                    boxH = h0 * d;

                    // skip the "root" form (covers entire page)
                    if (boxW === pageW && boxH === pageH && e === 0 && f === 0) {
                        continue;
                    }
                }

                // Adjust for negative height (flipped Y)
                if (boxH < 0) {
                    boxY = boxY + boxH;  // move Y down by the (negative) height
                    boxH = -boxH;        // make height positive
                }

                elements.push({
                    type: fn === OPS.paintImageXObject ? 'Image' : 'FormXObject',
                    pageNumber: pageNum,
                    boundingBox: { x: boxX, y: boxY, width: boxW, height: boxH },
                    operatorInfo: { operator: fn === OPS.paintImageXObject ? 'paintImageXObject' : 'paintFormXObjectBegin', args }
                });
            }
        }
    }

    debugLog(`Found ${elements.length} visual elements`);
    return {
        metadata: {
            file: file.name,
            numPages
        },
        total: elements.length,
        elements
    };
}

/**
 * Helper function to extract bounding box from operator arguments
 */
function extractBoundingBox(args: any[], viewport: any): BoundingBox {
    // Note: This is a simplified version. You might need to adjust the calculation
    // based on your specific PDF structure and needs
    return {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
    };
}