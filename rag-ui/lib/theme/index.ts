import type { Theme } from './types';

export const defaultTheme: Theme = {
  colors: {
    primary: '#0070f3',
    secondary: '#77a8e1',
    background: '#f3f3f3',
    secondaryBackground: '#ffffff',
    toolbarBackground: '#83cccc',
    text: '#333333',
    secondaryText: '#666666',
    lightText: '#f3f3f3',
    success: '#38c01e',
    warning: '#eed74a',
    error: '#c21a1a',
  },
  typography: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSizeBase: '16px',
    lineHeight: '1.5',
  },
  spacing: {
    none: '0px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '32px',
  },
};
