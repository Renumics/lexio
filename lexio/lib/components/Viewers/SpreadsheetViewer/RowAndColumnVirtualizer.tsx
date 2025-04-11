import {CSSProperties, forwardRef, Ref, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react"
import * as ReactTable from "@tanstack/react-table";
import * as ReactVirtual from "@tanstack/react-virtual";
import {mergeCells, MergeGroup, Range, SelectedCell} from "./useSpreadsheetStore";
import {cn} from "./ui/utils.ts";
import {
    calculateWidthOfColumn,
    calculateWidthOfFirstColumn,
    CellContent,
    DEFAULT_COLUMN_WIDTH,
    highlightCells,
    isCellInRange,
    sortSpreadsheetRange,
    Z_INDEX_OF_STICKY_HEADER_ROW
} from "./utils.ts";
import type * as SheetJs from "xlsx";

const applyMergesToCells = (
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

type CellAndCellContainerRefType = {
    cellRefs: Record<string, HTMLTableCellElement | null>,
    cellInnerContainerRefs: Record<string, HTMLDivElement | null>,
}

type Props<TData, TValue> = {
    columns: ReactTable.ColumnDef<TData, TValue>[];
    data: TData[];
    showStyles: boolean;
    headerStyles?: Record<string, CSSProperties> | undefined;
    rowStyles?: Record<number, CSSProperties> | undefined;
    cellsStyles?: Record<string, CSSProperties> | undefined
    selectedCell?: SelectedCell | undefined;
    setSelectedCell: (cell: SelectedCell | undefined) => void;
    rangesToSelect: Range[];
    // The height of the parent in case the parent doesn't have a fix size (value in pixel).
    parentContainerHeight?: number | undefined;
    mergedGroupOfSelectedWorksheet: MergeGroup | undefined;
    selectedSheetName: string;
    setSelectedRange: (range?: Range | undefined) => void;
    tanstackTable: typeof ReactTable;
    tanstackVirtual: typeof ReactVirtual;
    sheetJs: typeof SheetJs;
}

export const TableContainer = <TData, TValue>(
    {
        data,
        columns,
        parentContainerHeight,
        mergedGroupOfSelectedWorksheet,
        selectedSheetName,
        setSelectedRange,
        selectedCell,
        setSelectedCell,
        headerStyles,
        rangesToSelect: rangesToSelectProp,
        tanstackTable,
        tanstackVirtual,
        sheetJs,
    }: Props<TData, TValue>) => {

    const { utils } = sheetJs;

    const rangesToSelect = useMemo(() => {
        if (rangesToSelectProp.length === 0 || rangesToSelectProp.length === 1) {
            return [["A0", "A0"]] as Range[];
        }
        return rangesToSelectProp;
    }, [rangesToSelectProp]);

    const tableId = useMemo(() => {
        return `${selectedSheetName.replace(" ", "")}${(new Date()).getTime()}`;
    }, [selectedSheetName]);

    // Initialize the table instance
    const table = tanstackTable.useReactTable<TData>({
        data,
        columns,
        enableRowSelection: true,
        getCoreRowModel: ReactTable.getCoreRowModel(),
    });

    const cellAndInnerCellContainerRefs = useRef<CellAndCellContainerRefType | null>(null);

    const [selectedHeaderCells, setSelectedHeaderCells] = useState<string[]>([]);

    const [selectedHeaderRowCells, setSelectedHeaderRowCells] = useState<number[]>([]);

    // Multiple cells selection
    const [mouseSelectedRange, setMouseSelectedRange] = useState<Range | undefined>(undefined);
    const [isMouseDownForRangeSelection, setIsMouseDownForRangeSelection] = useState<boolean>(false);

    const handleMouseDown = (cellAddress: string) => {
        setSelectedCell(undefined);
        setIsMouseDownForRangeSelection(true);
        setMouseSelectedRange([cellAddress, cellAddress]);
    }
    const handleMouseEnter = (cellAddress: string) => {
        if (!mouseSelectedRange || !isMouseDownForRangeSelection) return;
        const newRange = [mouseSelectedRange[0], cellAddress];
        const sortedRange = sortSpreadsheetRange(newRange) as Range;
        setMouseSelectedRange(sortedRange);
    }
    const handleMouseUp = () => {
        setIsMouseDownForRangeSelection(false);
    }

    useEffect(() => {
        setSelectedRange(mouseSelectedRange);
    }, [mouseSelectedRange, selectedSheetName, setSelectedCell, setSelectedRange, table, tableId]);

    // Highlight
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!cellAndInnerCellContainerRefs.current) return;
            highlightCells(
                // @ts-ignore
                table.getRowModel().rows,
                rangesToSelect,
                cellAndInnerCellContainerRefs.current.cellRefs as Record<string, (HTMLTableCellElement | null)>,
            );
        }, 1000);
        return () => {
            clearTimeout(timeout);
        }
    }, [rangesToSelect, table]);

    useEffect(() => {
        if (!selectedCell) return;
        const startColumn = utils.encode_col(selectedHeaderCells.map((header) => utils.decode_col(header)).sort((a, b) => a - b)[0]);
        const startRow = selectedHeaderRowCells.sort((a, b) => a - b)[0];
        const startCell = `${startColumn}${startRow}`

        const endColumn = utils.encode_col(selectedHeaderCells.map((header) => utils.decode_col(header)).sort((a, b) => b - a)[0]);
        const endRow = selectedHeaderRowCells.sort((a, b) => b - a)[0];
        const endCell = `${endColumn}${endRow}`

        const rangeToSelect: Range | undefined = startCell && endCell ? [startCell, endCell] : undefined;

        setSelectedRange(rangeToSelect);
    }, [selectedCell, selectedHeaderCells, selectedHeaderRowCells, setSelectedRange]);

    const tableContainerRef = useRef<HTMLDivElement | null>(null);

    const columnVirtualizer = tanstackVirtual.useVirtualizer<HTMLDivElement, HTMLTableCellElement>({
        count: columns.length,
        estimateSize: () => DEFAULT_COLUMN_WIDTH,
        getScrollElement: () => document.getElementById(selectedSheetName) as HTMLDivElement,
        horizontal: true,
        overscan: 5,
        onChange: () => {
            if (cellAndInnerCellContainerRefs.current) {
                applyMergesToCells(
                    mergedGroupOfSelectedWorksheet,
                    selectedSheetName,
                    cellAndInnerCellContainerRefs.current.cellRefs as Record<string, HTMLTableCellElement>,
                    sheetJs,
                );
            }

        },
    });

    const rowVirtualizer = tanstackVirtual.useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
        count: table.getRowCount(),
        estimateSize: () => 35,
        getScrollElement: () => document.getElementById(selectedSheetName) as HTMLDivElement,
        //measure dynamic row height, except in firefox because it measures table border height incorrectly
        measureElement:
            typeof window !== "undefined" &&
            navigator.userAgent.indexOf("Firefox") === -1
                ? element => element?.getBoundingClientRect().height
                : undefined,
        overscan: 5,
        onChange: () => {
            if (cellAndInnerCellContainerRefs.current) {
                applyMergesToCells(
                    mergedGroupOfSelectedWorksheet,
                    selectedSheetName,
                    cellAndInnerCellContainerRefs.current.cellRefs as Record<string, HTMLTableCellElement>,
                    sheetJs,
                );
            }
        },
    });

    // Apply merge styles to cells
    useEffect(() => {
        rowVirtualizer.scrollToIndex(0);
        columnVirtualizer.scrollToIndex(0);
        // Waits that all cells and cell inner container refs are set in cellAndInnerCellContainerRefs before applying merge
        const WAIT_TIME_FOR_CELL_REFS = 500;

        const timeout = setTimeout(() => {
            if (cellAndInnerCellContainerRefs.current) {
                applyMergesToCells(
                    mergedGroupOfSelectedWorksheet,
                    selectedSheetName,
                    cellAndInnerCellContainerRefs.current.cellRefs as Record<string, HTMLTableCellElement>,
                    sheetJs,
                );
            }
        }, WAIT_TIME_FOR_CELL_REFS);

        return () => {
            cellAndInnerCellContainerRefs.current = null;
            clearTimeout(timeout);
        };
    }, [mergedGroupOfSelectedWorksheet, selectedSheetName]);

    // Set selected header and header row cells
    useEffect(() => {
         if (!selectedCell || !mergedGroupOfSelectedWorksheet) return;
        const headerCells: string[] = [];
        const headerRowCells: number[] = [];
        mergedGroupOfSelectedWorksheet.mergedRanges.forEach((range) => {
               if (!selectedCell) return;
               const startColumn = utils.decode_col(range.start.column);
               const endColumn = utils.decode_col(range.end.column);

               const startRow = range.start.row;
               const endRow = range.end.row;

               if (isCellInRange(selectedCell.row, selectedCell.column, [`${range.start.column}${range.start.row}`,`${range.end.column}${range.end.row}`])) {
                   // Columns
                   for (let i = startColumn; i < endColumn + 1; i++) {
                       headerCells.push(utils.encode_col(i));
                   }

                   // Rows
                   for (let i = startRow; i < endRow + 1; i++) {
                       headerRowCells.push(i);
                   }
               }
        });
        if (headerCells.length === 0) {
            headerCells.push(selectedCell.column)
        }
        if (headerRowCells.length === 0) {
            headerRowCells.push(selectedCell.row)
        }
        setSelectedHeaderCells(headerCells);
        setSelectedHeaderRowCells(headerRowCells);

        return () => {
            setSelectedHeaderCells([]);
            setSelectedHeaderRowCells([]);
        };
    }, [mergedGroupOfSelectedWorksheet, selectedCell]);

    const virtualColumns = columnVirtualizer.getVirtualItems()

    let virtualPaddingLeft: number | undefined
    let virtualPaddingRight: number | undefined

    if (columnVirtualizer && virtualColumns?.length) {
        virtualPaddingLeft = virtualColumns[0]?.start ?? 0
        virtualPaddingRight =
            columnVirtualizer.getTotalSize() -
            (virtualColumns[virtualColumns.length - 1]?.end ?? 0)
    }

    // Event Handlers
    const handleCellClick = (cell: ReactTable.Cell<TData, TValue>) => {
        setSelectedCell({ row: cell.row.index, column: cell.column.id });
    }

    return (
        <div
            className="container"
            ref={tableContainerRef}
            id={selectedSheetName}
            style={{
                overflow: "auto",
                position: "relative",
                height: parentContainerHeight,
                whiteSpace: "nowrap",
            }}
        >
            <table
                key={tableId}
                id={tableId}
                style={{
                    display: "grid",
                    borderCollapse: "collapse",
                    borderSpacing: 0,
                    border: "none",
                }}
            >
                <TableHead
                    columnVirtualizer={columnVirtualizer}
                    // @ts-ignore
                    table={table}
                    rowCount={rowVirtualizer.getVirtualItems().length}
                    selectedHeaderCells={selectedHeaderCells}
                    virtualPaddingLeft={virtualPaddingLeft}
                    virtualPaddingRight={virtualPaddingRight}
                    headerStyles={headerStyles}
                />
                <TableBody
                    ref={cellAndInnerCellContainerRefs}
                    // @ts-ignore
                    rowVirtualizer={rowVirtualizer}
                    columnVirtualizer={columnVirtualizer}
                    // @ts-ignore
                    table={table}
                    selectedCell={selectedCell}
                    selectedHeaderCells={selectedHeaderCells}
                    selectedHeaderRowCells={selectedHeaderRowCells}
                    virtualPaddingLeft={virtualPaddingLeft}
                    virtualPaddingRight={virtualPaddingRight}
                    selectedSheetName={selectedSheetName}
                    // @ts-ignore
                    handleCellSelection={handleCellClick}
                    handleMouseUp={handleMouseUp}
                    handleMouseDown={handleMouseDown}
                    handleMouseEnter={handleMouseEnter}
                />
            </table>
        </div>
    )
}

type TableHeadProps = {
    columnVirtualizer: ReactVirtual.Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    table: ReactTable.Table<unknown>;
    selectedCell?: SelectedCell | undefined;
    selectedHeaderCells: string[];
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
}

const TableHead = (
    {
        columnVirtualizer,
        table,
        selectedHeaderCells,
        virtualPaddingLeft,
        virtualPaddingRight,
        headerStyles,
    }: TableHeadProps) => {

    return (
        <thead
            style={{
                display: "grid",
                position: "sticky",
                top: 0,
                zIndex: Z_INDEX_OF_STICKY_HEADER_ROW,
                visibility: "hidden",
            }}
            className={"bg-neutral-100"}
        >
        {table.getHeaderGroups().map(headerGroup => (
            <TableHeadRow
                key={headerGroup.id}
                rowCount={table.getRowCount()}
                headerGroup={headerGroup}
                // selectedCell={selectedCell}
                selectedHeaderCells={selectedHeaderCells}
                columnVirtualizer={columnVirtualizer}
                virtualPaddingLeft={virtualPaddingLeft}
                virtualPaddingRight={virtualPaddingRight}
                headerStyles={headerStyles}
            />
        ))}
        </thead>
    )
}

type TableHeadRowProps<TData> = {
    columnVirtualizer: ReactVirtual.Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    headerGroup: ReactTable.HeaderGroup<TData>;
    rowCount: number;
    selectedHeaderCells: string[];
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
}
const TableHeadRow = <T, >(
    {
        rowCount,
        columnVirtualizer,
        headerGroup,
        selectedHeaderCells,
        virtualPaddingLeft,
        virtualPaddingRight,
        headerStyles,
    }: TableHeadRowProps<T>) => {
    const virtualColumns = columnVirtualizer.getVirtualItems();

    return (
        <tr key={headerGroup.id} style={{display: "flex", width: "100%", height: 0 }}>
            {virtualPaddingLeft ? (
                //fake empty column to the left for virtualization scroll padding
                <th style={{display: "flex", width: virtualPaddingLeft}}/>
            ) : null}
            {virtualColumns.map((virtualColumn, colIndex, array) => {
                const header = headerGroup.headers[virtualColumn.index];
                // if (header.id === "rowNo") return null;
                return (
                    <TableHeadCell
                        key={header.id}
                        // @ts-ignore
                        header={header}
                        rowCount={rowCount}
                        isSelected={selectedHeaderCells.includes(header.id) && colIndex !== 0}
                        isFirst={colIndex === 0}
                        isLast={colIndex === array.length - 1}
                        headerStyles={headerStyles}
                    />
                )
            })}
            {virtualPaddingRight ? (
                //fake empty column to the right for virtualization scroll padding
                <th style={{display: "flex", width: virtualPaddingRight}}/>
            ) : null}
        </tr>
    )
}

type TableHeadCellProps<TData, TValue> = {
    header: ReactTable.Header<TData, TValue>;
    isSelected: boolean;
    isFirst: boolean;
    isLast: boolean;
    rowCount: number;
    headerStyles?: Record<string, CSSProperties> | undefined;
}
const TableHeadCell = <T, D>(props: TableHeadCellProps<T, D>) => {
    const {
        header,
        isFirst,
        isLast,
        rowCount,
        isSelected,
    } = props;

    const headerStyles = props?.headerStyles ?? {};

    const computeWidthOfHeadCell = (): number => {
        if (isFirst) return calculateWidthOfFirstColumn(rowCount);
        return calculateWidthOfColumn(header.column.id, headerStyles);
    }

    return (
        <th
            key={header.id}
            style={{
                display: "flex",
                justifyContent: "center",
                justifyItems: "center",
                alignContent: "center",
                alignItems: "center",
                width: computeWidthOfHeadCell(),
                borderTop: "unset",
                borderRight: isLast ? "1px solid #e5e7eb" : "unset",
                borderLeft: isFirst ? "unset" : "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
            }}
            className={cn("py-2 w-full m-0 border-b border-r text-center bg-neutral-100 text-sm text-neutral-600 font-normal tracking-tight sticky left-0 top-[-1px] z-[10] select-none",
                `${isSelected ? "!font-bold !text-white !bg-blue-500 !border-blue-500 !border-solid !border-l !border-r !border-b-0 !border-t-0" : ""}`,
            )}
        >
            <div>
                {ReactTable.flexRender(header.column.columnDef.header, header.getContext())}
            </div>
        </th>
    )
}

type TableBodyProps<TData> = {
    rowVirtualizer: ReactVirtual.Virtualizer<HTMLDivElement, HTMLTableRowElement>;
    columnVirtualizer: ReactVirtual.Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    table: ReactTable.Table<TData>;
    selectedCell?: SelectedCell | undefined;
    selectedSheetName: string;
    selectedHeaderRowCells: number[];
    selectedHeaderCells: string[];
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    handleMouseDown: (cellAddress: string) => void;
    handleMouseEnter: (cellAddress: string) => void;
    handleCellSelection: (cell: ReactTable.Cell<TData, unknown>) => void;
    handleMouseUp: () => void;
}

const TableBody = forwardRef(<T, >(
    {
        rowVirtualizer,
        columnVirtualizer,
        table,
        selectedCell,
        selectedSheetName,
        selectedHeaderRowCells,
        selectedHeaderCells,
        virtualPaddingLeft,
        virtualPaddingRight,
        handleCellSelection,
        handleMouseUp,
        handleMouseDown,
        handleMouseEnter,
    }: TableBodyProps<T>, ref: Ref<CellAndCellContainerRefType> | undefined) => {
    const { rows } = table.getRowModel();

    const virtualRows = rowVirtualizer.getVirtualItems();

    const cellAndCellContainerRefsOfAllRows = useRef<CellAndCellContainerRefType>({
        cellRefs: {},
        cellInnerContainerRefs: {},
    });

    useImperativeHandle(ref, () => ({
        cellRefs: cellAndCellContainerRefsOfAllRows.current.cellRefs,
        cellInnerContainerRefs: cellAndCellContainerRefsOfAllRows.current.cellInnerContainerRefs,
    }));

    return (
        <tbody
            style={{
                display: "grid",
                height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
                position: "relative", //needed for absolute positioning of rows
            }}
        >
        {virtualRows.map(virtualRow => {
            const row = rows[virtualRow.index] as ReactTable.Row<unknown>
            return (
                <TableBodyRow
                    ref={(el) => {
                        if (!el) return;
                        cellAndCellContainerRefsOfAllRows.current = {
                            cellRefs: {
                               ...cellAndCellContainerRefsOfAllRows.current.cellRefs,
                                ...el.cellRefs,
                            },
                            cellInnerContainerRefs: {
                               ...cellAndCellContainerRefsOfAllRows.current.cellInnerContainerRefs,
                                ...el.cellInnerContainerRefs,
                            },
                        }
                    }}
                    columnVirtualizer={columnVirtualizer}
                    key={row.id}
                    // @ts-ignore
                    row={row}
                    // @ts-ignore
                    handleCellClick={handleCellSelection}
                    selectedCell={selectedCell}
                    selectedHeaderRowCells={selectedHeaderRowCells}
                    selectedHeaderCells={selectedHeaderCells}
                    rowVirtualizer={rowVirtualizer}
                    virtualPaddingLeft={virtualPaddingLeft}
                    virtualPaddingRight={virtualPaddingRight}
                    virtualRow={virtualRow}
                    selectedSheetName={selectedSheetName}
                    handleMouseUp={handleMouseUp}
                    handleMouseDown={handleMouseDown}
                    handleMouseEnter={handleMouseEnter}
                />
            )
        })}
        </tbody>
    )
})

type TableBodyRowProps<TData> = {
    rowVirtualizer: ReactVirtual.Virtualizer<HTMLDivElement, HTMLTableRowElement>;
    columnVirtualizer: ReactVirtual.Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    row: ReactTable.Row<TData>;
    selectedSheetName: string;
    selectedHeaderRowCells: number[];
    selectedHeaderCells: string[];
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    virtualRow: ReactVirtual.VirtualItem;
    handleMouseDown: (cellAddress: string) => void;
    handleMouseEnter: (cellAddress: string) => void;
    handleCellClick: (cell: ReactTable.Cell<TData, unknown>) => void;
    handleMouseUp: () => void;
}
// @ts-ignore
const TableBodyRow = forwardRef(<T,>(
    {
        rowVirtualizer,
        columnVirtualizer,
        row,
        selectedHeaderRowCells,
        selectedSheetName,
        selectedHeaderCells,
        virtualPaddingLeft,
        virtualPaddingRight,
        virtualRow,
        handleCellClick,
        handleMouseUp,
        handleMouseDown,
        handleMouseEnter,
    }: TableBodyRowProps<T>, ref: Ref<CellAndCellContainerRefType> | undefined) => {
    const visibleCells = row.getVisibleCells();

    const cellOfFirstColumn = visibleCells[0];

    const virtualColumns = columnVirtualizer.getVirtualItems();

    const isCellSelected = (cell: ReactTable.Cell<T, CellContent>, cellIndex: number): boolean => {
        return (
            selectedHeaderRowCells.includes(cell.row.index) &&
            selectedHeaderCells.includes(cell.column.id) &&
            cellIndex !== 0
        ) as boolean;
    }

    const cellAndCellContainerRefsOfRow = useRef<CellAndCellContainerRefType>({
        cellRefs: {},
        cellInnerContainerRefs: {},
    });

    useImperativeHandle(ref, () => ({
        cellRefs: cellAndCellContainerRefsOfRow.current.cellRefs,
        cellInnerContainerRefs: cellAndCellContainerRefsOfRow.current.cellInnerContainerRefs,
    }));

    return (
        <tr
            data-index={virtualRow.index} //needed for dynamic row height measurement
            ref={node => rowVirtualizer.measureElement(node)} //measure dynamic row height
            key={row.id}
            style={{
                display: "flex",
                position: "absolute",
                transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                width: "100%",
            }}
        >
            {virtualPaddingLeft ? (
                //fake empty column to the left for virtualization scroll padding
                <td style={{display: "flex", width: virtualPaddingLeft}}/>
            ) : null}
            <TableBodyCell
                // @ts-ignore
                cell={cellOfFirstColumn}
                key={cellOfFirstColumn.id}
                isFirst={true}
                isCellSelected={false}
                selectedSheetName={selectedSheetName}
                isFirstCellOfSelectedRow={(selectedHeaderRowCells.includes(cellOfFirstColumn.row.index)) ?? false}
                // @ts-ignore
                handleCellSelection={(cell) => handleCellClick(cell)}
            />
            {virtualColumns.map((vc, cellIndex) => {
                const cell = visibleCells[vc.index];
                if (cell.column.id === "rowNo") return null;
                return (
                    <TableBodyCell
                        ref={(el) => {
                            if (!el) return;
                            cellAndCellContainerRefsOfRow.current = {
                                cellRefs: {
                                    ...cellAndCellContainerRefsOfRow.current.cellRefs,
                                    ...el.cellRefs,
                                },
                                cellInnerContainerRefs: {
                                    ...cellAndCellContainerRefsOfRow.current.cellInnerContainerRefs,
                                    ...el.cellInnerContainerRefs,
                                }
                            }
                        }}
                        // @ts-ignore
                        cell={cell}
                        key={cell.id}
                        isFirst={false}
                        isCellSelected={isCellSelected(cell, cellIndex)}
                        isHeaderCellSelected={selectedHeaderCells.includes(cell.column.id) && row.index === 0}
                        isFirstCellOfSelectedRow={false}
                        selectedSheetName={selectedSheetName}
                        // @ts-ignore
                        handleCellSelection={(cell) => handleCellClick(cell)}
                        handleMouseUp={handleMouseUp}
                        handleMouseDown={handleMouseDown}
                        handleMouseEnter={handleMouseEnter}
                    />
                )
            })}
            {virtualPaddingRight ? (
                //fake empty column to the right for virtualization scroll padding
                <td style={{display: "flex", width: virtualPaddingRight}}/>
            ) : null}
        </tr>
    )
});

type TableBodyCellProps<TData, TValue> = {
    cell: ReactTable.Cell<TData, TValue>;
    isFirst: boolean;
    isFirstCellOfSelectedRow : boolean;
    isCellSelected: boolean;
    isHeaderCellSelected: boolean;
    selectedSheetName: string;
    handleMouseUp?: () => void;
    handleMouseDown?: ((cellAddress: string) => void) | undefined;
    handleMouseEnter?: ((cellAddress: string) => void) | undefined;
    handleCellSelection: (cell: ReactTable.Cell<TData, TValue>) => void;
}
const TableBodyCell = forwardRef(
    <T, V>(
        {
            cell,
            isFirst,
            isCellSelected,
            isHeaderCellSelected,
            isFirstCellOfSelectedRow,
            handleCellSelection,
            selectedSheetName,
            handleMouseUp,
            handleMouseDown,
            handleMouseEnter,
        }: TableBodyCellProps<T, V>,
        ref: Ref<CellAndCellContainerRefType> | undefined
    ) => {

    const cellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

    const cellInnerContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const cellId = `${cell.column.id}${cell.row.index}`;

    const cellInnerContainerId = `${cell.column.id}${cell.row.index}-inner-container`;

    const cellContentContainerId = `${cell.column.id}${cell.row.index}-content-container`;

    const cellContentWrapperContainerId = `${cell.column.id}${cell.row.index}-content-wrapper-container`;

    const cellBorderContainerId = `${cell.column.id}${cell.row.index}-border-container`;

    useImperativeHandle(ref, () => ({
        cellRefs: cellRefs.current,
        cellInnerContainerRefs: cellInnerContainerRefs.current,
    }));

    useEffect(() => {
        return () => {
            cellRefs.current = {};
            cellInnerContainerRefs.current = {};
        };
    }, []);

    const isCellClickable = !(isFirst || cell.row.index === 0);

    return (
        <td
            key={`${cell.id}-${selectedSheetName}`}
            ref={(el) => {
                if (el) {
                    cellRefs.current[cellId] = el;
                    return;
                }
                delete cellRefs.current[cellId];
            }}
            id={cellId}
            style={{
                // @ts-ignore
                ...(cell.row.original[cellId] ?? {}),
                ...(isFirstCellOfSelectedRow ? {
                    borderBottom: "none",
                } : {}),
            }}
            data-label={cell.column.columnDef.header}
            className={cn(
                `${isFirstCellOfSelectedRow ? "!bg-blue-500" : ""}`,
                `${isHeaderCellSelected ? "!bg-blue-500 !border-blue-500 !border-solid !border-l !border-r !border-b-0 !border-t-0" : ""}`,
            )}
            onClick={isCellClickable ? () => handleCellSelection(cell) : undefined}
            onMouseDown={handleMouseDown ? () => handleMouseDown(cellId) : undefined}
            onMouseEnter={handleMouseEnter ? () => handleMouseEnter(cellId) : undefined}
            // onMouseLeave={undefined}
            onMouseUp={handleMouseUp ? () => handleMouseUp() : undefined}
        >
            <div
                ref={(el) => {
                    if (el) {
                        cellInnerContainerRefs.current[cellInnerContainerId] = el;
                        return;
                    }
                    delete cellInnerContainerRefs.current[cellInnerContainerId];
                }}
                id={cellInnerContainerId}
                className={cn(
                    `${isCellSelected ? "border-[2px] !border-t-[2px] !border-b-[2px] !border-r-[2px] !border-l-[2px] !border-blue-500" : ""}`,
                )}
                onClick={isCellClickable ? () => handleCellSelection(cell) : undefined}
                style={{
                    // @ts-ignore
                    ...(cell.row.original[cellInnerContainerId] ?? {}),
                }}
            >
                <div
                    style={{
                        // @ts-ignore
                        ...(cell.row.original[cellBorderContainerId] ?? {}),
                    }}
                >
                    <div
                        style={{
                            // @ts-ignore
                            ...(cell.row.original[cellContentWrapperContainerId] ?? {}),
                        }}
                    >
                        <div
                            className={cn(
                                `${isHeaderCellSelected || isFirstCellOfSelectedRow ? "!font-bold !text-white" : ""}`,
                            )}
                            style={{
                                // @ts-ignore
                                ...(cell.row.original[cellContentContainerId] ?? {}),
                            }}
                        >
                            {ReactTable.flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                    </div>
                </div>
            {isCellSelected ?
                <div
                    className="bg-blue-500 text-blue-500 size-2 border border-white border-r-0 border-b-0 drop-shadow-lg rounded-[2px] absolute bottom-[-1px] right-[-1px] z-[5]"
                ></div> : null
            }
            </div>
        </td>
    )
});
