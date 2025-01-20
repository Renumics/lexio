import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {HtmlViewer} from "../HtmlViewer";

interface MarkdownViewerProps {
    markdownContent: string;   // The raw markdown string you want to render
}

const MarkdownViewer = ({markdownContent}: MarkdownViewerProps) => {
    return (
        <HtmlViewer htmlContent={<Markdown remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>} />
    );
};

export { MarkdownViewer };