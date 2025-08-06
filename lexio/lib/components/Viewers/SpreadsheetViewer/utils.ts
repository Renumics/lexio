import { utils } from "xlsx";
import { ThemeColors } from "./ThemeContextProvider";
import { SpreadsheetHighlight } from "./types.ts";
import { CellStyle, ColorSchemeList, ShiftedMerge } from "./types.ts";
import { BorderStyle } from "exceljs";

export const ROW_LIMIT = 239_500;
// export const ROW_LIMIT = 400_000;    

export const MIN_ZOOM_FACTOR = 10;

export const DEFAULT_ZOOM_FACTOR = 100;

export const MAX_ZOOM_FACTOR = 500;

export const TOOLBAR_ICON_SIZE = 20 as const;

export const DEFAULT_COLUMN_SIZE = 20;

export const MAX_COLUMN_SIZE = 300;

export const MAX_COLUMN_CONTENT_SIZE = 100;

export const getCellStyle = (cellAddress: string, styles: Record<string, any>, theme: ThemeColors, highlights: SpreadsheetHighlight | undefined, merges: string[], colorThemes: ColorSchemeList | undefined): CellStyle => {    
    const cellStyle = styles[cellAddress]?.style || {};
    const cellValue = styles[cellAddress]?.value;
    const defaultTextColor = theme.defaultCellText;
    const highlightColor = theme.highlight;
    const highlightBorder = getHighlightBorder(cellAddress, highlights, merges);

    let color: string | undefined;
    if (cellStyle?.font?.color?.argb) {
        color = `#${cellStyle.font.color.argb.slice(2)}`;
    } else if (typeof cellStyle?.font?.color === "object" && Object.prototype.hasOwnProperty.call(cellStyle?.font?.color, "theme") && !Object.prototype.hasOwnProperty.call(cellStyle?.font?.color, "tint")) {
        color = `#${colorThemes?.find((theme, index) => theme.name === cellStyle.font.color.theme || cellStyle.font.color.theme === index)?.rgb}`;
    } else if (typeof cellStyle?.font?.color === "object" && Object.prototype.hasOwnProperty.call(cellStyle?.font?.color, "tint")) {
        const rgb = `#${colorThemes?.find((theme, index) => theme.name === cellStyle.font.color.theme || cellStyle.font.color.theme === index)?.rgb}`;
        if (rgb) {
            color = applyTintToRgb(rgb, cellStyle.font.color.tint);
        } else {
            color = defaultTextColor;
        }
    } else {
        color = defaultTextColor;
    }

    let backgroundColor: string | undefined;
    if (cellStyle?.fill?.fgColor?.argb) {
        backgroundColor = `#${cellStyle.fill.fgColor.argb.slice(2)}`;
    } else if (typeof cellStyle?.fill?.fgColor === "object" && Object.prototype.hasOwnProperty.call(cellStyle?.fill?.fgColor, "theme") && !Object.prototype.hasOwnProperty.call(cellStyle?.fill?.fgColor, "tint")) {
        backgroundColor = `#${colorThemes?.find((theme, index) => theme.name === cellStyle.fill.fgColor.theme || cellStyle.fill.fgColor.theme === index)?.rgb}`;
    } else if (typeof cellStyle?.fill?.fgColor === "object" && Object.prototype.hasOwnProperty.call(cellStyle?.fill?.fgColor, "tint")) {
        const rgb = `#${colorThemes?.find((theme, index) => theme.name === cellStyle.fill.fgColor.theme || cellStyle.fill.fgColor.theme === index)?.rgb}`;
        if (rgb) {
            backgroundColor = applyTintToRgb(rgb, cellStyle.fill.fgColor.tint);
        } else {
            backgroundColor = "#ffffff";
        }
    } else {
        backgroundColor = "#ffffff";
    }
    const hasTextRotation = cellStyle?.alignment?.textRotation && cellStyle.alignment?.textRotation !== 0;

    return {
        color: color,
        backgroundColor: backgroundColor,
        fontWeight: cellStyle?.font?.bold ? "bold" : "normal",
        fontStyle: cellStyle?.font?.italic ? "italic" : undefined,
        fontFamily: cellStyle?.font?.name,
        fontSize: ptFontSizeToPixel(cellStyle?.font?.size),
        wrapText: cellStyle?.alignment?.wrapText ?? false,
        underline: !!cellStyle?.font?.underline,
        strikeThrough: !!cellStyle?.font?.strike,
        textRotation: cellStyle?.alignment?.textRotation ?? 0,
        textAlign: hasTextRotation ? undefined : typeof cellValue === "number" && !cellStyle?.alignment?.horizontal ? "right" : cellStyle?.alignment?.horizontal ??"left",
        verticalAlign: hasTextRotation ? undefined : cellStyle?.alignment?.vertical ?? "bottom",
        borderTop: highlightBorder.top ? `3px solid ${highlightColor}` : getMergeBorder(cellAddress, "top", styles, merges),
        borderRight: highlightBorder.right ? `3px solid ${highlightColor}` : getMergeBorder(cellAddress, "right", styles, merges),
        borderBottom: highlightBorder.bottom ? `3px solid ${highlightColor}` : getMergeBorder(cellAddress, "bottom", styles, merges),
        borderLeft: highlightBorder.left ? `3px solid ${highlightColor}` : getMergeBorder(cellAddress, "left", styles, merges),
    };
}

export const getMergeBorder = (cellAddress: string, borderType: "top" | "right" | "bottom" | "left", styles: Record<string, any>, merges: string[]): string => {
    const cellComponents = extractCellComponent(cellAddress);
    if (!cellComponents) return DEFAULT_BORDER_STYLE;

    const currentRow = cellComponents.row;
    const currentCol = cellComponents.column;
    const shiftedMerges = getShiftedMerges(merges);
    const { rowSpan, colSpan } = getCellMergeSpan(currentRow, utils.decode_col(currentCol) + 1, shiftedMerges);

    if (rowSpan === 1 && colSpan === 1) {
        const cellStyle = styles[cellAddress]?.style || {};
        const borderStyle = cellStyle?.border?.[borderType];
        return excelBorderToCss(borderStyle?.style, borderStyle?.color?.argb);
    }

    let targetCellAddress = cellAddress;

    switch (borderType) {
        case "right":
            if (colSpan > 1) {
                const rightmostCol = utils.decode_col(currentCol) + colSpan - 1;
                const rightmostColLabel = getColumnLabel(rightmostCol);
                targetCellAddress = `${rightmostColLabel}${currentRow}`;
            }
            break;
        case "bottom":
            if (rowSpan > 1) {
                const bottommostRow = currentRow + rowSpan - 1;
                targetCellAddress = `${currentCol}${bottommostRow}`;
            }
            break;
        case "left":
            break;
        case "top":
            break;
    }

    const targetCellStyle = styles[targetCellAddress]?.style || {};
    const borderStyle = targetCellStyle?.border?.[borderType];
    return excelBorderToCss(borderStyle?.style, borderStyle?.color?.argb);
};

export const getHighlightBorder = (cellAddress: string, highlights: SpreadsheetHighlight | undefined, merges: string[]): { top: boolean; right: boolean; bottom: boolean; left: boolean } => {
    if (!highlights) return { top: false, right: false, bottom: false, left: false };

    const cellComponents = extractCellComponent(cellAddress);
    if (!cellComponents) return { top: false, right: false, bottom: false, left: false };

    const currentRow = cellComponents.row;
    const currentCol = cellComponents.column;

    const shiftedMerges = getShiftedMerges(merges);
    const { rowSpan, colSpan } = getCellMergeSpan(currentRow, utils.decode_col(currentCol) + 1, shiftedMerges);

    const effectiveStartRow = currentRow;
    const effectiveEndRow = currentRow + rowSpan - 1;
    const effectiveStartCol = utils.decode_col(currentCol);
    const effectiveEndCol = utils.decode_col(currentCol) + colSpan - 1;

    for (const range of highlights.ranges) {
        const [startCell, endCell] = range.split(":");
        const start = extractCellComponent(startCell);
        const end = extractCellComponent(endCell || startCell);

        if (!start || !end) continue;

        const startRow = start.row;
        const endRow = end.row;
        const startCol = utils.decode_col(start.column);
        const endCol = utils.decode_col(end.column);

        const overlaps = !(effectiveEndRow < startRow || effectiveStartRow > endRow ||
            effectiveEndCol < startCol || effectiveStartCol > endCol);

        if (overlaps) {
            return {
                top: effectiveStartRow === startRow,
                right: effectiveEndCol === endCol,
                bottom: effectiveEndRow === endRow,
                left: effectiveStartCol === startCol
            };
        }
    }

    return { top: false, right: false, bottom: false, left: false };
};

export const getShiftedMerges = (merges: string[]): ShiftedMerge[] => {
    return merges.map((m) => {
        const start = extractCellComponent(m.split(":")[0]);
        const end = extractCellComponent(m.split(":")[1]);
        return {
            s: { r: start?.row ?? 0, c: start?.column ?? "" },
            e: { r: end?.row ?? 0, c: end?.column ?? "" },
        }
    });
};

export function getCellAddress(row: number, col: number) {
    let label = "";
    let colIndex = col;
    while (colIndex >= 0) {
        label = String.fromCharCode(65 + (colIndex % 26)) + label;
        colIndex = Math.floor(colIndex / 26) - 1;
    }
    return `${label}${row + 1}`;
}

export function isCellCoveredByMerge(row: number, col: number, merges: any[]): boolean {
    for (const merge of merges) {
        const { s, e } = merge;
        if (row >= s.r && row <= e.r && col >= s.c && col <= e.c) {
            if (!(row === s.r && col === s.c)) {
                return true;
            }
        }
    }
    return false;
}

export function getCellMergeSpan(row: number, col: number, merges: any[]): { rowSpan: number; colSpan: number } {
    for (const merge of merges) {
        if (row === merge.s.r && col === utils.decode_col(merge.s.c) + 1) {
            return { rowSpan: merge.e.r - merge.s.r + 1, colSpan: utils.decode_col(merge.e.c) - utils.decode_col(merge.s.c) + 1 };
        }
    }
    return { rowSpan: 1, colSpan: 1 };
}

export function isCellInAMergeRangeAndNotTheStartCell(row: number, col: number, cellAddress: string, merges: any[]): boolean {
    for (const merge of merges) {
        if (row === merge.s.r && col > utils.decode_col(merge.s.c) + 1 && col <= utils.decode_col(merge.e.c) + 1) {
            return true;
        }
        if (col === utils.decode_col(merge.s.c) + 1 && row > merge.s.r && row <= merge.e.r) {
            return true;
        }
        if (row > merge.s.r && row <= merge.e.r && merge.e.r - merge.s.r > 1) {
            const cellComponents = extractCellComponent(cellAddress);
            if (cellComponents) {
                if (cellComponents.column === merge.s.c) return false;
                if (
                    cellComponents.row > merge.s.r && cellComponents.row <= merge.e.r
                    &&
                    utils.decode_col(cellComponents.column) > utils.decode_col(merge.s.c) && utils.decode_col(cellComponents.column) <= utils.decode_col(merge.e.c)
                ) return true;
            }
        }
    }
    return false;
}

export function getColumnLabel(col: number) {
    let label = "";
    let colIndex = col;
    while (colIndex >= 0) {
        label = String.fromCharCode(65 + (colIndex % 26)) + label;
        colIndex = Math.floor(colIndex / 26) - 1;
    }
    return label;
}

export const extractCellComponent = (cellName: string): { column: string, row: number } | null => {
    const match = cellName.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, column, rowStr] = match;
    return {
        column: column.toUpperCase(),
        row: parseInt(rowStr),
    }
};

export const ptFontSizeToPixel = (pt?: number): number => {
    const DEFAULT_FONT_SIZE = 16;
    if (!pt) return DEFAULT_FONT_SIZE;
    return ptToPixel(pt);
};

export const ptToPixel = (pt?: number): number => {
    const PT_TO_PX_FACTOR = 1.3333;
    if (!pt) return 0;
    return Math.round(pt * PT_TO_PX_FACTOR);
};

export const convertArgbToHex = (rgbColor?: string): string => {
    if (!rgbColor) return "";
    return `#${rgbColor.length > 6 ? rgbColor.slice(2) : rgbColor}`;
}

export const DEFAULT_BORDER_STYLE = "1px solid #e2e8f0";

export const excelBorderToCss = (excelBorderStyle?: BorderStyle, argbColor?: string) => {
    if (!excelBorderStyle || !argbColor) return DEFAULT_BORDER_STYLE;

    const borderMap = {
        "thin": `1px solid ${convertArgbToHex(argbColor)}`,
        "dotted": `1px dotted ${convertArgbToHex(argbColor)}`,
        "hair": `2px dotted ${convertArgbToHex(argbColor)}`,
        "medium": `2px solid ${convertArgbToHex(argbColor)}`,
        "double": `2px double ${convertArgbToHex(argbColor)}`,
        "thick": `2px solid  ${convertArgbToHex(argbColor)}`,
        "dashed": `1px dashed  ${convertArgbToHex(argbColor)}`,
        "dashDot": `2px dashed  ${convertArgbToHex(argbColor)}`,
        "dashDotDot": `2px dashed  ${convertArgbToHex(argbColor)}`,
        "slantDashDot": `2px dashed  ${convertArgbToHex(argbColor)}`,
        "mediumDashed": `2px dashed  ${convertArgbToHex(argbColor)}`,
        "mediumDashDotDot": `2px dashed  ${convertArgbToHex(argbColor)}`,
        "mediumDashDot": `2px dashed  ${convertArgbToHex(argbColor)}`,
    };

    return borderMap[excelBorderStyle] || DEFAULT_BORDER_STYLE;
}

export function getCellsInRange(startCell: string, endCell: string): string[] {
    const start = extractCellComponent(startCell);
    const end = extractCellComponent(endCell);

    if (!start || !end) return [startCell];

    const cells: string[] = [];
    const startRow = Math.min(start.row, end.row);
    const endRow = Math.max(start.row, end.row);
    const startCol = Math.min(utils.decode_col(start.column), utils.decode_col(end.column));
    const endCol = Math.max(utils.decode_col(start.column), utils.decode_col(end.column));

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const cellAddress = getCellAddress(row - 1, col);
            cells.push(cellAddress);
        }
    }

    return cells;
}

export function calculateRowPositions(rowHeights: number[]): number[] {
    const positions: number[] = [0];
    
    if (rowHeights.length > 500000) {
        console.warn(`Extremely large dataset detected: ${rowHeights.length.toLocaleString()} rows. Using fixed height approximation.`);
        for (let i = 0; i < rowHeights.length; i++) {
            positions.push(i * 60); // Fixed 60px height for all rows
        }
        return positions;
    }
    
    const useBigInt = rowHeights.length > 50000;
    
    if (useBigInt) {
        let cumulativeHeight = BigInt(0);
        for (let i = 0; i < rowHeights.length; i++) {
            cumulativeHeight += BigInt(rowHeights[i] || 60);
            const heightAsNumber = Number(cumulativeHeight);
            if (!Number.isSafeInteger(heightAsNumber)) {
                console.warn(`Row position calculation overflow at row ${i.toLocaleString()}. Using approximate positioning.`);
                // Use approximate positioning for very large datasets
                positions.push(i * 60); // Approximate based on default row height
            } else {
                positions.push(heightAsNumber);
            }
        }
    } else {
        let cumulativeHeight = 0;
        for (let i = 0; i < rowHeights.length; i++) {
            cumulativeHeight += rowHeights[i] || 60;
            if (!Number.isSafeInteger(cumulativeHeight)) {
                console.warn(`Row position calculation overflow at row ${i.toLocaleString()}. Using approximate positioning.`);
                positions.push(i * 60);
            } else {
                positions.push(cumulativeHeight);
            }
        }
    }

    return positions;
}

export function calculateColumnPositions(colWidths: number[]): number[] {
    const positions: number[] = [0];

    if (colWidths.length > 10000) {
        console.warn(`Extremely wide dataset detected: ${colWidths.length.toLocaleString()} columns. Using fixed width approximation.`);
        for (let i = 0; i < colWidths.length; i++) {
            positions.push(i * 150); // Fixed 150px width for all columns
        }
        return positions;
    }
    
    const useBigInt = colWidths.length > 5000; // Lowered threshold for BigInt
    
    if (useBigInt) {
        let cumulativeWidth = BigInt(0);
        for (let i = 0; i < colWidths.length; i++) {
            cumulativeWidth += BigInt(colWidths[i] || 150);
            // Convert back to number for compatibility, but check for overflow
            const widthAsNumber = Number(cumulativeWidth);
            if (!Number.isSafeInteger(widthAsNumber)) {
                console.warn(`Column position calculation overflow at column ${i.toLocaleString()}. Using approximate positioning.`);
                // Use approximate positioning for very large datasets
                positions.push(i * 150); // Approximate based on default column width
            } else {
                positions.push(widthAsNumber);
            }
        }
    } else {
        let cumulativeWidth = 0;
        for (let i = 0; i < colWidths.length; i++) {
            cumulativeWidth += colWidths[i] || 150;
            // Check for overflow even in regular calculation
            if (!Number.isSafeInteger(cumulativeWidth)) {
                console.warn(`Column position calculation overflow at column ${i.toLocaleString()}. Using approximate positioning.`);
                positions.push(i * 150);
            } else {
                positions.push(cumulativeWidth);
            }
        }
    }

    return positions;
}

export function findVisibleRowRange(
    scrollTop: number,
    containerHeight: number,
    rowPositions: number[],
    overscan: number = 5
): { startIndex: number; endIndex: number } {
    const startY = Math.max(0, scrollTop - overscan * 60);
    const endY = scrollTop + containerHeight + overscan * 60;

    let startIndex = 0;
    let endIndex = rowPositions.length - 1;

    // For very large datasets, use binary search for better performance
    if (rowPositions.length > 100000) {
        // Binary search for start index
        let left = 0;
        let right = rowPositions.length - 1;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (rowPositions[mid] < startY) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        startIndex = Math.max(0, left - 1);

        // Binary search for end index
        left = startIndex;
        right = rowPositions.length - 1;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (rowPositions[mid] < endY) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        endIndex = Math.min(rowPositions.length - 1, left);
    } else {
        // Linear search for smaller datasets
        for (let i = 0; i < rowPositions.length - 1; i++) {
            if (rowPositions[i + 1] > startY) {
                startIndex = i;
                break;
            }
        }
        for (let i = startIndex; i < rowPositions.length - 1; i++) {
            if (rowPositions[i + 1] > endY) {
                endIndex = i;
                break;
            }
        }
    }

    return { startIndex, endIndex };
}

export function findVisibleColumnRange(
    scrollLeft: number,
    containerWidth: number,
    colPositions: number[],
    overscan: number = 5
): { startIndex: number; endIndex: number } {
    const startX = Math.max(0, scrollLeft - overscan * 150);
    const endX = scrollLeft + containerWidth + overscan * 150;

    let startIndex = 0;
    let endIndex = colPositions.length - 1;

    // For very large datasets, use binary search for better performance
    if (colPositions.length > 10000) {
        // Binary search for start index
        let left = 0;
        let right = colPositions.length - 1;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (colPositions[mid] < startX) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        startIndex = Math.max(0, left - 1);

        // Binary search for end index
        left = startIndex;
        right = colPositions.length - 1;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (colPositions[mid] < endX) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        endIndex = Math.min(colPositions.length - 1, left);
    } else {
        // Linear search for smaller datasets
        for (let i = 0; i < colPositions.length - 1; i++) {
            if (colPositions[i + 1] > startX) {
                startIndex = i;
                break;
            }
        }

        for (let i = startIndex; i < colPositions.length - 1; i++) {
            if (colPositions[i + 1] > endX) {
                endIndex = i;
                break;
            }
        }
    }

    return { startIndex, endIndex };
}

export function getMergesAffectingVisibleRowRange(
    visibleStartIndex: number,
    visibleEndIndex: number,
    merges: any[]
): any[] {
    return merges.filter(merge => {
        const startRow = merge.s.r;
        const endRow = merge.e.r;

        // Check if merge overlaps with visible range
        return (startRow <= visibleEndIndex && endRow >= visibleStartIndex);
    });
}

export function getAdditionalRowsForMerges(
    visibleStartIndex: number,
    visibleEndIndex: number,
    merges: any[]
): { startIndex: number; endIndex: number } {
    let extendedStartIndex = visibleStartIndex;
    let extendedEndIndex = visibleEndIndex;

    for (const merge of merges) {
        const startRow = merge.s.r;
        const endRow = merge.e.r;

        // If merge starts before visible range but ends within it
        if (startRow < visibleStartIndex && endRow >= visibleStartIndex) {
            extendedStartIndex = Math.min(extendedStartIndex, startRow);
        }

        // If merge starts within visible range but ends after it
        if (startRow <= visibleEndIndex && endRow > visibleEndIndex) {
            extendedEndIndex = Math.max(extendedEndIndex, endRow);
        }
    }

    return { startIndex: extendedStartIndex, endIndex: extendedEndIndex };
}

export function getMergesAffectingVisibleColumnRange(
    visibleStartIndex: number,
    visibleEndIndex: number,
    merges: any[]
): any[] {
    return merges.filter(merge => {
        const startCol = utils.decode_col(merge.s.c);
        const endCol = utils.decode_col(merge.e.c);
        return (startCol <= visibleEndIndex && endCol >= visibleStartIndex);
    });
}

export function getAdditionalColumnsForMerges(
    visibleStartIndex: number,
    visibleEndIndex: number,
    merges: any[]
): { startIndex: number; endIndex: number } {
    let extendedStartIndex = visibleStartIndex;
    let extendedEndIndex = visibleEndIndex;

    for (const merge of merges) {
        const startCol = utils.decode_col(merge.s.c);
        const endCol = utils.decode_col(merge.e.c);

        // If merge starts before visible range but ends within it
        if (startCol < visibleStartIndex && endCol >= visibleStartIndex) {
            extendedStartIndex = Math.min(extendedStartIndex, startCol);
        }

        // If merge starts within visible range but ends after it
        if (startCol <= visibleEndIndex && endCol > visibleEndIndex) {
            extendedEndIndex = Math.max(extendedEndIndex, endCol);
        }
    }

    return { startIndex: extendedStartIndex, endIndex: extendedEndIndex };
}

export const rgbToHsl = (r: number, g: number, b: number) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    const h = d === 0 ? 0 : max === r ? (g - b) / d : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: h * 60, s, l };
}

export const hslToRgb = (h: number, s: number, l: number): string => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    const r = Math.round((h < 60 ? c : h < 120 ? x : h < 180 ? 0 : h < 240 ? -x : c) + m);
    const g = Math.round((h < 60 ? x : h < 120 ? c : h < 180 ? c : h < 240 ? x : 0) + m);
    const b = Math.round((h < 60 ? 0 : h < 120 ? 0 : h < 180 ? x : h < 240 ? c : -x) + m);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}


export const applyTintToRgb = (rgb: string, tint: number): string => {
    const rgbArray = rgb.match(/\w\w/g)?.map(hex => parseInt(hex, 16)) ?? [0, 0, 0];
    const hsl = rgbToHsl(rgbArray[0], rgbArray[1], rgbArray[2]);
    if (tint < 0) {
        hsl.l = hsl.l * (1 + tint);
    } else {
        hsl.l = hsl.l * (1 - tint) + (1 - 1 * (1 - tint));
    }
    return hslToRgb(hsl.h, hsl.s, hsl.l);
}

export const hexToRgba = (hex: string, alpha: number): string => {
    const cleanHex = hex.replace("#", "");
    
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function doesFontExist(fontName: string): boolean {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const text = "abcdefghijklmnopqrstuvwxyz0123456789";
    if (!context) {
        console.error("Failed to get canvas context to check if font exists");
        return false;
    }
    context.font = "72px monospace";
    const baseline = context.measureText(text).width;
    context.font = `72px "${fontName}", monospace`;
    const width = context.measureText(text).width;
    return width !== baseline;
}

export function validateCellAddress(input: string): boolean {
    const singleCellRegex = /^[A-Z]+[1-9]\d*$/;

    const rangeRegex = /^[A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*$/;

    return singleCellRegex.test(input) || rangeRegex.test(input);
}

export function parseCellAddress(input: string): { row: number; col: number } | null {
    const match = input.match(/^([A-Z]+)([1-9]\d*)$/);
    if (!match) return null;

    const [, colStr, rowStr] = match;
    const row = parseInt(rowStr, 10) - 1;

    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - 64);
    }
    col = col - 1;

    return { row, col };
}

export function parseCellRange(input: string): { startCell: string; endCell: string; cells: string[] } | null {
    if (input.includes(":")) {
        const [startStr, endStr] = input.split(":");
        const start = parseCellAddress(startStr);
        const end = parseCellAddress(endStr);

        if (!start || !end) return null;

        const cells: string[] = [];
        for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row++) {
            for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col++) {
                cells.push(getCellAddress(row, col));
            }
        }

        return {
            startCell: getCellAddress(Math.min(start.row, end.row), Math.min(start.col, end.col)),
            endCell: getCellAddress(Math.max(start.row, end.row), Math.max(start.col, end.col)),
            cells
        };
    } else {
        const parsed = parseCellAddress(input);
        if (!parsed) return null;

        const cellAddress = getCellAddress(parsed.row, parsed.col);
        return {
            startCell: cellAddress,
            endCell: cellAddress,
            cells: [cellAddress]
        };
    }
}

export function getClientLocale(): string {
    return navigator.language;
}

export function formatDate(date: Date, locale: string | undefined = getClientLocale()): string {
    return date.toLocaleDateString(
        locale,
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }
    );
}
