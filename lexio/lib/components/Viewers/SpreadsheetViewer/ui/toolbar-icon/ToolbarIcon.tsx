import {CSSProperties, ReactNode} from "react";
import "./ToolbarIcon.css";

type ToolbarIconProps = {
    icon: ReactNode;
    backgroundColor?: string | undefined;
    label?: string | undefined;
    tooltipTitle?: string | undefined;
    iconWrapperStyle?: CSSProperties | undefined;
    iconContainerStyle?: CSSProperties | undefined;
    labelStyle?: CSSProperties | undefined;
    withBorder?: boolean | undefined;
    onClick?: (() => void) | undefined;
    badge?: number | undefined;
    badgeStyle?: CSSProperties | undefined;
}

function ToolbarIcon({
                         icon,
                         backgroundColor,
                         onClick,
                         label,
                         tooltipTitle,
                         iconWrapperStyle,
                         iconContainerStyle,
                         labelStyle,
                         withBorder = true,
                         badge,
                         badgeStyle,
                     }: ToolbarIconProps) {
    return (
        <div className="excel-viewer-toolbar-icon-container" onClick={onClick} title={tooltipTitle}>
            <div
                style={{
                    height: "100%",
                    padding: "0.25rem",
                    borderRadius: "0.25rem",
                    border: withBorder ? "1px solid var(--excel-viewer-border)" : "none",
                    backgroundColor: backgroundColor,
                    ...(iconWrapperStyle ?? {}),
                }}
            >
                <div
                    style={{
                        display: "grid",
                        placeItems: "center",
                        margin: 0,
                        padding: 0,
                        position: "relative",
                        ...(iconContainerStyle ?? {}),
                    }}
                >
                    {icon}
                    {badge !== undefined && badge > 0 && (
                        <div
                            style={{
                                position: "absolute",
                                top: "-12px",
                                right: "-14px",
                                backgroundColor: "#ef4444",
                                color: "white",
                                borderRadius: "50%",
                                minWidth: "18px",
                                height: "24px",
                                width: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                // fontWeight: "bold",
                                border: "2px solid white",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                                zIndex: 10,
                                ...(badgeStyle ?? {}),
                            }}
                        >
                            {badge > 10 ? "10+" : badge}
                        </div>
                    )}
                </div>
            </div>
            {label ?
                <div
                    style={{
                        fontSize: "10px",
                        textAlign: "center",
                        color: "gray",
                        whiteSpace: "nowrap",
                        ...(labelStyle ?? {}),
                    }}
                >
                    {label}
                </div>
                : null}
        </div>
    );
}
ToolbarIcon.displayName = "ToolbarIcon";

export default ToolbarIcon;
