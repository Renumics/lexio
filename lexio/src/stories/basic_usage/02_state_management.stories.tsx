import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { LexioProvider, ChatWindow, AdvancedQueryField, SourcesDisplay, ContentDisplay, ErrorDisplay, useMessages } from '../../../lib/main';
import { UserAction, ActionHandlerResponse, Source, Message } from '../../../lib/types';
import * as DocBlocks from "@storybook/blocks";

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

// Helper component to initialize the demo with a message
const DataInitializer = () => {
  const { addUserMessage } = useMessages('LexioProvider');
  
  useEffect(() => {
    // Add an initial message to trigger the demo
    setTimeout(() => {
      addUserMessage("Tell me about different source types");
    }, 500);
  }, []);
  
  return null;
};

// Sample PDF bytes (mock)
const pdfBytes = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 53, 10]); // "%PDF-1.5" header

const SourceTypesExample = ({ variant }: ExampleProps) => {
  // Create different source examples based on the variant
  const textSource: Source = {
    id: crypto.randomUUID(),
    title: "RAG Documentation",
    type: "text",
    relevance: 0.95,
    data: `<div class="content">
      <h2>Introduction to RAG Systems</h2>
      <p>Retrieval Augmented Generation (RAG) is a technique that enhances large language models by providing them with relevant context from a knowledge base.</p>
      <p>This approach combines the benefits of retrieval-based and generation-based methods.</p>
    </div>`,
    metadata: {
      section: "Introduction",
      author: "Technical Team",
      _internal: "This metadata is hidden from display"
    }
  };

  const pdfSource: Source = {
    id: crypto.randomUUID(),
    title: "RAG Whitepaper",
    type: "pdf",
    relevance: 0.95,
    // Note: data is not provided initially - it will be loaded on demand
    metadata: {
      title: "Understanding RAG Systems",
      page: 1,
      author: "Research Team",
      date: "2023-05-15"
    },
    highlights: [{
      page: 1,
      rect: { top: 100, left: 100, width: 400, height: 100 }
    }]
  };

  const markdownSource: Source = {
    id: crypto.randomUUID(),
    title: "Implementation Guide",
    type: "markdown",
    relevance: 0.88,
    data: `# RAG Implementation Guide
    
## Setup
1. Prepare your document collection
2. Index your documents
3. Configure retrieval parameters
    `,
    metadata: {
      section: "Setup",
      difficulty: "Intermediate",
      lastUpdated: "2024-01-10"
    }
  };

  const htmlSource: Source = {
    id: crypto.randomUUID(),
    title: "Best Practices",
    type: "html",
    relevance: 0.82,
    data: `<div class="content">
      <h2>Quick Tips</h2>
      <ul>
        <li>Always validate your data sources</li>
        <li>Monitor retrieval performance</li>
        <li>Keep your knowledge base updated</li>
      </ul>
    </div>`,
    metadata: {
      type: "Tips",
      lastUpdated: "2024-03-20",
      category: "Best Practices"
    }
  };

  // Action handler for the LexioProvider
  const handleAction = (
    action: UserAction,
    messages: Message[],
    sources: Source[],
    activeSources: Source[],
    selectedSource: Source | null
  ): ActionHandlerResponse | undefined => {
    // Handle user messages
    if (action.type === 'ADD_USER_MESSAGE') {
      // Return different sources based on the selected variant
      switch (variant) {
        case 'text':
          return {
            response: Promise.resolve("Here's some information about RAG systems from our documentation. The text source contains HTML content that can be displayed directly in the ContentDisplay component."),
            sources: Promise.resolve([textSource])
          };
        case 'reference':
          return {
            response: Promise.resolve("I found a relevant section in our whitepaper. This PDF source will be loaded on demand when you select it. Notice how the metadata includes page information and the source has highlight annotations."),
            sources: Promise.resolve([pdfSource])
          };
        case 'mixed':
          return {
            response: Promise.resolve("I've found relevant information from multiple sources. This example demonstrates how Lexio can handle different source types simultaneously. Try selecting each source to see how they're displayed differently."),
            sources: Promise.resolve([pdfSource, markdownSource, htmlSource, textSource])
          };
      }
    }
    
    // Handle source selection to load source data on demand
    if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
      console.log("Loading source data for:", action.sourceObject.title, "of type:", action.sourceObject.type);
      
      // For PDF sources, return the PDF bytes
      if (action.sourceObject.type === 'pdf') {
        // In a real application, you would fetch the PDF data from a server
        // For example: return { sourceData: fetchPdfFromServer(action.sourceObject.id) }
        return { 
          sourceData: Promise.resolve(pdfBytes) 
        };
      }
      
      // For other sources, return the data that's already in the source
      // If the data wasn't included in the source, you would fetch it here
      if (!action.sourceObject.data) {
        // In a real application: return { sourceData: fetchSourceDataFromServer(action.sourceObject.id) }
        return {
          sourceData: Promise.resolve(`No data available for ${action.sourceObject.title}`)
        };
      }
      
      return { 
        sourceData: Promise.resolve(action.sourceObject.data) 
      };
    }
    
    // Handle other action types as needed
    return undefined;
  };

  return (
    <BaseLayout>
      <LexioProvider onAction={handleAction}>
        <DataInitializer />
        <SharedLayout />
        <ErrorDisplay />
      </LexioProvider>
    </BaseLayout>
  );
};

type Story = StoryObj<typeof SourceTypesExample>;

const meta = {
  title: 'Basic Usage/02. State Management',
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

## Customizing the flow

You can customize the effect of the user action by returning a custom response to any of the actions, e.g. returning \`{}\` to prevent any state updates at all.
The logic of the \`ActionHandler\` is entirely up to you.

You can also return a follow up action to be dispatched after the state has been updated. 
This is useful for example to trigger a new search after the user has seen the answer.

The \`followUpAction\` is a \`UserAction\` object that will be dispatched after the state has been updated.

\`\`\`typescript
// Example of a custom response
const handleAction = (action: UserAction): ActionHandlerResponse | undefined => {
  return {
    ... // Return a custom response as usual
    followUpAction: {
      type: 'SEARCH_SOURCES',  // See UserAction in types.ts for all possible actions
      query: "Here's my answer..."
    }
  };  
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