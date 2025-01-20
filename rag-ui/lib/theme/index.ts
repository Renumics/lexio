import type { Theme } from './types';

export const defaultTheme: Theme = {
  colors: {
    primary: '#0070f3',
    secondary: '#7928ca',
    background: '#ffffff',
    text: '#333333',
    success: '#49b232',
    warning: '#c5b655',
    error: '#c21a1a'
  },
  typography: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSizeBase: '16px',
    lineHeight: '1.5',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};