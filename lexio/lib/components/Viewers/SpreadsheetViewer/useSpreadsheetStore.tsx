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
    calculateHeightOfRow,
    calculateWidthOfColumn,
    calculateWidthOfFirstColumn,
    CellContent,
    convertArgbToHex,
    excelAlignmentToCss,
    excelBorderToCss,
    extractCellComponent,
    generateSpreadsheetColumns,
    isCellInRange,
    ptFontSizeToPixel,
    ptToPixel,
    RawRow,
    Row,
    RowList,
    sortSpreadsheetColumnsComparator, TABLE_HEAD_ROW_HEIGHT,
    validateExcelRange,
} from "./utils.ts";
import {
    ParsingOptions,
    read,
    Sheet2JSONOpts,
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
    const [mergedGroupOfSelectedWorksheet, setMergedGroupOfSelectedWorksheet] = useState<MergeGroup | undefined>(undefined);
    // Important: used exclusively to load styles and not data !
    const [excelJsWorkbook, setExcelJsWorkbook] = useState<ExcelJsWorkbook | undefined>(undefined);

    useEffect(() => {
        const getExcelWorkbook = async (arrayBuffer: ArrayBuffer): Promise<SheetJsWorkbook> => {
            const readParsingOptions: ParsingOptions = {
                type: "file",
                // cellFormula: true,
                // cellHTML: true,
                cellNF: true,
                cellText: true,
                // bookFiles: false,
                sheetStubs: true,
                nodim: false,
                // PRN: false,
            }

            const workbook = read(arrayBuffer, readParsingOptions);

            // Important: used exclusively to load styles and not data !
            const excelJsWorkbook = new ExcelJsWorkbook();
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
        const mergeGroup: MergeGroup = {
            sheetName: selectedWorksheetName,
            mergedRanges,
        }
        setMergedGroupOfSelectedWorksheet(mergeGroup);
    }, [selectedSheetJsWorksheet, selectedWorksheetName]);

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
        mergedGroupOfSelectedWorksheet,
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
        mergedGroupOfSelectedWorksheet,
    } = useSpreadsheetStore(input.fileBufferArray, input.defaultSelectedSheet);

    const [columns, setColumns] = useState<ColumnDef<Row, CellContent>[]>([]);

    const [rawRowData, setRawRowData] = useState<RawRow[]>([]);

    const [rowData, setRowData] = useState<Row[]>([]);

    const [cellStyles, setCellStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    const [rowStyles, setRowStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    const [headerStyles, setHeaderStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    const [selectedRange, setSelectedRange] = useState<Range | undefined>(undefined);

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
            console.warn("No worksheet found.");
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

        const rows: Row[] = utils.sheet_to_json(selectedSheetJsWorksheet, sheetToJsonOptions);
        
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
                        [column]: null, // Empty cell. This can be an empty string, null or undefined
                    }
                }, {}),
            }
        })

        setColumns(
            [
                // Important: rowNo added to ease row identification. This column should always be first in the list.
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

        if (!excelJsSelectedWorksheet) {
            console.warn("No excelJs worksheet found. No styles will be applied on the active worksheet.");
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
    }, [excelJsWorkbook, isLoading, selectedWorksheetName]);

    // Computes and apply rowStyles, cellStyles and headerStyles to rows, cells and inner container of cells in rowData
    useEffect(() => {
        if (rawRowData.length === 0) return;
        if (!headerStyles || !rowStyles || !cellStyles) return;

        const getCellStyle = (row: number, column: string): CSSProperties => {
            if (!row || !column) return {};
            return cellStyles[`${column}${row}`];
        }

        const cssPropsToIgnoreInCellContent: (keyof CSSProperties)[] = [
            "borderTop",
            "borderRight",
            "borderBottom",
            "borderLeft",
        ];

        const getCellStyleOfCellContent = (row: number, column: string): CSSProperties => {
            const styles = getCellStyle(row, column);
            if (!styles) return {};
            const allStyleEntries = Object.entries(styles);
            const styleEntriesWithoutBorders = allStyleEntries.filter(([key]) =>
                !cssPropsToIgnoreInCellContent.includes(key as (keyof CSSProperties))
            );
            return Object.fromEntries(styleEntriesWithoutBorders) as CSSProperties;
        }

        const applyStylesToCells = (rawRow: RawRow, rowIndex: number): Row => {
            // Basic styles
            const cellStyles = Object.entries(rawRow).map((entry) => {
                const [columnKey] = entry;
                const isFirstCellOfRow = columnKey === "rowNo";
                // const [lastCellKeyOfRow] = Object.entries(rawRow)[Object.entries(rawRow).length - 1]
                // const isLastCellOfRow = lastCellKeyOfRow === columnKey;

                // Styles for cells in header row
                if (rowIndex === 0) {
                    return {
                        [`${columnKey}${rowIndex}`]: {
                            borderTop: "unset",
                            borderRight: "1px solid #e5e7eb",
                            borderBottom: "1px solid #e5e7eb",
                            borderLeft: "unset",
                            margin: "0",
                            backgroundColor: "rgb(245, 245, 245)",
                            // position: "sticky",
                            // left: "0",
                            // top: "-1px",
                            // zIndex: "10",
                            userSelect: "none",
                            width: isFirstCellOfRow ? `${calculateWidthOfFirstColumn(rawRowData.length)}px` : `${calculateWidthOfColumn(columnKey, headerStyles)}px`,
                            height: `${TABLE_HEAD_ROW_HEIGHT}px`,
                        },
                        [`${columnKey}${rowIndex}-inner-container`]: {
                            height: "100%",
                            width: "inherit",
                            margin: "0",
                            padding: "0",
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
                            color: "rgb(82, 82, 82)",
                            fontWeight: "400",
                            letterSpacing: "-0.025em",
                            height: "100%",
                            // truncate cell content
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        },
                        [`${columnKey}${rowIndex}-border-container`]: {
                            height: "100%",
                        },
                        [`${columnKey}${rowIndex}-content-wrapper-container`]: {
                            height: "100%",
                        },
                    }
                }
                return {
                    [`${columnKey}${rowIndex}`]: {
                        display: "flex",
                        borderTop: "unset",
                        borderRight: "1px solid #e5e7eb",
                        borderLeft: "unset",
                        width: isFirstCellOfRow ? `${calculateWidthOfFirstColumn(rawRowData.length)}px` : `${calculateWidthOfColumn(columnKey, headerStyles)}px`,
                        height: `${calculateHeightOfRow(rowIndex, rowStyles)}px`,
                    },
                    [`${columnKey}${rowIndex}-inner-container`]: {
                        height: "100%",
                        width: "inherit",
                        margin: "0",
                        padding: "0",
                        position: "absolute",
                        borderWidth: "2px",
                        borderColor: "transparent",
                        backgroundColor: getCellStyle(rowIndex, columnKey)?.backgroundColor,
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
                        borderTop: getCellStyle(rowIndex, columnKey)?.borderTop,
                        borderRight: getCellStyle(rowIndex, columnKey)?.borderRight,
                        borderBottom: getCellStyle(rowIndex, columnKey)?.borderBottom,
                        borderLeft: getCellStyle(rowIndex, columnKey)?.borderLeft,
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
                        ...getCellStyleOfCellContent(rowIndex, columnKey),
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
                        height: "100%",
                        // truncate cell content
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    },
                }
            })
                // @ts-ignore
                .reduce((acc, currentKey) => {
                return { ...acc, ...currentKey };
            }, {});

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
                    ...cellStyles,
                }
            }

            // Cell merge
            const cellStylesWithCellMerges = Object.entries(cellStyles).map((cellStyleEntry) => {
                const [cellAddress, basicStyles] = cellStyleEntry;
                if (
                    cellAddress.includes("-content-container") ||
                    cellAddress.includes("-content-wrapper-container")
                ) {
                    return {
                        [cellAddress]: {
                            ...basicStyles as Partial<CSSProperties>,
                        }
                    }
                }
                if (cellAddress.includes("-inner-container")) {
                    return {
                        [cellAddress]: {
                            ...basicStyles as Partial<CSSProperties>,
                            // width: "",
                            // height: "",
                            // visibility: "hidden",
                            // borderBottom: "",
                            // borderLeft: ""
                        }
                    }
                }
                return {
                    [cellAddress]: {
                        ...basicStyles as Partial<CSSProperties>,
                        // width: "",
                        // height: "",
                        // visibility: "hidden",
                    },
                }
            }).reduce((acc, currentKey) => {
                return { ...acc, ...currentKey };
            }, {});

            return {
                ...rawRow,
                ...cellStylesWithCellMerges,
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

// export const mergeCells = (
//     merges: MergedRange[],
//     cellRefs: Record<string, HTMLTableCellElement>,
//     onCellMergeDone?: (() => void) | undefined,
// ) => {
//     if (merges.length === 0) return;
//
//     console.log("merges: ", merges);
//     const rowsModified: number[] = [];
//     const cellsModified: string[] = [];
//
//     merges.forEach((merge) => {
//         const firstCellOfRange = `${merge.start.column}${merge.start.row}`;
//         const lastCellOfRange = `${merge.end.column}${merge.end.row}`;
//
//         if (!firstCellOfRange || !lastCellOfRange) {
//             console.warn("Invalid merge range. No cells found.");
//             return;
//         }
//
//         Object.entries(cellRefs).forEach(([cellAddress, cellRef]) => {
//             if (!cellRef) return;
//             const cellComponent = extractCellComponent(cellAddress);
//             if (!cellComponent) return;
//             if (merge.start.row !== cellComponent.row || merge.end.row !== cellComponent.row) return;
//
//             const isInRange = isCellInRange(cellComponent?.row, cellComponent.column, [firstCellOfRange, lastCellOfRange]);
//
//             if (!isInRange) return;
//
//             if (cellAddress === firstCellOfRange) {
//                 rowsModified.push(cellComponent.row)
//                 cellsModified.push(cellAddress);
//                 const nextCell = cellRefs[`${utils.encode_col(utils.decode_col(cellComponent.column) + 1)}${cellComponent.row}`];
//
//                 console.log("Current cell: ", cellAddress);
//
//                 if (!nextCell) {
//                     console.log("Next cell not found.");
//                     return;
//                 }
//                 cellRef.style.setProperty(
//                     "width",
//                     `${Number(cellRef.style.width.split("px")[0]) + Number(nextCell.style.width.split("px")[0])}px`,
//                     "important",
//                 );
//
//                 nextCell.style.setProperty("display", "none", "important");
//             }
//         })
//     });
//
//     console.log("rowsModified: ", rowsModified);
//     console.log("cellsModified: ", cellsModified);
//
//     if (onCellMergeDone) {
//         if (rowsModified.length > 0 || cellsModified.length > 0) {
//             onCellMergeDone();
//         }
//     }
// };

export const mergeCells = (
    merges: MergedRange[],
    cellRefs: Record<string, HTMLTableCellElement>,
    onCellMergeDone?: (() => void) | undefined,
) => {
    if (merges.length === 0 || Object.keys(cellRefs).length === 0) {
        onCellMergeDone?.();
        return;
    }

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
                        // cellToMerge.onclick = startCell.onclick;
                    }
                }
                totalHeight += parseFloat(cellToMerge.style.height) || cellToMerge.offsetHeight;
                // cellToMerge.style.display = "none";
            }
        }

        // startCell.style.width = `${totalWidth}px`;

        startCell.style.setProperty("border", "none", "important");
        const innerContainerOfStartCell = startCell.children[0] as HTMLDivElement | null;
        if (!innerContainerOfStartCell) return;
        innerContainerOfStartCell.style.height = `${totalHeight}px`;
        innerContainerOfStartCell.style.width = `${totalWidth}px`;
        innerContainerOfStartCell.style.borderBottom = "1px solid #e5e7eb";
        innerContainerOfStartCell.style.borderRight = "1px solid #e5e7eb";
        // startCell.style.height = `${totalHeight}px`;
    });

    onCellMergeDone?.();
};
