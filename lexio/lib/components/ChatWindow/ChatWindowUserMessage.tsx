import React, {ReactNode} from "react";
import {ChatWindowStyles} from "./ChatWindow.tsx";

/**
 * Props for the ChatWindowUserMessage component.
 * @typedef {Object} ChatWindowUserMessageProps
 * @property {string} message - The user message content.
 * @property {ChatWindowStyles} style - Styling options for the chat window.
 * @property {string} roleLabel - Label indicating the role of the user.
 * @property {boolean} showRoleIndicator - Flag to show or hide the role indicator.
 * @property {ReactNode} [icon] - Optional icon to display alongside the message.
 */
interface ChatWindowUserMessageProps {
    message: string;
    style: ChatWindowStyles;
    roleLabel: string;
    showRoleIndicator: boolean;
    icon?: ReactNode;
}

/**
 * Renders a user message within the chat window, supporting role indicators and optional icons.
 *
 * @param {ChatWindowUserMessageProps} props - The props for the component.
 * @returns {JSX.Element} The rendered user message.
 *
 * @internal
 */
const ChatWindowUserMessage: React.FC<ChatWindowUserMessageProps> = ({
                                                                         message,
                                                                         style,
                                                                         roleLabel,
                                                                         showRoleIndicator,
                                                                         icon
                                                                     }) => {
    const showIcon = showRoleIndicator && !!icon;
    const showLabel = showRoleIndicator && !!roleLabel && !showIcon;

    return (
        <div className={`w-full flex ${showIcon ? 'justify-end' : 'flex-col items-end'} ps-10`}>
            {showLabel && <strong className="inline-block mr-2 mb-1" style={{
                fontSize: style.roleLabelFontSize,
                lineHeight: 'normal',
            }}>{roleLabel}</strong>}
            <div className="py-1 px-3.5 shadow-sm" style={{
                backgroundColor: style.messageBackgroundColor,
                borderRadius: style.messageBorderRadius,
                fontSize: style.messageFontSize,
            }}>
                <div className="inline" style={{whiteSpace: 'pre-wrap'}}>{message}</div>
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
    );
}

export {ChatWindowUserMessage};