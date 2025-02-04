import React, {ReactNode} from "react";
import {ChatWindowStyles} from "./ChatWindow.tsx";

interface ChatWindowUserMessageProps {
    message: string;
    style: ChatWindowStyles;
    roleLabel: string;
    showRoleIndicator: boolean;
    icon?: ReactNode;
}

const ChatWindowUserMessage :React.FC<ChatWindowUserMessageProps> = ({
    message,
    style,
    roleLabel,
    showRoleIndicator,
    icon
}) => {
    const showIcon = showRoleIndicator && !!icon;
    const showLabel = showRoleIndicator && !!roleLabel && !showIcon;

    return <div className={`w-full flex ${showIcon ? 'justify-end': 'flex-col items-end'} ps-10`}>
        {showLabel && <strong className="inline-block mr-2 mb-1" style={{
            fontSize: style.roleLabelFontSize,
            lineHeight: 'normal',
        }}>{roleLabel}</strong>}
        <div className="py-1 px-3.5 shadow-sm" style={{
            backgroundColor: style.messageBackgroundColor,
            borderRadius: style.messageBorderRadius,
            fontSize: style.messageFontSize,
        }}>
            <div className="inline" style={{ whiteSpace: 'pre-wrap' }}>{message}</div>
        </div>
        {showIcon && <div className="flex flex-col items-center m-2">
            <div className="w-fit h-fit p-1 rounded-3xl" style={{
                backgroundColor: style.messageBackgroundColor,
                border: `2px solid ${style.messageBackgroundColor}`,
            }}>
                {icon}
            </div>
        </div>}
    </div>

}

export { ChatWindowUserMessage };