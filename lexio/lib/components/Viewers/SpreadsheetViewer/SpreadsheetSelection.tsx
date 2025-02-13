// import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
import * as React from "react";
import useGlobalStore from "./useSpreadsheetStore";

type Tab = {
    value: string,
    onClick: () => void;
}
const SpreadsheetSelection: React.FC = () => {
    const spreadsheets = useGlobalStore((state) => state.spreadsheets);
    const setSelectedSpreadsheet = useGlobalStore((state) => state.setSelectedSpreadsheet);
    const selectedSpreadsheet = useGlobalStore((state) => state.selectedSpreadsheet);

    const tabs: Tab[] = spreadsheets.map((key) => ({
        value: key,
        onClick: () => setSelectedSpreadsheet(key),
    }));

    if (!selectedSpreadsheet) return <div>Loading...</div>;

    return (
        <div value={selectedSpreadsheet} defaultValue={selectedSpreadsheet} className="w-full">
            <div
                className={"w-full"}
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${tabs.length},1fr)`,
                }}
            >
                {tabs.map((tab) =>
                    <div
                        key={tab.value}
                        value={tab.value}
                        onClick={tab.onClick}
                    >
                        {tab.value}
                    </div>
                )}
            </div>
        </div>

    );
};
SpreadsheetSelection.displayName = "SpreadsheetSelectionComponent";

export { SpreadsheetSelection };
