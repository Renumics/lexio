import {
    Alignment,
    BorderStyle,
    CellErrorValue,
    CellFormulaValue,
    CellHyperlinkValue,
    CellRichTextValue,
    CellValue,
    ValueType,
} from "exceljs";
import {CSSProperties} from "react";
import {CellRange, Range} from "./useSpreadsheetStore.tsx";
import {cn} from "./ui/utils.ts";
import {Cell, Row as ReactTableRow} from "@tanstack/react-table";
import {utils} from "xlsx";

export type CellContent = Readonly<string | number>;

export type Row = Record<string, CellContent>;

export type RowList = Record<string, CellContent>[];

export type CellContentEntry = [string, CellContent];

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
    // const cellRange = `${column.toUpperCase()}${row}`;
    // if (column < componentOfFirstCellOfRange.column || column > componentOfLastCellOfRange.column) return false;

    // if (range[0] <= cellRange) return true;
    // return cellRange <= range[1];

    if (utils.decode_col(column) < utils.decode_col(componentOfFirstCellOfRange.column)) return false;
    return utils.decode_col(column) <= utils.decode_col(componentOfLastCellOfRange.column);

};

export const validateExcelRange = (range: string): boolean => {
    const regex = /^[A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*$/;
    return regex.test(range);
}

export const getRowEntryWitMostColumns = (data: RowList): CellContentEntry[] => {
    return data.reduce((acc: CellContentEntry[], currentRow: Row) => {
        const entries = Object.entries(currentRow).sort((a, b) => a[0].localeCompare(b[0])) as [string, CellContent][];
        if (acc.length < entries.length) return entries;
        return acc;
    }, []);
};

export const sortSpreadsheetColumnsComparator = (current: string, next: string): number => {
    if (current.length !== next.length) {
        return current.length - next.length;
    }
    return current.localeCompare(next);
}

export const resolveCellFormat = (value: CellValue, type: ValueType, numberFormat: string): CellContent => {
    switch (type) {
        case ValueType.Null: return "";
        case ValueType.Number: return Number(value);
        case ValueType.String: return String(value);
        case ValueType.Hyperlink: {
            const hyperLInkValue = value as CellHyperlinkValue;
            return hyperLInkValue.text;
        }
        case ValueType.Date: return formatDate(value as Date, numberFormat);
        case ValueType.Formula: {
            const result = (value as CellFormulaValue).result;
            if (!result) return "";
            if (isDate(result)) return formatDate(result as Date, numberFormat);
            if ((result as CellErrorValue).error) return (result as CellErrorValue).error;
            return result.toString();
        }
        case ValueType.RichText: {
            const richText = (value as CellRichTextValue).richText;
            if (!richText || richText.length) return "";
            return richText.join("\n ");
        }
        case ValueType.Error: return (value as CellErrorValue).error;
        default: return String(value);
    }
}

type DateFormaterKey = "YYYY" | "MM" | "DD" | "HH" | "hh" | "mm" | "ss" | "SSS";

const formatDate = (rawDate: Date, format: string): string => {
    const utcDate = new Date(rawDate.toISOString());

    const formatters: Record<DateFormaterKey, string> = {
        "YYYY": String(utcDate.getUTCFullYear()),
        "MM": String(utcDate.getUTCMonth() + 1).padStart(2, "0"),
        "DD": String(utcDate.getUTCDate()).padStart(2, "0"),
        "HH": String(utcDate.getUTCHours()).padStart(2, "0"),
        "hh": String(utcDate.getUTCHours() % 12 || 12).padStart(2, "0"),
        "mm": String(utcDate.getUTCMinutes()).padStart(2, "0"),
        "ss": String(utcDate.getUTCSeconds()).padStart(2, "0"),
        "SSS": String(utcDate.getUTCMilliseconds()).padStart(3, "0")
    };

    return format
        .replace(
            /\b(?:YYYY|MM|DD|HH|hh|mm|ss|SSS)\b/g,
            (match) => formatters[(match as DateFormaterKey)]
        );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDate = (obj: any): boolean => {
    return obj instanceof Date;
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
    const cssAlignment: CSSProperties = {};
    switch (alignment?.horizontal) {
        case "left":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "left";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "flex-start";
            cssAlignment.justifyContent = "flex-start";
            // In case the cell html element has display: grid as css attribute set.
            cssAlignment.justifyItems = "start";
            cssAlignment.justifyContent = "start";
            break;
        case "center":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "center";
            // In case the cell html element has display: flex or display: grid as css attribute set.
            cssAlignment.justifyItems = "center";
            cssAlignment.justifyContent = "center";
            break;
        case "centerContinuous":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "center";
            // In case the cell html element has display: flex or display: grid as css attribute set.
            cssAlignment.justifyItems = "center";
            cssAlignment.justifyContent = "center";
            break;
        case "right":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "right";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "flex-end";
            cssAlignment.justifyContent = "flex-end";
            // In case the cell html element has display: grid as css attribute set.
            cssAlignment.justifyItems = "end";
            cssAlignment.justifyContent = "end";
            break;
        case "justify":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "justify";
            // In case the cell html element has display: flex or display: grid as css attribute set.
            cssAlignment.justifyItems = "center";
            cssAlignment.justifyContent = "center";
            break;
        case "distributed":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "left";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "flex-start";
            cssAlignment.justifyContent = "flex-start";
            // In case the cell html element has display: grid as css attribute set.
            cssAlignment.justifyItems = "start";
            cssAlignment.justifyContent = "start";
            break;
        case "fill":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "left";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "flex-start";
            cssAlignment.justifyContent = "flex-start";
            // In case the cell html element has display: grid as css attribute set.
            cssAlignment.justifyItems = "start";
            cssAlignment.justifyContent = "start";
            break;
        default:
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "left";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "flex-start";
            cssAlignment.justifyContent = "flex-start";
            // In case the cell html element has display: grid as css attribute set.
            cssAlignment.justifyItems = "start";
            cssAlignment.justifyContent = "start";
            break;
    }

    switch (alignment?.vertical) {
        case "top":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.verticalAlign = "top";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.alignItems = "flex-start";
            // In case the cell html element has display: grid as css attribute set.
            cssAlignment.alignItems = "start";
            break;
        case "middle":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.verticalAlign = "middle";
            // In case the cell html element has display: flex or display: grid as css attribute set.
            cssAlignment.alignItems = "center";
            break;
        case "bottom":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.verticalAlign = "bottom";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.alignItems = "flex-end";
            // In case the cell html element has display: grid as css attribute set.
            cssAlignment.alignItems = "end";
            break;
        case "justify":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.verticalAlign = "middle";
            // In case the cell html element has display: flex or display: flex display: grid as css attribute set.
            cssAlignment.alignItems = "center";
            break;
        default:
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.verticalAlign = "bottom";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.alignItems = "flex-end";
            // In case the cell html element has display: grid as css attribute set.
            cssAlignment.alignItems = "end";
            break;
    }

    switch (alignment?.wrapText) {
        case true:
            cssAlignment.whiteSpace = "normal";
            break;
        default:
            cssAlignment.whiteSpace = "nowrap";
            break;
    }

    cssAlignment.paddingLeft = `${ptToPixel(alignment?.indent)}px`

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
    cellInnerContainerRefs: Record<string, (HTMLDivElement | null)>,
) => {
    if (rangesToSelect.length === 0) return;

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
