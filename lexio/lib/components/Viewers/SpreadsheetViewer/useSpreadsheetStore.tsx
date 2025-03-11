import {Cell as WorksheetCell, FillPattern, Row as WorksheetRow, Workbook as ExcelJsWorkbook, Worksheet} from "exceljs";
import {CSSProperties, useCallback, useEffect, useState} from "react";
import {ColumnDef, Row as ReactTableRow} from "@tanstack/react-table";
import {
    CellContent,
    convertArgbToHex,
    excelAlignmentToCss,
    excelBorderToCss,
    extractCellComponent,
    getRowEntryWitMostColumns,
    isCellInRange,
    ptFontSizeToPixel,
    ptToPixel,
    resolveCellFormat,
    Row,
    RowList, sortSpreadsheetColumnsComparator,
    validateExcelRange
} from "./utils.ts";
import {cn} from "./ui/utils.ts";

export type SelectedCell = {
    row: number,
    column: string
};
export type Range = [string, string];

export type CellRange = Record<"top" | "right" | "bottom" | "left", string[]>;

type ExcelOperationsStore = {
    getExcelWorkbook: (buffer: ArrayBuffer, selectedSpreadsheet?: string | undefined) => Promise<ExcelJsWorkbook>;
    sheetNames: string[];
    setSheetNames: (spreadsheets: string[]) => void;
    worksheets: Worksheet[];
    selectedSpreadsheet: string;
    setSelectedSpreadsheet: (spreadsheet: string) => void;
    selectedCell?: SelectedCell  | undefined;
    setSelectedCell: (cell?: { row: number, column: string } | undefined) => void;
    rangeToSelect: Range[],
    setRangeToSelect: (range: Range[]) => void;
};

export const useSpreadsheetStore = (): ExcelOperationsStore => {
    const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<string>("");
    const [selectedCell, setSelectedCell] = useState<SelectedCell | undefined>(undefined);
    const [rangeToSelect, setRangeToSelect] = useState<Range[]>([]);

    const setWorkbookData = useCallback((workbook: ExcelJsWorkbook, selectedSpreadsheet?: string | undefined) => {
        setWorksheets(workbook.worksheets);
        const spreadsheetsFromFile = workbook.worksheets.map((w) => w.name);

        setSheetNames(spreadsheetsFromFile);

        let selectedSheetFromFile = "";
        if (!workbook.worksheets.find((ws) => ws.name === selectedSpreadsheet)) return;
        selectedSheetFromFile = selectedSpreadsheet ?? workbook.worksheets[0].name;
        setSelectedSpreadsheet(selectedSheetFromFile);
    }, []);

    const getExcelWorkbook = useCallback(async (arrayBuffer: ArrayBuffer, selectedSpreadsheet?: string | undefined): Promise<ExcelJsWorkbook> => {
        const wbJs = new ExcelJsWorkbook();
        const wb = await wbJs.xlsx.load(arrayBuffer);
        setWorkbookData(wb, selectedSpreadsheet);
        return wb;
    }, []);

    return {
        getExcelWorkbook,
        sheetNames,
        setSheetNames,
        worksheets,
        selectedSpreadsheet,
        setSelectedSpreadsheet,
        selectedCell,
        setSelectedCell,
        rangeToSelect,
        setRangeToSelect,
    };
};

type InputSpreadsheetViewerStore = {
    fileBufferArray: ArrayBuffer;
    defaultSelectedSheet?: string | undefined;
    rangesToHighlight?: string[] | undefined;
}

type OutputSpreadsheetViewerStore = {
    sheetNames: string[];
    selectedSpreadsheet: string;
    setSelectedSpreadsheet: (spreadsheet: string) => void;
    selectedCell?: SelectedCell  | undefined;
    setSelectedCell: (cell?: { row: number, column: string } | undefined) => void;
    rangeToSelect: Range[];
    isLoading: boolean;
    error: unknown;
    columns: ColumnDef<Row, CellContent>[];
    rowData: RowList;
    cellStyles?: Record<string, CSSProperties> | undefined;
    rowStyles?: Record<string, CSSProperties> | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
}

export const useSpreadsheetViewerStore = (input: InputSpreadsheetViewerStore): OutputSpreadsheetViewerStore => {
    const {
        getExcelWorkbook,
        rangeToSelect,
        setRangeToSelect,
        selectedCell,
        setSelectedCell,
        selectedSpreadsheet,
        setSelectedSpreadsheet,
        sheetNames,
        worksheets,
    } = useSpreadsheetStore();

    const [workbook, setWorkbook] = useState<ExcelJsWorkbook | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown | undefined>(undefined);

    useEffect(() => {
        const loadSpreadsheetData = async () => {
            setIsLoading(true);
            setError(undefined);
            try {
                const data = await getExcelWorkbook(input.fileBufferArray, input.defaultSelectedSheet);
                setWorkbook(data);
            } catch (e) {
                setError(e);
            } finally {
                setIsLoading(false);
            }
        }
        loadSpreadsheetData();
    }, []);

    const [columns, setColumns] = useState<ColumnDef<Row, CellContent>[]>([]);

    const [rowData, setRowData] = useState<RowList>([]);

    const [cellStyles, setCellStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    const [rowStyles, setRowStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    const [headerStyles, setHeaderStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    useEffect(() => {
        if (!input.rangesToHighlight) return;
        let rangesToSet: Range[] = [];
        input.rangesToHighlight.forEach((range: string) => {
            const rangeIsValid = validateExcelRange(range);

            if (!rangeIsValid) {
                console.warn("Invalid range. A valid range is an array with two entries. Ex.: ['A10', 'B15']");
                return;
            }

            const [firstCell, lastCell] = range.toUpperCase().split(":");
            rangesToSet = [...rangesToSet, [firstCell, lastCell]];
        });
        // Important: rangeToSelect is first cleared to enable a consistent and steady UI on change of range to select.
        setRangeToSelect([]);
        setRangeToSelect(rangesToSet);
    }, [input.rangesToHighlight]);

    useEffect(() => {
        if (!workbook) return;
        const worksheet = worksheets.find((ws) => ws.name === selectedSpreadsheet);
        if (!worksheet) {
            console.error("No worksheet found.");
            return;
        }

        let rows: RowList = [];
        const headerStylesForUpdate: Record<string, CSSProperties> = {};
        const rowStyleForUpdate: Record<number, CSSProperties> = {};
        const cellStylesForUpdate: Record<string, CSSProperties> = {};

        worksheet.eachRow({ includeEmpty: true }, (row: WorksheetRow, rowIndex: number) => {
            row.eachCell({ includeEmpty: true }, (cell: WorksheetCell) => {
                const columnId = extractCellComponent(cell.address)?.column;
                if (!columnId) return;

                const columnKey = extractCellComponent(cell.address)?.column ?? "";

                const colWidth = columnKey.length === 0 ? "40px" : `${ptToPixel(worksheet.getColumn(columnKey).width)}px`;

                headerStylesForUpdate[columnKey] = {
                    minWidth: colWidth,
                };

                rowStyleForUpdate[`${rowIndex}`] = {
                    //height: "100%",
                    height: `${ptToPixel(row.height)}px`,
                    // Borders
                    borderTop: `${excelBorderToCss(row.border?.top?.style, row.border?.top?.color?.argb)}`,
                    borderRight: `${excelBorderToCss(row.border?.right?.style, row.border?.right?.color?.argb)}`,
                    borderBottom: `${excelBorderToCss(row.border?.bottom?.style, row.border?.bottom?.color?.argb)}`,
                    borderLeft: `${excelBorderToCss(row.border?.left?.style, row.border?.left?.color?.argb)}`,
                };

                cellStylesForUpdate[`${cell.address}`] = {
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

                rows[rowIndex] = {
                    ...rows[rowIndex],
                    [columnId.toUpperCase()]: resolveCellFormat(cell.value, cell.type, cell.numFmt),
                }
            });
        });

        const rowWithMostColumns = getRowEntryWitMostColumns(rows);

        const sortedColumns = rowWithMostColumns.sort((a, b) => sortSpreadsheetColumnsComparator(a[0], b[0]));

        rows = rows.map((r) => {
            if (r !== null) return r;
            return Object.fromEntries(sortedColumns.map(([key]) => [key, ""]));
        })

        setRowData(rows.map((row, index) => ({ rowNo: `${index}`, ...row })));

        setColumns(
            [
                { header: "", accessorKey: "rowNo" },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ...sortedColumns.map(([key, _]) => ({
                    header: key,
                    accessorKey: key,
                    enableGrouping: true,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    cell: ({ row }) => {
                        if (!row.original[key]) return "";
                        if (typeof row.original[key] === "string" && row.original[key].includes("http"))
                            return <a href={row.original[key]}>{row.original[key]}</a>
                        return <div>{row.original[key]}</div>
                    },
                })),
            ]
        );

        setCellStyles(cellStylesForUpdate);
        setRowStyles(rowStyleForUpdate);
        setHeaderStyles(headerStylesForUpdate);
    }, [selectedSpreadsheet, workbook]);

    return {
        selectedSpreadsheet,
        rangeToSelect,
        selectedCell,
        setSelectedCell,
        setSelectedSpreadsheet,
        sheetNames,
        isLoading,
        error,
        columns,
        rowData,
        cellStyles,
        rowStyles,
        headerStyles,
    }
}

type Output<TData> = {
    highlightCells: (
        rows:  ReactTableRow<TData>[],
        rangesToSelect: Range[],
        cellRefs: Record<string, (HTMLTableCellElement | null)>,
        cellInnerContainerRefs: Record<string, (HTMLDivElement | null)>,
    ) => void;
}
export const useSpreadsheetStyles = <TData,>(): Output<TData> => {
    const getTableRangeBorder = useCallback((range: Range): CellRange => {
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
    }, []);

    const highlightCells = (
        rows:  ReactTableRow<TData>[],
        rangesToSelect: Range[],
        cellRefs: Record<string, (HTMLTableCellElement | null)>,
        cellInnerContainerRefs: Record<string, (HTMLDivElement | null)>,
    ) => {
        if (rangesToSelect.length === 0) return;

        rangesToSelect.forEach((range) => {
            rows.forEach((row) => {
                row.getVisibleCells().forEach((cell, index) => {
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

    return {
        highlightCells,
    }
}
