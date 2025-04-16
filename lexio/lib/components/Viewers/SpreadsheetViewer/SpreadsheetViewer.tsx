import {SpreadsheetSelection} from "./SpreadsheetSelection";
import {LoaderCircle, Sigma} from "lucide-react";
import ParentSizeObserver from "./ParentSizeObserver.tsx";
import {TableContainer} from "./RowAndColumnVirtualizer.tsx";
import Tooltip from "./ui/Tooltip.tsx";
import {SpreadsheetHighlight} from "../../../types.ts";
import {DependenciesLoader} from "./DependenciesLoader.tsx";
import {useCallback, useMemo} from "react";
import {SpreadsheetViewerContextProvider, useSpreadsheetViewerContext} from "./SpreadsheetViewerContext.tsx";
import {SpreadsheetTheme} from "./useSpreadsheetStore.tsx";

/**
 * Props for the SpreadsheetViewer component
 * @typedef {Object} Props
 * @property {string} [fileName] - Optional name of the spreadsheet file
 * @property {ArrayBuffer} fileBufferArray - The spreadsheet file contents as an ArrayBuffer
 * @property {string} [defaultSelectedSheet] - Optional name of sheet to select by default
 * @property {SpreadsheetHighlight[]} [rangesToHighlight] - Optional cell ranges to highlight
 * @property {SpreadsheetTheme | undefined} [styleOverrides] - Optional styles override
 */
type SpreadsheetViewerProps = {
    fileName?: string | undefined;
    fileBufferArray: ArrayBuffer;
    defaultSelectedSheet?: string | undefined;
    rangesToHighlight?: SpreadsheetHighlight[] | undefined;
    styleOverrides?: SpreadsheetTheme | undefined;
}

/**
 * A component for displaying spreadsheet documents with interactive viewing capabilities.
 * Used to render Excel and other spreadsheet formats with support for sheet selection and cell highlighting.
 *
 * If no `defaultSelectedSheet` is provided, the component will select the first available sheet.
 * 
 * The 'xlsx' format is supported.
 * 
 * @component
 * @param {SpreadsheetViewerProps} props - The props for the SpreadsheetViewer
 * @returns {JSX.Element} A spreadsheet viewer with sheet selection and cell highlighting
 * 
 * @remarks
 * **Features:**
 * - Multiple sheet navigation with sheet selection
 * - Single cell selection
 * - Support for cell range highlighting via `rangesToHighlight` prop. Use 'B4:B4' to highlight a single cell.
 * - Virtualized rendering for performance with large spreadsheets
 * - Compatible with Excel file formats (xlsx)
 * - Formula display in toolbar
 * - Cell metadata inspection
 * - Responsive design with dynamic sizing
 * - Customizable theming
 *
 * **Keyboard Navigation:**
 * - Arrow keys for cell navigation
 * 
 * **Styling:**
 * - Customizable theming with `styleOverrides` prop
 * 
 * @example
 *
 * ```tsx
 * <SpreadsheetViewer
 *   fileName="Call Center Data"
 *   fileBufferArray={excelData as ArrayBuffer}
 *   defaultSelectedSheet="Call Center Data"
 *   rangesToHighlight={[
 *     { 
 *       sheetName: "Call Center Data",
 *       ranges: ["B4:B4", "B8:F8"] 
 *     }
 *   ]}
 * />
 * ```
 * 
 * **Underlying Libraries:**
 * The SpreadsheetViewer combines **ExcelJS** for Excel parsing and **SheetJS** for broader format support, with **TanStack Table** and **Virtual** for efficient rendering of large datasets.
 * 
 */
const SpreadsheetViewer= ({ fileBufferArray, defaultSelectedSheet, rangesToHighlight, styleOverrides }: SpreadsheetViewerProps) => {
    return (
        <DependenciesLoader>
            {(dependencies) =>
                <SpreadsheetViewerContextProvider
                    fileBufferArray={fileBufferArray}
                    defaultSelectedSheet={defaultSelectedSheet}
                    rangesToHighlight={rangesToHighlight}
                    tanstackTable={dependencies.tanstackTable}
                    tanstackVirtual={dependencies.tanstackVirtual}
                    excelJs={dependencies.excelJs}
                    sheetJs={dependencies.sheetJs}
                    styleOverrides={styleOverrides}
                >
                    <SpreadsheetWrapper />
                </SpreadsheetViewerContextProvider>
            }
        </DependenciesLoader>
    );
};
SpreadsheetViewer.displayName = "SpreadsheetViewer";

const SpreadsheetWrapper = () => {
    const {
        selectedWorksheetName,
        rangeToSelect,
        selectedCell,
        setSelectedCell,
        setSelectedWorksheetName,
        sheetNames,
        isLoading,
        error,
        columns,
        rowData,
        headerStyles,
        mergedGroupOfSelectedWorksheet,
        getMetaDataOfSelectedCell,
        selectedRange,
        setSelectedRange,
        spreadsheetTheme,
    } = useSpreadsheetViewerContext();

    const switchSpreadsheet = (spreadsheet: string) => {
        setSelectedWorksheetName(spreadsheet);
        setSelectedCell(undefined);
        setSelectedRange(undefined);
    }

    const computeMetadataOfSelectedCell = (): string => {
        const metaData = getMetaDataOfSelectedCell();
        if (metaData?.f) return `${metaData?.f}`;
        if (metaData?.v) return `${metaData?.v}`;
        return "";
    }

    const cellMetaData = computeMetadataOfSelectedCell();

    const resolveSelectedRange = useCallback((): string => {
        if (!selectedRange && !selectedCell) {
            return "";
        }
        if (!selectedRange && selectedCell) {
            return `${selectedCell.column}${selectedCell.row}`;
        }
        if (selectedRange && selectedCell && (selectedRange[0] === selectedRange[1])) {
            return `${selectedCell.column}${selectedCell.row}`;
        }
        if (selectedRange && selectedCell && (selectedRange[0] !== selectedRange[1])) {
            return `${selectedRange[0]}${selectedRange[1]}`;
        }
        return "";
    }, [selectedCell, selectedRange])

    const selectedCellRange = useMemo(() => {
        return resolveSelectedRange();
    }, [resolveSelectedRange]);

    if (error) {
        console.error(error);
        return <div style={{ color: spreadsheetTheme.error }}>Failed to load spreadsheet</div>
    }

    return (
        <div
            className="grid grid-rows-[max-content_1fr_55px] h-full"
            style={{
                background: spreadsheetTheme.background,
                color: spreadsheetTheme.onBackground,
                borderRadius: spreadsheetTheme.borderRadius,
            }}
        >
            <div className="grid p-2 gap-2 border-b">
                <div className="grid grid-cols-[max-content_1fr] gap-2">
                    <Tooltip
                        tooltipContent={selectedCellRange}
                        shouldNotDisplayCondition={selectedCellRange.length === 0}
                        className="flex items-center content-center w-[100px] py-1.5 px-2.5 border text-sm h-[35px]"
                        style={{
                            borderRadius: spreadsheetTheme.borderRadius,
                            color: spreadsheetTheme.toolbarForeground,
                        }}
                    >
                        <div className="truncate">
                            {selectedCellRange}
                        </div>
                    </Tooltip>
                    <div className="grid grid-cols-[max-content_1fr] gap-1.5 items-center content-center">
                        <div className="flex items-center content-center gap-1 align-middle">
                            <Sigma className="size-5" style={{ color: spreadsheetTheme.toolbarForeground }} />
                            <div style={{ color: spreadsheetTheme.toolbarForeground }}>=</div>
                        </div>
                        <Tooltip
                            className="min-h-4 py-1.5 px-2.5 border text-sm truncate h-[35px]"
                            tooltipContent={cellMetaData}
                            shouldNotDisplayCondition={cellMetaData.length === 0}
                            style={{
                                borderRadius: spreadsheetTheme.borderRadius,
                                color: spreadsheetTheme.toolbarForeground,
                            }}
                        >
                            {cellMetaData}
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div className="h-full w-full">
                {isLoading ?
                    <div className="grid items-center content-center justify-center justify-items-center">
                        <div
                            className="flex flex-col m-[auto] gap-1 justify-center justify-items-center content-center items-center text-center">
                            <LoaderCircle className="animate-spin" strokeWidth={1.5}/>
                            <div className="text-center">Loading spreadsheet</div>
                        </div>
                    </div> :
                    <div className="grid h-[inherit] w-full">
                        <ParentSizeObserver className="overflow-auto">
                            {(parentSize) =>
                                <TableContainer
                                    columns={columns}
                                    data={rowData.filter(r => r)}
                                    showStyles={true}
                                    headerStyles={headerStyles}
                                    selectedCell={selectedCell}
                                    rangesToSelect={rangeToSelect}
                                    setSelectedCell={setSelectedCell}
                                    parentContainerHeight={parentSize.height}
                                    mergedGroupOfSelectedWorksheet={mergedGroupOfSelectedWorksheet}
                                    selectedSheetName={selectedWorksheetName}
                                    setSelectedRange={setSelectedRange}
                                />
                            }
                        </ParentSizeObserver>
                    </div>
                }
            </div>
            <div className="whitespace-nowrap p-2 z-[10] h-full w-full border-t">
                <div className="grid h-[inherit] w-full">
                    <ParentSizeObserver className="h-full w-full overflow-x-auto overflow-y-hidden">
                        {(parentSize) =>
                            <SpreadsheetSelection
                                spreadsheets={sheetNames}
                                selectedSpreadsheet={selectedWorksheetName}
                                setSelectedSpreadsheet={switchSpreadsheet}
                                disabled={isLoading}
                                parentWidth={parentSize.width}
                            />
                        }
                    </ParentSizeObserver>
                </div>
            </div>
        </div>
    );
};
SpreadsheetWrapper.displayName = "SpreadsheetWrapper";

export {SpreadsheetViewer};
