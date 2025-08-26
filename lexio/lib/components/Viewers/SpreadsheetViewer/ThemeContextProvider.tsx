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

type ThemeOverride = {
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
        throw new Error("The Lexio ThemeContext is undefined");
    }
    const {
        colors: lexioColors,
    } = lexioTheme.theme;

    const DEFAULT_THEME: Theme = useMemo(() => {
        return {
            light: {
                background: DEFAULT_CELL_BACKGROUND_COLOR,
                surface: "#eaeef2",
                card: "#ffffff",
                bodyBackground: "#f8fafc",
                bodyForeground: "#000000",
                headerBg: "#f2f2f2",
                headerText: "#222222",
                cellBorder: "#e2e8f0",
                border: "#cdd0d4",
                headerBorder: "#e2e8f0",
                defaultCellText: DEFAULT_FONT_COLOR,
                selection: lexioColors.primary ?? "#0078d4",
                highlight: "#ffa500",
                selectionText: "#ffffff",
                stickyBorder: "#d3d3d3",
                scrollBarColor: "#cbd5e1 #f1f5f9",
                scrollBarBackgroundColor: "",
            },
            dark: {
                background: DEFAULT_CELL_BACKGROUND_COLOR,
                surface: "#2d2d2d",
                card: "#404040",
                bodyBackground: "#2d2d2d",
                bodyForeground: "#ffffff",
                headerBg: "#404040",
                headerText: "#ffffff",
                cellBorder: "#e2e8f0",
                border: "#606060",
                headerBorder: "#5f5f5f",
                defaultCellText: DEFAULT_FONT_COLOR,
                selection: lexioColors.primary ?? "#0078d4",
                highlight: "#ffa500",
                selectionText: "#ffffff",
                stickyBorder: "#606060",
                scrollBarColor: "#606060 #2d2d2d",
                scrollBarBackgroundColor: "",
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
