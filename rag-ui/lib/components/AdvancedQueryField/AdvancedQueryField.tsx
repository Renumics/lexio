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
import { useFocusScope } from '../../hooks/useFocusScope';

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

// --- Constants ---
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
    // --- State ---
    const [isOpen, setIsOpen] = useState(false);
    const [filterValue, setFilterValue] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [_, setLocalSourceIndices] = useState<number[]>([]);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
    
    // --- Refs ---
    const filterInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // --- Context Hooks ---
    const { sources, setCurrentSourceIndices } = useRAGSources();
    const { addMessage } = useRAGMessages();
    const { workflowMode } = useRAGStatus();

    // --- Focus Scope ---
    const { handleKeyboardEvent, setActive, clearActive } = useFocusScope({
        scopeId: 'advanced-query-field',
        priority: 2,
        stopPropagation: true
    });

    // --- Floating UI Setup ---
    const { refs, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
    });
    const dismiss = useDismiss(context);
    const role = useRole(context);
    const { getFloatingProps } = useInteractions([dismiss, role]);

    // --- Source Management Helpers ---
    const isSourceReference = (source: RetrievalResult): source is SourceReference => {
        return 'source' in source;
    };

    const getSourceId = (source: RetrievalResult, index?: number): string => {
        const baseId = isSourceReference(source) ? source.source : source.text;
        return index !== undefined ? `${baseId}#${index}` : baseId;
    };

    const getDisplayName = (source: RetrievalResult): string => {
        if (isSourceReference(source)) {
            const metadataStr = source.metadata ? 
                ` (${Object.entries(source.metadata)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')})` : 
                '';
            return source.source + metadataStr;
        }
        return source.text.slice(0, 20);
    };

    // --- Source Index Tracking ---
    const hasOtherMentions = (sourceIndex: number, currentChip: HTMLSpanElement): boolean => {
        if (!editorRef.current) return false;
        const allMentions = Array.from(editorRef.current.querySelectorAll('span[data-source-index]'));
        return allMentions
            .filter(chip => chip !== currentChip)
            .some(chip => {
                const index = chip.getAttribute('data-source-index');
                return index !== null && parseInt(index) === sourceIndex;
            });
    };

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

    // --- Source Index Updates ---
    const updateSourceIndices = useCallback(() => {
        const newSourceIndices = getCurrentSourceIndices();
        ReactDOM.flushSync(() => {
            setLocalSourceIndices(newSourceIndices);
            setCurrentSourceIndices(newSourceIndices);
        });
    }, [setCurrentSourceIndices]);

    // --- Editor Height Management ---
    const adjustEditorHeight = useCallback(() => {
        if (editorRef.current && formRef.current) {
            const editor = editorRef.current;
            editor.style.height = 'auto';
            const scrollHeight = editor.scrollHeight;
            editor.style.height = `${scrollHeight}px`;
            editor.style.overflowY = scrollHeight > 200 ? 'auto' : 'hidden';
        }
    }, []);

    // --- Effects ---
    useEffect(() => {
        adjustEditorHeight();
    }, [value, adjustEditorHeight]);

    useResizeObserver(formRef, adjustEditorHeight);

    // Watch for DOM changes to update source indices
    useEffect(() => {
        const observer = new MutationObserver(() => {
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

    // --- Source Filtering ---
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
            onSubmit?.(content, mentions);
            addMessage({ role: 'user', content });
            if (editorRef.current) {
                editorRef.current.textContent = '';
            }
            setMentions([]);
            setLocalSourceIndices([]);
            adjustEditorHeight();
        }
    };

    const handleFilterKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && filteredSources.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            insertMention(filteredSources[selectedIndex]);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev === 0 ? filteredSources.length - 1 : prev - 1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => prev === filteredSources.length - 1 ? 0 : prev + 1);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            editorRef.current?.focus();
        }
    };

    // --- Mention Handling ---
    const insertMention = useCallback((source: RetrievalResult) => {
        const editorElement = editorRef.current as HTMLDivElement | null;
        if (!editorElement || !cursorPosition) return;

        // Find source index
        const sourceIndex = sources.findIndex(s => getSourceId(s) === getSourceId(source));
        if (sourceIndex === -1) return;

        // Create mention
        const newMention = {
            id: getSourceId(source, sourceIndex),
            name: getDisplayName(source),
            source
        };
        setMentions(prev => [...prev, newMention]);

        // Create and insert chip
        const chip = document.createElement('span');
        chip.contentEditable = 'false';
        chip.className = 'inline-flex items-center px-2 py-0.5 mx-1 rounded bg-blue-100 text-blue-800 text-sm select-none align-baseline';
        chip.setAttribute('data-mention-id', getSourceId(source, sourceIndex));
        chip.setAttribute('data-source-index', sourceIndex.toString());
        chip.textContent = `@${getDisplayName(source)}`;

        // Insert chip at cursor position
        const textNode = cursorPosition.node;
        if (textNode.nodeType === Node.TEXT_NODE) {
            const parent = textNode.parentNode;
            if (!parent) return;

            const beforeText = textNode.textContent?.slice(0, cursorPosition.offset) || '';
            const afterText = textNode.textContent?.slice(cursorPosition.offset) || '';
            textNode.textContent = beforeText;

            parent.insertBefore(chip, textNode.nextSibling);
            const spaceNode = document.createTextNode('\u00A0');
            parent.insertBefore(spaceNode, chip.nextSibling);

            if (afterText) {
                const afterNode = document.createTextNode(afterText);
                parent.insertBefore(afterNode, spaceNode.nextSibling);
            }

            // Set cursor after the chip
            const selection = window.getSelection();
            if (selection) {
                const newRange = document.createRange();
                newRange.setStartAfter(spaceNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        } else if (textNode === editorRef.current) {
            // Handle case where we're directly in the editor div
            const spaceNode = document.createTextNode('\u00A0');
            editorRef.current.insertBefore(chip, editorRef.current.childNodes[cursorPosition.offset] || null);
            editorRef.current.insertBefore(spaceNode, chip.nextSibling);

            // Set cursor after the chip
            const selection = window.getSelection();
            if (selection) {
                const newRange = document.createRange();
                newRange.setStartAfter(spaceNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }

        // Update UI state
        setIsOpen(false);
        setFilterValue('');
        setCursorPosition(null);
        editorElement.focus();
        onChange?.(editorElement.textContent || '', [...mentions, newMention]);

        // Update source indices
        queueMicrotask(() => {
            updateSourceIndices();
        });
    }, [cursorPosition, mentions, sources, updateSourceIndices, onChange]);

    // --- Deletion Handling ---
    const findNearestChip = (range: Range, direction: 'forward' | 'backward'): HTMLSpanElement | null => {
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
                if (range.startOffset > 0 && text.slice(0, range.startOffset).trim()) {
                    return null;
                }
                if (node.previousSibling instanceof HTMLSpanElement && 
                    node.previousSibling.hasAttribute('data-mention-id')) {
                    return node.previousSibling;
                }
            } else {
                if (range.startOffset < text.length && text.slice(range.startOffset).trim()) {
                    return null;
                }
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


    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!handleKeyboardEvent(e)) return;
        
        if (e.key === '@') {
            e.preventDefault();
            const selection = window.getSelection();
            const range = selection?.getRangeAt?.(0);
            if (!selection || !range) return;

            const editorRect = editorRef.current?.getBoundingClientRect();
            if (!editorRect) return;

            // Create a temporary span for positioning
            const tempSpan = document.createElement('span');
            tempSpan.textContent = '@';
            tempSpan.style.visibility = 'hidden';
            range.insertNode(tempSpan);
            
            // Store cursor position
            setCursorPosition({
                node: range.startContainer,
                offset: range.startOffset
            });

            // Position the menu
            const tempRect = tempSpan.getBoundingClientRect();
            tempSpan.remove();

            setMenuPosition({
                x: tempRect.left - editorRect.left,
                y: tempRect.bottom - editorRect.top
            });

            // Update UI state
            setIsOpen(true);
            setSelectedIndex(0);
            setFilterValue('');
            setTimeout(() => filterInputRef.current?.focus(), 0);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        } else if ((e.key === 'Backspace' || e.key === 'Delete') && editorRef.current) {
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const chipToDelete = findNearestChip(range, e.key === 'Backspace' ? 'backward' : 'forward');
            if (!chipToDelete) return;

            e.preventDefault();

            // Get chip information before removal
            const sourceIndexStr = chipToDelete.getAttribute('data-source-index');
            if (!sourceIndexStr) return;
            const sourceIndex = parseInt(sourceIndexStr);
            const isFirstPosition = !chipToDelete.previousSibling || chipToDelete.previousSibling.nodeName === 'BR';
            const parent = chipToDelete.parentNode || editorRef.current;
            const nextSibling = chipToDelete.nextSibling;

            // Check if this is the last instance of this source
            const isLastInstance = !hasOtherMentions(sourceIndex, chipToDelete);

            // Remove the chip
            chipToDelete.remove();

            // Update mentions state if last instance
            if (isLastInstance) {
                const mentionId = chipToDelete.getAttribute('data-mention-id');
                if (mentionId) {
                    setMentions(prev => prev.filter(m => m.id !== mentionId));
                }
            }

            // Insert new text node for cursor
            const textNode = document.createTextNode('');
            if (e.key === 'Backspace' && isFirstPosition) {
                if (editorRef.current.firstChild) {
                    editorRef.current.insertBefore(textNode, editorRef.current.firstChild);
                } else {
                    editorRef.current.appendChild(textNode);
                }
            } else {
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
                editorRef.current.focus();
            } catch (error) {
                console.warn('Failed to set cursor position:', error);
            }
        }
    };

    // Add this effect to reset the field when sources change
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.textContent = '';
            setMentions([]);
            setLocalSourceIndices([]);
            adjustEditorHeight();
            onChange?.('', []);
        }
    }, [sources, adjustEditorHeight, onChange]);

    // --- Render ---
    return (
        <form 
            ref={formRef} 
            onSubmit={handleSubmit} 
            className="w-full flex flex-col"
            onMouseEnter={setActive}
            onMouseLeave={clearActive}
        >
            <div className="relative">
                <div
                    ref={editorRef}
                    className="w-full resize-none px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[2.5rem] max-h-[200px] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 whitespace-pre-wrap break-words"
                    contentEditable={!disabled}
                    onInput={(e) => {
                        onChange?.(e.currentTarget.textContent || '', mentions);
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
                                filteredSources.map((source, index) => (
                                    <div
                                        key={index}
                                        className={`px-4 py-2 cursor-pointer ${selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                        onClick={() => insertMention(source)}
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
                                                {isSourceReference(source) && source.type && (
                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded whitespace-nowrap">
                                                        {source.type}
                                                    </span>
                                                )}
                                                {source.relevanceScore !== undefined && (
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        Score: {Math.round(source.relevanceScore * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
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