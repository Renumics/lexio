import {CellErrorValue, CellFormulaValue, CellHyperlinkValue, CellRichTextValue, CellValue, ValueType} from "exceljs";
import moment from "moment";
import {BorderStyle} from "exceljs";
import {Alignment} from "exceljs";
import {CSSProperties} from "react";
import {Range} from "./useSpreadsheetStore";

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
        console.log("Invalid range. A valid range is an array with two entries. Ex.: ['A10', 'B15']");
        return false;
    }
    if (componentOfFirstCellOfRange.row < 0 || componentOfLastCellOfRange.row < 0) {
        console.log("Invalid range. A valid range has cells in the range A1 to X10.");
        return false;
    }
    if (componentOfFirstCellOfRange.row > componentOfLastCellOfRange.row) {
        console.log("Invalid range. First cell of the range should be smaller than last cell of that range.");
        return false;
    }

    if (row > componentOfLastCellOfRange.row) return false;
    if (row < componentOfFirstCellOfRange.row) return false;
    const cellRange = `${column.toUpperCase()}${row}`;
    if (column < componentOfFirstCellOfRange.column || column > componentOfLastCellOfRange.column) return false;

    if (range[0] <= cellRange) return true;
    return cellRange <= range[1];

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

const formatDate = (rawDate: Date, format: string): string => {
    return moment.utc((rawDate as Date).toISOString()).format(format);
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
            break;
        case "center":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "center";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "center";
            cssAlignment.justifyContent = "center";
            break;
        case "centerContinuous":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "center";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "center";
            cssAlignment.justifyContent = "center";
            break;
        case "right":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "right";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "flex-end";
            cssAlignment.justifyContent = "flex-end";
            break;
        case "justify":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "justify";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "center";
            cssAlignment.justifyContent = "center";
            break;
        case "distributed":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "left";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "flex-start";
            cssAlignment.justifyContent = "flex-start";
            break;
        case "fill":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "left";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "flex-start";
            cssAlignment.justifyContent = "flex-start";
            break;
        default:
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.textAlign = "left";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.justifyItems = "flex-start";
            cssAlignment.justifyContent = "flex-start";
            break;
    }

    switch (alignment?.vertical) {
        case "top":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.verticalAlign = "top";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.alignItems = "flex-start";
            break;
        case "middle":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.verticalAlign = "middle";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.alignItems = "center";
            break;
        case "bottom":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.verticalAlign = "bottom";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.alignItems = "flex-end";
            break;
        case "justify":
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.verticalAlign = "middle";// In case the cell html element has display: flex as css attribute set.            cssAlignment.alignItems = "center";
            break;
        default:
            // In case the cell html element has display: inline, inline-block or is table-cell as css attribute set.
            cssAlignment.verticalAlign = "bottom";
            // In case the cell html element has display: flex as css attribute set.
            cssAlignment.alignItems = "flex-end";
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
