import React, { useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import {
  RAGProvider,
  ChatWindow,
  AdvancedQueryField,
  SourcesDisplay,
  ContentDisplay,
  ErrorDisplay,
  createTheme,
} from '../../lib/main';

import type {
  UserAction,
  Message,
  Source,
  ActionHandlerResponse,
} from '../../lib/state/rag-state';

//
// 1. Create a custom theme (optional)
//
const customTheme = createTheme({
  colors: {
    primary: '#1E88E5',
    secondary: '#64B5F6',
  },
});

//
// 2. Define a simple onAction function:
//    - When the user sends a message (ADD_USER_MESSAGE),
//      we stream back a short response.
//    - We return a sample list of sources as a Promise.
//    - When the user triggers a search (SEARCH_SOURCES),
//      we return that same list of sources.
//
function useSimpleOnAction() {
  return useCallback((
    action: UserAction,
    messages: Message[],
    sources: Source[],
    activeSources: Source[],
    selectedSource: Source | null
  ): ActionHandlerResponse | Promise<ActionHandlerResponse> | undefined => {

    // Example in-memory source(s)
    const mockSources: Source[] = [
      {
        title: 'Example Source',
        type: 'text',
        data: 'Here is some relevant text from the example source.',
      }
    ];

    // If the user added a new message in the chat
    if (action.type === 'ADD_USER_MESSAGE') {
      // Return a streaming response + a list of sources
      return {
        response: (async function* () {
          yield { content: 'Thanks for your question... ' };
          await new Promise(resolve => setTimeout(resolve, 600));
          yield { content: 'Let me think for a moment... ' };
          await new Promise(resolve => setTimeout(resolve, 600));
          yield { content: 'Here is a brief answer based on the sources above!', done: true };
        })(),
        sources: Promise.resolve(mockSources),
      };
    }

    // If the user triggered a source search
    if (action.type === 'SEARCH_SOURCES') {
      // Return the same mock sources asynchronously
      return {
        sources: Promise.resolve(mockSources),
      };
    }

    // Default case: no special handling
    return undefined;
  }, []);
}

//
// 3. Use the RAGProvider with onAction in your main component:
//
const ExampleNewUsageComponent = () => {
  const onAction = useSimpleOnAction();

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <RAGProvider onAction={onAction} theme={customTheme}>
      <div className="flex flex-row gap-4 w-full h-full p-2">
          {/* Left column: Chat + Query */}
          <div className="flex flex-col w-1/3 h-full gap-2">
            <div className="flex-1 min-h-0 overflow-auto">
              <ChatWindow />
            </div>
            <div className="h-24">
              <AdvancedQueryField />
            </div>
          </div>

          {/* Middle column: Sources */}
          <div className="w-1/3 h-full">
            <SourcesDisplay />
          </div>

          {/* Right column: Content details */}
          <div className="w-1/3 h-full">
            <ContentDisplay />
          </div>

          {/* Error display at the bottom */}
          <ErrorDisplay />
        </div>
      </RAGProvider>
    </div>
  );
};

//
// 4. Export Storybook configuration
//
const meta = {
  title: 'Tutorial/01. Basic Usage (Action Handler)',
  component: ExampleNewUsageComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Understanding the Action Handler Pattern

The core of RAG UI is built around a simple yet powerful action handler pattern that processes user interactions and updates the UI state accordingly.

## 1. Action Handler Basics

The action handler is a function that receives user actions and returns appropriate responses:

\`\`\`typescript
const onAction = (action: UserAction, messages: Message[], sources: Source[], ...) => {
  if (action.type === 'ADD_USER_MESSAGE') {
    return {
      response: streamingResponse(),  // AI response
      sources: Promise.resolve(sources)  // Retrieved sources
    };
  }
}
\`\`\`

## 2. Core Actions

The system responds to several key actions:

- \`ADD_USER_MESSAGE\`: When users send messages (returns response + sources)
- \`SEARCH_SOURCES\`: When users search for sources (returns sources)
- \`CLEAR_MESSAGES\`: Reset chat history
- \`SET_ACTIVE_SOURCES\`: Update active source selection
- And more (see \`rag-state.ts\` for full list)

## 3. Action Handler Returns

Each action expects specific return values:

- For chat messages: \`{ response, sources }\`
- For searches: \`{ sources }\`
- For state updates: Various state modifiers

Check \`rag-state.ts\` for detailed type definitions and \`App.tsx\` for implementation examples.

## Example Implementation

This story demonstrates a basic action handler that:
- Streams AI responses for user messages
- Returns mock sources for searches
- Shows different response patterns based on interaction count

Try it out below and explore the source code for more details.
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleNewUsageComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {};
