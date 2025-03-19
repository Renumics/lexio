import React from "react";
import {ChatWindowStyles} from "./ChatWindow";
import Markdown from "react-markdown";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {docco} from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";
import {ClipboardIcon, ClipboardDocumentIcon} from "@heroicons/react/24/outline";

/**
 * Props for the AssistantMarkdownContent component.
 * @typedef {Object} AssistantMarkdownContentProps
 * @property {string} content - The markdown content to render.
 * @property {ChatWindowStyles} style - Styling options for the chat window.
 */
interface AssistantMarkdownContentProps {
    content: string;
    style: ChatWindowStyles;
}

/**
 * Renders markdown content with enhanced features such as syntax highlighting and copy functionality.
 *
 * @param {AssistantMarkdownContentProps} props - The props for the component.
 * @returns {JSX.Element} The rendered markdown content.
 *
 * @internal
 */
export const AssistantMarkdownContent: React.FC<AssistantMarkdownContentProps> = ({content, style}) => {
    return (
        <Markdown
            components={{
                /**
                 * Custom renderer for code blocks to include syntax highlighting and a copy button.
                 *
                 * @param {Object} props - Properties passed to the code component.
                 * @param {Object} props.node - The AST node.
                 * @param {string} props.className - The class name for the code block.
                 * @param {React.ReactNode} props.children - The code content.
                 * @returns {JSX.Element} The customized code block.
                 */
                code({node, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : 'plaintext';
                    const [copied, setCopied] = React.useState(false);

                    /**
                     * Handles copying the code content to the clipboard.
                     */
                    const handleCopy = () => {
                        navigator.clipboard.writeText(String(children));
                        setCopied(true);
                        setTimeout(() => {
                            setCopied(false);
                        }, 3000); // Reset copied state after 3 seconds
                    }

                    // Block code (triple ```)
                    return (
                        <div style={{
                            position: 'relative',
                            marginBottom: '1rem'
                        }} {...(props as React.HTMLProps<HTMLDivElement>)}>
                            {match && (
                                <div
                                    style={{
                                        marginLeft: '0.33rem',
                                        fontSize: 'var(--font-size-small)',
                                        fontWeight: 'bold',
                                        background: '#f5f5f5',
                                        padding: '0 8px',
                                        borderTopLeftRadius: '5px',
                                        borderTopRightRadius: '5px',
                                        borderBottom: '1px solid #ccc',
                                        display: 'inline-block',
                                    }}
                                >
                                    {language}
                                </div>
                            )}
                            <div className="relative">
                                <SyntaxHighlighter
                                    style={docco}
                                    language={language}
                                    PreTag="div"
                                    wrapLongLine={true}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>

                                <div
                                    className="absolute top-1 right-1 px-1.5 pt-0.5 text-sm rounded-md hover:shadow-md "
                                    style={{
                                        backgroundColor: style.messageBackgroundColor,
                                    }}
                                >
                                    <button
                                        onClick={handleCopy}
                                    >
                                        {copied ? <ClipboardDocumentIcon className={"w-5 h-5"} /> : <ClipboardIcon className={"w-5 h-5"} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                },
            }}
            remarkPlugins={[remarkGfm]}>
            {content}
        </Markdown>
    );
}
