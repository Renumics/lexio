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
                  source: "example-doc.pdf",
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
              source: "example-doc.pdf",
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
  title: 'RAG/Timeout Handling',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The RAG UI provides timeout configuration to handle slow or unresponsive backends. You can configure two types of timeouts:

1. \`stream\`: Maximum time allowed between stream chunks (default: 10s)
2. \`request\`: Maximum time for the entire request to complete (default: 60s)

When a timeout occurs:
- The operation is cancelled
- Previous state is restored (rollback)
- An error message is displayed to the user via the ErrorDisplay component
- The UI remains responsive for new queries

\`\`\`typescript
interface RAGConfig {
  timeouts?: {
    stream?: number;   // Timeout between stream chunks in ms
    request?: number;  // Overall request timeout in ms
  }
}
\`\`\`

### Example Implementation

\`\`\`tsx
<RAGProvider
  config={{
    timeouts: {
      stream: 2000,   // 2 seconds between stream chunks
      request: 5000   // 5 seconds for the entire request
    }
  }}
  retrieveAndGenerate={(messages) => {
    // Example of request timeout
    return {
      sources: new Promise((resolve) => {
        // Will timeout after 5s
        setTimeout(() => {
          resolve([{
            source: "example-doc.pdf",
            type: "pdf",
            metadata: { title: "Example Document" }
          }]);
        }, 6000);
      }),
      response: Promise.resolve("This won't be shown")
    };
    
    // Example of stream timeout
    return {
      sources: Promise.resolve([/* ... */]),
      response: (async function* () {
        // Quick initial responses
        yield { content: "Let me analyze the document... " };
        await new Promise(resolve => setTimeout(resolve, 200));
        yield { content: "Based on the content, " };
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Simulate a processing hang (3s > 2s timeout)
        yield { content: "Processing additional details" };
        await new Promise(resolve => setTimeout(resolve, 3000));
        yield { content: "This won't be shown" };
      })()
    };
  }}
>
  <ChatWindow />
  <AdvancedQueryField />
  <ErrorDisplay />
</RAGProvider>
\`\`\`

Try it out:
1. Switch between "request" and "stream" timeout scenarios using the controls
2. For request timeout: The entire operation will fail after 5 seconds
3. For stream timeout: Watch the response stream quickly at first, then hang and timeout
4. Both cases will show appropriate error messages and preserve previous state
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