import { TextItem } from './types';

/**
 * Checks if a text item appears to be a section header based on various characteristics
 */
export function isSectionHeader(item: TextItem, allItems: TextItem[]): boolean {
  // Check for section numbers (including Roman numerals)
  const hasSectionNumber = /^(?:\d+\.|[IVX]+\.)\s+/.test(item.text);
  
  // Check if it's a short phrase
  const isShortHeader = item.text.length < 50;
  
  // Calculate averages for font metrics
  const avgHeight = allItems.reduce((sum, i) => sum + i.position.height, 0) / allItems.length;
  const avgWidth = allItems.reduce((sum, i) => {
    const charWidth = i.position.width / i.text.length;
    return sum + charWidth;
  }, 0) / allItems.length;
  
  const thisCharWidth = item.position.width / item.text.length;
  
  // Adjust thresholds to be more lenient
  const isBold = thisCharWidth > avgWidth * 1.1;  // Reduced from 1.2
  const isLargerFont = item.position.height > avgHeight * 1.1;  // Reduced from 1.2
  
  // Improved header pattern to catch more cases
  const headerPattern = /^(?:[A-Z][A-Za-z\s-]*[A-Za-z])[:.]*$/;
  const isHeaderFormat = headerPattern.test(item.text.trim());
  
  // Check for new line (keeping existing logic)
  const isNewLine = allItems.every(other => {
    if (other === item) return true;
    const sameVerticalPosition = Math.abs(other.position.top - item.position.top) < 0.01;
    const isToTheLeft = other.position.left + other.position.width < item.position.left;
    return !sameVerticalPosition || !isToTheLeft;
  });
  
  // Improved academic header patterns
  const academicHeaderPatterns = [
    /^Abstract\b/i,
    /^(?:[A-Z]\.)\s+[A-Z][A-Za-z\s-]*/,  // Matches "A. Traffic Data Imputation"
    /^(?:I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|VIII\.|IX\.|X\.)\s*[A-Z][A-Za-z\s-]*/,
    /^Introduction\b/i,
    /^Related Work\b/i,
    /^Method(?:ology)?\b/i,
    /^(?:Experiments?|Results?|Discussion|Conclusion)\b/i,
    /^References\b/i
  ];
  
  const isAcademicHeader = academicHeaderPatterns.some(pattern => pattern.test(item.text.trim()));
  
  // Improved paper title detection
  const paperTitlePatterns = [
    /^(?:[A-Z][\w-]*(?:\s+(?:(?:[A-Z][\w-]*)|(?:[A-Z]{2,})|(?:is|the|and|or|in|on|of|to|for|with|by))){1,20}[:.!?]?)$/,
    /^(?:[A-Z][\w-]*(?:\s+(?:(?:[A-Z][\w-]*)|(?:[A-Z]{2,})|(?:Based|Using|via|for|with)))+)/,
  ];
  
  const isPaperTitle = paperTitlePatterns.some(pattern => pattern.test(item.text.trim()));
  const isNearTop = (item.position.top / item.position.pageHeight) < 0.2; // Top 20% of page
  const isPaperTitleHeader = isPaperTitle && isNearTop && (isLargerFont || isBold);

  // For regular section headers, we might want to check for vertical spacing
  const verticalGap = findMinVerticalGap(item, allItems);
  const hasExtraSpacing = verticalGap > avgHeight * 1.5; // More space around headers
  
  // Enhanced decision logic
  return hasSectionNumber || 
         isPaperTitleHeader ||
         (isAcademicHeader && isNewLine && hasExtraSpacing) ||
         (isShortHeader && isNewLine && (isLargerFont || isBold || isHeaderFormat)) ||
         (isHeaderFormat && isNewLine && (isLargerFont || isBold));
}

function findMinVerticalGap(item: TextItem, allItems: TextItem[]): number {
    const itemsAbove = allItems.filter(other => 
        other.position.top < item.position.top && 
        Math.abs(other.position.left - item.position.left) < item.position.width
    );
    const itemsBelow = allItems.filter(other => 
        other.position.top > item.position.top && 
        Math.abs(other.position.left - item.position.left) < item.position.width
    );
    
    const gapAbove = itemsAbove.length ? 
        Math.min(...itemsAbove.map(i => Math.abs(item.position.top - i.position.top))) : 
        Number.MAX_VALUE;
    const gapBelow = itemsBelow.length ? 
        Math.min(...itemsBelow.map(i => Math.abs(item.position.top - i.position.top))) : 
        Number.MAX_VALUE;
        
    return Math.min(gapAbove, gapBelow);
} 