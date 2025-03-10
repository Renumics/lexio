import {FC} from "react";

type Tab = {
    value: string,
    onClick: () => void;
}
type PropsSpreadsheetSelection = {
    spreadsheets: string[];
    selectedSpreadsheet: string
    setSelectedSpreadsheet: (spreadsheet: string) => void;
}
const SpreadsheetSelection: FC<PropsSpreadsheetSelection> = (props) => {
    const {
        spreadsheets,
        selectedSpreadsheet,
        setSelectedSpreadsheet,
    } = props;

    const tabs: Tab[] = spreadsheets.map((key) => ({
        value: key,
        onClick: () => setSelectedSpreadsheet(key),
    }));

    return (
        <div
            className="w-full bg-gray-100 rounded-md"
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
                        onClick={tab.onClick}
                        style={{
                            backgroundColor: tab.value === selectedSpreadsheet ? "white" : "transparent",
                            cursor: tab.value === selectedSpreadsheet ? "unset" : "pointer",
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

export {SpreadsheetSelection};
