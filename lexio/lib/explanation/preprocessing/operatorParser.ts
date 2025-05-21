import { pdfjs } from 'react-pdf';
import config from '../config';
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

export interface VisualElement {
    type: 'Image' | 'FormXObject';
    pageNumber: number;
    boundingBox: BoundingBox;
    operatorInfo: {
        operator: string;
        args: any[];
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
                    formCTM.length < 6 || rect.length < 4) {
                    continue;
                }

                const [x0, y0, w0, h0] = rect;
                const [formA, formB, formC, formD, formE, formF] = formCTM;
                const [ctmA, ctmB, ctmC, ctmD, ctmE, ctmF] = ctm;
                const pageViewport = page.getViewport({ scale: 1.0 });

                debugLog('Processing FormXObject:', {
                    input: {
                        rect: [x0, y0, w0, h0],
                        formCTM,
                        ctm,
                        viewport: {
                            width: pageViewport.width,
                            height: pageViewport.height
                        }
                    }
                });

                // First apply form matrix to get initial box
                let boxX = x0 * formA + formE;
                let boxY = y0 * formD + formF;
                let boxW = w0 * Math.abs(formA);
                let boxH = h0 * Math.abs(formD);

                // Then apply CTM
                const finalX = boxX * ctmA + ctmE;
                const finalY = boxY * ctmD + ctmF;
                const finalW = boxW * Math.abs(ctmA);
                const finalH = boxH * Math.abs(ctmD);

                // Convert to normalized coordinates (0-1 range)
                const normalizedX = finalX / pageViewport.width;
                const normalizedY = finalY / pageViewport.height;
                const normalizedW = finalW / pageViewport.width;
                const normalizedH = finalH / pageViewport.height;

                debugLog('Coordinate transformation:', {
                    initial: { x: boxX, y: boxY, w: boxW, h: boxH },
                    afterCTM: { x: finalX, y: finalY, w: finalW, h: finalH },
                    normalized: { x: normalizedX, y: normalizedY, w: normalizedW, h: normalizedH }
                });

                if (!(finalW === pageViewport.width && finalH === pageViewport.height && finalX === 0 && finalY === 0)) {
                    elements.push({
                        type: 'FormXObject',
                        pageNumber: pageNum,
                        boundingBox: {
                            x: Number(normalizedX.toFixed(8)),
                            y: Number(normalizedY.toFixed(8)),
                            width: Number(normalizedW.toFixed(8)),
                            height: Number(normalizedH.toFixed(8))
                        },
                        operatorInfo: {
                            operator: 'paintFormXObjectBegin',
                            args: Array.from(args)
                        }
                    });
                }
            }
            else if (fn === OPS.paintImageXObject) {
                const [a, b, c, d, e, f] = ctm;
                const pageViewport = page.getViewport({ scale: 1.0 });

                // Get dimensions directly from CTM
                let boxX = e;
                let boxY = f;
                let boxW = Math.abs(a);
                let boxH = Math.abs(d);

                // Convert to normalized coordinates (0-1 range)
                const normalizedX = boxX / pageViewport.width;
                const normalizedY = boxY / pageViewport.height;
                const normalizedW = boxW / pageViewport.width;
                const normalizedH = boxH / pageViewport.height;

                debugLog('Image transformation:', {
                    original: { x: boxX, y: boxY, w: boxW, h: boxH },
                    normalized: { x: normalizedX, y: normalizedY, w: normalizedW, h: normalizedH }
                });

                elements.push({
                    type: 'Image',
                    pageNumber: pageNum,
                    boundingBox: {
                        x: Number(normalizedX.toFixed(8)),
                        y: Number(normalizedY.toFixed(8)),
                        width: Number(normalizedW.toFixed(8)),
                        height: Number(normalizedH.toFixed(8))
                    },
                    operatorInfo: {
                        operator: 'paintImageXObject',
                        args: Array.from(args)
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