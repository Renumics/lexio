import { useEffect, useMemo } from 'react';
import { Provider, createStore } from 'jotai';
import { configAtom, registeredActionHandlersAtom } from '../../state/rag-state';
import { ActionHandler, ProviderConfig } from '../../types';


import { ThemeProvider } from '../../theme/ThemeContext';
import { defaultTheme } from '../../theme';
import { Theme } from '../../theme/types';

interface LexioProviderProps {
    children: React.ReactNode;
    onAction?: ActionHandler['handler'];
    theme?: Theme;
    config?: ProviderConfig;
}


/**
 * **LexioProvider** is a top-level context provider that:
 * - Initializes and provides a Jotai store containing state & atoms for Retrieve-And-Generate (RAG) operations.
 * - Wires up theme context, using either a custom theme or default theme.
 * - Supplies user-defined retrieval/generation logic to internal atoms.
 * - Optionally accepts a callback (`onAddMessage`) to modify the workflow mode on new messages.
 *
 * @example
 *
 * ```tsx
 * <LexioProvider
 *   retrieve={myRetrieveFn}
 *   generate={myGenerateFn}
 *   onAddMessage={(message, prev) => ({ type: 'follow-up' })}
 * >
 *   <MyRAGApp />
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
    onAction
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