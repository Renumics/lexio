import { PdfViewer } from "../PdfViewer/PdfViewer";
import { useRAGSources } from "../RAGProvider/hooks";

const ContentDisplay = () => {
  const { currentSourceContent } = useRAGSources();

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