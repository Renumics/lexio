import { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeContext';
import type { Theme } from '../theme/types';

/**
 * Hook to access the current theme in any component within the LexioThemeProvider.
 * 
 * @returns {Theme} The current theme object
 * 
 * @example
 * ```tsx
 * import { useLexioTheme } from 'lexio';
 * 
 * function MyCustomComponent() {
 *   const theme = useLexioTheme();
 *   
 *   return (
 *     <div style={{ 
 *       color: theme.colors.text,
 *       backgroundColor: theme.colors.background,
 *       padding: theme.componentDefaults.padding,
 *       borderRadius: theme.componentDefaults.borderRadius
 *     }}>
 *       My themed custom component
 *     </div>
 *   );
 * }
 * ```
 * 
 * @throws {Error} If used outside of a LexioThemeProvider
 */
export function useLexioTheme(): Theme {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useLexioTheme must be used within a LexioThemeProvider');
  }
  
  return context.theme;
}