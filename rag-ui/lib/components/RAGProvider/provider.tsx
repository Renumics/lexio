import { useEffect, useMemo } from 'react';
import type { RAGProviderProps } from '../../types';
export { useRAG } from './hooks';
export * from '../../types';
import { Provider, createStore } from 'jotai';
import { createGenerateAtom, createRetrieveAndGenerateAtom, createRetrieveSourcesAtom, ragAtomsAtom } from '../../state/rag-state';

const RAGProvider = ({ 
  children,
  retrieve,
  retrieveAndGenerate,
  generate,
  getDataSource
}: RAGProviderProps) => {

  const store = useMemo(() => createStore(), [])

  const generateAtom = useMemo(() => createGenerateAtom(generate), [generate]);
  const retrieveAndGenerateAtom = useMemo(() => createRetrieveAndGenerateAtom(retrieveAndGenerate), [retrieveAndGenerate]);
  const retrieveSourcesAtom = useMemo(() => createRetrieveSourcesAtom(retrieve), [retrieve]);
  

  useEffect(() => {
    console.log('Setting RAG atoms', generateAtom, retrieveAndGenerateAtom, retrieveSourcesAtom);
    store.set(ragAtomsAtom, {
      generateAtom,
      retrieveAndGenerateAtom,
      retrieveSourcesAtom
    });
  }, [store, generateAtom, retrieveAndGenerateAtom, retrieveSourcesAtom]);

  return (
    <Provider store={store}>
        {children}
    </Provider>
  );
};

export { RAGProvider };