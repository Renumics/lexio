import { PdfViewer } from "../PdfViewer/PdfViewer";
import { HtmlViewer } from "../HtmlViewer/HtmlViewer";
import { useRAGSources } from "../RAGProvider/hooks";
import { isPDFContent, isHTMLContent } from "../../types";

const ContentDisplay = () => {
  const { currentSourceContent } = useRAGSources();

  if (!currentSourceContent) {
    return null;
  }

  const renderContent = () => {
    if (isPDFContent(currentSourceContent)) {
      return (
        <PdfViewer 
          data={currentSourceContent.content}
          page={currentSourceContent.metadata?.page}
          highlights={currentSourceContent.highlights}
        />
      );
    }

    if (isHTMLContent(currentSourceContent)) {
      return <HtmlViewer htmlContent={currentSourceContent.content} />;
    }

    return <div>Unsupported content type</div>;
  };

  return <div className="w-full h-full">{renderContent()}</div>;
};

export { ContentDisplay };
