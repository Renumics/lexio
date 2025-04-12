import {
    Alignment,
    BorderStyle,
    Cell as ExcelJsWorksheetCell,
    FillPattern,
    Row as ExelJsWorksheetRow,
    Worksheet as ExcelJsWorksheet,
} from "exceljs";
import {CSSProperties} from "react";
import {CellRange, MergedRange, MergeGroup, Range} from "./useSpreadsheetStore.tsx";
import {cn} from "./ui/utils.ts";
import {Cell, Row as ReactTableRow} from "@tanstack/react-table";
import {utils} from "xlsx";
import type * as SheetJs from "xlsx";

export type CellContent = Readonly<string | number | null | Partial<CSSProperties>>;

export type Row = Record<string, CellContent>;

export type RawRow = Record<string, string | number | null>;

export type RowList = Row[];

export type CellContentEntry = [string, CellContent];

// In pixel
export const DEFAULT_COLUMN_WIDTH = 120 as const;

export const DEFAULT_ROW_HEIGHT = 25 as const;

export const TABLE_HEAD_ROW_HEIGHT = 35 as const;

export const Z_INDEX_OF_STICKY_HEADER_ROW = 10 as const;

/**
 * Extracts the column letter and row number from a cell address (e.g., "A1" returns {column: "A", row: 1 }).
 *
 * @function extractCellComponent
 * @param cellName The cell address to extract from.
 * @returns An object containing the column and row, or null if the cell address is invalid.
 */
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

/**
 * Checks if a cell (specified by row and column) is within a given range.
 *
 * @function isCellInRange
 * @param row The row number of the cell.
 * @param column The column letter of the cell.
 * @param range The range to check against (e.g., ["A1", "B10"]).
 * @returns True if the cell is within the range, false otherwise.
 */
export const isCellInRange = (row: number, column: string, range: Range): boolean => {
    const componentOfFirstCellOfRange = extractCellComponent(range[0]);
    const componentOfLastCellOfRange = extractCellComponent(range[1]);

    if (!componentOfFirstCellOfRange || !componentOfLastCellOfRange) {
        console.warn("Invalid range. A valid range is an array with two entries. Ex.: ['A10', 'B15']");
        return false;
    }
    if (componentOfFirstCellOfRange.row < 0 || componentOfLastCellOfRange.row < 0) {
        console.warn("Invalid range. A valid range has cells in the range A1 to X10.");
        return false;
    }
    if (componentOfFirstCellOfRange.row > componentOfLastCellOfRange.row) {
        console.warn("Invalid range. First cell of the range should be smaller than last cell of that range.");
        return false;
    }

    if (row > componentOfLastCellOfRange.row) return false;
    if (row < componentOfFirstCellOfRange.row) return false;

    if (utils.decode_col(column) < utils.decode_col(componentOfFirstCellOfRange.column)) return false;
    return utils.decode_col(column) <= utils.decode_col(componentOfLastCellOfRange.column);

};

/**
 * Validates if a given string is a valid Excel range (e.g., "A1:B10").
 *
 * @function validateExcelRange
 * @param range The range string to validate.
 * @returns True if the range is valid, false otherwise.
 */
export const validateExcelRange = (range: string): boolean => {
    const regex = /^[A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*$/;
    return regex.test(range);
}

/**
 * Comparator function to sort spreadsheet columns alphabetically.
 *
 * @function sortSpreadsheetColumnsComparator
 * @param current The current column letter.
 * @param next The next column letter.
 * @returns A number indicating the sort order.
 */
export const sortSpreadsheetColumnsComparator = (current: string, next: string): number => {
    if (current.length !== next.length) {
        return current.length - next.length;
    }
    return current.localeCompare(next);
}

/**
 * Sorts an array of spreadsheet cells.
 *
 * @function sortSpreadsheetRange
 * @param cells An array of cell addresses (e.g., ["A1", "B10", "A2"]).
 * @returns A new array with the cells sorted.
 */
export const sortSpreadsheetRange = (cells: string[]): string[] => {
    return cells.sort((a, b) => {
        const colA = a.replace(/\d+/, "");
        const colB = b.replace(/\d+/, "");
        const rowA = parseInt(a.replace(/\D+/, ""));
        const rowB = parseInt(b.replace(/\D+/, ""));

        if (colA !== colB) {
            return colA.localeCompare(colB);
        }
        return rowA - rowB;
    });
}

/**
 * Converts a font size in pt to pixels.
 *
 * @param pt The font size in pt.
 * @returns The font size in pixels.
 */
export const ptFontSizeToPixel = (pt?: number): number => {
    const DEFAULT_FONT_SIZE = 16;
    if (!pt) return DEFAULT_FONT_SIZE;
    return ptToPixel(pt);
}

/**
 * Converts a font size from points (pt) to pixels (px).
 *
 * @param pt The font size in points.
 * @returns The equivalent font size in pixels.
 */
export const ptToPixel = (pt?: number): number => {
    const PT_TO_PX_FACTOR = 1.3333;
    if (!pt) return 0;
    return Math.round(pt * PT_TO_PX_FACTOR);
}

/**
 * Converts an ARGB color string (e.g., "FFRRGGBB") to a hexadecimal color string (e.g., "#RRGGBB").
 *
 * @param rgbColor The ARGB color string to convert.
 * @returns The hexadecimal color string.
 */
export const convertArgbToHex = (rgbColor?: string): string => {
    if (!rgbColor) return "";
    return `#${rgbColor.length > 6 ? rgbColor.slice(2) : rgbColor}`;
}

/**
 * Converts an Excel border style and ARGB color to a CSS border style string.
 *
 * @param excelBorderStyle The Excel border style.
 * @param argbColor The ARGB color for the border.
 * @returns A CSS border style string.
 */
export const excelBorderToCss = (excelBorderStyle?: BorderStyle, argbColor?: string) => {
    const defaultBorderStyle = "unset";

    if (!excelBorderStyle || !argbColor) return defaultBorderStyle;

    const borderMap = {
        "thin": `1px solid ${convertArgbToHex(argbColor)}`,
        "dotted": `1px dotted ${convertArgbToHex(argbColor)}`,
        "hair": `1px solid ${convertArgbToHex(argbColor)}`,
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

    return borderMap[excelBorderStyle] || defaultBorderStyle;
}

/**
 * Converts Excel alignment properties to CSS properties for text alignment.
 *
 * @param alignment An object containing Excel alignment properties (e.g., horizontal, vertical, wrapText).
 * @returns An object containing CSS properties for text alignment.
 */
export const excelAlignmentToCss = (alignment: Partial<Alignment>): CSSProperties => {
    let cssAlignment: CSSProperties = {};

    const horizontalAlignmentMap: Record<string, CSSProperties> = {
        left: {
            textAlign: "left",
            justifyItems: "start",
            justifyContent: "start",
        },
        right: {
            textAlign: "right",
            justifyItems: "end",
            justifyContent: "end",
        },
        center: {
            textAlign: "center",
            justifyItems: "center",
            justifyContent: "center",
        },
        centerContinuous: {
            textAlign: "center",
            justifyItems: "center",
            justifyContent: "center",
        },
        justify: {
            textAlign: "justify",
            justifyItems: "center",
            justifyContent: "center",
        },
        distributed: {
            textAlign: "left",
            justifyItems: "start",
            justifyContent: "start",
        },
        fill: {
            textAlign: "left",
            justifyItems: "start",
            justifyContent: "start",
        },
        default: {
            textAlign: "left",
            justifyItems: "start",
            justifyContent: "start",
        },
    };

    const verticalAlignmentMap: Record<string, CSSProperties> = {
        top: {
            verticalAlign: "top",
            alignItems: "start"
        },
        middle: {
            verticalAlign: "middle",
            alignItems: "center"
        },
        bottom: {
            verticalAlign: "bottom",
            alignItems: "end"
        },
        justify: {
            verticalAlign: "middle",
            alignItems: "center"
        },
        default: {
            verticalAlign: "bottom",
            alignItems: "end"
        },
    }

    cssAlignment = {
        ...cssAlignment,
        ...(horizontalAlignmentMap[alignment?.horizontal ?? "left"]),
        ...(verticalAlignmentMap[alignment?.vertical ?? "bottom"]),
        whiteSpace: alignment?.wrapText ? "normal" : "nowrap",
        paddingLeft: `${ptToPixel(alignment?.indent)}px`,
    }

    return cssAlignment;
};

/**
 * Generates an array of spreadsheet column letters from a given range (e.g., "A1:C10" returns ["A", "B", "C"]).
 *
 * @param range The range string to generate columns from (e.g., "A1:C10").
 * @returns An array of column letters.
 */
export const generateSpreadsheetColumns = (range: string): string[] => {
    const [, endColumn] = range.split(":");
    const lastColumnLetter = endColumn
        .replace(/[0-9]/g, "") // Extract the column letter
        .toUpperCase();

    const columns: string[] = [];
    let currentColumn = "A";

    while (currentColumn !== computeNextColumn(lastColumnLetter)) {
        columns.push(currentColumn.toUpperCase());
        currentColumn = computeNextColumn(currentColumn.toUpperCase()).toUpperCase();
    }

    return columns;
}

/**
 * Computes the next column letter in a spreadsheet (e.g., "A" -> "B", "Z" -> "AA").
 *
 * @param column The current column letter.
 * @returns The next column letter.
 */
const computeNextColumn = (column: string): string => {
    let carry = 1;
    let result = "";

    for (let i = column.length - 1; i >= 0; i--) {
        const charCode = column.charCodeAt(i) - 65 + carry;
        carry = charCode >= 26 ? 1 : 0;
        result = String.fromCharCode((charCode % 26) + 65) + result;
    }

    if (carry > 0) {
        result = "A" + result;
    }

    return result;
}

/**
 * Gets the border cells of a table range.
 *
 * @param range The range of cells (e.g., ["A1", "C3"]).
 * @returns An object containing arrays of cell addresses for the top, right, bottom, and left borders of the range.
 */
const getTableRangeBorder = (range: Range): CellRange => {
    const [startCell, endCell] = range;

    // Convert cell references (e.g., "A1") to row and column indices
    const startRowIndex = parseInt(startCell.slice(1)) - 1; // Row index (0-based)
    const startColIndex = startCell.charCodeAt(0) - 65;     // Column index (0-based, 'A' -> 0)
    const endRowIndex = parseInt(endCell.slice(1)) - 1;
    const endColIndex = endCell.charCodeAt(0) - 65;

    // Initialize border object
    const border: CellRange = {
        top: [],
        right: [],
        bottom: [],
        left: []
    };

    // Calculate border positions
    for (let col = startColIndex; col <= endColIndex; col++) {
        border.top.push(`${String.fromCharCode(65 + col)}${startRowIndex + 1}`);
        border.bottom.push(`${String.fromCharCode(65 + col)}${endRowIndex + 1}`);
    }

    for (let row = startRowIndex; row <= endRowIndex; row++) {
        border.left.push(`${String.fromCharCode(65 + startColIndex)}${row + 1}`);
        border.right.push(`${String.fromCharCode(65 + endColIndex)}${row + 1}`);
    }

    return border;
}

/**
 * Highlights cells within specified ranges by applying CSS styles (background-color, opacity, border).
 *
 * @param rows An array of React Table rows.
 * @param rangesToSelect An array of cell ranges to highlight (e.g., [["A1", "B2"], ["C3", "D4"]]).
 * @param cellRefs An object containing references to the table cells.
 */
export const highlightCells = <TData,>(
    rows:  ReactTableRow<TData>[],
    rangesToSelect: Range[],
    cellRefs: Record<string, (HTMLTableCellElement | null)>,
) => {
    if (rangesToSelect.length === 0) return;

    const cellInnerContainerRefs: Record<string, (HTMLDivElement | null)> = Object.values(cellRefs)
        .filter((cell) => cell !== null)
        // returns cellInnerContainer of cell
        .map((cell) => cell.children[0])
        .reduce((acc, currentInnerCell) => {
            if (!currentInnerCell) return acc;
            return {
                ...acc,
                [currentInnerCell.id]: currentInnerCell,
            }
        }, {});

    rangesToSelect.forEach((range) => {
        rows.forEach((row) => {
            row.getVisibleCells().forEach((cell: Cell<TData, unknown>, index: number) => {
                const cellId = `${cell.column.id}${cell.row.index + 1}`;
                const cellRef = cellRefs[cellId];
                const cellContainerRef = cellInnerContainerRefs[`${cellId}-inner-container`];
                const isCellWithInRange = isCellInRange(cell.row.index + 1, cell.column.id, range);
                const rangeToApply = getTableRangeBorder(range);
                const rangeCheck = (borderSide: keyof CellRange) => rangeToApply[borderSide].includes(`${cell.column.id}${cell.row.index + 1}`);

                if (cellRef && isCellWithInRange) {
                    const borderTop = rangeCheck("top") ? "2px solid rgb(59 130 246 / var(--tw-bg-opacity, 1))" : index === 0 ? "0.5px solid #c1c1c1" : "1px solid #E5E7EBFF";
                    const borderRight = rangeCheck("right") ? "2px solid rgb(59 130 246 / var(--tw-bg-opacity, 1))" : index === 0 ? "0.5px solid #c1c1c1" : "1px solid #E5E7EBFF";
                    const borderBottom = rangeCheck("bottom") ? "2px solid rgb(59 130 246 / var(--tw-bg-opacity, 1))" : index === 0 ? "0.5px solid #c1c1c1" : "1px solid #E5E7EBFF";
                    const borderLeft = rangeCheck("left") ? "2px solid rgb(59 130 246 / var(--tw-bg-opacity, 1))" : index === 0 ? "0.5px solid #c1c1c1" : "1px solid #E5E7EBFF";

                    cellRef.style.borderTop = borderTop;
                    cellRef.style.borderRight = borderRight;
                    cellRef.style.borderBottom = borderBottom;
                    cellRef.style.borderLeft = borderLeft;
                }

                if (cellContainerRef) {
                    cellContainerRef.className = cn(cellContainerRef.className, {
                        "!opacity-[70%]": isCellInRange(row.index + 1, cell.column.id, range),
                        "bg-blue-200": isCellInRange(row.index + 1, cell.column.id, range),
                    });
                }
            });
        });
    });
}

export const clearCellHighlights = <TData,>(
    rows:  ReactTableRow<TData>[],
    cellRefs: Record<string, (HTMLTableCellElement | null)>,
) => {
    if (rows.length === 0) return;

    const cellInnerContainerRefs: Record<string, (HTMLDivElement | null)> = Object.values(cellRefs)
        .filter((cell) => cell !== null)
        // returns cellInnerContainer of cell
        .map((cell) => cell.children[0])
        .reduce((acc, currentInnerCell) => {
            if (!currentInnerCell) return acc;
            return {
                ...acc,
                [currentInnerCell.id]: currentInnerCell,
            }
        }, {});

    rows.forEach((row) => {
        row.getVisibleCells().forEach((cell: Cell<TData, unknown>) => {
            const columnKey = cell.column.id;
            const rowIndex = cell.row.index + 1;
            const cellId = `${columnKey}${rowIndex}`;
            const cellRef = cellRefs[cellId];
            const cellContainerRef = cellInnerContainerRefs[`${cellId}-inner-container`];

            if (cellRef) {
                cellRef.style.borderRight = "1px solid #e5e7eb";
                cellRef.style.borderBottom = "1px solid #e5e7eb";
            }

            if (cellContainerRef) {
                cellContainerRef.className = cn(cellContainerRef.className
                    .replace("!opacity-[70%]", "")
                    .replace("bg-blue-200", "")
                );
            }
        });
    });
}

/**
 * Calculates the width of the first column based on the number of rows.
 *
 * @param rowCount The number of rows in the table.
 * @returns The calculated width of the first column.
 */
export const calculateWidthOfFirstColumn = (rowCount: number): number => {
    const baseWidth = 40; // Base width in pixels
    const incrementPerRow = 10; // Width increment per row in pixels
    return baseWidth + Math.floor(String(rowCount).length * incrementPerRow);
}

/**
 * Calculates the width of a column based on the header styles.
 *
 * @param columnId The ID (column letter) of the column.
 * @param headerStyles An object containing styles for the headers.
 * @returns The calculated width of the column.
 */
export const calculateWidthOfColumn = (columnId: string, headerStyles: Record<string, CSSProperties>): number => {
    const styleOfHeader = headerStyles[columnId];
    const minWidthInPixel = (styleOfHeader?.minWidth ?? "0px") as string;
    const minWidthInt = Number(minWidthInPixel.split("px")[0]);

    const minWidthToWidthFactor = 7;

    const nonZeroMinWidthOfColumn = minWidthInt === 0 ? 10 : minWidthInt;

    const result = nonZeroMinWidthOfColumn * minWidthToWidthFactor;

    if (result <= DEFAULT_COLUMN_WIDTH) return DEFAULT_COLUMN_WIDTH;

    return result;
}

/**
 * Calculates the height of a row based on the row styles.
 *
 * @param rowIndex The index of the row.
 * @param rowStyles An object containing styles for the rows.
 * @returns The calculated height of the row.
 */
export const calculateHeightOfRow = (rowIndex: number, rowStyles: Record<string, CSSProperties>): number => {
    const styleOfRow = rowStyles[rowIndex];
    const heightInPixel = (styleOfRow?.height ?? "0px") as string;
    const heightInt = Number(heightInPixel.split("px")[0]);

    const minHeightFactor = 1.5;

    const nonZeroMinHeightOfRow = heightInt === 0 ? 10 : heightInt;

    const result = nonZeroMinHeightOfRow * minHeightFactor;

    if (result <= DEFAULT_ROW_HEIGHT) return DEFAULT_ROW_HEIGHT;

    return result;
}

/**
 * Gets the cell style for a specific cell.
 *
 * @param row The row number of the cell.
 * @param column The column letter of the cell.
 * @param cellStyles An object containing styles for the cells.
 * @returns The cell style for the specified cell.
 */
export const getCellStyle = (row: number, column: string, cellStyles: Record<string, CSSProperties>): CSSProperties => {
    if (!row || !column) return {};
    return cellStyles[`${column}${row}`];
}

/**
 * Gets the cell style for the content of a cell while excluding some style properties.
 *
 * @param row The row number of the cell.
 * @param column The column letter of the cell.
 * @param cellStyles An object containing styles for the cells.
 * @param cssPropsToIgnoreInCellContent An array of CSS properties to ignore (optional).
 * @returns The cell style for the content of the specified cell.
 */
export const getCellStyleOfCellContent = (
    row: number,
    column: string,
    cellStyles: Record<string, CSSProperties>,
    cssPropsToIgnoreInCellContent: (keyof CSSProperties)[],
): CSSProperties => {

    const styles = getCellStyle(row, column, cellStyles);
    if (!styles) return {};
    const allStyleEntries = Object.entries(styles);
    const styleEntriesWithoutBorders = allStyleEntries.filter(([key]) =>
        !cssPropsToIgnoreInCellContent.includes(key as (keyof CSSProperties))
    );
    return Object.fromEntries(styleEntriesWithoutBorders) as CSSProperties;
}

/**
 * Applies merge styles to cells based on the merged ranges.
 *
 * @param mergeGroup An object containing the merged ranges for the sheet.
 * @param sheetName The name of the sheet.
 * @param allCellRefs An object containing references to all the table cells.
 * @param sheetJs The SheetJS library instance.
 */
export const applyMergesToCells = (
    mergeGroup: MergeGroup | undefined,
    sheetName: string, allCellRefs: Record<string, HTMLTableCellElement>,
    sheetJs: typeof SheetJs,
) => {
    if (sheetName.length === 0) return;
    if (!mergeGroup) return;
    if (mergeGroup.sheetName !== sheetName) return;
    if (mergeGroup.mergedRanges.length === 0) return;

    if (Object.entries(allCellRefs).length === 0) return;

    mergeCells(mergeGroup.mergedRanges, allCellRefs, sheetJs);
}

/**
 * Merges cells in the table based on the specified merged ranges.
 *
 * @param merges An array of merged ranges.
 * @param cellRefs An object containing references to all the table cells.
 * @param sheetJs The SheetJS library instance.
 * @param onCellMergeDone A callback function to be called when cell merging is done (optional).
 */
export const mergeCells = (
    merges: MergedRange[],
    cellRefs: Record<string, HTMLTableCellElement>,
    sheetJs: typeof SheetJs,
    onCellMergeDone?: (() => void) | undefined,
) => {
    if (merges.length === 0 || Object.keys(cellRefs).length === 0) {
        onCellMergeDone?.();
        return;
    }

    const { utils } = sheetJs;

    merges.forEach((merge) => {
        const startCell = cellRefs[`${merge.start.column}${merge.start.row}`];
        if (!startCell) return;
        if (startCell.colSpan > 1) return;
        if (startCell.colSpan > 1) return;
        const cellComponent = extractCellComponent(startCell.id);
        if (!cellComponent) return;
        if (!isCellInRange(cellComponent.row, cellComponent.column, [`${merge.start.column}${merge.start.row}`, `${merge.end.column}${merge.end.row}`])) return;

        const colSpan = utils.decode_col(merge.end.column) - utils.decode_col(merge.start.column) + 1;
        const rowSpan = merge.end.row - merge.start.row + 1;

        startCell.colSpan = colSpan;
        startCell.rowSpan = rowSpan;

        let totalWidth = parseFloat(startCell.style.width) || startCell.offsetWidth;
        let totalHeight = parseFloat(startCell.style.height) || startCell.offsetHeight;

        // Merge columns
        for (let col = utils.decode_col(merge.start.column) + 1; col <= utils.decode_col(merge.end.column); col++) {
            const cellToMerge = cellRefs[`${utils.encode_col(col)}${merge.start.row}`];
            if (cellToMerge) {
                totalWidth += parseFloat(cellToMerge.style.width) || cellToMerge.offsetWidth;
                cellToMerge.style.visibility = "hidden";
            }
        }

        // Merge rows
        for (let row = merge.start.row + 1; row <= merge.end.row; row++) {
            const cellToMerge = cellRefs[`${merge.start.column}${row}`];
            if (cellToMerge) {
                // Iterates over all cells in the row starting with merge.start.column till merge.end.column
                for (let col = utils.decode_col(merge.start.column); col <= utils.decode_col(merge.end.column); col++) {
                    const cellToMerge = cellRefs[`${utils.encode_col(col)}${row}`];
                    if (cellToMerge) {
                        cellToMerge.style.visibility = "hidden";
                    }
                }
                totalHeight += parseFloat(cellToMerge.style.height) || cellToMerge.offsetHeight;
            }
        }

        startCell.style.setProperty("border", "none", "important");
        const innerContainerOfStartCell = startCell.children[0] as HTMLDivElement | null;
        if (!innerContainerOfStartCell) return;
        innerContainerOfStartCell.style.height = `${totalHeight}px`;
        innerContainerOfStartCell.style.width = `${totalWidth}px`;
        innerContainerOfStartCell.style.borderBottom = "1px solid #e5e7eb";
        innerContainerOfStartCell.style.borderRight = "1px solid #e5e7eb";
    });

    onCellMergeDone?.();
};
type WorksheetStyle = {
    headerStyles: Record<string, CSSProperties>;
    rowStyles: Record<number, CSSProperties>;
    cellStyles: Record<string, CSSProperties>;
}

/**
 * Extracts style information from an ExcelJS worksheet and returns it as a `WorksheetStyle` object.
 *
 * @param worksheet The ExcelJS worksheet to extract styles from.
 * @returns An object containing header styles, row styles, and cell styles.
 */
export const getStyleOfWorksheet = (worksheet: ExcelJsWorksheet): WorksheetStyle => {
    const headerStyles: Record<string, CSSProperties> = {};
    const rowStyles: Record<number, CSSProperties> = {};
    const cellStyles: Record<string, CSSProperties> = {};

    worksheet.eachRow({ includeEmpty: true }, (row: ExelJsWorksheetRow, rowIndex: number) => {
        row.eachCell({ includeEmpty: true }, (cell: ExcelJsWorksheetCell) => {
            const columnId = extractCellComponent(cell.address)?.column;
            if (!columnId) return;

            const columnKey = extractCellComponent(cell.address)?.column ?? "";

            const colWidth = columnKey.length === 0 ? "40px" : `${ptToPixel(worksheet.getColumn(columnKey).width)}px`;

            headerStyles[columnKey] = {
                minWidth: colWidth,
            };

            rowStyles[`${rowIndex}`] = {
                height: `${ptToPixel(row.height)}px`,
                // Borders
                borderTop: `${excelBorderToCss(row.border?.top?.style, row.border?.top?.color?.argb)}`,
                borderRight: `${excelBorderToCss(row.border?.right?.style, row.border?.right?.color?.argb)}`,
                borderBottom: `${excelBorderToCss(row.border?.bottom?.style, row.border?.bottom?.color?.argb)}`,
                borderLeft: `${excelBorderToCss(row.border?.left?.style, row.border?.left?.color?.argb)}`,
            };

            cellStyles[`${cell.address}`] = {
                // colors
                backgroundColor: convertArgbToHex((cell.fill as FillPattern)?.fgColor?.argb),
                color: convertArgbToHex(cell.font?.color?.argb),
                // Font
                fontFamily: cell.font?.name,
                fontSize: `${ptFontSizeToPixel(cell.font?.size)}px`,
                fontWeight: cell.font?.bold ? "600" : undefined,
                fontStyle: cell.font?.italic ? "italic" : undefined,
                minWidth: colWidth,
                ...excelAlignmentToCss(cell.alignment),
                // Borders
                borderTop: `${excelBorderToCss(cell.border?.top?.style, cell.border?.top?.color?.argb)}`,
                borderRight: `${excelBorderToCss(cell.border?.right?.style, cell.border?.right?.color?.argb)}`,
                borderBottom: `${excelBorderToCss(cell.border?.bottom?.style, cell.border?.bottom?.color?.argb)}`,
                borderLeft: `${excelBorderToCss(cell.border?.left?.style, cell.border?.left?.color?.argb)}`,
                // Padding
                padding: "0px 3px",
            };
        });
    });

    return {
        headerStyles,
        rowStyles,
        cellStyles,
    }
}

