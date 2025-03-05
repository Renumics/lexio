import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider, ChatWindow, AdvancedQueryField, ErrorDisplay } from '../../../lib/main';
import type { Message, Source, StreamChunk } from '../../../lib/main';

const ExampleComponent = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <LexioProvider
      onAction={(action, messages, sources, activeSources, selectedSource) => {
        // Handle user messages with streaming response
        if (action.type === 'ADD_USER_MESSAGE') {
          return {
            // Return sources as a Promise that resolves to Source[]
            sources: Promise.resolve([
              {
                id: crypto.randomUUID(),
                title: "Example Document",
                type: "pdf",
                relevance: 0.95,
                metadata: {
                  author: "Documentation Team",
                  page: 3,
                  _internal: "Hidden metadata" // Hidden from display with underscore prefix
                }
              }
            ]),
            // Return an async generator for streaming responses
            response: (async function* () {
              yield { content: "### Analysis Result\n\n" };
              await new Promise(resolve => setTimeout(resolve, 500));
              yield { content: "Based on the document, here are the key points:\n\n" };
              await new Promise(resolve => setTimeout(resolve, 500));
              yield { content: "1. First important finding\n" };
              await new Promise(resolve => setTimeout(resolve, 500));
              yield { content: "2. Second key insight\n\n" };
              await new Promise(resolve => setTimeout(resolve, 500));
              yield { content: "**Conclusion**: This demonstrates streaming with markdown!", done: true };
            })()
          };
        }
        
        // Handle source selection with lazy loading
        if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
          console.log('Loading data for source:', action.sourceObject.title);
          
          // Return a Promise that resolves to the source data
          return {
            sourceData: new Promise(resolve => {
              // Simulate fetching PDF data
              setTimeout(() => {
                // For PDF sources, return a Uint8Array
                // For text/markdown/html, return a string
                resolve("# Example Content\n\nThis is the content of the selected source.");
              }, 1000);
            })
          };
        }
      }}
    >
      <div className="flex flex-col gap-4 h-full w-[600px]">
        <div className="flex-1">
          <ChatWindow markdown={true} />
        </div>
        <div>
          <AdvancedQueryField />
        </div>
      </div>
      <ErrorDisplay />
    </LexioProvider>
  </div>
);

const meta = {
  title: 'Basic Usage/04. Streaming Responses',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Introduction

This guide demonstrates how to implement streaming responses and handle different action types in Lexio. Streaming allows you to provide real-time, incremental responses to users, creating a more engaging and responsive experience.

## Understanding Action Handlers

The \`onAction\` function is the central place to handle user interactions. It receives:

\`\`\`typescript
onAction(
  action: UserAction,           // The action that was triggered
  messages: Message[],          // All messages in the chat
  sources: Source[],            // All available sources
  activeSources: Source[] | null, // Currently active sources (null by default)
  selectedSource: Source | null // Currently selected source
) => ActionHandlerResponse | Promise<ActionHandlerResponse> | undefined
\`\`\`

## Implementing Streaming Responses

For streaming responses, return an \`AsyncIterable\` that yields chunks of the response:

\`\`\`typescript
if (action.type === 'ADD_USER_MESSAGE') {
  return {
    response: (async function* () {
      yield { content: "First part of the response" };
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      yield { content: "Second part of the response" };
      yield { content: "Final part", done: true }; // Mark as done
    })()
  };
}
\`\`\`

#### The StreamChunk Interface (for streaming responses)

Each chunk should conform to the \`StreamChunk\` interface:

\`\`\`typescript
interface StreamChunk {
  content?: string;   // Text to append to the response
  sources?: Source[]; // Optional sources to add during streaming
  done?: boolean;     // Set to true for the final chunk
}
\`\`\`

Let's explore each property in detail:

- **content**: Optional string that will be appended to the current response. This allows for incremental text generation, creating a typing-like effect. Markdown formatting is supported if you've enabled it in the ChatWindow component.

- **sources**: Optional array of Source objects that can be added during streaming. **This property can only be handled once in the \`AsyncIterable\` response.** Updates are not supported.

- **done**: Boolean flag that indicates the final chunk of the stream. When set to \`true\`, Lexio will:
  - Add the sources to the state
  - Mark the response as done

## Non-Streaming Responses

For non-streaming responses, return a Promise that resolves to a string:

\`\`\`typescript
if (action.type === 'ADD_USER_MESSAGE') {
  return {
    response: Promise.resolve("This is a non-streaming response")
  };
}
\`\`\`

## Example Implementation

\`\`\`tsx
<LexioProvider
  onAction={(action, messages, sources, activeSources, selectedSource) => {
    // Handle user messages
    if (action.type === 'ADD_USER_MESSAGE') {
      return {
        sources: Promise.resolve([
          {
            id: crypto.randomUUID(),
            title: "Example Document",
            type: "pdf",
            metadata: { author: "Documentation Team" }
          }
        ]),
        response: (async function* () {
          yield { content: "### Analysis Result\\n\\n" };
          yield { content: "Based on the document...\\n\\n" };
          yield { content: "**Conclusion**: This works!", done: true };
        })()
      };
    }
    
    // Handle source selection
    if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
      return {
        sourceData: fetchPdfData(action.sourceObject.id)
      };
    }
  }}
>
  <ChatWindow markdown={true} />
  <AdvancedQueryField />
</LexioProvider>
\`\`\`


### Try it out:
- Ask a question - notice how the response appears word by word with markdown formatting
- Select a source to see lazy loading in action
        `
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {}; 