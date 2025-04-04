import React, { useContext } from 'react';
import { Citation as CitationType } from '../../types';
import { ThemeContext, removeUndefined } from '../../theme/ThemeContext';
import { addOpacity } from '../../utils/scaleFontSize';

export interface CitationStyles extends React.CSSProperties {
  backgroundColor?: string;
  borderRadius?: string;
  accent?: string;
}

// Type aliases for backward compatibility
type Content = {
  text: string;
  color: string;
};

type Reference = {
  page: number;
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

export type MessageHighlight = Content;
export type SourceHighlight = Reference;

/**
 * Props for the Citation component.
 * @interface CitationProps
 */
export interface CitationProps {
  /** Unique identifier for the citation */
  id: string;
  /** Identifier for the source document */
  sourceId: string;
  /** Optional message identifier */
  messageId?: string;
  /** The content to be displayed */
  content: Content;
  /** Reference information pointing to the source */
  reference: Reference;
  /** Callback function when citation is selected */
  onSelect?: () => void;
  /** Optional style overrides */
  styleOverrides?: CitationStyles;
}

/**
 * Citation component displays content with its corresponding reference information.
 * It provides an interactive way to navigate between content and its source material.
 *
 * @component
 * @example
 * ```tsx
 * <Citation
 *   id="citation-1"
 *   sourceId="source-1"
 *   content={{
 *     text: "Important text",
 *     color: "#2563eb"
 *   }}
 *   reference={{
 *     page: 1,
 *     rect: { top: 0.1, left: 0.1, width: 0.8, height: 0.05 }
 *   }}
 *   onSelect={() => console.log("Navigate to source")}
 * />
 * ```
 */
export const Citation: React.FC<CitationProps> = ({
  id,
  sourceId,
  messageId,
  content: messageHighlight,
  reference: sourceHighlight,
  onSelect: onNavigateToSource,
  styleOverrides = {}
}) => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('ThemeContext is undefined');
  }
  const { colors, componentDefaults } = theme.theme;

  const style: CitationStyles = {
    backgroundColor: colors.background,
    borderRadius: componentDefaults.borderRadius,
    accent: colors.primary,
    ...removeUndefined(styleOverrides)
  };

  return (
    <div 
      onClick={() => onNavigateToSource?.()}
      style={{
        cursor: 'pointer',
        padding: '8px',
        borderRadius: style.borderRadius || '6px',
        backgroundColor: style.backgroundColor || 'white',
        border: '1px solid #e5e7eb',
        position: 'relative',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start'
      }}
      data-citation-id={id}
      data-source-id={sourceId}
      data-message-id={messageId}
    >
      <div
        style={{
          width: '4px',
          alignSelf: 'stretch',
          backgroundColor: messageHighlight.color || style.accent || '#2563eb',
          borderRadius: '2px'
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            padding: '6px 8px',
            backgroundColor: addOpacity(messageHighlight.color || (style.accent || '#2563eb'), 0.1),
            borderRadius: '4px',
            fontSize: '0.875rem',
            marginBottom: '4px'
          }}
        >
          {messageHighlight.text}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Page {sourceHighlight.page}
        </div>
      </div>
    </div>
  );
};

export default Citation; 