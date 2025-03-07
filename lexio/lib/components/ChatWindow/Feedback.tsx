import { useState } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';

const Feedback = () => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    // Here you could add API calls to submit feedback
  };

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handleFeedback('positive')}
        className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
          feedback === 'positive' ? 'bg-green-100 text-green-600' : 'text-gray-400'
        }`}
        aria-label="Thumbs up"
        disabled={feedback !== null}
      >
        <HandThumbUpIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleFeedback('negative')}
        className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
          feedback === 'negative' ? 'bg-red-100 text-red-600' : 'text-gray-400'
        }`}
        aria-label="Thumbs down"
        disabled={feedback !== null}
      >
        <HandThumbDownIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export { Feedback };
