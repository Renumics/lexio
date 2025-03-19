/**
 * Generates evenly distributed colors for highlighting.
 * Used for both message and source highlighting to maintain color consistency.
 * 
 * @param count - Number of colors to generate
 * @param opacity - Opacity value (0-1), defaults to 0.3
 * @returns Array of HSLA color strings
 */
export const generateHighlightColors = (count: number, opacity: number = 0.3): string[] => {
    return Array.from({ length: count }, (_, i) => {
        const hue = (i * 360) / count;
        return `hsla(${hue}, 70%, 70%, ${opacity})`;
    });
};