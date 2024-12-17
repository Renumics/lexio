import { useAtomValue } from "jotai";
import { activeSourceIndexAtom, retrievedSourcesAtom } from "../../state/rag-state";

const ContentDisplay = () => {
  const activeSourceIndex = useAtomValue(activeSourceIndexAtom);
  const retrievedSources = useAtomValue(retrievedSourcesAtom);

  return <div>ContentDisplay</div>;
};

export { ContentDisplay };