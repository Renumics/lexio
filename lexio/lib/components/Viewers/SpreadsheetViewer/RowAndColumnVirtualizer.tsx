import {
    CSSProperties,
    FC,
    forwardRef,
    Ref,
    RefObject,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
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
import {mergeCells, MergeGroup, Range, SelectedCell,} from "./useSpreadsheetStore";
import {cn} from "./ui/utils.ts";
import {
    // calculateHeightOfRow,
    calculateWidthOfColumn,
    calculateWidthOfFirstColumn,
    CellContent,
    DEFAULT_COLUMN_WIDTH,
    highlightCells,
    isCellInRange,
    Z_INDEX_OF_STICKY_HEADER_ROW
} from "./utils.ts";
import {utils} from "xlsx";
// import { utils } from "xlsx";

const getTableCellRefs = (sheetName: string, tableId: string): Record<string, HTMLTableCellElement> => {
    try {
        const allTableCells = document.querySelectorAll(`#${tableId} tbody tr td`) as NodeListOf<HTMLTableCellElement>;
        const cellRefs: Record<string, HTMLTableCellElement> = {};
        allTableCells.forEach((cell) => {
            cellRefs[cell.id] = cell;
        })
        return cellRefs;
    } catch (error) {
        console.error("Error getting cell refs for sheet:", sheetName, error);
        return {};
    }
}

const applyMergesToCells = (mergeGroup: MergeGroup | undefined, sheetName: string, tableId: string, onMergeDone?: () => void) => {
    if (sheetName.length === 0) return;
    if (!mergeGroup) return;
    if (mergeGroup.sheetName !== sheetName) return;
    if (mergeGroup.mergedRanges.length === 0) return;

    const allCellRefs = getTableCellRefs(sheetName, tableId);
    if (Object.entries(allCellRefs).length === 0) return;

    mergeCells(mergeGroup.mergedRanges, allCellRefs, onMergeDone);
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
    // @ts-ignore
    handleCellClick?: ((cell: Cell<TData, TValue>) => void) | undefined;
    // The height of the parent in case the parent doesn't have a fix size (value in pixel).
    parentContainerHeight?: number | undefined;
    mergedGroupOfSelectedWorksheet: MergeGroup | undefined;
    selectedSheetName: string;
    setSelectedRange: (range?: Range | undefined) => void;
}

export const TableContainer = <TData, TValue>(props: Props<TData, TValue>) => {
    const {
        data,
        columns,
        // selectedCell,
        // parentContainerHeight,
        mergedGroupOfSelectedWorksheet,
        selectedSheetName,
        setSelectedRange,
    } = props;

    const rangesToSelect = props?.rangesToSelect ?? [["A0", "A0"]];

    const tableId = useMemo(() => {
        return `${selectedSheetName.replace(" ", "")}${(new Date()).getTime()}`;
    }, [selectedSheetName]);

    // Initialize the table instance
    const table = useReactTable<TData>({
        data,
        columns,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
    });

    const cellAndInnerCellContainerRefs = useRef<CellAndCellContainerRefType | null>(null);

    const [selectedHeaderCells, setSelectedHeaderCells] = useState<string[]>([]);

    const [selectedHeaderRowCells, setSelectedHeaderRowCells] = useState<number[]>([]);

    useEffect(() => {
        if (!props.selectedCell) return;
        const startColumn = utils.encode_col(selectedHeaderCells.map((header) => utils.decode_col(header)).sort((a, b) => a - b)[0]);
        const startRow = selectedHeaderRowCells.sort((a, b) => a - b)[0];
        const startCell = `${startColumn}${startRow}`

        const endColumn = utils.encode_col(selectedHeaderCells.map((header) => utils.decode_col(header)).sort((a, b) => b - a)[0]);
        const endRow = selectedHeaderRowCells.sort((a, b) => b - a)[0];
        const endCell = `${endColumn}${endRow}`

        const rangeToSelect: Range | undefined = startCell && endCell ? [startCell, endCell] : undefined;

        setSelectedRange(rangeToSelect);
    }, [props.selectedCell, selectedHeaderCells, selectedHeaderRowCells, setSelectedRange]);

    // Ref to info about if merges have been applied to a worksheet or not.
    // This is to persist the information acros re-renders
    // const mergesApplied = useRef<Set<string>>(new Set<string>());

    // const [
    //     sheetsWithAppliedMerges,
    //     setSheetsWithAppliedMerges
    // ] = useState<Set<string>>(new Set<string>());

    // const rowVirtualiserRef = useRef<Virtualizer<HTMLDivElement, HTMLTableRowElement> | null>(null);
    // const columnVirtualiserRef = useRef<Virtualizer<HTMLDivElement, HTMLTableCellElement>| null>(null);

    // useEffect(() => {
    //     if (!cellAndInnerCellContainerRefs.current) return;
    //     console.log("cellAndInnerCellContainerRefs changed: ", cellAndInnerCellContainerRefs.current);
    //     console.log("Number of cell refs: ", Object.entries(cellAndInnerCellContainerRefs.current?.cellRefs).length);
    // }, [data, cellAndInnerCellContainerRefs]);

    // useEffect(() => {
    //     const clearRefs = () => {
    //         if (!cellAndInnerCellContainerRefs.current) return;
    //         cellAndInnerCellContainerRefs.current = null;
    //     }
    //     clearRefs();
    //     return () => {
    //         clearRefs();
    //     };
    // }, [data]);

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
    }, [rangesToSelect, cellAndInnerCellContainerRefs, table]);

    // useEffect(() => {
    //     // const allCells = table.getRowModel().rows.flatMap((row) => row.getVisibleCells());
    //     // if (allCells.length !== Object.keys(cellAndInnerCellContainerRefs?.current?.cellRefs as object).length) return;
    //     if (!cellAndInnerCellContainerRefs.current) return;
    //     // applyMergesToCells(
    //     //     mergedRangesOfSelectedWorksheet,
    //     //     cellAndInnerCellContainerRefs.current.cellRefs,
    //     // );
    //     // mergesApplied.current.add(selectedSheetName);
    // }, [cellAndInnerCellContainerRefs, mergedRangesOfSelectedWorksheet, selectedSheetName, table]);

    // The virtualizers need to know the scrollable container element
    const tableContainerRef = useRef<HTMLDivElement>(null);

    //we are using a slightly different virtualization strategy for columns (compared to virtual rows) in order to support dynamic row heights
    const columnVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableCellElement>({
        count: columns.length,
        // estimateSize: (index: number) => table.getVisibleLeafColumns()[index].getSize(), //estimate width of each column for accurate scrollbar dragging
        estimateSize: () => DEFAULT_COLUMN_WIDTH,
        getScrollElement: () => document.getElementById(selectedSheetName) as HTMLDivElement,
        horizontal: true,
        overscan: 5, //how many columns to render on each side off screen each way (adjust this for performance)
        onChange: () => {
        //     // We call highlightCells() here so that the highlight styles get applied again since the virtualizer deletes(remove) rows which are out of the viewport of the scroll element.
        //     // Without this, the reference of cells gets lost and the highlight styles get lost when they are out of the view port.
        //     // if (!cellAndInnerCellContainerRefs.current) return;
        //     // highlightCells(
        //     //     // @ts-ignore
        //     //     table.getRowModel().rows,
        //     //     rangesToSelect,
        //     //     cellAndInnerCellContainerRefs.current.cellRefs,
        //     //     cellAndInnerCellContainerRefs.current.cellInnerContainerRefs,
        //     // );
        //     // if (!cellAndInnerCellContainerRefs.current) return;
        //     // applyMergesToCells(
        //     //     mergedRangesOfSelectedWorksheet,
        //     //     cellAndInnerCellContainerRefs.current.cellRefs,
        //     // );
        //     // applyMergesToCells(mergedGroupOfSelectedWorksheet, selectedSheetName);
        //     // applyMergesToCells(mergedGroupOfSelectedWorksheet, selectedSheetName, tableId);
            console.log("columnVirtualizer onChange called: ");

            // console.log("virtualItems onChange called: ", instance.getVirtualItems());

            applyMergesToCells(
                mergedGroupOfSelectedWorksheet,
                selectedSheetName,
                tableId,
            );
        },
    });

    // dynamic row height virtualization - alternatively you could use a simpler fixed row height strategy without the need for `measureElement`
    const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
        count: table.getRowCount(),
        estimateSize: () => 35, //estimate row height for accurate scrollbar dragging
        getScrollElement: () => document.getElementById(selectedSheetName) as HTMLDivElement,
        //measure dynamic row height, except in firefox because it measures table border height incorrectly
        measureElement:
            typeof window !== "undefined" &&
            navigator.userAgent.indexOf("Firefox") === -1
                ? element => element?.getBoundingClientRect().height
                : undefined,
        overscan: 5,
        onChange: () => {
        //     // We call highlightCells() here so that the highlight styles get applied again since the virtualizer deletes(remove) rows which are out of the viewport of the scroll element.
        //     // Without this, the reference of cells gets lost and the highlight styles get lost when they are out of the view port.
        //     // if (!cellAndInnerCellContainerRefs.current) return;
        //     // highlightCells(
        //     //     table.getRowModel().rows,
        //     //     rangesToSelect,
        //     //     cellAndInnerCellContainerRefs.current.cellRefs,
        //     //     cellAndInnerCellContainerRefs.current.cellInnerContainerRefs,
        //     // );
        //     // if (!cellAndInnerCellContainerRefs.current) return;
        //     // applyMergesToCells(
        //     //     mergedRangesOfSelectedWorksheet,
        //     //     cellAndInnerCellContainerRefs.current.cellRefs,
        //     // );
        //     // applyMergesToCells(mergedGroupOfSelectedWorksheet, selectedSheetName);
        //     // applyMergesToCells(mergedGroupOfSelectedWorksheet, selectedSheetName, tableId);

            console.log("rowVirtualizer onChange called: ");
            applyMergesToCells(
                mergedGroupOfSelectedWorksheet,
                selectedSheetName,
                tableId,
            );
        },
    });

    useEffect(() => {
        // if (sheetsWithAppliedMerges.has(selectedSheetName)) return;
        // if (!mergedGroupOfSelectedWorksheet) return
        // if (mergedGroupOfSelectedWorksheet.mergedRanges.length === 0) return;
        // if (mergedGroupOfSelectedWorksheet.sheetName !== selectedSheetName) return;
        // if (selectedSheetName.length === 0) return;

        if (!tableContainerRef.current) return;
        tableContainerRef.current.scrollBy(800, 800);
        const timeout = setTimeout(() => {
            if (!tableContainerRef.current) return;
            tableContainerRef.current.scroll(0, 0);
        }, 10);

        // rowVirtualizer.measure();
        // columnVirtualizer.measure();

        applyMergesToCells(
                mergedGroupOfSelectedWorksheet,
                selectedSheetName,
                tableId,
        );

        rowVirtualizer.measure();
        columnVirtualizer.measure();

        return () => clearTimeout(timeout);

        // const cellRefs = getTableCellRefs(selectedSheetName, tableId);
        //     if (!cellRefs) return;
        //     Object.entries(cellRefs).forEach(([, cell]) => {
        //         cell.colSpan = 1;
        //         const cellComponents = extractCellComponent(cell.id);
        //         if (!cellComponents) return;
        //         // cell.style.width = `${calculateWidthOfColumn(cellComponents.column, props.headerStyles ?? {})}px`;
        //     });
    }, [mergedGroupOfSelectedWorksheet, selectedSheetName, table, columns.length, rowVirtualizer, columnVirtualizer, tableContainerRef, tableId]);

    // Set selected header and header row cells
    useEffect(() => {
         if (!props.selectedCell || !mergedGroupOfSelectedWorksheet) return;
        // return an array of header cells and header row cells present in the mergedGroupOfSelectedWorksheet when prop.selected cell is within that range
        const headerCells: string[] = [];
        const headerRowCells: number[] = [];
        mergedGroupOfSelectedWorksheet.mergedRanges.forEach((range) => {
               if (!props.selectedCell) return;
               const startColumn = utils.decode_col(range.start.column);
               const endColumn = utils.decode_col(range.end.column);

               const startRow = range.start.row;
               const endRow = range.end.row;

               if (isCellInRange(props.selectedCell.row, props.selectedCell.column, [`${range.start.column}${range.start.row}`,`${range.end.column}${range.end.row}`])) {
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
            headerCells.push(props.selectedCell.column)
        }
        if (headerRowCells.length === 0) {
            headerRowCells.push(props.selectedCell.row)
        }
        setSelectedHeaderCells(headerCells);
        setSelectedHeaderRowCells(headerRowCells);

        return () => {
            setSelectedHeaderCells([]);
            setSelectedHeaderRowCells([]);
        };
    }, [mergedGroupOfSelectedWorksheet, props.selectedCell]);

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
            id={selectedSheetName}
            style={{
                overflow: "auto", //our scrollable table container
                position: "relative", //needed for sticky header
                height: "800px", //should be a fixed height
                whiteSpace: "nowrap",
            }}
        >
            {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
            <table
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
                    headerStyles={props.headerStyles}
                />
                <TableBody
                    // ref={cellAndInnerCellContainerRefs}
                    // @ts-ignore
                    rowVirtualizer={rowVirtualizer}
                    columnVirtualizer={columnVirtualizer}
                    // @ts-ignore
                    table={table}
                    selectedCell={props.selectedCell}
                    selectedHeaderCells={selectedHeaderCells}
                    selectedHeaderRowCells={selectedHeaderRowCells}
                    tableContainerRef={tableContainerRef}
                    virtualPaddingLeft={virtualPaddingLeft}
                    virtualPaddingRight={virtualPaddingRight}
                    // @ts-ignore
                    handleCellSelection={handleCellSelection}
                    cellsStyles={props.cellsStyles ?? {}}
                    headerStyles={props.headerStyles ?? {}}
                    rowStyles={props.rowStyles ?? {}}
                    mergedRangesOfSelectedWorksheet={mergedGroupOfSelectedWorksheet}
                />
            </table>
        </div>
    )
}

type TableHeadProps = {
    columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    table: Table<unknown>;
    selectedCell?: SelectedCell | undefined;
    selectedHeaderCells: string[];
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
}

const TableHead: FC<TableHeadProps> = (props) => {
    const {
        columnVirtualizer,
        table,
        selectedHeaderCells,
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
                // height: `${TABLE_HEAD_ROW_HEIGHT}px`,
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
    columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    headerGroup: HeaderGroup<TData>;
    rowCount: number;
    // selectedCell?: SelectedCell | undefined;
    selectedHeaderCells: string[];
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    headerStyles?: Record<string, CSSProperties> | undefined;
}
const TableHeadRow = <T, >(props: TableHeadRowProps<T>) => {
    const {
        rowCount,
        columnVirtualizer,
        headerGroup,
        // selectedCell,
        selectedHeaderCells,
        virtualPaddingLeft,
        virtualPaddingRight,
        headerStyles,
    } = props;

    const virtualColumns = columnVirtualizer.getVirtualItems();

    // const firstTableHeadCell = headerGroup.headers[0];

    return (
        <tr key={headerGroup.id} style={{display: "flex", width: "100%"}}>
            {virtualPaddingLeft ? (
                //fake empty column to the left for virtualization scroll padding
                <th style={{display: "flex", width: virtualPaddingLeft}}/>
            ) : null}
            {/*{firstTableHeadCell ?*/}
            {/*    <TableHeadCell*/}
            {/*        key={firstTableHeadCell.id}*/}
            {/*        // @ts-ignoref*/}
            {/*        header={firstTableHeadCell}*/}
            {/*        rowCount={rowCount}*/}
            {/*        isSelected={false}*/}
            {/*        isFirst={true}*/}
            {/*        isLast={false}*/}
            {/*        headerStyles={headerStyles}*/}
            {/*    /> : null*/}
            {/*}*/}
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
                alignContent: "center",
                alignItems: "center",
                width: computeWidthOfHeadCell(),
                borderTop: "unset",
                borderRight: isLast ? "1px solid #e5e7eb" : "unset",
                borderLeft: isFirst ? "unset" : "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
            }}
            className={cn("py-2 w-full m-0 border-b border-r text-center bg-neutral-100 text-sm text-neutral-600 font-normal tracking-tight sticky left-0 top-[-1px] z-[10] select-none", {
                "!font-bold !text-white !bg-blue-500 !border-blue-500 !border-solid !border-l !border-r !border-b-0 !border-t-0": isSelected,
            })}
        >
            <div>
                {flexRender(header.column.columnDef.header, header.getContext())}
            </div>
        </th>
    )
}

type TableBodyProps<TData> = {
    rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
    columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
    table: Table<TData>;
    selectedCell?: SelectedCell | undefined;
    selectedHeaderRowCells: number[];
    selectedHeaderCells: string[];
    handleCellSelection: (cell: Cell<TData, unknown>) => void;
    tableContainerRef: RefObject<HTMLDivElement>;
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    cellsStyles: Record<string, CSSProperties>;
    headerStyles: Record<string, CSSProperties>;
    rowStyles: Record<number, CSSProperties>;
    mergedGroupOfSelectedWorksheet: MergeGroup | undefined;
}

const TableBody = forwardRef(<T, >(props: TableBodyProps<T>, ref: Ref<CellAndCellContainerRefType> | undefined) => {
    const {
        rowVirtualizer,
        columnVirtualizer,
        table,
        selectedCell,
        // tableContainerRef,
        selectedHeaderRowCells,
        selectedHeaderCells,
        virtualPaddingLeft,
        virtualPaddingRight,
        handleCellSelection,
        cellsStyles,
        headerStyles,
        rowStyles,
        mergedGroupOfSelectedWorksheet,
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
                    selectedHeaderRowCells={selectedHeaderRowCells}
                    selectedHeaderCells={selectedHeaderCells}
                    rowVirtualizer={rowVirtualizer}
                    virtualPaddingLeft={virtualPaddingLeft}
                    virtualPaddingRight={virtualPaddingRight}
                    virtualRow={virtualRow}
                    cellsStyles={cellsStyles}
                    headerStyles={headerStyles}
                    rowStyles={rowStyles}
                    mergedRangesOfSelectedWorksheet={mergedGroupOfSelectedWorksheet}
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
    selectedHeaderRowCells: number[];
    selectedHeaderCells: string[];
    handleCellClick: (cell: Cell<TData, unknown>) => void;
    virtualPaddingLeft: number | undefined;
    virtualPaddingRight: number | undefined;
    virtualRow: VirtualItem;
    cellsStyles: Record<string, CSSProperties>;
    headerStyles: Record<string, CSSProperties>;
    rowStyles: Record<number, CSSProperties>;
    mergedGroupOfSelectedWorksheet: MergeGroup | undefined;
}
// @ts-ignore
const TableBodyRow = forwardRef(<T,>(props: TableBodyRowProps<T>, ref: Ref<CellAndCellContainerRefType> | undefined) => {
    const {
        rowVirtualizer,
        columnVirtualizer,
        row,
        rowCount,
        // selectedCell,
        selectedHeaderRowCells,
        selectedHeaderCells,
        virtualPaddingLeft,
        virtualPaddingRight,
        virtualRow,
        handleCellClick,
        cellsStyles,
        headerStyles,
        rowStyles,
        mergedGroupOfSelectedWorksheet,
    } = props;

    const visibleCells = row.getVisibleCells();

    const cellOfFirstColumn = visibleCells[0];

    // const visibleCellsWithoutFirstColumn = visibleCells.slice(1);

    const virtualColumns = columnVirtualizer.getVirtualItems();

    const isCellSelected = (cell: Cell<T, CellContent>, cellIndex: number): boolean => {
        return (
            selectedHeaderRowCells.includes(cell.row.index - 1) &&
            selectedHeaderCells.includes(cell.column.id) &&
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
                <td style={{display: "flex", width: virtualPaddingLeft}}/>
            ) : null}
            <TableBodyCell
                // @ts-ignore
                cell={cellOfFirstColumn}
                key={cellOfFirstColumn.id}
                rowCount={rowCount}
                isLast={false}
                isFirst={true}
                isSelected={isCellSelected(cellOfFirstColumn, 0)}
                isFirstCellOfSelectedRow={(selectedHeaderRowCells.includes(cellOfFirstColumn.row.index - 1)) ?? false}
                // @ts-ignore
                handleCellSelection={(cell) => handleCellClick(cell)}
                cellsStyles={cellsStyles}
                headerStyles={headerStyles}
                rowStyles={rowStyles}
                mergedRangesOfSelectedWorksheet={mergedGroupOfSelectedWorksheet}
                shouldMerge={0 < visibleCells.length - 1 && cellOfFirstColumn.getValue() === visibleCells[1].getValue()}
            />
            {virtualColumns.map((vc, cellIndex, array) => {
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
                        rowCount={rowCount}
                        isLast={cellIndex === array.length - 1}
                        isFirst={false}
                        isSelected={isCellSelected(cell, cellIndex)}
                        isFirstCellOfSelectedRow={false}
                        // @ts-ignore
                        handleCellSelection={(cell) => handleCellClick(cell)}
                        cellsStyles={cellsStyles}
                        headerStyles={headerStyles}
                        rowStyles={rowStyles}
                        mergedRangesOfSelectedWorksheet={mergedGroupOfSelectedWorksheet}
                        shouldMerge={cellIndex < visibleCells.length - 1 && cell.getValue() === visibleCells[cellIndex].getValue()}
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
    cell: Cell<TData, TValue>;
    isFirst: boolean;
    isLast: boolean;
    isFirstCellOfSelectedRow : boolean;
    rowCount: number;
    isSelected: boolean;
    cellsStyles: Record<string, CSSProperties>;
    headerStyles: Record<string, CSSProperties>;
    rowStyles: Record<number, CSSProperties>;
    handleCellSelection: (cell: Cell<TData, TValue>) => void;
    mergedGroupOfSelectedWorksheet: MergeGroup | undefined;
    shouldMerge: boolean;
}
const TableBodyCell = forwardRef(
    <T, V>(
        props: TableBodyCellProps<T, V>,
        ref: Ref<CellAndCellContainerRefType> | undefined
    ) => {
    const {
        cell,
        isFirst,
        // isLast,
        isSelected,
        // rowCount,
        isFirstCellOfSelectedRow,
        handleCellSelection,
        // headerStyles,
        // cellsStyles,
        // rowStyles,
        // mergedRangesOfSelectedWorksheet,
        // shouldMerge,
    } = props;

    const cellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

    const cellInnerContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const cellId = `${cell.column.id}${cell.row.index}`;

    const cellInnerContainerId = `${cell.column.id}${cell.row.index}-inner-container`;

    const cellContentContainerId = `${cell.column.id}${cell.row.index}-content-container`;

    const cellContentWrapperContainerId = `${cell.column.id}${cell.row.index}-content-wrapper-container`;

    const cellBorderContainerId = `${cell.column.id}${cell.row.index}-border-container`;

    // Sends all cell refs to the parent component
    useImperativeHandle(ref, () => ({
        cellRefs: cellRefs.current,
        cellInnerContainerRefs: cellInnerContainerRefs.current,
    }));

    useEffect(() => {
        return () => {
            // Clear cell reference and cell inner container reference when component unmounts to prevent unnecessary memory allocation
            cellRefs.current = {};
            cellInnerContainerRefs.current = {};
        };
    }, []);

    // const getCellStyle = (row: number, column: string): CSSProperties => {
    //     if (!row || !column) return {};
    //     return cellsStyles[`${column}${row}`];
    // }

    // const cssPropsToIgnoreInCellContent: (keyof CSSProperties)[] = [
    //     "borderTop",
    //     "borderRight",
    //     "borderBottom",
    //     "borderLeft",
    // ];
    //
    // const getCellStyleOfCellContent = (row: number, column: string): CSSProperties => {
    //     const styles = getCellStyle(row, column);
    //     if (!styles) return {};
    //     const allStyleEntries = Object.entries(styles);
    //     const styleEntriesWithoutBorders = allStyleEntries.filter(([key]) =>
    //         !cssPropsToIgnoreInCellContent.includes(key as (keyof CSSProperties))
    //     );
    //     return Object.fromEntries(styleEntriesWithoutBorders) as CSSProperties;
    // }

    // const computeCellWidth = (): number => {
    //     if (isFirst) return calculateWidthOfFirstColumn(rowCount);
    //     return calculateWidthOfColumn(cell.column.id, headerStyles);
    // }
    //
    // const computeRowHeight = (): number => {
    //     const rowIndex = cell.row.index;
    //     return calculateHeightOfRow(rowIndex, rowStyles);
    // }

    const isCellClickable = !(isFirst || cell.row.index === 0);

    return (
        <td
            key={cell.id}
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
                borderBottom: isFirstCellOfSelectedRow ? "none" : "1px solid #e5e7eb",
            }}
            data-label={cell.column.columnDef.header}
            className={cn({
                "text-center justify-items-center justify-center items-center content-center select-none sticky left-0 z-[9] bg-neutral-100 tracking-tight": isFirst,
                "!font-bold !bg-blue-500 !text-white": isFirstCellOfSelectedRow,
            })}
            onClick={isCellClickable ? () => handleCellSelection(cell) : undefined}
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
                className={cn({
                    "border-[2px] !border-b-[2px] !border-r-[2px] !border-blue-500": isSelected,
                })}
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
                            style={{
                                // @ts-ignore
                                ...(cell.row.original[cellContentContainerId] ?? {}),
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
            </div>
        </td>
    )
});
