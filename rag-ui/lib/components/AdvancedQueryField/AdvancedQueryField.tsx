import React, { useCallback, useRef, useState, KeyboardEvent } from 'react';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useDismiss,
    useRole,
    useInteractions,
    FloatingFocusManager,
    FloatingPortal,
} from '@floating-ui/react';

interface Source {
    id: string;
    name: string;
}

// Example sources - replace with your actual data
const SOURCES: Source[] = [
    { id: '1', name: 'Documentation' },
    { id: '2', name: 'Knowledge Base' },
    { id: '3', name: 'FAQ' },
    { id: '4', name: 'Support Tickets' },
];

interface Mention {
    id: string;
    name: string;
}

interface AdvancedQueryFieldProps {
    value?: string;
    onChange?: (value: string, mentions: Mention[]) => void;
    placeholder?: string;
}

const AdvancedQueryField: React.FC<AdvancedQueryFieldProps> = ({
    value = '',
    onChange,
    placeholder = 'Type @ to mention a source...',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterValue, setFilterValue] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [triggerPosition, setTriggerPosition] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const filterInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);

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

    const filteredSources = SOURCES.filter((source) =>
        source.name.toLowerCase().includes(filterValue.toLowerCase())
    );

    const insertMention = useCallback(
        (source: Source) => {
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
            chip.setAttribute('data-mention-id', source.id);
            chip.textContent = `@${source.name}`;

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
            setMentions(prev => [...prev, { id: source.id, name: source.name }]);
            setIsOpen(false);
            setFilterValue('');
            setTriggerPosition(null);

            // Focus back on the editor
            editorElement.focus();

            if (onChange) {
                onChange(editorElement.textContent || '', [...mentions, { id: source.id, name: source.name }]);
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
        <div className="relative">
            <div
                ref={editorRef}
                className="min-h-[100px] p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                contentEditable
                onInput={handleInput}
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
                    }}
                    className="z-50 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
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
                                    key={source.id}
                                    className={`px-4 py-2 cursor-pointer ${selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        insertMention(source);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    {source.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export { AdvancedQueryField };
