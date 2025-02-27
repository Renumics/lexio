import {CSSProperties, FC, useEffect, useRef, useState} from "react";
import useSWR from "swr";
import {useSpreadsheetStore, Range} from "./useSpreadsheetStore";
import {SpreadsheetTable} from "./SpreadsheetTable.tsx";
import {Cell, ColumnDef} from "@tanstack/react-table";
import {
    CellContent, convertArgbToHex, excelAlignmentToCss, excelBorderToCss,
    extractCellComponent,
    getRowEntryWitMostColumns, ptFontSizeToPixel, ptToPixel,
    resolveCellFormat,
    Row,
    RowList,
    validateExcelRange
} from "./utils";
import {Cell as WorksheetCell, Row as WorksheetRow, Workbook, FillPattern} from "exceljs";
import {SpreadsheetSelection} from "./SpreadsheetSelection";

type Props = {
    fileName?: string | undefined;
    fileBufferArray: ArrayBuffer;
    defaultSelectedSheet?: string | undefined;
    rangesToHighlight?: string[] | undefined;
}
const SpreadsheetViewer: FC<Props> = (props) => {
    const { fileBufferArray, defaultSelectedSheet, rangesToHighlight } = props;

    const {
        getExcelWorkbook,
        selectedSpreadsheet,
        rangeToSelect,
        setRangeToSelect,
        selectedCell,
        setSelectedCell,
        setSelectedSpreadsheet,
        spreadsheets,
    } = useSpreadsheetStore();

    const { data: workbook, error, isLoading } = useSWR(
        "spreadsheet",
        () => getExcelWorkbook(fileBufferArray, defaultSelectedSheet)
    );

    const [columns, setColumns] = useState<ColumnDef<Row, CellContent>[]>([]);

    const [rowData, setRowData] = useState<RowList>([]);

    const tableContainerRef = useRef<HTMLDivElement | null>(null);

    const [cellStyles, setCellStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    const [rowStyles, setRowStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    const [headerStyles, setHeaderStyles] = useState<Record<string, CSSProperties> | undefined>(undefined);

    useEffect(() => {
        if (!rangesToHighlight) return;
        let rangesToSet: Range[] = [];
        rangesToHighlight.forEach((range: string) => {
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
    }, [rangesToHighlight]);

    useEffect(() => {
        if (!workbook) return;
        const worksheet = (workbook as Workbook).getWorksheet(selectedSpreadsheet);
        if (!worksheet) {
            console.error("No worksheet found.");
            return;
        }

        const resetStyles = () => {
            setRowStyles(undefined);
            setCellStyles(undefined);
            setHeaderStyles(undefined);
        }

        resetStyles();

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

        rows = rows.map((r) => {
            if (r !== null) return r;
            return Object.fromEntries(rowWithMostColumns.map(([key]) => [key, ""]));
        })

        setRowData(rows.map((row, index) => ({ rowNo: `${index}`, ...row })));

        setColumns(
            [
                { header: "", accessorKey: "rowNo" },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ...rowWithMostColumns.map(([key, _]) => ({
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

    // Removes the overflow property from the auto added div wrapper.
    // The overflow css property prevents the table head to the sticky at the top.
    useEffect(() => {
        if (!tableContainerRef.current) return;
        const firstChild = tableContainerRef.current.children[0];
        if (!firstChild) return;
        firstChild.className = firstChild.className.split(" ").filter((cl) => !cl.includes("overflow")).join(" ");
    }, [tableContainerRef, rowData]);

    const handleCellClick = (cell: Cell<Record<string, CellContent>, CellContent>) => {
        setSelectedCell({ row: cell.row.index + 1, column: cell.column.id });
    }

    if (isLoading) return <div>Loading excel file...</div>;

    if (error) {
        console.error(error);
        // return <div>An error has occurred while loading the Excel file...</div>
    }

    return (
        <div className="whitespace-nowrap h-full overflow-auto">
            <div ref={tableContainerRef}>
                <SpreadsheetTable
                    columns={columns}
                    data={rowData.filter(r => r)}
                    cellsStyles={cellStyles}
                    rowStyles={rowStyles}
                    headerStyles={headerStyles}
                    selectedCell={selectedCell}
                    setSelectedCell={setSelectedCell}
                    rangesToSelect={rangeToSelect}
                    handleCellClick={handleCellClick}
                />
            </div>
            <div className="whitespace-nowrap rounded-lg mt-0.5 p-1 z-[10] bottom-0">
                <SpreadsheetSelection
                    spreadsheets={spreadsheets}
                    selectedSpreadsheet={selectedSpreadsheet}
                    setSelectedSpreadsheet={setSelectedSpreadsheet}
                />
            </div>
        </div>
    );
};
SpreadsheetViewer.displayName = "SpreadsheetViewer";

export {SpreadsheetViewer};
