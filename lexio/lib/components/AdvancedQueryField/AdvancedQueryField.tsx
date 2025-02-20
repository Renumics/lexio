import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  KeyboardEvent,
  FormEvent,
  CSSProperties
} from 'react';
import {
  useFloating,
  useDismiss,
  useRole,
  useInteractions
} from '@floating-ui/react';
import ReactDOM from 'react-dom';
import useResizeObserver from '@react-hook/resize-observer';

import {
  useRAGSources,
  useLexio,
} from '../../hooks';

import { ThemeContext, removeUndefined } from '../../theme/ThemeContext';
import { ResetWrapper } from '../../utils/ResetWrapper';
import { Source } from '../../types.ts';
import { UUID } from "../../types.ts";

/**
 * Styles interface for the AdvancedQueryField component
 * @see {@link AdvancedQueryField}
 */
export interface AdvancedQueryFieldStyles extends CSSProperties {
  /**
   * Background color of the entire query container
   */
  backgroundColor?: string;
  /**
   * Text color for the entire query container
   */
  color?: string;
  /**
   * Padding for the container
   */
  padding?: string;
  /**
   * Font family for the container text
   */
  fontFamily?: string;
  /**
   *  Font size for the container text
   */
  fontSize?: string;
  /**
   * General border color (used for the editor)
   */
  borderColor?: string;
  /**
   * Border radius for the editor container, mention chips, etc.
   */
  borderRadius?: string;
  /**
   * Background color for inserted mention chips
   */
  mentionChipBackground?: string;
  /**
   * Text color for inserted mention chips
   */
  mentionChipColor?: string;
  /**
   * Background color for the editor field
   */
  inputBackgroundColor?: string;
  /**
   * Border color for the editor field or input boxes
   */
  inputBorderColor?: string;
  /**
   * Background color for the "Send" button
   */
  buttonBackground?: string;
  /**
   * Text color for the "Send" button
   */
  buttonTextColor?: string;
  /**
   * Border radius for the button
   */
  buttonBorderRadius?: string;
  /**
   * Colors for the different workflow modes
   */
  modeInitColor?: string;
  modeFollowUpColor?: string;
  modeReRetrieveColor?: string;
}

/**
 * Interface representing a source mention within the editor
 */
interface Mention {
  /** Unique identifier for the mention */
  id: string;
  /** Display name of the mentioned source */
  name: string;
  /** The full source object being referenced */
  source: Source;
}

/**
 * Interface for tracking cursor position in the contentEditable field
 */
interface CursorPosition {
  /** The DOM node where the cursor is located */
  node: Node;
  /** Offset within the node */
  offset: number;
}

/**
 * Props for the AdvancedQueryField component
 * @see {@link AdvancedQueryField}
 */
interface AdvancedQueryFieldProps {
  /**
   * Unique key for the component which can be used to identify the source of UserAction's if multiple AdvancedQueryField components are used.
   * The default is 'AdvancedQueryField', if key is provided it will be appended to the default key as following 'AdvancedQueryField-${key}'.
   */
  componentKey?: string;
  /**
   * Callback triggered when a message is submitted
   * @param message The message text that was submitted
   * @param mentions Array of source mentions included in the message
   */
  onSubmit?: (message: string, mentions: Mention[]) => void;
  
  /**
   * Called after a source mention is inserted into the editor
   * @param source The source that was added
   * @param allIndices Updated array of all currently referenced source indices
   */
  onSourceAdded?: (source: Source, allIndices: string[]) => void;

  /**
   * Called after a source mention is removed from the editor
   * @param source The source that was removed
   * @param allIndices Updated array of all currently referenced source indices
   */
  onSourceDeleted?: (source: Source, allIndices: string[]) => void;
  
  /**
   * Callback for when the editor content changes
   * @param value The new editor content
   * @param mentions Array of current source mentions
   */
  onChange?: (value: string, mentions: Mention[]) => void;
  
  /**
   * Placeholder text shown when editor is empty
   * @default 'Type @ to mention a source...'
   */
  placeholder?: string;
  
  /**
   * Whether the editor is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Style overrides for the component
   */
  styleOverrides?: AdvancedQueryFieldStyles;
}

/**
 * An advanced query input component with source mention capabilities
 * 
 * Features:
 * - Rich text editing with source mentions
 * - Auto-expanding editor
 * - Source filtering and selection
 * - Visual workflow status indicator
 * - Customizable styling
 * - Responsive design
 *
 * @example
 *
 * ```tsx
 * <AdvancedQueryField
 *   onSubmit={(message, mentions) => {
 *     console.log('Message:', message);
 *     console.log('Mentioned sources:', mentions);
 *   }}
 *   placeholder="Type @ to mention a source..."
 * />
 * ```
 */
const AdvancedQueryField: React.FC<AdvancedQueryFieldProps> = ({
  componentKey,
  onSubmit,
  onSourceAdded,
  onSourceDeleted,
  onChange,
  placeholder = 'Type @ to mention a source...',
  disabled = false,
  styleOverrides = {}
}) => {
  // Theme-based styling
  const theme = React.useContext(ThemeContext);
  if (!theme) {
    throw new Error('ThemeContext is undefined');
  }

  const { colors, typography, componentDefaults } = theme.theme;

  // Merge theme defaults + overrides
  const defaultStyle: AdvancedQueryFieldStyles = {
    backgroundColor: colors.background,
    color: colors.text,
    padding: componentDefaults.padding,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    borderColor: '#e5e7eb',
    borderRadius: componentDefaults.borderRadius,
    mentionChipBackground: '#bee3f8', // Light blue default // todo: check if using contrast makes sense
    mentionChipColor: '#2c5282',      // Darker blue text
    inputBackgroundColor: 'white',
    inputBorderColor: colors.primary,
    buttonBackground: colors.primary,
    buttonTextColor: colors.contrast,
    buttonBorderRadius: componentDefaults.borderRadius,
    modeInitColor: colors.primary,
    modeFollowUpColor: colors.success,
    modeReRetrieveColor: colors.secondary,
  };

  const style: AdvancedQueryFieldStyles = {
    ...defaultStyle,
    ...removeUndefined(styleOverrides),
  };


  // -- Local State --
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const [editorContent, setEditorContent] = useState('');

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);

  // Lexio Hooks
  const { addUserMessage, setActiveSources } = useLexio(componentKey ? `AdvancedQueryField-${componentKey}` : 'AdvancedQueryField');
  const { sources } = useRAGSources();

  // Floating UI
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getFloatingProps } = useInteractions([dismiss, role]);

  // Helpers
  const getSourceId = (source: Source, index?: number) => {
    if (!source) throw new Error('Invalid source: source is undefined');
    const baseId = source.id

    // todo: do we need this?
    return index !== undefined ? `${baseId}#${index}` : baseId;
  };

  const getDisplayName = (source: Source): string => {
    return source.title;
    // todo: maybe enable this again?
    // if (source.sourceName) return source.sourceName;
    // if (isSourceReference(source)) {
    //   const metadataStr = source.metadata
    //     ? Object.entries(source.metadata)
    //         .map(([k, v]) => `${k}: ${v}`)
    //         .join(', ')
    //     : '';
    //   return metadataStr
    //     ? `${source.sourceReference} (${metadataStr})`
    //     : source.sourceReference;
    // }
    // // For text-based results
    // return source.text.slice(0, 20) + '...';
  };

  // Adjust editor height
  const adjustEditorHeight = useCallback(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    editor.style.height = 'auto';
    const scrollHeight = editor.scrollHeight;
    editor.style.height = `${scrollHeight}px`;
    editor.style.overflowY = scrollHeight > 200 ? 'auto' : 'hidden';
  }, []);

  useLayoutEffect(() => {
    adjustEditorHeight();
  }, [adjustEditorHeight, editorContent]);

  useResizeObserver(formRef, adjustEditorHeight);

  // Gather numeric source indices from mention chips
  const getCurrentSourceIndices = (): string[] => {
    if (!editorRef.current) return [];
    const chips = Array.from(editorRef.current.querySelectorAll('span[data-source-index]'));
    return Array.from(new Set(chips
      .map(chip => chip.getAttribute('data-source-index'))
      .filter(Boolean)
      .map(String)
    ));
  };

  const updateIndicesInContext = useCallback(() => {
    const newIndices = getCurrentSourceIndices();
    ReactDOM.flushSync(() => {
      setActiveSources(newIndices as UUID[]);
    });
    return newIndices;
  }, [setActiveSources]);

  // Reset if the sources array changes
  const previousSourcesRef = useRef<Source[] | null>(null);
  useEffect(() => {
    if (previousSourcesRef.current !== sources) {
      if (editorRef.current) editorRef.current.textContent = '';
      setMentions([]);
      setEditorContent('');
      onChange?.('', []);
      adjustEditorHeight();
      previousSourcesRef.current = sources;
    }
  }, [sources, onChange, adjustEditorHeight, setActiveSources]);

  // Filtered sources
  const filteredSources = (sources ?? []).filter(source => {
    if (!source) return false;
    const textVal = source.title;
    // let textVal: string;
    // if (isSourceReference(source)) {
    //   textVal = source.sourceName ?? source.sourceReference ?? '';
    // } else {
    //   textVal = source.sourceName ?? source.text ?? '';
    // }
    return textVal.toLowerCase().includes(filterValue.toLowerCase());
  });

  // ----- Mention Add -----
  const handleAddMention = useCallback(
    (source: Source) => {
      if (!editorRef.current || !cursorPosition) return;
      const sourceIndex = sources.findIndex(
        s => getSourceId(s) === getSourceId(source)
      );
      if (sourceIndex === -1) return;

      const mentionId = getSourceId(source, sourceIndex);
      const mentionName = getDisplayName(source);

      const newMention: Mention = {
        id: mentionId,
        name: mentionName,
        source // todo: potentially omit .data from source
      };

      // Create the chip DOM
      const chip = document.createElement('span');
      chip.contentEditable = 'false';

      // NOTE: applying dynamic styles from the theme:
      chip.className = 'inline-flex items-center px-2 py-0.5 mx-1 select-none align-baseline rounded';
      chip.style.fontSize = style.fontSize || '0.8rem';
      chip.style.backgroundColor = style.mentionChipBackground || '#bee3f8';
      chip.style.color = style.mentionChipColor || '#2c5282';
      // If you also want to unify corner rounding:
      if (style.borderRadius) {
        chip.style.borderRadius = style.borderRadius;
      }

      chip.setAttribute('data-mention-id', mentionId);
      chip.setAttribute('data-source-index', source.id);
      chip.textContent = `@${mentionName}`;

      // Insert into the DOM
      const textNode = cursorPosition.node;
      if (textNode.nodeType === Node.TEXT_NODE) {
        const parent = textNode.parentNode;
        if (!parent) return;

        const beforeText =
          textNode.textContent?.slice(0, cursorPosition.offset) || '';
        const afterText =
          textNode.textContent?.slice(cursorPosition.offset) || '';

        textNode.textContent = beforeText;
        parent.insertBefore(chip, textNode.nextSibling);

        // Insert a space after the chip
        const spaceNode = document.createTextNode('\u00A0');
        parent.insertBefore(spaceNode, chip.nextSibling);

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
        // Edge case if typed '@' in empty editor
        const editorEl = editorRef.current;
        const spaceNode = document.createTextNode('\u00A0');
        editorEl.insertBefore(
          chip,
          editorEl.childNodes[cursorPosition.offset] || null
        );
        editorEl.insertBefore(spaceNode, chip.nextSibling);

        // Move cursor
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
      const newText = editorRef.current.textContent || '';
      setEditorContent(newText);
      onChange?.(newText, [...mentions, newMention]);

      // Close menu, clear filter
      setIsOpen(false);
      setFilterValue('');
      setCursorPosition(null);

      // Focus editor
      editorRef.current.focus();

      // Sync in context
      queueMicrotask(() => {
        const newIndices = updateIndicesInContext();
        onSourceAdded?.(source, newIndices);
      });
    },
    [
      cursorPosition,
      mentions,
      sources,
      style,
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

      const mention = mentions.find(m => m.id === mentionId);
      if (!mention) return;

      const parent = chip.parentNode;
      const nextSibling = chip.nextSibling;

      chip.remove();

      // Place cursor
      let cursorNode: Node | null = null;
      if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
        cursorNode = nextSibling;
      } else {
        cursorNode = document.createTextNode('');
        if (parent) {
          if (nextSibling) {
            parent.insertBefore(cursorNode, nextSibling);
          } else {
            parent.appendChild(cursorNode);
          }
        }
      }

      const sel = window.getSelection();
      if (sel && cursorNode) {
        const range = document.createRange();
        range.setStart(cursorNode, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      // Check if it's the last chip referencing that source index
      const leftoverChips = editorRef.current?.querySelectorAll(
        `span[data-source-index="${sourceIndexStr}"]`
      );
      const isLastInstance = !leftoverChips || leftoverChips.length === 0;

      if (isLastInstance) {
        setMentions(prev => prev.filter(m => m.id !== mentionId));
      }

      // Update local text
      const newText = editorRef.current?.textContent || '';
      setEditorContent(newText);
      onChange?.(
        newText,
        isLastInstance ? mentions.filter(m => m.id !== mentionId) : mentions
      );

      // Sync context
      if (isLastInstance) {
        queueMicrotask(() => {
          const newIndices = updateIndicesInContext();
          onSourceDeleted?.(mention.source, newIndices);
        });
      } else {
        queueMicrotask(() => {
          updateIndicesInContext();
        });
      }
    },
    [
      mentions,
      onSourceDeleted,
      onChange,
      updateIndicesInContext
    ]
  );

  // ----- Form Submission -----
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const editor = editorRef.current;
    if (!editor) return;

    const text = editor.textContent || '';
    if (!text.trim()) return;

    onSubmit?.(text, mentions);
    addUserMessage(text);

    editor.textContent = '';
    setMentions([]);
    setEditorContent('');
    adjustEditorHeight();
  };

  // ----- Input Keydown for mention filter -----
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

  // ----- Editor Keydown (handle '@', mention removal, Enter submit) -----
  const findNearestChip = (range: Range, direction: 'forward' | 'backward') => {
    const node = range.startContainer;

    // If selection is in the top-level editor
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

    // If in a text node
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (direction === 'backward') {
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

    // Otherwise
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
    // Trigger mention with '@'
    if (e.key === '@') {
      e.preventDefault();
      const sel = window.getSelection();
      const range = sel?.getRangeAt(0);
      if (!sel || !range) return;
      const editorRect = editorRef.current?.getBoundingClientRect();
      if (!editorRect) return;

      // Insert hidden '@' to measure
      const tempSpan = document.createElement('span');
      tempSpan.textContent = '@';
      tempSpan.style.visibility = 'hidden';
      range.insertNode(tempSpan);

      // Store cursor pos
      setCursorPosition({
        node: range.startContainer,
        offset: range.startOffset
      });

      const tempRect = tempSpan.getBoundingClientRect();
      tempSpan.remove();

      setMenuPosition({
        x: tempRect.left - editorRect.left,
        y: tempRect.bottom - editorRect.top
      });
      setIsOpen(true);
      setSelectedIndex(0);
      setFilterValue('');

      // Focus the filter input next tick
      setTimeout(() => filterInputRef.current?.focus(), 0);
      return;
    }

    // Submit on Enter (no shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
      return;
    }

    // Remove mention if backspace/delete next to a chip
    if ((e.key === 'Backspace' || e.key === 'Delete') && editorRef.current) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);

      const chip = findNearestChip(range, e.key === 'Backspace' ? 'backward' : 'forward');
      if (chip) {
        e.preventDefault();
        handleRemoveMention(chip as HTMLSpanElement);
      }
    }
  };

  // ----- onInput Handler (updates local editorContent) -----
  const handleEditorInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const newText = e.currentTarget.textContent || '';
      setEditorContent(newText);
      onChange?.(newText, mentions);
      adjustEditorHeight();
    },
    [onChange, mentions, adjustEditorHeight]
  );

  // ----- Render -----
  return (
    <ResetWrapper>
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full flex flex-col"
      style={{
        // Apply themable container styling here
        backgroundColor: style.backgroundColor,
        color: style.color,
        padding: style.padding,
        fontFamily: style.fontFamily,
        borderRadius: style.borderRadius,
      }}
    >
      <div className="relative">
        <div
          ref={editorRef}
          className="
            w-full resize-none px-3 py-2
            border rounded-lg
            focus:ring-1 focus:ring-gray-300 focus:outline-none
            min-h-[2.5rem] max-h-[200px]
            empty:before:content-[attr(data-placeholder)]
            empty:before:text-gray-400
            whitespace-pre-wrap break-words
          "
          contentEditable={!disabled}
          data-placeholder={placeholder}
          suppressContentEditableWarning
          onInput={handleEditorInput}
          onKeyDown={handleEditorKeyDown}
          style={{
            // Dynamic style overrides
            backgroundColor: style.inputBackgroundColor,
            color: style.color,
            borderColor: style.inputBorderColor,
            borderRadius: style.borderRadius,
            fontSize: style.fontSize,
          }}
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
              zIndex: 50,
              backgroundColor: style.inputBackgroundColor,
              borderColor: style.inputBorderColor,
              color: style.color,
            }}
            className="rounded-lg shadow-lg border overflow-hidden"
            {...getFloatingProps()}
          >
            <div className="p-2 border-b" style={{ borderColor: style.inputBorderColor }}>
              <input
                ref={filterInputRef}
                type="text"
                className="
                  w-full px-2 py-1 border rounded
                  focus:outline-none focus:ring-2
                "
                style={{
                  backgroundColor: style.inputBackgroundColor,
                  color: style.color,
                  borderColor: style.inputBorderColor,
                  fontSize: style.fontSize,
                  // The ring color is still from Tailwind. 
                  // For a truly dynamic ring color, you'd use inline focus styles or a custom class.
                }}
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
                  const displayText = source.title

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
                          className="truncate max-w-full"
                          title={displayText}
                          style={{
                            fontSize: `calc(${style.fontSize} * 0.9)`,
                            lineHeight: '1.1'
                          }}
                        >
                          {displayText}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          {source.type && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded whitespace-nowrap"
                                  style={{
                                    fontSize: `calc(${style.fontSize} * 0.8)`
                                  }}
                            >
                              {source.type}
                            </span>
                          )}
                          {source.relevance && (
                            <span className="text-gray-500 whitespace-nowrap"
                                  style={{
                                    fontSize: `calc(${style.fontSize} * 0.8)`
                                  }}
                            >
                              Score: {Math.round(source.relevance * 100)}%
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
          {/*/!* Instead of tailwind classes for color, use inline style from our merged theme *!/*/}
          {/*<div*/}
          {/*  className="h-2.5 w-2.5 rounded-full animate-pulse"*/}
          {/*  style={{ backgroundColor: workflowStatus[workflowMode].color }}*/}
          {/*/>*/}
          {/*<span className="font-medium" style={{*/}
          {/*    fontFamily: style.fontFamily,*/}
          {/*    fontSize: `calc(${style.fontSize} * 0.85)`*/}
          {/*}}>*/}
          {/*  {workflowStatus[workflowMode].label}*/}
          {/*</span>*/}
        </div>
        <button
          type="submit"
          disabled={disabled || !editorContent.trim()}
          className="
            px-4 py-2
            rounded-md
            hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
          "
          style={{
            backgroundColor: style.buttonBackground,
            color: style.buttonTextColor,
            borderRadius: style.buttonBorderRadius,
            fontSize: `calc(${style.fontSize} * 0.95)`
          }}
        >
          Send
        </button>
      </div>
    </form>
    </ResetWrapper>
  );
};

export { AdvancedQueryField }