import type { Meta, StoryObj } from '@storybook/react';
import { ChatWindow } from '../../../lib/components/ChatWindow/ChatWindow';
import { LexioProvider } from '../../../lib/components/LexioProvider';
import { useMessages } from '../../../lib/hooks/hooks';
import 'tailwindcss/tailwind.css';
import type { Message, UserAction, UUID } from '../../../lib/types';
import { useEffect, useState } from 'react';
import { extractComponentDescriptionHelper} from './helper';
import { UserIcon, SparklesIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import * as DocBlocks from "@storybook/blocks";
import { Citation } from '../../../lib/components/Citation/Citation';

// use for testing markdown support
const markdownResponse = `# Data Analysis Report

## Introduction
This is a sample markdown-formatted response that demonstrates various formatting capabilities.

### Key Findings
1. **Important metrics** showed significant improvement
2. *Italic text* for emphasis
3. Combined **bold and *italic*** formatting

## Code Examples
Here's a Python code snippet:
\`\`\`python
import pandas as pd

def analyze_data(data):
    # Calculate summary statistics
    summary = data.describe()
    return summary
\`\`\`

## Data Table
| Metric | Value | Change |
|--------|--------|--------|
| Revenue | $1.2M | +15% |
| Users | 50k | +25% |
| Engagement | 78% | +5% |

## Links and References
- [Documentation](https://example.com)
- Visit our [website](https://example.com/home)

> **Note:** This is a blockquote highlighting important information.
`;

const CITATION_1_ID = crypto.randomUUID() as UUID;
const CITATION_2_ID = crypto.randomUUID() as UUID;

// Sample data for the story
const SAMPLE_MESSAGES: Message[] = [
  {
    id: crypto.randomUUID() as UUID,
    role: 'user',
    content: 'What is machine learning?',
  },
  {
    id: crypto.randomUUID() as UUID,
    role: 'assistant',
    content: 'Machine learning is a branch of artificial intelligence that enables systems to **learn and improve** from experience without being explicitly programmed.\n' +
    '> I am a machine learning model myself! A Large Language Model (LLM) to be more specific.\n ' +
    '\nI can help you with various tasks, such as answering questions, summarizing text, and generating reports. I also write code:' +
    '\n```python \nanswer = 3 + 4 \nprint(answer) \n```',
    highlights: [
      {
        text: "Machine learning is a branch of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.",
        citationId: CITATION_1_ID,
        color: "#2563eb"
      },
      {
        text: "I am a machine learning model myself! A Large Language Model (LLM)",
        citationId: CITATION_2_ID,
        color: "#2563eb"
      }
    ]
  },
];

const SAMPLE_CITATIONS = [
  {
    id: CITATION_1_ID,
    sourceId: crypto.randomUUID() as UUID,
    content: {
      text: "Machine learning is a fundamental branch of AI, focusing on systems that can learn and adapt from experience.",
      color: "#2563eb"
    },
    reference: {
      page: 1,
      rect: { top: 0.1, left: 0.1, width: 0.8, height: 0.05 }
    }
  },
  {
    id: CITATION_2_ID,
    sourceId: crypto.randomUUID() as UUID,
    content: {
      text: "Large Language Models (LLMs) represent a significant advancement in machine learning, capable of understanding and generating human-like text.",
      color: "#2563eb"
    },
    reference: {
      page: 8,
      rect: { top: 0.3, left: 0.2, width: 0.7, height: 0.05 }
    }
  }
];

// CitationGroup component to show citations in a collapsible group
const CitationGroup = ({ citations, isOpen, onToggle }: { citations: typeof SAMPLE_CITATIONS, isOpen: boolean, onToggle: () => void }) => {
  return (
    <div className="mt-2">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        <DocumentTextIcon className="w-4 h-4" />
        <span>{citations.length} sources</span>
      </button>
      <div className={`mt-2 space-y-2 transition-all duration-200 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 hidden'}`}>
        {citations.map((citation) => (
          <Citation key={citation.id} {...citation} />
        ))}
      </div>
    </div>
  );
};

// Component to load initial data and add sample messages
const DataLoader = () => {
    const { addUserMessage } = useMessages('ChatWindow-DataLoader');
    
    useEffect(() => {
      // Small delay to ensure provider is ready
      const timer = setTimeout(() => {
        addUserMessage(SAMPLE_MESSAGES[0].content);
  
      }, 0);
      
      return () => clearTimeout(timer);
    }, [addUserMessage]);
    
    return <ChatWindow />;
};

// Sample action handler for the story
const sampleActionHandler = (action: UserAction, messages: Message[]) => {
  // Handle user messages
  if (action.type === 'ADD_USER_MESSAGE' && messages.length === 0) {
    return {
      response: Promise.resolve(SAMPLE_MESSAGES[1].content)
    };
  }
  
  // Return undefined for other actions
  return undefined;
};

// we added a new prop showCitation that isn't part of the ChatWindow component
type StoryProps = {
  showCitation?: boolean;
} & React.ComponentProps<typeof ChatWindow>;

const meta = {
  title: 'Components/ChatWindow',
  component: ChatWindow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      extractComponentDescription: extractComponentDescriptionHelper,
      page: () => (
        <>
          <DocBlocks.Title/>
          <h2>Description:</h2>
          <DocBlocks.Description/>
          <h2>Features:</h2>
          <div>
              <p>The ChatWindow component supports the following features:</p>
              <ul>
                  <li>Markdown formatting (enabled by default)</li>
                  <li>Custom user and assistant icons</li>
                  <li>Citations with source references</li>
              </ul>
              <h3>Markdown Support:</h3>
              <p>The following markdown formatting is supported:</p>
              <ul>
                  <li>Headers with <code>#</code> (h1-h4)</li>
                  <li><strong>Bold</strong> and <em>italic</em> text with <code>**</code> and <code>*</code></li>
                  <li>Lists and tables</li>
                  <li>Code blocks with <code>```</code></li>
                  <li>Blockquotes with <code>&gt;</code></li>
                  <li>Links with <code>[text](url)</code></li>
              </ul>
          </div>
          <h2>Component Preview:</h2>
          <DocBlocks.Primary/>
          <h2>Props:</h2>
          <DocBlocks.Controls/>
        </>
      ),
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
        showCitation: {
            control: 'boolean',
            description: 'Show citation component with source reference',
            defaultValue: false,
        },
    },
  decorators: [
    (Story, context) => {
      const [isOpen, setIsOpen] = useState(false);
      
      return (
        <div className="h-fit" style={{ width: '600px', padding: '1rem' }}>
          <LexioProvider onAction={sampleActionHandler}>
            <div className="flex flex-col">
              <DataLoader />
              {context.args.showCitation && SAMPLE_MESSAGES[1].highlights && SAMPLE_MESSAGES[1].highlights.length > 0 && (
                <div className="mt-2 px-4">
                  <CitationGroup 
                    citations={SAMPLE_CITATIONS} 
                    isOpen={isOpen} 
                    onToggle={() => setIsOpen(!isOpen)} 
                  />
                </div>
              )}
            </div>
          </LexioProvider>
        </div>
      );
    },
  ],
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  args: {
    showCitation: true,
  },
};