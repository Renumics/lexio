import { TextItem, LineBox } from './types';

/**
 * Checks if a text item appears to be a section header based on various characteristics
 */
export function isSectionHeader(item: TextItem, allItems: TextItem[], lineBoxes?: (LineBox | null)[]): boolean {
  // Check for section numbers (including Roman numerals)
  const hasSectionNumber = /^(?:\d+\.|[IVX]+\.)\s+/.test(item.text);
  
  // Calculate font metrics relative to page dimensions
  const relativeHeight = item.position.height / item.position.pageHeight;
  const avgRelativeHeight = allItems.reduce((sum, i) => 
    sum + (i.position.height / i.position.pageHeight), 0) / allItems.length;
  
  // Strengthen relative size thresholds
  const isSignificantlyLarger = relativeHeight > avgRelativeHeight * 1.3;
  
  // Check if text is near page top (header position)
  const isNearPageTop = item.position.top > (item.position.pageHeight * 0.85); // Top 15% of page
  
  // Enhanced vertical spacing check using lineBoxes if available
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
  
  // Check if text is on its own line with enhanced position checking
  const isOnSeparateLine = allItems.every(other => {
    if (other === item) return true;
    const sameVerticalRange = 
      Math.abs(other.position.top - item.position.top) < item.position.height &&
      Math.abs((other.position.top + other.position.height) - 
               (item.position.top + item.position.height)) < item.position.height;
    return !sameVerticalRange;
  });

  // Basic text validation
  const isReasonableLength = item.text.length > 0 && item.text.length < 100;
  const isNotJustWhitespace = item.text.trim().length > 0;

  // Combined decision logic
  return isReasonableLength && 
         isNotJustWhitespace && 
         ((isSignificantlyLarger && isOnSeparateLine) || 
          (hasSectionNumber && isOnSeparateLine) ||
          (isNearPageTop && isSignificantlyLarger) ||
          (hasExtraWhitespace && isSignificantlyLarger));
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