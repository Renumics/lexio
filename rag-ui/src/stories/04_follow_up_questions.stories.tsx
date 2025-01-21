import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField } from '../../lib/main';
import type { Message, RetrievalResult } from '../../lib/main';

const ExampleComponent = () => (
  <div style={{ width: '600px', height: '400px' }}>
    <RAGProvider
      // Initial queries will use retrieveAndGenerate to get both sources and a response
      retrieveAndGenerate={(messages: Message[]) => {
        return {
          sources: Promise.resolve([
            {
              sourceReference: "example-doc.pdf",
              type: "pdf" as const,
              metadata: {
                title: "Example Document"
              }
            }
          ]),
          response: Promise.resolve("Based on the document, the answer is...")
        };
      }}
      // Follow-up questions will use the generate function with existing sources
      generate={(messages: Message[], sources: RetrievalResult[]) => {
        // The sources parameter contains the previously retrieved documents
        return Promise.resolve(
          "To answer your follow-up question, using the previously retrieved sources..."
        );
      }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex-1">
          <ChatWindow />
        </div>
        <div>
          <AdvancedQueryField />
        </div>
      </div>
    </RAGProvider>
  </div>
);

const meta = {
  title: 'Getting Started/04. Follow-up Questions',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Follow-up Questions

Now that you can handle basic queries and streaming, let's improve the user experience with follow-up questions.
This guide will show you how to:
- Handle follow-up questions differently from initial queries
- Reuse existing context and sources
- Implement the generate function for follow-ups

## Implementation Overview

The RAG UI supports this through two functions:

1. \`retrieveAndGenerate\`: Used for initial queries to get both sources and a response
2. \`generate\`: Used for follow-up questions, utilizing previously retrieved sources

## Example Implementation

\`\`\`tsx
<RAGProvider
  // Initial queries will use retrieveAndGenerate to get both sources and a response
  retrieveAndGenerate={(messages) => {
    return {
      sources: Promise.resolve([
        {
          source: "example-doc.pdf",
          type: "pdf",
          metadata: {
            title: "Example Document"
          }
        }
      ]),
      response: Promise.resolve("Based on the document, the answer is...")
    };
  }}
  // Follow-up questions will use the generate function with existing sources
  generate={(messages, sources) => {
    // The sources parameter contains the previously retrieved documents
    return Promise.resolve(
      "To answer your follow-up question, using the previously retrieved sources..."
    );
  }}
>
  <ChatWindow />
  <AdvancedQueryField />
</RAGProvider>
\`\`\`

Try it out:
1. Ask an initial question - this will use \`retrieveAndGenerate\` to fetch sources and generate a response
2. Ask a follow-up question - this will use \`generate\` with the existing sources

Next, move on to "05. Custom Workflows" to learn how to customize the chat behavior.
        `
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {}; 