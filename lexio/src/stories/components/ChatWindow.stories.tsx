import type { Meta, StoryObj } from '@storybook/react';
import { ChatWindow } from '../../../lib/components/ChatWindow/ChatWindow';
import { LexioProvider } from '../../../lib/components/LexioProvider';
import { useMessages } from '../../../lib/hooks/hooks';
import 'tailwindcss/tailwind.css';
import type { Message, UserAction, UUID } from '../../../lib/types';
import { useEffect } from 'react';
import { extractComponentDescriptionHelper} from './helper';
import { UserIcon, SparklesIcon } from "lucide-react";
import * as DocBlocks from "@storybook/blocks";

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
        '\n```python \nanswer = 3 + 4 \nprint(answer) \n```'
  },
];

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
    
    return null;
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

const meta: Meta<typeof ChatWindow> = {
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
              <h2>Markdown Support:</h2>
              <div>
                  <p>The ChatWindow component supports markdown formatting out of the box. It is enabled by default.</p>
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
    },
  decorators: [
    (Story) => (
      <div className="h-fit" style={{ width: '600px', padding: '1rem' }}>
        <LexioProvider onAction={sampleActionHandler}>
          <DataLoader />
          <Story />
        </LexioProvider>
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
