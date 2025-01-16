import React from 'react';
import { useRAGMessages } from '../RAGProvider/hooks';
import { useFocusScope } from '../../hooks/useFocusScope';

const ChatWindow: React.FC = () => {
  const { messages, currentStream } = useRAGMessages();

  // --- Focus Scope ---
  const { setActive, clearActive } = useFocusScope({
    scopeId: 'chat-window',
    priority: 0
  });

  return (
    <div 
      className="w-full h-full overflow-y-auto p-4 bg-gray-50 rounded-lg"
      onMouseEnter={setActive}
      onMouseLeave={clearActive}
    >
      {messages.map((msg, index) => (
        <div key={index} className={`mb-2 ${msg.role}`}>
          <strong>{msg.role === 'user' ? 'User: ' : 'Assistant: '}</strong>
          {msg.content}
        </div>
      ))}
      {currentStream && (
        <div className="mb-2 assistant streaming">
          <strong>Assistant: </strong>
          {currentStream.content}
        </div>
      )}
    </div>
  );
};
  
export { ChatWindow };