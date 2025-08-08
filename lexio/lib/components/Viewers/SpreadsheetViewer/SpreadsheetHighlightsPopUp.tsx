import {useState} from "react";
import {SpreadsheetHighlight} from "./types.ts";
import {LayoutList} from "lucide-react";
import {useTheme} from "./ThemeContextProvider";
import PopUp from "./PopUp.tsx";
import {TOOLBAR_ICON_SIZE} from "./utils.ts";
import ToolbarIcon from "./ui/toolbar-icon/ToolbarIcon.tsx";

type SpreadsheetHighlightsPopUpProps = {
    highlights?: SpreadsheetHighlight[] | undefined;
    iconColor: string;
    navigateToHighlight: (sheetName: string, cellAddress: string) => void;
}
function SpreadsheetHighlightsPopUp({ highlights, iconColor, navigateToHighlight }: SpreadsheetHighlightsPopUpProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { colorScheme } = useTheme();

    const onItemSelection = (sheetName: string, cellAddress: string) => {
        navigateToHighlight(sheetName, cellAddress);
        setIsOpen(false);
    }

    return (
        <PopUp
            opened={isOpen}
            open={() => setIsOpen(true)}
            close={() => setIsOpen(false)}
            position="bottom-right"
            trigger={
                <ToolbarIcon
                    icon={<LayoutList size={TOOLBAR_ICON_SIZE} fontSize="16px"
                                      strokeWidth={1.8}/>}
                    tooltipTitle="All highlights"
                    labelStyle={{
                        color: colorScheme === "dark" ? "#ffffff" : "gray",
                        userSelect: "none",
                    }}
                    iconWrapperStyle={{backgroundColor: "transparent", cursor: "pointer"}}
                    iconContainerStyle={{
                        fontSize: "16px",
                        color: iconColor,
                    }}
                />
            }
            content={
                <div>
                    <div style={{
                        backgroundColor: "inherit",
                        overflow: "auto",
                        width: "100%",
                        maxHeight: "500px",
                        display: "grid",
                        gap: "0.5rem"
                    }}>
                        <div style={{
                            display: "grid",
                            gap: "0.2rem",
                            gridTemplateColumns: "1fr max-content",
                            color: colorScheme === "dark" ? "#ffffff" : "#000000",
                            whiteSpace: "nowrap",
                            width: "100%",
                            position: "sticky",
                            top: "0",
                            zIndex: "2",
                            backgroundColor: "inherit",
                            marginBottom: "0.7rem",
                        }}>
                            <div style={{
                                fontWeight: "bold",
                                fontSize: "13px",
                                width: "100%",
                                position: "sticky",
                                top: "0",
                                zIndex: "2",
                                backgroundColor: "inherit"
                            }}>
                                All highlights
                            </div>
                            {highlights && highlights.length > 0 ?
                                <div style={{
                                    color: "gray",
                                    fontSize: "11px",
                                    width: "100%"
                                }}>{highlights.length} sheet{highlights.length > 0 ? "s" : ""} highlighted</div> : null}

                        </div>
                        <div>
                            {highlights ? highlights.map((highlight, index, array) => (
                                <div key={index} style={{
                                    display: "grid",
                                    gridTemplateColumns: "max-content 1fr",
                                    gap: "0.5rem",
                                    borderBottom: index === array.length - 1 ? "none" : `1px solid ${colorScheme === "dark" ? "#606060" : "#cdd0d4"}`,
                                    padding: index === 0 ? "unset" : "1rem 0",
                                }}>
                                    <div style={{alignSelf: "start", display: "grid", width: "100%", height: "100%"}}>
                                        <div style={{
                                            alignSelf: "start",
                                            display: "grid",
                                            fontSize: "16px",
                                            width: "100%",
                                            height: "100%",
                                            marginTop: "0.25rem",
                                            color: colorScheme === "dark" ? "#ffffff" : "#000000"
                                        }}>
                                            <LayoutList size={16} fontSize="16px"/>
                                        </div>
                                    </div>
                                    <div style={{display: "grid"}}>
                                        <div style={{
                                            fontFamily: "var(--excel-viewer-ui-font)",
                                            color: colorScheme === "dark" ? "#ffffff" : "#000000",
                                            whiteSpace: "nowrap",
                                            width: "100%"
                                        }}>
                                            {highlight.sheetName}
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            gap: "0.25rem",
                                            flexWrap: "wrap",
                                            width: "100%",
                                            overflow: "auto",
                                            marginTop: "0.25rem"
                                        }}>
                                            {highlight.ranges.map((range, idx) => (
                                                <div
                                                    key={idx}
                                                    title={range}
                                                    style={{
                                                        fontSize: "11px",
                                                        textAlign: "center",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.5rem",
                                                        backgroundColor: "gray",
                                                        padding: "0.2rem 0.5rem",
                                                        color: "white",
                                                        borderRadius: "0.25rem",
                                                        cursor: "pointer",
                                                        userSelect: "none",
                                                    }}
                                                    onClick={() => onItemSelection(highlight.sheetName, range.split(":")[0])}>
                                                    {range}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )) : <div style={{color: "gray", fontSize: "13px", width: "100%"}}>No highlights</div>}
                        </div>
                    </div>
                </div>
            }
            popUpStyle={{
                display: isOpen ? "grid" : "none",
                overflowY: "auto",
                minWidth: "350px",
                maxWidth: "350px",
                maxHeight: "500px",
                padding: "0",
                overflow: "hidden",
                border: `1px solid ${colorScheme === "dark" ? "#606060" : "#cdd0d4"}`,
                backgroundColor: colorScheme === "dark" ? "#404040" : "white",
            }}
        />
    );
}
SpreadsheetHighlightsPopUp.displayName = "SpreadsheetHighlightsPopUp";

export default SpreadsheetHighlightsPopUp;
