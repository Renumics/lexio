import {CSSProperties, FC, PropsWithChildren, Ref, useEffect, useMemo, useRef} from "react";
import {Cell, ColumnDef, flexRender, getCoreRowModel, Row, useReactTable} from "@tanstack/react-table";
import "./spreadsheet.css";
import {cn} from "./ui/utils";
import {Range, SelectedCell} from "./useSpreadsheetStore";
import {isCellInRange} from "./utils";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./ui/table";

import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "./ui/context-menu"

type CellRange = Record<"top" | "right" | "bottom" | "left", string[]>;

type Props<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    headerStyles?: Record<string, CSSProperties> | undefined;
    rowStyles?: Record<number, CSSProperties> | undefined;
    cellsStyles?: Record<string, CSSProperties> | undefined
    selectedCell?: SelectedCell | undefined;
    setSelectedCell?: ((cell: { row: number, column: string }) => void) | undefined;
    rangesToSelect?: Range[] | undefined;
    handleCellClick?: ((cell: Cell<TData, TValue>) => void) | undefined;
}
const SpreadsheetTable = <TData, TValue>(props: Props<TData, TValue>) => {
    const { data, columns } = props;

    const rangesToSelect: Range[] = useMemo(() => {
        return props?.rangesToSelect ?? [["A0", "A0"]];
    }, [props?.rangesToSelect]);

    const headerStyles = props?.headerStyles ?? {};
    const cellsStyles = props?.cellsStyles ?? {};
    const rowStyles = props?.rowStyles ?? {};

    const tableBodyRef = useRef<HTMLTableSectionElement>();

    const table = useReactTable<TData>({
        data: data,
        columns,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
    });

    // Scroll to first cell of first range on change of rangesToSelect
    useEffect(() => {
        if (!rangesToSelect) return;
        if (!rangesToSelect[0]) return;
        const firstCellOfSelectedRange = document.getElementById(rangesToSelect[0][0]);

        if (!firstCellOfSelectedRange) {
            console.warn("Cannot scroll into view: cell id of first cell of selected range not found");
            return;
        }
        firstCellOfSelectedRange.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [rangesToSelect]);

    // Set cell styles of ranges to highlight
    useEffect(() => {
        if (rangesToSelect.length === 0) return;

        rangesToSelect.forEach((range) => {
            table.getRowModel().rows.forEach((row) => {
                row.getVisibleCells().forEach((cell, index) => {
                    const cellClassName: string = `${cell.column.id}${cell.row.index + 1}`;
                    const cellToStyle = document.querySelector(`.${cellClassName}`) as HTMLElement | null;
                    const cellContainerToStyle = document.querySelector(`.${cellClassName}-absolute-container`);
                    const isCellWithInRange = isCellInRange(cell.row.index + 1, cell.column.id, range);
                    const rangeToApply = getTableRangeBorder(range);
                    const rangeCheck: (borderSide: "top" | "right" | "bottom" | "left") => boolean = (borderSide: "top" | "right" | "bottom" | "left") => rangeToApply[borderSide].includes(`${cell.column.id}${cell.row.index + 1}`);

                    if (cellToStyle && isCellWithInRange) {
                        const borderTop = rangeCheck("top") ? "2px solid rgb(59 130 246 / var(--tw-bg-opacity, 1))" : index === 0 ? "0.5px solid #c1c1c1" : "0.5px solid #E5E7EBFF";
                        const borderRight = rangeCheck("right") ? "2px solid rgb(59 130 246 / var(--tw-bg-opacity, 1))" : index === 0 ? "0.5px solid #c1c1c1" : "0.5px solid #E5E7EBFF";
                        const borderBottom = rangeCheck("bottom") ? "2px solid rgb(59 130 246 / var(--tw-bg-opacity, 1))" : index === 0 ? "0.5px solid #c1c1c1" : "0.5px solid #E5E7EBFF";
                        const borderLeft = rangeCheck("left") ? "2px solid rgb(59 130 246 / var(--tw-bg-opacity, 1))" : index === 0 ? "0.5px solid #c1c1c1" : "0.5px solid #E5E7EBFF";

                        cellToStyle.style.borderTop = borderTop
                        cellToStyle.style.borderRight = borderRight
                        cellToStyle.style.borderBottom = borderBottom
                        cellToStyle.style.borderLeft = borderLeft
                    }

                    if (!cellContainerToStyle) return;

                    cellContainerToStyle.className = cn(cellContainerToStyle.className, {
                        "!opacity-[80%] !bg-blue-200 hover:!bg-blue-200": isCellInRange(row.index + 1, cell.column.id, range),
                    });
                });
            });
        });
    }, [data, rangesToSelect, props.selectedCell]);

    // Set cell styles of selected cell(s)
    useEffect(() => {
        const selectedCell = props.selectedCell;
        if (!selectedCell) return;
        const previouslySelectedCell = document.querySelector(".selected-cell");
        const cellToSelect = document.getElementById(`${selectedCell.column}${selectedCell.row}`);
        if (previouslySelectedCell) {
            previouslySelectedCell.classList.remove("selected-cell");
        }
        if (!cellToSelect) return;
        cellToSelect.classList.add("selected-cell");
    }, [rangesToSelect, props.selectedCell]);

    const getTableRangeBorder = (range: Range): CellRange => {
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
    }

    const cssPropsToIgnoreInTableHead: (keyof CSSProperties)[] = [
        "minWidth",
    ];

    const getColumnStyle = (columnId: string): CSSProperties => {
        const stylesOfColumns = headerStyles[columnId];
        if (!stylesOfColumns) return {};
        const styleWithExcludedProps = Object.entries(stylesOfColumns)
            .filter(([key]) => !cssPropsToIgnoreInTableHead.includes(key as (keyof CSSProperties)))

        return Object.fromEntries(styleWithExcludedProps) as CSSProperties;
    }

    const calculateWidthOfFirstColumn = (): number => {
        const baseWidth = 40; // Base width in pixels
        const incrementPerRow = 0.1; // Width increment per row in pixels

        const rowCount = data.length;
        return baseWidth + Math.floor(rowCount * incrementPerRow);
    }

    const calculateWidthOfColumn = (columnId: string): number => {
        const styleOfHeader = headerStyles[columnId];
        const minWidthInPixel = styleOfHeader.minWidth as string;
        const minWidthInt = Number(minWidthInPixel.split("px")[0]);

        const minWidthToWidthFactor = 5.2;

        // If minWidth from styleOfHeader is 0 set it to a default value of 10px.
        const nonZeroMinWidthOfColumn = minWidthInt === 0 ? 10 : minWidthInt;

        return nonZeroMinWidthOfColumn * minWidthToWidthFactor;
    }

    return (
        <Table className="bordered-table">
            <TableHeader className="bg-neutral-100">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className={"bg-neutral-100"}>
                        {headerGroup.headers.map((header, index, array) => {
                            return (
                                <TableHead
                                    key={header.id}
                                    style={{
                                        textAlign: "center",
                                        ...(props.selectedCell?.column === header.id && index !== 0 ? {
                                            // Todo: Set a global color as selection color
                                            backgroundColor: "rgb(59 130 246 / var(--tw-bg-opacity, 1))",
                                        } : {}),
                                        ...getColumnStyle(header.column.id),
                                        width: index === 0 ? `${calculateWidthOfFirstColumn()}px` : `${calculateWidthOfColumn(header.column.id)}px`,
                                        borderTop: "unset",
                                        borderRight: index === array.length - 1 ? "1px solid #e5e7eb" : "unset",
                                        borderLeft: index === 0 ? "unset" : "1px solid #e5e7eb",
                                        borderBottom: "1px solid #e5e7eb",
                                    }}
                                    className={cn("bg-neutral-100 text-sm text-neutral-600 font-normal tracking-tight sticky top-[-1px] left-[-1px] z-[10]", {
                                        // "min-w-[10px]": index === 0,
                                        //"min-w-[80px]": index !== 0,
                                        "font-bold text-white": props.selectedCell && props.selectedCell.column === header.id && index !== 0,
                                        "!border-blue-500 !border-solid !border-l !border-r !border-b-0 !border-t-0": props.selectedCell && props.selectedCell.column === header.id && index !== 0,
                                        //"bg-blue-500 hover:bg-blue-500": props.selectedCell?.column === header.id && index !== 0,
                                    })}
                                >
                                    <div>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </div>
                                </TableHead>
                            )
                        })}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody ref={tableBodyRef as Ref<HTMLTableSectionElement>}>
                {table.getRowModel().rows?.length ?
                    table.getRowModel().rows.map((row, rowIndex, array) =>
                        <RowRenderer
                            key={row.id}
                            row={row}
                            rowIndex={rowIndex}
                            rowStyles={rowStyles}
                            cellsStyles={cellsStyles}
                            rowCount={array.length}
                            selectedCell={props.selectedCell}
                        />
                    ) :
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            No results.
                        </TableCell>
                    </TableRow>
                }
            </TableBody>
        </Table>
    );
};
SpreadsheetTable.displayName = "SpreadsheetComponent";

type PropsRowRenderer<TData, TValue> = {
    row: Row<TData>;
    rowIndex: number;
    rowCount: number;
    selectedCell?: SelectedCell | undefined;
    rowStyles: Record<number, CSSProperties>;
    cellsStyles: Record<string, CSSProperties>;
    handleCellClick?: ((cell: Cell<TData, TValue>) => void) | undefined;
}
const RowRenderer = <T, S>(props: PropsRowRenderer<T, S>) => {
    const {
        row,
        rowStyles,
        rowIndex,
        rowCount,
        cellsStyles,
    } = props;

    const handleCellClickEvent = (cell: Cell<T, S>) => {
        if (!props.handleCellClick) return;
        props.handleCellClick(cell);
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


    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            style={{
                ...(rowStyles[`${rowIndex + 1}`] as CSSProperties ?? {})
            }}
        >
            {row.getVisibleCells().map((cell, cellIndex) => (
                <TableCell
                    id={`${cell.column.id}${cell.row.index + 1}`}
                    key={cell.id}
                    className={cn(`${cell.column.id}${cell.row.index + 1} relative`, {
                        // "text-center sticky left-[-1px] z-[9] bg-neutral-100 border-r border-b border-t-[0] border-l-[0] border-gray-200 text-sm text-neutral-600 font-normal tracking-tight": index === 0,
                        "text-center sticky left-[-1px] z-[9] bg-neutral-100 text-sm text-neutral-600 font-normal tracking-tight": cellIndex === 0,
                        "font-bold bg-blue-500 text-white": props.selectedCell && props.selectedCell.row === cell.row.index + 1 && cellIndex === 0,
                    })}
                    style={{
                        borderTop: "unset",
                        borderRight: cellIndex === rowCount - 1 ? "1px solid #e5e7eb" : "unset",
                        borderLeft: cellIndex === 0 ? "unset" : "1px solid #e5e7eb",
                        borderBottom: props.selectedCell && props.selectedCell.row === cell.row.index + 1 && cellIndex === 0 ? "none" : "1px solid #e5e7eb",
                    }}
                    onClick={() => cellIndex === 0 ? undefined : handleCellClickEvent(cell)}
                >
                    <CellContentRenderer>
                        <>
                            <div
                                id={`${cell.column.id}${cell.row.index + 1}-absolute-container`}
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
                                className={`${cell.column.id}${cell.row.index + 1}-absolute-container`}
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
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                            </div>
                            {props.selectedCell && (props.selectedCell.row === cell.row.index + 1 && props.selectedCell.column === cell.column.id) ?
                                <div
                                    className="bg-blue-500 text-blue-500 size-2 border border-white border-r-0 border-b-0 drop-shadow-md absolute bottom-[-5px] right-[-5px] z-[8]"
                                ></div>
                                : null
                            }
                        </>
                    </CellContentRenderer>
                </TableCell>
            ))}
        </TableRow>
    );
}
RowRenderer.displayName = "RowRenderer";

const CellContentRenderer: FC<PropsWithChildren> = (props) => {
    const { children } = props;
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 bg-white">
                <ContextMenuItem inset>
                    Back
                    <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem inset disabled>
                    Forward
                    <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem inset>
                    Reload
                    <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSub>
                    <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                        <ContextMenuItem>
                            Save Page As...
                            <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                        <ContextMenuItem>Name Window...</ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem>Developer Tools</ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuCheckboxItem checked>
                    Show Bookmarks Bar
                    <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
                </ContextMenuCheckboxItem>
                <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
                <ContextMenuSeparator />
                <ContextMenuRadioGroup value="pedro">
                    <ContextMenuLabel inset>People</ContextMenuLabel>
                    <ContextMenuSeparator />
                    <ContextMenuRadioItem value="pedro">
                        Pedro Duarte
                    </ContextMenuRadioItem>
                    <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
                </ContextMenuRadioGroup>
            </ContextMenuContent>
        </ContextMenu>
    );
}
CellContentRenderer.displayName = "CellRenderer";

export { SpreadsheetTable };
