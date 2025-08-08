import { Fragment, useEffect, useState } from "react"
import { useTheme } from "./ThemeContextProvider"
import "./SheetTabs.css"

interface SheetTabsProps {
  sheets: Array<{
    name: string;
    data: any[][];
    styles: any;
    merges?: any[];
    colWidths?: number[];
    rowHeights?: number[];
  }>
  activeIndex: number;
  onSheetChange: (index: number) => void;
}

const SheetTabs = ({ sheets, activeIndex, onSheetChange }: SheetTabsProps) => {
  const { colorScheme } = useTheme();
  const [hoveredTab, setHoveredTab] = useState<number | undefined>(undefined);

  useEffect(() => {
    const activeTab = document.querySelector(".active-sheet-tab");
    if (!activeTab) return;
    activeTab.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, [activeIndex]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        backgroundColor: "var(--excel-viewer-surface)",
        overflowX: "auto",
        overflowY: "hidden",
        height: "45px",
        padding: "0.25rem 0.25rem",
        borderTop: "1px solid",
        borderColor: colorScheme === "dark" ? "#606060" : "#cdd0d4",
        boxShadow: "0 0 0.5rem 0 rgba(0, 0, 0, 0.1)",
      }}
    >
      {sheets.map((sheet, index, array) => (
        <Fragment key={sheet.name}>
          <div
          className={index === activeIndex ? "active-sheet-tab" : ""}
          key={sheet.name}
          onClick={() => onSheetChange(index)}
          style={{
            ...(index === activeIndex || hoveredTab === index ? {
              backgroundColor: colorScheme === "dark" ? "#404040" : "white",
              color: colorScheme === "dark" ? "#ffffff" : "#1e293b",
            } : {
              backgroundColor: "transparent",
              color: colorScheme === "dark" ? "#a0a0a0" : "#64748b",
            }),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            padding: "0.1rem 1.5rem",
            fontSize: "12px",
            fontWeight: index === activeIndex ? "600" : "500",
            color: index === activeIndex ? (colorScheme === "dark" ? "#ffffff" : "#1e293b") : (colorScheme === "dark" ? "#a0a0a0" : "#64748b"),
            cursor: "pointer",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            maxWidth: "300px",
            width: "100%",
            height: "100%",
            textAlign: "center",
            borderRadius: "0.3rem",
            boxShadow: index === activeIndex ? "0 0 0.5rem 0 rgba(0, 0, 0, 0.1)" : "none",
          }}
          onMouseEnter={() => setHoveredTab(index)}
          onMouseLeave={() => setHoveredTab(undefined)}
        >
          <div className="excel-viewer-tab-content" title={sheet.name}>
            {sheet.name}
          </div>       
        </div>          
        {index !== array.length - 1 && <div className="excel-viewer-separator">|</div>}
        </Fragment>
      ))}      
    </div>
  )
};
SheetTabs.displayName = "SheetTabs";

export default SheetTabs;
