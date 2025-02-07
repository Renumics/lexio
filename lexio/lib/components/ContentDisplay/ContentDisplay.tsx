import React, { useContext, useMemo } from 'react';
import { PdfViewer } from "../Viewers/PdfViewer";
import { HtmlViewer } from "../Viewers/HtmlViewer";
import { MarkdownViewer } from "../Viewers/MarkdownViewer";
import { useRAGMessages, useRAGSources } from "../RAGProvider/hooks";
import { isPDFContent, isHTMLContent, isMarkdownContent } from "../../types";
import { ThemeContext, removeUndefined } from "../../theme/ThemeContext";

export interface ContentDisplayStyles extends React.CSSProperties {
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  boxShadow?: string;
}

interface ContentDisplayProps {
  styleOverrides?: ContentDisplayStyles;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ styleOverrides = {} }) => {
  const { currentSourceContent } = useRAGSources();
  const { messages } = useRAGMessages();

  const lastMessageContent = useMemo(
    () => messages[messages.length - 1]?.content,
    [messages]
  );

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

  if (!currentSourceContent) {
    return null;
  }

  const renderContent = () => {
    if (isPDFContent(currentSourceContent)) {
      return (
        <PdfViewer
          data={currentSourceContent.content}
          page={currentSourceContent?.page}
          highlights={currentSourceContent.highlights}
          lastMessageContent={lastMessageContent}
        />
      );
    }

    if (isHTMLContent(currentSourceContent)) {
      return <HtmlViewer htmlContent={currentSourceContent.content} />;
    }

    if (isMarkdownContent(currentSourceContent)) {
      return <MarkdownViewer markdownContent={currentSourceContent.content} />;
    }

    return <div>Unsupported content type</div>;
  };

  return <div className="w-full h-full" style={style}>{renderContent()}</div>;
};

export { ContentDisplay };
