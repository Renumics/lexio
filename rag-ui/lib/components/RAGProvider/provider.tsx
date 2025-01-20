import { useEffect, useMemo } from 'react';
import type { RAGProviderProps } from '../../types';
export * from '../../types';
import { Provider, createStore} from 'jotai';
import { createGenerateAtom, createGetDataSourceAtom, createRetrieveAndGenerateAtom, createRetrieveSourcesAtom, onAddMessageAtom, ragAtomsAtom, ragConfigAtom } from '../../state/rag-state';

const RAGProvider = ({ 
  children,
  retrieve,
  retrieveAndGenerate,
  generate,
  getDataSource,
  config,
  onAddMessage,
}: RAGProviderProps) => {

  const store = useMemo(() => createStore(), [])

  const generateAtom = useMemo(() => generate ? createGenerateAtom(generate) : null, [generate]);
  const retrieveAndGenerateAtom = useMemo(() => retrieveAndGenerate ? createRetrieveAndGenerateAtom(retrieveAndGenerate) : null, [retrieveAndGenerate]);
  const retrieveSourcesAtom = useMemo(() => retrieve ? createRetrieveSourcesAtom(retrieve) : null, [retrieve]);
  const getDataSourceAtom = useMemo(() => createGetDataSourceAtom(getDataSource || null), [getDataSource]);
  const memoizedConfig = useMemo(() => config, [config]);

  useEffect(() => {
    console.log("retrieveAndGenerateAtom", retrieveAndGenerateAtom);
    store.set(ragAtomsAtom, {
      generateAtom: generateAtom,
      retrieveAndGenerateAtom: retrieveAndGenerateAtom,
      retrieveSourcesAtom: retrieveSourcesAtom,
      getDataSourceAtom: getDataSourceAtom
    });
    if (memoizedConfig) {
      store.set(ragConfigAtom, memoizedConfig);
    }
    if (onAddMessage) {
      store.set(onAddMessageAtom, () => onAddMessage); // need to wrap in a function to avoid confusion with state updater function
    }
  }, [store, generateAtom, retrieveAndGenerateAtom, retrieveSourcesAtom, getDataSourceAtom, memoizedConfig, onAddMessage]);

  return (
    <Provider store={store}>
        {children}
    </Provider>
  );
};

export { RAGProvider };