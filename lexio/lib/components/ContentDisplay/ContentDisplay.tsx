import React, {useContext} from "react";
import { PdfViewer } from "../Viewers/PdfViewer";
import { HtmlViewer } from "../Viewers/HtmlViewer";
import { MarkdownViewer } from "../Viewers/MarkdownViewer";
import { useSources } from "../../hooks";
import { ThemeContext, removeUndefined } from "../../theme/ThemeContext";
import {SpreadsheetViewer} from "../Viewers/SpreadsheetViewer";
import {PDFHighlight, Source, SpreadsheetHighlight} from "../../types.ts";

export interface ContentDisplayStyles extends React.CSSProperties {
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  boxShadow?: string;
}

interface ContentDisplayProps {
  styleOverrides?: ContentDisplayStyles;
  componentKey?: string;
}

/**
 * A component for displaying various content types from selected sources.
 * 
 * ContentDisplay renders the content of the currently selected source, automatically
 * choosing the appropriate viewer based on the source type (PDF, HTML, Markdown or Excel spreadsheet).
 *
 * @component
 * 
 * Features:
 * - Automatic content type detection
 * - PDF viewer with navigation, zoom, and highlight support
 * - HTML viewer with sanitization and styling
 * - Markdown viewer with formatting
 * - Excel spreadsheet viewer with range highlighting
 * - Loading state indication
 * - Responsive design
 * 
 * @example
 * 
 * ```tsx
 * <ContentDisplay
 *   componentKey="main-content"
 *   styleOverrides={{
 *     backgroundColor: '#ffffff',
 *     padding: '1rem',
 *     borderRadius: '8px',
 *     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
 *   }}
 * />
 * ```
 */
const ContentDisplay: React.FC<ContentDisplayProps> = ({
                                                   styleOverrides = {},
                                                   componentKey = undefined,
}) => {
  const { selectedSource } = useSources(componentKey ? `ContentDisplay-${componentKey}` : 'ContentDisplay');
  
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

  const filename = selectedSource?.title ?? "";

  if (!selectedSource) {
    return null;
  }

  return (
      <div className="w-full h-full overflow-hidden" style={style}>
        <FileViewerRenderer
            fileName={filename}
            selectedSource={selectedSource as Source}
        />
      </div>
  );
};

type PropsFileViewerRenderer = {
  fileName: string;
  selectedSource: Source;
}
const FileViewerRenderer = ({ fileName, selectedSource }: PropsFileViewerRenderer) => {
  if (selectedSource.type === 'pdf' && selectedSource.data && selectedSource.data instanceof Uint8Array) {
    // Prefer 'page' over '_page' if both are defined
      const page = selectedSource.metadata?._pdfPageOverride ?? selectedSource.metadata?.page ?? selectedSource.metadata?._page;

      const isPDFHighlightArray = (arr: unknown[] | undefined): arr is PDFHighlight[] => {
        return Array.isArray(arr) && arr.every((item) => Object.prototype.hasOwnProperty.call(item, "page") && Object.prototype.hasOwnProperty.call(item, "rect"));
      }
    return (
        <PdfViewer
            data={selectedSource.data}
            page={page}
            highlights={isPDFHighlightArray(selectedSource.highlights) ? selectedSource.highlights : undefined}
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

  if (
      selectedSource.type === "xlsx" &&
      selectedSource.data &&
      selectedSource.data instanceof ArrayBuffer
  ) {
    const {data, highlights} = selectedSource;
    const defaultSheetName = highlights ? (highlights as SpreadsheetHighlight[])[0].sheetName : undefined;

    return (
        <SpreadsheetViewer
            fileName={fileName}
            fileBufferArray={data as ArrayBuffer}
            rangesToHighlight={highlights as SpreadsheetHighlight[]}
            defaultSelectedSheet={defaultSheetName}
        />
    )
  }

  return (
      <div className="flex justify-center items-center w-full h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
  );
}

export { ContentDisplay };
