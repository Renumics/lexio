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
                    // Check if args[1] exists and is an array
                    if (args && Array.isArray(args[1]) && args[1].length >= 4) {
                        const [, , w0, h0] = args[1];
                        const [a, , , d, e, f] = ctm;
                        const boxW = w0 * a;
                        const boxH = h0 * d;

                        // skip the "root" form (covers entire page)
                        if (!(boxW === pageW && boxH === pageH && e === 0 && f === 0)) {
                            elements.push({
                                type: 'FormXObject',
                                pageNumber: pageNum,
                                boundingBox: { x: e, y: f, width: boxW, height: boxH },
                                operatorInfo: { operator: 'paintFormXObjectBegin', args }
                            });
                        }
                    }
                }
                else if (fn === pdfjsLib.OPS.paintImageXObject) {
                    const [a, , , d, e, f] = ctm;
                    elements.push({
                        type: 'Image',
                        pageNumber: pageNum,
                        boundingBox: { x: e, y: f, width: a, height: d },
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