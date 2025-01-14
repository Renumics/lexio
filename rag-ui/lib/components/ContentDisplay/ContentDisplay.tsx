import { PdfViewer } from "../PdfViewer/PdfViewer";
import { HtmlViewer } from "../HtmlViewer/HtmlViewer";
import { useRAGSources } from "../RAGProvider/hooks";

const ContentDisplay = () => {
  const { currentSourceContent } = useRAGSources();

  if (!currentSourceContent) {
    return null;
  }

  const { type, content, metadata } = currentSourceContent;

  const renderContent = () => {
    if (type === "pdf" && typeof content === "object") {

      return <PdfViewer data={content} page={metadata?.page} />;
    }

    if (type === "html" && typeof content === "string") {
      return <HtmlViewer htmlContent={content} />;
    }

    if (typeof content === "string") {
      return <div>{content}</div>;
    }

    return <div>Unsupported content type</div>;
  };

  return <div className="w-full h-full">{renderContent()}</div>;
};

export { ContentDisplay };
