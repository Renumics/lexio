import { useState, useRef, KeyboardEvent } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  useFloating,
  useDismiss,
  useRole,
  useInteractions
} from '@floating-ui/react';
import { useMessageFeedback } from '../../hooks/hooks';

// Add props to receive the message ID and content
interface MessageFeedbackProps {
  messageId: string;
  messageContent: string;
  componentKey?: string;
}

const MessageFeedback = ({ messageId, messageContent, componentKey = undefined }: MessageFeedbackProps) => {

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
    <div className="flex gap-1">
      <button
        ref={commentButtonRef}
        {...getReferenceProps()}
        onClick={handleCommentClick}
        className={`p-1.5 rounded-full transition-colors ${
          submitted ? 'bg-blue-100 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-100'
        }`}
        aria-label={submitted ? "Edit comment" : "Add comment"}
      >
        <ChatBubbleLeftIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleFeedback('positive')}
        className={`p-1.5 rounded-full transition-colors ${
          feedback === 'positive' 
            ? 'bg-green-100 text-green-600 hover:bg-green-100' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-100'
        }`}
        aria-label="Thumbs up"
      >
        <HandThumbUpIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleFeedback('negative')}
        className={`p-1.5 rounded-full transition-colors ${
          feedback === 'negative' 
            ? 'bg-red-100 text-red-600 hover:bg-red-100' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-100'
        }`}
        aria-label="Thumbs down"
      >
        <HandThumbDownIcon className="w-4 h-4" />
      </button>
      
      {/* Popover for comment form */}
      {showCommentForm && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 z-50"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">
              {submitted ? "Edit your feedback" : "Add your feedback"}
            </p>
            <button 
              onClick={() => setShowCommentForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 text-sm border rounded-md mb-2"
            rows={3}
            placeholder={submitted ? "Leave empty to remove comment" : "What did you think about this response?"}
          />
          
          <div className="flex justify-end">
            <button
              onClick={handleCommentSubmit}
              className={`text-sm px-3 py-1 rounded-md ${
                submitted || comment.trim() 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
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