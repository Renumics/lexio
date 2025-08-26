import { ParsingOptions, read, utils } from "xlsx";
import { Sheet2JSONOpts, WorkBook as SheetJsWorkbook, WorkSheet as SheetJsWorkSheet } from "xlsx";
import { CellMetadata, ColorSchemeList, WorkerResponseData } from "./types";
import { getClientLocale, MAX_COLUMN_SIZE, ROW_LIMIT } from "./utils";
import * as ExcelJS from "exceljs";

type WorkerInput = {
    type: "load-data";
    arrayBuffer: ArrayBuffer;
}

onmessage = async function (event: MessageEvent<WorkerInput>) {
    const { type, arrayBuffer } = event.data;

    if (type === "load-data") {
        await loadData(arrayBuffer);
    }
};

const loadSheetjsWorkbook = async (arrayBuffer: ArrayBuffer) => {
    const dateFormat = getClientLocale() === "de-DE" ? "dd/mm/yyyy" : "mm/dd/yyyy";

    const readParsingOptions: ParsingOptions = {
        type: "array",
        cellNF: true,
        cellText: true,
        sheetStubs: true,
        cellStyles: true,
        xlfn: true,
        dateNF: dateFormat,
    }

    const workbook = read(arrayBuffer, readParsingOptions);

    const getWorksheetRangeWithCellContainingData = (data: SheetJsWorkSheet): string => {
        const dataWithValues = Object.fromEntries(Object.entries(data).filter(([_, value]) => !!value.v));
        const cellNamesWithValues = Object.keys(dataWithValues);

        // If no cells with values, return minimum range
        if (cellNamesWithValues.length === 0) {
            const minRowNum = 24;
            const minColNum = 25;
            const lastCellName = utils.encode_cell({ c: minColNum, r: minRowNum });
            return `A1:${lastCellName}`;
        }

        const cellsWithValues = cellNamesWithValues.map(cell => utils.decode_cell(cell));
        const maxRow = Math.max(...cellsWithValues.map(cell => cell.r));
        const maxColumn = Math.max(...cellsWithValues.map(cell => cell.c));
        const minRowNum = 24;
        const minColNum = 25;
        const rowNum = Math.max(maxRow, minRowNum);
        const colNum = Math.max(maxColumn, minColNum);
        const lastCellName = utils.encode_cell({ c: colNum, r: rowNum });
        return `A1:${lastCellName}`;
    }

    workbook.Sheets = Object.fromEntries(Object.entries(workbook.Sheets).map(([key, value]) => {
        return [
            key,
            {
                ...value,
                "!ref": getWorksheetRangeWithCellContainingData(value),
            },
        ];
    }));
    return workbook;
}

const loadExcelJSWorkbook = async (arrayBuffer: ArrayBuffer) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    return workbook;
}

const loadSheetDataFromSheetjsWorkbook = (sheetJsWorkbook: SheetJsWorkbook, sheetName: string): [(string | null)[][], ColorSchemeList | undefined] => {
    const minRowNum = 32;
    const minColNum = 27;

    try {
        const getWorksheetRangeWithCellContainingData = (data: SheetJsWorkSheet): string => {
            const dataWithValues = Object.fromEntries(Object.entries(data).filter(([_, value]) => !!value.v));
            const cellNamesWithValues = Object.keys(dataWithValues);

            // If no cells with values, return minimum range
            if (cellNamesWithValues.length === 0) {
                const minRowNum = 24;
                const minColNum = 25;
                const lastCellName = utils.encode_cell({ c: minColNum, r: minRowNum });
                return `A1:${lastCellName}`;
            }

            const cellsWithValues = cellNamesWithValues.map(cell => utils.decode_cell(cell));
            const maxRow = Math.max(...cellsWithValues.map(cell => cell.r));
            const maxColumn = Math.max(...cellsWithValues.map(cell => cell.c));            
            const rowNum = Math.max(maxRow, minRowNum);
            const colNum = Math.max(maxColumn, minColNum);
            const lastCellName = utils.encode_cell({ c: colNum, r: rowNum });
            return `A1:${lastCellName}`;
        }

        sheetJsWorkbook.Sheets = Object.fromEntries(Object.entries(sheetJsWorkbook.Sheets).map(([key, value]) => {
            return [
                key,
                {
                    ...value,
                    "!ref": getWorksheetRangeWithCellContainingData(value),
                },
            ];
        }));

        const sheetToJsonOptions: Sheet2JSONOpts = {
            header: "A",
            blankrows: true,
            defval: "",
            raw: false,
            skipHidden: false,
            rawNumbers: false,
        }

        const sheet = sheetJsWorkbook.Sheets[sheetName];

        const rows = utils.sheet_to_json(sheet, sheetToJsonOptions);

        const rowsWithMinRowApplied = [
            ...rows.map((row: any) => Object.values(row).flat()),
            ...(rows.length < minRowNum ? Array(minRowNum - rows.length).fill(null) : []),
        ];

        // @ts-expect-error: type Themes object
        return [rowsWithMinRowApplied, sheetJsWorkbook.Themes?.themeElements?.clrScheme];
    }
    catch (e) {
        console.error("Error loading and parsing file. ", e);
    }
    return [[], undefined];
}

const loadData = async (fileBufferArray: ArrayBuffer) => {
    const fileSize = fileBufferArray.byteLength / 1_000_000;
    const fileSizeFormatted = `${(fileSize).toFixed(2)} MB`;
    try {

        // validate buffer
        if (fileSize > 5) {
            postMessage({
                progress: 100,
                loadingStep: "Error",
                error: `The file is too large. File size: ${Math.floor(fileSize)} MB.`,
                sheets: [],
                fileName: "Unknown",
                fileSize: fileSizeFormatted,
                lastModified: undefined,
                createdOn: undefined,
                fileType: "Excel file (.xlsx)",
            } as WorkerResponseData);
            return;
        }
        
        postMessage({
            progress: 0,
            loadingStep: "Parsing Excel file",
            error: undefined,
            sheets: [],
            fileName: "Unknown",
            fileSize: fileSizeFormatted,
            lastModified: new Date(),
            createdOn: new Date(),
            fileType: "Excel file (.xlsx)",
        } as WorkerResponseData);

        const excelJsWorkbook = await loadExcelJSWorkbook(fileBufferArray);

        const createdOn = excelJsWorkbook["created"] ? new Date(excelJsWorkbook["created"]) : new Date();

        const lastModified = excelJsWorkbook["modified"] ? new Date(excelJsWorkbook["modified"]) : new Date();

        postMessage({
            progress: 50, loadingStep: "Loading workbook", error: undefined, sheets: [],
            fileName: "Unknown",
            fileSize: fileSizeFormatted,
            lastModified: lastModified,
            createdOn: createdOn,
            fileType: "Excel file (.xlsx)",
        } as WorkerResponseData);

        const sheetJsWorkbook = await loadSheetjsWorkbook(fileBufferArray);

        postMessage({
            progress: 70, loadingStep: "Extracting worksheets", error: undefined, sheets: [],
            fileName: "Unknown",
            fileSize: fileSizeFormatted,
            lastModified: lastModified,
            createdOn: createdOn,
            fileType: "Excel file (.xlsx)",
        } as WorkerResponseData);

        const sheets = excelJsWorkbook.worksheets.map((sheet, sheetIndex) => {
            const data: unknown[][] = []
            const styles: Record<string, any> = {}
            const cellsMetadata: CellMetadata = {};
            const merges = sheet.model.merges || []

            const actualRowCount = sheet.rowCount || 0;
            const actualColumnCount = sheet.columnCount || 0;

            const minRows = 24;
            const minCols = 25;
            const totalRows = Math.max(actualRowCount, minRows);
            const totalCols = Math.max(actualColumnCount, minCols);

            for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
                data[rowIndex] = new Array(totalCols).fill(null);
            }

            postMessage({
                progress: 70 + sheetIndex * 100 / excelJsWorkbook.worksheets.length, loadingStep: `Loading ${sheet.name} worksheet`, error: undefined, sheets: [],
                fileName: "Unknown",
                fileSize: fileSizeFormatted,
                lastModified: lastModified,
                createdOn: createdOn,
                fileType: "Excel file (.xlsx)",
            } as WorkerResponseData);

            sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                const rowArr: any[] = new Array(totalCols).fill(null);
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    rowArr[colNumber - 1] = cell.value;
                    styles[`${cell.address}`] = {
                        value: cell.value,
                        style: cell.style,
                        address: cell.address
                    }
                    cellsMetadata[cell.address] = cell.value;
                })
                data[rowNumber - 1] = rowArr;
            });

            const colWidths = new Array(totalCols).fill(120);
            sheet.columns.forEach((col, index) => {
                if (index < totalCols) {
                    const calculatedWidth = col.width ? Math.round(Number(col.width) * 8) : 120;
                    colWidths[index] = Math.min(calculatedWidth, MAX_COLUMN_SIZE); // Maximum width of 500px
                }
            });

            const rowHeights: number[] = new Array(totalRows).fill(35);
            sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                if (rowNumber <= totalRows) {
                    rowHeights[rowNumber - 1] = row.height ? Math.round(Number(row.height)) + 20 : 35;
                }
            });
            
            const [sheetjsData, colorThemes] = loadSheetDataFromSheetjsWorkbook(sheetJsWorkbook, sheet.name);

            const rowLimitExceeded = sheetjsData.length > ROW_LIMIT;

            const sheetjsDataWithRowLimit = sheetjsData.slice(0, ROW_LIMIT);

            // Ensure rowHeights array matches the actual data length
            const finalRowHeights = new Array(sheetjsDataWithRowLimit.length).fill("");
            for (let i = 0; i < Math.min(rowHeights.length, sheetjsDataWithRowLimit.length); i++) {
                finalRowHeights[i] = rowHeights[i];
            }

            return {
                name: sheet.name,
                data: sheetjsDataWithRowLimit,
                colorThemes,
                styles,
                merges,
                cellsMetadata,
                colWidths,
                rowHeights: finalRowHeights,
                rowLimitExeceeded: rowLimitExceeded,
            }
        })

        postMessage({
            progress: 100,
            loadingStep: "Opening Excel Viewer",
            error: undefined,
            sheets: sheets,
            fileName: "Unknown",
            fileSize: fileSizeFormatted,
            fileType: "Excel file (.xlsx)",
            lastModified: lastModified,
            createdOn: createdOn,
        } as WorkerResponseData);

    } catch (error) {
        console.error("Error loading the excel file.", error);
        postMessage({
            progress: 0, loadingStep: "Completed!", error: "Error loading the excel file. The file might be too large. " + error as string, sheets: [],
            fileName: "Unknown",
            fileSize: fileSizeFormatted,
            lastModified: undefined,
            createdOn: undefined,
            fileType: "Excel file (.xlsx)",
        } as WorkerResponseData);
    }
}
