import React, {ReactNode} from "react";
import {ChatWindowStyles} from "./ChatWindow.tsx";

interface ChatWindowAssistantMessageProps {
    message: string;
    style: ChatWindowStyles;
    roleLabel: string;
    showRoleIndicator: boolean;
    icon?: ReactNode;
}

const ChatWindowAssistantMessage: React.FC<ChatWindowAssistantMessageProps> = ({
    message,
    style,
    roleLabel,
    showRoleIndicator,
    icon
}) => {
    // show icon if showRoleIndicator is true and icon is not null
    const showIcon = showRoleIndicator && !!icon;
    // show label if showRoleIndicator is true and roleLabel is not null and icon is not shown
    const showLabel = showRoleIndicator && !!roleLabel && !showIcon;

    return <div className={`w-full flex ${showIcon ? 'justify-start': 'flex-col items-start'} pe-10`}>
        {showLabel && <strong className="inline-block ml-2 mb-1" style={{
            fontSize: style.roleLabelFontSize,
            lineHeight: 'normal',
        }}>{roleLabel}</strong>}
        {showIcon && <div className="flex flex-col items-center m-2">
            <div className="w-fit h-fit p-1 rounded-3xl" style={{
                backgroundColor: style.messageBackgroundColor,
                border: `2px solid ${style.messageBackgroundColor}`,
            }}>
                {icon}
            </div>
        </div>}
        <div className="mb-6 py-1 px-3.5 shadow-sm" style={{
            backgroundColor: style.messageBackgroundColor,
            borderRadius: style.messageBorderRadius,
            fontSize: style.messageFontSize,
        }}>
            <div className="inline" style={{ whiteSpace: 'pre-wrap' }}>{message}</div>
        </div>
    </div>
}

export { ChatWindowAssistantMessage };