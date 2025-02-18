import React, {useContext, useEffect, useRef, useState} from 'react';
import useResizeObserver from '@react-hook/resize-observer';
import type {WorkflowMode} from '../../types';
import {useRAGMessages, useRAGStatus} from '../RAGProvider/hooks';
import {removeUndefined, ThemeContext} from '../../theme/ThemeContext';
import {ResetWrapper} from '../../utils/ResetWrapper';
import { ArrowUpRight, AlignJustify, File } from "lucide-react";

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

  /**
   * Callback to hide/show retrieved sources
   */
  toggleRetrievedSourcesComponent?: (() => void) | undefined,

  /**
   * Callback to hide/show the file viewer
   */
  toggleFileViewerComponent?: (() => void) | undefined,
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
  toggleRetrievedSourcesComponent,
  toggleFileViewerComponent,
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
    // padding: componentDefaults.padding,
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
    <ResetWrapper>
      <div className={"flex gap-2 items-start content-start"}>
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="w-full flex flex-col py-2"
            style={{
              backgroundColor: style.backgroundColor,
              color: style.color,
              padding: style.padding,
              fontFamily: style.fontFamily,
              borderRadius: style.borderRadius,
              fontSize: style.fontSize,
            }}
        >
          <div
              className={`grid grid-cols-[1fr_max-content] gap-0.5 border border-solid border-gray-300 rounded-[2rem] focus:ring-1 focus:ring-gray-300 focus:outline-none p-1.5`}
              style={{
                boxShadow: "0 0 1px gray"
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
            className={`w-full resize-none min-h-[2.5rem] transition-colors rounded-4xl ${shouldShowScrollbar ? 'overflow-y-auto' : 'overflow-y-hidden'}
          appearance-none block w-full bg-gray-200 text-gray-700 border-none border-0 rounded p-3 ml-1 leading-tight tracking-tight focus:outline-none
        `}
            style={{
              backgroundColor: style.inputBackgroundColor,
              color: style.color,
              // border: `1px solid ${style.inputBorderColor}`,
              borderRadius: style.inputBorderRadius,
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              // padding: '0.5rem 0.75rem',
              outline: 'none',
            }}
        />
            <div
                className={`justify-self-end self-end rounded-[50%] ${message && message.length > 0 ? "bg-gray-700" : "bg-gray-200"}`}>
              <button
                  type="submit"
                  disabled={disabled || !message.trim()}
                  className="p-3 rounded-[50%] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    // backgroundColor: style.buttonBackground,
                    // color: style.buttonTextColor,
                    borderRadius: style.buttonBorderRadius,
                    fontFamily: style.fontFamily,
                    fontSize: `calc(${style.fontSize} * 0.95)`
                  }}
              >
                <ArrowUpRight
                    size={"20px"}
                    className={`${message && message.length > 0 ? "text-white" : "text-gray-600"}`}
                    style={{transform: "rotateZ(-45deg)"}}
                />
              </button>
            </div>
          </div>
          {/* Footer with workflow status + send button */}
          <div className="flex items-center justify-between mt-2 pl-2">
            <div className="flex items-center gap-2">
              <div
                  className="h-2.5 w-2.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: workflowStatus[workflowMode].color,
                  }}
              />
              <span
                  className="font-medium tracking-tight"
                  style={{
                    color: style.statusTextColor,
                    fontFamily: style.fontFamily,
                    fontSize: `calc(${style.fontSize} * 0.85)`
                  }}
              >
                {workflowStatus[workflowMode].label}
              </span>
            </div>
          </div>
        </form>

        <div className={"flex gap-2"}>
          <div
              className={`mt-3 rounded-[50%] bg-gray-200 hover:cursor-pointer`}
              onClick={toggleRetrievedSourcesComponent}
          >
            <div className="p-3 rounded-[50%]">
              <AlignJustify size={"20px"} className={"text-gray-500"} />
            </div>
          </div>

          <div
              className={`mt-3 rounded-[50%] bg-gray-200 hover:cursor-pointer`}
              onClick={toggleFileViewerComponent}
          >
            <div className="p-3 rounded-[50%] text-white">
              <File size={"20px"} className={"text-gray-500"} />
            </div>
          </div>
        </div>

      </div>
    </ResetWrapper>
  );
};

export {QueryField}