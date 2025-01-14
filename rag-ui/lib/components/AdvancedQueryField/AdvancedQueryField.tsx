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
import ReactDOM from 'react-dom';

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
    const [_, setLocalSourceIndices] = useState<number[]>([]);
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

    const getSourceId = (source: RetrievalResult, index?: number): string => {
        const baseId = isSourceReference(source) ? source.source : source.text;
        // If index is provided, make the ID unique by including it
        return index !== undefined ? `${baseId}#${index}` : baseId;
    };

    const getDisplayName = (source: RetrievalResult): string => {
        if (isSourceReference(source)) {
            // Include metadata in display name if available
            const metadataStr = source.metadata ? 
                ` (${Object.entries(source.metadata)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')})` : 
                '';
            return source.source + metadataStr;
        }
        return source.text.slice(0, 20);
    };

    // Helper to check if a source index has other mentions in the editor
    const hasOtherMentions = (sourceIndex: number, currentChip: HTMLSpanElement): boolean => {
        if (!editorRef.current) return false;
        const allMentions = Array.from(editorRef.current.querySelectorAll('span[data-source-index]'));
        // Count mentions of this source index, excluding the chip we're about to delete
        return allMentions
            .filter(chip => chip !== currentChip)
            .some(chip => {
                const index = chip.getAttribute('data-source-index');
                return index !== null && parseInt(index) === sourceIndex;
            });
    };

    // Helper to get all currently mentioned source indices
    const getCurrentSourceIndices = (): number[] => {
        if (!editorRef.current) return [];
        const indices = new Set(
            Array.from(editorRef.current.querySelectorAll('span[data-source-index]'))
                .map(chip => chip.getAttribute('data-source-index'))
                .filter((index): index is string => index !== null)
                .map(index => parseInt(index))
        );
        return Array.from(indices);
    };

    // Helper to update source indices
    const updateSourceIndices = useCallback(() => {
        const newSourceIndices = getCurrentSourceIndices();
        // Use flushSync to ensure immediate update
        ReactDOM.flushSync(() => {
            setLocalSourceIndices(newSourceIndices);
            setCurrentSourceIndices(newSourceIndices);
        });
    }, [setCurrentSourceIndices]);

    // Effect to update indices whenever editor content changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            // Ensure the callback runs in the next microtask to allow DOM to settle
            queueMicrotask(() => {
                updateSourceIndices();
            });
        });

        if (editorRef.current) {
            observer.observe(editorRef.current, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        return () => observer.disconnect();
    }, [updateSourceIndices]);

    const filteredSources = sources.filter((source) =>
        (isSourceReference(source) ? source.source : source.text)
            .toLowerCase()
            .includes(filterValue.toLowerCase())
    );

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
                    return null;
                }
                
                // If we're in a text node, check if we're at the boundary
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent || '';
                    if (direction === 'backward') {
                        // Only look backward if we're at the start of the text node
                        if (range.startOffset > 0) {
                            // If there's text before the cursor, don't delete anything
                            if (text.slice(0, range.startOffset).trim()) {
                                return null;
                            }
                        }
                        // Check previous sibling if it's a mention chip
                        if (node.previousSibling instanceof HTMLSpanElement && 
                            node.previousSibling.hasAttribute('data-mention-id')) {
                            return node.previousSibling;
                        }
                    } else { // forward
                        // Only look forward if we're at the end of the text node
                        if (range.startOffset < text.length) {
                            // If there's text after the cursor, don't delete anything
                            if (text.slice(range.startOffset).trim()) {
                                return null;
                            }
                        }
                        // Check next sibling if it's a mention chip
                        if (node.nextSibling instanceof HTMLSpanElement && 
                            node.nextSibling.hasAttribute('data-mention-id')) {
                            return node.nextSibling;
                        }
                    }
                    return null;
                }

                // If we're in any other type of node, only check immediate siblings
                const sibling = direction === 'backward' ? node.previousSibling : node.nextSibling;
                if (sibling instanceof HTMLSpanElement && sibling.hasAttribute('data-mention-id')) {
                    return sibling;
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

            // Get the source index
            const sourceIndexStr = chipToDelete.getAttribute('data-source-index');
            if (!sourceIndexStr) return;
            const sourceIndex = parseInt(sourceIndexStr);

            // Store the position context before removal
            const isFirstPosition = !chipToDelete.previousSibling || chipToDelete.previousSibling.nodeName === 'BR';
            const parent = chipToDelete.parentNode || editorRef.current;
            const nextSibling = chipToDelete.nextSibling;

            // Check if this is the last instance of this source index
            const isLastInstance = !hasOtherMentions(sourceIndex, chipToDelete);

            // Remove the chip
            chipToDelete.remove();

            // Update mentions state only if this is the last instance
            if (isLastInstance) {
                const mentionId = chipToDelete.getAttribute('data-mention-id');
                if (mentionId) {
                    const updatedMentions = mentions.filter(m => m.id !== mentionId);
                    setMentions(updatedMentions);
                }
            }

            // Note: We don't need to call updateSourceIndices here
            // as it will be triggered by the MutationObserver

            // Ensure there's a text node for the cursor
            const textNode = document.createTextNode('');
            
            // Special handling for first position
            if (e.key === 'Backspace' && isFirstPosition) {
                // If we're deleting the first chip, insert text node at the start
                if (editorRef.current.firstChild) {
                    editorRef.current.insertBefore(textNode, editorRef.current.firstChild);
                } else {
                    editorRef.current.appendChild(textNode);
                }
            } else {
                // Normal case - insert before or after based on deletion direction
                if (e.key === 'Backspace') {
                    parent.insertBefore(textNode, nextSibling);
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

            // Find source index
            const sourceIndex = sources.findIndex(s => getSourceId(s) === getSourceId(source));
            if (sourceIndex === -1) return;

            // Create the new mention using index-based unique ID
            const newMention = {
                id: getSourceId(source, sourceIndex),
                name: getDisplayName(source),
                source
            };

            // Update mentions state
            setMentions(prev => [...prev, newMention]);

            // Create and style the chip
            const chip = document.createElement('span');
            chip.contentEditable = 'false';
            chip.className = 'inline-flex items-center px-2 py-0.5 mx-1 rounded bg-blue-100 text-blue-800 text-sm select-none align-baseline';
            chip.setAttribute('data-mention-id', getSourceId(source, sourceIndex));
            chip.setAttribute('data-source-index', sourceIndex.toString());
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

            // Update source indices immediately after DOM manipulation
            queueMicrotask(() => {
                updateSourceIndices();
            });
        },
        [cursorPosition, mentions, sources, updateSourceIndices]
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