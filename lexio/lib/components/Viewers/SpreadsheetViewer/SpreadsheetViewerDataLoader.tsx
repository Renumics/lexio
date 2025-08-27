import SpreadsheetViewerContainer from "./SpreadsheetViewerContainer.tsx";
import {ExcelViewerConfig, ExcelViewerData, SpreadsheetData, WorkerResponseData} from "./types.ts";
import {useEffect, useState} from "react";
import "./SpreadsheetViewerDataLoader.css";
import ExcelWorker from "./spreadsheet-viewer-worker.ts?worker&inline";

const excelDataWorker = new ExcelWorker();

type ExcelViewerDataLoaderProps = ExcelViewerData & Omit<ExcelViewerConfig, "colorScheme">;

function SpreadsheetViewerDataLoader({
                                   fileName,
                                   fileBufferArray,
                                   defaultSelectedSheet,
                                   rangesToHighlight,
                                   showSearchbar,
                                   showNotifications,
                                   viewSettings,
                                   showOptionToolbar,
                                   showWorkbookDetails,
                               }: ExcelViewerDataLoaderProps) {
    const [excelData, setExcelData] = useState<SpreadsheetData | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState("");

    useEffect(() => {
        if (!fileBufferArray) return;
        excelDataWorker.postMessage({ type: "load-data", arrayBuffer: fileBufferArray });
        excelDataWorker.onmessage = (event: MessageEvent<WorkerResponseData>) => {
            setExcelData({
                sheets: event.data.sheets,
                fileName: fileName,
                fileSize: event.data.fileSize,
                lastModified: event.data.lastModified,
                createdOn: event.data.createdOn,
                fileType: event.data.fileType,
            });
            setError(event.data.error);
            setLoadingProgress(event.data.progress);
            setLoadingStep(event.data.loadingStep);
            if (event.data.progress === 100) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
        }
    }, [fileBufferArray, fileName]);

    useEffect(() => {
        document.documentElement.style.setProperty("--excel-viewer-loading-progress", `${loadingProgress}%`);
    }, [loadingProgress]);

    if (error) {
        return (
            <div className="excel-viewer-app-container">
                <div className="excel-viewer-error-container">
                    <h1>Error</h1>
                    <p style={{ color: "gray" }}>{error}</p>
                </div>
            </div>
        );
    }

    if (isLoading || !excelData) {
        return (
            <div className="excel-viewer-app-container">
                <div className="excel-viewer-loading-container">
                    <div className="excel-viewer-progress-container">
                        <div className="excel-viewer-loading-text">Spreadsheet Viewer</div>
                        <div className="excel-viewer-loading-progress-bar" />
                        <div className="excel-viewer-loading-subtext">{loadingStep}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="excel-viewer-app-container">
            <SpreadsheetViewerContainer
                data={excelData}
                rangesToHighlight={rangesToHighlight ?? []}
                defaultSelectedSheet={defaultSelectedSheet}
                showSearchbar={showSearchbar}
                showNotifications={showNotifications}
                viewSettings={viewSettings}
                showOptionToolbar={showOptionToolbar}
                showWorkbookDetails={showWorkbookDetails}
            />
        </div>
    );
}
SpreadsheetViewerDataLoader.displayName = "SpreadsheetViewerDataLoader";

export default SpreadsheetViewerDataLoader;
