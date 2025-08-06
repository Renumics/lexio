import { Search, SquareArrowOutUpRight } from "lucide-react";
import { SpreadsheetData } from "./types.ts";
import { useTheme } from "./ThemeContextProvider";
import {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import PopUp from "./PopUp";
import { getCellAddress } from "./utils";

type SearchResult = {
    sheetName: string;
    cellAddress: string;
    cellContentWithResult: string;
}

type SearchBarProps = {
    sheets: SpreadsheetData["sheets"];
    navigateToSearchResult: (sheetName: string, cellAddress: string) => void;
}
export function SearchBar({ sheets, navigateToSearchResult }: SearchBarProps) {
    const { resolvedColorScheme: colorScheme } = useTheme();
    const [searchValue, setSearchValue] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SearchResult[] | undefined>(undefined);
    const [hoveredResultIndex, setHoveredResultIndex] = useState<number | undefined>(undefined);

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { theme } = useTheme();

    const handleSearch = (searchValue: string) => {
        const results: SearchResult[] = [];
        sheets.forEach((sheet) => {
            sheet.data.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const cellLower = cell?.toLowerCase();
                    if (!cellLower) return;
                    if (cellLower.includes(searchValue)) {
                        const cellContentResultStyled = cellLower.replace(searchValue, `<emp style="color: ${theme.selection}; font-weight: bold;">${searchValue}</emp>`);
                        results.push({ sheetName: sheet.name, cellAddress: getCellAddress(rowIndex, colIndex), cellContentWithResult: cellContentResultStyled });
                    }
                });
            });
        });
        setSearchResults(results);
    }

    const handleTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value.toLowerCase());
        if (isOpen) return;
        setIsOpen(true);
    }, []);

    useEffect(() => {
        if (searchValue.length === 0) {
            setSearchResults([]);
            return;
        }
        handleSearch(searchValue);
    }, [searchValue]);

    const navigateToResult = useCallback((result: SearchResult) => {
        navigateToSearchResult(result.sheetName, result.cellAddress);
        setIsOpen(false);
    }, [navigateToSearchResult]);

    const popUpContent = useMemo(() => {
        return (
            <div style={{ height: "100%", width: "100%", display: "grid", fontSize: "13px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr max-content", gap: "0.5rem", alignItems: "center", padding: "0 0 1rem 0" }}>
                        <div style={{ fontWeight: "bold", fontSize: "13px" }}>Search results</div>
                        {searchResults && searchResults.length > 0 ? <div style={{ fontSize: "12px", color: "gray" }}>{searchResults?.length} results</div> : null}
                    </div>
                    {searchResults === undefined || searchValue.length === 0 ?
                        <div style={{ display: "grid", placeItems: "center", height: "100%", color: "gray" }}>
                            Type to search...
                        </div> :
                        searchResults.length > 0 ?
                            searchResults.map((result, index, array) => (
                                <div
                                key={index}                                
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "max-content 1fr max-content",
                                    gap: "0.8rem",
                                    width: "100%",
                                    borderBottom: index === array.length - 1 ? "none" : colorScheme === "dark" ? "1px solid #606060" : "1px solid #cdd0d4",
                                    padding: "0.8rem 0.5rem",
                                    cursor: "pointer",
                                    backgroundColor: hoveredResultIndex === index ? (colorScheme === "dark" ? "#606060" : "#f0f0f0") : "transparent",
                                }}
                                onMouseEnter={() => setHoveredResultIndex(index)}
                                onMouseLeave={() => setHoveredResultIndex(undefined)}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigateToResult(result);
                                }}
                                >
                                    <div style={{ display: "grid", paddingTop: "0.45rem" }}>
                                        <Search size={18} />
                                    </div>
                                    <div style={{ display: "grid", gap: "0.25rem" }}>                                        
                                        <div style={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: result.cellContentWithResult }} />
                                        <div style={{ display: "flex", gap: "0.5rem", fontSize: "12px", color: "gray" }}>
                                            <div style={{ fontWeight: "normal" }}>{result.cellAddress}</div>
                                            <div style={{ fontWeight: "normal" }}>|</div>
                                            <div style={{ fontWeight: "normal" }}>{result.sheetName}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "grid", placeItems: "center" }}>
                                        <SquareArrowOutUpRight size={15} />
                                    </div>
                                </div>
                            )) :
                            <div style={{ display: "grid", placeItems: "center", height: "100%", color: "gray" }}>No results found</div>}
                </div>
        )
    }, [searchResults, hoveredResultIndex, colorScheme, searchValue]);

    return (    
        <PopUp
            opened={isOpen}
            open={() => setIsOpen(true)}
            close={() => setIsOpen(false)}
            content={popUpContent}
            trigger={
                <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: "1fr max-content", gap: "0.5rem", alignItems: "center" }}>
                    <input
                        value={searchValue}
                        type="text"
                        placeholder="Search the workbook..."
                        onChange={handleTextChange}
                        style={{
                            width: "98%",
                            height: "100%",
                            border: "none",
                            outline: "none",
                            backgroundColor: "transparent",
                            color: colorScheme === "dark" ? "#ffffff" : "#000000",
                            fontSize: "13px",
                            fontFamily: "var(--excel-viewer-ui-font)",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                        }}
                        onFocus={() => setIsOpen(true)}
                    />
                    <Search size={15} color="gray" />
                </div>
            }
            position="bottom"
            containerStyle={{
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: "1fr max-content",
                border: `1px solid ${colorScheme === "dark" ? "#606060" : "#cdd0d4"}`,
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
                height: "100%",
                backgroundColor: colorScheme === "dark" ? "#404040" : "white",
                color: colorScheme === "dark" ? "#ffffff" : "#000000",
                fontSize: "14px",
                fontFamily: "var(--excel-viewer-ui-font)",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
            }}
        />

    );
}
SearchBar.displayName = "SearchBar";
