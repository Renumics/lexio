import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {HtmlViewer} from "../HtmlViewer";
import type { HtmlViewerStyles } from "../HtmlViewer/HtmlViewer";

interface MarkdownViewerProps {
    markdownContent: string;   // The raw markdown string you want to render
    styleOverrides?: HtmlViewerStyles;
}

const MarkdownViewer = ({markdownContent, styleOverrides}: MarkdownViewerProps) => {
    return (
        <HtmlViewer 
            htmlContent={<Markdown remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>}
            styleOverrides={styleOverrides}
        />
    );
};

export { MarkdownViewer };