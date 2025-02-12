import React, { useContext } from 'react';
import { PdfViewer } from "../Viewers/PdfViewer";
import { HtmlViewer } from "../Viewers/HtmlViewer";
import { MarkdownViewer } from "../Viewers/MarkdownViewer";
import { useRAGSources } from "../RAGProvider/hooks2";
import { ThemeContext, removeUndefined } from "../../theme/ThemeContext";

export interface ContentDisplayStyles extends React.CSSProperties {
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  boxShadow?: string;
}

interface ContentDisplayProps {
  /**
   * Unique key for the component
   */
  key?: string;
  styleOverrides?: ContentDisplayStyles;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ styleOverrides = {} }) => {
  const { selectedSource } = useRAGSources();
  
  // use theme
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('ThemeContext is undefined');
  }
  const { componentDefaults } = theme.theme;

  // Merge theme defaults + overrides
  const style: ContentDisplayStyles = {
    backgroundColor: 'transparent',
    padding: 'none',
    borderRadius: componentDefaults.borderRadius,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    ...removeUndefined(styleOverrides),
  };

  if (!selectedSource) {
    return null;
  }

  const renderContent = () => {
    if (selectedSource.type === 'pdf' && selectedSource.data && selectedSource.data instanceof Uint8Array) {
      // Prefer 'page' over '_page' if both are defined
      const page = selectedSource.metadata?.page ?? selectedSource.metadata?._page;
      
      return (
        <PdfViewer 
          data={selectedSource.data}
          page={page}
          highlights={selectedSource.highlights}
        />
      );
    }

    if (selectedSource.type === 'html' && selectedSource.data && typeof selectedSource.data === 'string') {
      return <HtmlViewer htmlContent={selectedSource.data} />;
    }

    if (selectedSource.type === 'markdown' && selectedSource.data && typeof selectedSource.data === 'string') {
      return <MarkdownViewer markdownContent={selectedSource.data} />;
    }

    if (selectedSource.type === 'text' && selectedSource.data && typeof selectedSource.data === 'string') {
      return <MarkdownViewer markdownContent={selectedSource.data} />;
    }

    return <div>Unsupported content type</div>;
  };

  return <div className="w-full h-full" style={style}>{renderContent()}</div>;
};

export { ContentDisplay };
