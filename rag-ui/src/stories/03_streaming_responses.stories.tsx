import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField } from '../../lib/main';
import type { Message, RetrievalResult, GenerateStreamChunk } from '../../lib/main';

const ExampleComponent = () => (
  <div style={{ width: '600px', height: '400px' }}>
    <RAGProvider
      retrieveAndGenerate={(messages: Message[]) => {
        // Example implementation with streaming response
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
          // Return an async generator for streaming
          response: (async function* () {
            yield { content: "Based on the document, " };
            await new Promise(resolve => setTimeout(resolve, 500));
            yield { content: "the answer is..." };
            await new Promise(resolve => setTimeout(resolve, 500));
            yield { content: " Hope this helps!", done: true };
          })()
        };
      }}
      // Follow-up questions can also use streaming
      generate={(messages: Message[], sources: RetrievalResult[]) => {
        return (async function* () {
          yield { content: "Let me answer your follow-up. " };
          await new Promise(resolve => setTimeout(resolve, 500));
          yield { content: "Using the previous sources, " };
          await new Promise(resolve => setTimeout(resolve, 500));
          yield { content: "I can tell you that...", done: true };
        })();
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
  title: 'Getting Started/03. Streaming Responses',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Streaming Responses

Now that you understand sources, let's make the UI more interactive with streaming responses.
This guide will show you how to:
- Stream responses word by word
- Handle streaming in both initial queries and follow-ups
- Properly structure streaming chunks

## Streaming Format

Instead of returning a Promise<string>, you can return an AsyncIterable that yields chunks of the response as they become available.
Each chunk should have this shape:

\`\`\`typescript
interface GenerateStreamChunk {
  content: string;   // The text content to append
  done?: boolean;    // Set to true for the final chunk
}
\`\`\`

## Example Implementation

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
          }
        }
      ]),
      // Return an async generator for streaming
      response: (async function* () {
        yield { content: "Based on the document, " };
        await new Promise(resolve => setTimeout(resolve, 500));
        yield { content: "the answer is..." };
        await new Promise(resolve => setTimeout(resolve, 500));
        yield { content: " Hope this helps!", done: true };
      })()
    };
  }}
  // Follow-up questions can also use streaming
  generate={(messages, sources) => {
    return (async function* () {
      yield { content: "Let me answer your follow-up. " };
      await new Promise(resolve => setTimeout(resolve, 500));
      yield { content: "Using the previous sources, " };
      await new Promise(resolve => setTimeout(resolve, 500));
      yield { content: "I can tell you that...", done: true };
    })();
  }}
>
  <ChatWindow />
  <AdvancedQueryField />
</RAGProvider>
\`\`\`

Try it out:
1. Ask a question - notice how the response appears word by word
2. Ask a follow-up - both initial and follow-up responses support streaming

Next, move on to "04. Follow-up Questions" to learn how to handle follow-up questions with existing context.
        `
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {}; 