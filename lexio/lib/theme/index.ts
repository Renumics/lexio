import type { Theme, PartialTheme } from './types';
import {ThemeContext} from "./ThemeContext.tsx";

export const defaultTheme: Theme = {
  colors: {
    primary: '#1E88E5',
    secondary: '#64B5F6',
    contrast: '#FFFFFF',
    background: '#F4F6F8',
    secondaryBackground: '#FFFFFF',
    toolbarBackground: '#42a6f5',
    text: '#212121',
    secondaryText: '#757575',
    lightText: '#E0E0E0',
    success: '#4CAF50',
    warning: '#FFB300',
    error: '#E53935',
  },
  typography: {
    fontFamily: '"Poppins", Helvetica, Arial, sans-serif',
    fontSizeBase: '1.rem',
    lineHeight: '1.75',
  },
  componentDefaults: {
    borderRadius: '0.5rem',
    padding: '1.0rem',
  },
};

/**
 * Creates a new theme by merging the default theme with the provided overrides.
 *
 * @param {Partial<PartialTheme>} overrides - The theme overrides to apply on top of the default theme.
 * @returns {Theme} The new theme object with the applied overrides.
 * @example
 * ```tsx
 * import { createTheme, RAGProvider } from 'lexio';
 *
 * const customTheme = createTheme({
 *    colors: {
 *      primary: '#1E88E5',
 *      secondary: '#64B5F6'
 *      }
 * });
 *
 * <RAGProvider theme={customTheme}>
 *     ... your app components ...
 * <RAGProvider />
 * ```
 */
export const createTheme = (overrides: Partial<PartialTheme>): Theme => {
    return {
        ...defaultTheme,
        colors: {
            ...defaultTheme.colors,
            ...(overrides.colors || {}),
        },
        typography: {
            ...defaultTheme.typography,
            ...(overrides.typography || {}),
        },
        componentDefaults: {
            ...defaultTheme.componentDefaults,
            ...(overrides.componentDefaults || {}),
        },
    };
}

export { ThemeContext };