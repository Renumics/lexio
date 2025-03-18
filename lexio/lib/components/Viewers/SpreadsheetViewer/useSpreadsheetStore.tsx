import {
    Cell as ExcelJsWorksheetCell,
    FillPattern,
    Row as ExelJsWorksheetRow,
    Workbook as ExcelJsWorkbook,
    Worksheet as ExcelJsWorksheet
} from "exceljs";
import {CSSProperties, useEffect, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {
    CellContent,
    convertArgbToHex,
    excelAlignmentToCss,
    excelBorderToCss,
    extractCellComponent,
    // getRowEntryWitMostColumns,
    ptFontSizeToPixel,
    ptToPixel,
    // resolveCellFormat,
    generateSpreadsheetColumns,
    Row,
    RowList,
    sortSpreadsheetColumnsComparator,
    validateExcelRange, isCellInRange,
} from "./utils.ts";
import {
    ParsingOptions,
    read, Sheet2JSONOpts,
    utils,
    WorkBook as SheetJsWorkbook,
    WorkSheet as SheetJsWorkSheet,
} from "xlsx";

export type SelectedCell = {
    row: number,
    column: string
};
export type Range = [string, string];

export type CellRange = Record<"top" | "right" | "bottom" | "left", string[]>;

export type MergedRange = {
    start: { row: number, column: string },
    end: { row: number, column: string },
}

type CellMetaData = {
    h?: string | undefined;
    r?: string | number;
    t?: string | undefined;
    v?: string | number | undefined;
    w?: string | undefined;
    z?: string | undefined;
    f?: string | undefined;
}

type ExcelOperationsStore = {
    isLoading: boolean;
    error: unknown;
    sheetJsWorkbook: SheetJsWorkbook | undefined;
    // Important: used exclusively to load styles and not data !
    excelJsWorkbook: ExcelJsWorkbook | undefined;
    sheetNames: string[];
    setSheetNames: (spreadsheets: string[]) => void;
    sheetJsWorksheets: Record<string, SheetJsWorkSheet> | undefined;
    selectedWorksheetName: string;
    setSelectedWorksheetName: (spreadsheet: string) => void;
    selectedSheetJsWorksheet: SheetJsWorkSheet | undefined;
    setSelectedSheetJsWorksheet: (worksheet: SheetJsWorkSheet | undefined) => void;
    selectedCell?: SelectedCell  | undefined;
    setSelectedCell: (cell?: { row: number, column: string } | undefined) => void;
    rangeToSelect: Range[],
    setRangeToSelect: (range: Range[]) => void;
    mergedRangesOfSelectedWorksheet: MergedRange[];
};
const useSpreadsheetStore = (arrayBuffer: ArrayBuffer, defaultSpreadsheetName?: string | undefined): ExcelOperationsStore => {
    const [sheetJsWorkbook, setSheetJsWorkbook] = useState<SheetJsWorkbook | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown | undefined>(undefined);
    const [sheetJsWorksheets, setSheetJsWorksheets] = useState<Record<string, SheetJsWorkSheet> | undefined>(undefined);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedWorksheetName, setSelectedWorksheetName] = useState<string>("");
    const [selectedSheetJsWorksheet, setSelectedSheetJsWorksheet] = useState<SheetJsWorkSheet | undefined>(undefined);
    const [selectedCell, setSelectedCell] = useState<SelectedCell | undefined>(undefined);
    const [rangeToSelect, setRangeToSelect] = useState<Range[]>([]);
    const [mergedRangesOfSelectedWorksheet, setMergedRangesOfSelectedWorksheet] = useState<MergedRange[]>([]);
    // Important: used exclusively to load styles and not data !
    const [excelJsWorkbook, setExcelJsWorkbook] = useState<ExcelJsWorkbook | undefined>(undefined);

    useEffect(() => {
        const getExcelWorkbook = async (arrayBuffer: ArrayBuffer, selectedSpreadsheetName?: string | undefined): Promise<SheetJsWorkbook> => {
            const setWorkbookData = (workbook: SheetJsWorkbook, selectedSpreadsheet?: string | undefined) => {
                setSheetJsWorksheets(workbook.Sheets);
                setSheetNames(workbook.SheetNames);

                // Set the selected spreadsheet based on the input or the first available spreadsheet in the workbook as default.
                const selectedSheetFromFile = workbook.SheetNames.find((name) => name === selectedSpreadsheet) ?? workbook.SheetNames[0];
                setSelectedWorksheetName(selectedSheetFromFile);

                // Set selected spreadsheet if provided.
                const selectedWorksheet = workbook.Sheets[selectedSheetFromFile];
                setSelectedSheetJsWorksheet(selectedWorksheet);

                const mergedRanges: MergedRange[] = selectedWorksheet["!merges"] ? selectedWorksheet["!merges"].map((range) => {
                    const encodeStartColumn = utils.encode_col(range.s.c);
                    const encodeEndColumn = utils.encode_col(range.e.c);
                    return {
                        start: {
                            row: range.s.r + 1, // Because the row count is 0-based indexed
                            column: encodeStartColumn,
                        },
                        end: {
                            row: range.e.r + 1, // Because the row count is 0-based indexed
                            column: encodeEndColumn,
                        },
                    };
                }) : [];
                setMergedRangesOfSelectedWorksheet(mergedRanges)
            }

            const readParsingOptions: ParsingOptions = {
                type: "file",
                // cellFormula: true,
                // cellHTML: true,
                cellNF: true,
                cellText: true,
                // bookFiles: false,
                sheetStubs: true,
                nodim: false,
                PRN: false,
            }

            const workbook = read(arrayBuffer, readParsingOptions);

            // Important: used exclusively to load styles and not data !
            const excelJsWorkbook = new ExcelJsWorkbook();
            const excelJsWorkbookInstance = await excelJsWorkbook.xlsx.load(arrayBuffer);
            setExcelJsWorkbook(excelJsWorkbookInstance);

            setWorkbookData(workbook, selectedSpreadsheetName);
            return workbook;
        };

        // Load the workbook when the component calling this hooks mounts.
        (async () => {
            setIsLoading(true);
            setError(undefined);
            try {
                const loadedWorkbook = await getExcelWorkbook(arrayBuffer, defaultSpreadsheetName);
                setSheetJsWorkbook(loadedWorkbook);
            } catch (e) {
                setError(e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [arrayBuffer, defaultSpreadsheetName]);

    // Switch worksheet when selectedWorksheetName gets updated.
    useEffect(() => {
        if (isLoading && (!sheetJsWorkbook || !sheetJsWorksheets)) return;
        if (!sheetJsWorkbook || !sheetJsWorksheets) return;
        setSelectedSheetJsWorksheet(sheetJsWorksheets[selectedWorksheetName]);
    }, [selectedWorksheetName, sheetJsWorkbook, sheetJsWorksheets]);

    return {
        isLoading,
        error,
        // Important: used exclusively to load styles and not data !
        excelJsWorkbook,
        sheetJsWorkbook,
        sheetNames,
        setSheetNames,
        sheetJsWorksheets,
        selectedWorksheetName,
        setSelectedWorksheetName,
        selectedSheetJsWorksheet,
        setSelectedSheetJsWorksheet,
        selectedCell,
        setSelectedCell,
        rangeToSelect,
        setRangeToSelect,
        mergedRangesOfSelectedWorksheet,
    };
};

type InputSpreadsheetViewerStore = {
    fileBufferArray: ArrayBuffer;
    defaultSelectedSheet?: string | undefined;
    rangesToHighlight?: string[] | undefined;
}

type OutputSpreadsheetViewerStore = {
    sheetNames: string[];
    selectedWorksheetName: string;
    setSelectedWorksheetName: (spreadsheet: string) => void;
    selectedCell?: SelectedCell  | undefined;
    setSelectedCell: (cell?: { row: number, column: string } | undefined) => void;
    rangeToSelect: Range[];
    mergedRangesOfSelectedWorksheet: MergedRange[];
    isLoading: boolean;
    error: unknown;
    columns: ColumnDef<Row, CellContent>[];
    rowData: RowList;
    cellStyles?: Record<string, CSSProperties> | undefined;
    rowStyles?: Record<string, CSSProperties> | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
    getMetaDataOfSelectedCell: () => CellMetaData;
}

export const useSpreadsheetViewerStore = (input: InputSpreadsheetViewerStore): OutputSpreadsheetViewerStore => {
    const {
        isLoading,
        error,
        sheetJsWorkbook,
        excelJsWorkbook,
        rangeToSelect,
        setRangeToSelect,
        selectedCell,
        setSelectedCell,
        selectedWorksheetName,
        setSelectedWorksheetName,
        selectedSheetJsWorksheet,
        sheetNames,
        mergedRangesOfSelectedWorksheet,
    } = useSpreadsheetStore(input.fileBufferArray, input.defaultSelectedSheet);

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
        if (isLoading && (!sheetJsWorkbook || !selectedSheetJsWorksheet)) return;
        if (!sheetJsWorkbook || !selectedSheetJsWorksheet) {
            console.warn("No workbook or selected spreadsheet found.");
            return;
        }
        if (!selectedSheetJsWorksheet) {
            console.error("No worksheet found.");
            return;
        }

        const sheetToJsonOptions: Sheet2JSONOpts = {
            header: "A",
            blankrows: true,
            defval: "",
            raw: false,
            skipHidden: false,
            rawNumbers: false,
        }

        const sortedWorksheetColumns = generateSpreadsheetColumns(selectedSheetJsWorksheet["!ref"] as string)
            .sort((a, b) => sortSpreadsheetColumnsComparator(a, b));

        console.log("selectedSheetJsWorksheet: ", selectedSheetJsWorksheet);

        const rows: RowList = utils.sheet_to_json(selectedSheetJsWorksheet, sheetToJsonOptions);

        setColumns(
            [
                { header: "", accessorKey: "rowNo" },
                ...sortedWorksheetColumns.map((key) => ({
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

        // Property rowNo added to ease row identification.
        setRowData(rows.map((row, index) => ({ rowNo: `${index + 1}`, ...row })));
    }, [selectedSheetJsWorksheet, selectedWorksheetName, sheetJsWorkbook]);

    // Sets styles of active worksheet.
    useEffect(() => {
        if (isLoading && !excelJsWorkbook) return;
        if (!excelJsWorkbook) return;

        const excelJsSelectedWorksheet = excelJsWorkbook.worksheets.find((ws) => ws.name === selectedWorksheetName);

        if (!excelJsSelectedWorksheet) {
            console.error("No excelJs worksheet found. No styles will be applied on the active worksheet.");
            return;
        }
        const {
            headerStyles,
            rowStyles,
            cellStyles,
        } = getStyleOfWorksheet(excelJsSelectedWorksheet);

        setHeaderStyles(headerStyles);
        setRowStyles(rowStyles);
        setCellStyles(cellStyles);
    }, [excelJsWorkbook, selectedWorksheetName]);

    const getMetaDataOfSelectedCell = (): CellMetaData => {
        if (!selectedCell) return {};
        if (!selectedSheetJsWorksheet) {
            throw new Error("No worksheet found. No metadata will be fetched.");
        }
        return selectedSheetJsWorksheet[`${selectedCell.column}${selectedCell.row + 1}`] as CellMetaData;
    }

    return {
        selectedWorksheetName,
        setSelectedWorksheetName,
        rangeToSelect,
        selectedCell,
        setSelectedCell,
        sheetNames,
        isLoading,
        error,
        columns,
        rowData,
        cellStyles,
        rowStyles,
        headerStyles,
        mergedRangesOfSelectedWorksheet,
        getMetaDataOfSelectedCell,
    }
}

type WorksheetStyle = {
    headerStyles: Record<string, CSSProperties>;
    rowStyles: Record<number, CSSProperties>;
    cellStyles: Record<string, CSSProperties>;
}
const getStyleOfWorksheet = (worksheet: ExcelJsWorksheet): WorksheetStyle => {
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
                //height: "100%",
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


export const applyMergesToCells = (merges: MergedRange[], cellRefs: Record<string, HTMLTableCellElement | null>) => {
    if (merges.length === 0) return;

    for (const merge of merges) {
        const firstCell = `${merge.start.column}${merge.start.row}`;
        const lastCell = `${merge.end.column}${merge.end.row}`;

        if (!firstCell ||!lastCell) {
            console.error("Invalid merge range. No cells found.");
            return;
        }

        Object.entries(cellRefs).forEach(([cellAddress, cellRef]) => {
            if (!cellRef) return;
            const cellComponent = extractCellComponent(cellAddress);
            if (!cellComponent) return;
            isCellInRange(cellComponent?.row, cellComponent.column, [firstCell, lastCell]);

            if (cellAddress === lastCell) {
                // cellRef?.remove?.();
            }
        })

        // cellRefs[lastCell]?.remove?.();
    }
}
