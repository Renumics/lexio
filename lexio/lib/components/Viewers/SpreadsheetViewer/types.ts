import { CellValue } from "exceljs";
import { CSSProperties } from "react";

export type CellMetadata = Record<string, CellValue>;

export type ColorScheme = {
    name: string,
    rgb: string,
}

export type ColorSchemeList = ColorScheme[];

export type SelectedCells = Record<string, CellRange | undefined>;

export type ExcelViewerData = {
    fileName: string;
    fileBufferArray: ArrayBuffer;
    defaultSelectedSheet?: string | undefined;
    rangesToHighlight?: SpreadsheetHighlight[] | undefined;	
}

export type ExcelViewerConfig = {
    colorScheme: "light" | "dark";
    showSearchbar: boolean;
    showNotifications: boolean;
    viewSettings: {
        showZoom: boolean;
        showHighlightToggle: boolean;
        showHighlightList: boolean;
        showOriginalStylesToggle: boolean;
    } | undefined;
    showOptionToolbar: boolean;
    showWorkbookDetails: boolean;
}

export type SheetData = {
    name: string
    data: (string | null)[][]
    styles: Record<string, object>
    merges: string[]
    cellsMetadata: Record<string, CellValue>
    colorThemes: ColorSchemeList | undefined
    colWidths: number[]
    rowHeights: number[]
    rowLimitExeceeded: boolean
}

export type SpreadsheetData = {
    sheets: Array<SheetData>;
    fileName: string;
    fileSize: string;
    lastModified: Date | undefined;
    createdOn: Date | undefined;
    fileType: string;
}

export type WorkerResponseData = SpreadsheetData & {
    error?: string | undefined;
    progress: number;
    loadingStep: string;
}

export type CellStyle = {
    color: CSSProperties["color"]
    backgroundColor: CSSProperties["backgroundColor"]
    fontWeight: CSSProperties["fontWeight"]
    fontStyle: CSSProperties["fontStyle"]
    fontFamily: CSSProperties["fontFamily"]
    fontSize: CSSProperties["fontSize"]
    wrapText: boolean;
    underline: boolean;
    strikeThrough: boolean;
    textRotation: number;
    textAlign: CSSProperties["textAlign"]
    verticalAlign: CSSProperties["verticalAlign"]
    borderTop: CSSProperties["borderTop"]
    borderRight: CSSProperties["borderRight"]
    borderBottom: CSSProperties["borderBottom"]
    borderLeft: CSSProperties["borderLeft"]
}

export type ShiftedMerge = {
    s: { r: number; c: string };
    e: { r: number; c: string }
}

export type CellRange = {
    startCell: string;
    endCell: string;
    cells: string[];
};

export interface SpreadsheetHighlight {
    sheetName: string;
    ranges: string[];
}

export type AlertMessage = {
    id: string;
    type: "warning" | "error";
    message: string;
    hidden?: boolean | undefined;
    creationDate: Date;
}
