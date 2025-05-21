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
                else if (fn === pdfjsLib.OPS.paintFormXObjectBegin) {
                    const formCTM = args[0];
                    const [x0, y0, w0, h0] = args[1];
                    
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
                else if (fn === pdfjsLib.OPS.paintImageXObject) {
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