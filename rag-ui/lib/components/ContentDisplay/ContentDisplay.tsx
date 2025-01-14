import { PdfViewer } from "../PdfViewer/PdfViewer";
import { HtmlViewer } from "../HtmlViewer/HtmlViewer";
import { useRAGSources } from "../RAGProvider/hooks";

const ContentDisplay = () => {
  const { currentSourceContent } = useRAGSources();

  if (!currentSourceContent) {
    return null;
  }

  const { type, content, metadata, highlights } = currentSourceContent;

  const renderContent = () => {
    if (type === "pdf" && typeof content === "object") {

      return <PdfViewer data={content} page={metadata?.page} highlights={highlights} />;
    }

    if (type === "html" && content instanceof Uint8Array) {
        const decoder = new TextDecoder("utf-8");
        const htmlContent = decoder.decode(content);
        return <HtmlViewer htmlContent={htmlContent}/>;
    }

    if (typeof content === "string") {
      return <HtmlViewer htmlContent={content}/>;
    }

    return <div>Unsupported content type</div>;
  };

  return <div className="w-full h-full">{renderContent()}</div>;
};

export { ContentDisplay };
