import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField, ErrorDisplay } from '../../lib/main';
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
            yield { content: "### Analysis Result\n\n" };
            await new Promise(resolve => setTimeout(resolve, 500));
            yield { content: "Based on the document, here are the key points:\n\n" };
            await new Promise(resolve => setTimeout(resolve, 500));
            yield { content: "1. First important finding\n" };
            await new Promise(resolve => setTimeout(resolve, 500));
            yield { content: "2. Second key insight\n\n" };
            await new Promise(resolve => setTimeout(resolve, 500));
            yield { content: "**Conclusion**: This demonstrates both streaming *and* markdown support!", done: true };
          })()
        };
      }}
      // Follow-up questions can also use streaming
      generate={(messages: Message[], sources: RetrievalResult[]) => {
        return (async function* () {
          yield { content: "### Follow-up Analysis\n\n" };
          await new Promise(resolve => setTimeout(resolve, 500));
          yield { content: "Using the previous sources, I can tell you that:\n\n" };
          await new Promise(resolve => setTimeout(resolve, 500));
          yield { content: "- Point one\n- Point two\n\n" };
          await new Promise(resolve => setTimeout(resolve, 500));
          yield { content: "*This concludes the analysis.*", done: true };
        })();
      }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex-1">
          <ChatWindow markdown={true} />
        </div>
        <div>
          <AdvancedQueryField />
        </div>
      </div>
      <ErrorDisplay />
    </RAGProvider>
  </div>
);

const meta = {
  title: 'Tutorial/03. Streaming Responses',
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
- Display markdown-formatted responses in the chat window

## Streaming Format

Instead of returning a Promise<string>, you can return an AsyncIterable that yields chunks of the response as they become available.
Each chunk should have this shape:

\`\`\`typescript
interface GenerateStreamChunk {
  content: string;   // The text content to append
  done?: boolean;    // Set to true for the final chunk
}
\`\`\`

### Markdown Support in Streaming Responses

The \`ChatWindow\` component supports markdown in streaming responses out of the box. It is enabled by default and can explicitly set with the \`markdown\` prop.
In this example we will use headers, bold text, and lists in the streaming responses.  

See the \`ChatWindow\` component documentation for more details.

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
      // Return an async generator for streaming. Text is automatically formatted as markdown.
      response: (async function* () {
        yield { content: "### Analysis Result\\n\\n" };
        yield { content: "Based on the document, here are the key points:\\n\\n" };
        yield { content: "1. First important finding\\n" };
        yield { content: "2. Second key insight\\n\\n" };
        yield { content: "**Conclusion**: This demonstrates both streaming *and* markdown!", done: true };
      })()
    };
  }}
  // Follow-up questions can also use streaming
  generate={(messages, sources) => {
    return (async function* () {
      yield { content: "### Follow-up Analysis\\n\\n" };
      yield { content: "Using the previous sources...\\n\\n" };
      yield { content: "- Point one\\n- Point two", done: true };
    })();
  }}
>
  <ChatWindow markdown={true} />
  <AdvancedQueryField />
</RAGProvider>
\`\`\`

Try it out:
- Ask a question - notice how the response appears word by word with markdown formatting.
- Then, ask a follow-up question - both initial and follow-up responses support streaming and markdown.

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