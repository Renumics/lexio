import {Tabs, TabsList, TabsTrigger} from "../../ui/tabs";
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
        <Tabs value={selectedSpreadsheet} defaultValue={selectedSpreadsheet} className="w-full bg-gray-100 rounded-md">
            <TabsList
                className={"w-full"}
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${tabs.length},1fr)`,
                }}
            >
                {tabs.map((tab) =>
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        onClick={tab.onClick}
                        className={`${selectedSpreadsheet === tab.value ? "bg-white" : "bg-transparent"}`}
                    >
                        {tab.value}
                    </TabsTrigger>
                )}
            </TabsList>
        </Tabs>

    );
};
SpreadsheetSelection.displayName = "SpreadsheetSelectionComponent";

export { SpreadsheetSelection };
