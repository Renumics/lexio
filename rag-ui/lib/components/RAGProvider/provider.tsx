import { useEffect, useMemo } from 'react';
import type { RAGProviderProps } from '../../types';
export { useRAG } from './hooks';
export * from '../../types';
import { Provider, createStore } from 'jotai';
import { createGenerateAtom, createGetDataSourceAtom, createRetrieveAndGenerateAtom, createRetrieveSourcesAtom, ragAtomsAtom, ragConfigAtom } from '../../state/rag-state';

const RAGProvider = ({ 
  children,
  retrieve,
  retrieveAndGenerate,
  generate,
  getDataSource,
  config,
}: RAGProviderProps) => {

  const store = useMemo(() => createStore(), [])

  const generateAtom = useMemo(() => createGenerateAtom(generate), [generate]);
  const retrieveAndGenerateAtom = useMemo(() => createRetrieveAndGenerateAtom(retrieveAndGenerate), [retrieveAndGenerate]);
  const retrieveSourcesAtom = useMemo(() => createRetrieveSourcesAtom(retrieve), [retrieve]);
  const getDataSourceAtom = useMemo(() => createGetDataSourceAtom(getDataSource), [getDataSource]);
  const memoizedConfig = useMemo(() => config, [config]);
  

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
  }, [store, generateAtom, retrieveAndGenerateAtom, retrieveSourcesAtom, getDataSourceAtom, memoizedConfig]);

  return (
    <Provider store={store}>
        {children}
    </Provider>
  );
};

export { RAGProvider };