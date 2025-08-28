import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useRef } from "react";
import { ThemeContext as LexioThemeContext } from "../../../theme";

export type ColorScheme = "light" | "dark";

export type ThemeColors = {
    background: string,
    surface: string,
    card: string,
    bodyBackground: string,
    bodyForeground: string,
    headerBg: string,
    headerText: string,
    cellBorder: string,
    border: string,
    headerBorder: string,
    defaultCellText: string,
    selection: string,
    highlight: string,
    selectionText: string,
    stickyBorder: string,
    scrollBarColor: string,
    scrollBarBackgroundColor: string,
}

export type Theme = {
    light: ThemeColors;
    dark: ThemeColors;
}

export type ThemeOverride = {
    light?: Partial<ThemeColors>;
    dark?: Partial<ThemeColors>;
}

type ThemeContextType = {
    theme: ThemeColors;
    colorScheme: ColorScheme;
    setColorScheme: (colorScheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeContextProvider");
    }
    return context;
};

type ThemeContextProviderProps = {
    theme?: ThemeOverride | undefined;
    colorScheme: "light" | "dark";
    children: ReactNode;
}

const DEFAULT_FONT_COLOR = "#000000";

const DEFAULT_CELL_BACKGROUND_COLOR = "#ffffff";

export const ThemeContextProvider = ({ theme, colorScheme: inputColorScheme, children }: ThemeContextProviderProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
        return inputColorScheme;
    });
    const lexioTheme = useContext(LexioThemeContext);
    if (!lexioTheme) {
        throw new Error("The Lexio ThemeContext is undefined. ThemeContextProvider.tsx");
    }
    const {
        colors: lexioColors,
        spreadsheetViewer,
    } = lexioTheme.theme;

    const DEFAULT_THEME: Theme = useMemo(() => {
        return {
            light: {
                background: DEFAULT_CELL_BACKGROUND_COLOR,
                surface: spreadsheetViewer?.light?.surface ?? "#eaeef2",
                card: spreadsheetViewer?.light?.card ?? "#ffffff",
                bodyBackground: spreadsheetViewer?.light?.background ?? "#f8fafc",
                bodyForeground: spreadsheetViewer?.light?.bodyForeground ?? "#000000",
                headerBg: spreadsheetViewer?.light?.headerBg ?? "#f2f2f2",
                headerText: spreadsheetViewer?.light?.headerText ?? "#222222",
                cellBorder: spreadsheetViewer?.light?.cellBorder ?? "#e2e8f0",
                border: spreadsheetViewer?.light?.border ?? "#cdd0d4",
                headerBorder: spreadsheetViewer?.light?.headerBorder ?? "#e2e8f0",
                defaultCellText: DEFAULT_FONT_COLOR,
                selection: spreadsheetViewer?.light?.selection ?? "#0078d4",
                highlight: spreadsheetViewer?.light?.highlight ?? "#ffa500",
                selectionText: spreadsheetViewer?.light?.selectionText ?? "#ffffff",
                stickyBorder: spreadsheetViewer?.light?.stickyBorder ?? "#d3d3d3",
                scrollBarColor: spreadsheetViewer?.light?.scrollBarColor ?? "#cbd5e1 #f1f5f9",
                scrollBarBackgroundColor: spreadsheetViewer?.light?.scrollBarBackgroundColor ?? "",
            },
            dark: {
                background: DEFAULT_CELL_BACKGROUND_COLOR,
                surface: spreadsheetViewer?.dark?.surface ?? "#2d2d2d",
                card: spreadsheetViewer?.dark?.card ?? "#404040",
                bodyBackground: spreadsheetViewer?.dark?.bodyBackground ?? "#2d2d2d",
                bodyForeground: spreadsheetViewer?.dark?.bodyForeground ?? "#ffffff",
                headerBg: spreadsheetViewer?.dark?.headerBg ?? "#404040",
                headerText: spreadsheetViewer?.dark?.headerText ?? "#ffffff",
                cellBorder: spreadsheetViewer?.dark?.cellBorder ?? "#e2e8f0",
                border: spreadsheetViewer?.dark?.border ?? "#606060",
                headerBorder: spreadsheetViewer?.dark?.headerBorder ?? "#5f5f5f",
                defaultCellText:  DEFAULT_FONT_COLOR,
                selection: spreadsheetViewer?.dark?.selection ?? "#0078d4",
                highlight: spreadsheetViewer?.dark?.highlight ?? "#ffa500",
                selectionText: spreadsheetViewer?.dark?.selectionText ?? "#ffffff",
                stickyBorder: spreadsheetViewer?.dark?.stickyBorder ?? "#606060",
                scrollBarColor: spreadsheetViewer?.dark?.scrollBarColor ?? "#606060 #2d2d2d",
                scrollBarBackgroundColor: spreadsheetViewer?.dark?.scrollBarBackgroundColor ?? "",
            }
        }
    }, [lexioColors]);

    const themeState = useMemo(() => {
        if (colorScheme === "dark") {
            return {
                ...DEFAULT_THEME.dark,
                ...(theme?.dark ?? {}),
            };
        }
        return {
            ...DEFAULT_THEME.light,
            ...(theme?.light ?? {}),
        };
    }, [DEFAULT_THEME.dark, DEFAULT_THEME.light, colorScheme, theme?.dark, theme?.light]);

    useEffect(() => {
        if (typeof document === "undefined") return;
        if (typeof document.documentElement === "undefined") return;
        document.documentElement.style.setProperty("--excel-viewer-color-scheme", colorScheme);
        document.documentElement.style.setProperty("--excel-viewer-background", themeState.background);
        document.documentElement.style.setProperty("--excel-viewer-surface", themeState.surface);
        document.documentElement.style.setProperty("--excel-viewer-card", themeState.card);
        document.documentElement.style.setProperty("--excel-viewer-body-background", themeState.bodyBackground);
        document.documentElement.style.setProperty("--excel-viewer-body-foreground", themeState.bodyForeground);
        document.documentElement.style.setProperty("--excel-viewer-header-bg", themeState.headerBg);
        document.documentElement.style.setProperty("--excel-viewer-header-text", themeState.headerText);
        document.documentElement.style.setProperty("--excel-viewer-cell-border", themeState.cellBorder);
        document.documentElement.style.setProperty("--excel-viewer-border", themeState.border);
        document.documentElement.style.setProperty("--excel-viewer-header-border", themeState.headerBorder);
        document.documentElement.style.setProperty("--excel-viewer-default-cell-text", themeState.defaultCellText);
        document.documentElement.style.setProperty("--excel-viewer-selection", themeState.selection);
        document.documentElement.style.setProperty("--excel-viewer-highlight", themeState.highlight);
        document.documentElement.style.setProperty("--excel-viewer-selection-text", themeState.selectionText);
        document.documentElement.style.setProperty("--excel-viewer-sticky-border", themeState.stickyBorder);
        document.documentElement.style.setProperty("--excel-viewer-scroll-bar-color", themeState.scrollBarColor);
        document.documentElement.style.setProperty("--excel-viewer-scroll-bar-background-color", themeState.scrollBarBackgroundColor);
    }, [themeState, colorScheme]);

    useEffect(() => {
        const setContainerSize = () => {
            if (!containerRef.current) return;
            document.documentElement.style.setProperty("--excel-viewer-container-height", `${containerRef.current.clientHeight}px`);
            document.documentElement.style.setProperty("--excel-viewer-container-width", `${containerRef.current.clientWidth}px`);
        };
        setContainerSize();
        window.addEventListener("resize", setContainerSize);
        return () => {
            window.removeEventListener("resize", setContainerSize);
        }
    }, [containerRef]);

    const setColorScheme = (newColorScheme: ColorScheme) => {
        setColorSchemeState(newColorScheme);
    };

    return (
        <ThemeContext.Provider value={{
            colorScheme: colorScheme,
            setColorScheme: setColorScheme,
            theme: themeState
        }}>
            <div
                id="theme-app-container"
                ref={containerRef}
                style={{
                    height: "100%",
                    width: "100%",
                    overflow: "hidden",
                }}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    );
};
ThemeContextProvider.displayName = "ThemeContextProvider";
