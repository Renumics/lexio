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
            else if (fn === OPS.paintFormXObjectBegin) {
                const formCTM = args[0] as number[];
                const [x0, y0, w0, h0] = args[1] as number[];
                
                // Use the form's CTM for scaling
                const [formA, , , formD] = formCTM;
                // Use the current CTM for positioning
                const [, , , , currentE, currentF] = ctm;

                // Calculate the final position using the current CTM for position
                let boxX = currentE + x0 * formA;
                let boxY = currentF + y0 * formD;
                let boxW = w0 * Math.abs(formA);
                let boxH = h0 * Math.abs(formD);

                // Adjust Y position if height is negative
                if (formD < 0) {
                    boxY = boxY + boxH;
                }

                // skip the "root" form (covers entire page)
                if (!(boxW === pageW && boxH === pageH && boxX === 0 && boxY === 0)) {
                    elements.push({
                        type: 'FormXObject',
                        pageNumber: pageNum,
                        boundingBox: { x: boxX, y: boxY, width: boxW, height: boxH },
                        operatorInfo: { operator: 'paintFormXObjectBegin', args }
                    });
                }
            }
            else if (fn === OPS.paintImageXObject) {
                const [a, , , d, e, f] = ctm;
                let boxX = e;
                let boxY = f;
                let boxW = Math.abs(a);  // Use absolute value for width
                let boxH = Math.abs(d);  // Use absolute value for height

                // Adjust Y position if height is negative
                if (d < 0) {
                    boxY = boxY + d;
                }

                elements.push({
                    type: 'Image',
                    pageNumber: pageNum,
                    boundingBox: { x: boxX, y: boxY, width: boxW, height: boxH },
                    operatorInfo: { operator: 'paintImageXObject', args }
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