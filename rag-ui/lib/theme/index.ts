import type { Colors, Typography, Spacing, BorderRadius, Theme } from './types';

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
    fontSizeBase: '18px',  // Slightly larger for readability
    lineHeight: '1.75',  // Increased for a spacious feel
  },
  spacing: {
    // default: '16px',  // todo: add and use
    none: '0px',
    xs: '6px',
    sm: '12px',
    md: '20px',
    lg: '32px',
    xl: '48px',
  },
  borderRadius: {
    // default: '4px',   // todo: add and use
    none: '0px',
    sm: '6px',  // Slightly rounded edges for softer look
    md: '12px',
    lg: '24px',
    xl: '40px',
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
        spacing: {
            ...defaultTheme.spacing,
            ...(overrides.spacing || {}),
        },
        borderRadius: {
            ...defaultTheme.borderRadius,
            ...(overrides.borderRadius || {}),
        },
    };
}

export interface PartialTheme {
  colors: Partial<Colors>;
  typography: Partial<Typography>;
  spacing: Partial<Spacing>;
  borderRadius: Partial<BorderRadius>;
}