import {FC, useState} from "react";
import {useSpreadsheetViewerStore} from "./useSpreadsheetStore.tsx";
// import {SpreadsheetTable} from "./SpreadsheetTable.tsx";
import {Cell} from "@tanstack/react-table";
import {CellContent} from "./utils";
import {SpreadsheetSelection} from "./SpreadsheetSelection";
import { LoaderCircle } from "lucide-react";
import ParentSizeObserver from "./ParentSizeObserver.tsx";
import { EyeOff, Eye } from "lucide-react";
import {TableContainer} from "./RowAndColumnVirtualizer.tsx";
import { Sigma } from "lucide-react";
import Tooltip from "./ui/Tooltip.tsx";

type Props = {
    fileName?: string | undefined;
    fileBufferArray: ArrayBuffer;
    defaultSelectedSheet?: string | undefined;
    rangesToHighlight?: string[] | undefined;
}
const SpreadsheetViewer: FC<Props> = (props) => {
    const { fileBufferArray, defaultSelectedSheet, rangesToHighlight } = props;

    const [showStyles, setShowStyles] = useState<boolean>(true);

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
        cellStyles,
        rowStyles,
        headerStyles,
        mergedGroupOfSelectedWorksheet,
        getMetaDataOfSelectedCell,
        selectedRange,
        setSelectedRange,
    } = useSpreadsheetViewerStore({
        fileBufferArray,
        defaultSelectedSheet,
        rangesToHighlight
    });

    const handleCellClick = (cell: Cell<Record<string, CellContent>, CellContent>) => {
        setSelectedCell({ row: cell.row.index, column: cell.column.id });
    }

    const switchSpreadsheet = (spreadsheet: string) => {
        setSelectedWorksheetName(spreadsheet);
        setSelectedCell(undefined);
        setSelectedRange(undefined);
    }

    const computeMetadataOfSelectedCell = (): string => {
        const metaData = getMetaDataOfSelectedCell();
        if (metaData?.f) return `=${metaData?.f}`;
        if (metaData?.v) return `${metaData?.v}`;
        return "";
    }

    const cellMetaData = computeMetadataOfSelectedCell();

    const resolveSelectedRange = (): string => {
        if (!selectedRange && selectedCell) {
            return `${selectedCell.column}${selectedCell.row + 1}`;
        }
        if (selectedRange && selectedCell && (selectedRange[0] === selectedRange[1])) {
            return `${selectedCell.column}${selectedCell.row + 1}`;
        }
        if (selectedRange) {
            return `${selectedRange[0]}:${selectedRange[1]}`
        }
        return "";
    }

    if (isLoading) {
        return (
            <div className="grid m-[auto] justify-center content-center items-center">
                <LoaderCircle className="animate-spin" strokeWidth={1.5} />
                <div>Loading excel file</div>
            </div>
        )
    }

    if (error) console.error(error);

    return (
        <div className="grid grid-rows-[max-content_90%_auto] h-full relative">
            <div className="grid grid-cols-[1fr_max-content] p-1 gap-2">
                <div className="grid grid-cols-[max-content_1fr] gap-2">
                    <div className="flex items-center content-center h-full w-[80px] py-1.5 px-2.5 border rounded-md text-sm text-neutral-600">
                        {resolveSelectedRange()}
                    </div>
                    <div className="grid grid-cols-[max-content_1fr] gap-1.5 items-center content-center">
                        <div className="flex items-center content-center gap-1 align-middle">
                            <Sigma className="size-5 text-neutral-600" />
                            <div className="text-neutral-600">=</div>
                        </div>
                        <Tooltip
                            className="h-full min-h-4 py-1.5 px-2.5 border rounded-md text-sm text-neutral-600 truncate"
                            tooltipContent={cellMetaData}
                            shouldNotDisplayCondition={cellMetaData.length === 0}
                        >
                            {cellMetaData}
                        </Tooltip>
                    </div>
                </div>
                <Tooltip
                    tooltipContent={showStyles ? <div>Hide styles</div> : <div>Show styles</div>}
                    onClick={() => setShowStyles((prev) => !prev)}
                    className="flex gap-2 items-center text-xs cursor-pointer p-1.5 px-2 text-neutral-600 rounded-md"
                >
                    <div className="[&_svg]:size-5">
                        {showStyles ? <EyeOff /> : <Eye />}
                    </div>
                </Tooltip>
            </div>
            <div className="h-full w-full">
                <div className="grid" style={{ height: "100%" }}>
                    {/* <SpreadsheetTable*/}
                    {/*     columns={columns}*/}
                    {/*     data={rowData.filter(r => r)}*/}
                    {/*     showStyles={showStyles}*/}
                    {/*    cellsStyles={showStyles ? cellStyles : undefined}*/}
                    {/*    rowStyles={showStyles ? rowStyles : undefined}*/}
                    {/*    headerStyles={showStyles ? headerStyles : undefined}*/}
                    {/*    selectedCell={selectedCell}*/}
                    {/*    rangesToSelect={rangeToSelect}*/}
                    {/*    handleCellClick={handleCellClick}*/}
                    {/*    parentContainerHeight={parentSize.height}*/}
                    {/*/>*/}
                    <TableContainer
                        columns={columns}
                        data={rowData.filter(r => r)}
                        showStyles={showStyles}
                        cellsStyles={showStyles ? cellStyles : undefined}
                        rowStyles={showStyles ? rowStyles : undefined}
                        headerStyles={showStyles ? headerStyles : undefined}
                        selectedCell={selectedCell}
                        rangesToSelect={rangeToSelect}
                        handleCellClick={handleCellClick}
                        // parentContainerHeight={parentSize.height}
                        mergedGroupOfSelectedWorksheet={mergedGroupOfSelectedWorksheet}
                        selectedSheetName={selectedWorksheetName}
                        setSelectedRange={setSelectedRange}
                    />
                </div>
            </div>
            <div className="whitespace-nowrap p-2 z-[10] w-full border-t overflow-x-auto">
                <ParentSizeObserver className="h-full w-full">
                    {(parentSize) =>
                        <SpreadsheetSelection
                            spreadsheets={sheetNames}
                            selectedSpreadsheet={selectedWorksheetName}
                            setSelectedSpreadsheet={switchSpreadsheet}
                            parentWidth={parentSize.width}
                        />
                    }
                </ParentSizeObserver>
            </div>
        </div>
    );
};
SpreadsheetViewer.displayName = "SpreadsheetViewer";

export {SpreadsheetViewer};
