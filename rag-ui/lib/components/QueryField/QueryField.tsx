import React, { useState, useRef, useEffect, useContext } from 'react';
import useResizeObserver from '@react-hook/resize-observer';
import type { WorkflowMode } from '../../types';
import { useRAGMessages, useRAGStatus } from '../RAGProvider/hooks';
import { ThemeContext, removeUndefined } from '../../theme/ThemeContext';


export interface QueryFieldStyles extends React.CSSProperties {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string
    borderColor?: string;
    borderRadius?: string;
    inputBackgroundColor?: string;
    inputBorderColor?: string;
    inputFocusRingColor?: string;
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
 * @see {@link QueryField}
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
const QueryField: React.FC<QueryFieldProps> = ({
  onSubmit,
  placeholder = 'Type a message...',
  disabled = false,
  styleOverrides = {},
}) => {
  const { addMessage } = useRAGMessages();
  const { workflowMode } = useRAGStatus();
  
  // use theme
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('ThemeContext is undefined');
  }
  const { colors, spacing, borderRadius } = theme.theme;

  // Merge theme defaults + overrides
  const style: QueryFieldStyles = {
    backgroundColor: colors.background,
    color: colors.text,
    padding: spacing.md,
    borderColor: '#e5e7eb',
    borderRadius: borderRadius.md,
    inputBackgroundColor: 'white',
    inputBorderColor: '#e5e7eb',
    inputFocusRingColor: colors.primary || '#3b82f6',
    inputBorderRadius: borderRadius.md || '0.5rem',
    buttonBackground: colors.primary || '#3b82f6',
    buttonTextColor: colors.lightText || 'white',
    buttonBorderRadius: borderRadius.md || '0.375rem',
    modeInitColor: colors.primary || '#3b82f6',
    modeFollowUpColor: colors.success || '#22c55e',
    modeReRetrieveColor: colors.secondary || '#9333ea',
    statusTextColor: colors.secondaryText || '#4b5563',
    ...removeUndefined(styleOverrides),
  };

    // --- Constants ---
    const workflowStatus: Record<WorkflowMode, { label: string; color: string | undefined }> = {
    'init': { label: 'New Conversation', color: style.modeInitColor },
    'follow-up': { label: 'Follow-up', color: style.modeFollowUpColor },
    'reretrieve': { label: 'New Search', color: style.modeReRetrieveColor },
    };
  
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current && formRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      const maxHeight = formRef.current.clientHeight - 50; // Adjust 50px for button and padding
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`; // Set to scrollHeight or maxHeight
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Use the custom hook to adjust height on resize
  useResizeObserver(formRef, adjustTextareaHeight);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      addMessage({
        role: 'user',
        content: message
      });
      onSubmit(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const shouldShowScrollbar = formRef.current && textareaRef.current && textareaRef.current.scrollHeight > formRef.current.clientHeight - 50;

  return (
    <form 
      ref={formRef} 
      onSubmit={handleSubmit} 
      className="w-full h-full flex flex-col"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        padding: style.padding,
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
        className={`w-full resize-none min-h-[2.5rem] transition-colors focus:ring-2 ${
          shouldShowScrollbar ? 'overflow-y-auto' : 'overflow-y-hidden'
        }`}
        style={{
          maxHeight: '100%',
          backgroundColor: style.inputBackgroundColor,
          color: style.color,
          padding: '0.5rem 0.75rem',
          border: `1px solid ${style.inputBorderColor}`,
          borderRadius: style.inputBorderRadius,
          fontFamily: style.fontFamily,
          outline: 'none',
        }}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div 
            className="h-2.5 w-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: workflowStatus[workflowMode].color }}
          />
          <span 
            className="text-sm font-medium"
            style={{ color: style.statusTextColor }}
          >
            {workflowStatus[workflowMode].label}
          </span>
        </div>
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="transition-colors hover:opacity-80"
          style={{
            backgroundColor: style.buttonBackground,
            color: style.buttonTextColor,
            borderRadius: style.buttonBorderRadius,
            padding: '0.5rem 1rem',
            cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
            opacity: disabled || !message.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>
    </form>
  );
};

export { QueryField };