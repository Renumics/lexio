import { Bell, Trash2 } from "lucide-react";
import PopUp from "./PopUp";
import { AlertMessage } from "./types.ts";
import { TOOLBAR_ICON_SIZE } from "./utils";
import ToolbarIcon from "./ui/toolbar-icon/ToolbarIcon";
import { useState } from "react";
import { useTheme } from "./ThemeContextProvider";

type NotificationListProps = {
    notifications: AlertMessage[];
    iconColor: string;
    deleteAllNotifications: () => void;
    deleteNotification: (id: string) => void;
}
function NotificationList({ notifications, iconColor, deleteAllNotifications, deleteNotification }: NotificationListProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [hoveredNotificationIndex, setHoveredNotificationIndex] = useState<number | undefined>(undefined);
    const { colorScheme } = useTheme();

    return (
        <PopUp
            opened={isOpen}
            open={() => setIsOpen(true)}
            close={() => setIsOpen(false)}
            position="bottom-right"
            trigger={
                <ToolbarIcon
                    icon={<Bell size={TOOLBAR_ICON_SIZE} strokeWidth={1.6} />}
                    tooltipTitle={"Notifications"}
                    iconWrapperStyle={{ backgroundColor: "transparent", cursor: "pointer" }}
                    iconContainerStyle={{ fontSize: "16px", color: iconColor }}
                    badge={notifications.length}
                    badgeStyle={{
                        backgroundColor: notifications.length > 0 ? "var(--excel-viewer-selection)" : "transparent",
                        border: `2px solid white`,
                    }}
                    onClick={() => setIsOpen(true)}
                />
            }
            content={
                <div style={{ display: "grid", gridTemplateRows: "max-content 1fr", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr max-content", gap: "1rem", alignItems: "center", position: "sticky", top: "0", zIndex: 1000 }}>
                        <div>
                            <div style={{ fontWeight: "bold", fontSize: "13px" }}>Notifications</div>
                            {notifications.length > 0 ? <div style={{ fontSize: "12px", color: "gray" }}>{notifications.length} notifications</div> : null}
                        </div>
                        {notifications.length > 0 ?
                            <div style={{ fontSize: "13px", color: "var(--excel-viewer-selection)", cursor: "pointer" }} onClick={deleteAllNotifications}>
                                Clear all
                            </div> : null}
                    </div>
                    <div
                        style={{
                            display: "grid",
                            // borderRadius: "0.25rem",
                            overflowY: "auto",
                        }}
                    >
                        {notifications.length > 0 ?
                            notifications
                                .sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime())
                                .map((notification, index, array) => (
                                    <div
                                        key={notification.id}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "max-content 1fr max-content",
                                            gap: "0.5rem",
                                            alignItems: "center",
                                            padding: "0.5rem 0.5rem",
                                            borderBottom: index === array.length - 1 ? "none" : "1px solid var(--excel-viewer-border)",
                                            backgroundColor: hoveredNotificationIndex === index ? (colorScheme === "dark" ? "#606060" : "#f0f0f0") : "transparent",
                                        }}
                                        onClick={() => setIsOpen(true)}
                                        onMouseEnter={() => setHoveredNotificationIndex(index)}
                                        onMouseLeave={() => setHoveredNotificationIndex(undefined)}
                                    >
                                        <div style={{ alignSelf: "start", paddingTop: "0.45rem" }}>
                                            <Bell size={18} strokeWidth={1.6} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                                                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                            </div>
                                            <div style={{ fontSize: "12px", }} dangerouslySetInnerHTML={{ __html: notification.message }} />
                                        </div>
                                        <div style={{ display: "grid", gap: "0.25rem", alignItems: "start", alignSelf: "start" }}>
                                            <div style={{ fontSize: "11px", color: "gray" }}>{notification.creationDate.toLocaleString()}</div>
                                            <div style={{ fontSize: "11px", color: "var(--excel-viewer-selection)", cursor: "pointer", justifySelf: "end" }} onClick={() => deleteNotification(notification.id)}>
                                                <Trash2 size={20} strokeWidth={1.6} />
                                            </div>
                                        </div>
                                    </div>
                                )) : <div style={{ display: "grid", placeItems: "center", height: "100%", color: "gray" }}>
                                No notifications
                            </div>}
                    </div>
                </div>
            }
            popUpStyle={{
                minWidth: "400px",
                maxWidth: "400px",
                minHeight: "50px",
                maxHeight: "600px",
                border: "1px solid var(--excel-viewer-border)",
                // borderRadius: "0.25rem",
                padding: "1rem",
                overflow: "hidden",
            }}
        />
    );
}

export default NotificationList;
