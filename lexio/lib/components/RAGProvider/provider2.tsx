import { useEffect, useMemo } from 'react';
import { Provider, createStore } from 'jotai';
import { ActionHandler, registeredActionHandlersAtom } from '../../state/rag-state-v2';


import { ThemeProvider } from '../../theme/ThemeContext';
import { defaultTheme } from '../../theme';
import { Theme } from '../../theme/types';

interface RAGProvider2Props {
    children: React.ReactNode;
    onAction?: ActionHandler['handler'];
    theme?: Theme;
}


/**
 * **RAGProvider** is a top-level context provider that:
 * - Initializes and provides a Jotai store containing state & atoms for Retrieve-And-Generate (RAG) operations.
 * - Wires up theme context, using either a custom theme or default theme.
 * - Supplies user-defined retrieval/generation logic to internal atoms.
 * - Optionally accepts a callback (`onAddMessage`) to modify the workflow mode on new messages.
 *
 * @example
 *
 * ```tsx
 * <RAGProvider
 *   retrieve={myRetrieveFn}
 *   generate={myGenerateFn}
 *   onAddMessage={(message, prev) => ({ type: 'follow-up' })}
 * >
 *   <MyRAGApp />
 * </RAGProvider>
 * ```
 */
const RAGProvider2 = ({
  children,
  onAction,
  theme
}: RAGProvider2Props) => {
  
  // Create a fresh Jotai store on first render
  const store = useMemo(() => createStore(), []);
  

  // Whenever these change, update the store's relevant atoms
  useEffect(() => {
    if (onAction) {
      store.set(registeredActionHandlersAtom, [{component: 'RAGProvider2', handler: onAction}]);
    }
  }, [
    store,
    onAction
  ]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme !== undefined ? theme : defaultTheme}>
        {children}
      </ThemeProvider>
    </Provider>
  );
};

export { RAGProvider2 };