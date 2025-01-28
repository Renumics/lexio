import React, { useEffect, useRef, useContext } from 'react';
import { useHotkeys, Options } from 'react-hotkeys-hook';
import { ViewerToolbar, ViewerToolbarStyles } from "../ViewerToolbar";
import { ZOOM_CONSTANTS } from "../types";
import './HtmlViewer.css';
import DOMPurify from 'dompurify';
import { ThemeContext, removeUndefined } from "../../../theme/ThemeContext";

const { ZOOM_STEP, MIN_SCALE, MAX_SCALE } = ZOOM_CONSTANTS;

export interface HtmlViewerStyles extends ViewerToolbarStyles {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;

    viewerBorderRadius?: string;
    viewerBackground?: string;
    viewerPadding?: string;

    contentBackground?: string;
    contentPadding?: string;
    contentBorderRadius?: string;
}

interface HTMLViewerProps {
    htmlContent: React.ReactNode | string; // Accept both string and React elements
    styleOverrides?: HtmlViewerStyles;
}

const HtmlViewer = ({ htmlContent, styleOverrides = {} }: HTMLViewerProps) => {
    const [scale, setScale] = React.useState(1);
    const containerRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;

    // --- use theme ---
    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error('ThemeContext is undefined');
    }
    const { colors, componentDefaults } = theme.theme;

    // --- merge theme defaults + overrides ---
    const style: HtmlViewerStyles = {
        backgroundColor: colors.background,
        color: colors.text,
        padding: 'none',
        borderRadius: componentDefaults.borderRadius,

        toolbarBorderRadius: componentDefaults.borderRadius,
        toolbarChipBackground: '#f0f0f0',
        toolbarChipBorderRadius: componentDefaults.borderRadius,
        toolbarChipInputBackground: '#ffffff',
        toolbarButtonBorderRadius: componentDefaults.borderRadius,
        toolbarSecondaryBackground: colors.secondaryBackground,
        toolbarButtonBackground: colors.primary,
        toolbarButtonColor: 'white',

        viewerBorderRadius: '0.8rem',
        viewerBackground: colors.background,
        viewerPadding: 'none',
        contentBackground: colors.secondaryBackground,
        contentPadding: componentDefaults.padding,
        contentBorderRadius: '0.8rem',
        ...removeUndefined(styleOverrides),
    };

    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                if (event.deltaY < 0) {
                    wrappedActions.zoomIn();
                } else {
                    wrappedActions.zoomOut();
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    const zoomIn = () => {
        setScale((prevScale) => Math.min(prevScale + ZOOM_STEP, MAX_SCALE));
    };

    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - ZOOM_STEP, MIN_SCALE));
    };

    const fitParent = () => {
        setScale(1);
    };

    const focusContainer = () => {
        containerRef.current?.focus();
    };

    const wrappedActions = {
        zoomIn: () => {
            zoomIn();
            focusContainer();
        },
        zoomOut: () => {
            zoomOut();
            focusContainer();
        },
        fitParent: () => {
            fitParent();
            focusContainer();
        }
    };

    const hotkeyOptions: Options = {
        enableOnFormTags: false,
        enabled: true,
    };

    const zoomInRef = useHotkeys('ctrl+up, cmd+up',
        (event) => {
            event.preventDefault();
            zoomIn();
        },
        hotkeyOptions,
        [zoomIn]
    );

    const zoomOutRef = useHotkeys('ctrl+down, cmd+down',
        (event) => {
            event.preventDefault();
            zoomOut();
        },
        hotkeyOptions,
        [zoomOut]
    );

    const fitRef = useHotkeys('ctrl+0, cmd+0',
        (event) => {
            event.preventDefault();
            fitParent();
        },
        hotkeyOptions,
        [fitParent]
    );

    const combineRefs = (element: HTMLDivElement) => {
        [zoomInRef, zoomOutRef, fitRef].forEach(ref => {
            if (typeof ref === 'function') {
                ref(element);
            } else if (ref) {
                (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
            }
        });
    };

    const renderContent = (content: React.ReactNode | string) => {
        if (typeof htmlContent === 'string') {
            return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />;
        } else {
            console.warn('HtmlViewer: Unsafe use! You are using React elements as content. ' +
                'The content will be rendered as is without sanitization.');
            return content;
        }
    }

    return (
        <div
            className="h-full w-full flex flex-col focus:outline-none"
            ref={(element: HTMLDivElement | null) => {
                if (element) {
                    containerRef.current = element;
                    combineRefs(element);
                }
            }}
            style={{
                ...{
                    color: style.color,
                    fontFamily: style.fontFamily,
                }
            }}
            tabIndex={-1}
        >
            <ViewerToolbar
                zoomIn={wrappedActions.zoomIn}
                zoomOut={wrappedActions.zoomOut}
                scale={scale}
                fitParent={wrappedActions.fitParent}
                isLoaded={true}
                styleOverrides={{
                    toolbarBorderRadius: style.toolbarBorderRadius,
                    toolbarBackground: style.toolbarBackground,
                    toolbarButtonBackground: style.toolbarButtonBackground,
                    toolbarButtonColor: style.toolbarButtonColor,
                    toolbarTextColor: style.toolbarTextColor,
                    toolbarBoxShadow: style.toolbarBoxShadow,
                }}
            />
            <div
                style={{
                    overflow: 'auto',
                    width: '100%',
                    height: '100%',
                    backgroundColor: style.viewerBackground,
                    padding: style.viewerPadding,
                }}
            >
                <div
                    className="html-viewer-content h-fit"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        ...{
                            backgroundColor: style.contentBackground,
                            padding: style.contentPadding,
                            borderRadius: style.contentBorderRadius,
                        }
                    }}
                >
                    {renderContent(htmlContent)}
                </div>
            </div>
        </div>
    );
};

export { HtmlViewer };