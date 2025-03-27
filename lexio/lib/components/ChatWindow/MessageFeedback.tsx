import React, { useState, useRef, KeyboardEvent, useContext } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  useFloating,
  useDismiss,
  useRole,
  useInteractions
} from '@floating-ui/react';
import { useMessageFeedback } from '../../hooks/hooks';
import { ThemeContext } from '../../theme/ThemeContext';
import { addOpacity, scaleFontSize } from '../../utils/scaleFontSize';

/**
 * Style interface for the MessageFeedback component
 * @typedef {Object} MessageFeedbackStyles
 * @property {string} [primaryColor] - Primary color for active elements and highlights
 * @property {string} [secondaryColor] - Secondary color for less prominent UI elements
 * @property {string} [backgroundColor] - Background color for the component and popover
 * @property {string} [textColor] - Main text color
 * @property {string} [borderColor] - Color for borders
 * @property {string} [successColor] - Color for positive feedback indicators
 * @property {string} [errorColor] - Color for negative feedback indicators
 * @property {string} [fontFamily] - Font family for text elements
 * @property {string} [fontSize] - Base font size
 * @property {string} [borderRadius] - Border radius for rounded corners
 */
interface MessageFeedbackStyles {
  /** Primary color for active elements and highlights */
  primaryColor?: string;
  /** Secondary color for less prominent UI elements */
  secondaryColor?: string;
  /** Background color for the component and popover */
  backgroundColor?: string;
  /** Main text color */
  textColor?: string;
  /** Color for borders */
  borderColor?: string;
  /** Color for positive feedback indicators */
  successColor?: string;
  /** Color for negative feedback indicators */
  errorColor?: string;
  /** Font family for text elements */
  fontFamily?: string;
  /** Base font size */
  fontSize?: string;
  /** Border radius for rounded corners */
  borderRadius?: string;
}

/**
 * Props for the MessageFeedback component
 * @typedef {Object} MessageFeedbackProps
 * @property {string} messageId - Unique identifier for the message being rated
 * @property {string} messageContent - The content of the message being rated
 * @property {string} [componentKey] - Optional key to identify the component instance
 */
interface MessageFeedbackProps {
  /** Unique identifier for the message being rated */
  messageId: string;
  /** The content of the message being rated */
  messageContent: string;
  /** Optional key to identify the component instance */
  componentKey?: string;
}

/**
 * A component that allows users to provide feedback on AI-generated messages.
 * 
 * The MessageFeedback component provides thumbs up/down buttons and a comment
 * feature to collect user sentiment and detailed feedback about AI responses.
 * 
 * @param {MessageFeedbackProps} props - The props for the component
 * @returns {JSX.Element} The rendered feedback component
 */
const MessageFeedback: React.FC<MessageFeedbackProps> = ({ messageId, messageContent, componentKey = undefined }) => {

  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  
  // Use the feedback hook
  const { submitFeedback } = useMessageFeedback(componentKey ? `MessageFeedback-${componentKey}` : 'MessageFeedback');
  
  // Refs
  const commentButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Floating UI for popover
  const { refs, floatingStyles, context } = useFloating({
    open: showCommentForm,
    onOpenChange: setShowCommentForm,
    placement: 'top',
    elements: {
      reference: commentButtonRef.current
    }
  });
  
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getFloatingProps, getReferenceProps } = useInteractions([dismiss, role]);

  // Get theme from context
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('ThemeContext is undefined');
  }
  const { colors, typography, componentDefaults } = theme.theme;

  // Create styles based on theme
  const style: MessageFeedbackStyles = {
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    backgroundColor: colors.background,
    textColor: colors.text,
    borderColor: addOpacity(colors.secondary, 0.2),
    successColor: colors.success, // Green color for positive feedback
    errorColor: colors.error,   // Red color for negative feedback
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    borderRadius: componentDefaults.borderRadius,
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    // Toggle feedback if clicking the same button again
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);
    
    // Submit feedback through the hook
    submitFeedback(messageId, newFeedback, submitted ? comment : undefined, messageContent);
  };

  const handleCommentSubmit = () => {
    // If updating with an empty comment, treat as deletion
    if (submitted && !comment.trim()) {
      setSubmitted(false);
      // Submit feedback without comment
      submitFeedback(messageId, feedback, undefined, messageContent);
    } else {
      // Submit the comment feedback
      submitFeedback(messageId, feedback, comment, messageContent);
      setSubmitted(true);
    }
    
    setShowCommentForm(false);
  };

  const handleCommentClick = () => {
    setShowCommentForm(true);
    // Focus the textarea in the next tick after the popover is rendered
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Set cursor position to the end of the text when editing existing comment
        if (comment) {
          textareaRef.current.selectionStart = comment.length;
          textareaRef.current.selectionEnd = comment.length;
        }
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  return (
    <div className="flex gap-1" style={{ fontFamily: style.fontFamily }}>
      <button
        ref={commentButtonRef}
        {...getReferenceProps()}
        onClick={handleCommentClick}
        className="p-1.5 rounded-full transition-colors"
        style={{
          backgroundColor: submitted ? addOpacity(style.primaryColor || '#4b5563', 0.15) : addOpacity(style.secondaryColor || '#9ca3af', 0.1),
          color: submitted ? style.primaryColor : addOpacity(style.textColor || '#6b7280', 0.7),
          borderRadius: '9999px'
        }}
        aria-label={submitted ? "Edit comment" : "Add comment"}
      >
        <ChatBubbleLeftIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleFeedback('positive')}
        className="p-1.5 rounded-full transition-colors"
        style={{
          backgroundColor: feedback === 'positive'
            ? addOpacity(style.successColor || '#22c55e', 0.15)
            : addOpacity(style.secondaryColor || '#9ca3af', 0.1),
          color: feedback === 'positive'
            ? style.successColor
            : addOpacity(style.textColor || '#6b7280', 0.7),
          borderRadius: '9999px'
        }}
        aria-label="Thumbs up"
      >
        <HandThumbUpIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleFeedback('negative')}
        className="p-1.5 rounded-full transition-colors"
        style={{
          backgroundColor: feedback === 'negative'
            ? addOpacity(style.errorColor || '#ef4444', 0.15)
            : addOpacity(style.secondaryColor || '#9ca3af', 0.1),
          color: feedback === 'negative'
            ? style.errorColor
            : addOpacity(style.textColor || '#6b7280', 0.7),
          borderRadius: '9999px'
        }}
        aria-label="Thumbs down"
      >
        <HandThumbDownIcon className="w-4 h-4" />
      </button>
      
      {/* Popover for comment form */}
      {showCommentForm && (
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            backgroundColor: style.backgroundColor,
            color: style.textColor,
            border: `1px solid ${style.borderColor}`,
            borderRadius: style.borderRadius,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '0.75rem',
            width: '16rem',
            zIndex: 50
          }}
          {...getFloatingProps()}
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium" style={{ color: style.textColor, fontSize: scaleFontSize(style.fontSize || '0.875rem', 1) }}>
              {submitted ? "Edit your feedback" : "Add your feedback"}
            </p>
            <button 
              onClick={() => setShowCommentForm(false)}
              className="text-gray-400 hover:text-gray-600"
              style={{ color: addOpacity(style.textColor || '#6b7280', 0.7) }}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: scaleFontSize(style.fontSize || '0.875rem', 0.9),
              border: `1px solid ${style.borderColor}`,
              borderRadius: style.borderRadius,
              backgroundColor: addOpacity(style.backgroundColor || '#ffffff', 0.8),
              color: style.textColor,
              marginBottom: '0.5rem',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
            }}
            className="focus-ring"
            onFocus={(e) => {
              e.target.style.borderColor = style.primaryColor || '#37a58c';
              e.target.style.boxShadow = `0 0 0 2px ${addOpacity(style.primaryColor || '#37a58c', 0.25)}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = style.borderColor || '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
            rows={3}
            placeholder={submitted ? "Leave empty to remove comment" : "What did you think about this response?"}
          />
          
          <div className="flex justify-end">
            <button
              onClick={handleCommentSubmit}
              style={{
                fontSize: scaleFontSize(style.fontSize || '0.875rem', 0.9),
                padding: '0.25rem 0.75rem',
                borderRadius: style.borderRadius,
                backgroundColor: (submitted || comment.trim())
                  ? style.primaryColor
                  : addOpacity(style.secondaryColor || '#9ca3af', 0.3),
                color: (submitted || comment.trim())
                  ? '#ffffff'
                  : addOpacity(style.textColor || '#6b7280', 0.5),
                cursor: (submitted || comment.trim()) ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out',
              }}
              onMouseOver={(e) => {
                if (submitted || comment.trim()) {
                  e.currentTarget.style.backgroundColor = addOpacity(style.primaryColor || '#37a58c', 0.85);
                }
              }}
              onMouseOut={(e) => {
                if (submitted || comment.trim()) {
                  e.currentTarget.style.backgroundColor = style.primaryColor || '#37a58c';
                }
              }}
              onMouseDown={(e) => {
                if (submitted || comment.trim()) {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }
              }}
              onMouseUp={(e) => {
                if (submitted || comment.trim()) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
              disabled={!submitted && !comment.trim()}
            >
              {submitted ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { MessageFeedback };