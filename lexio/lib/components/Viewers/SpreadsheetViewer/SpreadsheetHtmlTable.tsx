import {useCallback, useEffect, useMemo, useRef, useState, UIEvent, MouseEvent} from "react";
import {CellRange, CellStyle, ColorSchemeList, SpreadsheetHighlight} from "./types.ts";
import {useTheme} from "./ThemeContextProvider";
import {
    calculateColumnPositions,
    calculateRowPositions,
    DEFAULT_COLUMN_SIZE,
    extractCellComponent,
    findVisibleColumnRange,
    findVisibleRowRange,
    getAdditionalColumnsForMerges,
    getAdditionalRowsForMerges,
    getCellAddress,
    getCellMergeSpan,
    getCellsInRange,
    getCellStyle,
    getColumnLabel,
    getHighlightBorder,
    getMergesAffectingVisibleColumnRange,
    getMergesAffectingVisibleRowRange,
    getShiftedMerges,
    hexToRgba,
    isCellCoveredByMerge,
    isCellInAMergeRangeAndNotTheStartCell,
    MAX_COLUMN_CONTENT_SIZE,
    MAX_COLUMN_SIZE,
} from "./utils";
import {utils} from "xlsx";
import "./SpreadsheetHtmlTable.css";

/**
 * Props for the SpreadsheetHtmlTable component
 *
 * @type SpreadsheetHtmlTableProps
 * @property {(string | null)[][]} data - A two-dimensional array of rows and columns.
 * @property {Record<string, object>} styles - A key-value pair object of cell styles.
 * @property {string[]} merges - Array of merge ranges.
 * @property {ColorSchemeList | undefined} colorThemes - Color themes extracted from the spreadsheet file.
 * @property {number[]} colWidths - An Array of width of all columns.
 * @property {number[]} rowHeights - An Array of height of all rows.
 * @property {boolean} showStyles - Show/Hide original styles from the spreadsheet file.
 * @property {string | undefined} selectedCell - Selected cell.
 * @property {CellRange | undefined} selectedRange - Selected range.
 * @property {number} zoomFactor - Zoom factor of the selected sheet.
 * @property {(cell: string) => void} onCellClick - Callback called when a cell is clicked.
 * @property {((startCell: string, endCell: string, cells: string[]) => void) | undefined} onCellSelection - Callback called when a cell is selected.
 * @property {((colIndex: number, newWidth: number) => void) | undefined} onColumnResize - Callback called when a column in the active sheet gets resized.
 * @property {((rowIndex: number, newHeight: number) => void) | undefined} onRowResize - Callback called when a column in the active sheet gets resized.
 * @property {((scrollToCell: (cellAddress: string) => void) => void) | undefined} onScrollToCell - Callback called to scroll to a cell of a specific sheet.
 * @property {SpreadsheetHighlight | undefined} highlights - Source Highlights for all sheets.
 */
type SpreadsheetHtmlTableProps = {
    data: (string | null)[][];
    styles: Record<string, object>;
    merges: string[];
    colorThemes: ColorSchemeList | undefined;
    colWidths: number[];
    rowHeights: number[];
    showStyles: boolean;
    selectedCell?: string | undefined;
    selectedRange?: CellRange | undefined;
    zoomFactor: number;
    onCellClick: (cell: string) => void;
    onCellSelection?: ((startCell: string, endCell: string, cells: string[]) => void) | undefined;
    onColumnResize?: ((colIndex: number, newWidth: number) => void) | undefined;
    onRowResize?: ((rowIndex: number, newHeight: number) => void) | undefined;
    onScrollToCell?: ((scrollToCell: (cellAddress: string) => void) => void) | undefined;
    highlights?: SpreadsheetHighlight | undefined;
}

type Selection = {
    selectedHeaders: string[];
    selectedRowHeaders: number[];
}

interface ResizeState {
    isResizing: boolean;
    type: "column" | "row" | null;
    index: number | null;
    startPos: number;
    startSize: number;
}

interface DragSelectionState {
    isDragging: boolean;
    startCell: string | null;
    currentCell: string | null;
}

interface VirtualizationState {
    scrollTop: number;
    scrollLeft: number;
    containerHeight: number;
    containerWidth: number;
    visibleRowStartIndex: number;
    visibleRowEndIndex: number;
    visibleColStartIndex: number;
    visibleColEndIndex: number;
    overscan: number;
}

interface HighlightHoverState {
    hoveredRange: string | null;
}

/**
 * Component that renders the spreadsheet html table.
 *
 * @param {SpreadsheetHtmlTableProps} props - Props of the SpreadsheetHtmlTable component.
 * @returns {JSX.Element} The rendered component.
 */
function SpreadsheetHtmlTable({
    data,
    styles,
    merges,
    colWidths,
    rowHeights,
    showStyles,
    selectedCell,
    selectedRange,
    zoomFactor,
    colorThemes,
    onCellClick,
    onCellSelection,
    onColumnResize,
    onRowResize,
    onScrollToCell,
    highlights,
}: SpreadsheetHtmlTableProps) {
    const numRows: number = useMemo(() => data.length, [data]);
    const numCols: number = useMemo(() => {
        return data.reduce((acc, curr) => acc > curr.length ? acc : curr.length, 0) || 0;
    }, [data]);

    const [localColWidths, setLocalColWidths] = useState<number[]>(colWidths);
    const [localRowHeights, setLocalRowHeights] = useState<number[]>(rowHeights);
    const [resizeState, setResizeState] = useState<ResizeState>({
        isResizing: false,
        type: null,
        index: null,
        startPos: 0,
        startSize: 0
    });

    const [dragSelectionState, setDragSelectionState] = useState<DragSelectionState>({
        isDragging: false,
        startCell: null,
        currentCell: null
    });

    const [virtualizationState, setVirtualizationState] = useState<VirtualizationState>({
        scrollTop: 0,
        scrollLeft: 0,
        containerHeight: 0,
        containerWidth: 0,
        visibleRowStartIndex: 0,
        visibleRowEndIndex: Math.min(50, Math.max(0, data.length - 1)), // Adaptive to actual data size
        visibleColStartIndex: 0,
        visibleColEndIndex: 20,
        overscan: 10 // Increased overscan to reduce flickering
    });

    const [highlightHoverState, setHighlightHoverState] = useState<HighlightHoverState>({
        hoveredRange: null
    });

    const shiftedMerges = useMemo(() => getShiftedMerges(merges), [merges]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const tableRef = useRef<HTMLTableElement | null>(null);

    useEffect(() => {
        return () => {
            setLocalColWidths([]);
            setLocalRowHeights([]);
            setResizeState({
                isResizing: false,
                type: null,
                index: null,
                startPos: 0,
                startSize: 0
            });
            setDragSelectionState({
                isDragging: false,
                startCell: null,
                currentCell: null
            });
            setVirtualizationState({
                scrollTop: 0,
                scrollLeft: 0,
                containerHeight: 0,
                containerWidth: 0,
                visibleRowStartIndex: 0,
                visibleRowEndIndex: Math.min(50, Math.max(0, data.length - 1)), // Adaptive to actual data size
                visibleColStartIndex: 0,
                visibleColEndIndex: 20,
                overscan: 10 // Increased overscan to reduce flickering
            });
            setHighlightHoverState({
                hoveredRange: null
            });
        };
    }, []);

    useEffect(() => {
        return () => {
            if (cellStylesCache) {
                cellStylesCache.clear();
            }
            if (highlightBordersCache) {
                highlightBordersCache.clear();
            }
            // Note: highlightedCellsCache is a Set and will be garbage collected automatically
            // No need to manually clear it as it's recreated on each render
        };
    }, []);

    useEffect(() => {
        setLocalColWidths(colWidths);
    }, [colWidths]);

    useEffect(() => {
        setLocalRowHeights(rowHeights);
    }, [rowHeights]);

    const fullColWidths: number[] = useMemo(() => [80, ...localColWidths], [localColWidths]);
    const fullRowHeights: number[] = useMemo(() => [35, ...localRowHeights], [localRowHeights]);

    const rowPositions = useMemo(() => {
        return calculateRowPositions(fullRowHeights);
    }, [fullRowHeights]);

    const colPositions = useMemo(() => {
        return calculateColumnPositions(fullColWidths);
    }, [fullColWidths]);

    const visibleRowRange = useMemo(() => {
        // For small datasets (less than 50 rows), show all rows without virtualization
        if (numRows <= 50) {
            return {
                startIndex: 0,
                endIndex: Math.max(0, numRows - 1)
            };
        }

        const { startIndex, endIndex } = findVisibleRowRange(
            virtualizationState.scrollTop,
            virtualizationState.containerHeight,
            rowPositions,
            virtualizationState.overscan
        );

        const mergesAffectingRange = getMergesAffectingVisibleRowRange(startIndex, endIndex, shiftedMerges);
        const extendedRange = getAdditionalRowsForMerges(startIndex, endIndex, mergesAffectingRange);

        // Safety check for very large datasets
        const maxVisibleRows = numRows > 50000 ? 100 : numRows > 10000 ? 500 : 1000; // Adaptive limit based on dataset size
        const calculatedEndIndex = Math.min(numRows - 1, extendedRange.endIndex);
        const actualEndIndex = Math.min(calculatedEndIndex, extendedRange.startIndex + maxVisibleRows);

        return {
            startIndex: Math.max(0, extendedRange.startIndex),
            endIndex: actualEndIndex
        };
    }, [virtualizationState.scrollTop, virtualizationState.containerHeight, rowPositions, virtualizationState.overscan, shiftedMerges, numRows]);

    const visibleColRange = useMemo(() => {
        // For small datasets (less than 50 columns), show all columns without virtualization
        if (numCols <= 50) {
            return {
                startIndex: 0,
                endIndex: Math.max(0, numCols - 1)
            };
        }

        const { startIndex, endIndex } = findVisibleColumnRange(
            virtualizationState.scrollLeft,
            virtualizationState.containerWidth,
            colPositions,
            virtualizationState.overscan
        );

        const mergesAffectingRange = getMergesAffectingVisibleColumnRange(startIndex, endIndex, shiftedMerges);
        const extendedRange = getAdditionalColumnsForMerges(startIndex, endIndex, mergesAffectingRange);

        // Safety check for very large datasets
        const maxVisibleCols = numCols > 1000 ? 50 : numCols > 500 ? 200 : 500; // Adaptive limit based on dataset size
        const calculatedEndIndex = Math.min(numCols - 1, extendedRange.endIndex);
        const actualEndIndex = Math.min(calculatedEndIndex, extendedRange.startIndex + maxVisibleCols);

        return {
            startIndex: Math.max(0, extendedRange.startIndex),
            endIndex: actualEndIndex
        };
    }, [virtualizationState.scrollLeft, virtualizationState.containerWidth, colPositions, virtualizationState.overscan, shiftedMerges, numCols]);

    const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const scrollTop = target.scrollTop;
        const scrollLeft = target.scrollLeft;
        const containerHeight = target.clientHeight;
        const containerWidth = target.clientWidth;

        // Use requestAnimationFrame to prevent excessive updates
        requestAnimationFrame(() => {
            setVirtualizationState(prev => {
                // Only update if there's a significant change to prevent flickering
                const scrollThreshold = 2; // 2px threshold to reduce sensitivity
                const hasSignificantChange =
                    Math.abs(prev.scrollTop - scrollTop) > scrollThreshold ||
                    Math.abs(prev.scrollLeft - scrollLeft) > scrollThreshold ||
                    prev.containerHeight !== containerHeight ||
                    prev.containerWidth !== containerWidth;

                if (!hasSignificantChange) {
                    return prev;
                }

                return {
                    ...prev,
                    scrollTop,
                    scrollLeft,
                    containerHeight,
                    containerWidth
                };
            });
        });
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            setVirtualizationState(prev => ({
                ...prev,
                containerHeight: containerRef.current!.clientHeight,
                containerWidth: containerRef.current!.clientWidth
            }));
        }
    }, []);

    // Update virtualization state when data changes to ensure proper bounds
    useEffect(() => {
        setVirtualizationState(prev => ({
            ...prev,
            visibleRowEndIndex: Math.min(prev.visibleRowEndIndex, Math.max(0, data.length - 1))
        }));
    }, [data.length]);

    const { theme: currentTheme } = useTheme();
    const selectionColor: string = useMemo(() => currentTheme.selection, [currentTheme]);
    const selectionTextColor: string = useMemo(() => currentTheme.selectionText, [currentTheme]);
    const highlightColor: string = useMemo(() => currentTheme.highlight, [currentTheme]);

    const selectionBackgroundColor = useMemo(() => hexToRgba(selectionColor, 0.1), [selectionColor]);

    const cellStylesCache = useMemo(() => {
        return new Map<string, CellStyle>();
    }, [styles, currentTheme, highlights, merges, colorThemes]);

    const getCellStyleMemoized = useCallback((cellAddress: string): CellStyle => {
        if (cellStylesCache.has(cellAddress)) {
            return cellStylesCache.get(cellAddress)!;
        }

        const cellStyle = getCellStyle(cellAddress, styles, currentTheme, highlights, merges, colorThemes);
        cellStylesCache.set(cellAddress, cellStyle);
        return cellStyle;
    }, [cellStylesCache, styles, currentTheme, highlights, merges, colorThemes]);

    const highlightBordersCache = useMemo(() => {
        return new Map<string, { top: boolean; right: boolean; bottom: boolean; left: boolean }>();
    }, [highlights, merges]);

    const getHighlightBorderMemoized = useCallback((cellAddress: string) => {
        if (highlightBordersCache.has(cellAddress)) {
            return highlightBordersCache.get(cellAddress)!;
        }

        const border = getHighlightBorder(cellAddress, highlights, merges);
        highlightBordersCache.set(cellAddress, border);
        return border;
    }, [highlightBordersCache, highlights, merges]);

    const selectionBounds = useMemo(() => {
        if (!selectedRange || selectedRange.cells.length <= 1) {
            return null;
        }

        let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;

        for (const cell of selectedRange.cells) {
            const components = extractCellComponent(cell);
            if (components) {
                const row = components.row;
                const col = utils.decode_col(components.column);

                const { rowSpan: cellRowSpan, colSpan: cellColSpan } = getCellMergeSpan(row, col + 1, shiftedMerges);
                const cellEndRow = row + cellRowSpan - 1;
                const cellEndCol = col + cellColSpan - 1;

                minRow = Math.min(minRow, row);
                maxRow = Math.max(maxRow, cellEndRow);
                minCol = Math.min(minCol, col);
                maxCol = Math.max(maxCol, cellEndCol);
            }
        }

        return { minRow, maxRow, minCol, maxCol };
    }, [selectedRange, shiftedMerges]);

    const getSelectionBorder = useCallback((cellAddress: string): { top: boolean; right: boolean; bottom: boolean; left: boolean } => {
        if (!selectionBounds) {
            return { top: false, right: false, bottom: false, left: false };
        }

        const cellComponents = extractCellComponent(cellAddress);
        if (!cellComponents) return { top: false, right: false, bottom: false, left: false };

        const currentRow = cellComponents.row;
        const currentCol = cellComponents.column;

        const { rowSpan, colSpan } = getCellMergeSpan(currentRow, utils.decode_col(currentCol) + 1, shiftedMerges);

        const effectiveStartRow = currentRow;
        const effectiveEndRow = currentRow + rowSpan - 1;
        const effectiveStartCol = utils.decode_col(currentCol);
        const effectiveEndCol = utils.decode_col(currentCol) + colSpan - 1;

        const overlaps = !(effectiveEndRow < selectionBounds.minRow || effectiveStartRow > selectionBounds.maxRow ||
            effectiveEndCol < selectionBounds.minCol || effectiveStartCol > selectionBounds.maxCol);

        if (overlaps) {
            return {
                top: effectiveStartRow === selectionBounds.minRow,
                right: effectiveEndCol === selectionBounds.maxCol,
                bottom: effectiveEndRow === selectionBounds.maxRow,
                left: effectiveStartCol === selectionBounds.minCol
            };
        }

        return { top: false, right: false, bottom: false, left: false };
    }, [selectionBounds, shiftedMerges]);

    const selection: Selection | undefined = useMemo(() => {
        if (!selectedRange) {
            return {
                selectedHeaders: [],
                selectedRowHeaders: [],
            }
        }

        const selectedHeaders: string[] = [];
        const selectedRowHeaders: number[] = [];

        for (const cellAddress of selectedRange.cells) {
            const cellComponents = extractCellComponent(cellAddress);
            if (cellComponents) {
                selectedHeaders.push(cellComponents.column);
                selectedRowHeaders.push(cellComponents.row);

                const colIndex = cellComponents.column.charCodeAt(0) - 65;
                const { rowSpan, colSpan } = getCellMergeSpan(cellComponents.row, colIndex + 1, shiftedMerges);

                if (colSpan > 1 || rowSpan > 1) {
                    for (let colOffset = 1; colOffset < colSpan; colOffset++) {
                        const colIndex = cellComponents.column.charCodeAt(0) - 65 + colOffset;
                        const colLabel = getColumnLabel(colIndex);
                        selectedHeaders.push(colLabel);
                    }

                    for (let rowOffset = 1; rowOffset < rowSpan; rowOffset++) {
                        const rowNumber = cellComponents.row + rowOffset;
                        selectedRowHeaders.push(rowNumber);
                    }
                }
            }
        }

        return {
            selectedHeaders: [...new Set(selectedHeaders)],
            selectedRowHeaders: [...new Set(selectedRowHeaders)],
        };
    }, [selectedRange, shiftedMerges]);

    const handleMouseDown = useCallback((e: MouseEvent, cellAddress: string) => {
        e.preventDefault();
        setDragSelectionState({
            isDragging: true,
            startCell: cellAddress,
            currentCell: cellAddress
        });
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragSelectionState.isDragging || !dragSelectionState.startCell) return;

        const target = e.target as HTMLElement;
        const cellAddress = target.getAttribute("id");

        if (cellAddress && cellAddress !== dragSelectionState.currentCell) {
            setDragSelectionState(prev => ({
                ...prev,
                currentCell: cellAddress
            }));

            if (onCellSelection) {
                const cells = getCellsInRange(dragSelectionState.startCell, cellAddress);
                onCellSelection(dragSelectionState.startCell, cellAddress, cells);
            }
        }
    }, [dragSelectionState.isDragging, dragSelectionState.startCell, dragSelectionState.currentCell, onCellSelection]);

    const handleMouseUp = useCallback(() => {
        setDragSelectionState({
            isDragging: false,
            startCell: null,
            currentCell: null
        });
    }, []);

    useEffect(() => {
        if (dragSelectionState.isDragging) {
            // @ts-expect-error: input of handleMouseMove inferred
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "none";
        }

        return () => {
            // @ts-expect-error: input of handleMouseMove inferred
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
        };
    }, [dragSelectionState.isDragging, handleMouseMove, handleMouseUp]);

    const handleColumnResizeStart = useCallback((e: MouseEvent<HTMLDivElement>, colIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        setResizeState({
            isResizing: true,
            type: "column",
            index: colIndex,
            startPos: e.clientX,
            startSize: fullColWidths[colIndex + 1] || 150
        });
    }, [fullColWidths]);

    const handleRowResizeStart = useCallback((e: MouseEvent, rowIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        setResizeState({
            isResizing: true,
            type: "row",
            index: rowIndex,
            startPos: e.clientY,
            startSize: fullRowHeights[rowIndex + 1] || 60
        });
    }, [fullRowHeights]);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!resizeState.isResizing || resizeState.index === null) return;

        if (resizeState.type === "column") {
            const delta = e.clientX - resizeState.startPos;
            const newWidth = Math.max(20, resizeState.startSize + delta);

            setLocalColWidths(prev => {
                const newWidths = [...prev];
                newWidths[resizeState.index!] = newWidth;
                return newWidths;
            });
        } else if (resizeState.type === "row") {
            const delta = e.clientY - resizeState.startPos;
            const newHeight = Math.max(20, resizeState.startSize + delta);

            setLocalRowHeights(prev => {
                const newHeights = [...prev];
                newHeights[resizeState.index!] = newHeight;
                return newHeights;
            });
        }
    }, [resizeState]);

    const handleResizeEnd = useCallback(() => {
        if (!resizeState.isResizing || resizeState.index === null) return;

        if (resizeState.type === "column" && onColumnResize) {
            onColumnResize(resizeState.index, localColWidths[resizeState.index]);
        } else if (resizeState.type === "row" && onRowResize) {
            onRowResize(resizeState.index, localRowHeights[resizeState.index]);
        }

        setResizeState({
            isResizing: false,
            type: null,
            index: null,
            startPos: 0,
            startSize: 0
        });
    }, [resizeState, localColWidths, localRowHeights, onColumnResize, onRowResize]);



    useEffect(() => {
        if (resizeState.isResizing) {
            // @ts-expect-error: input of handleResizeMove inferred
            document.addEventListener("mousemove", handleResizeMove);
            document.addEventListener("mouseup", handleResizeEnd);
            document.body.style.cursor = resizeState.type === "column" ? "col-resize" : "row-resize";
            document.body.style.userSelect = "none";
        }

        return () => {
            // @ts-expect-error: input of handleResizeMove inferred
            document.removeEventListener("mousemove", handleResizeMove);
            document.removeEventListener("mouseup", handleResizeEnd);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [resizeState.isResizing, handleResizeMove, handleResizeEnd, resizeState.type]);

    const getColumnCells = useCallback((colIndex: number): string[] => {
        const cells: string[] = [];
        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            cells.push(getCellAddress(rowIndex, colIndex));
        }
        return cells;
    }, [numRows]);

    const getRowCells = useCallback((rowIndex: number): string[] => {
        const cells: string[] = [];
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            cells.push(getCellAddress(rowIndex, colIndex));
        }
        return cells;
    }, [numCols]);

    const handleColumnHeaderClick = useCallback((colIndex: number) => {
        const cells = getColumnCells(colIndex);
        if (onCellSelection && cells.length > 0) {
            onCellSelection(cells[0], cells[cells.length - 1], cells);
        }
    }, [getColumnCells, onCellSelection]);

    const handleRowHeaderClick = useCallback((rowIndex: number) => {
        const cells = getRowCells(rowIndex);
        if (onCellSelection && cells.length > 0) {
            onCellSelection(cells[0], cells[cells.length - 1], cells);
        }
    }, [getRowCells, onCellSelection]);

    const scrollToCell = useCallback((cellAddress: string) => {
        if (!containerRef.current) return;

        const cellComponents = extractCellComponent(cellAddress);
        if (!cellComponents) return;

        const rowIndex = cellComponents.row - 1;
        const colIndex = utils.decode_col(cellComponents.column);

        const targetScrollTop = rowPositions[rowIndex] || 0;
        const targetScrollLeft = colPositions[colIndex] || 0;

        const containerHeight = containerRef.current.clientHeight;
        const containerWidth = containerRef.current.clientWidth;

        const visibleRowRange = findVisibleRowRange(
            targetScrollTop,
            containerHeight,
            rowPositions,
            virtualizationState.overscan
        );

        const visibleColRange = findVisibleColumnRange(
            targetScrollLeft,
            containerWidth,
            colPositions,
            virtualizationState.overscan
        );

        setVirtualizationState(prev => ({
            ...prev,
            scrollTop: targetScrollTop,
            scrollLeft: targetScrollLeft,
            containerHeight,
            containerWidth,
            visibleRowStartIndex: Math.max(0, visibleRowRange.startIndex),
            visibleRowEndIndex: Math.min(numRows - 1, visibleRowRange.endIndex),
            visibleColStartIndex: Math.max(0, visibleColRange.startIndex),
            visibleColEndIndex: Math.min(numCols - 1, visibleColRange.endIndex)
        }));

        containerRef.current.scrollTo({
            top: targetScrollTop,
            left: targetScrollLeft,
            behavior: "smooth"
        });
    }, [rowPositions, colPositions, virtualizationState.overscan, numRows, numCols]);

    useEffect(() => {
        if (onScrollToCell && selectedCell) {
            onScrollToCell(scrollToCell);
        }
    }, [scrollToCell, onScrollToCell, selectedCell]);

    const highlightedCellsCache = useMemo(() => {
        const cache = new Set<string>();
        if (!highlights || !highlights.ranges) return cache;

        for (const range of highlights.ranges) {
            if (range) {
                const [startCell, endCell] = range.split(":");
                if (startCell) {
                    const cells = getCellsInRange(startCell, endCell || startCell);
                    cells.forEach(cell => cache.add(cell));
                }
            }
        }
        return cache;
    }, [highlights]);

    const isCellHighlighted = useCallback((cellAddress: string): boolean => {
        if (!highlightedCellsCache || !cellAddress) return false;
        return highlightedCellsCache.has(cellAddress);
    }, [highlightedCellsCache]);

    const getHighlightRangeForCell = useCallback((cellAddress: string): string | null => {
        if (!highlights || !highlights.ranges || !cellAddress) return null;

        for (const range of highlights.ranges) {
            if (range) {
                const [startCell, endCell] = range.split(":");
                if (startCell) {
                    const cells = getCellsInRange(startCell, endCell || startCell);
                    if (cells.includes(cellAddress)) {
                        return range;
                    }
                }
            }
        }
        return null;
    }, [highlights]);

    const handleCellMouseEnter = useCallback((cellAddress: string) => {
        const range = getHighlightRangeForCell(cellAddress);
        if (range) {
            setHighlightHoverState({ hoveredRange: range });
        }
    }, [getHighlightRangeForCell]);

    const handleCellMouseLeave = useCallback(() => {
        setHighlightHoverState({ hoveredRange: null });
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                overflow: "auto",
                width: "100%",
                height: "100%",
                display: "grid",
                transform: `scale(${zoomFactor / 100})`,
                transformOrigin: "top left",
                transition: zoomFactor !== 100 ? "transform 0.3s ease" : "none"
            }}
            onScroll={handleScroll}
        >
            <table
                ref={tableRef}
                style={{
                    borderCollapse: "collapse",
                    width: colPositions[colPositions.length - 1] || "max-content",
                    minWidth: "100%",
                    height: "inherit",
                    border: "unset",
                    backgroundColor: "white",
                }}
            >
                <colgroup>
                    {/* Row header column - always visible and sticky */}
                    <col style={{ width: fullColWidths[0] ?? DEFAULT_COLUMN_SIZE }} />
                    {/* Left spacer column for virtualization */}
                    {visibleColRange.startIndex > 0 && (
                        <col style={{ width: colPositions[visibleColRange.startIndex] ?? DEFAULT_COLUMN_SIZE }} />
                    )}
                    {/* Virtualized data columns */}
                    {fullColWidths.slice(visibleColRange.startIndex + 1, visibleColRange.endIndex + 2).map((w, i) => (
                        <col key={visibleColRange.startIndex + i} style={{ width: w ?? DEFAULT_COLUMN_SIZE }} />
                    ))}
                    {/* Right spacer column for virtualization */}
                    {visibleColRange.endIndex < numCols - 1 && (
                        <col style={{ width: colPositions[colPositions.length - 1] - colPositions[visibleColRange.endIndex + 1] }} />
                    )}
                </colgroup>
                <tbody>
                    {/* Header row */}
                    <tr style={{
                        height: fullRowHeights[0],
                        backgroundColor: currentTheme.surface,
                        position: "sticky",
                        left: 0,
                        top: -2,
                        zIndex: 10
                    }}>
                        <th style={{
                            background: currentTheme.headerBg,
                            borderRight: `2px solid ${currentTheme.stickyBorder}`,
                            borderBottom: `2px solid ${currentTheme.stickyBorder}`,
                            minWidth: 60,
                            height: 36,
                            position: "sticky",
                            left: 0,
                            top: -2,
                            zIndex: 10,
                            color: currentTheme.headerText,
                        }}></th>
                        {/* Left spacer cell for virtualization */}
                        {visibleColRange.startIndex > 0 && (
                            <th style={{ width: colPositions[visibleColRange.startIndex], padding: 0, border: "none" }}></th>
                        )}
                        {/* Virtualized column headers */}
                        {Array.from({ length: visibleColRange.endIndex - visibleColRange.startIndex + 1 }).map((_, virtualColIdx) => {
                            const actualColIdx = visibleColRange.startIndex + virtualColIdx;
                            const isHeaderSelected = selection?.selectedHeaders.includes(getColumnLabel(actualColIdx));
                            return (
                                <th
                                    key={actualColIdx}
                                    style={{
                                        position: "relative",
                                        background: isHeaderSelected ? selectionColor : currentTheme.headerBg,
                                        color: isHeaderSelected ? selectionTextColor : currentTheme.headerText,
                                        borderRight: `1px solid ${currentTheme.headerBorder}`,
                                        borderBottom: `1px solid ${currentTheme.headerBorder}`,
                                        fontWeight: isHeaderSelected ? "bold" : "normal",
                                        fontSize: 12,
                                        fontFamily: "var(--excel-viewer-ui-font)",
                                        textAlign: "center",
                                        width: fullColWidths[actualColIdx + 1] || MAX_COLUMN_SIZE,
                                        height: 36,
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                    onClick={() => handleColumnHeaderClick(actualColIdx)}
                                >
                                    {getColumnLabel(actualColIdx)}
                                    <div
                                        className={`excel-viewer-column-resize-handle ${resizeState.isResizing && resizeState.type === "column" && resizeState.index === actualColIdx ? "resizing" : ""}`}
                                        onMouseDown={(e) => handleColumnResizeStart(e, actualColIdx)}
                                    />
                                </th>
                            );
                        })}
                        {/* Right spacer cell for virtualization */}
                        {visibleColRange.endIndex < numCols - 1 && (
                            <th style={{ width: colPositions[colPositions.length - 1] - colPositions[visibleColRange.endIndex + 1], padding: 0, border: "none" }}></th>
                        )}
                    </tr>

                    {/* Top spacer row for virtualization - maintains scroll height */}
                    {visibleRowRange.startIndex > 0 && (
                        <tr style={{ height: rowPositions[visibleRowRange.startIndex] }}>
                            <td colSpan={1} style={{ padding: 0, border: "none" }}></td>
                            {/* Left spacer cell for virtualization */}
                            {visibleColRange.startIndex > 0 && (
                                <td style={{ width: colPositions[visibleColRange.startIndex], padding: 0, border: "none" }}></td>
                            )}
                            {/* Virtualized columns */}
                            <td colSpan={visibleColRange.endIndex - visibleColRange.startIndex + 1} style={{ padding: 0, border: "none" }}></td>
                            {/* Right spacer cell for virtualization */}
                            {visibleColRange.endIndex < numCols - 1 && (
                                <td style={{ width: colPositions[colPositions.length - 1] - colPositions[visibleColRange.endIndex + 1], padding: 0, border: "none" }}></td>
                            )}
                        </tr>
                    )}

                    {data.slice(visibleRowRange.startIndex, visibleRowRange.endIndex + 1).map((row, virtualRowIdx) => {
                        const actualRowIdx = visibleRowRange.startIndex + virtualRowIdx;
                        const isRowHeaderSelected = selection?.selectedRowHeaders.includes(actualRowIdx + 1);
                        return (
                            <tr key={actualRowIdx} style={{ height: fullRowHeights[actualRowIdx + 1] || 60 }}>
                                <th
                                    style={{
                                        backgroundColor: isRowHeaderSelected ? selectionColor : currentTheme.headerBg,
                                        color: isRowHeaderSelected ? selectionTextColor : currentTheme.headerText,
                                        border: `1px solid ${currentTheme.headerBorder}`,
                                        fontWeight: isRowHeaderSelected ? "bold" : "normal",
                                        fontSize: 12,
                                        fontFamily: "var(--excel-viewer-ui-font)",
                                        textAlign: "center",
                                        minWidth: 60,
                                        maxWidth: 150,
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 10,
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                    onClick={() => handleRowHeaderClick(actualRowIdx)}
                                >
                                    {actualRowIdx + 1}
                                    <div
                                        className={`excel-viewer-row-resize-handle ${resizeState.isResizing && resizeState.type === "row" && resizeState.index === actualRowIdx ? "resizing" : ""}`}
                                        onMouseDown={(e) => handleRowResizeStart(e, actualRowIdx)}
                                    />
                                </th>
                                {/* Left spacer cell for virtualization */}
                                {visibleColRange.startIndex > 0 && (
                                    <td style={{ width: colPositions[visibleColRange.startIndex], padding: 0, border: "none" }}></td>
                                )}
                                {/* Virtualized data cells */}
                                {row.slice(visibleColRange.startIndex, visibleColRange.endIndex + 1).map((cell, virtualColIdx) => {
                                    const actualColIdx = visibleColRange.startIndex + virtualColIdx;
                                    // Shifted for merges
                                    if (isCellCoveredByMerge(actualRowIdx + 1, actualColIdx + 1, shiftedMerges)) return null;
                                    const { rowSpan, colSpan } = getCellMergeSpan(actualRowIdx + 1, actualColIdx + 1, shiftedMerges);
                                    const cellAddress = getCellAddress(actualRowIdx, actualColIdx);

                                    const isInSelectedRange = selectedRange?.cells.includes(cellAddress);
                                    const isSelected = selectedCell === cellAddress || isInSelectedRange;

                                    const isFirstCellOfSelectedRange = cellAddress === selectedCell;

                                    const isHighlighted = isCellHighlighted(cellAddress);
                                    const highlightBorder = getHighlightBorderMemoized(cellAddress);

                                    const selectionBorder = getSelectionBorder(cellAddress);

                                    let highlightedRange = undefined;
                                    if (isHighlighted) {
                                        highlightedRange = highlights?.ranges ?
                                            highlights.ranges.find((range) => range.split(":")[0] === cellAddress)
                                            : undefined;
                                    }
                                    const cellStyle = getCellStyleMemoized(cellAddress);

                                    const resolvedTextRotation = cellStyle.textRotation ? cellStyle.textRotation * -1 : 0;

                                    return (
                                        <td
                                            key={actualColIdx}
                                            id={cellAddress}
                                            rowSpan={rowSpan}
                                            colSpan={colSpan > row.length - 1 ? row.length : colSpan}
                                            style={{
                                                ...(isCellInAMergeRangeAndNotTheStartCell(actualRowIdx + 1, actualColIdx + 1, cellAddress, shiftedMerges) ? { display: "none" } : {}),
                                                outline: selectedRange?.cells.length === 1 && isSelected ? `2px solid ${selectionColor}` : "none",
                                                outlineOffset: selectedRange?.cells.length === 1 && isSelected ? "0px" : "0",
                                                padding: "4px 8px",
                                                position: isSelected || highlightedRange ? "relative" : "static",
                                                maxWidth: MAX_COLUMN_CONTENT_SIZE,
                                                cursor: "cell",
                                                whiteSpace: cellStyle.wrapText ? "normal" : "nowrap",
                                                borderTop: selectionBorder.top ? `2px solid ${selectionColor}` : (highlightBorder.top ? `3px solid ${highlightColor}` : `1px solid ${currentTheme.cellBorder}`),
                                                borderRight: selectionBorder.right ? `2px solid ${selectionColor}` : (highlightBorder.right ? `3px solid ${highlightColor}` : `1px solid ${currentTheme.cellBorder}`),
                                                borderBottom: selectionBorder.bottom ? `2px solid ${selectionColor}` : (highlightBorder.bottom ? `3px solid ${highlightColor}` : `1px solid ${currentTheme.cellBorder}`),
                                                borderLeft: selectionBorder.left ? `2px solid ${selectionColor}` : (highlightBorder.left ? `3px solid ${highlightColor}` : `1px solid ${currentTheme.cellBorder}`),
                                                backgroundColor: !showStyles && isSelected ? selectionBackgroundColor : undefined,
                                                opacity: (isHighlighted && !highlightedRange) ? 0.40 : 1,
                                                color: "var(--excel-viewer-default-cell-text)",
                                                ...(showStyles ? {
                                                    color: cellStyle.color,
                                                    backgroundColor: isSelected && !isFirstCellOfSelectedRange ? `${cellStyle.backgroundColor}60` : cellStyle.backgroundColor,
                                                    verticalAlign: cellStyle.verticalAlign,
                                                    borderTop: selectionBorder.top ? `2px solid ${selectionColor}` : cellStyle.borderTop,
                                                    borderRight: selectionBorder.right ? `2px solid ${selectionColor}` : cellStyle.borderRight,
                                                    borderBottom: selectionBorder.bottom ? `2px solid ${selectionColor}` : cellStyle.borderBottom,
                                                    borderLeft: selectionBorder.left ? `2px solid ${selectionColor}` : cellStyle.borderLeft,
                                                } : {}),
                                            }}
                                            onClick={() => onCellClick(cellAddress)}
                                            onMouseDown={(e) => handleMouseDown(e, cellAddress)}
                                            onMouseEnter={() => handleCellMouseEnter(cellAddress)}
                                            onMouseLeave={handleCellMouseLeave}
                                        >
                                            <div
                                                style={{
                                                    position: "relative",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    ...(showStyles ? {
                                                        fontWeight: cellStyle.fontWeight,
                                                        fontStyle: cellStyle.fontStyle,
                                                        fontFamily: cellStyle.fontFamily,
                                                        fontSize: cellStyle.fontSize,
                                                        color: cellStyle.color,
                                                        textDecoration: cellStyle.underline ? "underline" : "none",
                                                        textAlign: cellStyle.textAlign,
                                                        transform: resolvedTextRotation !== 0 ? `rotateZ(${resolvedTextRotation}deg)` : "none",
                                                    } : {}),
                                                }}
                                            >
                                                {cellStyle.strikeThrough && showStyles ? <s>{cell}</s> : cell}
                                            </div>
                                            {highlightedRange && highlightHoverState.hoveredRange === highlightedRange ? (
                                                <div
                                                    id="first-cell-highlight"
                                                    style={{
                                                        position: "absolute",
                                                        top: -1,
                                                        left: -1,
                                                        backgroundColor: highlightColor,
                                                        fontSize: "14px",
                                                        fontWeight: 400,
                                                        color: "white",
                                                        padding: "4px 8px",
                                                        borderBottomRightRadius: "6px",
                                                        zIndex: 5,
                                                    }}>
                                                    Highlighted range: {highlightedRange}
                                                </div>
                                            ) : null}
                                            {/* {isSelected && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        bottom: "0px",
                                                        right: "0px",
                                                        width: "6px",
                                                        height: "6px",
                                                        backgroundColor: selectionColor,
                                                        // border: "1px solid white",
                                                        cursor: "nw-resize",
                                                        zIndex: 9,
                                                    }}
                                                />
                                            )} */}
                                        </td>
                                    );
                                })}
                                {/* Right spacer cell for virtualization */}
                                {visibleColRange.endIndex < numCols - 1 && (
                                    <td style={{ width: colPositions[colPositions.length - 1] - colPositions[visibleColRange.endIndex + 1], padding: 0, border: "none" }}></td>
                                )}
                            </tr>
                        );
                    })}

                    {/* Bottom spacer row for virtualization - maintains scroll height */}
                    {visibleRowRange.endIndex < numRows - 1 && (
                        <tr style={{ height: rowPositions[rowPositions.length - 1] - rowPositions[visibleRowRange.endIndex + 1] }}>
                            <td colSpan={1} style={{ padding: 0, border: "none" }}></td>
                            {/* Left spacer cell for virtualization */}
                            {visibleColRange.startIndex > 0 && (
                                <td style={{ width: colPositions[visibleColRange.startIndex], padding: 0, border: "none" }}></td>
                            )}
                            {/* Virtualized columns */}
                            <td colSpan={visibleColRange.endIndex - visibleColRange.startIndex + 1} style={{ padding: 0, border: "none" }}></td>
                            {/* Right spacer cell for virtualization */}
                            {visibleColRange.endIndex < numCols - 1 && (
                                <td style={{ width: colPositions[colPositions.length - 1] - colPositions[visibleColRange.endIndex + 1], padding: 0, border: "none" }}></td>
                            )}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
SpreadsheetHtmlTable.displayName = "SpreadsheetHtmlTable";

export default SpreadsheetHtmlTable;
