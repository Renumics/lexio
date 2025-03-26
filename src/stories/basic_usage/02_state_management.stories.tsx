import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider, ChatWindow, AdvancedQueryField, SourcesDisplay, ContentDisplay, ErrorDisplay } from '../../../lib/main';
import * as DocBlocks from "@storybook/blocks";
import { UserAction } from '../../../lib/types';

// todo: add an overview of the state management
interface ExampleProps {
  variant: 'text' | 'reference' | 'mixed';
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

const SourceTypesExample = ({ variant }: ExampleProps) => {
  // Define a simple onAction handler to fix the linter error
  const handleAction = (action: UserAction) => {
    return {};
  };

  return (
    <BaseLayout>
      <LexioProvider onAction={handleAction}>
        <SharedLayout />
        <ErrorDisplay />
      </LexioProvider>
    </BaseLayout>
  );
};

type Story = StoryObj<typeof SourceTypesExample>;

const meta = {
  title: 'Basic Usage/State Management',
  component: SourceTypesExample,
  parameters: {
    layout: 'centered',
    docs: {
      page: () => {
        return (
          <>
            <DocBlocks.Title/>
            <DocBlocks.Description/>
          </>
        )
      },
      description: {
        component: `
## Introduction

This guide provides a comprehensive overview of Lexio's state management system, which is the foundation of the library's reactive UI and action handling capabilities. Understanding how state works in Lexio will help you build more effective and responsive RAG interfaces.

### What You'll Learn

In this guide, we cover:

- **Core State Structure**: The key state elements managed by Lexio and how they relate to each other
- **Component State Reflection**: How each Lexio component automatically reflects relevant parts of the state
- **State Types**: Detailed information about Message and Source types that form the foundation of the state
- **Action Handler Pattern**: How the onAction handler processes user interactions and updates state
- **Blocking Actions**: Which actions block the UI during processing and how the loading state system works
- **Follow-Up Actions**: How to chain multiple actions together to create sophisticated workflows

Whether you're building a simple chat interface or a complex document-based RAG system, understanding these concepts will help you leverage Lexio's full capabilities.

## Lexio's State and interaction with UI components

This guide explains how state is managed in the \`Lexio\` library and how components reflect and interact with this state.

## Core State Overview

Lexio manages several key pieces of state internally:

\`\`\`typescript
// Core state managed by LexioProvider
{
  messages: Message[];           // Chat history
  sources: Source[];             // All available sources
  activeSources: Source[];       // Sources currently active in the conversation (via AdvancedQueryField)
  selectedSource: Source | null; // Currently selected source for viewing (via SourcesDisplay)
  loading: boolean;              // Global loading state
  error: Error | null;           // Global error state
}
\`\`\`

## State Reflection in Components

Each Lexio component automatically reflects the relevant state:

### ChatWindow

Displays the \`messages\` array, showing the conversation history between the user and AI.

\`\`\`typescript
// ChatWindow reflects the messages state
<ChatWindow /> // Automatically displays all messages
\`\`\`

### SourcesDisplay

Shows the \`sources\` array, highlighting \`activeSources\` and the \`selectedSource\`.

\`\`\`typescript
// SourcesDisplay reflects sources, activeSources, and selectedSource
<SourcesDisplay /> // Shows all sources with proper highlighting
\`\`\`

### ContentDisplay

Shows the content of the \`selectedSource\` when available.

\`\`\`typescript
// ContentDisplay shows the selected source's content
<ContentDisplay /> // Renders the appropriate viewer for the selected source
\`\`\`

## Core State Types

### Message

The \`Message\` type represents entries in the conversation:

\`\`\`typescript
interface Message {
  readonly id: UUID;          // Unique identifier
  role: 'user' | 'assistant'; // Who sent the message
  content: string;            // Message content
}
\`\`\`

### Source

The \`Source\` type represents reference materials:

\`\`\`typescript
interface Source {
  readonly id: UUID;                            // Unique identifier
  title: string;                                // Display title
  type: "text" | "pdf" | "markdown" | "html";   // Content type
  relevance?: number;                           // Relevance score (0-1)
  href?: string;                                // Optional href to display a link to the source in the SourcesDisplay component.
  data?: string | Uint8Array;                   // Optional data to display in the ContentDisplay component.
  metadata?: Record<string, any>;               // Additional metadata
  highlights?: PDFHighlight[];                  // Highlight annotations (for PDFs)
}
\`\`\`

## Modifying State with onAction

The \`onAction\` handler is the primary way to modify \`Lexio\`'s state. When actions occur, your \`ActionHandler\` can return objects that update specific parts of the state:

\`\`\`typescript
// Example action handler
const handleAction = (
  action: UserAction,
  messages: Message[],
  sources: Source[],
  activeSources: Source[],
  selectedSource: Source | null
): ActionHandlerResponse | undefined => {
  
  if (action.type === 'ADD_USER_MESSAGE') {
    // Return an object that updates both response and sources
    return {
      // This updates messages state with an assistant response
      response: Promise.resolve("Here's my answer..."),
      
      // This updates the sources state with new sources
      sources: Promise.resolve([
        { id: crypto.randomUUID(), title: "New Source", type: "text" }
      ])
    };
  }
  
  if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
    // This updates the data for a specific source
    return { 
      sourceData: Promise.resolve("Source content loaded on demand") 
    };
  }
  
  // Always return an empty object to indicate no state changes
  return {};
};
\`\`\`

## State Flow Example

**1.** User sends a message via \`AdvancedQueryField\`.  
**2.** \`ADD_USER_MESSAGE\` action is dispatched.  
**3.** Your \`ActionHandler\` which is passed as \`onAction\` to \`LexioProvider\` processes the action. The \`ActionHandler\` is a function that takes the action and the current state and returns an \`ActionHandlerResponse\` object.  
**4.** Handler returns a \`ActionHandlerResponse\` object which is used to update the state, in this case a \`AddUserMessageActionResponse\` object is returned.  
**5.** Lexio updates internal state.  
**6.** A re-render of the \`ChatWindow\` component is triggered since the state of messages has changed -> The \`ChatWindow\` component shows the new message.  
**7.** A re-render of the \`SourcesDisplay\` component is triggered since the state of sources has changed -> The \`SourcesDisplay\` component shows the new sources.  
## Blocking Actions and Loading State

Lexio implements a sophisticated loading state system that prevents certain actions from being processed while others are in progress. This ensures a consistent user experience and prevents race conditions.

### Which Actions are Blocking?

The following actions are considered "blocking" because they typically involve asynchronous operations that may take time to complete:

\`\`\`typescript
// Blocking actions
'ADD_USER_MESSAGE'  // When a user sends a message (typically triggers AI generation)
'SEARCH_SOURCES'    // When searching for sources (typically involves API calls)
'CLEAR_MESSAGES'    // When clearing all messages (may involve cleanup operations)
\`\`\`

Non-blocking actions are typically UI-related and can be processed immediately:

\`\`\`typescript
// Non-blocking actions
'SET_SELECTED_SOURCE'   // Selecting a source to view
'SET_ACTIVE_SOURCES'    // Changing which sources are active
'SET_FILTER_SOURCES'    // Applying filters to sources
'RESET_FILTER_SOURCES'  // Clearing source filters
\`\`\`

#### Accessing Loading State

You can access the current loading state using the \`useStatus\` hook:

\`\`\`typescript
import { useStatus } from 'lexio';

const MyComponent = () => {
  const { loading, error } = useStatus();
  
  return (
    <div>
      {loading ? 'Processing...' : 'Ready'}
      {error && <div className="error">{error}</div>}
    </div>
  );
};
\`\`\`

This loading state is automatically used by Lexio components to provide appropriate feedback to users.

## Customizing the flow

You can customize the effect of the user action by returning a custom response to any of the actions, e.g. returning \`{}\` to prevent any state updates at all.
The logic of the \`ActionHandler\` is entirely up to you.

### Follow-Up Actions

Follow-up actions are a powerful feature that allows you to chain multiple actions together in a controlled sequence. When you return a \`followUpAction\` in your response, Lexio will automatically dispatch this action after the current action has been fully processed.

#### How Follow-Up Actions Work

**1.** The initial action is dispatched and processed by your \`onAction\` handler  
**2.** Your handler returns a response that includes a \`followUpAction\` property  
**3.** Lexio completes processing the initial action (updating state, UI, etc.)  
**4.** Once the initial action is complete, Lexio automatically dispatches the follow-up action  
**5.** The follow-up action is processed by your \`onAction\` handler just like any other action  
**6.** This process can continue with multiple chained actions

#### When to Use Follow-Up Actions

Follow-up actions are particularly useful in these scenarios:

**1. Sequential Operations**: When one action must complete before another begins  
**2. Conditional Workflows**: Triggering different actions based on the results of previous ones  
**3. Multi-step Processes**: Breaking complex operations into discrete steps  
**4. Cleanup Operations**: Performing cleanup after a main action completes  
**5. UI Transitions**: Creating smooth transitions between different UI states  

#### Examples of Follow-Up Actions

**Example 1: Search after message response**

\`\`\`typescript
// After receiving a response to a user message, automatically search for related sources
const handleAction = (action: UserAction) => {
  if (action.type === 'ADD_USER_MESSAGE') {
    const aiResponse = "Here's information about climate change...";
    
    return {
      response: Promise.resolve(aiResponse),
      // After the response is processed, automatically search for related sources
      followUpAction: {
        type: 'SEARCH_SOURCES',
        query: 'climate change evidence',
        source: 'ChatWindow'
      }
    };
  }
  
  return {};
};
\`\`\`

**Example 2: Multi-step source processing**

\`\`\`typescript
// Process sources in multiple steps
const handleAction = (action: UserAction, messages: Message[], sources: Source[]) => {
  if (action.type === 'SEARCH_SOURCES') {
    return {
      sources: fetchInitialSources(action.query),
      // After sources are loaded, activate the most relevant ones
      followUpAction: {
        type: 'SET_ACTIVE_SOURCES',
        sourceIds: ['source-1', 'source-2'],
        source: 'SourcesDisplay'
      }
    };
  }
  
  if (action.type === 'SET_ACTIVE_SOURCES') {
    // After setting active sources, select the first one for viewing
    return {
      followUpAction: {
        type: 'SET_SELECTED_SOURCE',
        sourceId: action.sourceIds[0],
        source: 'SourcesDisplay'
      }
    };
  }
  
  return {};
};
\`\`\`
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['text', 'reference', 'mixed'],
      description: 'Type of source to demonstrate',
      defaultValue: 'text'
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof SourceTypesExample>;

export default meta;

export const Docs: Story = {
  args: {
    variant: 'reference'
  }
}; 