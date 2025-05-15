import { TextItem } from './types';

/**
 * Checks if a text item appears to be a section header based on various characteristics
 */
export function isSectionHeader(item: TextItem, allItems: TextItem[]): boolean {
  // Check if it's followed by a period and number (e.g., "1. Introduction")
  const hasSectionNumber = /^\d+\.\s+/.test(item.text);
  
  // Check if it's a short phrase followed by a period
  const isShortHeader = item.text.length < 50 && item.text.trim().endsWith('.');
  
  // Check if it's in a larger font or bold (based on relative height and width)
  const avgHeight = allItems.reduce((sum, i) => sum + i.position.height, 0) / allItems.length;
  const avgWidth = allItems.reduce((sum, i) => {
    // Calculate average character width for this item
    const charWidth = i.position.width / i.text.length;
    return sum + charWidth;
  }, 0) / allItems.length;
  
  // Calculate this item's average character width
  const thisCharWidth = item.position.width / item.text.length;
  
  // Text is likely bold if its character width is significantly larger than average
  const isBold = thisCharWidth > avgWidth * 1.2;
  const isLargerFont = item.position.height > avgHeight * 1.2;
  
  // Check for common section header patterns
  const headerPattern = /^(?:[A-Z][a-z]+\s*)+[:.]\s*|^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/;
  const isHeaderFormat = headerPattern.test(item.text.trim());
  
  // Check if this item starts a new line by looking at its position
  const isNewLine = allItems.every(other => {
    if (other === item) return true;
    
    // Check if there's any text item directly to the left of this one
    // Use a small threshold for vertical position comparison
    const sameVerticalPosition = Math.abs(other.position.top - item.position.top) < 0.01;
    const isToTheLeft = other.position.left + other.position.width < item.position.left;
    
    return !sameVerticalPosition || !isToTheLeft;
  });
  
  // Additional patterns for academic paper section headers
  const academicHeaderPatterns = [
    /^Abstract\b/,
    /^Introduction\b/,
    /^Related Work\b/,
    /^Method\b/,
    /^Experiments?\b/,
    /^Results?\b/,
    /^Discussion\b/,
    /^Conclusion\b/,
    /^References\b/,
    /^(?:(?:[A-Z][a-z]+\s*)+Learning)\b/, // Matches "Self-supervised Learning", "Unsupervised Learning", etc.
  ];
  
  const isAcademicHeader = academicHeaderPatterns.some(pattern => pattern.test(item.text.trim()));
  
  // Add paper title detection patterns
  const paperTitlePatterns = [
    // Common paper title formats - with atomic groups and limited repetition
    /^(?:[A-Z][a-z]+(?:\s+(?:(?:[A-Z][a-z]+)|(?:[A-Z]{2,})|(?:is|the|and|or|in|on|of|to|for|with|by))){0,15}[:.!?]?)$/,
    // Specific well-known paper titles
    /^Attention Is All You Need$/,
    /^BERT:/,
    /^GPT:/,
    /^Transformer:/
  ];
  
  const isPaperTitle = paperTitlePatterns.some(pattern => pattern.test(item.text.trim()));
  
  // Consider it a paper title if:
  // 1. It matches paper title patterns AND
  // 2. It's either larger or bolder than normal text AND
  // 3. It appears near the top of the page
  const isNearTop = item.position.top < 0.3; // Top 30% of page
  
  const isPaperTitleHeader = isPaperTitle && isNearTop && (isLargerFont || isBold);
  
  // Consider it a section header if:
  // 1. It has a section number, or
  // 2. It matches academic header patterns and starts a new line, or
  // 3. It's a short header with either larger font or bold text and starts a new line
  return hasSectionNumber || 
         (isAcademicHeader && isNewLine) ||
         (isShortHeader && isNewLine && (isLargerFont || isBold || isHeaderFormat)) ||
         isPaperTitleHeader;
} 