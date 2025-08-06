import { Theme, ThemeContextProvider } from "./ThemeContextProvider";
import "./ExcelViewer.css";
import ExcelViewerDataLoader from "./ExcelViewerDataLoader";
import {ExcelViewerConfig, ExcelViewerData} from "./types.ts";

export type ExcelViewerProps = ExcelViewerData & ExcelViewerConfig & {
    theme?: Theme | undefined;
};
function ExcelViewer({
                         fileName,
                         fileBufferArray,
                         rangesToHighlight,
                         defaultSelectedSheet,
                         theme,
                         showSearchbar,
                         showNotifications,
                         viewSettings,
                         showOptionToolbar,
                     }: ExcelViewerProps) {
    return (
        <ThemeContextProvider theme={theme}>
            <ExcelViewerDataLoader
                fileName={fileName}
                fileBufferArray={fileBufferArray}
                defaultSelectedSheet={defaultSelectedSheet}
                rangesToHighlight={rangesToHighlight}
                showSearchbar={showSearchbar}
                showNotifications={showNotifications}
                viewSettings={viewSettings}
                showOptionToolbar={showOptionToolbar}
            />
        </ThemeContextProvider>
    );
}
ExcelViewer.displayName = "ExcelViewer";

export default ExcelViewer;
