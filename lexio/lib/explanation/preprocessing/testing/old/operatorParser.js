async function parseVisualElements(file) {
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

            try {
                if (fn === pdfjsLib.OPS.transform) {
                    ctm = args;
                }
                else if (fn === pdfjsLib.OPS.paintFormXObjectBegin || fn === pdfjsLib.OPS.paintImageXObject) {
                    const [a, , , d, e, f] = ctm;
                    
                    let boxX = e;
                    let boxY = f;
                    let boxW, boxH;

                    if (fn === pdfjsLib.OPS.paintImageXObject) {
                        boxW = a;
                        boxH = d;
                    } else {
                        // Form XObject:
                        const [, , w0, h0] = args[1];
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
                        type: fn === pdfjsLib.OPS.paintImageXObject ? 'Image' : 'FormXObject',
                        pageNumber: pageNum,
                        boundingBox: { x: boxX, y: boxY, width: boxW, height: boxH },
                        operatorInfo: { operator: fn === pdfjsLib.OPS.paintImageXObject ? 'paintImageXObject' : 'paintFormXObjectBegin', args }
                    });
                }
            } catch (error) {
                console.warn(`Warning: Error processing operator at page ${pageNum}, index ${i}:`, error);
                continue; // Skip this operator and continue with the next one
            }
        }
    }

    return {
        metadata: { file: file.name, numPages },
        total: elements.length,
        elements
    };
}

// Make sure the function is available globally
window.parseVisualElements = parseVisualElements;