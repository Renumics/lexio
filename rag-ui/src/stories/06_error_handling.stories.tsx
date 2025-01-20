import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField, ErrorDisplay } from '../../lib/main';
import type { Message, RetrievalResult } from '../../lib/main';

interface TimeoutProps {
  errorType: 'request' | 'stream';
}

const ExampleComponent = ({ errorType }: TimeoutProps) => (
  <div style={{ width: '600px', height: '400px' }}>
    <RAGProvider
      config={{
        timeouts: {
          stream: 2000,   // 2 seconds between stream chunks
          request: 5000   // 5 seconds for the entire request
        }
      }}
      retrieveAndGenerate={(messages: Message[]) => {
        if (errorType === 'request') {
          // Demonstrate request timeout
          return {
            sources: new Promise((resolve) => {
              // Will timeout after 5s (request timeout)
              setTimeout(() => {
                resolve([{
                  sourceReference: "example-doc.pdf",
                  type: "pdf" as const,
                  metadata: { title: "Example Document" }
                }]);
              }, 6000);
            }),
            response: Promise.resolve("This response won't be shown due to request timeout")
          };
        } else {
          // Demonstrate stream timeout
          return {
            sources: Promise.resolve([{
              sourceReference: "example-doc.pdf",
              type: "pdf" as const,
              metadata: { title: "Example Document" }
            }]),
            response: (async function* () {
              // Quick initial responses (every 200ms)
              yield { content: "Let me analyze the document... " };
              await new Promise(resolve => setTimeout(resolve, 200));
              
              yield { content: "Based on the content, " };
              await new Promise(resolve => setTimeout(resolve, 200));
              
              yield { content: "I can tell you that " };
              await new Promise(resolve => setTimeout(resolve, 200));
              
              yield { content: "the main points are... " };
              await new Promise(resolve => setTimeout(resolve, 200));

              // Now simulate a processing hang (3s > 2s timeout)
              yield { content: "\n\nProcessing additional details" };
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // This part won't be shown due to the timeout
              yield { content: "This content will never appear because of the stream timeout" };
            })()
          };
        }
      }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex-1">
          <ChatWindow />
        </div>
        <div>
          <AdvancedQueryField />
        </div>
        <ErrorDisplay />
      </div>
    </RAGProvider>
  </div>
);

const meta = {
  title: 'Getting Started/06. Error Handling',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Error Handling

Now that you have a fully functional chat interface, let's make it robust by handling errors and timeouts.
This guide will show you how to:
- Handle request timeouts gracefully
- Manage streaming timeouts
- Display error messages to users

## Timeout Types

The RAG UI supports two types of timeouts:

1. \`request\`: Overall timeout for the entire request (default: 60s)
2. \`stream\`: Timeout between stream chunks (default: 2s)

## Example Implementation

\`\`\`tsx
<RAGProvider
  config={{
    timeouts: {
      request: 60000,  // 60s for entire request
      stream: 2000     // 2s between chunks
    }
  }}
  retrieveAndGenerate={(messages) => {
    // Simulate a slow request
    return {
      sources: new Promise((resolve) => {
        setTimeout(() => {
          resolve([{
            source: "example.pdf",
            type: "pdf",
            metadata: { title: "Example" }
          }]);
        }, 5000);  // 5s delay
      }),
      response: Promise.resolve("This will timeout...")
    };
  }}
>
  <ChatWindow />
  <AdvancedQueryField />
  <ErrorDisplay />  {/* Shows timeout and error messages */}
</RAGProvider>
\`\`\`

Try it out:
1. The request will timeout after 5s
2. Error messages will be displayed to the user
3. The UI remains responsive during timeouts

This concludes the Getting Started guide. You now have a solid foundation for building RAG UIs!
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    errorType: {
      control: 'radio',
      options: ['request', 'stream'],
      description: 'Type of timeout error to demonstrate',
      defaultValue: 'request'
    }
  }
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  args: {
    errorType: 'request'
  }
}; 