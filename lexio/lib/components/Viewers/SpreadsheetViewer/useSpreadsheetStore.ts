import { Workbook } from "exceljs";
import {useState} from "react";

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

export const useSpreadsheetStore = (): ExcelOperationsStore => {
    const [spreadsheets, setSpreadsheets] = useState<string[]>([]);
    const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<string>("");
    const [selectedCell, setSelectedCell] = useState<SelectedCell | undefined>(undefined);
    const [rangeToSelect, setRangeToSelect] = useState<Range[]>([]);

    const setWorkbookData = (workbook: Workbook, selectedSpreadsheet?: string | undefined) => {
        const spreadsheetsFromFile = workbook.worksheets.map((w) => w.name);

        setSpreadsheets(spreadsheetsFromFile);

        let selectedSheetFromFile = "";
        if (!workbook.worksheets.find((ws) => ws.name === selectedSpreadsheet)) return;

        selectedSheetFromFile = selectedSpreadsheet ?? workbook.worksheets[0].name;

        setSelectedSpreadsheet(selectedSheetFromFile);
    }

    const getExcelWorkbook = async (arrayBuffer: ArrayBuffer, selectedSpreadsheet?: string | undefined): Promise<Workbook> => {
        const wbJs = new Workbook();
        const wb = await wbJs.xlsx.load(arrayBuffer);
        setWorkbookData(wb, selectedSpreadsheet);
        return wb;
    }

    return {
        getExcelWorkbook,
        spreadsheets,
        setSpreadsheets,
        selectedSpreadsheet,
        setSelectedSpreadsheet,
        selectedCell,
        setSelectedCell,
        rangeToSelect,
        setRangeToSelect,
    };
};
