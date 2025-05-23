import { describe, it } from 'vitest';
import { cleanAndSplitText } from './text_finalizer';
import { isSectionHeader } from './layout_analyzer';
import textContent2 from './jsons/textContent2.json';

describe('Text Finalizer', () => {
    it('should process text and identify headers', async () => {
        const blocks = textContent2.blocks;
        
        // First get the correct headers using the proven layout_analyzer approach
        const allTextItems = blocks.children
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

        const lineBoxes = blocks.children
            .flatMap(page => page.lineBoxes || []);

        // Get the correct headers using layout_analyzer approach
        const correctHeaders = allTextItems
            .filter(item => isSectionHeader(item, allTextItems, lineBoxes))
            .sort((a, b) => {
                if (a.page !== b.page) return a.page - b.page;
                return a.position.top - b.position.top;
            });

        // Process text with cleanAndSplitText
        const result = await cleanAndSplitText(blocks);

        // Separate headers and sentences from text_finalizer result
        const foundHeaders = result.filter(item => item.metadata.isHeader);
        const sentences = result.filter(item => !item.metadata.isHeader);

        // Display both sets of headers for comparison
        console.log('\nCorrect Headers (from layout_analyzer):');
        console.log('====================================');
        correctHeaders.forEach((header, index) => {
            console.log(`${index + 1}. [Page ${header.page}] "${header.text}"`);
        });

        console.log('\nFound Headers (from text_finalizer):');
        console.log('=================================');
        foundHeaders.forEach((header, index) => {
            console.log(`${index + 1}. [Page ${header.metadata.page}] ${header.text}`);
        });

        // Display first 10 sentences for each page
        console.log('\nFirst 10 Sentences per Page:');
        console.log('==========================');
        const sentencesByPage = sentences.reduce((acc, sentence) => {
            const page = sentence.metadata.page;
            if (!acc[page]) acc[page] = [];
            acc[page].push(sentence);
            return acc;
        }, {});

        Object.entries(sentencesByPage).forEach(([page, pageSentences]) => {
            console.log(`\nPage ${page}:`);
            console.log('---------');
            pageSentences.slice(0, 10).forEach((sentence, index) => {
                console.log(`${index + 1}. ${sentence.text}`);
            });
        });
    });
});