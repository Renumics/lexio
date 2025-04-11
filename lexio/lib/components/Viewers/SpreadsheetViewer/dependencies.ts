import type * as ReactTable from "@tanstack/react-table";
import type * as ReactVirtual from "@tanstack/react-virtual";
import type * as ExcelJs from "exceljs";
import type * as SheetJs from "xlsx";

/**
 * Dynamically loads the "@tanstack/react-table" library.
 * @throws Error if "@tanstack/react-table" is not installed
 */
export async function loadTanstackReactTable(): Promise<typeof ReactTable> {
    try {
        return await import("@tanstack/react-table");
    } catch {
        throw new Error(
            "The spreadsheet viewer requires the @tanstack/react-table library. Please install it. Run:\n" +
            "npm install @tanstack/react-table\n" +
            "or\n" +
            "yarn add @tanstack/react-table"
        );
    }
}

/**
 * Dynamically loads the "@tanstack/react-virtual" library.
 * @throws Error if "@tanstack/react-virtual" is not installed
 */
export async function loadTanstackReactVirtual(): Promise<typeof ReactVirtual> {
    try {
        return await import("@tanstack/react-virtual");
    } catch {
        throw new Error(
            "The spreadsheet viewer requires the @tanstack/react-virtual library. Please install it. Run:\n" +
            "npm install @tanstack/react-virtual \n" +
            "or\n" +
            "yarn add @tanstack/react-virtual"
        );
    }
}

/**
 * Dynamically loads the "exceljs" library.
 * @throws Error if "exceljs" is not installed
 */
export async function loadExcelJs(): Promise<typeof ExcelJs> {
    try {
        return await import("exceljs");
    } catch {
        throw new Error(
            "The spreadsheet viewer requires the exceljs library. Please install it. Run:\n" +
            "npm install exceljs \n" +
            "or\n" +
            "yarn add exceljs"
        );
    }
}

/**
 * Dynamically loads the "xlsx" library.
 * @throws Error if "xlsx" is not installed
 */
export async function loadSheetJs(): Promise<typeof SheetJs> {
    try {
        return await import("xlsx");
    } catch {
        throw new Error(
            "The spreadsheet viewer requires the xlsx library. Please install it. Run:\n" +
            "npm install xlsx \n" +
            "or\n" +
            "yarn add xlsx \n" +
            "Checkout the sheetjs documentation for eventual updates: https://docs.sheetjs.com/docs/getting-started/installation/frameworks"
        );
    }
}
