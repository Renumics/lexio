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
    buttonHoverBackground?: string;
    modeInitColor?: string;
    modeFollowUpColor?: string;
    modeReRetrieveColor?: string;
    statusTextColor?: string;
}

interface QueryFieldProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  styleOverrides?: QueryFieldStyles;
}

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
  const { colors, spacing } = theme.theme;

  // Merge theme defaults + overrides
  const style: QueryFieldStyles = {
    backgroundColor: colors.background,
    color: colors.text,
    padding: spacing.md,
    borderColor: colors.primary,
    borderRadius: '0.375rem',
    inputBackgroundColor: colors.background,
    inputBorderColor: colors.primary,
    inputFocusRingColor: colors.primary,
    buttonBackground: colors.primary,
    buttonTextColor: colors.background,
    buttonHoverBackground: colors.secondary,
    statusTextColor: colors.text,
    modeInitColor: colors.secondary,
    modeFollowUpColor: colors.success,
    modeReRetrieveColor: colors.primary,
    ...removeUndefined(styleOverrides),
  };
  // TODO: apply the style to the component

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
    <form ref={formRef} onSubmit={handleSubmit} className="w-full h-full flex flex-col"> // todo: apply the style?
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="w-full resize-none min-h-[2.5rem] focus:ring-2 transition-colors"
        style={{
          maxHeight: '100%',
          backgroundColor: style.inputBackgroundColor,  // todo: apply the style
          color: style.color,
          padding: style.padding,
          border: `1px solid ${style.inputBorderColor}`,
          borderRadius: style.inputBorderRadius,
          fontFamily: style.fontFamily,
          overflow: shouldShowScrollbar ? 'auto' : 'hidden',
          outline: 'none',
        }}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full animate-pulse`} style={{backgroundColor: workflowStatus[workflowMode].color}}/>
            <span className="text-sm font-medium text-gray-600">
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
            borderRadius: style.borderRadius,
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