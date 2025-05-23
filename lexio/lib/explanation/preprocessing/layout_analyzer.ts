import { TextItem, LineBox } from './types';

/**
 * Detects column boundaries in the document based on text item positions
 */
function detectColumns(allItems: TextItem[]): Array<{left: number, right: number}> {
  // Get all unique left positions (with some tolerance to account for slight variations)
  const tolerance = 5; // pixels
  const leftPositions = new Set<number>();
  
  allItems.forEach(item => {
    // Round to nearest tolerance to group similar positions
    const roundedLeft = Math.round(item.position.left / tolerance) * tolerance;
    leftPositions.add(roundedLeft);
  });

  // Sort positions to find distinct columns
  const sortedLefts = Array.from(leftPositions).sort((a, b) => a - b);
  
  // Group into columns by finding gaps
  const columns: Array<{left: number, right: number}> = [];
  let currentColumn: {left: number, right: number} | null = null;
  
  allItems.forEach(item => {
    const itemLeft = item.position.left;
    const itemRight = item.position.left + item.position.width;
    
    if (!currentColumn) {
      currentColumn = { left: itemLeft, right: itemRight };
    } else {
      // If this item is significantly to the right of current column's right edge,
      // it's probably a new column
      if (itemLeft > currentColumn.right + 20) { // 20px gap threshold
        columns.push(currentColumn);
        currentColumn = { left: itemLeft, right: itemRight };
      } else {
        // Update column boundaries
        currentColumn.right = Math.max(currentColumn.right, itemRight);
      }
    }
  });
  
  if (currentColumn) {
    columns.push(currentColumn);
  }
  
  return columns;
}

/**
 * Checks if a text item appears to be a section header based on various characteristics
 */
export function isSectionHeader(item: TextItem, allItems: TextItem[], lineBoxes?: (LineBox | null)[]): boolean {
  // Detect column structure once
  const columns = detectColumns(allItems);
  
  // Find which column this item belongs to
  const itemColumn = columns.find(col => 
    item.position.left >= col.left - 5 && // small tolerance
    (item.position.left + item.position.width) <= col.right + 5
  );
  
  // Check if text is on its own line within its column
  const isOnSeparateLine = allItems.every(other => {
    if (other === item) return true;

    // First check if items are on different pages
    if (other.page !== item.page) return true;

    const columnWidth = 300;
    const itemColumn = Math.floor(item.position.left / columnWidth);
    const otherColumn = Math.floor(other.position.left / columnWidth);
    if (itemColumn !== otherColumn) return true;

    // Now check vertical overlap only for items in same page and column
    const sameVerticalRange = 
      Math.abs(other.position.top - item.position.top) < item.position.height &&
      Math.abs((other.position.top + other.position.height) - 
               (item.position.top + item.position.height)) < item.position.height;
    
    return !sameVerticalRange;
  });

  // Section number detection (including Roman numerals and subsections)
  const hasSectionNumber = /^(?:(?:[IVX]+|[A-Z]|[0-9]+)\.)\s+/.test(item.text);
  
  // Calculate font height metrics
  const height = item.position.height;
  const avgHeight = allItems.reduce((sum, i) => sum + i.position.height, 0) / allItems.length;
  
  // Check if significantly larger
  const isSignificantlyLarger = height > avgHeight * 1.3;
  
  // Check if text is near page top
  const isNearPageTop = item.position.top < (item.position.pageHeight * 0.15);
  
  // Enhanced vertical spacing check
  let hasExtraWhitespace = false;
  if (lineBoxes) {
    const currentIndex = allItems.indexOf(item);
    const prevBox = currentIndex > 0 ? lineBoxes[currentIndex - 1] : null;
    const nextBox = currentIndex < lineBoxes.length - 1 ? lineBoxes[currentIndex + 1] : null;
    
    if (prevBox && nextBox) {
      const avgLineSpacing = calculateAverageLineSpacing(lineBoxes);
      const spacingAbove = Math.abs(item.position.top - prevBox.y);
      const spacingBelow = Math.abs(nextBox.y - (item.position.top + item.position.height));
      hasExtraWhitespace = 
        spacingAbove > avgLineSpacing * 1.5 || 
        spacingBelow > avgLineSpacing * 1.5;
    }
  }
  
  // Check if text is all caps (excluding numbers and punctuation)
  const isAllCaps = /^[A-Z][A-Z0-9\s.,!?-]*$/.test(item.text.trim()) && 
                   item.text.length > 3 && item.text.length < 100;

  // Basic validation
  const isReasonableLength = item.text.length > 0 && item.text.length < 100;
  const isNotJustWhitespace = item.text.trim().length > 0;
  const hasLetters = /[A-Za-z]/.test(item.text);

  // Combined decision logic focusing on structural characteristics
  return isReasonableLength && 
         isNotJustWhitespace && 
         hasLetters &&
         (
           // Primary indicators
           (hasSectionNumber && isOnSeparateLine) ||
           
           // Strong formatting indicators
           (isSignificantlyLarger && isOnSeparateLine && hasExtraWhitespace) ||
           
           // Special cases
           (isNearPageTop && isSignificantlyLarger) ||
           (isAllCaps && isOnSeparateLine && hasExtraWhitespace)
         );
}

/**
 * Helper function to calculate average line spacing in the document
 */
function calculateAverageLineSpacing(lineBoxes: (LineBox | null)[]): number {
  let totalSpacing = 0;
  let spacingCount = 0;
  
  for (let i = 1; i < lineBoxes.length; i++) {
    const current = lineBoxes[i];
    const prev = lineBoxes[i - 1];
    if (current && prev) {
      totalSpacing += Math.abs(current.y - prev.y);
      spacingCount++;
    }
  }
  
  return spacingCount > 0 ? totalSpacing / spacingCount : 0;
}

/**
 * Detects if a text item is likely part of a figure/graph
 * (e.g. axis labels, data points, etc.)
 */
export function isGraphElement(item: TextItem, allItems: TextItem[]): boolean {
  // Calculate average height across all items
  const avgHeight = allItems.reduce((sum, i) => sum + i.position.height, 0) / allItems.length;
  
  // Check if this item is significantly smaller than average (e.g. 0.7x or less)
  const heightRatio = item.position.height / avgHeight;
  const isSignificantlySmaller = heightRatio <= 0.7;
  
  // Check if text matches patterns commonly found in graphs
  const isNumericValue = /^-?\d*\.?\d+$/.test(item.text.trim());  // Matches numbers like 0.4, -0.3, 42, etc.
  const isAxisLabel = /^[0-9.]+[A-Za-z%]?$/.test(item.text.trim());  // Matches things like "0.4%", "100k", etc.
  
  return isSignificantlySmaller && (isNumericValue || isAxisLabel);
}