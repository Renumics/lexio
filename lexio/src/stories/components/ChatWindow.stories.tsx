import type { Meta, StoryObj } from '@storybook/react';
import { ChatWindow } from '../../../lib/components/ChatWindow/ChatWindow';
import { RAGProvider, useRAGMessages } from '../../../lib/components/RAGProvider';
import 'tailwindcss/tailwind.css';
import type { Message, GenerateInput, RetrieveAndGenerateResponse } from '../../../lib/types';
import { useEffect } from 'react';
import {configureDocsRendering, extractComponentDescriptionHelper, renderDocsBlocks} from './helper';

// Sample data for the story
const SAMPLE_MESSAGES: Message[] = [
  {
    role: 'user',
    content: 'What is machine learning?',
  },
  {
    role: 'assistant',
    content: 'Machine learning is a branch of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
  },
];

// Component to load initial data and add sample messages
const DataLoader = () => {
    const { addMessage } = useRAGMessages();
    
    useEffect(() => {
      // Small delay to ensure provider is ready
      const timer = setTimeout(() => {
        addMessage(SAMPLE_MESSAGES[0]);
  
      }, 0);
      
      return () => clearTimeout(timer);
    }, []);
    
    return null;
};

const meta: Meta<typeof ChatWindow> = {
  title: 'Components/ChatWindow',
  component: ChatWindow,
  tags: ['autodocs'],
  parameters: {
      docs: {
          extractComponentDescription: extractComponentDescriptionHelper,
          page: renderDocsBlocks,
      },
  },
  decorators: [
    (Story) => (
      <div className="h-fit" style={{ width: '600px', padding: '1rem' }}>
        <RAGProvider
          retrieveAndGenerate={(messages: GenerateInput): RetrieveAndGenerateResponse => ({
            sources: Promise.resolve([]),
            response: Promise.resolve(SAMPLE_MESSAGES[1].content)
          })}
        >
          <DataLoader />
          <Story />
        </RAGProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatWindow>;

export const Docs: Story = {
  args: {
  },
}; 