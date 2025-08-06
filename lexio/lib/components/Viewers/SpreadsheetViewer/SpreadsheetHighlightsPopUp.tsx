import {CSSProperties, ReactNode, useEffect, useRef, useState} from "react";
import { SpreadsheetHighlight } from "./types.ts";
import { LayoutList } from "lucide-react";
import { useTheme } from "./ThemeContextProvider";

type SpreadsheetHighlightsPopUpProps = {
    highlights?: SpreadsheetHighlight[] | undefined;
    trigger: ReactNode;
    triggerContainerStyle?: CSSProperties | undefined;
    popUpStyle?: CSSProperties | undefined;
    navigateToHighlight: (sheetName: string, cellAddress: string) => void;
}
function SpreadsheetHighlightsPopUp({ highlights, trigger, triggerContainerStyle, popUpStyle, navigateToHighlight }: SpreadsheetHighlightsPopUpProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const triggerContainerRef = useRef<HTMLDivElement | null>(null);
    const popUpRef = useRef<HTMLDivElement | null>(null);

    const { resolvedColorScheme: colorScheme } = useTheme();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (triggerContainerRef.current && !triggerContainerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isOpen]);

    const positionPopUp = () => {
        if (!triggerContainerRef.current || !popUpRef.current) return;

        const { height, top, x, width } = triggerContainerRef.current.getBoundingClientRect();

        const viewportWidth = window.innerWidth;

        const right = viewportWidth - (x ?? 0) - (width ?? 0);

        popUpRef.current.style.position = "fixed";
        popUpRef.current.style.zIndex = "10000";
        popUpRef.current.style.top = `${(top ?? 0) + height + 5}px`;
        popUpRef.current.style.right = `${right}px`;
    }

    useEffect(() => {
        positionPopUp();
    }, [triggerContainerRef, popUpRef, isOpen]);

    useEffect(() => {
        positionPopUp();
        document.addEventListener("resize", positionPopUp);

        return () => {
            document.removeEventListener("resize", positionPopUp);
        };
    }, []);

    const onItemSelection = (sheetName: string, cellAddress: string) => {
        navigateToHighlight(sheetName, cellAddress);
        setIsOpen(false);
    }

    return (
        <>
            <div ref={triggerContainerRef} style={{ ...(triggerContainerStyle ?? {}), height: "100%", width: "100%" }} onClick={() => setIsOpen((prev) => !prev)}>
                {trigger}
            </div>
            <div
                ref={popUpRef}
                style={{
                    ...(popUpStyle ?? {}),
                    display: isOpen ? "grid" : "none",
                    overflowY: "auto",
                    boxShadow: "0 0 0.5px gray",
                    maxWidth: "350px",
                    maxHeight: "500px",
                    padding: "0",
                    overflow: "hidden",
                }}
                onMouseLeave={() => setIsOpen(false)}
            >
                <div style={{ backgroundColor: "inherit", overflow: "auto", width: "100%", maxHeight: "500px", padding: "0 1rem 1rem 1rem", display: "grid", gap: "0.5rem" }}>
                    <div style={{ display: "grid", gap: "0.2rem", padding: "1rem 0 0 0", color: colorScheme === "dark" ? "#ffffff" : "#000000", whiteSpace: "nowrap", width: "100%", position: "sticky", top: "0", zIndex: "2", backgroundColor: "inherit" }}>
                        <div style={{ fontSize: "16px", width: "100%", position: "sticky", top: "0", zIndex: "2", backgroundColor: "inherit" }}>
                            All highlights
                        </div>
                        {highlights && highlights.length > 0 ?
                        <div style={{ color: "gray", fontSize: "13px", width: "100%" }}>{highlights.length} sheet{highlights.length > 0 ? "s" : ""} highlighted</div> : null}
                        
                    </div>
                    <div>
                    {highlights ? highlights.map((highlight, index, array) => (
                        <div key={index} style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.5rem", borderBottom: index === array.length - 1 ? "none" : `1px solid ${colorScheme === "dark" ? "#606060" : "#cdd0d4"}`, padding: "1rem 0" }}>
                            <div style={{ alignSelf: "start", display: "grid", width: "100%", height: "100%" }}>
                                <div style={{ alignSelf: "start", display: "grid", fontSize: "16px", width: "100%", height: "100%", marginTop: "0.25rem", color: colorScheme === "dark" ? "#ffffff" : "#000000" }}>
                                    <LayoutList size={16} fontSize="16px" />
                                </div>
                            </div>
                            <div style={{ display: "grid" }}>
                                <div style={{ fontFamily: "var(--excel-viewer-ui-font)", color: colorScheme === "dark" ? "#ffffff" : "#000000", whiteSpace: "nowrap", width: "100%" }}>
                                    {highlight.sheetName}
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", width: "100%", overflow: "auto", marginTop: "0.5rem" }}>
                                    {highlight.ranges.map((range, idx) => (
                                        <div
                                        key={idx}
                                        style={{ fontSize: "12px", textAlign: "center", display: "flex", gap: "0.5rem", backgroundColor: "gray", padding: "0.25rem 0.4rem", color: "white", borderRadius: "0.5rem" }} onClick={() => onItemSelection(highlight.sheetName, range.split(":")[0])}>
                                            {range}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )) : <div style={{ color: "gray", fontSize: "13px", width: "100%" }}>No highlights</div>}
                    </div>
                </div>
            </div>
        </>
    );
}
SpreadsheetHighlightsPopUp.displayName = "SpreadsheetHighlightsPopUp";

export default SpreadsheetHighlightsPopUp;
