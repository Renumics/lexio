import { useContext } from "react";
import { ThemeContext, removeUndefined } from "../../theme/ThemeContext";
import {
    ArrowsPointingOutIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/solid";
import { ViewerToolbarProps } from "./types";

export interface ViewerToolbarStyles extends React.CSSProperties {
    fontFamily?: string;
    fontSize?: string;

    toolbarBorderRadius?: string;
    toolbarTextColor?: string;
    toolbarBackground?: string;
    toolbarSecondaryBackground?: string;

    toolbarButtonBackground?: string;
    toolbarButtonColor?: string;
    toolbarButtonBorderRadius?: string;
    toolbarBoxShadow?: string;

    toolbarChipBackground?: string;
    toolbarChipBorderRadius?: string;
    toolbarChipInputBackground?: string;
}

/**
 * ViewerToolbar component provides a toolbar with zoom in, zoom out, and fit to parent buttons
 *
 * @internal
 *
 * @param zoomIn - Zoom in button click handler
 * @param zoomOut - Zoom out button click handler
 * @param scale - Current scale value
 * @param fitParent - Fit to parent button click handler
 * @param children - Additional toolbar components
 * @param isLoaded - Flag to indicate if the viewer is loaded
 * @param styleOverrides - Style overrides for the toolbar
 * @constructor
 */
export const ViewerToolbar = ({ zoomIn, zoomOut, scale, fitParent, children, isLoaded = true, styleOverrides = {} }: ViewerToolbarProps) => {
    // --- use theme ---
    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error('ThemeContext is undefined');
    }
    const { colors, typography, componentDefaults } = theme.theme;

    // --- merge theme defaults + overrides ---
    const style: ViewerToolbarStyles = {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSizeBase,

        toolbarChipBackground: '#ffffff',
        toolbarChipBorderRadius: '0.375rem',
        toolbarChipInputBackground: '#ffffff',

        toolbarBorderRadius: componentDefaults.borderRadius,
        toolbarBoxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
        toolbarTextColor: colors.text,
        toolbarBackground: colors.toolbarBackground,
        toolbarSecondaryBackground: colors.secondaryBackground,

        toolbarButtonBackground: colors.primary,
        toolbarButtonColor: colors.contrast,
        toolbarButtonBorderRadius: '0.5rem',
        ...removeUndefined(styleOverrides),
    };

    return (
        <div className="px-2 gap-x-1 flex flex-row justify-between z-10 py-1"
             style={{
                 // borderTopLeftRadius: style.toolbarBorderRadius,
                 // borderTopRightRadius: style.toolbarBorderRadius,
                 borderRadius: '0.35rem',
                 boxShadow: style.toolbarBoxShadow,
                 backgroundColor: style.toolbarBackground,
             }}
        >
            {children}
            <div className="flex flex-row gap-x-1">
                <button
                    className="px-2 py-1 transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        color: style.toolbarButtonColor,
                        backgroundColor: style.toolbarButtonBackground,
                        borderRadius: style.toolbarButtonBorderRadius,
                    }}
                    onClick={zoomIn}
                    title="Zoom In (Ctrl+Up, Cmd+Up)"
                    disabled={!isLoaded}>
                    <MagnifyingGlassPlusIcon className="size-5"/>
                </button>
                <div className="m-auto min-w-14 text-center"
                    style={{
                        color: style.toolbarTextColor,
                        backgroundColor: style.toolbarChipBackground,
                        borderRadius: style.toolbarChipBorderRadius,
                    }}
                >
                    {isLoaded ? Math.round(scale * 100) + '%' : '--'}
                </div>
                <button
                    className="px-2 py-1 transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        color: style.toolbarButtonColor,
                        backgroundColor: style.toolbarButtonBackground,
                        borderRadius: style.toolbarButtonBorderRadius,
                    }}
                    onClick={zoomOut}
                    title="Zoom Out (Ctrl+Down, Cmd+Down)"
                    disabled={!isLoaded}>                        
                    <MagnifyingGlassMinusIcon className="size-5"/>
                </button>
                {fitParent && (
                    <button
                        className="px-2 py-1 transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            color: style.toolbarButtonColor,
                            backgroundColor: style.toolbarButtonBackground,
                            borderRadius: style.toolbarButtonBorderRadius,
                        }}
                        onClick={fitParent}
                        title="Fit to Parent (Ctrl+0, Cmd+0)"
                        disabled={!isLoaded}>
                        <ArrowsPointingOutIcon className="size-5"/>
                    </button>
                )}
            </div>
        </div>
    );
}; 