import type { Theme, PartialTheme } from './types';

export const defaultTheme: Theme = {
  colors: {
    primary: '#1E88E5',
    secondary: '#64B5F6',
    contrast: '#FFFFFF',
    background: '#F4F6F8',
    secondaryBackground: '#FFFFFF',
    toolbarBackground: '#2196F3',
    text: '#212121',
    secondaryText: '#757575',
    lightText: '#E0E0E0',
    success: '#4CAF50',
    warning: '#FFB300',
    error: '#E53935',
  },
  typography: {
    fontFamily: '"Poppins", Helvetica, Arial, sans-serif',  // Modern Google Font
    fontSizeBase: '1.rem',  // Slightly larger for readability
    lineHeight: '1.75',  // Increased for a spacious feel
  },
  componentDefaults: {
    borderRadius: '0.5rem',
    padding: '1.0rem',
  },
};

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