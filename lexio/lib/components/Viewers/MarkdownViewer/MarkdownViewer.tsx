import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {HtmlViewer} from "../HtmlViewer";
import type { HtmlViewerStyles } from "../HtmlViewer/HtmlViewer";

/**
 * Props for the MarkdownViewer component.
 * @see {@link MarkdownViewer}
 * 
 * @interface MarkdownViewerProps
 * @property {string} markdownContent - The raw markdown string to render
 * @property {HtmlViewerStyles} [styleOverrides] - Optional style overrides that will be passed to the underlying HtmlViewer
 */
interface MarkdownViewerProps {
    /** The raw markdown string to render */
    markdownContent: string;
    /** Optional style overrides that will be passed to the underlying HtmlViewer */
    styleOverrides?: HtmlViewerStyles;
}

/**
 * A component for rendering Markdown content with zoom controls and theme support.
 * Wraps the HtmlViewer component and uses react-markdown for markdown parsing.
 * 
 * @component
 * @param {MarkdownViewerProps} props - The props for the MarkdownViewer
 * @returns {JSX.Element} A themed markdown viewer with zoom controls
 *
 * @remarks
 * **Highlights:**
 * - Uses react-markdown with remark-gfm plugin for GitHub Flavored Markdown support
 * - Inherits all features from HtmlViewer (zoom, theme support, etc.)
 * - Used internally by ContentDisplay when displaying Markdown source content
 *
 * @example
 *
 * ```tsx
 * <MarkdownViewer
 *   markdownContent="# Hello World\n\nThis is **markdown** content"
 *   styleOverrides={{
 *     contentBackground: '#ffffff',
 *     contentPadding: '20px'
 *   }}
 * />
 * ```
 */
const MarkdownViewer = ({markdownContent, styleOverrides}: MarkdownViewerProps) => {
    return (
        <HtmlViewer 
            htmlContent={<Markdown remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>}
            styleOverrides={styleOverrides}
        />
    );
};

export { MarkdownViewer };