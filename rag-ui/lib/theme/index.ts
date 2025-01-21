import type { Theme } from './types';

export const defaultTheme: Theme = {
  colors: {
    primary: '#0070f3',
    secondary: '#7928ca',
    background: '#f3f3f3',
    secondaryBackground: '#ffffff',
    toolbarBackground: 'gray',
    text: '#333333',
    secondaryText: '#666666',
    success: '#49b232',
    warning: '#c5b655',
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
