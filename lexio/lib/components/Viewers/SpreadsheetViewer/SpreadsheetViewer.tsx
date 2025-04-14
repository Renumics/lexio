import {useSpreadsheetViewerStore} from "./useSpreadsheetStore.tsx";
import {SpreadsheetSelection} from "./SpreadsheetSelection";
import {LoaderCircle, Sigma} from "lucide-react";
import ParentSizeObserver from "./ParentSizeObserver.tsx";
import {TableContainer} from "./RowAndColumnVirtualizer.tsx";
import Tooltip from "./ui/Tooltip.tsx";
import {SpreadsheetHighlight} from "../../../types.ts";
import {DependenciesLoader} from "./DependenciesLoader.tsx";
import * as ReactTable from "@tanstack/react-table";
import * as ReactVirtual from "@tanstack/react-virtual";
import type * as ExcelJs from "exceljs";
import type * as SheetJs from "xlsx";

/**
 * Props for the SpreadsheetViewer component
 * @typedef {Object} Props
 * @property {string} [fileName] - Optional name of the spreadsheet file
 * @property {ArrayBuffer} fileBufferArray - The spreadsheet file contents as an ArrayBuffer
 * @property {string} [defaultSelectedSheet] - Optional name of sheet to select by default
 * @property {SpreadsheetHighlight[]} [rangesToHighlight] - Optional cell ranges to highlight
 */
type SpreadsheetViewerProps = {
    fileName?: string | undefined;
    fileBufferArray: ArrayBuffer;
    defaultSelectedSheet?: string | undefined;
    rangesToHighlight?: SpreadsheetHighlight[] | undefined;
}

/**
 * TODO: create complete documentation for this component -> will be shown in the storybook!!!
 * 
 * A component for displaying spreadsheet documents with interactive viewing capabilities.
 * Used to render Excel and other spreadsheet formats with support for sheet selection and cell highlighting.
 *
 * If no `defaultSelectedSheet` is provided, the component will select the first available sheet.
 * 
 * @component
 * @param {SpreadsheetViewerProps} props - The props for the SpreadsheetViewer
 * @returns {JSX.Element} A spreadsheet viewer with sheet selection and cell highlighting
 * 
 * @remarks
 * **Features:**
 * - Multiple sheet navigation
 * - Cell selection
 * - Support for cell range highlighting
 * - Virtualized rendering for performance with large spreadsheets
 * - Compatible with Excel file formats
 *
 * @example
 *
 * ```tsx
 * <SpreadsheetViewer
 *   fileName="Financial Report"
 *   fileBufferArray={excelData as ArrayBuffer}
 *   defaultSelectedSheet="Q1 Results"
 *   rangesToHighlight={[
 *     { sheetName: "Q1 Results", ranges: ["A1:B5", "D10:F20"] }
 *   ]}
 * />
 * ```
 */
const SpreadsheetViewer= ({ fileBufferArray, defaultSelectedSheet, rangesToHighlight }: SpreadsheetViewerProps) => {
    return (
        <DependenciesLoader>
            {(dependencies) =>
                <SpreadsheetWrapper
                    fileBufferArray={fileBufferArray}
                    defaultSelectedSheet={defaultSelectedSheet}
                    rangesToHighlight={rangesToHighlight}
                    tanstackVirtual={dependencies.tanstackVirtual}
                    tanstackTable={dependencies.tanstackTable}
                    excelJs={dependencies.excelJs}
                    sheetJs={dependencies.sheetJs}
                />
            }
        </DependenciesLoader>
    );
};
SpreadsheetViewer.displayName = "SpreadsheetViewer";

type SpeadsheetWrapperProps = {
    fileName?: string | undefined;
    fileBufferArray: ArrayBuffer;
    defaultSelectedSheet?: string | undefined;
    rangesToHighlight?: SpreadsheetHighlight[] | undefined;
    tanstackTable: typeof ReactTable;
    tanstackVirtual: typeof ReactVirtual;
    excelJs: typeof ExcelJs;
    sheetJs: typeof SheetJs;
}
const SpreadsheetWrapper = (
    {
        fileBufferArray,
        defaultSelectedSheet,
        rangesToHighlight,
        tanstackVirtual,
        tanstackTable,
        excelJs,
        sheetJs,
    }: SpeadsheetWrapperProps) => {
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
    } = useSpreadsheetViewerStore({
        fileBufferArray,
        defaultSelectedSheet,
        rangesToHighlight,
        tanstackTable: tanstackTable,
        excelJs: excelJs,
        sheetJs: sheetJs,
    });
    // TODO 4: Load the theme and apply styles - take PDFViewer / others as reference. Be consistent with the theme.

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

    const resolveSelectedRange = (): string => {
        if (!selectedRange && selectedCell) {
            return `${selectedCell.column}${selectedCell.row}`;
        }
        if (selectedRange && selectedCell && (selectedRange[0] === selectedRange[1])) {
            return `${selectedCell.column}${selectedCell.row}`;
        }
        if (selectedRange) {
            return `${selectedRange[0]}:${selectedRange[1]}`
        }
        return "";
    }

    const selectedCellRange = resolveSelectedRange();

    if (isLoading) {
        return (
            <div className="grid m-[auto] justify-center content-center items-center">
                <LoaderCircle className="animate-spin" strokeWidth={1.5} />
                <div>Loading excel file</div>
            </div>
        )
    }

    if (error) {
        console.error(error);
        return <div className="text-red-600">Failed to load spreadsheet</div>
    }

    return (
        <div className="grid grid-rows-[max-content_1fr_max-content] h-full">
            <div className="grid grid-cols-[1fr_max-content] p-2 gap-2 border-b">
                <div className="grid grid-cols-[max-content_1fr] gap-2">
                    <Tooltip
                        tooltipContent={selectedCellRange}
                        shouldNotDisplayCondition={selectedCellRange.length === 0}
                        className="flex items-center content-center w-[100px] py-1.5 px-2.5 border text-sm text-neutral-600 h-[35px]"
                        style={{
                            borderRadius: "5px"
                        }}
                    >
                        <div className="truncate">
                            {selectedCellRange}
                        </div>
                    </Tooltip>
                    <div className="grid grid-cols-[max-content_1fr] gap-1.5 items-center content-center">
                        <div className="flex items-center content-center gap-1 align-middle">
                            <Sigma className="size-5 text-neutral-600" />
                            <div className="text-neutral-600">=</div>
                        </div>
                        <Tooltip
                            className="min-h-4 py-1.5 px-2.5 border text-sm text-neutral-600 truncate h-[35px]"
                            tooltipContent={cellMetaData}
                            shouldNotDisplayCondition={cellMetaData.length === 0}
                            style={{
                                borderRadius: "5px"
                            }}
                        >
                            {cellMetaData}
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div className="h-full w-full">
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
                                tanstackTable={tanstackTable}
                                tanstackVirtual={tanstackVirtual}
                                sheetJs={sheetJs}
                            />
                        }
                    </ParentSizeObserver>
                </div>
            </div>
            <div className="whitespace-nowrap p-2 z-[10] h-full w-full border-t">
                <div className="grid h-[inherit] w-full">
                    <ParentSizeObserver className="h-full w-full overflow-x-auto overflow-y-hidden">
                        {(parentSize) =>
                            <SpreadsheetSelection
                                spreadsheets={sheetNames}
                                selectedSpreadsheet={selectedWorksheetName}
                                setSelectedSpreadsheet={switchSpreadsheet}
                                parentWidth={parentSize.width}
                                parentHeight={parentSize.height}
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
