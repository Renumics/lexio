import { describe, test } from 'vitest';
import { isSectionHeader, isGraphElement } from './section_analyzer';
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

  test('analyze text elements with detailed metrics', () => {
    // Calculate average metrics for reference
    const avgHeight = allTextItems.reduce((sum, i) => sum + i.position.height, 0) / allTextItems.length;

    // Analyze all text items for both headers and graph elements
    const analyzedItems = allTextItems
      .map(item => {
        const isHeader = isSectionHeader(item, allTextItems, lineBoxes);
        const isGraph = isGraphElement(item, allTextItems);
        const relativeHeight = item.position.height / item.position.pageHeight;
        const avgRelativeHeight = allTextItems.reduce((sum, i) => 
          sum + (i.position.height / i.position.pageHeight), 0) / allTextItems.length;
        
        return {
          text: item.text,
          isHeader,
          isGraph,
          metrics: {
            height: item.position.height,
            heightRatio: (item.position.height / avgHeight).toFixed(2),
            relativeHeight: relativeHeight.toFixed(4),
            avgRelativeHeight: avgRelativeHeight.toFixed(4),
            top: Math.round(item.position.top),
            topRatio: (item.position.top / item.position.pageHeight).toFixed(2),
            isRomanNumeral: /^[IVX]+\./.test(item.text),
            isNumericSection: /^\d+\./.test(item.text),
            isNumericValue: /^-?\d*\.?\d+$/.test(item.text.trim()),
            isAxisLabel: /^[0-9.]+[A-Za-z%]?$/.test(item.text.trim())
          }
        };
      })
      .filter(item => 
        item.isHeader || 
        item.isGraph ||
        item.metrics.isRomanNumeral || 
        item.metrics.isNumericSection ||
        item.metrics.isNumericValue ||
        Number(item.metrics.heightRatio) > 1.2 ||
        Number(item.metrics.heightRatio) < 0.7
      )
      .sort((a, b) => a.metrics.top - b.metrics.top);

    console.log('\nText Elements Analysis:');
    console.log('=====================');
    
    analyzedItems.forEach((item, index) => {
      const headerStatus = item.isHeader ? '✓H' : '✗';
      const graphStatus = item.isGraph ? '✓G' : '✗';
      const status = `[${headerStatus}|${graphStatus}]`;
      
      let elementType = 'Unknown';
      if (item.metrics.isRomanNumeral) elementType = 'Roman';
      else if (item.metrics.isNumericSection) elementType = 'NumericSection';
      else if (item.metrics.isNumericValue) elementType = 'NumericValue';
      else if (item.metrics.isAxisLabel) elementType = 'AxisLabel';
      else elementType = 'Other';

      console.log(`\n${index + 1}. ${status} [${elementType}] "${item.text}"`);
      console.log('Metrics:');
      console.log(`  • Height: ${item.metrics.height}px (ratio: ${item.metrics.heightRatio}x avg)`);
      console.log(`  • Relative Height: ${item.metrics.relativeHeight} (avg: ${item.metrics.avgRelativeHeight})`);
      console.log(`  • Position: ${item.metrics.top}px (${item.metrics.topRatio} of page height)`);
    });

    const headerCount = analyzedItems.filter(i => i.isHeader).length;
    const graphCount = analyzedItems.filter(i => i.isGraph).length;
    console.log(`\nTotal analyzed items: ${analyzedItems.length}`);
    console.log(`Detected headers: ${headerCount}`);
    console.log(`Detected graph elements: ${graphCount}`);
  });
});