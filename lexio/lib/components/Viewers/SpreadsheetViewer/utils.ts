import {Alignment, BorderStyle,} from "exceljs";
import {CSSProperties} from "react";
import {CellRange, Range} from "./useSpreadsheetStore.tsx";
import {cn} from "./ui/utils.ts";
import {Cell, Row as ReactTableRow} from "@tanstack/react-table";
import {utils} from "xlsx";

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

export const validateExcelRange = (range: string): boolean => {
    const regex = /^[A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*$/;
    return regex.test(range);
}

export const sortSpreadsheetColumnsComparator = (current: string, next: string): number => {
    if (current.length !== next.length) {
        return current.length - next.length;
    }
    return current.localeCompare(next);
}

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

export const ptFontSizeToPixel = (pt?: number): number => {
    const DEFAULT_FONT_SIZE = 16;
    if (!pt) return DEFAULT_FONT_SIZE;
    return ptToPixel(pt);
}

export const ptToPixel = (pt?: number): number => {
    const PT_TO_PX_FACTOR = 1.3333;
    if (!pt) return 0;
    return Math.round(pt * PT_TO_PX_FACTOR);
}

export const convertArgbToHex = (rgbColor?: string): string => {
    if (!rgbColor) return "";
    return `#${rgbColor.length > 6 ? rgbColor.slice(2) : rgbColor}`;
}

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

export const highlightCells = <TData,>(
    rows:  ReactTableRow<TData>[],
    rangesToSelect: Range[],
    cellRefs: Record<string, (HTMLTableCellElement | null)>,
    // cellInnerContainerRefs: Record<string, (HTMLDivElement | null)>,
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

export const calculateWidthOfFirstColumn = (rowCount: number): number => {
    const baseWidth = 40; // Base width in pixels
    const incrementPerRow = 10; // Width increment per row in pixels
    return baseWidth + Math.floor(String(rowCount).length * incrementPerRow);
}

export const calculateWidthOfColumn = (columnId: string, headerStyles: Record<string, CSSProperties>): number => {
    const styleOfHeader = headerStyles[columnId];
    const minWidthInPixel = (styleOfHeader?.minWidth ?? "0px") as string;
    const minWidthInt = Number(minWidthInPixel.split("px")[0]);

    const minWidthToWidthFactor = 7;

    // If minWidth from styleOfHeader is 0 set it to a default value of 10px.
    const nonZeroMinWidthOfColumn = minWidthInt === 0 ? 10 : minWidthInt;

    const result = nonZeroMinWidthOfColumn * minWidthToWidthFactor;

    if (result <= DEFAULT_COLUMN_WIDTH) return DEFAULT_COLUMN_WIDTH;

    return result;
}

export const calculateHeightOfRow = (rowIndex: number, rowStyles: Record<string, CSSProperties>): number => {
    const styleOfRow = rowStyles[rowIndex];
    const heightInPixel = (styleOfRow?.height ?? "0px") as string;
    const heightInt = Number(heightInPixel.split("px")[0]);

    const minHeightFactor = 1.5;

    // If minWidth from styleOfHeader is 0 set it to a default value of 10px.
    const nonZeroMinHeightOfRow = heightInt === 0 ? 10 : heightInt;

    const result = nonZeroMinHeightOfRow * minHeightFactor;

    if (result <= DEFAULT_ROW_HEIGHT) return DEFAULT_ROW_HEIGHT;

    return result;
}

export const getCellStyle = (row: number, column: string, cellStyles: Record<string, CSSProperties>): CSSProperties => {
    if (!row || !column) return {};
    return cellStyles[`${column}${row}`];
}

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

