import {useContext} from "react";
import {HtmlViewer, LoadingSpinner, MarkdownViewer, PdfViewer} from "../Viewers";
import {useSources} from "../../hooks";
import {removeUndefined, ThemeContext} from "../../theme/ThemeContext";
import ExcelViewer from "../Viewers/SpreadsheetViewer/ExcelViewer";
import {PDFHighlight, Source, SpreadsheetHighlight} from "../../types.ts";

export interface ContentDisplayStyles extends React.CSSProperties {
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
    loadingSpinnerColor?: string;
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
    const { colors, componentDefaults } = theme.theme;

    // Merge theme defaults + overrides
    const style: ContentDisplayStyles = {
        backgroundColor: 'transparent',
        padding: 'none',
        borderRadius: componentDefaults.borderRadius,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        loadingSpinnerColor: colors.primary,
        ...removeUndefined(styleOverrides),
    };

    const filename = selectedSource?.title ?? "";

    if (!selectedSource) {
        return null;
    }

    return (
        <div className="w-full h-full overflow-hidden" style={style}>
            <FileViewerRenderer
                color={style.loadingSpinnerColor ?? colors.primary}
                fileName={filename}
                selectedSource={selectedSource as Source}
            />
        </div>
    );
};

type PropsFileViewerRenderer = {
    color: string;
    fileName: string;
    selectedSource: Source;
}
const FileViewerRenderer = ({ color, fileName, selectedSource }: PropsFileViewerRenderer) => {
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
            <ExcelViewer
                fileName={fileName}
                fileBufferArray={data as ArrayBuffer}
                rangesToHighlight={[
                    ...((highlights as SpreadsheetHighlight[]) ?? []),
                    {
                        sheetName: "Konfiguration",
                        ranges: ["B5:C12", "B26:C30", "H2:H8", "E14:E14", "G7:I10"],
                    },
                    {
                        sheetName: "Apr",
                        ranges: ["K15:P22", "M40:P43"],
                    },
                    {
                        sheetName: "Gesamt",
                        ranges: ["C5:E12"]
                    }
                ]}
                defaultSelectedSheet={defaultSheetName}
                showSearchbar={true}
                showNotifications={true}
                viewSettings={{
                    showZoom: true,
                    showHighlightToggle: true,
                    showHighlightList: true,
                    showOriginalStylesToggle: true,
                }}
                showOptionToolbar={true}
                colorScheme={"light"}
            />
        );
    }

    return (
        <div className="flex justify-center items-center w-full h-full">
            <LoadingSpinner
                color={color}
                size={64}
                timeout={100000}
            />
        </div>
    );
}

export { ContentDisplay };
