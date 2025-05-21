import { describe, it, expect, beforeAll } from 'vitest';
import { TextItem } from './types';
import { detectAndExtractFigures } from './figure_processor';

describe('Text Processor - Figure Detection', () => {
    // Helper function to pretty print figure details
    const logFigure = (figure: any, testName: string) => {
        console.log(`\n=== Figures found in: ${testName} ===`);
        console.log(`Figure ${figure.number}:`);
        console.log('Position:', JSON.stringify(figure.position, null, 2));
        console.log('Content items:', figure.content.map((item: TextItem) => item.text));
        console.log('===============================\n');
    };

    // Test data setup
    const createTextItem = (
        text: string,
        top: number,
        left: number,
        width: number = 0.1,
        height: number = 0.02
    ): TextItem => ({
        text,
        position: { top, left, width, height },
        startIndex: 0,
        endIndex: text.length
    });

    describe('detectAndExtractFigures', () => {
        it('should detect a simple figure with caption', () => {
            const items: TextItem[] = [
                createTextItem('Regular text', 0.1, 0.1),
                createTextItem('Fig. 1.', 0.2, 0.1),
                createTextItem('This is a figure caption', 0.2, 0.2),
                createTextItem('More regular text', 0.3, 0.1)
            ];

            const { figures, remainingItems } = detectAndExtractFigures(items);
            figures.forEach(fig => logFigure(fig, 'Simple figure with caption'));

            expect(figures).toHaveLength(1);
            expect(figures[0]).toMatchObject({
                type: 'figure',
                number: 1,
                content: expect.arrayContaining([
                    expect.objectContaining({ text: 'Fig. 1.' }),
                    expect.objectContaining({ text: 'This is a figure caption' })
                ])
            });
            expect(remainingItems).toHaveLength(2);
        });

        it('should handle multiple figures', () => {
            const items: TextItem[] = [
                createTextItem('Fig. 1.', 0.1, 0.1),
                createTextItem('First caption', 0.1, 0.2),
                createTextItem('Some text', 0.2, 0.1),
                createTextItem('Fig. 2.', 0.3, 0.1),
                createTextItem('Second caption', 0.3, 0.2)
            ];

            const { figures, remainingItems } = detectAndExtractFigures(items);
            figures.forEach(fig => logFigure(fig, 'Multiple figures'));

            expect(figures).toHaveLength(2);
            expect(figures[0].number).toBe(1);
            expect(figures[1].number).toBe(2);
            expect(remainingItems).toHaveLength(1);
            expect(remainingItems[0].text).toBe('Some text');
        });

        it('should handle different figure marker formats', () => {
            const items: TextItem[] = [
                createTextItem('Figure 1', 0.1, 0.1),
                createTextItem('First caption', 0.1, 0.2),
                createTextItem('Fig. 2.', 0.2, 0.1),
                createTextItem('Second caption', 0.2, 0.2)
            ];

            const { figures } = detectAndExtractFigures(items);
            figures.forEach(fig => logFigure(fig, 'Different figure formats'));

            expect(figures).toHaveLength(2);
            expect(figures[0].number).toBe(1);
            expect(figures[1].number).toBe(2);
        });

        it('should group nearby text items into the same figure', () => {
            const items: TextItem[] = [
                createTextItem('Fig. 1.', 0.1, 0.1),
                createTextItem('Caption part 1', 0.1, 0.2),
                createTextItem('Caption part 2', 0.115, 0.2), // Within threshold
                createTextItem('Unrelated text', 0.3, 0.1)    // Outside threshold
            ];

            const { figures, remainingItems } = detectAndExtractFigures(items);
            figures.forEach(fig => logFigure(fig, 'Grouped text items'));

            expect(figures).toHaveLength(1);
            expect(figures[0].content).toHaveLength(3);
            expect(remainingItems).toHaveLength(1);
            expect(remainingItems[0].text).toBe('Unrelated text');
        });

        it('should correctly calculate figure boundaries', () => {
            const items: TextItem[] = [
                createTextItem('Fig. 1.', 0.1, 0.1, 0.1, 0.02),
                createTextItem('Caption', 0.1, 0.2, 0.2, 0.02)
            ];

            const { figures } = detectAndExtractFigures(items);

            expect(figures[0].position).toMatchObject({
                top: 0.1,
                left: 0.1,
                width: 0.3,    // Should span both text items
                height: 0.02   // Should be max height of items
            });
        });

        it('should handle empty input', () => {
            const { figures, remainingItems } = detectAndExtractFigures([]);

            expect(figures).toHaveLength(0);
            expect(remainingItems).toHaveLength(0);
        });

        it('should handle input with no figures', () => {
            const items: TextItem[] = [
                createTextItem('Regular text 1', 0.1, 0.1),
                createTextItem('Regular text 2', 0.2, 0.1)
            ];

            const { figures, remainingItems } = detectAndExtractFigures(items);

            expect(figures).toHaveLength(0);
            expect(remainingItems).toHaveLength(2);
        });
    });
});