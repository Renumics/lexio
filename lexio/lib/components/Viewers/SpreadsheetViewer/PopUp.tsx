import {CSSProperties, ReactNode, useEffect, useRef, useCallback} from "react";
import { useTheme } from "./ThemeContextProvider";

/**
 * Props for the PopUp component
 *
 * @type PopUpProps
 * @property {ReactNode} content - Content of the pop-up.
 * @property {"top-right" | "top-left" | "bottom-right" | "bottom-left" | "top" | "bottom" | "left" | "right" | "fixed"} position - Position of the pop-up relative to its trigger.
 * @property {ReactNode} trigger - Trigger of the pop-up.
 * @property {CSSProperties | undefined} containerStyle - Styles of the main container of the pop-up.
 * @property {CSSProperties | undefined} popUpStyle - Styles of the pop-up it-self.
 * @property {boolean | undefined} opened - Flag indicating that the pop-up is opened or not.
 * @property {(() => void) | undefined} open - Callback that opens the pop-up.
 * @property {(() => void) | undefined} close - Callback that closes the pop-up.
 */
type PopUpProps = {
    content: ReactNode;
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top" | "bottom" | "left" | "right" | "fixed";
    trigger: ReactNode;
    containerStyle?: CSSProperties | undefined;
    popUpStyle?: CSSProperties | undefined;
    opened?: boolean | undefined;
    open?: (() => void) | undefined;   
    close?: (() => void) | undefined;   
}
/**
 * Component that renders a pop-up.
 *
 * @param {PopUpProps} props - Props of the PopUp component.
 * @returns {JSX.Element} The rendered component.
 */
function PopUp({ content, position, trigger, containerStyle, popUpStyle, opened, close }: PopUpProps) {
    const { colorScheme } = useTheme();
    const triggerContainerRef = useRef<HTMLDivElement | null>(null);
    const popUpRef = useRef<HTMLDivElement | null>(null);

    const positionPopUp = useCallback(() => {
        if (!triggerContainerRef.current || !popUpRef.current) return;

        const { height, top, x, width, left } = triggerContainerRef.current.getBoundingClientRect();
        const topOffset = top + height + 5;
        const appContainerHeight = (document.getElementById("theme-app-container")?.clientHeight ?? window.innerHeight);
        const maxHeight = appContainerHeight && appContainerHeight < 500 ? (appContainerHeight * 0.9) - topOffset : 500;

        popUpRef.current.style.position = "fixed";
        switch (position) {
            case "top-right": {
                popUpRef.current.style.top = `${topOffset}px`;
                popUpRef.current.style.left = `${x + width}px`;
                break;
            }
            case "top-left": {
                popUpRef.current.style.top = `${topOffset}px`;
                popUpRef.current.style.left = `${x}px`;
                break;
            }
            case "bottom-right": {
                popUpRef.current.style.top = `${topOffset}px`;
                popUpRef.current.style.left = `${left + width - popUpRef.current.clientWidth}px`;
                break;
            }
            case "bottom-left": {
                popUpRef.current.style.top = top ? `${top - 7}px` : `${topOffset}px`;
                popUpRef.current.style.left = `${left - 5}px`;
                break;
            }
            case "top": {
                popUpRef.current.style.top = `${topOffset}px`;
                popUpRef.current.style.left = `${x}px`;
                break;
            }
            case "bottom": {
                popUpRef.current.style.top = `${topOffset}px`;
                popUpRef.current.style.left = `${x}px`;
                break;
            }
            case "left": {
                popUpRef.current.style.top = `${topOffset}px`;
                popUpRef.current.style.left = `${x}px`;
                break;
            }
            case "right": {
                popUpRef.current.style.top = `${topOffset}px`;
                popUpRef.current.style.left = `${x + width}px`;
                break;
            }
            case "fixed": {
                popUpRef.current.style.top = "0";
                popUpRef.current.style.left = "0";
                break;
            }
            default: {
                popUpRef.current.style.top = `${topOffset}px`;
                popUpRef.current.style.left = `${x}px`;
                break;
            }
        }
        popUpRef.current.style.width = `${width}px`;
        popUpRef.current.style.maxHeight = `${maxHeight}px`;
    }, [position]);

    useEffect(() => {
        positionPopUp();
    }, [opened, position, popUpStyle, positionPopUp]);

    const handleClose = useCallback(() => {
        close?.();
    }, [close]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (triggerContainerRef.current && !triggerContainerRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };
        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [handleClose, opened]);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };
        document.addEventListener("keydown", handleEscapeKey);

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [handleClose, opened]);

    useEffect(() => {
        window.addEventListener("resize", positionPopUp);
        return () => {
            window.removeEventListener("resize", positionPopUp);
        };
    }, [positionPopUp]);

    return (
        <div ref={triggerContainerRef} style={{ position: "relative", ...(containerStyle ?? {}) }}>
            {trigger}
            <div
                ref={popUpRef}
                style={{
                    ...(popUpStyle ?? {}),
                    display: opened && content ? "block" : "none",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1000,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "0",
                    borderRadius: popUpStyle?.borderRadius ?? "0.25rem",
                    border: `1px solid ${colorScheme === 'dark' ? '#606060' : '#cdd0d4'}`,
                    backgroundColor: "var(--excel-viewer-card)",
                    color: "var(--excel-viewer-body-foreground)",
                    fontSize: "12px",
                    fontFamily: "var(--excel-viewer-ui-font)",
                    textOverflow: "ellipsis",
                }}>
                <div
                    style={{
                        padding: "1rem",
                        overflowY: "auto",
                        backgroundColor: "var(--excel-viewer-card)",
                        color: "var(--excel-viewer-body-foreground)",
                        width: "100%",
                    }}
                >
                    {content}
                </div>
            </div>
        </div>
    );
}
PopUp.displayName = "PopUp";

export default PopUp;
