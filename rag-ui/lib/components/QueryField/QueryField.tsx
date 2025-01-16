import React, { useState, useRef, useEffect } from 'react';
import useResizeObserver from '@react-hook/resize-observer';
import type { WorkflowMode } from '../../types';
import { useRAGMessages, useRAGStatus } from '../RAGProvider/hooks';
import { useFocusScope } from '../../hooks/useFocusScope';

// Add status configuration
const workflowStatus: Record<WorkflowMode, { label: string; color: string }> = {
  'init': { label: 'New Conversation', color: 'bg-blue-500' },
  'follow-up': { label: 'Follow-up', color: 'bg-green-500' },
  'reretrieve': { label: 'New Search', color: 'bg-purple-500' }
};

interface QueryFieldProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const QueryField: React.FC<QueryFieldProps> = ({
  onSubmit,
  placeholder = 'Type a message...',
  disabled = false,
}) => {


  const { addMessage } = useRAGMessages();
  const { workflowMode } = useRAGStatus();
  
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { handleKeyboardEvent, setActive, clearActive } = useFocusScope({
    scopeId: 'query-field',
    priority: 2,
    stopPropagation: true
  });

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
    if (!handleKeyboardEvent(e)) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const shouldShowScrollbar = formRef.current && textareaRef.current && textareaRef.current.scrollHeight > formRef.current.clientHeight - 50;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full h-full flex flex-col" onMouseEnter={setActive} onMouseLeave={clearActive}>
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={`w-full resize-none px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[2.5rem] ${
          shouldShowScrollbar ? 'overflow-y-auto' : 'overflow-y-hidden'
        }`}
        style={{
          maxHeight: '100%',
        }}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${workflowStatus[workflowMode].color} animate-pulse`} />
          <span className="text-sm font-medium text-gray-600">
            {workflowStatus[workflowMode].label}
          </span>
        </div>
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export { QueryField };