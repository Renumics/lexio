import { useAtomValue } from "jotai";
import { currentSourceContentAtom } from "../../state/rag-state";
import { PdfViewer } from "../PdfViewer/PdfViewer";
import { SourceContent } from "../../types";

const ContentDisplay = () => {
  const currentSourceContent = useAtomValue<SourceContent | null>(currentSourceContentAtom);

  console.log(currentSourceContent);

  if (!currentSourceContent) {
    return null;
  }

  return (
    <div className="w-full h-full">
      {currentSourceContent.type === 'pdf' && typeof currentSourceContent.content === 'object' ? (
        <PdfViewer data={currentSourceContent.content} />
      ) : (
        <div>{currentSourceContent.content}</div>
      )}
    </div>
  );
};

export { ContentDisplay };