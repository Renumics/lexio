import React, { useEffect, useRef, useContext } from 'react';
import { useHotkeys, Options } from 'react-hotkeys-hook';
import { ViewerToolbar, ViewerToolbarStyles } from "../ViewerToolbar";
import { ZOOM_CONSTANTS } from "../types";
import './HtmlViewer.css';
import DOMPurify from 'dompurify';
import { ThemeContext, removeUndefined } from "../../../theme/ThemeContext";

/**
 * Constants for the HTMLViewer component's zoom functionality.
 * 
 * @internal
 */
const { ZOOM_STEP, MIN_SCALE, MAX_SCALE } = ZOOM_CONSTANTS;

/**
 * Style configuration interface for the HtmlViewer component.
 * Extends ViewerToolbarStyles to include additional styling options specific to HTML content display.
 * 
 * @interface HtmlViewerStyles
 * @extends {ViewerToolbarStyles}
 * @property {string} [backgroundColor] - Background color of the entire HTMLViewer
 * @property {string} [color] - Text color for the text elements in the HTMLViewer
 * @property {string} [padding] - Padding around the content
 * @property {string} [fontFamily] - Font family for the text elements in the HTMLViewer
 * @property {string} [viewerBorderRadius] - Border radius of the HTMLViewer container
 * @property {string} [viewerBackground] - Background color of the HTMLViewer area
 * @property {string} [viewerPadding] - Padding around the HTMLViewer area
 * @property {string} [contentBackground] - Background color of the content area
 * @property {string} [contentPadding] - Padding around the content area
 * @property {string} [contentBorderRadius] - Border radius of the content area
 */
export interface HtmlViewerStyles extends ViewerToolbarStyles {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;
    fontSize?: string;

    viewerBorderRadius?: string;
    viewerBackground?: string;
    viewerPadding?: string;

    contentBackground?: string;
    contentPadding?: string;
    contentBorderRadius?: string;
}

/**
 * Props for the HtmlViewer component.
 * 
 * @interface HTMLViewerProps
 * @property {React.ReactNode | string} htmlContent - The HTML content to display. Can be either a string of HTML or React elements
 * @property {HtmlViewerStyles} [styleOverrides] - Optional style overrides for customizing the viewer's appearance
 */
interface HTMLViewerProps {
    /**
     * The HTML content to display. Can be either a string of HTML or React elements
     * 
     * @remarks
     * - Supports both HTML strings (sanitized with DOMPurify) and React elements (unsafe)
     */
    htmlContent: React.ReactNode | string;
    /**
     * Optional style overrides for customizing the viewer's appearance
     * 
     * @remarks
     * - The default styling uses the theme system for consistent styling
     */
    styleOverrides?: HtmlViewerStyles;
}

/**
 * A component for displaying HTML content with zoom controls and theme support.
 * Used in the RAG UI system to display HTML source content retrieved from the data source.
 * 
 * @component
 * @param {HTMLViewerProps} props - The props for the HtmlViewer
 * @returns {JSX.Element} A themed HTML viewer with zoom controls
 * 
 * @remarks
 * - Supports both HTML strings (sanitized with DOMPurify) and React elements (unsafe)
 * - Includes zoom controls via toolbar and keyboard shortcuts (Ctrl/Cmd + Up/Down)
 * - Integrates with the theme system for consistent styling
 * - Used internally by ContentDisplay when displaying HTML source content
 * 
 * @example
 * ```tsx
 * <HtmlViewer
 *   htmlContent="<div>Your HTML content here</div>"
 *   styleOverrides={{
 *     contentBackground: '#ffffff',
 *     contentPadding: '20px'
 *   }}
 * />
 * ```
 */
const HtmlViewer = ({ htmlContent, styleOverrides = {} }: HTMLViewerProps) => {
    const [scale, setScale] = React.useState(1);
    const containerRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;

    // --- use theme ---
    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error('ThemeContext is undefined');
    }
    const { colors, typography, componentDefaults } = theme.theme;

    // --- merge theme defaults + overrides ---
    const style: HtmlViewerStyles = {
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSizeBase,
        padding: 'none',
        borderRadius: componentDefaults.borderRadius,

        toolbarBorderRadius: componentDefaults.borderRadius,
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