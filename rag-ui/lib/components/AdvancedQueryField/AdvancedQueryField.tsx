// --- Imports ---
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

// --- Type Definitions ---
interface Mention {
    id: string;
    name: string;
    source: RetrievalResult;
}

interface CursorPosition {
    node: Node;
    offset: number;
}

interface AdvancedQueryFieldProps {
    onSubmit?: (message: string, mentions: Mention[]) => void;
    value?: string;
    onChange?: (value: string, mentions: Mention[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

// --- Constants and Configurations ---
const workflowStatus: Record<WorkflowMode, { label: string; color: string }> = {
    'init': { label: 'New Conversation', color: 'bg-blue-500' },
    'follow-up': { label: 'Follow-up', color: 'bg-green-500' },
    'reretrieve': { label: 'New Search', color: 'bg-purple-500' }
};

// --- Main Component ---
const AdvancedQueryField: React.FC<AdvancedQueryFieldProps> = ({
    onSubmit,
    value = '',
    onChange,
    placeholder = 'Type @ to mention a source...',
    disabled = false,
}) => {
    // --- State and Refs ---
    const [isOpen, setIsOpen] = useState(false);
    const [filterValue, setFilterValue] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [localSourceIndices, setLocalSourceIndices] = useState<number[]>([]);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
    
    const filterInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // --- Hooks and Context ---
    const { sources, setCurrentSourceIndices } = useRAGSources();
    const { addMessage } = useRAGMessages();
    const { workflowMode } = useRAGStatus();

    // Floating UI setup
    const { refs, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
    });

    const dismiss = useDismiss(context);
    const role = useRole(context);
    const { getFloatingProps } = useInteractions([dismiss, role]);

    // --- Effects and Observers ---
    const adjustEditorHeight = useCallback(() => {
        if (editorRef.current && formRef.current) {
            const editor = editorRef.current;
            editor.style.height = 'auto';
            const scrollHeight = editor.scrollHeight;
            editor.style.height = `${scrollHeight}px`;
            editor.style.overflowY = scrollHeight > 200 ? 'auto' : 'hidden';
        }
    }, []);

    useEffect(() => {
        adjustEditorHeight();
    }, [value, adjustEditorHeight]);

    useResizeObserver(formRef, adjustEditorHeight);

    // --- Helper Functions ---
    const isSourceReference = (source: RetrievalResult): source is SourceReference => {
        return 'source' in source;
    };

    const getSourceId = (source: RetrievalResult): string => {
        return isSourceReference(source) ? source.source : source.text;
    };

    const getDisplayName = (source: RetrievalResult): string => {
        return isSourceReference(source) ? source.source : source.text.slice(0, 20);
    };

    // Helper to check if a source has other mentions in the editor
    const hasOtherMentions = (sourceId: string, currentChip: HTMLSpanElement): boolean => {
        if (!editorRef.current) return false;
        const allMentions = Array.from(editorRef.current.querySelectorAll('span[data-mention-id]'));
        // Count mentions of this source, excluding the chip we're about to delete
        return allMentions
            .filter(chip => chip !== currentChip)
            .some(chip => chip.getAttribute('data-mention-id') === sourceId);
    };

    // Helper to get all currently mentioned source indices
    const getCurrentSourceIndices = (): number[] => {
        if (!editorRef.current) return [];
        const mentionedIds = new Set(
            Array.from(editorRef.current.querySelectorAll('span[data-mention-id]'))
                .map(chip => chip.getAttribute('data-mention-id'))
                .filter(Boolean) as string[]
        );
        return sources
            .map((source, index) => ({ index, id: getSourceId(source) }))
            .filter(({ id }) => mentionedIds.has(id))
            .map(({ index }) => index);
    };

    const filteredSources = sources.filter((source) =>
        (isSourceReference(source) ? source.source : source.text)
            .toLowerCase()
            .includes(filterValue.toLowerCase())
    );

    // Effect to maintain current sources based on mentions
    useEffect(() => {
        // Get current source IDs from mentions
        const currentSourceIds = new Set(mentions.map(m => getSourceId(m.source)));
        
        // Get indices of sources that are currently mentioned
        const newIndices = sources
            .map((source, index) => ({ index, id: getSourceId(source) }))
            .filter(({ id }) => currentSourceIds.has(id))
            .map(({ index }) => index);

        // Only update if the indices have actually changed
        const hasIndicesChanged = 
            localSourceIndices.length !== newIndices.length ||
            !localSourceIndices.every(idx => newIndices.includes(idx));

        if (hasIndicesChanged) {
            setLocalSourceIndices(newIndices);
            setCurrentSourceIndices(newIndices);
        }
    }, [mentions, sources]); // Only depend on mentions and sources, not the indices themselves

    // --- Event Handlers ---
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
            // Clear the editor and only local states
            if (editorRef.current) {
                editorRef.current.textContent = '';
            }
            setMentions([]);
            setLocalSourceIndices([]);
            adjustEditorHeight();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === '@') {
            e.preventDefault();
            const selection = window.getSelection();
            if (!selection || !selection.anchorNode) return;

            const range = selection.getRangeAt(0);
            const editorRect = editorRef.current?.getBoundingClientRect();
            if (!editorRect) return;

            // Handle empty nodes or start of lines
            let targetNode = selection.anchorNode;
            let targetOffset = selection.anchorOffset;

            // Find the nearest BR and determine if we're at start of line
            const findLineStart = (node: Node): { br: Node | null; isStartOfLine: boolean; brSequence: Node[] } => {
                if (node === editorRef.current) return { br: null, isStartOfLine: false, brSequence: [] };

                const isEmpty = (n: Node): boolean => {
                    return n.nodeType === Node.TEXT_NODE && !n.textContent?.trim() ||
                           n.nodeType === Node.ELEMENT_NODE && !n.textContent?.trim();
                };

                const walkBackwards = (startNode: Node): { br: Node | null; isStartOfLine: boolean; brSequence: Node[] } => {
                    let current = startNode;
                    let foundContent = false;
                    let brSequence: Node[] = [];

                    while (current.previousSibling) {
                        current = current.previousSibling;

                        if (current.nodeName === 'BR') {
                            brSequence.unshift(current);
                            if (!foundContent) {
                                return { br: current, isStartOfLine: true, brSequence };
                            }
                        }
                        else if (!isEmpty(current)) {
                            foundContent = true;
                            continue;
                        }
                        else if (current.nodeName === 'SPAN') {
                            const hasContent = Array.from(current.childNodes).some(child => 
                                child.nodeName !== 'BR' && !isEmpty(child)
                            );
                            if (hasContent) {
                                foundContent = true;
                                continue;
                            }
                        }
                    }

                    if (!foundContent && brSequence.length > 0) {
                        return { br: brSequence[0], isStartOfLine: true, brSequence };
                    }

                    return { br: null, isStartOfLine: false, brSequence };
                };

                let result = walkBackwards(node);
                
                if (!result.br && node.parentNode && node.parentNode !== editorRef.current) {
                    result = walkBackwards(node.parentNode);
                }

                return result;
            };

            const { br: lineStartBR, isStartOfLine, brSequence } = findLineStart(targetNode);

            // Create text node for insertion
            const textNode = document.createTextNode('');

            if (isStartOfLine && lineStartBR) {
                const brIndex = brSequence.indexOf(lineStartBR);
                const nextNode = brSequence[brIndex + 1] || lineStartBR.nextSibling;

                if (nextNode) {
                    lineStartBR.parentNode?.insertBefore(textNode, nextNode);
                } else {
                    lineStartBR.parentNode?.appendChild(textNode);
                }
                targetNode = textNode;
                targetOffset = 0;
            } else if (targetNode === editorRef.current) {
                const childNodes = Array.from(editorRef.current.childNodes);
                if (targetOffset >= childNodes.length) {
                    editorRef.current.appendChild(textNode);
                } else {
                    editorRef.current.insertBefore(textNode, childNodes[targetOffset]);
                }
                targetNode = textNode;
                targetOffset = 0;
            } else if (targetNode.nodeType !== Node.TEXT_NODE || targetNode.textContent === '') {
                targetNode.parentNode?.insertBefore(textNode, targetNode.nextSibling);
                targetNode = textNode;
                targetOffset = 0;
            }

            // Store the cursor position
            setCursorPosition({
                node: targetNode,
                offset: targetOffset
            });

            // Create a temporary span for accurate positioning
            const tempSpan = document.createElement('span');
            tempSpan.textContent = '@';
            tempSpan.style.visibility = 'hidden';
            range.insertNode(tempSpan);
            
            // Get position for the menu
            const tempRect = tempSpan.getBoundingClientRect();

            // Remove the temporary span
            tempSpan.remove();

            // Restore the original selection
            selection.removeAllRanges();
            selection.addRange(range);

            // Position the menu
            setMenuPosition({
                x: tempRect.left - editorRect.left,
                y: tempRect.bottom - editorRect.top
            });

            setIsOpen(true);
            setSelectedIndex(0);
            setFilterValue('');

            setTimeout(() => {
                filterInputRef.current?.focus();
            }, 0);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        } else if ((e.key === 'Backspace' || e.key === 'Delete') && editorRef.current) {
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;

            // Get the current selection range
            const range = selection.getRangeAt(0);
            if (!range) return;

            // Function to find the nearest mention chip
            const findNearestChip = (direction: 'forward' | 'backward'): HTMLSpanElement | null => {
                let node = range.startContainer;
                
                // Handle case where we're directly in the editor div
                if (node === editorRef.current) {
                    const children = Array.from(editorRef.current.childNodes);
                    if (direction === 'backward' && range.startOffset > 0) {
                        const prevNode = children[range.startOffset - 1];
                        if (prevNode instanceof HTMLSpanElement && prevNode.hasAttribute('data-mention-id')) {
                            return prevNode;
                        }
                    } else if (direction === 'forward' && range.startOffset < children.length) {
                        const nextNode = children[range.startOffset];
                        if (nextNode instanceof HTMLSpanElement && nextNode.hasAttribute('data-mention-id')) {
                            return nextNode;
                        }
                    }
                }
                
                // If we're in a text node, start from there
                if (node.nodeType === Node.TEXT_NODE) {
                    // For backspace, only look backward if we're at the start of the text node
                    if (direction === 'backward' && range.startOffset > 0) {
                        return null;
                    }
                    // For delete, only look forward if we're at the end of the text node
                    if (direction === 'forward' && range.startOffset < node.textContent!.length) {
                        return null;
                    }
                }

                // Special handling for empty text nodes
                if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
                    // For backspace, check the previous sibling directly
                    if (direction === 'backward' && node.previousSibling instanceof HTMLSpanElement && node.previousSibling.hasAttribute('data-mention-id')) {
                        return node.previousSibling;
                    }
                    // For delete, check the next sibling directly
                    if (direction === 'forward' && node.nextSibling instanceof HTMLSpanElement && node.nextSibling.hasAttribute('data-mention-id')) {
                        return node.nextSibling;
                    }
                }

                // Walk the DOM tree to find the nearest chip
                while (node && node !== editorRef.current) {
                    const sibling = direction === 'backward' ? 
                        node.previousSibling : 
                        node.nextSibling;

                    if (sibling instanceof HTMLSpanElement && sibling.hasAttribute('data-mention-id')) {
                        return sibling;
                    }

                    if (!sibling) {
                        node = node.parentNode!;
                        continue;
                    }

                    node = sibling;
                }

                return null;
            };

            // Find the chip to delete based on the key pressed
            const chipToDelete = e.key === 'Backspace' ? 
                findNearestChip('backward') : 
                findNearestChip('forward');

            if (!chipToDelete) return;

            // Prevent the default deletion behavior
            e.preventDefault();

            // Get the mention ID
            const mentionId = chipToDelete.getAttribute('data-mention-id');
            if (!mentionId) return;

            // Check if this is the last instance of this mention
            const isLastInstance = Array.from(editorRef.current.querySelectorAll(`span[data-mention-id="${mentionId}"]`)).length === 1;

            // Remove the chip
            chipToDelete.remove();

            // Update mentions state only if this was the last instance
            if (isLastInstance) {
                const updatedMentions = mentions.filter(m => m.id !== mentionId);
                setMentions(updatedMentions);
            }

            // Get all currently mentioned source IDs after deletion
            const remainingMentionIds = new Set(
                Array.from(editorRef.current.querySelectorAll('span[data-mention-id]'))
                    .map(span => span.getAttribute('data-mention-id'))
                    .filter((id): id is string => id !== null)
            );

            // Update source indices based on remaining mentions
            const newSourceIndices = sources
                .map((source, index) => ({ index, id: getSourceId(source) }))
                .filter(({ id }) => remainingMentionIds.has(id))
                .map(({ index }) => index);

            setLocalSourceIndices(newSourceIndices);
            setCurrentSourceIndices(newSourceIndices);

            // Ensure there's a text node for the cursor
            const textNode = document.createTextNode('');
            
            // Special handling for first position
            if (e.key === 'Backspace' && (!chipToDelete.previousSibling || chipToDelete.previousSibling.nodeName === 'BR')) {
                // If we're deleting the first chip, insert text node at the start
                if (editorRef.current.firstChild) {
                    editorRef.current.insertBefore(textNode, editorRef.current.firstChild);
                } else {
                    editorRef.current.appendChild(textNode);
                }
            } else {
                // Normal case - insert before or after based on deletion direction
                const parent = chipToDelete.parentNode || editorRef.current;
                if (e.key === 'Backspace') {
                    parent.insertBefore(textNode, chipToDelete.nextSibling);
                } else {
                    parent.insertBefore(textNode, chipToDelete);
                }
            }

            // Set cursor position
            try {
                const newRange = document.createRange();
                newRange.setStart(textNode, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);

                // Ensure the editor maintains focus
                editorRef.current.focus();
            } catch (error) {
                console.warn('Failed to set cursor position:', error);
            }
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

    // --- Mention Handling ---
    const insertMention = useCallback(
        (source: RetrievalResult) => {
            const editorElement = editorRef.current as HTMLDivElement | null;
            if (!editorElement || !cursorPosition) return;

            // Create the new mention using full source ID
            const sourceId = getSourceId(source);
            const newMention = {
                id: sourceId,
                name: getDisplayName(source),
                source
            };

            // Update mentions state
            setMentions(prev => [...prev, newMention]);

            // Create and style the chip
            const chip = document.createElement('span');
            chip.contentEditable = 'false';
            chip.className = 'inline-flex items-center px-2 py-0.5 mx-1 rounded bg-blue-100 text-blue-800 text-sm select-none align-baseline';
            chip.setAttribute('data-mention-id', sourceId);
            chip.textContent = `@${getDisplayName(source)}`;

            // Get the text node and create the wrapper
            const textNode = cursorPosition.node;

            // Handle text node splitting
            if (textNode.nodeType === Node.TEXT_NODE) {
                const parent = textNode.parentNode;
                if (!parent) return;

                // Helper to check if node is effectively empty
                const isEmpty = (n: Node): boolean => {
                    return n.nodeType === Node.TEXT_NODE && !n.textContent?.trim() ||
                           n.nodeType === Node.ELEMENT_NODE && !n.textContent?.trim();
                };

                // Find line start by walking backwards
                const findLineStart = (node: Node): { br: Node | null; isStartOfLine: boolean } => {
                    let current = node;
                    let foundContent = false;

                    while (current.previousSibling) {
                        current = current.previousSibling;
                        if (current.nodeName === 'BR') {
                            return { br: current, isStartOfLine: !foundContent };
                        }
                        if (!isEmpty(current)) {
                            foundContent = true;
                        }
                        if (current.nodeName === 'SPAN') {
                            const hasContent = Array.from(current.childNodes).some(child => 
                                child.nodeName !== 'BR' && !isEmpty(child)
                            );
                            if (hasContent) foundContent = true;
                        }
                    }
                    return { br: null, isStartOfLine: false };
                };

                const { br: lineStartBR, isStartOfLine } = findLineStart(textNode);

                // Split text and handle empty cases
                const beforeText = textNode.textContent?.slice(0, cursorPosition.offset) || '';
                const afterText = textNode.textContent?.slice(cursorPosition.offset) || '';

                // Update the original text node with content before the chip
                textNode.textContent = beforeText;

                // Determine insertion point and parent
                let insertionParent = parent;
                let insertionPoint = textNode.nextSibling;

                if (isStartOfLine && lineStartBR) {
                    insertionParent = lineStartBR.parentNode || parent;
                    insertionPoint = lineStartBR.nextSibling;
                    if (!beforeText && textNode.previousSibling !== lineStartBR) {
                        textNode.parentNode?.removeChild(textNode);
                    }
                }

                // Insert the chip and spacing
                insertionParent.insertBefore(chip, insertionPoint);
                const spaceNode = document.createTextNode('\u00A0');
                insertionParent.insertBefore(spaceNode, chip.nextSibling);

                if (afterText) {
                    const afterNode = document.createTextNode(afterText);
                    insertionParent.insertBefore(afterNode, spaceNode.nextSibling);
                }

                // Set cursor position after the space
                const selection = window.getSelection();
                if (selection) {
                    const newRange = document.createRange();
                    newRange.setStartAfter(spaceNode);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }

            // Update state
            setIsOpen(false);
            setFilterValue('');
            setCursorPosition(null);

            // Focus back on the editor
            editorElement.focus();

            if (onChange) {
                onChange(editorElement.textContent || '', [...mentions, newMention]);
            }
        },
        [cursorPosition, mentions, onChange, setCurrentSourceIndices]
    );

    // --- Render Component ---
    return (
        <form ref={formRef} onSubmit={handleSubmit} className="w-full flex flex-col">
            <div className="relative">
                <div
                    ref={editorRef}
                    className="w-full resize-none px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[2.5rem] max-h-[200px] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 whitespace-pre-wrap break-words"
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

                {/* Mention Dropdown Menu */}
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
                                            <div className="flex flex-col max-w-full">
                                                <span 
                                                    className="font-medium truncate max-w-full" 
                                                    title={isSourceReference(source) ? source.source : source.text}
                                                >
                                                    {isSourceReference(source) ? source.source : source.text}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {sourceType && (
                                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded whitespace-nowrap">
                                                            {sourceType}
                                                        </span>
                                                    )}
                                                    {relevanceScore !== undefined && (
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
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

            {/* Footer with Status and Submit Button */}
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