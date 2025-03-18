import {
    CSSProperties, FC, forwardRef, Ref,
    RefObject,
    useEffect,
    useImperativeHandle,
    useRef
} from "react"
import {
    Cell,
    ColumnDef,
    flexRender,
    getCoreRowModel,
    Header,
    HeaderGroup,
    Row,
    Table,
    useReactTable,
} from "@tanstack/react-table";
import {useVirtualizer, VirtualItem, Virtualizer,} from "@tanstack/react-virtual";
import {
    Range,
    SelectedCell,
} from "./useSpreadsheetStore";
import {cn} from "./ui/utils.ts";
import {CellContent, highlightCells} from "./utils.ts";

// In pixel
const DEFAULT_COLUMN_WIDTH = 180 as const;
const DEFAULT_ROW_HEIGHT = 35 as const;

const Z_INDEX_OF_STICKY_HEADER_ROW = 10 as const;
// const Z_INDEX_OF_STICKY_HEADER_COLUMN = 9 as const;

const calculateWidthOfFirstColumn = (rowCount: number): number => {
    const baseWidth = 40; // Base width in pixels
    const incrementPerRow = 0.2; // Width increment per row in pixels
    return baseWidth + Math.floor(rowCount * incrementPerRow);
}

const calculateWidthOfColumn = (columnId: string, headerStyles: Record<string, CSSProperties>): number => {
    const styleOfHeader = headerStyles[columnId];
    const minWidthInPixel = (styleOfHeader?.minWidth ?? "0px") as string;
    const minWidthInt = Number(minWidthInPixel.split("px")[0]);

    const minWidthToWidthFactor = 5.2;

    // If minWidth from styleOfHeader is 0 set it to a default value of 10px.
    const nonZeroMinWidthOfColumn = minWidthInt === 0 ? 10 : minWidthInt;

    const result = nonZeroMinWidthOfColumn * minWidthToWidthFactor;

    if (result <= DEFAULT_COLUMN_WIDTH) return DEFAULT_COLUMN_WIDTH;

    return result;
}

type CellAndCellContainerRefType = {
    cellRefs: Record<string, HTMLTableCellElement | null>,
    cellInnerContainerRefs: Record<string, HTMLDivElement | null>,
}

type Props<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    showStyles: boolean;
    headerStyles?: Record<string, CSSProperties> | undefined;
    rowStyles?: Record<number, CSSProperties> | undefined;
    cellsStyles?: Record<string, CSSProperties> | undefined
    selectedCell?: SelectedCell | undefined;
    rangesToSelect?: Range[] | undefined;
    handleCellClick?: ((cell: Cell<TData, TValue>) => void) | undefined;
    // The height of the parent in case the parent doesn't have a fix size (value in pixel).
    parentContainerHeight?: number | undefined;
}

export const TableContainer = <TData, TValue>(props: Props<TData, TValue>) => {
    const {
        data,
        columns,
        selectedCell,
        // parentContainerHeight,
    } = props;

    const rangesToSelect = props?.rangesToSelect ?? [["A0", "A0"]];
    //
    // const rowStyles = props?.rowStyles ?? {};

    // Initialize the table instance
    const table = useReactTable<TData>({
        data,
        columns,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
    });

    const cellAndInnerCellContainerRefs = useRef<CellAndCellContainerRefType | null>(null);

    useEffect(() => {
        if (!cellAndInnerCellContainerRefs.current) return;
        console.log("cellAndInnerCellContainerRefs changed: ", cellAndInnerCellContainerRefs.current);
        console.log("Number of cell refs: ", Object.entries(cellAndInnerCellContainerRefs.current?.cellRefs).length);
    }, [cellAndInnerCellContainerRefs, data, columns]);

    // Set cell styles of ranges to highlight
    useEffect(() => {
        if (!cellAndInnerCellContainerRefs.current) return;
        highlightCells(
            // @ts-ignore
            table.getRowModel().rows,
            rangesToSelect,
            cellAndInnerCellContainerRefs.current.cellRefs,
            cellAndInnerCellContainerRefs.current.cellInnerContainerRefs,
        );
    }, [data, rangesToSelect, selectedCell, cellAndInnerCellContainerRefs, table]);

    // The virtualizers need to know the scrollable container element
    const tableContainerRef = useRef<HTMLDivElement>(null);

    //we are using a slightly different virtualization strategy for columns (compared to virtual rows) in order to support dynamic row heights
    const columnVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableCellElement>({
        count: columns.length,
        estimateSize: (index) => table.getVisibleLeafColumns()[index].getSize(), //estimate width of each column for accurate scrollbar dragging
        getScrollElement: () => tableContainerRef.current,
        horizontal: true,
        overscan: 3, //how many columns to render on each side off screen each way (adjust this for performance)
        onChange: () => {
            // We call highlightCells() here so that the highlight styles get applied again since the virtualizer deletes(remove) rows which are out of the viewport of the scroll element.
            // Without this, the reference of cells gets lost and the highlight styles get lost when they are out of the view port.
            if (!cellAndInnerCellContainerRefs.current) return;
            highlightCells(
                // @ts-ignore
                table.getRowModel().rows,
                rangesToSelect,
                cellAndInnerCellContainerRefs.current.cellRefs,
                cellAndInnerCellContainerRefs.current.cellInnerContainerRefs,
            );
        }
    });

    // dynamic row height virtualization - alternatively you could use a simpler fixed row height strategy without the need for `measureElement`
    const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
        count: table.getRowCount(),
        estimateSize: () => 35, //estimate row height for accurate scrollbar dragging
        getScrollElement: () => tableContainerRef.current,
        //measure dynamic row height, except in firefox because it measures table border height incorrectly
        measureElement:
            typeof window !== "undefined" &&
            navigator.userAgent.indexOf("Firefox") === -1
                ? element => element?.getBoundingClientRect().height
                : undefined,
        overscan: 5,
        onChange: () => {
            // We call highlightCells() here so that the highlight styles get applied again since the virtualizer deletes(remove) rows which are out of the viewport of the scroll element.
            // Without this, the reference of cells gets lost and the highlight styles get lost when they are out of the view port.
            if (!cellAndInnerCellContainerRefs.current) return;
            highlightCells(
                table.getRowModel().rows,
                rangesToSelect,
                cellAndInnerCellContainerRefs.current.cellRefs,
                cellAndInnerCellContainerRefs.current.cellInnerContainerRefs,
            );
        }
    })

    const virtualColumns = columnVirtualizer.getVirtualItems()

    //different virtualization strategy for columns - instead of absolute and translateY, we add empty columns to the left and right
    let virtualPaddingLeft: number | undefined
    let virtualPaddingRight: number | undefined

    if (columnVirtualizer && virtualColumns?.length) {
        virtualPaddingLeft = virtualColumns[0]?.start ?? 0
        virtualPaddingRight =
            columnVirtualizer.getTotalSize() -
            (virtualColumns[virtualColumns.length - 1]?.end ?? 0)
    }

    // Event Handlers
    const handleCellSelection = (cell: Cell<TData, TValue>) => {
        if (!props.handleCellClick) return;
        props.handleCellClick(cell);
    }

    return (
        <div
            className="container"
            ref={tableContainerRef}
            style={{
                overflow: "auto", //our scrollable table container
                position: "relative", //needed for sticky header
                height: "800px", //should be a fixed height
                whiteSpace: "nowrap",
            }}
        >
            {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
            <table
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
                    selectedCell={props.selectedCell}
                    virtualPaddingLeft={virtualPaddingLeft}
                    virtualPaddingRight={virtualPaddingRight}
                    headerStyles={props.headerStyles}
                />
                <TableBody
                    ref={cellAndInnerCellContainerRefs}
                    // @ts-ignore
                    rowVirtualizer={rowVirtualizer}
                    columnVirtualizer={columnVirtualizer}
                    // @ts-ignore
                    table={table}
                    selectedCell={props.selectedCell}
                    tableContainerRef={tableContainerRef}
                    virtualPaddingLeft={virtualPaddingLeft}
                    virtualPaddingRight={virtualPaddingRight}
                    // @ts-ignore
                    handleCellSelection={handleCellSelection}
                    cellsStyles={props.cellsStyles}
                    headerStyles={props.headerStyles}
                />
            </table>
        </div>
    )
}

type TableHeadProps = {
    columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    table: Table<unknown>;
    selectedCell?: SelectedCell | undefined;
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
}

const TableHead: FC<TableHeadProps> = (props) => {
    const {
        columnVirtualizer,
        table,
        selectedCell,
        virtualPaddingLeft,
        virtualPaddingRight,
        headerStyles,
    } = props;

    return (
        <thead
            style={{
                display: "grid",
                position: "sticky",
                top: 0,
                zIndex: Z_INDEX_OF_STICKY_HEADER_ROW,
            }}
            className={"bg-neutral-100"}
        >
        {table.getHeaderGroups().map(headerGroup => (
            <TableHeadRow
                key={headerGroup.id}
                rowCount={table.getRowCount()}
                headerGroup={headerGroup}
                selectedCell={selectedCell}
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
    columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    headerGroup: HeaderGroup<TData>;
    rowCount: number;
    selectedCell?: SelectedCell | undefined;
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
}
const TableHeadRow = <T, >(props: TableHeadRowProps<T>) => {
    const {
        rowCount,
        columnVirtualizer,
        headerGroup,
        selectedCell,
        virtualPaddingLeft,
        virtualPaddingRight,
        headerStyles,
    } = props;

    const virtualColumns = columnVirtualizer.getVirtualItems();

    return (
        <tr key={headerGroup.id} style={{display: "flex", width: "100%"}}>
            {virtualPaddingLeft ? (
                //fake empty column to the left for virtualization scroll padding
                <th style={{display: "flex", width: virtualPaddingLeft}}/>
            ) : null}
            {virtualColumns.map((virtualColumn, colIndex, array) => {
                const header = headerGroup.headers[virtualColumn.index];
                return (
                    <TableHeadCell
                        key={header.id}
                        // @ts-ignore
                        header={header}
                        rowCount={rowCount}
                        isSelected={(selectedCell && selectedCell.column === header.id && colIndex !== 0) ?? false}
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
    header: Header<TData, TValue>;
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
        // return header.getSize();
        return calculateWidthOfColumn(header.column.id, headerStyles);
    }

    return (
        <th
            key={header.id}
            style={{
                display: "flex",
                justifyContent: "center",
                justifyItems: "center",
                width: computeWidthOfHeadCell(),
                borderTop: "unset",
                borderRight: isLast ? "1px solid #e5e7eb" : "unset",
                borderLeft: isFirst ? "unset" : "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
            }}
            className={cn("py-2 w-full m-0 border-b border-r text-center bg-neutral-100 text-sm text-neutral-600 font-normal tracking-tight sticky top-[-1px] z-[10] select-none", {
                "!font-bold !text-white !bg-blue-500 !border-blue-500 !border-solid !border-l !border-r !border-b-0 !border-t-0": isSelected,
            })}
        >
            <div
                {...{
                    className: header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : '',
                    onClick: header.column.getToggleSortingHandler(),
                }}
            >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                }[header.column.getIsSorted() as string] ?? null}
            </div>
        </th>
    )
}

type TableBodyProps<TData> = {
    rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
    columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    table: Table<TData>;
    selectedCell?: SelectedCell | undefined;
    handleCellSelection: (cell: Cell<TData, unknown>) => void;
    tableContainerRef: RefObject<HTMLDivElement>;
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    cellsStyles?: Record<string, CSSProperties> | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
}

const TableBody = forwardRef(<T, >(props: TableBodyProps<T>, ref: Ref<CellAndCellContainerRefType> | undefined) => {
    const {
        rowVirtualizer,
        columnVirtualizer,
        table,
        selectedCell,
        // tableContainerRef,
        virtualPaddingLeft,
        virtualPaddingRight,
        handleCellSelection,
        cellsStyles,
        headerStyles,
    } = props;

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
            const row = rows[virtualRow.index] as Row<unknown>

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
                    rowCount={table.getRowCount()}
                    // @ts-ignore
                    handleCellClick={handleCellSelection}
                    selectedCell={selectedCell}
                    rowVirtualizer={rowVirtualizer}
                    virtualPaddingLeft={virtualPaddingLeft}
                    virtualPaddingRight={virtualPaddingRight}
                    virtualRow={virtualRow}
                    cellsStyles={cellsStyles}
                    headerStyles={headerStyles}
                    // cellRefs={cellRefs}
                    // cellInnerContainerRefs={cellInnerContainerRefs}
                />
            )
        })}
        </tbody>
    )
})

type TableBodyRowProps<TData> = {
    rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
    columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    row: Row<TData>;
    rowCount: number;
    selectedCell?: SelectedCell | undefined;
    handleCellClick: (cell: Cell<TData, unknown>) => void;
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    virtualRow: VirtualItem;
    cellsStyles?: Record<string, CSSProperties> | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
}
// @ts-ignore
const TableBodyRow = forwardRef(<T,>(props: TableBodyRowProps<T>, ref: Ref<CellAndCellContainerRefType> | undefined) => {
    const {
        rowVirtualizer,
        columnVirtualizer,
        row,
        rowCount,
        selectedCell,
        virtualPaddingLeft,
        virtualPaddingRight,
        virtualRow,
        handleCellClick,
        cellsStyles,
        headerStyles,
    } = props;

    const visibleCells = row.getVisibleCells();
    const virtualColumns = columnVirtualizer.getVirtualItems();

    const isCellSelected = (cell: Cell<T, CellContent>, cellIndex: number): boolean => {
        return (
            selectedCell &&
            selectedCell.row === cell.row.index &&
            selectedCell.column === cell.column.id &&
            cellIndex !== 0
        ) as boolean;
    }

    const cellAndCellContainerRefsOfRow = useRef<CellAndCellContainerRefType>({
        cellRefs: {},
        cellInnerContainerRefs: {},
    });

    // Sends all cell refs and cell inner container refs of row to the parent component
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
                <td style={{ display: "flex", width: virtualPaddingLeft }} />
            ) : null}
            {virtualColumns.map((vc, cellIndex, array) => {
                const cell = visibleCells[vc.index]
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
                        rowCount={rowCount}
                        isLast={cellIndex === array.length - 1}
                        isFirst={cellIndex === 0}
                        isSelected={isCellSelected(cell, cellIndex)}
                        isFirstCellOfSelectedRow={(selectedCell && selectedCell.row === cell.row.index && cellIndex === 0) ?? false}
                        // @ts-ignore
                        handleCellSelection={(cell) => handleCellClick(cell)}
                        cellsStyles={cellsStyles}
                        headerStyles={headerStyles}
                    />
                )
            })}
            {virtualPaddingRight ? (
                //fake empty column to the right for virtualization scroll padding
                <td style={{ display: "flex", width: virtualPaddingRight }} />
            ) : null}
        </tr>
    )
});

type TableBodyCellProps<TData, TValue> = {
    cell: Cell<TData, TValue>;
    isFirst: boolean;
    isLast: boolean;
    isFirstCellOfSelectedRow : boolean;
    rowCount: number;
    isSelected: boolean;
    cellsStyles?: Record<string, CSSProperties> | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
    handleCellSelection: (cell: Cell<TData, TValue>) => void;
}
const TableBodyCell = forwardRef(
    <T, V>(
        props: TableBodyCellProps<T, V>,
        ref: Ref<CellAndCellContainerRefType> | undefined
    ) => {
    const {
        cell,
        isFirst,
        isLast,
        isSelected,
        rowCount,
        isFirstCellOfSelectedRow,
        handleCellSelection,
    } = props;

    const cellsStyles = props?.cellsStyles ?? {};

    const headerStyles = props?.headerStyles ?? {};

    const cellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

    const cellInnerContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Sends all cell refs to the parent component
    useImperativeHandle(ref, () => ({
        cellRefs: cellRefs.current,
        cellInnerContainerRefs: cellInnerContainerRefs.current,
    }));

    const computeWidthOfFirstCell = (): number => {
        if (isFirst) return calculateWidthOfFirstColumn(rowCount);
        // return cell.column.getSize();
        return calculateWidthOfColumn(cell.column.id, headerStyles);
    }

    const getCellStyle = (row: number, column: string): CSSProperties => {
        if (!row || !column) return {};
        return cellsStyles[`${column}${row}`];
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

    const cellId = `${cell.column.id}${cell.row.index + 1}`;

    const cellInnerContainerId = `${cell.column.id}${cell.row.index + 1}-inner-container`;

    return (
        <td
            key={cell.id}
            ref={(el) => {
                if (!el) return;
                cellRefs.current[cellId] = el;
            }}
            style={{
                display: "flex",
                width: computeWidthOfFirstCell(),
                borderTop: "unset",
                borderRight: isLast ? "1px solid #e5e7eb" : "unset",
                borderLeft: isFirst ? "unset" : "1px solid #e5e7eb",
                borderBottom: isSelected ? "none" : "1px solid #e5e7eb",
                height: `${DEFAULT_ROW_HEIGHT}px`,
            }}
            data-label={cell.column.columnDef.header}
            className={cn("text-sm text-neutral-600 border-b border-r top-0 bottom-0 m-0 relative p-0", {
                "text-center justify-items-center justify-center items-center content-center select-none sticky left-0 z-[9] bg-neutral-100 tracking-tight": isFirst,
                "!font-bold !bg-blue-500 !text-white": isFirstCellOfSelectedRow,
            })}
            onClick={!isFirst ? () => handleCellSelection(cell) : undefined}
        >
            <div
                ref={(el) => {
                    if (!el) return;
                    cellInnerContainerRefs.current[cellInnerContainerId] = el;
                }}
                className={cn("h-full w-full m-0 p-0 absolute border-[2px] border-transparent", {
                    "border-[2px] !border-blue-500": isSelected,
                })}
                style={{
                    backgroundColor: getCellStyleOfCellContent(cell.row.index + 1, cell.column.id)?.backgroundColor,
                }}
            >
                <div
                    style={{
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
                        borderTop: getCellStyle(cell.row.index + 1, cell.column.id)?.borderTop,
                        borderRight: getCellStyle(cell.row.index + 1, cell.column.id)?.borderRight,
                        borderBottom: getCellStyle(cell.row.index + 1, cell.column.id)?.borderBottom,
                        borderLeft: getCellStyle(cell.row.index + 1, cell.column.id)?.borderLeft,
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: "flex",
                            width: "100%",
                            height: "100%",
                            // styles from source file
                            ...getCellStyleOfCellContent(cell.row.index + 1, cell.column.id),
                            // For first column containing the row number.
                            ...(isFirst ? {
                                display: "flex",
                                justifyContent: "center",
                                justifyItems: "center",
                                alignContent: "center",
                                alignItems: "center",
                            } : {}),
                        }}
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                </div>
            </div>
            {isSelected ?
                <div
                    className="bg-blue-500 text-blue-500 size-2 border border-white border-r-0 border-b-0 drop-shadow-lg rounded-[2px] absolute bottom-[-1px] right-[-1px] z-[1000]"
                ></div> : null
            }
        </td>
    )
});
