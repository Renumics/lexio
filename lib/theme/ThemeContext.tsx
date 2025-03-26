import React, {useMemo} from 'react';
import type { Theme } from './types';

/**
 * Utility function to remove undefined values from an object. This is used to ensure that the theme object is not polluted with undefined values.
 * 
 * @template T - The type of the input object
 * @param {T} obj - The object to remove undefined values from
 * @returns {Partial<T>} A new object with all undefined values removed
 * 
 * @internal
 */
export function removeUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * Interface representing the value stored in the ThemeContext.
 * 
 * @interface ThemeContextValue
 * @property {Theme} theme - The current theme configuration
 * 
 * @remarks
 * Future versions may include theme toggling functionality for dark mode support.
 * 
 * @internal
 */
interface ThemeContextValue {
  theme: Theme;
  // todo: add toggleTheme and expose it to consumers -> enable dark mode?
}

/**
 * React Context for providing theme values throughout the application.
 * 
 * @remarks
 * This context is typically not used directly. Instead, use the LexioThemeProvider
 * component to provide theme values to your application, and the useLexioTheme hook
 * to consume them. 
 * 
 * @internal
 */
export const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

/**
 * Props for the LexioThemeProvider component.
 * 
 * @interface LexioThemeProviderProps
 * @property {Theme} theme - The theme configuration to provide to the application
 * @property {React.ReactNode} children - Child components that will have access to the theme
 * 
 * @internal
 */
interface LexioThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

/**
 * Provider component for making a theme available throughout the application.
 * 
 * @component
 * @param {LexioThemeProviderProps} props - The props for the LexioThemeProvider
 * @returns {JSX.Element} A ThemeContext.Provider wrapping the children
 * 
 * @remarks
 * The LexioThemeProvider is typically used within the RAGProvider component, which
 * handles the complete setup of the RAG UI system --> **There is no need to use the LexioThemeProvider directly.**
 * 
 * @example
 * ```tsx
 * import { defaultTheme, RAGProvider } from 'lexio';
 * 
 * function App() {
 *   return (
 *     <RAGProvider theme={defaultTheme}>
 *       <YourComponents />
 *     </RAGProvider>
 *   );
 * }
 * ```
 * 
 * @example
 * If you need to use the LexioThemeProvider directly:
 * ```tsx
 * import { LexioThemeProvider, defaultTheme } from 'lexio';
 * 
 * function App() {
 *   return (
 *     <LexioThemeProvider theme={defaultTheme}>
 *       <YourComponents />
 *     </LexioThemeProvider>
 *   );
 * }
 * ```
 */
export const LexioThemeProvider: React.FC<LexioThemeProviderProps> = ({ theme, children }) => {
  // Memoize the theme value to avoid unnecessary re-renders
  // todo: as secondary optimization we also shallow compare the theme object in the parent component (RAGProvider) ?
  const memoizedTheme = useMemo(() => ({ theme }), [theme]);

  return (
    <ThemeContext.Provider value={memoizedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

// For backward compatibility
export const ThemeProvider = LexioThemeProvider;