import {CSSProperties, useEffect, useRef} from "react";
import {Cell, ColumnDef, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {cn} from "./ui/utils";
import {Range, SelectedCell} from "./useSpreadsheetStore";
import {useVirtualizer} from "@tanstack/react-virtual";
import {CellContent, highlightCells} from "./utils";

// In pixel
const DEFAULT_COLUMN_WIDTH = 180 as const;
const DEFAULT_ROW_HEIGHT = 35 as const;

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
const SpreadsheetTable = <TData, TValue>(props: Props<TData, TValue>) => {
    const {
        data,
        columns,
        selectedCell,
        parentContainerHeight,
    } = props;

    const rangesToSelect = props?.rangesToSelect ?? [["A0", "A0"]];

    const headerStyles = props?.headerStyles ?? {};

    const cellsStyles = props?.cellsStyles ?? {};

    // const rowStyles = props?.rowStyles ?? {};

    // Initialize the table instance
    const table = useReactTable({
        data,
        columns,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
    });

    const cellRefs = useRef<Record<string, (HTMLTableCellElement | null)>>({});

    const cellInnerContainerRefs = useRef<Record<string, (HTMLDivElement | null)>>({});

    // Set cell styles of ranges to highlight
    useEffect(() => {
        highlightCells(
            table.getRowModel().rows,
            rangesToSelect,
            cellRefs.current,
            // cellInnerContainerRefs.current,
        );
    }, [data, rangesToSelect, selectedCell, cellRefs, cellInnerContainerRefs, highlightCells, table]);

    const parentRef = useRef<HTMLDivElement | null>(null);

    // Virtualizer for rows
    const rowVirtualizer = useVirtualizer({
        count: table.getRowCount(),
        getScrollElement: () => parentRef.current,
        estimateSize: () => 35, // Row height in pixels
        overscan: 5, // Number of rows to render outside the viewport for smooth scrolling
        // This callback gets fired each time the virtualizer gets updated. See: https://tanstack.com/virtual/latest/docs/api/virtualizer#onchange
        onChange: () => {
            // We call highlightCells() here so that the highlight styles get applied again since the virtualizer deletes(remove) rows which are out of the viewport of the scroll element.
            // Without this, the reference of cells gets lost and the highlight styles get lost when they are out of the view port.
            highlightCells(
                table.getRowModel().rows,
                rangesToSelect,
                cellRefs.current,
                // cellInnerContainerRefs.current,
            );
        },
    });

    // Virtualizer for columns
    const columnVirtualizer = useVirtualizer({
        count: columns.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 150, // Column width in pixels
        overscan: 2, // Number of columns to render outside the viewport for smooth scrolling
        horizontal: true,
    });

    const isCellSelected = (cell: Cell<TData, CellContent>, cellIndex: number): boolean => {
        return (
            selectedCell &&
            selectedCell.row === cell.row.index &&
            selectedCell.column === cell.column.id &&
            cellIndex !== 0
        ) as boolean;
    }

    // Styles form file
    const calculateWidthOfFirstColumn = (): number => {
        const baseWidth = 40; // Base width in pixels
        const incrementPerRow = 0.2; // Width increment per row in pixels

        const rowCount = data.length;
        return baseWidth + Math.floor(rowCount * incrementPerRow);
    }

    const calculateWidthOfColumn = (columnId: string): number => {
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

    // Event Handlers
    const handleCellSelection = (cell: Cell<TData, CellContent>) => {
        if (!props.handleCellClick) return;
        props.handleCellClick(cell);
    }

    return (
        <div
            ref={parentRef}
            style={{
                height: parentContainerHeight ? `${parentContainerHeight}px` : "inherit",
                width: "100%",
                overflowX: "auto",
                overflowY: "auto",
                whiteSpace: "nowrap",
            }}
        >
            <table
                style={{
                    // tableLayout: 'fixed',
                    width: `${columnVirtualizer.getTotalSize()}px`,
                    borderCollapse: "collapse",
                    borderSpacing: 0,
                    border: "none",
                }}
            >
                <thead className="sticky top-0 left-0 z-[10] bg-neutral-100 w-full">
                {table.getHeaderGroups().map((headerGroup) =>
                    <tr key={headerGroup.id} className="flex w-full">
                        {headerGroup.headers.map((header, colIndex, array) =>
                            <th
                                key={header.id}
                                style={{
                                    // width: colIndex === 0 ? `${calculateWidthOfFirstColumn()}px` : `${header.getSize()}px`
                                    borderTop: "unset",
                                    borderRight: colIndex === array.length - 1 ? "1px solid #e5e7eb" : "unset",
                                    borderLeft: colIndex === 0 ? "unset" : "1px solid #e5e7eb",
                                    borderBottom: "1px solid #e5e7eb",
                                    width: colIndex === 0 ? `${calculateWidthOfFirstColumn()}px` : `${calculateWidthOfColumn(header.column.id)}px`
                                }}
                                className={cn("py-2 w-full m-0 border-b border-r text-center bg-neutral-100 text-sm text-neutral-600 font-normal tracking-tight sticky top-[-1px] z-[10] select-none", {
                                    "!font-bold !text-white !bg-blue-500 !border-blue-500 !border-solid !border-l !border-r !border-b-0 !border-t-0": props.selectedCell && props.selectedCell.column === header.id && colIndex !== 0,
                                })}
                            >
                                <div>
                                    {colIndex === 0 ? "" : flexRender(header.column.columnDef.header, header.getContext())}
                                </div>
                            </th>
                        )}
                    </tr>
                    // <tr key={headerGroup.id} className="flex w-full">
                    //     {columnVirtualizer.getVirtualItems().map((virtualColumn, colIndex) => {
                    //         const headers = headerGroup.headers;
                    //         const header = headers[virtualColumn.index];
                    //         return (
                    //             <th
                    //                 key={header.id}
                    //                 style={{
                    //                     // width: `${virtualColumn.size}px`,
                    //                     position: "relative",
                    //                     left: colIndex === 1 ? "0px" : `${virtualColumn.start}px`,
                    //                     // added
                    //                     display: "flex",
                    //                     // width: header.getSize(),
                    //                     width: colIndex === 0 ? `${calculateWidthOfFirstColumn()}px` : `${calculateWidthOfColumn(header.column.id)}px`,
                    //
                    //                     borderTop: "unset",
                    //                     borderRight: colIndex === headers.length - 1 ? "1px solid #e5e7eb" : "unset",
                    //                     borderLeft: colIndex === 0 ? "unset" : "1px solid #e5e7eb",
                    //                     borderBottom: "1px solid #e5e7eb",
                    //                     // transform: `translateX(${virtualColumn.start}px)`,
                    //                 }}
                    //             >
                    //                 {colIndex === 0 ? "" : flexRender(header.column.columnDef.header, header.getContext())}
                    //             </th>
                    //         );
                    //     })}
                    // </tr>
                )}
                </thead>
                <tbody className={"relative w-full"} style={{height: `${rowVirtualizer.getTotalSize()}px`}}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    return (
                        <tr
                            key={virtualRow.key}
                            className="absolute flex w-full"
                            data-state={row.getIsSelected() && "selected"}
                            style={{transform: `translateY(${virtualRow.start}px)`}}
                        >
                            {row.getVisibleCells().map((cell, cellIndex, cellsArray) => {
                                const cellId = `${cell.column.id}${cell.row.index + 1}`;
                                const cellInnerContainerId = `${cell.column.id}${cell.row.index + 1}-inner-container`;
                                return (
                                    <td
                                        key={cell.id}
                                        ref={(el) => {
                                            cellRefs.current[cellId] = el;
                                        }}
                                        style={{
                                            // height: `${cell.column.getSize()}px`,
                                            // width: cellIndex === 0 ? `${calculateWidthOfFirstColumn()}px` : `${cell.column.getSize()}px`,
                                            // ...(rowStyles[`${rowIndex + 1}`] as CSSProperties ?? {}),
                                            borderTop: "unset",
                                            borderRight: cellIndex === cellsArray.length - 1 ? "1px solid #e5e7eb" : "unset",
                                            borderLeft: cellIndex === 0 ? "unset" : "1px solid #e5e7eb",
                                            borderBottom: isCellSelected(cell, cellIndex) ? "none" : "1px solid #e5e7eb",
                                            height: `${DEFAULT_ROW_HEIGHT}px`,
                                            width: cellIndex === 0 ? `${calculateWidthOfFirstColumn()}px` : `${calculateWidthOfColumn(cell.column.id)}px`,
                                        }}
                                        data-label={cell.column.columnDef.header}
                                        className={cn("text-sm text-neutral-600 border-b border-r top-0 bottom-0 m-0 relative p-0", {
                                            "text-center select-none sticky left-0 z-[9] bg-neutral-100 tracking-tight": cellIndex === 0,
                                            "!font-bold !bg-blue-500 !text-white": selectedCell && selectedCell.row === cell.row.index && cellIndex === 0,
                                        })}
                                        onClick={cellIndex !== 0 ? () => handleCellSelection(cell) : undefined}
                                    >
                                        <div
                                            ref={(el) => {
                                                cellInnerContainerRefs.current[cellInnerContainerId] = el;
                                            }}
                                            className={cn("h-full w-full m-0 p-0 absolute border-[2px] border-transparent", {
                                                "border-[2px] !border-blue-500": isCellSelected(cell, cellIndex),
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
                                                        ...(cellIndex === 0 ? {
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            justifyItems: "center",
                                                            alignContent: "center",
                                                            alignItems: "center",
                                                        } : {}),
                                                    }}
                                                >
                                                    {cellIndex === 0 ? row.index + 1 : flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            </div>
                                            {/*{cellIndex === 0 ? row.index + 1 : (data[cell.row.index + 1] ?? {})[`${cell.column.columnDef.id ?? ""}`]}*/}
                                        </div>
                                        {isCellSelected(cell, cellIndex) ?
                                            <div
                                                className="bg-blue-500 text-blue-500 size-2 border border-white border-r-0 border-b-0 drop-shadow-lg rounded-[2px] absolute bottom-[-1px] right-[-1px] z-[1000]"
                                            ></div> : null
                                        }
                                    </td>
                                )}
                            )}
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    );
};
SpreadsheetTable.displayName = "SpreadsheetComponent";

export { SpreadsheetTable };
