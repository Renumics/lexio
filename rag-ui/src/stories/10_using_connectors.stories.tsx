// ConnectorExample.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import {
  RAGProvider,
  ChatWindow,
  AdvancedQueryField,
  ErrorDisplay,
  // Connectors/Hooks:
  useRestContentSource,
  useSSERetrieveAndGenerateSource,
  useSSEGenerateSource,
} from '../../lib/main';

// Simple example component to match basic usage format
const ExampleComponent = () => (
  <div style={{ width: '600px', height: '400px' }}>
    <RAGProvider
      retrieveAndGenerate={() => ({
        sources: Promise.resolve([]),
        response: Promise.resolve("Example response")
      })}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex-1">
          <ChatWindow />
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
  title: 'Getting Started/10. Using Connectors',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Using Connectors

This guide covers how to use connectors in your RAG application. You'll learn about:
- What connectors are and why they're useful
- Available connector hooks
- How to implement common connector patterns

## Connectors Overview

In a typical RAG application, you often need to:
1. **Fetch** or **load** source files (PDF, HTML, code files, etc.) on demand
2. **Stream** partial responses from a model via SSE or another streaming mechanism
3. **Generate** final responses (sometimes all at once, sometimes again via SSE)

**Connectors** are small abstractions that standardize and simplify this process. By using a connector, you can:
- Cleanly configure how to fetch and parse specific file types (e.g. PDF vs. HTML)
- Switch between different streaming or non-streaming strategies without changing your core app logic
- Tweak or replace the request/response parsing logic in one place, without refactoring your entire UI

## Available Hooks

### useRestContentSource

Fetches and parses source content from REST endpoints:

\`\`\`typescript
const getDataSource = useRestContentSource({
  buildFetchRequest: (source) => ({
    url: \`http://api.example.com/files/\${source.id}\`
  }),
  parseText: (text, source) => ({
    type: 'markdown',
    content: text,
    metadata: source.metadata
  })
});
\`\`\`

### useSSERetrieveAndGenerateSource

Handles Server-Sent Events for combined retrieval and generation:

\`\`\`typescript
const retrieveAndGenerate = useSSERetrieveAndGenerateSource({
  endpoint: '/api/retrieve-and-generate',
  method: 'POST',
  buildRequestBody: (messages) => ({
    query: messages[messages.length - 1].content
  }),
  parseEvent: (event) => ({
    sources: event.sources,
    content: event.content,
    done: event.done
  })
});
\`\`\`

### useSSEGenerateSource

Streams generation results from existing sources:

\`\`\`typescript
const generate = useSSEGenerateSource({
  endpoint: '/api/generate',
  method: 'POST',
  buildRequestBody: (messages, sources) => ({
    messages,
    source_ids: sources.map(s => s.sourceReference)
  }),
  parseEvent: (event) => ({
    content: event.content,
    done: event.done
  })
});
\`\`\`

## Putting It All Together

Combine the connectors in your RAGProvider:

\`\`\`typescript
<RAGProvider
  retrieveAndGenerate={retrieveAndGenerate}
  generate={generate}
  getDataSource={getDataSource}
>
  <ChatWindow />
  <AdvancedQueryField />
  <ContentDisplay />
</RAGProvider>
\`\`\`

The library will automatically handle:
- Displaying chat messages
- Rendering loaded sources (e.g., PDF previews)
- Managing streamed responses
- Error handling and display
        `
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {};
