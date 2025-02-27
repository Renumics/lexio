import React, {FC, useContext} from "react";
import { PdfViewer } from "../Viewers/PdfViewer";
import { HtmlViewer } from "../Viewers/HtmlViewer";
import { MarkdownViewer } from "../Viewers/MarkdownViewer";
import { useRAGSources } from "../../hooks/hooks";
import { ThemeContext, removeUndefined } from "../../theme/ThemeContext";
import {SpreadsheetViewer} from "../Viewers/SpreadsheetViewer";
import {Source} from "../../types.ts";

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
  const { selectedSource, sources, selectedSourceId } = useRAGSources();
  
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

  const source = selectedSourceId ? (sources.find((s) => s.id === selectedSourceId) ?? undefined) : undefined;
  const filename = source?.title ?? "";

  if (!selectedSource) {
    return null;
  }

  return (
      <div className="w-full h-full" style={style}>
        <FileViewerRenderer
            fileName={filename}
            selectedSource={selectedSource}
        />
      </div>
  );
};

type PropsFileViewerRenderer = {
  fileName: string;
  selectedSource: Source;
}
const FileViewerRenderer: FC<PropsFileViewerRenderer> = (props) => {
  const {
    fileName,
    selectedSource,
  } = props;

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

  if (
      selectedSource.type === "xlsx" &&
      selectedSource.data &&
      selectedSource.data instanceof ArrayBuffer
  ) {
    const {data, rangesHighlights} = selectedSource;
    const ranges = rangesHighlights?.map((h) => h.ranges).flat();
    const defaultSheetName = rangesHighlights ? rangesHighlights[0].sheetName : undefined;

    return (
        <SpreadsheetViewer
            fileName={fileName}
            fileBufferArray={data as ArrayBuffer}
            rangesToHighlight={ranges}
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
