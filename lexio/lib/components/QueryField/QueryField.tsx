import React, { useState, useRef, useEffect, useContext } from 'react';
import useResizeObserver from '@react-hook/resize-observer';
import type { WorkflowMode } from '../../types';
import { useRAGMessages, useRAGStatus } from '../RAGProvider/hooks';
import { ThemeContext, removeUndefined } from '../../theme/ThemeContext';
import { withStyleReset } from '../../utils/withStyleReset';

/**
 * Styles interface for the QueryField component
 * @see {@link QueryField}
 */
export interface QueryFieldStyles extends React.CSSProperties {
  backgroundColor?: string;
  color?: string;
  padding?: string;
  fontFamily?: string;
  fontSize?: string;
  borderColor?: string;
  borderRadius?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputBorderRadius?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;
  modeInitColor?: string;
  modeFollowUpColor?: string;
  modeReRetrieveColor?: string;
  statusTextColor?: string;
}

/**
 * Props for the QueryField component
 */
interface QueryFieldProps {
  /**
   * Callback function triggered when a message is submitted
   * @param message The message text that was submitted
   */
  onSubmit: (message: string) => void;
  
  /**
   * Custom placeholder text for the input field
   * @default "Type a message..."
   */
  placeholder?: string;
  
  /**
   * Whether the input field is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Style overrides for the component
   */
  styleOverrides?: QueryFieldStyles;
}

/**
 * A textarea-based input component for submitting queries with workflow status indication
 * 
 * Features:
 * - Auto-expanding textarea
 * - Enter to submit (Shift+Enter for new line)
 * - Visual workflow status indicator
 * - Customizable styling
 * - Responsive design
 */
const QueryFieldBase: React.FC<QueryFieldProps> = ({
  onSubmit,
  placeholder = 'Type a message...',
  disabled = false,
  styleOverrides = {},
}) => {
  // Access theme from context
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('ThemeContext is undefined');
  }
  const { colors, typography, componentDefaults } = theme.theme;

  // Minimal defaults, similar to AdvancedQueryField
  const defaultStyle: QueryFieldStyles = {
    backgroundColor: colors.background,
    color: colors.text,
    padding: componentDefaults.padding,
    fontFamily: 'inherit',
    fontSize: typography.fontSizeBase,  // todo
    borderColor: '#e5e7eb',
    borderRadius: componentDefaults.borderRadius,
    inputBackgroundColor: 'white',
    inputBorderColor: colors.primary,
    inputBorderRadius: componentDefaults.borderRadius,
    buttonBackground: colors.primary,
    buttonTextColor: colors.contrast,
    buttonBorderRadius: componentDefaults.borderRadius,
    modeInitColor: colors.primary,
    modeFollowUpColor: colors.success,
    modeReRetrieveColor: colors.secondary,
    statusTextColor: colors.secondaryText,
  };

  // Merge default + user overrides
  const style: QueryFieldStyles = {
    ...defaultStyle,
    ...removeUndefined(styleOverrides),
  };

  // Workflow mode + messages
  const { workflowMode } = useRAGStatus();
  const { addMessage } = useRAGMessages();

  // Local state
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Workflow status with fallback colors if none provided
  const workflowStatus: Record<WorkflowMode, { label: string; color: string }> = {
    init: {
      label: 'New Conversation',
      color: style.modeInitColor ?? '#3b82f6',
    },
    'follow-up': {
      label: 'Follow-up',
      color: style.modeFollowUpColor ?? '#22c55e',
    },
    reretrieve: {
      label: 'New Search',
      color: style.modeReRetrieveColor ?? '#9333ea',
    },
  };

  // Auto-expand logic
  const adjustTextareaHeight = () => {
    if (textareaRef.current && formRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = formRef.current.clientHeight - 50; // some headroom for button area
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight
      )}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  useResizeObserver(formRef, adjustTextareaHeight);

  // Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Push to context
      addMessage({ role: 'user', content: message });
      // External callback
      onSubmit(message);
      // Reset
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without shift => submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Decide whether to show scrollbar
  const shouldShowScrollbar =
    formRef.current &&
    textareaRef.current &&
    textareaRef.current.scrollHeight > formRef.current.clientHeight - 50;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full h-full flex flex-col"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        padding: style.padding,
        fontFamily: style.fontFamily,
        borderRadius: style.borderRadius,
        fontSize: style.fontSize,
      }}
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        // Keep some tailwind classes for layout, plus inline theming
        className={`w-full resize-none min-h-[2.5rem] max-h-full transition-colors 
          focus:ring-1 focus:ring-gray-300 focus:outline-none
          ${shouldShowScrollbar ? 'overflow-y-auto' : 'overflow-y-hidden'}
        `}
        style={{
          backgroundColor: style.inputBackgroundColor,
          color: style.color,
          border: `1px solid ${style.inputBorderColor}`,
          borderRadius: style.inputBorderRadius,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          padding: '0.5rem 0.75rem',
          outline: 'none',
        }}
      />
      {/* Footer with workflow status + send button */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full animate-pulse"
            style={{
              backgroundColor: workflowStatus[workflowMode].color,
            }}
          />
          <span
            className="font-medium"
            style={{
              color: style.statusTextColor,
              fontFamily: style.fontFamily,
              fontSize: `calc(${style.fontSize} * 0.85)`
            }}
          >
            {workflowStatus[workflowMode].label}
          </span>
        </div>
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="px-4 py-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: style.buttonBackground,
            color: style.buttonTextColor,
            borderRadius: style.buttonBorderRadius,
            fontFamily: style.fontFamily,
            fontSize: `calc(${style.fontSize} * 0.95)`
          }}
        >
          Send
        </button>
      </div>
    </form>
  );
};

export const QueryField = withStyleReset(QueryFieldBase);
