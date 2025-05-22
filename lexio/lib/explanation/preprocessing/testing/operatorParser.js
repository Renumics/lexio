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

        // Helper function to normalize coordinates and convert to top-left system
        const normalize = (box) => {
            const normalizedBox = {
                x: (box.x / pageW) * 100,
                y: ((pageH - box.y - box.height) / pageH) * 100,  // Convert to top-left
                width: (box.width / pageW) * 100,
                height: (box.height / pageH) * 100
            };
            return normalizedBox;
        };

        for (let i = 0; i < opList.fnArray.length; i++) {
            const fn = opList.fnArray[i];
            const args = opList.argsArray[i];

            if (fn === pdfjsLib.OPS.transform) {
                ctm = args;
            }
            else if (fn === pdfjsLib.OPS.paintFormXObjectBegin) {
                try {
                    if (!Array.isArray(args) || args.length < 2) continue;

                    const formCTM = args[0];
                    const rect = args[1];

                    if (!Array.isArray(formCTM) || !Array.isArray(rect) || 
                        formCTM.length < 4 || rect.length < 4) continue;

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

                    // Skip full-page form objects
                    if (!(boxW === pageW && boxH === pageH && boxX === 0 && boxY === 0)) {
                        const rawBoundingBox = {
                            x: Number(boxX.toFixed(8)),
                            y: Number(boxY.toFixed(8)),
                            width: Number(boxW.toFixed(1)),
                            height: Number(boxH.toFixed(1))
                        };

                        elements.push({
                            type: 'FormXObject',
                            pageNumber: pageNum,
                            boundingBox: normalize(rawBoundingBox),
                            rawBoundingBox, // Keep the original coordinates for reference
                            pageDimensions: {
                                width: pageW,
                                height: pageH
                            },
                            originalDimensions: {
                                width: w0,
                                height: h0
                            },
                            transformMatrix: formCTM,
                            operatorInfo: {
                                operator: 'paintFormXObjectBegin',
                                args: Array.from(args)
                            }
                        });
                    }
                } catch (error) {
                    debugLog('Error processing FormXObject:', error);
                }
            }
            else if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
                try {
                    const [a, , , d, e, f] = ctm;
                    let boxX = e;
                    let boxY = f;
                    let boxW = Math.abs(a);
                    let boxH = Math.abs(d);

                    if (d < 0) {
                        boxY = boxY + d;
                    }

                    const imageName = args[0];
                    let imageData = null;

                    try {
                        imageData = await new Promise((resolve) => {
                            page.objs.get(imageName, (img) => {
                                resolve({
                                    width: img.width,
                                    height: img.height,
                                    bitsPerComponent: img.bitsPerComponent,
                                    colorSpace: img.colorSpace,
                                    compression: img.compression,
                                    dataSize: img.data ? img.data.length : 0
                                });
                            });
                        });
                    } catch (imgError) {
                        debugLog('Error getting image data:', imgError);
                    }

                    const rawBoundingBox = {
                        x: Number(boxX.toFixed(8)),
                        y: Number(boxY.toFixed(8)),
                        width: Number(boxW.toFixed(1)),
                        height: Number(boxH.toFixed(1))
                    };

                    elements.push({
                        type: 'Image',
                        pageNumber: pageNum,
                        boundingBox: normalize(rawBoundingBox),
                        rawBoundingBox, // Keep the original coordinates for reference
                        pageDimensions: {
                            width: pageW,
                            height: pageH
                        },
                        originalDimensions: {
                            width: args[1] || null,
                            height: args[2] || null
                        },
                        operatorInfo: {
                            operator: fn === pdfjsLib.OPS.paintImageXObject ? 'paintImageXObject' : 'paintJpegXObject',
                            args: Array.from(args)
                        },
                        imageData
                    });
                } catch (error) {
                    debugLog('Error processing Image:', error);
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