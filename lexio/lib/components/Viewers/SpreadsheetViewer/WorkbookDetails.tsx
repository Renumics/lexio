import {Menu, X} from "lucide-react";
import PopUp from "./PopUp";
import ToolbarIcon from "./ui/toolbar-icon/ToolbarIcon";
import {formatDate, TOOLBAR_ICON_SIZE} from "./utils";
import {SpreadsheetData} from "./types.ts";
import {useState} from "react";

type WorkbookDetailsProps = {
    spreadsheetData: SpreadsheetData;
    iconColor: string;
}

function WorkbookDetails({ spreadsheetData, iconColor }: WorkbookDetailsProps) {
    const { fileName, fileSize, lastModified, createdOn, fileType } = spreadsheetData;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <PopUp
            opened={isOpen}
            open={() => setIsOpen(true)}
            close={() => setIsOpen(false)}
            content={
                <div style={{ display: "grid", gap: "1.5rem" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr max-content",
                            gap: "0.5rem",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ fontSize: "16px", fontWeight: "bold" }}>Workbook Details</div>
                        <div
                            title="Close workbook details menu"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}>
                            <X size={20} strokeWidth={1.6} />
                        </div>
                    </div>
                    <div style={{ display: "grid", height: "100%", width: "100%" }}>
                        <WorkbookDetailsItem label="File name" value={fileName ?? "Unknown"} />
                        <WorkbookDetailsItem label="File size" value={fileSize ?? "Unknown"} />
                        <WorkbookDetailsItem label="File type" value={fileType ?? "Unknown"} />
                        <WorkbookDetailsItem
                            label="Created on"
                            value={createdOn ? formatDate(createdOn) : "Unknown"}
                        />
                        <WorkbookDetailsItem
                            label="Last modified"
                            value={lastModified ? formatDate(lastModified) : "Unknown"}
                            isLastItem={true}
                        />
                    </div>
                </div>
            }
            position="bottom-left"
            trigger={
                <ToolbarIcon
                    icon={<Menu size={TOOLBAR_ICON_SIZE} strokeWidth={1.6} />}
                    tooltipTitle={"Workbook Details"}
                    iconWrapperStyle={{ backgroundColor: "transparent", cursor: "pointer" }}
                    iconContainerStyle={{ fontSize: "16px", color: iconColor }}
                    onClick={() => setIsOpen((prev) => !prev)}
                />
            }
            popUpStyle={{
                position: "absolute",
                minWidth: "370px",
                maxWidth: "370px",
                minHeight: "calc(var(--excel-viewer-container-height) * 0.98)",
                maxHeight: "calc(var(--excel-viewer-container-height) * 0.98)",
                height: "100%",
                border: "1px solid var(--excel-viewer-border)",
                borderRadius: "0.5rem",
                padding: "1rem",
                margin: "auto",
                marginLeft: "0.05rem",
                overflow: "hidden",
                animation: "popLeft 0.15s ease-in-out",
            }}
        />
    )
}
WorkbookDetails.displayName = "WorkbookDetails";

type WorkbookDetailsItemProps = {
    label: string;
    value: string;
    isLastItem?: boolean;
}
function WorkbookDetailsItem({ label, value, isLastItem }: WorkbookDetailsItemProps) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
                gap: "2rem",
                alignItems: "center",
                fontSize: "14px",
                fontFamily: "var(--excel-viewer-ui-font)",
                padding: "1rem 0.5rem",
                borderBottom: isLastItem ? "none" : "1px solid var(--excel-viewer-border)",
            }}
        >
            <div style={{ color: "gray", fontSize: "13px", userSelect: "none" }}>{label}</div>
            <div
                title={value}
                style={{
                    fontSize: "14px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "100%",
                    textAlign: "right"
                }}
            >
                {value}
            </div>
        </div>
    )
}
WorkbookDetailsItem.displayName = "WorkbookDetailsItem";

export default WorkbookDetails;
