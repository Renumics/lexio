import React, { useCallback, useRef, useState, KeyboardEvent, useEffect } from 'react';
import {
    useFloating,
    useDismiss,
    useRole,
    useInteractions,
} from '@floating-ui/react';
import { useRAGSources, useRAGMessages, useRAGStatus } from '../RAGProvider/hooks';
import { RetrievalResult, SourceReference, WorkflowMode } from '../../types';
import useResizeObserver from '@react-hook/resize-observer';

// Add status configuration
const workflowStatus: Record<WorkflowMode, { label: string; color: string }> = {
    'init': { label: 'New Conversation', color: 'bg-blue-500' },
    'follow-up': { label: 'Follow-up', color: 'bg-green-500' },
    'reretrieve': { label: 'New Search', color: 'bg-purple-500' }
};

interface Mention {
    id: string;
    name: string;
    source: RetrievalResult;
}

interface AdvancedQueryFieldProps {
    onSubmit?: (message: string, mentions: Mention[]) => void;
    value?: string;
    onChange?: (value: string, mentions: Mention[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

const AdvancedQueryField: React.FC<AdvancedQueryFieldProps> = ({
    onSubmit,
    value = '',
    onChange,
    placeholder = 'Type @ to mention a source...',
    disabled = false,
}) => {
    const { sources } = useRAGSources();
    const { addMessage } = useRAGMessages();
    const { workflowMode } = useRAGStatus();
    const [isOpen, setIsOpen] = useState(false);
    const [filterValue, setFilterValue] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [triggerPosition, setTriggerPosition] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const filterInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const { refs, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
    });

    const dismiss = useDismiss(context);
    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([
        dismiss,
        role,
    ]);

    const adjustEditorHeight = useCallback(() => {
        if (editorRef.current && formRef.current) {
            const editor = editorRef.current;
            editor.style.height = 'auto';
            const scrollHeight = editor.scrollHeight;
            editor.style.height = `${scrollHeight}px`;
            editor.style.overflowY = scrollHeight > 200 ? 'auto' : 'hidden'; // Set a reasonable max height
        }
    }, []);

    useEffect(() => {
        adjustEditorHeight();
    }, [value, adjustEditorHeight]);

    // Use the custom hook to adjust height on resize
    useResizeObserver(formRef, adjustEditorHeight);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const content = editorRef.current?.textContent || '';
        if (content.trim()) {
            if (onSubmit) {
                onSubmit(content, mentions);
            }
            addMessage({
                role: 'user',
                content: content
            });
            // Clear the editor
            if (editorRef.current) {
                editorRef.current.textContent = '';
            }
            setMentions([]);
            adjustEditorHeight();
        }
    };

    const isSourceReference = (source: RetrievalResult): source is SourceReference => {
        return 'source' in source;
    };

    const getSourceDisplayName = (source: RetrievalResult): string => {
        if (isSourceReference(source)) {
            return source.source;
        }
        return source.text.slice(0, 50) + (source.text.length > 50 ? '...' : '');
    };

    const filteredSources = sources.filter((source) =>
        getSourceDisplayName(source).toLowerCase().includes(filterValue.toLowerCase())
    );

    const insertMention = useCallback(
        (source: RetrievalResult) => {
            const editorElement = editorRef.current as HTMLDivElement | null;
            if (!editorElement || triggerPosition === null) return;

            // Get the current selection
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;

            // Find the correct text node and offset
            const findPositionInTextNodes = (
                node: Node,
                targetPosition: number
            ): { node: Node; offset: number } | null => {
                let currentPosition = 0;
                const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);

                while (walker.nextNode()) {
                    const currentNode = walker.currentNode;
                    const length = currentNode.textContent?.length || 0;

                    if (currentPosition + length >= targetPosition) {
                        return {
                            node: currentNode,
                            offset: targetPosition - currentPosition
                        };
                    }
                    currentPosition += length;
                }
                return null;
            };

            const position = findPositionInTextNodes(editorElement, triggerPosition);
            if (!position) return;

            const textNode = position.node;
            if (textNode.nodeType !== Node.TEXT_NODE) return;

            // Create and style the chip
            const chip = document.createElement('span');
            chip.contentEditable = 'false';
            chip.className = 'inline-flex items-center px-2 py-0.5 mx-1 rounded bg-blue-100 text-blue-800 text-sm select-none';
            const sourceId = isSourceReference(source) ? source.source : source.text.slice(0, 20);
            chip.setAttribute('data-mention-id', sourceId);
            chip.textContent = `@${getSourceDisplayName(source)}`;

            // Split the text and insert the chip
            const beforeText = textNode.textContent?.slice(0, position.offset - 1) || ''; // Remove the @ symbol
            const afterText = textNode.textContent?.slice(position.offset + 1) || '';     // Skip the @ symbol
            textNode.textContent = beforeText;

            const parent = textNode.parentNode;
            if (!parent) return;

            // Create a wrapper span for better cursor positioning
            const wrapper = document.createElement('span');
            wrapper.className = 'inline-flex items-center';

            const afterTextNode = document.createTextNode('\u00A0'); // Use non-breaking space
            wrapper.appendChild(chip);
            wrapper.appendChild(afterTextNode);

            parent.insertBefore(wrapper, textNode.nextSibling);

            if (afterText.trim()) {
                parent.insertBefore(document.createTextNode(afterText), wrapper.nextSibling);
            }

            // Set cursor position after the chip
            const newRange = document.createRange();
            newRange.setStartAfter(wrapper);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);

            // Update state
            const newMention = {
                id: sourceId,
                name: getSourceDisplayName(source),
                source
            };
            setMentions(prev => [...prev, newMention]);
            setIsOpen(false);
            setFilterValue('');
            setTriggerPosition(null);

            // Focus back on the editor
            editorElement.focus();

            if (onChange) {
                onChange(editorElement.textContent || '', [...mentions, newMention]);
            }
        },
        [triggerPosition, mentions, onChange, editorRef]
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === '@') {
            const selection = window.getSelection();
            if (!selection || !selection.anchorNode) return;

            // Calculate absolute position by traversing nodes
            const calculateAbsolutePosition = (node: Node, targetNode: Node, offset: number): number => {
                let position = 0;
                const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);

                while (walker.nextNode()) {
                    const currentNode = walker.currentNode;
                    if (currentNode === targetNode) {
                        return position + offset;
                    }
                    position += currentNode.textContent?.length || 0;
                }
                return position;
            };

            const range = selection.getRangeAt(0);
            const absolutePosition = calculateAbsolutePosition(
                editorRef.current!,
                selection.anchorNode,
                range.startOffset
            );
            setTriggerPosition(absolutePosition);

            // Get cursor position for menu placement
            const rect = range.getBoundingClientRect();
            const editorRect = editorRef.current?.getBoundingClientRect();

            if (editorRect) {
                setMenuPosition({
                    x: rect.left - editorRect.left,
                    y: rect.bottom - editorRect.top
                });
            }

            setIsOpen(true);
            setSelectedIndex(0);
            setFilterValue('');

            setTimeout(() => {
                filterInputRef.current?.focus();
            }, 0);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFilterKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && filteredSources.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            insertMention(filteredSources[selectedIndex]);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev === 0 ? filteredSources.length - 1 : prev - 1
            );
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev === filteredSources.length - 1 ? 0 : prev + 1
            );
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            (editorRef.current as HTMLDivElement)?.focus();
        }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        if (onChange) {
            onChange(e.currentTarget.textContent || '', mentions);
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="w-full flex flex-col">
            <div className="relative">
                <div
                    ref={editorRef}
                    className="w-full resize-none px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[2.5rem] max-h-[200px] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                    contentEditable={!disabled}
                    onInput={(e) => {
                        if (onChange) {
                            onChange(e.currentTarget.textContent || '', mentions);
                        }
                        adjustEditorHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    data-placeholder={placeholder}
                    suppressContentEditableWarning
                />

                {isOpen && menuPosition && (
                    <div
                        ref={refs.setFloating}
                        style={{
                            position: 'absolute',
                            left: `${menuPosition.x}px`,
                            top: `${menuPosition.y}px`,
                            width: '256px',
                            zIndex: 50,
                        }}
                        className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                        {...getFloatingProps()}
                    >
                        <div className="p-2 border-b">
                            <input
                                ref={filterInputRef}
                                type="text"
                                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Filter sources..."
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                onKeyDown={handleFilterKeyDown}
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filteredSources.length === 0 ? (
                                <div className="px-4 py-2 text-gray-500">No matches found</div>
                            ) : (
                                filteredSources.map((source, index) => {
                                    const displayName = getSourceDisplayName(source);
                                    const sourceType = isSourceReference(source) ? source.type : 'text';
                                    const relevanceScore = source.relevanceScore;
                                    
                                    return (
                                        <div
                                            key={index}
                                            className={`px-4 py-2 cursor-pointer ${selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                insertMention(source);
                                            }}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{displayName}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {sourceType && (
                                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                                                            {sourceType}
                                                        </span>
                                                    )}
                                                    {relevanceScore !== undefined && (
                                                        <span className="text-xs text-gray-500">
                                                            Score: {Math.round(relevanceScore * 100)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${workflowStatus[workflowMode].color} animate-pulse`} />
                    <span className="text-sm font-medium text-gray-600">
                        {workflowStatus[workflowMode].label}
                    </span>
                </div>
                <button
                    type="submit"
                    disabled={disabled || !(editorRef.current?.textContent?.trim())}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </div>
        </form>
    );
};

export { AdvancedQueryField };
