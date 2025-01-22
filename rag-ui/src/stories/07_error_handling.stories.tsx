import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField, ErrorDisplay } from '../../lib/main';
import type { Message, RetrievalResult } from '../../lib/main';

interface ErrorDemoProps {
  errorType: 'request-timeout' | 'stream-timeout' | 'operation-error';
}

const ExampleComponent = ({ errorType }: ErrorDemoProps) => (
  <div style={{ width: '600px', height: '400px' }}>
    <RAGProvider
      config={{
        timeouts: {
          stream: 2000,   // 2 seconds between stream chunks
          request: 5000   // 5 seconds for the entire request
        }
      }}
      retrieveAndGenerate={(messages: Message[]) => {
        switch (errorType) {
          case 'request-timeout':
            // Demonstrate request timeout
            return {
              sources: new Promise((resolve) => {
                setTimeout(() => {
                  resolve([{
                    sourceReference: "example-doc.pdf",
                    type: "pdf" as const,
                    metadata: { title: "Example Document" }
                  }]);
                }, 6000); // Will timeout after 5s (request timeout)
              }),
              response: new Promise((resolve) => {
                // This will also timeout since the entire request takes > 5s
                setTimeout(() => {
                  resolve("This response won't be shown due to request timeout");
                }, 6000);
              })
            };

          case 'stream-timeout':
            // Demonstrate stream timeout
            return {
              sources: Promise.resolve([{
                sourceReference: "example-doc.pdf",
                type: "pdf" as const,
                metadata: { title: "Example Document" }
              }]),
              response: (async function* () {
                yield { content: "Starting analysis... " };
                await new Promise(resolve => setTimeout(resolve, 200));
                
                yield { content: "Processing content... " };
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Simulate a processing hang (3s > 2s timeout)
                yield { content: "\n\nProcessing additional details..." };
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                yield { content: "This content will never appear due to stream timeout" };
              })()
            };

          case 'operation-error':
            // Demonstrate operation error (e.g., API failure)
            return {
              sources: (async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                throw new Error("Failed to connect to knowledge base");
              })(),
              response: (async function* () {
                // Show initial message then error
                yield { content: "Initializing generation..." };
                await new Promise(resolve => setTimeout(resolve, 500));
                throw new Error("Generation service unavailable");
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
  title: 'Getting Started/07. Error Handling',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Error Handling

The RAG UI implements a comprehensive error handling system to ensure robustness and good user experience.
This guide demonstrates how to handle various types of errors and implement proper error handling in your application.

## Error Types & Handling

The system handles several types of errors:

1. **Operation Errors**
   - Concurrent operation attempts
   - Missing capabilities
   - Configuration errors
   - API failures

2. **Timeout Errors**
   - Request timeout: Overall operation timeout
   - Stream timeout: Gap between stream chunks

3. **Source Errors**
   - Source fetch failures
   - Invalid source content
   - Missing source configuration

## Implementation Example

\`\`\`tsx
<RAGProvider
  config={{
    timeouts: {
      request: 30000,  // 30s for entire operation
      stream: 10000    // 10s between chunks
    }
  }}
  retrieveAndGenerate={async (messages) => {
    try {
      const sources = await fetchSources(messages);
      return {
        sources: Promise.resolve(sources),
        response: generateResponse(messages, sources)
      };
    } catch (error) {
      // Errors are automatically displayed via ErrorDisplay
      throw new Error(\`Operation failed: \${error.message}\`);
    }
  }}
>
  <ChatWindow />
  <AdvancedQueryField />
  <ErrorDisplay />
</RAGProvider>
\`\`\`

## Error Recovery

The system implements automatic state recovery:
- Message history preservation
- Workflow mode restoration
- Source state recovery

## Best Practices

1. **Always Include ErrorDisplay**
   - Add \`<ErrorDisplay />\` to show user-friendly error messages
   - Position it appropriately in your UI

2. **Configure Timeouts**
   - Set appropriate timeout values for your use case
   - Consider network latency and operation complexity

3. **Implement Error Prevention**
   - Validate inputs before operations
   - Check capability availability
   - Handle abort signals

4. **Custom Error Handling**
   - Implement try-catch blocks for custom handling
   - Use the error atom for UI updates
   - Provide meaningful error messages

Try out different error scenarios using the controls below!
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    errorType: {
      control: 'radio',
      options: ['request-timeout', 'stream-timeout', 'operation-error'],
      description: 'Type of error to demonstrate',
      defaultValue: 'request-timeout'
    }
  }
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  args: {
    errorType: 'request-timeout'
  }
}; 