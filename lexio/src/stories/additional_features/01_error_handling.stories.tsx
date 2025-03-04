import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider, ChatWindow, AdvancedQueryField, ErrorDisplay, ContentDisplay, SourcesDisplay } from '../../../lib/main';
import type { Message, Source, UserAction } from '../../../lib/main';

interface ErrorDemoProps {
  errorType: 'request-timeout' | 'stream-timeout' | 'operation-error';
}

const ExampleComponent = ({ errorType }: ErrorDemoProps) => (
  <div style={{ width: '800px', height: '600px' }}>
    <LexioProvider
      config={{
        timeouts: {
          stream: 2000,   // 2 seconds between stream chunks
          request: 5000   // 5 seconds for the entire request
        }
      }}
      onAction={(
        action: UserAction,
        messages: Message[],
        sources: Source[],
        activeSources: Source[],
        selectedSource: Source | null
      ) => {
        if (action.type === 'ADD_USER_MESSAGE') {
          switch (errorType) {
            case 'request-timeout':
              // Demonstrate request timeout
              return {
                sources: new Promise((resolve) => {
                  setTimeout(() => {
                    resolve([{
                      id: crypto.randomUUID(),
                      title: "Example Document",
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
                  id: crypto.randomUUID(),
                  title: "Example Document",
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
        }
      }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-row h-full gap-4">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto">
              <ChatWindow />
            </div>
            <div>
              <AdvancedQueryField />
            </div>
          </div>
          <div className="w-1/3">
            <SourcesDisplay />
          </div>
        </div>
        <div className="h-1/3">
          <ContentDisplay />
        </div>
        <ErrorDisplay />
      </div>
    </LexioProvider>
  </div>
);

const meta = {
  title: 'Additional Features/01. Error Handling',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Introduction

The \`Lexio\` library implements a comprehensive error handling system to ensure robustness and good user experience.
This guide demonstrates how to handle various types of errors and implement proper error handling in your application.

## Error Types & Handling

The \`Lexio\` library handles several types of errors:

**1. Operation Errors**
   - Concurrent operation attempts
   - Missing capabilities
   - Configuration errors
   - API failures

**2. Timeout Errors**
   - Request timeout: Overall operation timeout
   - Stream timeout: Gap between stream chunks

**3. Source Errors**
   - Source fetch failures
   - Invalid source content
   - Missing source configuration

These errors will be automatically displayed if you use the \`ErrorDisplay\` component inside your \`LexioProvider\`.
Additionally you can use the \`useStatus\` hook to access the current loading state and any error information. 
See \`hooks.ts\` for more details.

## Implementation Example

The following example demonstrates how to implement error handling in your application with the \`LexioProvider\`.
Timeouts can be configured via the \`config\` prop (see \`ProviderConfig\` for more details).

\`\`\`tsx
<LexioProvider
  config={{
    timeouts: {
      request: 30000,  // 30s for entire operation
      stream: 10000    // 10s between chunks
    }
  }}
  onAction={(action, messages, sources, activeSources, selectedSource) => {
    if (action.type === 'ADD_USER_MESSAGE') {
      try {
        return {
          sources: fetchSources(messages),
          response: generateResponse(messages)
        };
      } catch (error) {
        // Errors are automatically displayed via ErrorDisplay
        throw new Error(\`Operation failed: \${error.message}\`);
      }
    }
  }}
>
  <ChatWindow />
  <AdvancedQueryField />
  <SourcesDisplay />
  <ContentDisplay />
  <ErrorDisplay />
</LexioProvider>
\`\`\`

## Error Recovery

The system implements automatic state recovery:
- Message history preservation
- Workflow mode restoration
- Source state recovery

## Best Practices

**1. Always Include ErrorDisplay**
   - Add \`<ErrorDisplay />\` to show user-friendly error messages
   - Position it appropriately in your UI

**2. Configure Timeouts**
   - Set appropriate timeout values for your use case
   - Consider network latency and operation complexity

## Interactive Example
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