import { useEffect, useMemo } from 'react';
import { Provider, createStore } from 'jotai';
import {
  createGenerateAtom,
  createGetDataSourceAtom,
  createRetrieveAndGenerateAtom,
  createRetrieveSourcesAtom,
  onAddMessageAtom,
  ragAtomsAtom,
  ragConfigAtom
} from '../../state/rag-state';

import type {
  RAGProviderProps,
} from '../../types';

import { ThemeProvider } from '../../theme/ThemeContext';
import { defaultTheme } from '../../theme';

/**
 * **RAGProvider** is a top-level context provider that:
 * - Initializes and provides a Jotai store containing state & atoms for Retrieve-And-Generate (RAG) operations.
 * - Wires up theme context, using either a custom theme or default theme.
 * - Supplies user-defined retrieval/generation logic to internal atoms.
 * - Optionally accepts a callback (`onAddMessage`) to modify the workflow mode on new messages.
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
const RAGProvider = ({
  children,
  retrieve,
  retrieveAndGenerate,
  generate,
  getDataSource,
  config,
  onAddMessage,
  theme
}: RAGProviderProps) => {
  
  // Create a fresh Jotai store on first render
  const store = useMemo(() => createStore(), []);
  
  // Dynamically build the atoms for retrieval/generation
  const generateAtom = useMemo(
    () => (generate ? createGenerateAtom(generate) : null),
    [generate]
  );
  const retrieveAndGenerateAtom = useMemo(
    () => (retrieveAndGenerate ? createRetrieveAndGenerateAtom(retrieveAndGenerate) : null),
    [retrieveAndGenerate]
  );
  const retrieveSourcesAtom = useMemo(
    () => (retrieve ? createRetrieveSourcesAtom(retrieve) : null),
    [retrieve]
  );
  const getDataSourceAtom = useMemo(
    () => createGetDataSourceAtom(getDataSource || null),
    [getDataSource]
  );
  const memoizedConfig = useMemo(() => config, [config]);

  // Whenever these change, update the store's relevant atoms
  useEffect(() => {
    store.set(ragAtomsAtom, {
      generateAtom,
      retrieveAndGenerateAtom,
      retrieveSourcesAtom,
      getDataSourceAtom
    });
    if (memoizedConfig) {
      store.set(ragConfigAtom, memoizedConfig);
    }
    if (onAddMessage) {
      // We set the Jotai atom to a function that returns onAddMessage to avoid confusion with standard state updaters
      store.set(onAddMessageAtom, () => onAddMessage);
    }
  }, [
    store,
    generateAtom,
    retrieveAndGenerateAtom,
    retrieveSourcesAtom,
    getDataSourceAtom,
    memoizedConfig,
    onAddMessage
  ]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme !== undefined ? theme : defaultTheme}>
        {children}
      </ThemeProvider>
    </Provider>
  );
};

export { RAGProvider };
