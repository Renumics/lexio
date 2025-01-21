import React from 'react';
import type { Theme } from './types';

interface ThemeContextValue {
  theme: Theme;
  // todo: add toggleTheme and expose it to consumers -> enable dark mode?
}

export const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};