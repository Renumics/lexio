import { describe, test } from 'vitest';
import { isSectionHeader } from './section_analyzer';
import { TextItem, LineBox } from './types';
import testData from './jsons/textContent2.json';

describe('Section Analyzer', () => {
  // Helper function to convert page coordinates to normalized values
  const normalizeTextItems = (items: any[]): TextItem[] => {
    return items.map(item => ({
      text: item.text,
      position: {
        left: item.position.left,
        top: item.position.top,
        width: item.position.width,
        height: item.position.height,
        pageWidth: item.position.pageWidth,
        pageHeight: item.position.pageHeight
      },
      startIndex: item.startIndex,
      endIndex: item.endIndex
    }));
  };

  // Extract text items and line boxes from all pages
  const allTextItems = testData.blocks.children
    .flatMap((page) => 
      page.textItems
        .flat()
        .map(item => normalizeTextItems([item])[0])
    );

  const lineBoxes: (LineBox | null)[] = testData.blocks.children
    .flatMap(page => page.lineBoxes || []);

  test('print detected headers from JSON with debug info', () => {
    // Calculate average metrics for reference
    const avgHeight = allTextItems.reduce((sum, i) => sum + i.position.height, 0) / allTextItems.length;

    // Find potential headers and their detection metrics
    const headerCandidates = allTextItems
      .map(item => {
        const isHeader = isSectionHeader(item, allTextItems, lineBoxes);
        const relativeHeight = item.position.height / item.position.pageHeight;
        const avgRelativeHeight = allTextItems.reduce((sum, i) => 
          sum + (i.position.height / i.position.pageHeight), 0) / allTextItems.length;
        
        return {
          text: item.text,
          isDetectedHeader: isHeader,
          metrics: {
            height: item.position.height,
            heightRatio: (item.position.height / avgHeight).toFixed(2),
            relativeHeight: relativeHeight.toFixed(4),
            avgRelativeHeight: avgRelativeHeight.toFixed(4),
            top: Math.round(item.position.top),
            topRatio: (item.position.top / item.position.pageHeight).toFixed(2),
            isRomanNumeral: /^[IVX]+\./.test(item.text),
            isNumericSection: /^\d+\./.test(item.text)
          }
        };
      })
      .filter(item => 
        item.isDetectedHeader || 
        item.metrics.isRomanNumeral || 
        item.metrics.isNumericSection ||
        Number(item.metrics.heightRatio) > 1.2
      )
      .sort((a, b) => a.metrics.top - b.metrics.top);

    console.log('\nPotential Headers Analysis:');
    console.log('=========================');
    
    headerCandidates.forEach((item, index) => {
      const status = item.isDetectedHeader ? '✓' : '✗';
      const headerType = item.metrics.isRomanNumeral ? '[Roman]' : 
                        item.metrics.isNumericSection ? '[Numeric]' : 
                        '[Other]';
      
      console.log(`\n${index + 1}. ${status} ${headerType} "${item.text}"`);
      console.log('Metrics:');
      console.log(`  • Height: ${item.metrics.height}px (ratio: ${item.metrics.heightRatio}x avg)`);
      console.log(`  • Relative Height: ${item.metrics.relativeHeight} (avg: ${item.metrics.avgRelativeHeight})`);
      console.log(`  • Position: ${item.metrics.top}px (${item.metrics.topRatio} of page height)`);
    });

    const detectedCount = headerCandidates.filter(h => h.isDetectedHeader).length;
    console.log(`\nTotal candidates: ${headerCandidates.length}`);
    console.log(`Detected headers: ${detectedCount}`);
  });
});