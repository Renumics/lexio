import {FC} from "react";
import {Tabs, TabsList, TabsTrigger} from "./ui/tabs";

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
        <Tabs
            value={selectedSpreadsheet}
            defaultValue={selectedSpreadsheet}
            className="w-full bg-gray-100 rounded-md"
        >
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
