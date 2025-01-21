import { useContext } from "react";
import { ThemeContext, removeUndefined } from "../../theme/ThemeContext";
import {
    ArrowsPointingOutIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/solid";


export interface CanvasDimensions {
    width: number;
    height: number;
}

export const ZOOM_CONSTANTS = {
    ZOOM_STEP: 0.1,
    MIN_SCALE: 0.25,
    MAX_SCALE: 5,
}; 

export interface ViewerToolbarStyles extends React.CSSProperties {
    toolbarBorderRadius?: string;
    toolbarTextColor?: string;
    toolbarBackground?: string;
    toolbarSecondaryBackground?: string;
    toolbarButtonBackground?: string;
    toolbarButtonColor?: string;
    toolbarButtonBorderRadius?: string;
    toolbarButtonSize?: 'sm' | 'md' | 'lg';
    toolbarBoxShadow?: string;
}

export interface ViewerToolbarProps {
    zoomIn: () => void;
    zoomOut: () => void;
    scale: number;
    fitParent?: () => void;
    children?: React.ReactNode;
    isLoaded?: boolean;
    styleOverrides?: ViewerToolbarStyles;
}

export const ViewerToolbar = ({ zoomIn, zoomOut, scale, fitParent, children, isLoaded = true, styleOverrides = {} }: ViewerToolbarProps) => {
    // --- use theme ---
    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error('ThemeContext is undefined');
    }
    const { colors, borderRadius } = theme.theme;

    // --- merge theme defaults + overrides ---
    const style: ViewerToolbarStyles = {
        toolbarBorderRadius: borderRadius.md,
        toolbarTextColor: colors.text,
        toolbarBackground: colors.toolbarBackground,
        toolbarSecondaryBackground: colors.secondaryBackground,
        toolbarButtonBackground: colors.primary,
        toolbarButtonColor: 'white',
        toolbarButtonBorderRadius: borderRadius.sm,
        toolbarButtonSize: 'sm',
        toolbarBoxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
        ...removeUndefined(styleOverrides),
    };

    // todo: make use of buttonSize

    return (
        <div className="px-2 gap-x-1 flex flex-row justify-between z-10 py-1"
             style={{
                 borderTopLeftRadius: style.toolbarBorderRadius,
                 borderTopRightRadius: style.toolbarBorderRadius,
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
                        backgroundColor: style.toolbarSecondaryBackground,
                        borderRadius: style.toolbarBorderRadius,
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