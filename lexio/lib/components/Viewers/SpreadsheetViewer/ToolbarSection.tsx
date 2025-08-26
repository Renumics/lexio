import React, {ChangeEvent, Fragment, ReactNode, RefObject, useCallback, useEffect, useMemo, useState,} from "react";
import {
    AlertMessage as AlertMessageType,
    CellRange,
    CellStyle,
    ExcelViewerConfig,
    SheetData,
    SpreadsheetData,
    SpreadsheetHighlight
} from "./types.ts";
import {
    DEFAULT_BORDER_STYLE,
    DEFAULT_ZOOM_FACTOR,
    doesFontExist,
    getCellStyle,
    getColumnLabel,
    MAX_ZOOM_FACTOR,
    MIN_ZOOM_FACTOR,
    parseCellAddress,
    parseCellRange,
    ROW_LIMIT,
    TOOLBAR_ICON_SIZE,
    validateCellAddress
} from "./utils";
import {useTheme} from "./ThemeContextProvider";
import {CellErrorValue, CellFormulaValue, CellHyperlinkValue, CellRichTextValue, CellSharedFormulaValue} from "exceljs";
import {
    AlignCenter,
    AlignCenterHorizontal,
    AlignEndHorizontal,
    AlignLeft,
    AlignRight,
    AlignStartHorizontal,
    Bold,
    Copy,
    Highlighter,
    Info,
    Italic,
    Minus,
    Paintbrush,
    PaintBucket,
    Plus,
    ScanSearch,
    SquareDashedTopSolid,
    Strikethrough,
    TableRowsSplit,
    Underline,
    WrapText,
} from "lucide-react";
import SpreadsheetHighlightsPopUp from "./SpreadsheetHighlightsPopUp";
import ToolbarIcon from "./ui/toolbar-icon/ToolbarIcon";
import {SearchBar} from "./SearchBar";
import "./ToolbarSection.css";
import AlertMessage from "./AlertMessage";
import NotificationList from "./NotificationList";
import WorkbookDetails from "./WorkbookDetails";

type SelectedCells = Record<string, CellRange | undefined>;

type ToolbarOption = {
    jsx: ReactNode;
    title: string;
    disabled?: boolean;
    onClick?: () => void;
};

type ToolbarOptionGroup = {
    title: string;
    options: ToolbarOption[];
};

type ToolbarSectionProps = Omit<ExcelViewerConfig, "colorScheme"> & {
    zoom: number;
    setZoom: (zoom: number | ((prev: number) => number)) => void;
    excelTableContainerRef: RefObject<HTMLDivElement>;
    selectedCells?: SelectedCells | undefined;
    setSelectedCells: (selectedCells: SelectedCells | undefined | ((prev: SelectedCells | undefined) => SelectedCells | undefined)) => void;
    data: SpreadsheetData;
    activeSheet: SheetData;
    highlightsOfSelectedSheet?: SpreadsheetHighlight | undefined;
    setActiveSheetIndex: (index: number) => void;
    handleCellClick: (cell: string, sheetName: string) => void;
    scrollToCellRef: RefObject<((cellAddress: string) => void) | null>;
    containerRef: RefObject<HTMLDivElement>;
    showHighlights: boolean;
    setShowHighlights: (showHighlights: boolean | ((prev: boolean) => boolean)) => void;
    rangesToHighlight: SpreadsheetHighlight[];
    showStyles: boolean;
    setShowStyles: (showStyles: boolean | ((prev: boolean) => boolean)) => void;
};
function ToolbarSection({ showWorkbookDetails, showSearchbar, showNotifications, viewSettings, showOptionToolbar, zoom, setZoom, excelTableContainerRef, selectedCells, setSelectedCells, data, activeSheet, setActiveSheetIndex, handleCellClick, scrollToCellRef, highlightsOfSelectedSheet, containerRef, showHighlights, setShowHighlights, showStyles, setShowStyles, rangesToHighlight }: ToolbarSectionProps) {
    const [cellAddressInput, setCellAddressInput] = useState<string>(() => {
        const selectedCell = selectedCells?.[activeSheet.name]?.startCell;
        if (!selectedCell) return "";
        const selectedCellRange = selectedCells?.[activeSheet.name];
        if (!selectedCellRange) return "";
        if (selectedCellRange.startCell === selectedCellRange.endCell) return selectedCell;
        return `${selectedCellRange.startCell}:${selectedCellRange.endCell}`;
    });
    const [isEditingCellAddress, setIsEditingCellAddress] = useState<boolean>(false);
    const [cellAddressError, setCellAddressError] = useState<string>("");
    const [showOptionsToolbar, setShowOptionsToolbar] = useState<boolean>(true);
    const [showRowLimitExceededMessage, setShowRowLimitExceededMessage] = useState<boolean>(false);
    const [alertMessages, setAlertMessages] = useState<AlertMessageType[]>([]);
    const { theme: currentTheme, colorScheme } = useTheme();

    useEffect(() => {
        return () => {
            setCellAddressInput("");
            setIsEditingCellAddress(false);
            setCellAddressError("");
            setShowOptionsToolbar(true);
            // setShowRowLimitExceededMessage(false);
        }
    }, []);

    const getToolbarOptionIconColor = useCallback((isActive: boolean): string => {
        if (!isActive && colorScheme === "light") {
            return "gray";
        }
        if (!isActive && colorScheme === "dark") {
            return "gray";
        }
        if (isActive && colorScheme === "light") {
            return "#000000";
        }
        if (isActive && colorScheme === "dark") {
            return "#ffffff";
        }
        return "gray";
    }, [colorScheme]);

    const handleZoomIn = useCallback(() => {
        setZoom((prev) => {
            if (prev + 10 > MAX_ZOOM_FACTOR) return MAX_ZOOM_FACTOR;
            return prev + 10;
        });
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((prev) => {
            if (prev - 10 < MIN_ZOOM_FACTOR) return MIN_ZOOM_FACTOR;
            return prev - 10;
        });
    }, []);

    const handleMouseWheelChangeInZoomOptionSection = useCallback((e: React.WheelEvent) => {
        if (e.deltaY < 0) {
            handleZoomIn();
            return;
        }
        if (e.deltaY > 0) {
            handleZoomOut();
            return;
        }
    }, [handleZoomIn, handleZoomOut]);

    const handleCrtlKeyPlusMouseWheelChange = useCallback((e: WheelEvent) => {
        if (e.ctrlKey && e.deltaY < 0) {
            handleZoomIn();
            return;
        }
        if (e.ctrlKey && e.deltaY > 0) {
            handleZoomOut();
            return;
        }
    }, [handleZoomIn, handleZoomOut]);

    useEffect(() => {
        const removeDefaultWheelEvent = (event: WheelEvent) => {
            if (event.ctrlKey) {
                event.preventDefault();
            }
        }

        if (!excelTableContainerRef.current) return;

        excelTableContainerRef.current.addEventListener("wheel", handleCrtlKeyPlusMouseWheelChange);

        document.addEventListener("wheel", removeDefaultWheelEvent, { passive: false });

        return () => {
            if (!excelTableContainerRef.current) return;
            excelTableContainerRef.current.removeEventListener("wheel", handleCrtlKeyPlusMouseWheelChange);
            document.removeEventListener("wheel", removeDefaultWheelEvent);
        };
    }, [handleCrtlKeyPlusMouseWheelChange]);

    const toolbarOptionActiveColor: string = useMemo(() => {
        return `${currentTheme.selection}50`;
    }, [currentTheme.selection]);

    const handleCellAddressInput = useCallback((input: string) => {
        setCellAddressInput(input.toUpperCase());
        setCellAddressError("");
    }, []);

    const handleCellAddressSubmit = useCallback((cellAddress: string) => {
        if (!validateCellAddress(cellAddress)) {
            setCellAddressError(`Invalid cell or range format. <span style="color: var(--excel-viewer-selection);">${cellAddress}</span> is not a valid cell or range address. Use the format A1, B10, A1:B10, etc.`);
            return;
        }

        const parsedRange = parseCellRange(cellAddress);
        if (!parsedRange) {
            setCellAddressError("Failed to parse cell address");
            return;
        }

        const maxRow = activeSheet.data.length - 1;
        const maxCol = activeSheet.data[0]?.length - 1 || 0;

        const startParsed = parseCellAddress(parsedRange.startCell);
        const endParsed = parseCellAddress(parsedRange.endCell);

        if (!startParsed || !endParsed) {
            setCellAddressError("Invalid cell address");
            return;
        }

        if (startParsed.row > maxRow || endParsed.row > maxRow ||
            startParsed.col > maxCol || endParsed.col > maxCol) {
            setCellAddressError(`Range is outside sheet boundaries (max: ${getColumnLabel(maxCol)}${maxRow + 1})`);
            return;
        }

        const sheetName = activeSheet.name;
        setSelectedCells((prev) => ({ ...prev, [sheetName]: parsedRange }));

        localStorage.setItem(`${data.fileName}-${sheetName}-selectedCell`, parsedRange.startCell);

        if (scrollToCellRef.current) {
            scrollToCellRef.current(parsedRange.startCell);
        } else {
            setTimeout(() => {
                const startCellElement = document.getElementById(parsedRange.startCell);
                if (startCellElement && containerRef.current) {
                    startCellElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "center"
                    });
                }
            }, 100);
        }

        setCellAddressInput("");
        setCellAddressError("");
        setIsEditingCellAddress(false);
    }, []);

    const handleNavigateToCell = useCallback((sheetName: string, cellAddress: string) => {
        const indexOfSheet = data.sheets.findIndex((sheet) => sheet.name === sheetName);
        if (indexOfSheet === -1) return;
        setActiveSheetIndex(indexOfSheet);
        handleCellClick(cellAddress, sheetName);
        handleCellAddressSubmit(cellAddress);
    }, [handleCellClick, data.sheets, setActiveSheetIndex, handleCellAddressSubmit]);

    const handleCellAddressKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCellClick(cellAddressInput, activeSheet.name);
            handleCellAddressSubmit(cellAddressInput);
        } else if (e.key === "Escape") {
            setCellAddressInput("");
            setCellAddressError("");
            setIsEditingCellAddress(false);
        }
    }, [handleCellAddressSubmit, cellAddressInput]);

    const handleCellAddressInputFocusLost = useCallback(() => {
        setIsEditingCellAddress(false);
    }, []);

    const formulaOrValueOfSelectedCell: string | undefined = useMemo((): string | undefined => {
        if (!selectedCells) return undefined;

        const cellRange = selectedCells[activeSheet.name];
        if (!cellRange) return undefined;

        const cellAddress = cellRange.startCell;
        if (!cellAddress) return undefined;

        const cellValue = activeSheet.cellsMetadata[cellAddress];

        if (!cellValue) return undefined;

        if (typeof cellValue === "string" || typeof cellValue === "number") return `${cellValue}`;

        if (typeof cellValue === "object" && Object.prototype.hasOwnProperty.call(cellValue, "error")) {
            return `=${(cellValue as CellErrorValue).error}`;
        }

        if (typeof cellValue === "object" && Object.prototype.hasOwnProperty.call(cellValue, "formula")) {
            return `=${(cellValue as CellFormulaValue).formula}`;
        }

        if (typeof cellValue === "object" && Object.prototype.hasOwnProperty.call(cellValue, "hyperlink")) {
            return (cellValue as CellHyperlinkValue).text;
        }

        if (typeof cellValue === "object" && Object.prototype.hasOwnProperty.call(cellValue, "sharedFormula")) {
            return `=${(cellValue as CellSharedFormulaValue).sharedFormula}`;
        }

        if (typeof cellValue === "object" && Object.prototype.hasOwnProperty.call(cellValue, "richText")) {
            const richText = (cellValue as CellRichTextValue).richText;
            return richText.map((text) => text.text).join("");
        }

        return undefined;
    }, [activeSheet, selectedCells]);

    const selectedRange: string | undefined = useMemo(() => {
        if (!selectedCells) return undefined;
        const startCell = selectedCells[activeSheet.name]?.startCell;
        if (!startCell) return undefined;
        if (selectedCells[activeSheet.name]?.cells.length === 1) {
            return startCell;
        }
        return `${startCell}:${selectedCells?.[activeSheet.name]?.endCell}`;
    }, [selectedCells, activeSheet]);

    const selectedCellStyle: CellStyle | undefined = useMemo(() => {
        const cellAddress = selectedCells?.[activeSheet.name]?.startCell;
        if (!cellAddress) return undefined;
        return getCellStyle(cellAddress, activeSheet.styles, currentTheme, highlightsOfSelectedSheet, activeSheet.merges, activeSheet.colorThemes);
    }, [selectedCells, activeSheet]);

    const selectedCellNumberFormat: string | undefined = useMemo(() => {
        const cellAddress = selectedCells?.[activeSheet.name]?.startCell;
        if (!cellAddress) return undefined;
        // @ts-expect-error: style object to extract styles
        return activeSheet.styles[cellAddress]?.style?.numFmt;
    }, [selectedCells, activeSheet]);

    const clipboardToolbarOptionGroup: ToolbarOptionGroup = useMemo(() => {
        const canCopyCellContent = formulaOrValueOfSelectedCell !== undefined;
        return {
            title: "Clipboard",
            options: [
                {
                    title: "Copy cell content to clipboard",
                    jsx: <Copy size={TOOLBAR_ICON_SIZE} />,
                    disabled: !canCopyCellContent,
                    onClick: async () => {
                        if (!canCopyCellContent) return;
                        await navigator.clipboard.writeText(formulaOrValueOfSelectedCell ?? "");
                    }
                },
            ]
        }
    }, [formulaOrValueOfSelectedCell]);

    const fontToolbarOptionGroup: ToolbarOptionGroup = useMemo(() => {
        const fontFamily = selectedCellStyle?.fontFamily ?? "";
        const fontSize = selectedCellStyle?.fontSize ?? "";
        const fontColor = selectedCellStyle?.color;
        const fontWeight = selectedCellStyle?.fontWeight;
        const fontStyle = selectedCellStyle?.fontStyle;
        const fontUnderline = selectedCellStyle?.underline;
        const fontStrike = selectedCellStyle?.strikeThrough;
        const fontFamilyExists = !(fontFamily.length > 0) || doesFontExist(fontFamily);
        return {
            title: "Font",
            options: [
                {
                    title: "Font-family",
                    jsx: (
                        <div style={{ display: "grid", gridTemplateColumns: fontFamilyExists ? "1fr" : "1fr max-content", placeItems: "center", width: "100%", height: "100%", border: `1px solid ${colorScheme === "dark" ? "#606060" : "#cdd0d4"}`, padding: "0.25rem 0.5rem", borderRadius: "0.25rem" }}>
                            <input type="text" value={fontFamily} disabled={true} style={{ width: "100px", height: "100%", border: "none", outline: "none", caretColor: "transparent", backgroundColor: "transparent", color: "gray", fontSize: "12px", fontFamily: "var(--excel-viewer-ui-font)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} />
                            {fontFamilyExists ?
                                null :
                                <div
                                    title={`The font family "${fontFamily}" does not exist on your system. The default browser font has been used instead.`}
                                    style={{ fontSize: "16px", fontFamily: "var(--excel-viewer-ui-font)", margin: 0, padding: 0 }}>
                                    <Info size={16} fontSize="16px" />
                                </div>
                            }
                        </div>
                    ),
                    disabled: !fontFamily,
                },
                {
                    title: "Font-size",
                    jsx: (
                        <div style={{ display: "grid", placeItems: "center", width: "100%", height: "100%", border: `1px solid ${colorScheme === "dark" ? "#606060" : "#cdd0d4"}`, padding: "0.25rem 0.5rem", borderRadius: "0.25rem" }}>
                            <input type="text" value={fontSize} inputMode="none" disabled={true} style={{ width: "26px", height: "100%", border: "none", outline: "none", caretColor: "transparent", backgroundColor: "transparent", color: "gray", fontSize: "12px", fontFamily: "var(--excel-viewer-ui-font)" }} />
                        </div>
                    ),
                    disabled: !fontSize,
                },
                {
                    title: `Font-color(${fontColor})`,
                    jsx: (
                        <div style={{ display: "grid", placeItems: "center", height: "100%", padding: "0.25rem 0.25rem" }}>
                            <div style={{ fontSize: "16px", fontFamily: "var(--excel-viewer-ui-font)", margin: 0, padding: 0, userSelect: "none" }}>A</div>
                            <div style={{ width: "25px", height: "7px", backgroundColor: fontColor, margin: -1, border: `1px solid ${colorScheme === "dark" ? "#606060" : "#cdd0d4"}`, borderRadius: "0.25rem" }} />
                        </div>
                    ),
                    disabled: !fontColor,
                },
                {
                    title: "Font-weight(Bold)",
                    jsx: (
                        <ToolbarIcon
                            icon={<Bold size={16} fontSize="16px" strokeWidth={"0.20rem"} />}
                            tooltipTitle="Font-weight(Bold)"
                            iconWrapperStyle={{ backgroundColor: fontWeight === "bold" ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", fontWeight: "bold", color: getToolbarOptionIconColor(fontWeight === "bold") }}
                        />
                    ),
                    disabled: !fontWeight,
                },
                {
                    title: "Font-style(Italic)",
                    jsx: (
                        <ToolbarIcon
                            icon={<Italic size={16} fontSize="16px" />}
                            tooltipTitle="Font-style(Italic)"
                            iconWrapperStyle={{ backgroundColor: fontStyle === "italic" ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(fontStyle === "italic") }}
                        />
                    ),
                    disabled: !fontStyle,
                },
                {
                    title: "Font-underline(Underline)",
                    jsx: (
                        <ToolbarIcon
                            icon={<Underline size={16} fontSize="16px" />}
                            tooltipTitle="Font-underline(Underline)"
                            iconWrapperStyle={{ backgroundColor: fontUnderline ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(!!fontUnderline) }}
                        />
                    ),
                    disabled: !fontUnderline,
                },
                {
                    title: "Font-strike(Strikethrough)",
                    jsx: (
                        <ToolbarIcon
                            icon={<Strikethrough size={16} fontSize="16px" />}
                            tooltipTitle="Font-strike(Strikethrough)"
                            iconWrapperStyle={{ backgroundColor: fontStrike ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(!!fontStrike) }}
                        />
                    ),
                    disabled: !fontStrike,
                },
            ]
        }
    }, [selectedCellStyle, colorScheme, getToolbarOptionIconColor]);

    const fillToolbarOptionGroup: ToolbarOptionGroup = useMemo(() => {
        const fillColor = selectedCellStyle?.backgroundColor;
        return {
            title: "Fill",
            options: [

                {
                    title: `Fill-color(${fillColor})`,
                    jsx: (
                        <div style={{ display: "grid", placeItems: "center", width: "100%", height: "100%", padding: "0.25rem" }}>
                            <div style={{ display: "grid", gap: "0.2rem", placeItems: "center", fontSize: "16px", width: "100%", height: "100%" }}>
                                <PaintBucket size={14} fontSize="16px" />
                                <div style={{ width: "25px", height: "7px", backgroundColor: fillColor, margin: 0, border: `1px solid ${colorScheme === "dark" ? "#606060" : "#cdd0d4"}`, borderRadius: "0.25rem" }} />
                            </div>
                        </div>
                    ),
                    disabled: !fillColor,
                },
            ]
        }
    }, [selectedCellStyle, colorScheme]);

    const horizontalAlignmentToolbarOptionGroup: ToolbarOptionGroup = useMemo(() => {
        const horizontalAlignment = selectedCellStyle?.textAlign;
        return {
            title: "Horizontal Alignment",
            options: [

                {
                    title: "Horizontal Alignment(Left)",
                    jsx: (
                        <ToolbarIcon
                            label="left"
                            icon={<AlignLeft size={16} fontSize="16px" />}
                            tooltipTitle="Horizontal Alignment(Left)"
                            labelStyle={{ userSelect: "none" }}
                            iconWrapperStyle={{ backgroundColor: horizontalAlignment === "left" ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(horizontalAlignment === "left") }}
                        />
                    ),
                },
                {
                    title: "Horizontal Alignment(Center)",
                    jsx: (
                        <ToolbarIcon
                            label="center"
                            icon={<AlignCenter size={16} fontSize="16px" />}
                            tooltipTitle="Horizontal Alignment(Center)"
                            labelStyle={{ userSelect: "none" }}
                            iconWrapperStyle={{ backgroundColor: horizontalAlignment === "center" ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(horizontalAlignment === "center") }}
                        />
                    ),
                },
                {
                    title: "Horizontal Alignment(Right)",
                    jsx: (
                        <ToolbarIcon
                            label="right"
                            icon={<AlignRight size={16} fontSize="16px" />}
                            tooltipTitle="Horizontal Alignment(Right)"
                            labelStyle={{ userSelect: "none" }}
                            iconWrapperStyle={{ backgroundColor: horizontalAlignment === "right" ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(horizontalAlignment === "right") }}
                        />
                    ),
                },
            ]
        }
    }, [selectedCellStyle, colorScheme, getToolbarOptionIconColor]);

    const verticalAlignmentToolbarOptionGroup: ToolbarOptionGroup = useMemo(() => {
        const verticalAlignment = selectedCellStyle?.verticalAlign;
        return {
            title: "Vertical Alignment",
            options: [
                {
                    title: "Vertical Alignment(Top)",
                    jsx: (
                        <ToolbarIcon
                            label="top"
                            icon={<AlignStartHorizontal size={16} fontSize="16px" />}
                            tooltipTitle="Vertical Alignment(Top)"
                            labelStyle={{ userSelect: "none" }}
                            iconWrapperStyle={{ backgroundColor: verticalAlignment === "top" ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(verticalAlignment === "top") }}
                        />
                    ),
                },
                {
                    title: "Vertical Alignment(Center)",
                    jsx: (
                        <ToolbarIcon
                            label="middle"
                            icon={<AlignCenterHorizontal size={16} fontSize="16px" />}
                            tooltipTitle="Vertical Alignment(Center)"
                            labelStyle={{ userSelect: "none" }}
                            iconWrapperStyle={{ backgroundColor: verticalAlignment === "middle" ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(verticalAlignment === "middle") }}
                        />
                    ),
                },
                {
                    title: "Vertical Alignment(Bottom)",
                    jsx: (
                        <ToolbarIcon
                            label="bottom"
                            icon={<AlignEndHorizontal size={16} fontSize="16px" />}
                            tooltipTitle="Vertical Alignment(Bottom)"
                            labelStyle={{ userSelect: "none" }}
                            iconWrapperStyle={{ backgroundColor: verticalAlignment === "bottom" ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(verticalAlignment === "bottom") }}
                        />
                    ),
                },
            ]
        }
    }, [selectedCells, activeSheet.styles, colorScheme, getToolbarOptionIconColor]);

    const textRotationToolbarOptionGroup: ToolbarOptionGroup = useMemo(() => {
        const textRotation = selectedCellStyle ? selectedCellStyle.textRotation : 0;
        return {
            title: "Text Rotation",
            options: [
                {
                    title: `Text Rotation(${textRotation}°)`,
                    jsx: (
                        <div style={{ display: "flex", flexWrap: "nowrap", gap: "0.5rem", placeItems: "center", fontSize: "14px", width: "100%", height: "100%", padding: "0.25rem", borderRadius: "0.25rem", userSelect: "none" }}>
                            <div style={{ minWidth: "25px", width: "100%", textAlign: "center", color: textRotation === 0 ? "gray" : colorScheme === "dark" ? "#ffffff" : "#000000" }}>{textRotation}°</div>
                        </div>
                    ),
                },
            ],
        }
    }, [selectedCellStyle, colorScheme]);

    const wrapTextToolbarOptionGroup: ToolbarOptionGroup = useMemo(() => {
        const wrapText = false;
        return {
            title: "Text wrap",
            options: [
                {
                    title: "Text wrap - By default, the cell content is not wrapped to a new line if the cell's content width exceeds the column's width.",
                    jsx: (
                        <ToolbarIcon
                            label="auto wrapped"
                            icon={<WrapText size={16} fontSize="16px" />}
                            labelStyle={{ userSelect: "none" }}
                            tooltipTitle="Text wrap - By default, the cell content is not wrapped to a new line if the cell's content width exceeds the column's width."
                            iconWrapperStyle={{ backgroundColor: wrapText ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(wrapText) }}
                        />
                    ),
                },
            ],
        }
    }, [colorScheme]);

    const borderToolbarOptionGroup: ToolbarOptionGroup = useMemo(() => {
        const borderTop = selectedCellStyle && selectedCellStyle.borderTop !== DEFAULT_BORDER_STYLE;
        const borderRight = selectedCellStyle && selectedCellStyle.borderRight !== DEFAULT_BORDER_STYLE;
        const borderBottom = selectedCellStyle && selectedCellStyle.borderBottom !== DEFAULT_BORDER_STYLE;
        const borderLeft = selectedCellStyle && selectedCellStyle.borderLeft !== DEFAULT_BORDER_STYLE;

        const borderOptions: { label: string; value: string; icon: ReactNode }[] = [
            {
                label: "Border-top",
                value: "top",
                icon: <SquareDashedTopSolid size={16} fontSize="16px" />,
            },
            {
                label: "Border-right",
                value: "right",
                icon: <SquareDashedTopSolid size={16} fontSize="16px" style={{ transform: "rotateZ(90deg)" }} />,
            },
            {
                label: "Border-bottom",
                value: "bottom",
                icon: <SquareDashedTopSolid size={16} fontSize="16px" style={{ transform: "rotateZ(180deg)" }} />,
            },
            {
                label: "Border-left",
                value: "left",
                icon: <SquareDashedTopSolid size={16} fontSize="16px" style={{ transform: "rotateZ(270deg)" }} />,
            },
        ];
        const getBorderValue = (): string[] => {
            const result: string[] = [];
            if (borderTop && borderRight && borderBottom && borderLeft) {
                result.push("top");
                result.push("right");
                result.push("bottom");
                result.push("left");
                return result;
            }
            if (borderTop) result.push("top");
            if (borderRight) result.push("right");
            if (borderBottom) result.push("bottom");
            if (borderLeft) result.push("left");
            return result;
        }
        return {
            title: "Border",
            options: borderOptions.map((option) => {
                const isSelected = getBorderValue().includes(option.value);
                return {
                    title: option.label,
                    jsx: (
                        <ToolbarIcon
                            label={option.value}
                            icon={option.icon}
                            labelStyle={{ userSelect: "none" }}
                            tooltipTitle={option.label}
                            iconWrapperStyle={{ backgroundColor: isSelected ? toolbarOptionActiveColor : "transparent" }}
                            iconContainerStyle={{ fontSize: "16px", color: getToolbarOptionIconColor(isSelected) }}
                        />
                    ),
                }
            }),
        }
    }, [selectedCellStyle, colorScheme, getToolbarOptionIconColor]);

    const numberFormatToolbarOptionGroup: ToolbarOptionGroup = useMemo(() => {
        return {
            title: "Number Format",
            options: [
                {
                    title: "Number Format",
                    jsx: (
                        <div style={{ display: "grid", placeItems: "center", minWidth: "100px", width: "100%", height: "100%", padding: "0.25rem", borderRadius: "0.25rem", backgroundColor: "transparent", userSelect: "none" }}>
                            <div>{selectedCellNumberFormat ?? "Standard"}</div>
                            {!selectedCellNumberFormat ? <div style={{ fontSize: "10px", color: "gray" }}>No specific format</div> : null}
                        </div>
                    ),
                },
            ],
        }
    }, [selectedCellNumberFormat]);

    const allToolbarOptionGroups: ToolbarOptionGroup[] = useMemo(() => {
        return [
            clipboardToolbarOptionGroup,
            fontToolbarOptionGroup,
            fillToolbarOptionGroup,
            horizontalAlignmentToolbarOptionGroup,
            verticalAlignmentToolbarOptionGroup,
            textRotationToolbarOptionGroup,
            wrapTextToolbarOptionGroup,
            borderToolbarOptionGroup,
            numberFormatToolbarOptionGroup,
        ];
    }, [clipboardToolbarOptionGroup, fontToolbarOptionGroup, fillToolbarOptionGroup, horizontalAlignmentToolbarOptionGroup, verticalAlignmentToolbarOptionGroup, textRotationToolbarOptionGroup, wrapTextToolbarOptionGroup, borderToolbarOptionGroup]);

    const isRowLimitExceeded = useMemo(() => {
        const isRowLimitExceeded = activeSheet.rowLimitExeceeded;
        if (isRowLimitExceeded) {
            setShowRowLimitExceededMessage(true);
        }
        return isRowLimitExceeded;
    }, [activeSheet.rowLimitExeceeded]);

    const pushAlertMessage = (type: "warning" | "error", message: string) => {
        setAlertMessages((prev) => {
            const isMessageAlreadyInAlertMessages = prev.find((alertMessage) => alertMessage.message === message);
            if (isMessageAlreadyInAlertMessages) {
                return prev;
            }
            return [...prev, { id: (new Date()).getTime().toString(), type, message, creationDate: new Date() }];
        });
    }

    useEffect(() => {
        if (!isRowLimitExceeded && !showRowLimitExceededMessage) return;
        pushAlertMessage("warning", rowLimitExceededMessage);
    }, [showRowLimitExceededMessage]);

    useEffect(() => {
        if (!cellAddressError) return;
        pushAlertMessage("error", cellAddressError);
    }, [cellAddressError]);

    const rowLimitExceededMessage = useMemo(() => {
        return `The number of rows in the ${activeSheet.name} worksheet exceeds the row limit of ${ROW_LIMIT} rows. Only the first ${ROW_LIMIT} rows are been displayed.`;
    }, [activeSheet.name]);

    const columnsTemplateOfUpperToolbar = useMemo(() => {
        if (showSearchbar && !showWorkbookDetails) {
            return "max-content max-content 1fr max-content";
        }
        if (showWorkbookDetails && !showSearchbar) {
            return "max-content 1fr max-content";
        }
        if (!showSearchbar && !showWorkbookDetails) {
            return "1fr max-content";
        }
        return "max-content 1fr max-content";
    }, [showSearchbar, showWorkbookDetails])

    return (
        <div style={{ display: "grid", width: "100%", backgroundColor: "var(--excel-viewer-surface)" }}>
            <div className="excel-viewer-toolbar">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: columnsTemplateOfUpperToolbar,
                        alignItems: "center",
                        gap: "1rem",
                        height: "100%",
                        overflowX: "auto",
                    }}
                >
                    {showWorkbookDetails ?
                        <div className="excel-viewer-menu-button">
                            <WorkbookDetails
                                spreadsheetData={data}
                                iconColor={getToolbarOptionIconColor(true)}
                            />
                        </div> : null
                    }
                    <div className="excel-viewer-file-name-container">
                        <div style={{
                            maxWidth: "500px",
                            minWidth: "50px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            userSelect: "none"
                        }}>
                        {data.fileName}
                        </div>
                    </div>
                    {showSearchbar ?
                        <div className="excel-viewer-search-bar-container">
                            <div className="excel-viewer-search-bar-content-wrapper">
                                <SearchBar
                                    sheets={data.sheets}
                                    navigateToSearchResult={handleNavigateToCell}
                                />
                            </div>
                        </div> : null
                    }
                    <div style={{
                        display: "flex",
                        gap: "0.7rem",
                        alignItems: "center",
                        color: colorScheme === "dark" ? "#ffffff" : "#000000"
                    }}>
                        {viewSettings && viewSettings.showZoom ?
                            <div>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr max-content max-content",
                                    placeItems: "center",
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "0.25rem",
                                    backgroundColor: "transparent",
                                    gap: "0.5rem",
                                    userSelect: "none"
                                }}>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "max-content 1fr max-content",
                                            gap: "0.25rem",
                                            placeItems: "center",
                                            width: "150px",
                                            height: "100%",
                                            cursor: "pointer"
                                        }}
                                        onWheel={handleMouseWheelChangeInZoomOptionSection}
                                    >
                                        <div title={zoom === MIN_ZOOM_FACTOR ? undefined : "Zoom out"}
                                             style={{display: "grid", placeItems: "center"}}>
                                            <Minus
                                                size={16}
                                                style={{cursor: "pointer", ...(zoom === MIN_ZOOM_FACTOR ? {color: "gray"} : {})}}
                                                onClick={handleZoomOut}
                                            />
                                        </div>
                                        <div title="Slide to zoom in and out"
                                             style={{display: "grid", placeItems: "center"}}>
                                            <input type="range" min={MIN_ZOOM_FACTOR} max={MAX_ZOOM_FACTOR} step="2"
                                                   value={zoom}
                                                   onInput={(e) => setZoom(Math.floor(Number((e.target as HTMLInputElement).value)))}
                                                   style={{width: "100%", height: "20%", cursor: "pointer"}}/>
                                        </div>
                                        <div title={zoom === MAX_ZOOM_FACTOR ? undefined : "Zoom in"}
                                             style={{display: "grid", placeItems: "center"}}>
                                            <Plus size={16}
                                                  style={{cursor: "pointer", ...(zoom === MAX_ZOOM_FACTOR ? {color: "gray"} : {})}}
                                                  onClick={handleZoomIn}/>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: "grid",
                                        placeItems: "center",
                                        width: "40px",
                                        textAlign: "right",
                                        height: "100%",
                                        padding: "0.25rem",
                                        fontSize: "12px",
                                        borderRadius: "0.25rem",
                                        backgroundColor: "transparent"
                                    }}>
                                        {zoom}%
                                    </div>
                                    <ToolbarIcon
                                        // label={`Reset to ${DEFAULT_ZOOM_FACTOR}%`}
                                        icon={<ScanSearch size={TOOLBAR_ICON_SIZE} strokeWidth={1.8}/>}
                                        labelStyle={{color: zoom !== DEFAULT_ZOOM_FACTOR ? colorScheme === "dark" ? "#ffffff" : "gray" : "gray"}}
                                        tooltipTitle={zoom === DEFAULT_ZOOM_FACTOR ? undefined : `Reset zoom to ${DEFAULT_ZOOM_FACTOR}%`}
                                        iconWrapperStyle={{cursor: zoom !== DEFAULT_ZOOM_FACTOR ? "pointer" : "not-allowed"}}
                                        iconContainerStyle={{
                                            fontSize: "16px",
                                            color: getToolbarOptionIconColor(zoom !== DEFAULT_ZOOM_FACTOR)
                                        }}
                                        onClick={zoom !== DEFAULT_ZOOM_FACTOR ? () => setZoom(DEFAULT_ZOOM_FACTOR) : undefined}
                                    />
                                </div>
                            </div> : null
                        }
                        {viewSettings && viewSettings.showHighlightToggle ?
                            <div>
                                <ToolbarIcon
                                    // label={showHighlights ? "Hide" : "Show"}
                                    icon={<Highlighter size={TOOLBAR_ICON_SIZE} fontSize="16px" strokeWidth={1.8}/>}
                                    tooltipTitle={showHighlights ? "Hide highlights" : "Show highlights"}
                                    labelStyle={{userSelect: "none"}}
                                    iconWrapperStyle={{
                                        backgroundColor: showHighlights ? toolbarOptionActiveColor : "transparent",
                                        cursor: "pointer"
                                    }}
                                    iconContainerStyle={{
                                        fontSize: "16px",
                                        color: getToolbarOptionIconColor(showHighlights)
                                    }}
                                    onClick={() => setShowHighlights((prev) => !prev)}
                                />
                            </div> : null
                        }
                        {viewSettings && viewSettings.showHighlightList ?
                            <div>
                                <SpreadsheetHighlightsPopUp
                                    iconColor={getToolbarOptionIconColor(true)}
                                    highlights={rangesToHighlight}
                                    navigateToHighlight={handleNavigateToCell}
                                />
                            </div> : null
                        }
                        {viewSettings && viewSettings.showOriginalStylesToggle ?
                            <div>
                                <ToolbarIcon
                                    icon={<Paintbrush size={TOOLBAR_ICON_SIZE} fontSize="16px" strokeWidth={1.6}/>}
                                    tooltipTitle={!showStyles ? "Show styles" : "Hide styles"}
                                    labelStyle={{
                                        color: colorScheme === "dark" ? "#ffffff" : "gray",
                                        userSelect: "none"
                                    }}
                                    iconWrapperStyle={{
                                        backgroundColor: showStyles ? toolbarOptionActiveColor : "transparent",
                                        cursor: "pointer"
                                    }}
                                    iconContainerStyle={{
                                        fontSize: "16px",
                                        color: getToolbarOptionIconColor(showStyles),
                                    }}
                                    onClick={() => setShowStyles((prev) => !prev)}
                                />
                            </div> : null
                        }
                        {showNotifications ?
                            <div style={{
                                display: "flex",
                                gap: "0.7rem",
                                placeItems: "center",
                                width: "100%",
                                height: "100%",
                                cursor: "pointer"
                            }}>
                                <NotificationList
                                    notifications={alertMessages}
                                    iconColor={getToolbarOptionIconColor(true)}
                                    deleteAllNotifications={() => setAlertMessages([])}
                                    deleteNotification={(id) => setAlertMessages((prev) => prev.filter((alertMessage) => alertMessage.id !== id))}
                                />
                                <div className="excel-viewer-vertical-divider"/>
                            </div> : null
                        }
                        <div style={{
                            display: "flex",
                            gap: "0.7rem",
                            alignItems: "center",
                            color: colorScheme === "dark" ? "#ffffff" : "#000000"
                        }}>
                            {showOptionToolbar ?
                                <ToolbarIcon
                                    icon={<TableRowsSplit size={TOOLBAR_ICON_SIZE} strokeWidth={1.6}/>}
                                    tooltipTitle={showOptionsToolbar ? "Hide option toolbar" : "Show option toolbar"}
                                    iconWrapperStyle={{
                                        backgroundColor: showOptionsToolbar ? toolbarOptionActiveColor : "transparent",
                                        cursor: "pointer"
                                    }}
                                    iconContainerStyle={{
                                        fontSize: "16px",
                                        color: getToolbarOptionIconColor(showOptionsToolbar)
                                    }}
                                    onClick={() => setShowOptionsToolbar((prev) => !prev)}
                                /> : null
                            }
                        </div>
                    </div>
                </div>
            </div>
            {showOptionsToolbar && showOptionToolbar ?
                <div className="excel-viewer-toolbar excel-viewer-toolbar-options">
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: "0.5rem",
                        overflow: "hidden",
                        alignItems: "center",
                        fontSize: "14px",
                        padding: "0.4rem 0",
                        borderRadius: "0.25rem",
                        height: "100%",
                        width: "100%",
                        border: `1px solid ${colorScheme === "dark" ? "#606060" : "#cdd0d4"}`,
                        backgroundColor: colorScheme === "dark" ? "#404040" : "white"
                    }}>
                        <div style={{display: "flex", gap: "1rem", alignItems: "center", alignContent: "center", overflowX: "auto", overflowY: "hidden", height: "100%", padding: "0 1rem" }}>
                            {allToolbarOptionGroups.map((optionGroup, groupIndex, groupArray) =>
                                <Fragment key={optionGroup.title}>
                                    <div style={{ display: "grid", gridTemplateRows: "1fr max-content", gap: "0.25rem", alignItems: "center", height: "100%" }}>
                                        <div style={{ display: "flex", alignSelf: "center", alignItems: "center", justifyContent: "center", gap: "0.5rem", height: "100%" }}>
                                            {optionGroup.options.map((option, idx) =>
                                                <div key={idx} title={option.disabled ? undefined : option.title} style={{ display: "grid", placeItems: "center", cursor: "pointer", color: option.disabled ? "gray" : colorScheme === "dark" ? "#ffffff" : "#000000" }} onClick={option.onClick}>
                                                    {option.jsx}
                                                </div>
                                            )}

                                        </div>
                                        <div style={{ fontSize: "10px", fontFamily: "var(--excel-viewer-ui-font)", color: colorScheme === "dark" ? "#ffffff" : "gray", textAlign: "center", whiteSpace: "nowrap", width: "100%", userSelect: "none" }}>{optionGroup.title}</div>
                                    </div>
                                    {groupIndex === groupArray.length - 1 ? null : <div className="excel-viewer-toolbar-option-vertical-group-divider" />}
                                </Fragment>
                            )}
                        </div>
                    </div>
                </div>
                : null
            }
            <div className="excel-viewer-toolbar excel-viewer-toolbar-selected-range-details-container">
                {isEditingCellAddress ? (
                    <div style={{ display: "grid", gap: "0.1rem", alignItems: "center", width: "100%", height: "100%" }}>
                        <input
                            className={`excel-viewer-cell-addresse-input ${cellAddressError ? "excel-viewer-cell-addresse-input-error" : ""}`}
                            value={cellAddressInput}
                            autoFocus={true}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleCellAddressInput(e.target.value)}
                            onKeyDown={handleCellAddressKeyDown}
                            onBlur={handleCellAddressInputFocusLost}
                            placeholder="Enter cell address..."
                        />
                    </div>
                ) : (
                    <div
                        className="excel-viewer-cell-addresse"
                        title={selectedRange}
                        onClick={selectedRange ? () => handleCellClick(selectedRange?.includes(":") ? selectedRange?.split(":")[0] : selectedRange, activeSheet.name) : undefined}
                        onDoubleClick={() => setIsEditingCellAddress(true)}
                    >
                        <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "90%" }}>
                            {selectedRange ?? null}
                        </div>
                    </div>
                )}
                <div className="excel-viewer-formula-container">
                    <div style={{ display: "flex", fontSize: "14px", fontFamily: "var(--excel-viewer-ui-font)", color: "gray", alignItems: "center" }}>
                        <div style={{ fontSize: "16px", fontStyle: "italic", color: "gray", alignItems: "center", userSelect: "none" }}>fx</div>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            alignItems: "center",
                            border: `1px solid ${colorScheme === "dark" ? "#606060" : "#cdd0d4"}`,
                            padding: "0 0.5rem",
                            borderRadius: "0.25rem",
                            width: "100%",
                            height: "100%",
                            backgroundColor: colorScheme === "dark" ? "#404040" : "white",
                            color: colorScheme === "dark" ? "#ffffff" : "#000000",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "14px",
                                fontFamily: "var(--excel-viewer-ui-font)",
                                width: "99%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                            title={formulaOrValueOfSelectedCell}
                        >
                            {formulaOrValueOfSelectedCell}
                        </div>
                    </div>
                </div>
            </div>
            {alertMessages.length > 0 ?
                alertMessages
                    .filter((alertMessage) => !alertMessage.hidden)
                    .sort((a, b) => a.creationDate.getTime() - b.creationDate.getTime())
                    .slice(alertMessages.filter((alertMessage) => !alertMessage.hidden).length - 1)
                    .map((alertMessage, index) => (
                        <div key={`${alertMessage.message}-${index}`} className="excel-viewer-toolbar excel-viewer-toolbar-alert-message-container">
                            <AlertMessage
                                id={alertMessage.id}
                                message={alertMessage.message}
                                type={alertMessage.type}
                                creationDate={alertMessage.creationDate}
                                iconColor={getToolbarOptionIconColor(true)}
                                onClose={() => setAlertMessages((prev) => prev.map((a) => {
                                    if (a.id === alertMessage.id) {
                                        return { ...a, hidden: true };
                                    }
                                    return a;
                                }))}
                            />
                            <ToolbarIcon
                                icon={<div style={{ fontSize: "13px", color: "gray" }}>Hide all notifications</div>}
                                iconWrapperStyle={{ backgroundColor: "transparent", cursor: "pointer", padding: "0.5rem" }}
                                iconContainerStyle={{ color: getToolbarOptionIconColor(true), borderRadius: "0.5rem" }}
                                onClick={() => setAlertMessages((prev) => prev.map((a) => ({ ...a, hidden: true })))}
                            />
                        </div>
                    )) : null}
        </div>
    );
}
ToolbarSection.displayName = "ToolbarSection";

export default ToolbarSection;
