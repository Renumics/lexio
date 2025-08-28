import {useContext} from "react";
import {HtmlViewer, LoadingSpinner, MarkdownViewer, PdfViewer} from "../Viewers";
import {useSources} from "../../hooks";
import {removeUndefined, ThemeContext} from "../../theme/ThemeContext";
import SpreadsheetViewer from "../Viewers/SpreadsheetViewer/SpreadsheetViewer.tsx";
import {PDFHighlight, Source, SpreadsheetHighlight} from "../../types.ts";
import {ExcelViewerConfig} from "../Viewers/SpreadsheetViewer/types.ts";

export interface ContentDisplayStyles extends React.CSSProperties {
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
    loadingSpinnerColor?: string;
}

/**
 * Props for the ContentDisplay component
 *
 * @type ContentDisplayProps
 * @property {ContentDisplayStyles} styleOverrides - Style overrides for the content display component.
 * @property {string} componentKey - Component identifier.
 * @property {ExcelViewerConfig | undefined} spreadsheetViewerLayoutConfigOverrides - Layout config for the spreadsheet viewer.
 */
interface ContentDisplayProps {
    styleOverrides?: ContentDisplayStyles;
    componentKey?: string;
    spreadsheetViewerLayoutConfigOverrides?: Partial<ExcelViewerConfig> | undefined;
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
                                                           spreadsheetViewerLayoutConfigOverrides,
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
                spreadsheetViewerLayoutConfigOverrides={spreadsheetViewerLayoutConfigOverrides}
            />
        </div>
    );
};

type PropsFileViewerRenderer = {
    color: string;
    fileName: string;
    selectedSource: Source;
    spreadsheetViewerLayoutConfigOverrides?: Partial<ExcelViewerConfig> | undefined;
}
const FileViewerRenderer = ({ color, fileName, selectedSource, spreadsheetViewerLayoutConfigOverrides }: PropsFileViewerRenderer) => {
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
                rangesToHighlight={(highlights as SpreadsheetHighlight[] | undefined) ?? []}
                defaultSelectedSheet={defaultSheetName}
                layoutConfig={{
                    showSearchbar: spreadsheetViewerLayoutConfigOverrides?.showSearchbar ?? true,
                    showNotifications: spreadsheetViewerLayoutConfigOverrides?.showNotifications ?? true,
                    viewSettings: {
                        showZoom: spreadsheetViewerLayoutConfigOverrides?.viewSettings?.showZoom ?? true,
                        showHighlightToggle: spreadsheetViewerLayoutConfigOverrides?.viewSettings?.showHighlightToggle ?? true,
                        showHighlightList: spreadsheetViewerLayoutConfigOverrides?.viewSettings?.showHighlightList ?? true,
                        showOriginalStylesToggle: spreadsheetViewerLayoutConfigOverrides?.viewSettings?.showOriginalStylesToggle ?? true,
                    },
                    showOptionToolbar: spreadsheetViewerLayoutConfigOverrides?.showOptionToolbar ?? true,
                    showWorkbookDetails: spreadsheetViewerLayoutConfigOverrides?.showWorkbookDetails ?? true,
                    colorScheme:  spreadsheetViewerLayoutConfigOverrides?.colorScheme ?? "light",
                }}
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
