import React from "react";
import {Message} from "../../types.ts";
import Markdown from "react-markdown";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {docco} from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";

const Message = ({content, asMarkdown, animateMarkdownContainerStyle}) => {
    if (!asMarkdown) {
        return content;
    }
    return (
        <div
            className={"prose lg:prose-md prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent chat-markdown-content overf"}
            style={{...animateMarkdownContainerStyle, overflowX: 'auto', maxWidth: '100%'}}
            >
            <Markdown
                components={{
                    // We override the code block rendering to add a copy button and syntax highlighting
                    code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : 'plaintext';

                        const handleCopy = () => {
                            navigator.clipboard.writeText(String(children));
                        }

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
                                    {addCopyCode && (
                                        <div
                                            className="absolute top-1 right-1 p-1 text-sm bg-white rounded-md hover:bg-gray-200 active:bg-gray-300 transition"
                                        >
                                            <button
                                                onClick={handleCopy}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    },
                }}
                remarkPlugins={[remarkGfm]}>
                    {content}
            </Markdown>
        </div>
    );
};


const renderMessage = ({index, msg}: { index: number, msg: Message }) => {
        return (
            <React.Fragment>
                <div
                    key={index}
                    className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`px-3 py-2 rounded-lg w-fit max-w-[90%] flex items-start drop-shadow-sm`}
                        style={{backgroundColor: msg.role === 'user' ? style.textBackground : style.assistantTextBackground, borderRadius: style.borderRadius}}
                    >
                        {showRoleLabels && msg.role === 'assistant' && (
                            <strong className="mr-2 whitespace-nowrap">
                                {assistantLabel}
                            </strong>
                        )}
                        <div className="whitespace-pre-wrap overflow-scroll">{renderContent(msg.content)}</div>
                        {showRoleLabels && msg.role === 'user' && userLabel !== '' && (
                            <strong className="ml-2 whitespace-nowrap">
                                {userLabel}
                            </strong>
                        )}
                    </div>
                </div>
                {addCopy && msg.role === 'assistant' && (
                    <div
                        className={`flex place-self-center p-1 text-sm rounded-md hover:bg-gray-200 active:bg-gray-300 transition`}
                    >
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(msg.content);
                            }}
                        >
                            Copy
                        </button>
                    </div>
                )}
            </React.Fragment>
        );
    }