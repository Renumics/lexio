import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import SheetTabs from "./SheetTabs";
import SpreadsheetHtmlTable from "./SpreadsheetHtmlTable.tsx";
import { DEFAULT_ZOOM_FACTOR } from "./utils";
import {ExcelViewerConfig, SelectedCells, SpreadsheetData, SpreadsheetHighlight} from "./types.ts";
import "./SpreadsheetViewerContainer.css";
import ToolbarSection from "./ToolbarSection";

/**
 * Props for the SpreadsheetViewerContainer component
 *
 * @type SpreadsheetViewerContainerProps
 * @property {SpreadsheetData} data - Workbook data.
 * @property {SpreadsheetHighlight[]} rangesToHighlight - Ranges for highlight.
 * @property {string | undefined} defaultSelectedSheet - Optional name of the default selected sheet.
 * @property {boolean} showSearchbar - Show/Hide search bar.
 * @property {boolean} showNotifications - Show/Hide notification bell icon.
 * @property {ExcelViewerConfig["viewSettings"]} viewSettings - view setting to show/hide items in the toolbar.
 * @property {boolean} showOptionToolbar - Show/hide the whole option toolbar.
 */
type SpreadsheetViewerContainerProps = Omit<ExcelViewerConfig, "colorScheme"> & {
    data: SpreadsheetData;
    rangesToHighlight: SpreadsheetHighlight[];
    defaultSelectedSheet?: string | undefined;
}
/**
 * Component that renders the SpreadsheetViewerContainer component.
 *
 * @param {SpreadsheetViewerContainerProps} props - Props of the SpreadsheetViewerContainer component.
 * @returns {JSX.Element} The rendered component.
 */
const SpreadsheetViewerContainer = ({
                                  data,
                                  rangesToHighlight,
                                  defaultSelectedSheet,
                                  showSearchbar,
                                  showNotifications,
                                  viewSettings,
                                  showOptionToolbar,
                                  showWorkbookDetails,
                              }: SpreadsheetViewerContainerProps) => {
    const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
    const activeSheet = useMemo(() => data.sheets[activeSheetIndex], [data.sheets, activeSheetIndex]);
    const [selectedCells, setSelectedCells] = useState<SelectedCells | undefined>(undefined);
    const [showStyles, setShowStyles] = useState<boolean>(true);
    const [localColWidths, setLocalColWidths] = useState<number[]>(activeSheet.colWidths);
    const [localRowHeights, setLocalRowHeights] = useState<number[]>(activeSheet.rowHeights);
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM_FACTOR);
    const [showHighlights, setShowHighlights] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const excelTableContainerRef = useRef<HTMLDivElement | null>(null);
    const scrollToCellRef = useRef<((cellAddress: string) => void) | null>(null);

    useEffect(() => {
        return () => {
            setActiveSheetIndex(0);
            setSelectedCells(undefined);
            setShowStyles(true);
            setLocalColWidths([]);
            setLocalRowHeights([]);
            setZoom(DEFAULT_ZOOM_FACTOR);
            setShowHighlights(true);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (data?.fileName) {
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.includes(data.fileName) && key.includes("temp")) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            }
        };
    }, [data?.fileName]);

    const highlightsOfSelectedSheet = useMemo(() => {
        if (!rangesToHighlight) return undefined;
        return rangesToHighlight.find((highlight) => highlight.sheetName === activeSheet.name);
    }, [rangesToHighlight, activeSheet.name]);

    useEffect(() => {
        setActiveSheetIndex(defaultSelectedSheet ? data.sheets.findIndex((sheet) => sheet.name === defaultSelectedSheet) : 0);
    }, [data.sheets, defaultSelectedSheet]);

    useEffect(() => {
        setSelectedCells(
            data.sheets
                .map((sheet) => sheet.name)
                .reduce((acc, sheetName) => {
                    const cachedCell = localStorage.getItem(`${data.fileName}-selectedCell-${sheetName}`);
                    if (cachedCell) {
                        const parsedCell = cachedCell.replace(/"/g, "");
                        acc[sheetName] = {
                            startCell: parsedCell,
                            endCell: parsedCell,
                            cells: [parsedCell]
                        };
                    }
                    return acc;
                }, {} as SelectedCells)
        );
    }, [activeSheet]);

    useEffect(() => {
        setLocalColWidths(activeSheet.colWidths);
        setLocalRowHeights(activeSheet.rowHeights);
    }, [activeSheet]);

    const handleSheetChange = (index: number) => {
        setActiveSheetIndex(index)
    }

    const handleCellClick = useCallback((cell: string, sheetName: string) => {
        const cellRange = {
            startCell: cell,
            endCell: cell,
            cells: [cell],
        };
        localStorage.setItem(`${data.fileName}-selectedCell-${sheetName}`, cell);
        setSelectedCells((prev) => ({ ...prev, [sheetName]: cellRange }));
    }, [data.fileName, setSelectedCells]);

    const handleCellSelection = useCallback((startCell: string, endCell: string, cells: string[]) => {
        const sheetName = activeSheet.name;
        const cellRange = {
            startCell,
            endCell,
            cells
        };
        setSelectedCells((prev) => ({ ...prev, [sheetName]: cellRange }));
    }, [activeSheet.name]);

    const handleColumnResize = useCallback((colIndex: number, newWidth: number) => {
        setLocalColWidths(prev => {
            const newWidths = [...prev];
            newWidths[colIndex] = newWidth;
            return newWidths;
        });
    }, []);

    const handleRowResize = useCallback((rowIndex: number, newHeight: number) => {
        setLocalRowHeights(prev => {
            const newHeights = [...prev];
            newHeights[rowIndex] = newHeight;
            return newHeights;
        });
    }, []);

    const handleScrollToCell = useCallback((scrollToCell: (cellAddress: string) => void) => {
        scrollToCellRef.current = scrollToCell;
    }, []);

    useEffect(() => {
        if (!showOptionToolbar) {
            document.documentElement.style.setProperty("--excel-viewer-viewer-container-row-layout", "max-content max-content");
        }
        document.documentElement.style.setProperty("--excel-viewer-viewer-container-row-layout", "max-content 1fr max-content");
    }, [showOptionToolbar]);

    return (
        <div ref={containerRef} className="excel-viewer-root excel-viewer-viewer-container">
            <ToolbarSection
                showSearchbar={showSearchbar}
                showNotifications={showNotifications}
                viewSettings={viewSettings}
                showOptionToolbar={showOptionToolbar}
                zoom={zoom}
                setZoom={setZoom}
                excelTableContainerRef={excelTableContainerRef}
                selectedCells={selectedCells}
                setSelectedCells={setSelectedCells}
                data={data}
                activeSheet={activeSheet}
                setActiveSheetIndex={setActiveSheetIndex}
                handleCellClick={handleCellClick}
                scrollToCellRef={scrollToCellRef}
                highlightsOfSelectedSheet={highlightsOfSelectedSheet}
                containerRef={containerRef}
                showHighlights={showHighlights}
                setShowHighlights={setShowHighlights}
                showStyles={showStyles}
                setShowStyles={setShowStyles}
                showWorkbookDetails={showWorkbookDetails}
                rangesToHighlight={rangesToHighlight}
            />
            <div ref={excelTableContainerRef} className="excel-viewer-table-container">
                <div className="excel-viewer-grid-container">
                    <SpreadsheetHtmlTable
                        data={activeSheet.data}
                        merges={activeSheet.merges}
                        styles={activeSheet.styles}
                        colWidths={localColWidths}
                        rowHeights={localRowHeights}
                        showStyles={showStyles}
                        zoomFactor={zoom}
                        colorThemes={activeSheet.colorThemes}
                        selectedCell={selectedCells?.[activeSheet.name]?.startCell}
                        selectedRange={selectedCells?.[activeSheet.name]}
                        onCellClick={(cell) => handleCellClick(cell, activeSheet.name)}
                        onCellSelection={handleCellSelection}
                        onColumnResize={handleColumnResize}
                        onRowResize={handleRowResize}
                        onScrollToCell={handleScrollToCell}
                        highlights={showHighlights ? highlightsOfSelectedSheet : undefined}
                    />
                </div>
            </div>
            <SheetTabs
                sheets={data.sheets}
                activeIndex={activeSheetIndex}
                onSheetChange={handleSheetChange}
            />
        </div>
    );
};
SpreadsheetViewerContainer.displayName = "SpreadsheetViewerContainer";

export default SpreadsheetViewerContainer;
