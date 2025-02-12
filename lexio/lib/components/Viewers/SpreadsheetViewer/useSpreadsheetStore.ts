import {create, StateCreator} from "zustand";
import {Workbook} from "exceljs";

export type SelectedCell = {
    row: number,
    column: string
};
export type Range = [string, string];

type ExcelOperationsStore = {
    getExcelWorkbook: (buffer: ArrayBuffer, selectedSpreadsheet?: string | undefined) => Promise<Workbook>;
    spreadsheets: string[];
    setSpreadsheets: (spreadsheets: string[]) => void;
    selectedSpreadsheet: string;
    setSelectedSpreadsheet: (spreadsheet: string) => void;
    selectedCell?: SelectedCell  | undefined;
    setSelectedCell: (cell: { row: number, column: string }) => void;
    rangeToSelect: Range[],
    setRangeToSelect: (range: Range[]) => void;
};
const useExcelStoreSlice: StateCreator<ExcelOperationsStore> = (set) => ({
    getExcelWorkbook: async (arrayBuffer: ArrayBuffer, selectedSpreadsheet?: string | undefined) => {
        const wbJs = new Workbook();
        const wb = await wbJs.xlsx.load(arrayBuffer);

        set(() => ({ spreadsheets: wb.worksheets.map((w) => w.name) }));
        set(() => ({ selectedSpreadsheet: selectedSpreadsheet ?? wb.worksheets[0].name }));
        return wb;
    },
    spreadsheets: [],
    setSpreadsheets: (spreadsheets) => set(() => ({ spreadsheets })),
    selectedSpreadsheet: "",
    setSelectedSpreadsheet: (spreadsheet) => set(() => ({ selectedSpreadsheet: spreadsheet })),
    selectedCell: undefined,
    setSelectedCell: (cell) => set(() => ({ selectedCell: cell })),
    rangeToSelect: [["A0", "A0"]],
    setRangeToSelect: (range) => set(() => ({ rangeToSelect: range })),
});

type GlobalStore = ExcelOperationsStore;

const useGlobalStore = create<GlobalStore>((...fn) => ({
    ...useExcelStoreSlice(...fn),
}));

export default useGlobalStore;
