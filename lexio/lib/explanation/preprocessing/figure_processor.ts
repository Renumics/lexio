
import { ParseResult, TextWithMetadata, TextItem, TextPosition } from './types';

interface FigureBlock {
    type: 'figure';
    number: number;
    caption: string;
    content: TextItem[];
    position: TextPosition;
}


export function detectAndExtractFigures(items: TextItem[]): {
    figures: FigureBlock[],
    remainingItems: TextItem[]
} {
    const figures: FigureBlock[] = [];
    const remainingItems: TextItem[] = [];
    
    let currentFigure: FigureBlock | null = null;
    
    // Helper function to round numbers to 3 decimal places
    const round = (num: number) => Math.round(num * 1000) / 1000;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isFigureMarker = /^(?:Fig\.|Figure)\s+(\d+)\.?/.exec(item.text);
        
        if (isFigureMarker) {
            if (currentFigure) {
                figures.push(currentFigure);
            }
            
            currentFigure = {
                type: 'figure',
                number: parseInt(isFigureMarker[1]),
                caption: '',
                content: [item],
                position: {
                    top: round(item.position.top),
                    left: round(item.position.left),
                    width: round(item.position.width),
                    height: round(item.position.height)
                }
            };
        } else if (currentFigure) {
            const verticalDistance = Math.abs(item.position.top - currentFigure.position.top);
            
            if (verticalDistance < 0.05) {
                currentFigure.content.push(item);
                // Update position with rounded values
                currentFigure.position = {
                    top: round(Math.min(currentFigure.position.top, item.position.top)),
                    left: round(Math.min(currentFigure.position.left, item.position.left)),
                    width: round(Math.max(
                        item.position.left + item.position.width - currentFigure.position.left,
                        currentFigure.position.width
                    )),
                    height: round(Math.max(
                        item.position.top + item.position.height - currentFigure.position.top,
                        currentFigure.position.height
                    ))
                };
            } else {
                figures.push(currentFigure);
                currentFigure = null;
                remainingItems.push(item);
            }
        } else {
            remainingItems.push(item);
        }
    }
    
    if (currentFigure) {
        figures.push(currentFigure);
    }
    
    return { figures, remainingItems };
}