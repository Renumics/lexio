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
        args: any[];  // Updated to be an array type
    };
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
 * Parses a PDF file to extract images and Form XObjects
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
                const rect = args[1] as number[];
                
                if (!Array.isArray(formCTM) || !Array.isArray(rect) || 
                    formCTM.length < 4 || rect.length < 4) {
                    continue;
                }

                const [x0, y0, w0, h0] = rect;
                const [formA, , , formD] = formCTM;
                const [, , , , currentE, currentF] = ctm;

                let boxX = currentE + x0 * formA;
                let boxY = currentF + y0 * formD;
                let boxW = w0 * Math.abs(formA);
                let boxH = h0 * Math.abs(formD);

                if (formD < 0) {
                    boxY = boxY + boxH;
                }

                if (!(boxW === pageW && boxH === pageH && boxX === 0 && boxY === 0)) {
                    elements.push({
                        type: 'FormXObject',
                        pageNumber: pageNum,
                        boundingBox: {
                            x: Number(boxX.toFixed(8)),
                            y: Number(boxY.toFixed(8)),
                            width: Number(boxW.toFixed(1)),
                            height: Number(boxH.toFixed(1))
                        },
                        operatorInfo: {
                            operator: 'paintFormXObjectBegin',
                            args: Array.from(args)  // Convert to regular array
                        }
                    });
                }
            }
            else if (fn === OPS.paintImageXObject) {
                const [a, , , d, e, f] = ctm;
                let boxX = e;
                let boxY = f;
                let boxW = Math.abs(a);
                let boxH = Math.abs(d);

                if (d < 0) {
                    boxY = boxY + d;
                }

                elements.push({
                    type: 'Image',
                    pageNumber: pageNum,
                    boundingBox: {
                        x: Number(boxX.toFixed(8)),
                        y: Number(boxY.toFixed(8)),
                        width: Number(boxW.toFixed(1)),
                        height: Number(boxH.toFixed(1))
                    },
                    operatorInfo: {
                        operator: 'paintImageXObject',
                        args: Array.from(args)  // Convert to regular array
                    }
                });
            }
        }
    }

    return {
        metadata: {
            file: file.name,
            numPages
        },
        total: elements.length,
        elements
    };
}