import React, {ReactNode, useMemo} from "react";
import {ChatWindowStyles} from "./ChatWindow.tsx";
import Markdown from "react-markdown";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {docco} from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";
import "./AssistantMarkdownContent.css";

// todo: colors, background, copy?, props, docs
const AssistantMarkdownContent = ({content, style}: {content: string, style: ChatWindowStyles}) => {
    return (
        <Markdown
            components={{
                // We override the code block rendering to add a copy button and syntax highlighting
                code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : 'plaintext';
                    const [copied, setCopied] = React.useState(false);

                    const handleCopy = () => {
                        navigator.clipboard.writeText(String(children));
                        setCopied(true);
                        setTimeout(() => {
                            setCopied(false);
                        }, 1500); // Reset copied state after 1.5 seconds
                    }

                    // Block code (triple ```)
                    return (
                        <div style={{position: 'relative', marginBottom: '1rem'}} {...(props as React.HTMLProps<HTMLDivElement>)} >
                            {match && (
                                <div
                                    style={{
                                        marginLeft: '0.33rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        background: '#f5f5f5',
                                        padding: '4px 8px',
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
                                    className="absolute top-1 right-1 p-1 text-sm rounded-md hover:shadow-md "
                                    style={{
                                        backgroundColor: style.messageBackgroundColor,
                                    }}
                                >
                                    <button
                                        onClick={handleCopy}
                                    >
                                        {copied ? "Copied!" : "Copy"}
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

interface ChatWindowAssistantMessageProps {
    message: string;
    style: ChatWindowStyles;
    roleLabel: string;
    showRoleIndicator: boolean;
    icon?: ReactNode;
    markdown?: boolean;
}

const ChatWindowAssistantMessage: React.FC<ChatWindowAssistantMessageProps> = ({
    message,
    style,
    roleLabel,
    showRoleIndicator,
    icon,
    markdown
}) => {
    // show icon if showRoleIndicator is true and icon is not null
    const showIcon = showRoleIndicator && !!icon;
    // show label if showRoleIndicator is true and roleLabel is not null and icon is not shown
    const showLabel = showRoleIndicator && !!roleLabel && !showIcon;

        // use this to set the fontBaseSize as css-var for the markdown container
    const assistantMarkdownContentStyling = useMemo(() => {
        return { "--base-font-size": `1rem` } as React.CSSProperties;
    }, [style.messageFontSize]);

    return <div className={`w-full flex ${showIcon ? 'justify-start': 'flex-col items-start'} pe-10`}>
        {showLabel && <strong className="inline-block ml-2 mb-1" style={{
            fontSize: style.roleLabelFontSize,
            lineHeight: 'normal',
        }}>{roleLabel}</strong>}
        {showIcon && <div className="flex flex-col items-center m-2">
            <div className="w-fit h-fit p-1 rounded-3xl" style={{
                backgroundColor: style.messageBackgroundColor,
                border: `2px solid ${style.messageBackgroundColor}`,
            }}>
                {icon}
            </div>
        </div>}
        <div className="mb-6 py-1 px-3.5 shadow-sm w-fit max-w-full" style={{
            backgroundColor: style.messageBackgroundColor,
            borderRadius: style.messageBorderRadius,
            fontSize: style.messageFontSize,
        }}>
            {markdown ? (
                <div className={"whitespace-pre-wrap assistant-markdown-content"} style={assistantMarkdownContentStyling}>
                    <AssistantMarkdownContent content={message} style={style} />
                </div>
            ) : (
                <div className="inline whitespace-pre-wrap">
                    {message}
                </div>
            )}
        </div>
    </div>
}

export { ChatWindowAssistantMessage };