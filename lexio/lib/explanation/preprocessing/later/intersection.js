/**
 * Checks if two bounding boxes intersect using AABB intersection test
 * @param {Object} a - First bounding box with x, y, w, h
 * @param {Object} b - Second bounding box with x, y, w, h
 * @returns {boolean} - True if boxes intersect
 */
function intersects(a, b) {
    return !(
        a.x + a.w < b.x ||
        b.x + b.w < a.x ||
        a.y + a.h < b.y ||
        b.y + b.h < a.y
    );
}

/**
 * Finds text lines that intersect with visual elements
 * @param {Object} visualElements - Object containing visual elements data
 * @param {Object} textContent - Object containing text content data (with lineBoxes)
 * @returns {Object}
 */
function findIntersections(visualElements, textContent) {
    const intersections = [];
    
    // get all Page blocks
    const pages = textContent.blocks.children.filter(b => b.block_type === 'Page');

    pages.forEach(page => {
        const pageNumber = parseInt(page.id.replace('page_', ''), 10);
        const pageHeight = page.textItems[0]?.[0].position.pageHeight;
        if (!pageHeight) return;  // no text on this page

        // grab only visuals on this page
        const pageVisuals = visualElements.elements
            .filter(el => el.pageNumber === pageNumber)
            .map(el => {
                const bb = el.boundingBox;
                return {
                    x: bb.x,
                    y: bb.y,  // Using y directly since it's already in viewport coordinates
                    w: bb.width,
                    h: bb.height,
                    original: el
                };
            });

        // for each LINE box, test against each visual
        page.lineBoxes
            .filter(lb => lb.w > 0 && lb.h > 0)
            .forEach((lineBox, lineIndex) => {
                // Get the line text first
                const lineText = page.textItems[lineIndex]
                    .map(ti => ti.text).join('');
                
                // only consider "real" sentences, not equations/punctuation-only
                if (!/[\p{L}\p{N}]/u.test(lineText)) return;

                pageVisuals.forEach((viz, vizIndex) => {
                    if (intersects(lineBox, viz)) {
                        intersections.push({
                            pageNumber,
                            lineIndex,
                            lineText,
                            lineBox,
                            visualElement: viz.original,
                            visualElementIndex: vizIndex
                        });
                    }
                });
            });
    });

    return {
        intersections,
        totalIntersections: intersections.length,
        affectedPages: [...new Set(intersections.map(i => i.pageNumber))],
        visualElementsProcessed: visualElements.total
    };
}