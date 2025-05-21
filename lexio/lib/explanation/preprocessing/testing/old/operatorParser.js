// Remove text-related functions and config dependency
const debugLog = (...args) => {
    // Simple debug flag, can be changed as needed
    const DEBUG = false;
    if (DEBUG) {
        console.log(...args);
    }
};

/**
 * Parses a PDF file to extract images and Form XObjects
 */
async function parseVisualElements(file) {
    debugLog(`Starting PDF visual elements parsing: ${file.name}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const elements = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        const pageW = viewport.width;
        const pageH = viewport.height;
        const opList = await page.getOperatorList();
        let ctm = [1, 0, 0, 1, 0, 0];

        for (let i = 0; i < opList.fnArray.length; i++) {
            const fn = opList.fnArray[i];
            const args = opList.argsArray[i];

            if (fn === pdfjsLib.OPS.transform) {
                ctm = args;
            }
            else if (fn === pdfjsLib.OPS.paintFormXObjectBegin) {
                try {
                    // Add safety checks for args
                    if (!Array.isArray(args) || args.length < 2 || !args[0] || !args[1]) {
                        debugLog('Invalid FormXObject args:', args);
                        continue;
                    }

                    const formCTM = args[0];
                    const rect = args[1];

                    // Ensure we have valid arrays
                    if (!Array.isArray(formCTM) || !Array.isArray(rect) || 
                        formCTM.length < 4 || rect.length < 4) {
                        debugLog('Invalid FormXObject arrays:', { formCTM, rect });
                        continue;
                    }

                    const [x0, y0, w0, h0] = rect;
                    const [formA, , , formD] = formCTM;
                    const [, , , , currentE, currentF] = ctm;

                    // Check for valid numbers
                    if ([x0, y0, w0, h0, formA, formD, currentE, currentF].some(n => typeof n !== 'number')) {
                        debugLog('Invalid FormXObject numbers:', { x0, y0, w0, h0, formA, formD, currentE, currentF });
                        continue;
                    }

                    let boxX = currentE + x0 * formA;
                    let boxY = currentF + y0 * formD;
                    let boxW = w0 * Math.abs(formA);
                    let boxH = h0 * Math.abs(formD);

                    if (formD < 0) {
                        boxY = boxY + boxH;
                    }

                    // Skip the root form and invalid dimensions
                    if (boxW <= 0 || boxH <= 0 || 
                        (boxW === pageW && boxH === pageH && boxX === 0 && boxY === 0)) {
                        continue;
                    }

                    elements.push({
                        type: 'FormXObject',
                        pageNumber: pageNum,
                        boundingBox: { x: boxX, y: boxY, width: boxW, height: boxH },
                        operatorInfo: { operator: 'paintFormXObjectBegin', args }
                    });
                } catch (error) {
                    debugLog('Error processing FormXObject:', error);
                    continue;
                }
            }
            else if (fn === pdfjsLib.OPS.paintImageXObject) {
                try {
                    // Add safety checks for image processing
                    if (!Array.isArray(ctm) || ctm.length < 6) {
                        debugLog('Invalid image CTM:', ctm);
                        continue;
                    }

                    const [a, , , d, e, f] = ctm;

                    // Check for valid numbers
                    if ([a, d, e, f].some(n => typeof n !== 'number')) {
                        debugLog('Invalid image numbers:', { a, d, e, f });
                        continue;
                    }

                    let boxX = e;
                    let boxY = f;
                    let boxW = Math.abs(a);
                    let boxH = Math.abs(d);

                    if (d < 0) {
                        boxY = boxY + d;
                    }

                    // Skip invalid dimensions
                    if (boxW <= 0 || boxH <= 0) {
                        continue;
                    }

                    elements.push({
                        type: 'Image',
                        pageNumber: pageNum,
                        boundingBox: { x: boxX, y: boxY, width: boxW, height: boxH },
                        operatorInfo: { operator: 'paintImageXObject', args }
                    });
                } catch (error) {
                    debugLog('Error processing Image:', error);
                    continue;
                }
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

// Make only the parseVisualElements function available globally
window.parseVisualElements = parseVisualElements;