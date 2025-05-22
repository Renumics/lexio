import { describe, it, expect } from 'vitest';
import { cleanAndSplitText } from './text_processor';
import textContent2 from './jsons/textContent2.json';

describe('Text Processor', () => {
    describe('cleanAndSplitText', () => {
        it('should find all section headers', async () => {
            const blocks = textContent2.blocks;
            const result = await cleanAndSplitText(blocks);
            
            // Find all section headers
            const foundHeaders = result
                .filter(item => item.metadata.isHeader)  // Use the new metadata flag
                .map(item => ({
                    text: item.text,
                    page: item.metadata.page,
                    position: item.metadata.linePositions?.[0] 
                        ? {
                            top: item.metadata.linePositions[0].top,
                            relativeTop: item.metadata.linePositions[0].top / item.metadata.linePositions[0].pageHeight
                        }
                        : null
                }));

            // Expected headers from the document
            const expectedHeaderPatterns = [
                /^A Deep Learning Based Approach/i,  // Title
                /^Abstract/i,
                /^I\.\s+Introduction/i,
                /^II\.\s+Related Work/i,
                /^A\.\s+Traffic Data Imputation/i,
                /^A\.\s+DSAE based imputation architecture/i,
                /^B\.\s+Training process/i
            ];

            // Test that we found all expected headers
            expectedHeaderPatterns.forEach(pattern => {
                const found = foundHeaders.some(header => pattern.test(header.text));
                expect(found, `Should find header matching ${pattern}`).toBe(true);
            });

            // Test header positions are reasonable
            foundHeaders.forEach(header => {
                expect(header.position?.top).toBeDefined();
                expect(header.position?.relativeTop).toBeDefined();
                expect(header.position?.relativeTop).toBeLessThan(1);
                expect(header.position?.relativeTop).toBeGreaterThan(0);
            });

            // Log headers for debugging
            console.log('Found headers:', JSON.stringify(foundHeaders, null, 2));
        });
    });
});