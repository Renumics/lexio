import React from 'react';
import { useAtom } from 'jotai';
import { completedMessagesAtom, currentStreamAtom } from '../../state/rag-state';

const ChatWindow: React.FC = () => {
  const [messages] = useAtom(completedMessagesAtom);
  const [currentStream] = useAtom(currentStreamAtom);

  return (
    <div className="w-full h-full overflow-y-auto p-4 bg-gray-50 rounded-lg">
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