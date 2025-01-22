import type { Theme } from './types';

export const defaultTheme: Theme = {
  colors: {
    primary: '#1E88E5',  // Brighter blue for a modern feel
    secondary: '#64B5F6',  // Lighter blue for contrast
    background: '#F4F6F8',  // Soft off-white for a clean look
    secondaryBackground: '#FFFFFF',  // Clean white for contrast sections
    toolbarBackground: '#2196F3',  // Vibrant toolbar color
    text: '#212121',  // Darker text for better readability
    secondaryText: '#757575',  // Subtle gray for secondary elements
    lightText: '#E0E0E0',  // Softer light text
    success: '#4CAF50',  // Fresh green for success messages
    warning: '#FFB300',  // Bold amber for warnings
    error: '#E53935',  // Strong red for errors
  },
  typography: {
    fontFamily: '"Poppins", Helvetica, Arial, sans-serif',  // Modern Google Font
    fontSizeBase: '18px',  // Slightly larger for readability
    lineHeight: '1.75',  // Increased for a spacious feel
  },
  spacing: {
    none: '0px',
    xs: '6px',
    sm: '12px',
    md: '20px',
    lg: '32px',
    xl: '48px',
  },
  borderRadius: {
    none: '0px',
    sm: '6px',  // Slightly rounded edges for softer look
    md: '12px',
    lg: '24px',
    xl: '40px',
  },
};
