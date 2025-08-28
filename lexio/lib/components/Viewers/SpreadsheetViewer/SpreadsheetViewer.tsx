import { Theme, ThemeContextProvider } from "./ThemeContextProvider";
import "./SpreadsheetViewer.css";
import SpreadsheetViewerDataLoader from "./SpreadsheetViewerDataLoader.tsx";
import {ExcelViewerConfig, ExcelViewerData} from "./types.ts";

/**
 * Props for the SpreadsheetViewer component
 * @type SpreadsheetViewerProps
 * @property {string} fileName - Name of the spreadsheet file.
 * @property {ArrayBuffer} fileBufferArray - The spreadsheet file contents as an ArrayBuffer.
 * @property {string | undefined} defaultSelectedSheet - Optional name of sheet to select by default.
 * @property {SpreadsheetHighlight[] | undefined} rangesToHighlight - Optional cell ranges to highlight.
 * @property {Theme | undefined} theme - Theme object to override the default styles for light and dark mode.
 * @property {Partial<ExcelViewerConfig>} layoutConfig - Layout config.
 */
type SpreadsheetViewerProps = ExcelViewerData & {
    theme?: Theme | undefined;
    layoutConfig: Partial<ExcelViewerConfig>;
};
/**
 * A component for displaying spreadsheet documents with interactive viewing capabilities.
 * This component is used to render spreadsheet files with support for sheet selection and cell/range highlighting.
 *
 * If no `defaultSelectedSheet` is provided, the component will select by default the first available sheet.
 *
 * Only 'xlsx' format is supported.
 *
 * @component
 * @param {SpreadsheetViewerProps} props - Props for the SpreadsheetViewer
 * @returns {JSX.Element} A spreadsheet viewer with sheet selection and cell highlighting
 *
 * @remarks
 * **Features:**
 * - Multiple sheet navigation with sheet selection.
 * - Single cell selection.
 * - Multiple cells selection (Range selection).
 * - Support for cell range highlighting via `rangesToHighlight` prop. Use 'B4:B4' to highlight a single cell.
 * - Summary of all cell range highlights. Click on highlights will navigate to them.
 * - Cell navigation. Double-click the cell address area to input a cell address(e.g. B4) or a range(B4:D10) to navigate to.
 * - Cell address input and range input validation.
 * - Virtualized rendering of rows and columns for improved performance with large spreadsheets.
 * - Compatible only for Excel file formats (xlsx).
 * - Formula display in toolbar.
 * - Cell metadata inspection.
 * - Responsive design with dynamic sizing.
 * - Customizable theming.
 * - Zoom-in and –out in sheets.
 * - Event notifications.
 * - Search across all sheets.
 *
 *
 * **Styling:**
 * - Light and dark mode.
 * - Customizable theming with the `theme` prop.
 *
 * **Keyboard Shortcuts:**
 * - Zoom in/out: ctrl + mouse wheel
 *
 * @example
 *
 * ```tsx
 * <SpreadsheetViewer
 *      fileName={"Call-center-data.xlsx"}
 *      fileBufferArray={excelData as ArrayBuffer}
 *      rangesToHighlight={[
 *          {
 *              sheetName: "Call Center Data",
 *              ranges: ["B4:B4", "B8:F10"]
 *          },
 *      ]}
 *      defaultSelectedSheet={"Call-Center-Sentiment-Sample-Data.xlsx"}
 *      layoutConfig={{
 *          showSearchbar: false,
 *          showNotifications: false,
 *          viewSettings: {
 *              showZoom: true,
 *              showHighlightToggle: true,
 *              showHighlightList: false,
 *              showOriginalStylesToggle: true,
 *          },
 *          showOptionToolbar: true,
 *          showWorkbookDetails: false,
 *          colorScheme: "light",
 *      }}
 * />
 * ```
 *
 * **Underlying Libraries:**
 * The SpreadsheetViewer combines **ExcelJS** to parse styles from Excel files and **SheetJS** to extract data from the buffer of Excel files.
 *
 */
function SpreadsheetViewer({
                         fileName,
                         fileBufferArray,
                         rangesToHighlight,
                         defaultSelectedSheet,
                         theme,
                         layoutConfig: {
                             showSearchbar,
                             showNotifications,
                             viewSettings,
                             showOptionToolbar,
                             showWorkbookDetails,
                             colorScheme,
                         },
                     }: SpreadsheetViewerProps) {
    return (
        <ThemeContextProvider colorScheme={colorScheme ?? "light"} theme={theme}>
            <SpreadsheetViewerDataLoader
                fileName={fileName}
                fileBufferArray={fileBufferArray}
                defaultSelectedSheet={defaultSelectedSheet}
                rangesToHighlight={rangesToHighlight}
                showSearchbar={showSearchbar ?? true}
                showNotifications={showNotifications ?? true}
                viewSettings={viewSettings}
                showOptionToolbar={showOptionToolbar ?? true}
                showWorkbookDetails={showWorkbookDetails ?? true}
            />
        </ThemeContextProvider>
    );
}
SpreadsheetViewer.displayName = "SpreadsheetViewer";

export default SpreadsheetViewer;
