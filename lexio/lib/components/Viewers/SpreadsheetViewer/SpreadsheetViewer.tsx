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
    }

    const computeMetadataOfSelectedCell = (): string => {
        const metaData = getMetaDataOfSelectedCell();
        if (metaData?.f) return `=${metaData?.f}`;
        if (metaData?.v) return `${metaData?.v}`;
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
                    <div className="flex items-center content-center h-full w-[80px] py-1.5 px-2.5 border rounded-md text-xs text-neutral-600">
                        {selectedCell ? `${selectedCell.column}${selectedCell.row + 1}` : null}
                    </div>
                    <div className="grid grid-cols-[max-content_1fr] gap-1.5 items-center content-center">
                        <div className="flex items-center content-center gap-1 align-middle">
                            <Sigma className="size-5 text-neutral-600" />
                            <div className="text-neutral-600">=</div>
                        </div>
                        <Tooltip
                            className="h-full min-h-4 py-1.5 px-2.5 border rounded-md text-xs text-neutral-600 truncate"
                            tooltipContent={computeMetadataOfSelectedCell()}
                            shouldNotDisplayCondition={computeMetadataOfSelectedCell().length === 0}
                        >
                            {computeMetadataOfSelectedCell()}
                        </Tooltip>
                    </div>
                </div>
                <div
                    onClick={() => setShowStyles((prev) => !prev)}
                    className="flex gap-2 cursor-pointer z-[10] sticky top-0 right-0 left-0 text-xs border p-1.5 text-neutral-600 rounded-md"
                >
                    <div className="[&_svg]:size-4">
                        {showStyles ? <EyeOff /> : <Eye />}
                    </div>
                    <div>
                        {showStyles ? "Hide styles" : "Show styles"}
                    </div>
                </div>
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
