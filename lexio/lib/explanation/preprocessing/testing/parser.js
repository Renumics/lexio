// Debug configuration
window.DEBUG = true;  // You can set this to false to disable debug logging

// Debug logging utility
window.debugLog = function(...args) {
    if (window.DEBUG) {
        console.log(...args);
    }
};

// Helper function to apply viewport transform to coordinates
window.applyTransform = function(point, transform) {
    const x = transform[0] * point[0] + transform[2] * point[1] + transform[4];
    const y = transform[1] * point[0] + transform[3] * point[1] + transform[5];
    return [x, y];
};

// Main PDF parser function
window.parsePdfWithMarker = async function(file) {
    debugLog(`Starting PDF parsing: ${file.name}`);

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    debugLog(`PDF loaded successfully. Total pages: ${numPages}`);

    const blocks = {
        block_type: "Document",
        children: [],
    };

    // Process each page
    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });

        // Group text items by their vertical position to form lines
        const lines = [];
        let currentLine = [];
        let lastY = null;
        const Y_THRESHOLD = 5; // pixels threshold for considering items on the same line
        let currentPosition = 0;

        content.items.forEach((item) => {
            const [x, y] = applyTransform([item.transform[4], item.transform[5]], viewport.transform);
            
            const textItem = {
                text: item.str,
                position: {
                    top: y / viewport.height,
                    left: x / viewport.width,
                    width: (item.width || item.str.length * 5) / viewport.width,
                    height: (item.height || 12) / viewport.height
                },
                startIndex: currentPosition,
                endIndex: currentPosition + item.str.length
            };
            currentPosition += item.str.length + 1; // +1 for space

            if (lastY === null || Math.abs(y - lastY) < Y_THRESHOLD) {
                currentLine.push(textItem);
            } else {
                if (currentLine.length > 0) {
                    lines.push([...currentLine]);
                }
                currentLine = [textItem];
            }
            lastY = y;
        });

        // Don't forget the last line
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }

        // Create a block for the page
        blocks.children.push({
            id: `page_${i}`,
            block_type: "Page",
            text: content.items.map((item) => item.str).join(" "),
            textItems: lines,
            page: i,
        });
    }

    const metadata = {
        numPages,
        fileName: file.name,
    };

    debugLog('PDF parsing completed successfully');
    //console.log(blocks);
    //console.log(metadata);
    return { blocks, metadata };
}; 