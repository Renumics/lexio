import { useEffect, useMemo } from 'react';
import { Provider, createStore } from 'jotai';
import { configAtom, registeredActionHandlersAtom } from '../../state/rag-state';
import { ActionHandler, ProviderConfig } from '../../types';


import { ThemeProvider } from '../../theme/ThemeContext';
import { defaultTheme } from '../../theme';
import { Theme } from '../../theme/types';

/**
 * Props for the LexioProvider component.
 * 
 * @interface LexioProviderProps
 * @property {React.ReactNode} children - React child components to be wrapped by the provider
 * @property {ActionHandler['handler']} [onAction] - Optional callback function to handle custom actions triggered within Lexio components
 * @property {Theme} [theme] - Optional custom theme object to override the default styling
 * @property {ProviderConfig} [config] - Optional provider configuration object to customize behavior and settings
 */
interface LexioProviderProps {
    children: React.ReactNode;
    onAction?: ActionHandler['handler'];
    theme?: Theme;
    config?: ProviderConfig;
}


/**
 * **LexioProvider** is a top-level context provider that wraps your application with necessary state management and theming.
 * 
 * @component
 * 
 * @param props.children - React child components to be wrapped by the provider
 * @param props.onAction - Optional callback function to handle custom actions triggered within Lexio components
 * @param props.theme - Optional custom theme object to override the default styling
 * @param props.config - Optional provider configuration object to customize behavior and settings
 * 
 * @component
 * 
 * This provider:
 * - Creates and provides a Jotai store for global state management
 * - Sets up theme context with either custom or default theme
 * - Registers action handlers for component interactions
 * - Applies provider configuration through the config prop
 *
 * @example
 *
 * ```tsx
 * <LexioProvider
 *   onAction={(action) => {
 *     // Handle custom actions
 *     if (action.type === 'SEARCH_SOURCES') {
 *       return {
 *         sources: fetchSources(action.query)
 *       };
 *     }
 *     return undefined;
 *   }}
 *   theme={customTheme}
 *   config={{
 *     apiKey: 'your-api-key',
 *     endpoint: 'https://your-api-endpoint.com'
 *   }}
 * >
 *   <YourApplication />
 * </LexioProvider>
 * ```
 */
const LexioProvider = ({
  children,
  onAction,
  theme,
  config,
}: LexioProviderProps) => {
  
  // Create a fresh Jotai store on first render
  const store = useMemo(() => createStore(), []);

  // Whenever these change, update the store's relevant atoms
  useEffect(() => {
    if (onAction) {
      store.set(registeredActionHandlersAtom, [{component: 'LexioProvider', handler: onAction}]);
    }
  }, [
    store,
    onAction,
  ]);

  useEffect(() => {
    if (config) {
      store.set(configAtom, config);
    }
  }, [
    store,
    config
  ]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme !== undefined ? theme : defaultTheme}>
        {children}
      </ThemeProvider>
    </Provider>
  );
};

export { LexioProvider };