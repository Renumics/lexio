/* eslint-disable react-refresh/only-export-components */
import {
    InputSpreadsheetViewerStore,
    OutputSpreadsheetViewerStore, SpreadsheetTheme,
    useSpreadsheetViewerStore
} from "./useSpreadsheetStore.tsx";
import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import * as ReactVirtual from "@tanstack/react-virtual";
import * as ReactTable from "@tanstack/react-table";
import type * as ExcelJs from "exceljs";
import type * as SheetJs from "xlsx";
import {removeUndefined, ThemeContext} from "../../../theme";
import {isCssPropertyValid} from "./utils.ts";

type InputSpreadsheetViewerContext = PropsWithChildren & Omit<InputSpreadsheetViewerStore, "spreadsheetTheme"> & {
    tanstackVirtual: typeof ReactVirtual;
    styleOverrides?: SpreadsheetTheme | undefined;
};

type OutputSpreadsheetViewerContext = OutputSpreadsheetViewerStore & {
    spreadsheetTheme: SpreadsheetTheme;
    tanstackTable: typeof ReactTable;
    tanstackVirtual: typeof ReactVirtual;
    excelJs: typeof ExcelJs;
    sheetJs: typeof SheetJs;
}

// @ts-ignore
export const SpreadsheetViewerContext = createContext<OutputSpreadsheetViewerContext>({});

export const useSpreadsheetViewerContext = (): OutputSpreadsheetViewerContext => {
    const context = useContext(SpreadsheetViewerContext);
    if (!context) {
        throw new Error("You are trying to use the SpreadsheetViewerContextProvider before initializing it. Please call useSpreadsheetViewerContext inside a child component of SpreadsheetViewerContextProvider.");
    }
    return context;
}
export const SpreadsheetViewerContextProvider = (
    {
        fileBufferArray,
        defaultSelectedSheet,
        rangesToHighlight,
        excelJs,
        sheetJs,
        tanstackTable,
        tanstackVirtual,
        styleOverrides,
        children,
        minimumRowNumber,
        minimumColumnNumber,
    }: InputSpreadsheetViewerContext) => {

    const [isSpreadsheetDataLoading, setIsSpreadsheetDataLoading] = useState<boolean>(false);

    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error("ThemeContext is undefined");
    }
    const { colors, typography, componentDefaults } = theme.theme;

    const spreadsheetTheme: SpreadsheetTheme = {
        primary: isCssPropertyValid("color", colors.primary) ? colors.primary : "#1e88e5",
        secondary: isCssPropertyValid("color", colors.secondary) ? colors.secondary : "#64B5F6",
        success:  isCssPropertyValid("color", colors.success) ? colors.success : "#00a63e",
        warning: isCssPropertyValid("color", colors.warning) ? colors.warning : "#f0b100",
        error:  isCssPropertyValid("color", colors.error) ? colors.error : "#e7000b",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSuccess: "#ffffff",
        onWarning: "#ffffff",
        onError: "#ffffff",
        background: "#ffffff",
        onBackground: "#000000",
        borderRadius: isCssPropertyValid("borderRadius", componentDefaults.borderRadius) ? componentDefaults.borderRadius : "0.375rem",
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSizeBase,
        toolbarForeground: "rgb(82 82 82)",
        sheetSelectionBackground: "rgb(243 244 246)",
        headerBackground: "rgb(245, 245, 245)",
        ...(styleOverrides ? removeUndefined(styleOverrides) as SpreadsheetTheme : {}),
    };

    const {
        selectedWorksheetName,
        rangeToSelect,
        selectedCell,
        setSelectedCell,
        setSelectedWorksheetName,
        sheetNames,
        error,
        columns,
        rowData,
        headerStyles,
        mergedGroupOfSelectedWorksheet,
        getMetaDataOfSelectedCell,
        selectedRange,
        setSelectedRange,
    } = useSpreadsheetViewerStore({
        fileBufferArray,
        defaultSelectedSheet,
        rangesToHighlight,
        tanstackTable,
        excelJs,
        sheetJs,
        spreadsheetTheme,
        minimumRowNumber,
        minimumColumnNumber,
    });

    useEffect(() => {
        setIsSpreadsheetDataLoading(true);
        const timeout = setTimeout(() => {
            setIsSpreadsheetDataLoading(false);
        }, 500);
        return () => {
            clearTimeout(timeout);
        }
    }, [selectedWorksheetName]);

    return (
        <SpreadsheetViewerContext.Provider value={{
            selectedWorksheetName,
            setSelectedWorksheetName,
            rangeToSelect,
            selectedCell,
            setSelectedCell,
            sheetNames,
            isLoading: isSpreadsheetDataLoading,
            error,
            columns,
            rowData,
            headerStyles,
            mergedGroupOfSelectedWorksheet,
            getMetaDataOfSelectedCell,
            selectedRange,
            setSelectedRange,
            tanstackTable,
            tanstackVirtual,
            excelJs,
            sheetJs,
            spreadsheetTheme,
        }}>
            {children}
        </SpreadsheetViewerContext.Provider>
    )
}
SpreadsheetViewerContextProvider.displayName = "SpreadsheetViewerContextProvider";
