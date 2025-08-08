import {CSSProperties, ReactNode, useEffect, useRef} from "react";
import { useTheme } from "./ThemeContextProvider";

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
function PopUp({ content, position, trigger, containerStyle, popUpStyle, opened, open, close }: PopUpProps) {
    const { colorScheme } = useTheme();
    const triggerContainerRef = useRef<HTMLDivElement | null>(null);
    const popUpRef = useRef<HTMLDivElement | null>(null);

    const positionPopUp = () => {
        if (!triggerContainerRef.current || !popUpRef.current) return;

        const { height, top, x, width, left } = triggerContainerRef.current.getBoundingClientRect();
        const topOffset = top + height + 5;
        const appContainerHeight = (document.getElementById("theme-app-container")?.clientHeight ?? window.innerHeight);
        const maxHeight = appContainerHeight && appContainerHeight < 500 ? (appContainerHeight * 0.9) - topOffset : 500;

        popUpRef.current.style.position = "fixed";
        switch (position) {
            case "top-right": {
                // position the pop-up to the top right of the trigger
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
        // popUpRef.current.style.top = `${topOffset}px`;
        // popUpRef.current.style.left = `${x}px`;
        popUpRef.current.style.width = `${width}px`;
        popUpRef.current.style.maxHeight = `${maxHeight}px`;
    }

    useEffect(() => {
        positionPopUp();
    }, [opened, position, popUpStyle]);

    const handleOpen = () => {
        open?.();
    }

    const handleClose = () => {
        close?.();
    }

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
    }, [opened]);

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
    }, [opened]);

    useEffect(() => {
        window.addEventListener("resize", positionPopUp);
        return () => {
            window.removeEventListener("resize", positionPopUp);
        };
    }, []);

    return (
        <div ref={triggerContainerRef} style={{ position: "relative", ...(containerStyle ?? {}) }} onClick={handleOpen}>
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
