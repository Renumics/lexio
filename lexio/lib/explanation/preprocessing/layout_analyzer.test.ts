import { describe, test } from 'vitest';
import { isSectionHeader, isGraphElement } from './layout_analyzer';
import { TextItem, LineBox } from './types';
import testData from './jsons/textContent2.json';

describe('Section Analyzer', () => {
  // Extract text items and line boxes from all pages
  const allTextItems = testData.blocks.children
    .flatMap((page) => 
      page.textItems
        .flat()
        .map(item => ({
          text: item.text,
          position: {
            left: item.position.left,
            top: item.position.top,
            width: item.position.width,
            height: item.position.height,
            pageWidth: item.position.pageWidth,
            pageHeight: item.position.pageHeight
          },
          page: page.page
        }))
    );

  const lineBoxes: (LineBox | null)[] = testData.blocks.children
    .flatMap(page => page.lineBoxes || []);

  test('analyze text elements', () => {
    // Get headers and graph elements using the layout_analyzer functions
    const headers = allTextItems
      .filter(item => isSectionHeader(item, allTextItems, lineBoxes))
      .sort((a, b) => {
        if (a.page !== b.page) return a.page - b.page;
        return a.position.top - b.position.top;
      });

    const graphElements = allTextItems
      .filter(item => isGraphElement(item, allTextItems))
      .sort((a, b) => {
        if (a.page !== b.page) return a.page - b.page;
        return a.position.top - b.position.top;
      });

    // Display results
    console.log('\nHeaders:');
    console.log('========');
    headers.forEach((item, index) => {
      console.log(`${index + 1}. [Page ${item.page}] "${item.text}"`);
    });

    console.log('\nGraph Elements:');
    console.log('==============');
    graphElements.forEach((item, index) => {
      console.log(`${index + 1}. [Page ${item.page}] "${item.text}"`);
    });

    console.log(`\nTotal headers: ${headers.length}`);
    console.log(`Total graph elements: ${graphElements.length}`);
  });
});