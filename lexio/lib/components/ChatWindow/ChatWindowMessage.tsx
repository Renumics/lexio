import React from "react";
import {Message} from "../../types.ts";
import Markdown from "react-markdown";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {docco} from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";
import {UserIcon} from "@heroicons/react/24/outline";


const ChatWindowMessageContent = ({
    content,
    asMarkdown,
    animateMarkdownContainerStyle,
    addCopyCode,
}) => {
    if (!asMarkdown) {
        return content;
    }

    // todo: we can introduce a new directive to render a custom component for the message content based on regex match
    return (
        <div
                className={"prose lg:prose-md prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent chat-markdown-content"}
                style={{...animateMarkdownContainerStyle, overflowX: 'auto', width: '100%'}}
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


const ChatWindowMessage = ({
    index,
    msg,
    addCopy,
    addCopyCode,
    showRoleLabels,
    userLabel,
    assistantLabel,
    style,
    asMarkdown,
    animateMarkdownContainerStyle,
}: { index: number, msg: Message }) => {
        return (
            <React.Fragment>
                <div className="mb-6">
                    {/* Message */}
                    <div
                        key={index}
                        className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`flex flex-row items-start px-3 py-2 rounded-lg max-w-[95%] drop-shadow-sm ${msg.role === 'user' ? 'w-[80%]' : 'w-[90%]'}`}
                            style={{backgroundColor: msg.role === 'user' ? style.textBackground : style.assistantTextBackground, borderRadius: style.borderRadius}}
                        >
                            {/* this W is the issue */}
                            {showRoleLabels && msg.role === 'assistant' && (
                                <strong className="mr-2 mt-2 whitespace-nowrap w-[15%] text-sm">
                                    {assistantLabel}
                                </strong>
                            )}
                            <div className={`whitespace-pre-wrap ${msg.role === 'user' ? 'w-full' : 'w-[85%] overflow-hidden'}`}>
                                <ChatWindowMessageContent
                                    content={msg.content}
                                    asMarkdown={asMarkdown}
                                    animateMarkdownContainerStyle={animateMarkdownContainerStyle}
                                    addCopyCode={addCopyCode}
                                />
                            </div>
                        </div>
                        {showRoleLabels && msg.role === 'user' && !userLabel && (
                            <UserIcon className="m-1 p-1 w-8 h-8 rounded-2xl" style={{background: style.textBackground}}/>
                            )
                        }
                        {showRoleLabels && msg.role === 'user' && userLabel !== '' && (
                            <strong className="ml-2 mt-2 whitespace-nowrap text-sm">
                                {userLabel}
                            </strong>
                        )}
                    </div>

                    {/* Message Utils */}
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
                </div>
            </React.Fragment>
        );
    }

export { ChatWindowMessage };

export { ChatWindowMessageContent };
