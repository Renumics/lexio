import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField } from '../../lib/main';
import type { Message } from '../../lib/main';

const ExampleComponent = () => (
  <div style={{ width: '600px', height: '400px' }}>
    <RAGProvider
      retrieveAndGenerate={(messages: Message[]) => {
        // Example implementation returning promises
        return {
          sources: Promise.resolve([
            {
              source: "example-doc.pdf",
              type: "pdf" as const,
              metadata: {
                title: "Example Document"
              },
              text: "Example document content",
              relevanceScore: 1
            }
          ]),
          response: Promise.resolve("This is a sample response based on the retrieved documents.")
        };
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
  title: 'RAG/Basic Usage',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The simplest way to use the RAG UI is to implement the retrieveAndGenerate function. This function receives messages (containing the query and chat history) and should return both the retrieved sources and the generated response.

The function must return:

\`\`\`typescript
{
  // Array of retrieved documents
  sources: Promise<{
    source: string,           // Document identifier
    type?: "pdf" | "html",    // Optional document type
    metadata?: {              // Optional metadata
      [key: string]: any
    },
    text?: string,           // Required if not using getDataSource
    relevanceScore?: number, // Optional relevance score
    highlights?: {            // Optional PDF highlights
      page: number,
      rect: { top: number, left: number, width: number, height: number },
      comment?: string
    }[]
  }[]>,
  response: Promise<string>   // The generated response
}
\`\`\`

### Example Implementation

\`\`\`tsx
<RAGProvider
  retrieveAndGenerate={(messages) => {
    return {
      sources: Promise.resolve([
        {
          source: "example-doc.pdf",
          type: "pdf",
          metadata: {
            title: "Example Document"
          },
          text: "Example document content",
          relevanceScore: 1
        }
      ]),
      response: Promise.resolve("This is a sample response based on the retrieved documents.")
    };
  }}
>
  <ChatWindow />
  <AdvancedQueryField />
</RAGProvider>
\`\`\`
        `
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {}; 