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
 * @remarks
 * This provider must wrap the part of your React tree that uses RAG features (like retrieval, generation, or data source fetching).
 * 
 * @param props - The props for RAGProvider
 * @param props.children - The React child nodes to render inside the provider
 * @param props.retrieve - Optional function `(query: string, metadata?: Record<string, any>) => RetrieveResponse`
 *   used to fetch sources for a given query.
 * @param props.retrieveAndGenerate - Optional function that performs both retrieval and generation in a single call
 *   `(messages: Message[], metadata?: Record<string, any>) => RetrieveAndGenerateResponse`.
 * @param props.generate - Optional function `(messages: Message[], [sources?: RetrievalResult[]]) => Promise<string> | AsyncIterable`
 *   used to generate text from a conversation (and optionally sources).
 * @param props.getDataSource - Optional function `(source: SourceReference) => GetDataSourceResponse`
 *   used to fetch the raw content (PDF, HTML, etc.) for a given source reference.
 * @param props.config - Optional object containing RAG configuration, e.g. timeouts for streaming or requests.
 * @param props.onAddMessage - Optional callback `(message: Message, previousMessages: Message[]) => RAGWorkflowActionOnAddMessage`
 *   that runs whenever a new message is added, returning an action that modifies the workflow mode.
 * @param props.theme - Optional theme override object. If not provided, the `defaultTheme` is used.
 * 
 * @returns A React component that provides:
 * - Jotai-based RAG state.
 * - Theming context to child components.
 * 
 * @example
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
