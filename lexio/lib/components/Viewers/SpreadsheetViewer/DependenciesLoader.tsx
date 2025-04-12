import type * as ReactTable from "@tanstack/react-table";
import type * as ReactVirtual from "@tanstack/react-virtual";
import type * as ExcelJs from "exceljs";
import type * as SheetJs from "xlsx";
import {JSX, useEffect, useState} from "react";
import {loadExcelJs, loadSheetJs, loadTanstackReactTable, loadTanstackReactVirtual} from "./dependencies.ts";

/**
 * Dependencies loaded dynamically
 *
 */
type Dependencies = {
    tanstackTable: typeof ReactTable;
    tanstackVirtual: typeof ReactVirtual;
    excelJs: typeof ExcelJs;
    sheetJs: typeof SheetJs;
}
/**
 * Props for the DependenciesLoader higher order function component
 *
 * @type DependenciesLoaderProps
 * @property {((dependencies: Dependencies) => JSX.Element) | undefined} children - Callback called when rendering children. Gives children access to all loaded dependencies.
 */
type DependenciesLoaderProps = {
    children?: ((dependencies: Dependencies) => JSX.Element) | undefined;
}

/**
 * Component that loads required dependencies for the spreadsheet viewer
 *
 * @component DependenciesLoader
 * @param {((dependencies: Dependencies) => JSX.Element) | undefined} children - Callback called when rendering children. Gives children access to all loaded dependencies.
 * @constructor
 */
export const DependenciesLoader = ({ children }: DependenciesLoaderProps) => {
    const [tanstackTableLibrary, setTanstackTableLibrary] = useState<(typeof ReactTable) | undefined>(undefined);
    const [tanstackVirtualLibrary, setTanstackVirtualLibrary] = useState<(typeof ReactVirtual) | undefined>(undefined);
    const [excelJsLibrary, setExcelJsLibrary] = useState<(typeof ExcelJs) | undefined>(undefined);
    const [sheetJsLibrary, setSheetJsLibrary] = useState<(typeof SheetJs) | undefined>(undefined);

    useEffect(() => {
        (async () => {
            const tanstackTable = await loadTanstackReactTable();
            setTanstackTableLibrary(tanstackTable);
        })();

        (async () => {
            const tanstackVirtual = await loadTanstackReactVirtual();
            setTanstackVirtualLibrary(tanstackVirtual);
        })();

        (async () => {
            const excelJs = await loadExcelJs();
            setExcelJsLibrary(excelJs);
        })();

        (async () => {
            const sheetJs = await loadSheetJs();
            setSheetJsLibrary(sheetJs);
        })();
    }, []);

    if (!tanstackTableLibrary) return <div>Loading tanstack react table...</div>

    if (!tanstackVirtualLibrary) return <div>Loading tanstack virtual...</div>

    if (!excelJsLibrary) return <div>Loading exceljs...</div>

    if (!sheetJsLibrary) return <div>Loading sheetjs...</div>

    return (
        <>
            {children ?
                children({
                    tanstackTable: tanstackTableLibrary,
                    tanstackVirtual: tanstackVirtualLibrary,
                    excelJs: excelJsLibrary,
                    sheetJs: sheetJsLibrary,
                }) : null
            }
        </>
    )
}
DependenciesLoader.displayName = "LibraryLoader";
