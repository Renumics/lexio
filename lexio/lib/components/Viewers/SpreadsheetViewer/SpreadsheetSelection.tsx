import {useSpreadsheetViewerContext} from "./SpreadsheetViewerContext.tsx";

/**
 * Props for the SpreadsheetSelection component
 * @typedef {Object} PropsSpreadsheetSelection
 * @property {string[]} spreadsheets - Array of spreadsheet names to display as tabs
 * @property {string} selectedSpreadsheet - Currently selected spreadsheet name
 * @property {function} setSelectedSpreadsheet - Callback to update selected spreadsheet
 * @property {boolean | undefined} [disabled] - Optional flag to enable or disable sheet selection
 */
type Tab = {
    value: string,
    onClick: () => void;
}
type PropsSpreadsheetSelection = {
    spreadsheets: string[];
    selectedSpreadsheet: string
    setSelectedSpreadsheet: (spreadsheet: string) => void;
    disabled?: boolean | undefined;
}
const SpreadsheetSelection = (
    {
        spreadsheets,
        selectedSpreadsheet,
        setSelectedSpreadsheet,
        disabled,
    }: PropsSpreadsheetSelection) => {

    const { spreadsheetTheme } = useSpreadsheetViewerContext();

    const tabs: Tab[] = spreadsheets.map((key) => ({
        value: key,
        onClick: () => setSelectedSpreadsheet(key),
    }));

    return (
        <div
            className="rounded-md"
            style={{
                background: spreadsheetTheme.sheetSelectionBackground,
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${tabs.length},1fr)`,
                }}
                className={"w-full p-1"}
            >
                {tabs.map((tab) =>
                    <div
                        key={tab.value}
                        onClick={disabled ? undefined : tab.onClick}
                        style={{
                            backgroundColor: tab.value === selectedSpreadsheet ? "white" : "transparent",
                            cursor: tab.value === selectedSpreadsheet ? "unset" : disabled ? "not-allowed" : "pointer",
                            color: tab.value === selectedSpreadsheet ? "black" : "gray",
                        }}
                        className="text-center text-xs p-1.5 rounded-md drop-shadow-md"
                    >
                        {tab.value}
                    </div>
                )}
            </div>
        </div>

    );
};
SpreadsheetSelection.displayName = "SpreadsheetSelectionComponent";

/**
 * The SpreadsheetSelection component displays a tabbed interface for switching between different spreadsheets.
 * It renders a row of tabs where each tab represents a spreadsheet, with the currently selected spreadsheet
 * visually highlighted.
 *
 * Features:
 * - Responsive grid layout that adjusts to number of spreadsheets
 * - Visual indication of selected spreadsheet
 * - Click handling for spreadsheet selection
 * - Customizable dimensions based on parent container
 *
 * @component
 * @example
 * ```tsx
 * <SpreadsheetSelection
 *   spreadsheets={['Sheet1', 'Sheet2', 'Sheet3']}
 *   selectedSpreadsheet="Sheet1"
 *   setSelectedSpreadsheet={(sheet) => console.log(`Selected ${sheet}`)}
 * />
 * ```
 */
export {SpreadsheetSelection};
