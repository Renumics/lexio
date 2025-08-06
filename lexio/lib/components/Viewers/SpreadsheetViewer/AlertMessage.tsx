import { TriangleAlert, CircleX } from "lucide-react";
import ToolbarIcon from "./ui/toolbar-icon/ToolbarIcon";
import { AlertMessage as AlertMessageType } from "./types.ts";

type AlertMessageProps = AlertMessageType & {
    iconColor: string;
    onClose: () => void;
}

function AlertMessage({ message, onClose, type, iconColor }: AlertMessageProps) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr max-content", gap: "0.5rem", alignItems: "center", alignContent: "center", height: "100%", width: "100%" }}>
            <ToolbarIcon
                icon={type === "warning" ? <TriangleAlert size={22} /> : <CircleX size={22} />}
                iconWrapperStyle={{ backgroundColor: "transparent", cursor: "pointer" }}
                iconContainerStyle={{ color: type === "warning" ? "#dfdf15" : "#ef4444" }}
                withBorder={false}
            />
            <div
                title={message}
                style={{ display: "grid", alignItems: "center", alignContent: "center", fontSize: "14px", fontFamily: "var(--excel-viewer-ui-font)", color: "gray", marginLeft: "-0.25rem" }}
            >
                <div style={{ width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <b>{type === "warning" ? "Warning:" : "Error:"}</b> <span dangerouslySetInnerHTML={{ __html: message }} />
                </div>
            </div>
            <ToolbarIcon
                icon={<div style={{ fontSize: "13px", color: "gray" }}>Hide notification</div>}
                iconWrapperStyle={{ backgroundColor: "transparent", cursor: "pointer", padding: "0.5rem" }}
                iconContainerStyle={{ color: iconColor, borderRadius: "0.5rem" }}
                onClick={() => onClose()}
            />
        </div>
    );
}

export default AlertMessage;
