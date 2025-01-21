// --- Imports ---
import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  KeyboardEvent,
  FormEvent
} from 'react';
import {
  useFloating,
  useDismiss,
  useRole,
  useInteractions
} from '@floating-ui/react';
import {
  useRAGSources,
  useRAGMessages,
  useRAGStatus
} from '../RAGProvider/hooks';
import { RetrievalResult, SourceReference, WorkflowMode } from '../../types';
import useResizeObserver from '@react-hook/resize-observer';
import ReactDOM from 'react-dom';

// --- Types ---
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
  /** Called after a mention is inserted */
  onSourceAdded?: (source: RetrievalResult, allIndices: number[]) => void;
  /** Called after a mention is removed */
  onSourceDeleted?: (source: RetrievalResult, allIndices: number[]) => void;

  value?: string; // text value (if you want external control)
  onChange?: (value: string, mentions: Mention[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Example status coloring
const workflowStatus: Record<WorkflowMode, { label: string; color: string }> = {
  init: { label: 'New Conversation', color: 'bg-blue-500' },
  'follow-up': { label: 'Follow-up', color: 'bg-green-500' },
  reretrieve: { label: 'New Search', color: 'bg-purple-500' }
};

// --- Main Component ---
export const AdvancedQueryField: React.FC<AdvancedQueryFieldProps> = ({
  onSubmit,
  onSourceAdded,
  onSourceDeleted,
  value = '',
  onChange,
  placeholder = 'Type @ to mention a source...',
  disabled = false
}) => {
  // -- Local States --
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);

  // RAG Hooks
  const { sources, setCurrentSourceIndices } = useRAGSources();
  const { addMessage } = useRAGMessages();
  const { workflowMode } = useRAGStatus();

  // Floating UI
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getFloatingProps } = useInteractions([dismiss, role]);

  // ----- Helpers -----
  const isSourceReference = (s: RetrievalResult): s is SourceReference => 'source' in s;

  const getSourceId = (source: RetrievalResult, index?: number) => {
    const baseId = isSourceReference(source) ? source.sourceReference : source.text;
    return index !== undefined ? `${baseId}#${index}` : baseId;
  };

  const getDisplayName = (source: RetrievalResult): string => {
    if (source.sourceName) return source.sourceName;
    if (isSourceReference(source)) {
      const metadataStr = source.metadata
        ? Object.entries(source.metadata)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        : '';
      return metadataStr
        ? `${source.sourceReference} (${metadataStr})`
        : source.sourceReference;
    }
    // For text-based results
    return source.text.slice(0, 20) + '...';
  };

  // ----- Editor Height Management -----
  const adjustEditorHeight = useCallback(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;

    editor.style.height = 'auto';
    const scrollHeight = editor.scrollHeight;
    editor.style.height = `${scrollHeight}px`;
    editor.style.overflowY = scrollHeight > 200 ? 'auto' : 'hidden';
  }, []);

  // Use layout effect so editor is stable after rendering
  useLayoutEffect(() => {
    adjustEditorHeight();
  }, [adjustEditorHeight, value]);

  useResizeObserver(formRef, adjustEditorHeight);

  // ----- Sync Active Source Indices -----
  /** Returns the unique list of numeric source indices in the editor's mention chips. */
  const getCurrentSourceIndices = (): number[] => {
    if (!editorRef.current) return [];
    const chips = Array.from(
      editorRef.current.querySelectorAll('span[data-source-index]')
    );
    return Array.from(
      new Set(
        chips
          .map(chip => chip.getAttribute('data-source-index'))
          .filter(Boolean)
          .map(Number)
      )
    );
  };

  // Helper that sets context with newly discovered indices
  const updateIndicesInContext = useCallback(() => {
    const newIndices = getCurrentSourceIndices();
    ReactDOM.flushSync(() => {
      setCurrentSourceIndices(newIndices);
    });
    return newIndices;
  }, [setCurrentSourceIndices]);

  // ----- Sources-based Reset (Optional) -----
  // If `sources` changes by reference, we reset the editor & global indices.
  const previousSourcesRef = useRef<RetrievalResult[] | null>(null);
  useEffect(() => {
    // If sources changes, reset
    if (previousSourcesRef.current !== sources) {
      if (editorRef.current) editorRef.current.textContent = '';
      setMentions([]);
      onChange?.('', []);
      adjustEditorHeight();
      setCurrentSourceIndices([]); // no active mentions now
      previousSourcesRef.current = sources;
    }
  }, [sources, onChange, adjustEditorHeight, setCurrentSourceIndices]);

  // ----- Source Filtering -----
  const filteredSources = (sources ?? []).filter(source => {
    if (!source) return false;

    let textVal: string;
    if (isSourceReference(source)) {
      // For reference-based sources, prefer sourceName or sourceReference
      textVal = source.sourceName ?? source.sourceReference ?? '';
    } else {
      // For text-based results, prefer sourceName or text
      textVal = source.sourceName ?? source.text ?? '';
    }
    return textVal.toLowerCase().includes(filterValue.toLowerCase());
  });

  // ----- Mention Add -----
  const handleAddMention = useCallback(
    (source: RetrievalResult) => {
      if (!editorRef.current || !cursorPosition) return;

      const sourceIndex = sources.findIndex(
        s => getSourceId(s) === getSourceId(source)
      );
      if (sourceIndex === -1) return;

      const mentionId = getSourceId(source, sourceIndex);
      const mentionName = getDisplayName(source);

      // Build mention
      const newMention: Mention = {
        id: mentionId,
        name: mentionName,
        source
      };

      // Build the chip DOM
      const chip = document.createElement('span');
      chip.contentEditable = 'false';
      chip.className =
        'inline-flex items-center px-2 py-0.5 mx-1 ' +
        'rounded bg-blue-100 text-blue-800 text-sm select-none align-baseline';
      chip.setAttribute('data-mention-id', mentionId);
      chip.setAttribute('data-source-index', sourceIndex.toString());
      chip.textContent = `@${mentionName}`;

      // Insert into the DOM at the stored cursor position
      const textNode = cursorPosition.node;
      if (textNode.nodeType === Node.TEXT_NODE) {
        const parent = textNode.parentNode;
        if (!parent) return;

        const beforeText =
          textNode.textContent?.slice(0, cursorPosition.offset) || '';
        const afterText =
          textNode.textContent?.slice(cursorPosition.offset) || '';

        // Mutate the original text node to keep only the 'before' part
        textNode.textContent = beforeText;

        // Insert the chip
        parent.insertBefore(chip, textNode.nextSibling);
        // Insert a space node after the chip
        const spaceNode = document.createTextNode('\u00A0');
        parent.insertBefore(spaceNode, chip.nextSibling);

        // Reinsert any text after the cursor
        if (afterText) {
          const afterNode = document.createTextNode(afterText);
          parent.insertBefore(afterNode, spaceNode.nextSibling);
        }

        // Move cursor after the space
        const sel = window.getSelection();
        if (sel) {
          const newRange = document.createRange();
          newRange.setStartAfter(spaceNode);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      } else {
        // Edge case if we typed '@' in empty editor
        const editorEl = editorRef.current;
        const spaceNode = document.createTextNode('\u00A0');
        editorEl.insertBefore(
          chip,
          editorEl.childNodes[cursorPosition.offset] || null
        );
        editorEl.insertBefore(spaceNode, chip.nextSibling);

        // Move cursor after the chip
        const sel = window.getSelection();
        if (sel) {
          const newRange = document.createRange();
          newRange.setStartAfter(spaceNode);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      }

      // Update local mention array
      setMentions(prev => [...prev, newMention]);

      // Fire onChange with the new text content & mentions
      const newText = editorRef.current.textContent || '';
      onChange?.(newText, [...mentions, newMention]);

      // Close menu, clear filter, reset cursor
      setIsOpen(false);
      setFilterValue('');
      setCursorPosition(null);

      // Focus editor again
      editorRef.current.focus();

      // Because we added a mention, update the global indices
      queueMicrotask(() => {
        const newIndices = updateIndicesInContext();
        onSourceAdded?.(source, newIndices);
      });
    },
    [
      cursorPosition,
      mentions,
      sources,
      onChange,
      onSourceAdded,
      updateIndicesInContext
    ]
  );

  // ----- Mention Remove -----
  const handleRemoveMention = useCallback(
    (chip: HTMLSpanElement) => {
      const mentionId = chip.getAttribute('data-mention-id');
      const sourceIndexStr = chip.getAttribute('data-source-index');
      if (!mentionId || !sourceIndexStr) return;

      // identify mention
      const mention = mentions.find(m => m.id === mentionId);
      if (!mention) return;

      // parent and nextSibling before removal
      const parent = chip.parentNode;
      const nextSibling = chip.nextSibling;

      // remove the chip from the DOM
      chip.remove();

      // Attempt to put the cursor exactly where the chip used to be
      let cursorNode: Node | null = null;

      if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
        // If next sibling is a text node, place cursor at its start
        cursorNode = nextSibling;
      } else {
        // Otherwise, create an empty text node in that position
        cursorNode = document.createTextNode('');
        if (parent) {
          if (nextSibling) {
            parent.insertBefore(cursorNode, nextSibling);
          } else {
            parent.appendChild(cursorNode);
          }
        }
      }

      // Move cursor to the new or existing text node
      const sel = window.getSelection();
      if (sel && cursorNode) {
        const range = document.createRange();
        range.setStart(cursorNode, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      // Check if it's the last chip referencing that source index
      const leftoverChips = parent?.querySelectorAll(
        `span[data-source-index="${sourceIndexStr}"]`
      );
      const isLastInstance = !leftoverChips || leftoverChips.length === 0;

      if (isLastInstance) {
        // remove from local mention array
        setMentions(prev => prev.filter(m => m.id !== mentionId));
      }

      // If it was the last mention for that source, also call onSourceDeleted
      if (isLastInstance) {
        queueMicrotask(() => {
          const newIndices = updateIndicesInContext();
          onSourceDeleted?.(mention.source, newIndices);
        });
      } else {
        // If it wasn't the last instance, we still need to update global indices
        // in case the user has multiple chips referencing that same source,
        // but we only removed one. The overall set of indices is still the same,
        // so no change is needed. But if you want to be consistent:
        queueMicrotask(() => {
          updateIndicesInContext();
        });
      }
    },
    [mentions, onSourceDeleted, updateIndicesInContext]
  );

  // ----- Form Submission -----
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const editor = editorRef.current;
    if (!editor) return;

    const text = editor.textContent || '';
    if (!text.trim()) return;

    // external callback
    onSubmit?.(text, mentions);

    // push to RAG context
    addMessage({ role: 'user', content: text });

    // reset local states
    editor.textContent = '';
    setMentions([]);
    adjustEditorHeight();

    // IMPORTANT: We do NOT update setCurrentSourceIndices here,
    // because we want to preserve the "active" mention sources
    // from the perspective of the outside context unless
    // the user explicitly removes them or the sources array changes.
  };

  // ----- Input Keydown Handler (for mention filter) -----
  const handleFilterKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredSources.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      handleAddMention(filteredSources[selectedIndex]);
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
      editorRef.current?.focus();
    }
  };

  // ----- Editor Keydown (handles '@' trigger, Enter, mention removal) -----
  const findNearestChip = (range: Range, direction: 'forward' | 'backward') => {
    const node = range.startContainer;

    // If the selection is in the top-level editor
    if (node === editorRef.current) {
      const children = Array.from(editorRef.current.childNodes);
      if (direction === 'backward' && range.startOffset > 0) {
        const prevNode = children[range.startOffset - 1];
        if (
          prevNode instanceof HTMLSpanElement &&
          prevNode.hasAttribute('data-mention-id')
        ) {
          return prevNode;
        }
      } else if (direction === 'forward' && range.startOffset < children.length) {
        const nextNode = children[range.startOffset];
        if (
          nextNode instanceof HTMLSpanElement &&
          nextNode.hasAttribute('data-mention-id')
        ) {
          return nextNode;
        }
      }
      return null;
    }

    // If we're in a text node
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (direction === 'backward') {
        // must be near the start to catch the chip
        if (range.startOffset > 0 && text.slice(0, range.startOffset).trim()) {
          return null;
        }
        if (
          node.previousSibling instanceof HTMLSpanElement &&
          node.previousSibling.hasAttribute('data-mention-id')
        ) {
          return node.previousSibling;
        }
      } else {
        // forward
        if (range.startOffset < text.length && text.slice(range.startOffset).trim()) {
          return null;
        }
        if (
          node.nextSibling instanceof HTMLSpanElement &&
          node.nextSibling.hasAttribute('data-mention-id')
        ) {
          return node.nextSibling;
        }
      }
      return null;
    }

    // If we're in any other node
    const sibling =
      direction === 'backward' ? node.previousSibling : node.nextSibling;
    if (
      sibling instanceof HTMLSpanElement &&
      sibling.hasAttribute('data-mention-id')
    ) {
      return sibling;
    }
    return null;
  };

  const handleEditorKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Trigger the mention dropdown with '@'
    if (e.key === '@') {
      e.preventDefault();
      const sel = window.getSelection();
      const range = sel?.getRangeAt(0);
      if (!sel || !range) return;
      const editorRect = editorRef.current?.getBoundingClientRect();
      if (!editorRect) return;

      // Insert a hidden '@' temporarily so we can measure its position
      const tempSpan = document.createElement('span');
      tempSpan.textContent = '@';
      tempSpan.style.visibility = 'hidden';
      range.insertNode(tempSpan);

      // capture current cursor pos
      setCursorPosition({
        node: range.startContainer,
        offset: range.startOffset
      });

      // measure
      const tempRect = tempSpan.getBoundingClientRect();
      tempSpan.remove();

      setMenuPosition({
        x: tempRect.left - editorRect.left,
        y: tempRect.bottom - editorRect.top
      });

      setIsOpen(true);
      setSelectedIndex(0);
      setFilterValue('');
      setTimeout(() => filterInputRef.current?.focus(), 0);
      return;
    }

    // Submit on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
      return;
    }

    // Backspace/Delete for mention removal
    if ((e.key === 'Backspace' || e.key === 'Delete') && editorRef.current) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);

      const chip = findNearestChip(
        range,
        e.key === 'Backspace' ? 'backward' : 'forward'
      );
      if (chip) {
        e.preventDefault();
        handleRemoveMention(chip as HTMLSpanElement);
      }
    }
  };

  // ----- Render -----
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full flex flex-col">
      <div className="relative">
        <div
          ref={editorRef}
          className="
            w-full resize-none px-3 py-2 border rounded-lg
            focus:ring-1 focus:ring-blue-500 focus:outline-none
            min-h-[2.5rem] max-h-[200px]
            empty:before:content-[attr(data-placeholder)]
            empty:before:text-gray-400
            whitespace-pre-wrap break-words
          "
          contentEditable={!disabled}
          onInput={e => {
            // propagate changes up
            onChange?.(e.currentTarget.textContent || '', mentions);
            adjustEditorHeight();
          }}
          onKeyDown={handleEditorKeyDown}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />

        {/* Mention Dropdown */}
        {isOpen && menuPosition && (
          <div
            ref={refs.setFloating}
            style={{
              position: 'absolute',
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
              width: '256px',
              zIndex: 50
            }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
            {...getFloatingProps()}
          >
            <div className="p-2 border-b">
              <input
                ref={filterInputRef}
                type="text"
                className="
                  w-full px-2 py-1 border rounded
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                placeholder="Filter sources..."
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
                onKeyDown={handleFilterKeyDown}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredSources.length === 0 ? (
                <div className="px-4 py-2 text-gray-500">No matches found</div>
              ) : (
                filteredSources.map((source, idx) => {
                  const displayText = isSourceReference(source)
                    ? source.sourceName || source.sourceReference
                    : source.sourceName || source.text;

                  return (
                    <div
                      key={idx}
                      className={`px-4 py-2 cursor-pointer ${
                        selectedIndex === idx ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleAddMention(source)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className="flex flex-col max-w-full">
                        <span
                          className="font-medium truncate max-w-full"
                          title={displayText}
                        >
                          {displayText}
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
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${workflowStatus[workflowMode].color} animate-pulse`}
          />
          <span className="text-sm font-medium text-gray-600">
            {workflowStatus[workflowMode].label}
          </span>
        </div>
        <button
          type="submit"
          disabled={disabled || !(editorRef.current?.textContent?.trim())}
          className="
            px-4 py-2 bg-blue-500 text-white rounded-md
            hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Send
        </button>
      </div>
    </form>
  );
};
