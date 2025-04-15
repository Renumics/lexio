import React, { useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import {
  LexioProvider,
  ChatWindow,
  AdvancedQueryField,
  SourcesDisplay,
  ContentDisplay,
  ErrorDisplay,
  createTheme,
} from '../../../lib/main';

import type { ActionHandlerResponse } from '../../../lib/types';
import type {
    Message,
    Source
} from '../../../lib/types';
import type { UserAction } from "../../../lib/types";

// 1. Create a custom theme (optional)
const customTheme = createTheme({
  colors: {
    primary: '#1E88E5',
    secondary: '#64B5F6',
  },
});


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
    return {};
  }, []);
}

const BaseLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '100%', maxWidth: '1200px', height: '800px', margin: '0 auto' }}>
    {children}
  </div>
);

const SharedLayout = () => (
  <div style={{ 
    display: 'grid',
    height: '100%',
    gridTemplateColumns: '3fr 1fr',
    gridTemplateRows: '1fr auto 300px',
    gap: '20px',
    gridTemplateAreas: `
      "chat sources"
      "input sources"
      "viewer viewer"
    `
  }}>
    <div style={{ gridArea: 'chat', minHeight: 0, overflow: 'auto' }}>
      <ChatWindow />
    </div>
    <div style={{ gridArea: 'input' }}>
      <AdvancedQueryField />
    </div>
    <div style={{ gridArea: 'sources', minHeight: 0, overflow: 'auto' }}>
      <SourcesDisplay />
    </div>
    <div style={{ gridArea: 'viewer', height: '300px' }}>
      <ContentDisplay />
    </div>
  </div>
);

// 3. Use the RAGProvider with onAction in your main component:
const ExampleNewUsageComponent = () => {
  const onAction = useSimpleOnAction();

  return (
    <div style={{ width: '100%', height: '800px' }}>
      <LexioProvider onAction={onAction} theme={customTheme}>
        <BaseLayout>
          <SharedLayout />
        </BaseLayout>
      </LexioProvider>
    </div>
  );
};

// 4. Export Storybook configuration
const meta = {
  title: 'Basic Usage/The onAction() function',
  component: ExampleNewUsageComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Understanding the Action Handler Pattern

The core of \`Lexio\` is built around a simple yet powerful \`ActionHandler\` pattern that processes user interactions and updates the UI state accordingly.
The \`onAction()\` function is the main entry point for this pattern. It is a function that receives user actions and returns appropriate responses.

## 1. Action Handler Basics

The \`onAction()\` function is a function that receives the user action \`action\`, the current messages history \`messsages\`, the current sources \`sources\`, 
and returns an appropriate respons by returning an \`ActionHandlerResponse\` object that satisfies the type of the action.

\`\`\`typescript
const onAction = (action: UserAction, messages: Message[], sources: Source[], ...) => {
  if (action.type === 'ADD_USER_MESSAGE') {
    return {
      response: streamingResponse(),  // AI response
      sources: Promise.resolve(sources)  // Retrieved sources
    } satisfies AddUserMessageActionResponse;
  }
}
\`\`\`

In the example above, the \`onAction()\` function checks if the action is an \`ADD_USER_MESSAGE\`. If it is, it returns an \`ActionHandlerResponse\` object that satisfies the \`AddUserMessageActionResponse\` type.
Depending on the action type, different properties can be present in the \`ActionHandlerResponse\` object.

## 2. Core Actions

The system responds to these key actions:

- \`ADD_USER_MESSAGE\`: When users send messages (accepts response, sources, setUserMessage as return values)
- \`SEARCH_SOURCES\`: When users search for sources (accepts sources as return value)
- \`CLEAR_MESSAGES\`: Resets the current chat history
- \`SET_ACTIVE_MESSAGE\`: Change which message is currently active
- \`SET_ACTIVE_SOURCES\`: Update active source selection
- \`SET_SELECTED_SOURCE\`: Select a specific source to be displayed in the \`ContentDisplay\` component (accepts sourceData as return value)
- \`CLEAR_SOURCES\`: Remove all sources from the current context
- \`SET_FILTER_SOURCES\`: Apply filters to the source list
- \`RESET_FILTER_SOURCES\`: Clear all source filters

Each action type has specific return values defined in the \`allowedActionReturnValues\` object in \`rag-state.ts\`.

\`\`\`typescript
const allowedActionReturnValues: Record<UserAction['type'], string[]> = {
    ADD_USER_MESSAGE: ['response', 'sources', 'setUserMessage', 'setUserMessageId', 'setAssistantMessageId', 'followUpAction'],
    SET_ACTIVE_MESSAGE: ['messageId', 'followUpAction'],
    CLEAR_MESSAGES: ['followUpAction'],
    SEARCH_SOURCES: ['sources', 'followUpAction'],
    CLEAR_SOURCES: ['followUpAction'],
    SET_ACTIVE_SOURCES: ['followUpAction'],
    SET_SELECTED_SOURCE: ['sourceData', 'followUpAction'],
    SET_FILTER_SOURCES: ['followUpAction'],
    RESET_FILTER_SOURCES: ['followUpAction']
};
\`\`\`

Learn more about the ActionHandler pattern and followUpActions in X.

## Example Implementation

This story demonstrates a basic action handler that:
- Streams AI responses for user messages
- Returns mock sources for searches
- Shows different response patterns based on interaction count

\`\`\`tsx
const ExampleImplementation = () => {
  const onAction = (action: UserAction, messages: Message[], sources: Source[], ...) => {
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
    return {};
  };

  return (
    <LexioProvider onAction={onAction}>
      <ChatWindow />
      <AdvancedQueryField />
      <SourcesDisplay />
      <ContentDisplay />
      <ErrorDisplay />
    </LexioProvider>
  );
};
\`\`\`

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
