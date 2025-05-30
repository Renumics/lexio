import type * as ExcelJs from "exceljs";
import {Workbook as ExcelJsWorkbook} from "exceljs";
import {CSSProperties, useEffect, useState} from "react";
import * as ReactTable from "@tanstack/react-table";
import {ColumnDef} from "@tanstack/react-table";
import {
    calculateHeightOfRow,
    calculateWidthOfColumn,
    calculateWidthOfFirstColumn,
    CellContent,
    generateSpreadsheetColumns,
    getCellStyle,
    getCellStyleOfCellContent,
    getStyleOfWorksheet,
    RawRow,
    Row,
    RowList,
    sortSpreadsheetColumnsComparator,
    TABLE_HEAD_ROW_HEIGHT,
    validateExcelRange,
} from "./utils.ts";
import type * as SheetJs from "xlsx";
import {ParsingOptions, Sheet2JSONOpts, WorkBook as SheetJsWorkbook, WorkSheet as SheetJsWorkSheet,} from "xlsx";
import {SpreadsheetHighlight} from "../../../types.ts";

export type SelectedCell = {
    row: number,
    column: string
};
export type Range = [string, string];

export type CellRange = Record<"top" | "right" | "bottom" | "left", string[]>;

export type MergeGroup = {
    sheetName: string,
    mergedRanges: MergedRange[],
}

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

export type SpreadsheetTheme = {
    primary: CSSProperties["color"];
    secondary: CSSProperties["color"];
    success: CSSProperties["color"];
    warning: CSSProperties["color"];
    error: CSSProperties["color"];
    onPrimary: CSSProperties["color"];
    onSecondary: CSSProperties["color"];
    onSuccess: CSSProperties["color"];
    onWarning: CSSProperties["color"];
    onError: CSSProperties["color"];
    background: CSSProperties["background"];
    onBackground: CSSProperties["color"];
    borderRadius: CSSProperties["borderRadius"];
    fontFamily: CSSProperties["fontFamily"];
    fontSize: CSSProperties["fontSize"];
    toolbarForeground: CSSProperties["color"];
    sheetSelectionBackground: CSSProperties["background"];
    headerBackground: CSSProperties["color"];
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
    mergedGroupOfSelectedWorksheet: MergeGroup | undefined;
};
const useSpreadsheetStore = (
    excelJs: typeof ExcelJs,
    sheetJs: typeof SheetJs,
    arrayBuffer: ArrayBuffer,
    defaultSpreadsheetName?: string | undefined,
): ExcelOperationsStore => {
    const [sheetJsWorkbook, setSheetJsWorkbook] = useState<SheetJsWorkbook | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown | undefined>(undefined);
    const [sheetJsWorksheets, setSheetJsWorksheets] = useState<Record<string, SheetJsWorkSheet> | undefined>(undefined);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedWorksheetName, setSelectedWorksheetName] = useState<string>("");
    const [selectedSheetJsWorksheet, setSelectedSheetJsWorksheet] = useState<SheetJsWorkSheet | undefined>(undefined);
    const [selectedCell, setSelectedCell] = useState<SelectedCell | undefined>(undefined);
    const [rangeToSelect, setRangeToSelect] = useState<Range[]>([]);
    const [mergedGroupOfSelectedWorksheet, setMergedGroupOfSelectedWorksheet] = useState<MergeGroup | undefined>(undefined);
    const [excelJsWorkbook, setExcelJsWorkbook] = useState<ExcelJsWorkbook | undefined>(undefined);

    useEffect(() => {
        const getExcelWorkbook = async (arrayBuffer: ArrayBuffer): Promise<SheetJsWorkbook> => {
            const readParsingOptions: ParsingOptions = {
                type: "file",
                cellNF: true,
                cellText: true,
                sheetStubs: true,
                cellStyles: true,
                nodim: true,
            }

            const workbook = sheetJs.read(arrayBuffer, readParsingOptions);

            const excelJsWorkbook = new excelJs.Workbook();
            const excelJsWorkbookInstance = await excelJsWorkbook.xlsx.load(arrayBuffer);
            setExcelJsWorkbook(excelJsWorkbookInstance);

            return workbook;
        };

        // Load the workbook when the component calling this hooks mounts.
        (async () => {
            setIsLoading(true);
            setError(undefined);
            try {
                const loadedWorkbook = await getExcelWorkbook(arrayBuffer);
                setSheetJsWorkbook(loadedWorkbook);
            } catch (e) {
                setError(e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [arrayBuffer, defaultSpreadsheetName]);

    useEffect(() => {
        if (!sheetJsWorkbook) return;
        const setWorkbookData = (workbook: SheetJsWorkbook, selectedSpreadsheet?: string | undefined) => {
            setSheetJsWorksheets(workbook.Sheets);
            setSheetNames(workbook.SheetNames);

            // Set the selected spreadsheet based on the input or the first available spreadsheet in the workbook as default.
            const selectedSheetFromFile = workbook.SheetNames.find((name) => name === selectedSpreadsheet) ?? workbook.SheetNames[0];
            setSelectedWorksheetName(selectedSheetFromFile);

            // Set selected spreadsheet if provided.
            const selectedWorksheet = workbook.Sheets[selectedSheetFromFile];
            setSelectedSheetJsWorksheet(selectedWorksheet);
        }
        setWorkbookData(sheetJsWorkbook, defaultSpreadsheetName);
    }, [defaultSpreadsheetName, sheetJsWorkbook]);

    // Switch worksheet and update mergedRanges when selectedWorksheetName gets updated.
    useEffect(() => {
        if (isLoading && (!sheetJsWorkbook || !sheetJsWorksheets)) return;
        if (!sheetJsWorkbook || !sheetJsWorksheets) return;
        const selectedWorksheet = sheetJsWorksheets[selectedWorksheetName];
        setSelectedSheetJsWorksheet(selectedWorksheet);
    }, [isLoading, selectedWorksheetName, sheetJsWorkbook, sheetJsWorksheets]);

    // Update merged ranges when selectedSheetJsWorksheet gets updated.
    useEffect(() => {
        if (!selectedSheetJsWorksheet) return;
        setMergedGroupOfSelectedWorksheet({
            sheetName: selectedWorksheetName,
            mergedRanges: [],
        });
        const mergedRanges: MergedRange[] = selectedSheetJsWorksheet["!merges"] ? selectedSheetJsWorksheet["!merges"].map((range) => {
            const encodeStartColumn = sheetJs.utils.encode_col(range.s.c);
            const encodeEndColumn = sheetJs.utils.encode_col(range.e.c);
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
        const mergeGroup: MergeGroup = {
            sheetName: selectedWorksheetName,
            mergedRanges,
        }
        setMergedGroupOfSelectedWorksheet(mergeGroup);
    }, [selectedSheetJsWorksheet, selectedWorksheetName]);

    return {
        isLoading,
        error,
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
        mergedGroupOfSelectedWorksheet,
    };
};

/**
 * Input parameters for the useSpreadsheetViewerStore hook
 * @typedef {Object} InputSpreadsheetViewerStore
 * @property {ArrayBuffer} fileBufferArray - The spreadsheet file contents
 * @property {string} [defaultSelectedSheet] - Optional default sheet to select
 * @property {SpreadsheetHighlight[]} [rangesToHighlight] - Optional ranges to highlight
 * @property {typeof ReactTable} tanstackTable - TanStack Table instance
 * @property {typeof ExcelJs} excelJs - ExcelJS instance
 * @property {typeof SheetJs} sheetJs - SheetJS instance
 * @property {SpreadsheetTheme} spreadsheetTheme - A style object used for theming
 */
export type InputSpreadsheetViewerStore = {
    fileBufferArray: ArrayBuffer;
    defaultSelectedSheet?: string | undefined;
    rangesToHighlight?: SpreadsheetHighlight[] | undefined;
    tanstackTable: typeof ReactTable;
    excelJs: typeof ExcelJs;
    sheetJs: typeof SheetJs;
    spreadsheetTheme: SpreadsheetTheme;
}

export type OutputSpreadsheetViewerStore = {
    sheetNames: string[];
    selectedWorksheetName: string;
    setSelectedWorksheetName: (spreadsheet: string) => void;
    selectedCell?: SelectedCell  | undefined;
    setSelectedCell: (cell?: { row: number, column: string } | undefined) => void;
    rangeToSelect: Range[];
    mergedGroupOfSelectedWorksheet: MergeGroup | undefined;
    isLoading: boolean;
    error: unknown;
    columns: ColumnDef<Row, CellContent>[];
    rowData: RowList;
    cellStyles?: Record<string, CSSProperties> | undefined;
    rowStyles?: Record<string, CSSProperties> | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
    getMetaDataOfSelectedCell: () => CellMetaData;
    selectedRange: Range | undefined;
    setSelectedRange: (range?: Range | undefined) => void;
}

/**
 * A custom hook that manages the state and operations for the SpreadsheetViewer component.
 * It handles loading spreadsheet data, managing selections, and maintaining UI state.
 *
 * Features:
 * - Spreadsheet file loading and parsing
 * - Sheet management and selection
 * - Cell and range selection
 * - Style extraction and management
 * - Merged cell tracking
 * - Cell metadata access
 *
 * @function
 * @param {InputSpreadsheetViewerStore} props - Input parameters
 * @returns {OutputSpreadsheetViewerStore} Spreadsheet state and operations
 *
 * @example
 * ```tsx
 * const {
 *   selectedWorksheetName,
 *   selectedCell,
 *   rowData,
 *   // ... other values
 * } = useSpreadsheetViewerStore({
 *   fileBufferArray: excelBuffer,
 *   defaultSelectedSheet: "Sheet1",
 *   // ... other props
 * });
 * ```
 */
export const useSpreadsheetViewerStore = (
    {
        fileBufferArray,
        defaultSelectedSheet,
        rangesToHighlight,
        excelJs,
        sheetJs,
        spreadsheetTheme,
    }: InputSpreadsheetViewerStore
): OutputSpreadsheetViewerStore => {

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
        mergedGroupOfSelectedWorksheet,
    } = useSpreadsheetStore(excelJs, sheetJs, fileBufferArray, defaultSelectedSheet);

    const [columns, setColumns] = useState<ColumnDef<Row, CellContent>[]>([]);

    const [rawRowData, setRawRowData] = useState<RawRow[]>([]);

    const [rowData, setRowData] = useState<Row[]>([]);

    const [cellStyles, setCellStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    const [rowStyles, setRowStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    const [headerStyles, setHeaderStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    const [selectedRange, setSelectedRange] = useState<Range | undefined>(undefined);

    useEffect(() => {
        if (!rangesToHighlight) return;
        let rangesToSet: Range[] = [];
        const rangesOfSelectedSheet = rangesToHighlight.find((range) => range.sheetName === selectedWorksheetName);
        if (!rangesOfSelectedSheet) {
            setRangeToSelect([]);
            return;
        }
        rangesOfSelectedSheet.ranges.forEach((range: string) => {
            const rangeIsValid = validateExcelRange(range);

            if (!rangeIsValid) return;

            const [firstCell, lastCell] = range.toUpperCase().split(":");
            rangesToSet = [...rangesToSet, [firstCell, lastCell]];
        });
        setRangeToSelect(rangesToSet);
    }, [rangesToHighlight, selectedWorksheetName]);

    useEffect(() => {
        if (isLoading && (!sheetJsWorkbook || !selectedSheetJsWorksheet)) return;
        if (!sheetJsWorkbook || !selectedSheetJsWorksheet) return;
        if (!selectedSheetJsWorksheet) return;

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


        const rows: Row[] = sheetJs.utils.sheet_to_json(selectedSheetJsWorksheet, sheetToJsonOptions);

        const missingColumnKeysInRows: string[] = [];

        sortedWorksheetColumns.forEach((column) => {
            //@ts-ignore
            const columnKeyExists = !!rows.find((row) => row.hasOwnProperty(column));
            if (columnKeyExists) return;
            missingColumnKeysInRows.push(column);
        });

        const rowsWithAllColumnKeys = rows.map((row) => {
            return {
                ...row,
                ...missingColumnKeysInRows.reduce((acc, column) => {
                    return {
                        ...acc,
                        [column]: null,
                    }
                }, {}),
            }
        })

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
                        return row.original[key]
                    },
                })),
            ]
        );

        // Property rowNo added to ease row identification.
        const rawRows = [
            // Workaround for first row representing the header row.
            {...sortedWorksheetColumns.reduce((acc, currentKey) => {
                    return {
                        ...acc,
                        [currentKey]: currentKey,
                    };
                }, { rowNo: "" }),
            },
            ...rowsWithAllColumnKeys.map((row, index) => ({ rowNo: `${index + 1}`, ...row })),
        ] as RawRow[];

        setRawRowData(rawRows);
    }, [isLoading, selectedSheetJsWorksheet, selectedWorksheetName, sheetJsWorkbook]);

    // Sets styles of active worksheet.
    useEffect(() => {
        if (isLoading && !excelJsWorkbook) return;
        if (!excelJsWorkbook) return;

        const excelJsSelectedWorksheet = excelJsWorkbook.worksheets.find((ws) => ws.name === selectedWorksheetName);

        if (!excelJsSelectedWorksheet) return;
        const {
            headerStyles,
            rowStyles,
            cellStyles,
        } = getStyleOfWorksheet(excelJsSelectedWorksheet);

        setHeaderStyles(headerStyles);
        setRowStyles(rowStyles);
        setCellStyles(cellStyles);
    }, [excelJsWorkbook, isLoading, selectedWorksheetName]);

    // Computes and apply rowStyles, cellStyles and headerStyles to rows, cells and inner container of cells in rowData
    useEffect(() => {
        if (rawRowData.length === 0) return;
        if (!headerStyles || !rowStyles || !cellStyles) return;

        const cssPropsToIgnoreInCellContent: (keyof CSSProperties)[] = [
            "borderTop",
            "borderRight",
            "borderBottom",
            "borderLeft",
        ];

        const applyStylesToCells = (rawRow: RawRow, rowIndex: number): Row => {
            // Basic styles
            const stylesOfCells = Object.entries(rawRow).map((entry) => {
                const [columnKey] = entry;
                const isFirstCellOfRow = columnKey === "rowNo";

                // Styles for cells in header row
                if (rowIndex === 0) {
                    return {
                        [`${columnKey}${rowIndex}`]: {
                            borderTop: "unset",
                            borderRight: "1px solid #e5e7eb",
                            borderBottom: "1px solid #e5e7eb",
                            borderLeft: "unset",
                            margin: "0",
                            backgroundColor: spreadsheetTheme.headerBackground,
                            top: "-1px",
                            zIndex: "10",
                            userSelect: "none",
                            width: isFirstCellOfRow ? `${calculateWidthOfFirstColumn(rawRowData.length)}px` : `${calculateWidthOfColumn(columnKey, headerStyles)}px`,
                            height: `${TABLE_HEAD_ROW_HEIGHT}px`,
                            ...(isFirstCellOfRow ? {
                                textAlign: "center",
                                justifyItems: "center",
                                justifyContent: "center",
                                alignItems: "center",
                                alignContent: "center",
                                userSelect: "none",
                                position: "sticky",
                                left: "0",
                                zIndex: "9",
                                backgroundColor: spreadsheetTheme.headerBackground,
                                letterSpacing: "-0.015em"
                            } : {}),
                        },
                        [`${columnKey}${rowIndex}-inner-container`]: {
                            height: "100%",
                            width: "inherit",
                            margin: "0",
                            padding: "0",
                            position: "absolute",
                        },
                        [`${columnKey}${rowIndex}-content-container`]: {
                            display: "flex",
                            justifyContent: "center",
                            justifyItems: "center",
                            alignContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            fontSize: "0.875rem",
                            margin: "auto",
                            color: spreadsheetTheme.toolbarForeground,
                            fontWeight: "400",
                            letterSpacing: "-0.025em",
                            height: "100%",
                            // truncate cell content
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        },
                        [`${columnKey}${rowIndex}-border-container`]: {
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            width: "100%",
                            height: "100%",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            whiteSpace: "ellipsis",
                        },
                        [`${columnKey}${rowIndex}-content-wrapper-container`]: {
                            position: "relative",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: "flex",
                            width: "100%",
                            height: "100%",
                            padding: "0px 3px",
                            // For first column containing the row number.
                            ...(isFirstCellOfRow ? {
                                display: "flex",
                                justifyContent: "center",
                                justifyItems: "center",
                                alignContent: "center",
                                alignItems: "center",
                            } : {}),
                        },
                    }
                }
                return {
                    [`${columnKey}${rowIndex}`]: {
                        display: "flex",
                        borderTop: "unset",
                        borderRight: "1px solid #e5e7eb",
                        borderBottom: "1px solid #e5e7eb",
                        borderLeft: "unset",
                        width: isFirstCellOfRow ? `${calculateWidthOfFirstColumn(rawRowData.length)}px` : `${calculateWidthOfColumn(columnKey, headerStyles)}px`,
                        height: `${calculateHeightOfRow(rowIndex, rowStyles)}px`,
                        ...(isFirstCellOfRow ? {
                            textAlign: "center",
                            justifyItems: "center",
                            justifyContent: "center",
                            alignItems: "center",
                            alignContent: "center",
                            userSelect: "none",
                            position: "sticky",
                            left: "0",
                            zIndex: "9",
                            backgroundColor: spreadsheetTheme.headerBackground,
                            letterSpacing: "-0.015em"
                        } : {}),
                    },
                    [`${columnKey}${rowIndex}-inner-container`]: {
                        height: "100%",
                        width: "inherit",
                        margin: "0",
                        padding: "0",
                        position: "absolute",
                        borderWidth: "0px",
                        borderColor: "transparent",
                        backgroundColor: getCellStyle(rowIndex, columnKey, cellStyles)?.backgroundColor,
                    },
                    [`${columnKey}${rowIndex}-border-container`]: {
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: "100%",
                        height: "100%",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "ellipsis",
                        borderTop: getCellStyle(rowIndex, columnKey, cellStyles)?.borderTop,
                        borderRight: getCellStyle(rowIndex, columnKey, cellStyles)?.borderRight,
                        borderBottom: getCellStyle(rowIndex, columnKey, cellStyles)?.borderBottom,
                        borderLeft: getCellStyle(rowIndex, columnKey, cellStyles)?.borderLeft,
                    },
                    [`${columnKey}${rowIndex}-content-wrapper-container`]: {
                        position: "relative",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: "flex",
                        width: "100%",
                        height: "100%",
                        // styles from source file
                        ...getCellStyleOfCellContent(rowIndex, columnKey, cellStyles, cssPropsToIgnoreInCellContent),
                        // For first column containing the row number.
                        ...(isFirstCellOfRow ? {
                            display: "flex",
                            justifyContent: "center",
                            justifyItems: "center",
                            alignContent: "center",
                            alignItems: "center",
                        } : {}),
                    },
                    [`${columnKey}${rowIndex}-content-container`]: {
                        // truncate cell content
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        ...(isFirstCellOfRow ? {
                            display: "flex",
                            justifyContent: "center",
                            justifyItems: "center",
                            alignContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            fontSize: "0.875rem",
                            margin: "auto",
                            color: spreadsheetTheme.toolbarForeground,
                            fontWeight: "400",
                            letterSpacing: "-0.025em",
                            height: "100%",
                        } : {}),
                    },
                }
            })
                // @ts-ignore
                .reduce((acc, currentKey) => {
                    return { ...acc, ...currentKey };
                }, {}) as Record<string, Partial<CSSProperties>>;

            if (
                selectedWorksheetName.length === 0 ||
                !mergedGroupOfSelectedWorksheet ||
                !mergedGroupOfSelectedWorksheet.mergedRanges ||
                mergedGroupOfSelectedWorksheet.sheetName !== selectedWorksheetName ||
                mergedGroupOfSelectedWorksheet.mergedRanges.length === 0
            ) {
                // @ts-ignore
                return {
                    ...rawRow,
                    ...stylesOfCells,
                }
            }

            return {
                ...rawRow,
                ...stylesOfCells,
            } as Row
        }
        setRowData(rawRowData.map(applyStylesToCells));
    }, [rawRowData, rowStyles, headerStyles, cellStyles, selectedWorksheetName, mergedGroupOfSelectedWorksheet]);

    const getMetaDataOfSelectedCell = (): CellMetaData => {
        if (!selectedCell) return {};
        if (!selectedSheetJsWorksheet) {
            throw new Error("No worksheet found. No metadata will be fetched.");
        }
        return selectedSheetJsWorksheet[`${selectedCell.column}${selectedCell.row}`] as CellMetaData;
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
        mergedGroupOfSelectedWorksheet,
        getMetaDataOfSelectedCell,
        selectedRange,
        setSelectedRange,
    }
}
