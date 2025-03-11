import {FC, useState} from "react";
import {useSpreadsheetViewerStore} from "./useSpreadsheetStore.tsx";
import {SpreadsheetTable} from "./SpreadsheetTable.tsx";
import {Cell} from "@tanstack/react-table";
import {CellContent} from "./utils";
import {SpreadsheetSelection} from "./SpreadsheetSelection";
import { LoaderCircle } from "lucide-react";
import ParentSizeObserver from "./ParentSizeObserver.tsx";
import { EyeOff, Eye } from "lucide-react";

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
        selectedSpreadsheet,
        rangeToSelect,
        selectedCell,
        setSelectedCell,
        setSelectedSpreadsheet,
        sheetNames,
        isLoading,
        error,
        columns,
        rowData,
        cellStyles,
        rowStyles,
        headerStyles,
    } = useSpreadsheetViewerStore({
        fileBufferArray,
        defaultSelectedSheet,
        rangesToHighlight
    });

    const handleCellClick = (cell: Cell<Record<string, CellContent>, CellContent>) => {
        setSelectedCell({ row: cell.row.index, column: cell.column.id });
    }

    const switchSpreadsheet = (spreadsheet: string) => {
        setSelectedSpreadsheet(spreadsheet);
        setSelectedCell(undefined);
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
            <div className="flex p-1 justify-end">
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
            <div>
                <ParentSizeObserver className="h-full w-full">
                    {(parentSize) =>
                        <div className="grid" style={{height: `${parentSize.height}px`}}>
                            <SpreadsheetTable
                                columns={columns}
                                data={rowData.filter(r => r)}
                                showStyles={showStyles}
                               cellsStyles={showStyles ? cellStyles : undefined}
                               rowStyles={showStyles ? rowStyles : undefined}
                               headerStyles={showStyles ? headerStyles : undefined}
                               selectedCell={selectedCell}
                               rangesToSelect={rangeToSelect}
                               handleCellClick={handleCellClick}
                               parentContainerHeight={parentSize.height}
                           />
                       </div>
                   }
               </ParentSizeObserver>
           </div>
            <div className="whitespace-nowrap p-2 z-[10] w-full border-t overflow-x-auto">
                <ParentSizeObserver className="h-full w-full">
                    {(parentSize) =>
                        <SpreadsheetSelection
                            spreadsheets={sheetNames}
                            selectedSpreadsheet={selectedSpreadsheet}
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
