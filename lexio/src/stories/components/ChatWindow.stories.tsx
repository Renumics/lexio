import type { Meta, StoryObj } from '@storybook/react';
import { ChatWindow } from '../../../lib/components/ChatWindow/ChatWindow';
import { RAGProvider, useRAGMessages } from '../../../lib/components/RAGProvider';
import 'tailwindcss/tailwind.css';
import type { Message, GenerateInput, RetrieveAndGenerateResponse } from '../../../lib/types';
import { useEffect } from 'react';
import { extractComponentDescriptionHelper, renderDocsBlocks} from './helper';
import { UserIcon, SparklesIcon } from "@heroicons/react/24/outline";

// Sample data for the story
const SAMPLE_MESSAGES: Message[] = [
  {
    role: 'user',
    content: 'What is machine learning?',
  },
  {
    role: 'assistant',
    content: 'Machine learning is a branch of artificial intelligence that enables systems to **learn and improve** from experience without being explicitly programmed.\n' +
        '> I am a machine learning model myself! A Large Language Model (LLM) to be more specific.\n ' +
        '\nI can help you with various tasks, such as answering questions, summarizing text, and generating reports. I also write code:' +
        '\n```python \nanswer = 3 + 4 \nprint(answer) \n```'
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
    argTypes: {
        userIcon: {
            control: { type: 'select' }, // Use a dropdown control
            options: ['none', 'UserIcon'], // User selects from these options
            mapping: {
                UserIcon: <UserIcon className={"w-5 h-5"}/>,
                none: null,
            },
        },
        assistantIcon: {
            control: { type: 'select' }, // Use a dropdown control
            options: ['none', 'SparklesIcon'], // User selects from these options
            mapping: {
                SparklesIcon: <SparklesIcon className={"w-5 h-5"}/>,
                none: null,
            },
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
