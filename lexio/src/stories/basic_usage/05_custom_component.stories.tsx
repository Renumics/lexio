import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider, useMessages, useSources, useStatus } from '../../../lib/main';
import { useState } from 'react';
import { Source } from '../../../lib/main';

// Custom component that demonstrates using hooks and components
const CustomSourceSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { sources, searchSources } = useSources('LexioProvider');
  const { loading } = useStatus();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchSources(searchQuery);
    }
  };

  const getSourceDisplayName = (source: Source): string => {
    if (source.title) return source.title;
    return source.id.slice(0, 8);
  };

  return (
    <div className="w-[600px] p-4 border rounded-lg shadow-sm">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search sources..."
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="space-y-3">
        {sources.map((source, index) => (
          <div key={index} className="p-4 bg-white border rounded-lg">
            <h3 className="font-medium text-gray-800">
              {getSourceDisplayName(source)}
            </h3>
            {source.type && (
              <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mt-1">
                {source.type}
              </span>
            )}
            {source.relevance !== undefined && (
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-500">Relevance:</span>
                <div className="ml-2 bg-gray-200 h-2 w-24 rounded-full">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.round(source.relevance * 100)}%` }}
                  />
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {Math.round(source.relevance * 100)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom component that shows message history
const CustomChatHistory = () => {
  const { messages, currentStream } = useMessages('LexioProvider');
  
  return (
    <div className="w-[600px] p-4 border rounded-lg shadow-sm max-h-[400px] overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Chat History</h2>
      
      <div className="space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-8' 
                : 'bg-gray-100 mr-8'
            }`}
          >
            <div className="font-medium mb-1">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div>{message.content}</div>
          </div>
        ))}
        
        {currentStream && (
          <div className="p-3 rounded-lg bg-gray-100 mr-8">
            <div className="font-medium mb-1">Assistant</div>
            <div>{currentStream.content || '...'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom component that combines features
const CustomMessageForm = () => {
  const [message, setMessage] = useState('');
  const { addUserMessage } = useMessages('LexioProvider');
  const { loading } = useStatus();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      addUserMessage(message);
      setMessage('');
    }
  };
  
  return (
    <div className="w-[600px] p-4 border rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[100px]"
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 self-end"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

// Example component that uses the custom components
const CustomComponentsExample = () => (
  <div className="space-y-6">
    <LexioProvider
      onAction={(action, messages, sources) => {
        // Handle ADD_USER_MESSAGE action
        if (action.type === 'ADD_USER_MESSAGE') {
          return {
            response: (async function* () {
              yield { content: 'I received your message: "' };
              await new Promise(resolve => setTimeout(resolve, 300));
              yield { content: action.message };
              await new Promise(resolve => setTimeout(resolve, 300));
              yield { content: '". Let me process that for you...' };
              await new Promise(resolve => setTimeout(resolve, 600));
              yield { content: ' Here is my response!', done: true };
            })(),
            sources: Promise.resolve([
              {
                id: crypto.randomUUID(),
                title: "Example Source 1",
                type: "text",
                relevance: 0.95,
                data: "<p>This is example content for source 1</p>"
              },
              {
                id: crypto.randomUUID(),
                title: "Example Source 2",
                type: "pdf",
                relevance: 0.82,
                metadata: {
                  author: "Documentation Team"
                }
              }
            ])
          };
        }
        
        // Handle SEARCH_SOURCES action
        if (action.type === 'SEARCH_SOURCES') {
          return {
            sources: Promise.resolve([
              {
                id: crypto.randomUUID(),
                title: `Search Result for "${action.query}"`,
                type: "text",
                relevance: 0.91,
                data: `<p>This is a search result for: ${action.query}</p>`
              },
              {
                id: crypto.randomUUID(),
                title: "Related Document",
                type: "markdown",
                relevance: 0.78,
                data: `# Related Information\n\nThis document relates to your search for "${action.query}"`
              }
            ])
          };
        }
        
        return undefined;
      }}
    >
      <div className="flex flex-col gap-6">
        <CustomChatHistory />
        <CustomMessageForm />
        <CustomSourceSearch />
      </div>
    </LexioProvider>
  </div>
);

const meta = {
  title: 'Basic Usage/05. Hooks and Custom Components',
  component: CustomComponentsExample,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Introduction

This guide demonstrates how to build custom UI components using \`Lexio\`'s state management hooks for reading data and
manipulating state. To use the hooks, you need to wrap your custom components in a \`LexioProvider\` component.

## Available Hooks

Lexio provides several hooks for accessing and manipulating state, which are used to build \`Lexio\`'s components and
can be used in your custom components as well.

The hooks expose the state and triggers for \`UserActions\` that are managed by \`Lexio\`'s state management system.

### useMessages

Access and manage chat messages:

\`\`\`typescript
const { 
  messages,         // Array of completed messages (Message[])
  currentStream,    // Currently streaming message (if any) (StreamChunk)
  addUserMessage,   // Function to add a user message -> dispatches AddUserMessageAction
  setActiveMessage, // Function to set the active message -> dispatches SetActiveMessageAction
  clearMessages     // Function to clear all messages -> dispatches ClearMessagesAction
} = useMessages('LexioProvider');  // To use the hook, you need to pass a component name as string to identify the source of the action
\`\`\`

When building custom components, please provide the component key 'LexioProvider' to identify the source of the action.
As of now, Lexio supports not custom component names other than \`types.ts\`s \`Component\` type.

### useSources

Access and manage sources:

\`\`\`typescript
const { 
  sources,             // Array of all sources (Source[])
  activeSources,       // Array of active sources (Source[])
  activeSourcesIds,    // Array of active source IDs (string[])
  selectedSource,      // Currently selected source (Source | null)
  selectedSourceId,    // ID of selected source (string | null)
  searchSources,       // Function to search for sources -> dispatches SearchSourcesAction
  clearSources,        // Function to clear all sources -> dispatches ClearSourcesAction
  setActiveSources,    // Function to set active sources -> dispatches SetActiveSourcesAction
  setSelectedSource,   // Function to set selected source -> dispatches SetSelectedSourceAction
  setFilterSources,    // Function to filter sources -> dispatches SetFilterSourcesAction
  resetFilterSources   // Function to reset source filters -> dispatches ResetFilterSourcesAction
} = useSources('LexioProvider');
\`\`\`

### useStatus

Access loading and error state:

\`\`\`typescript
const { 
  loading,  // Boolean indicating if any operation is loading
  error     // Error object if an error occurred
} = useStatus();
\`\`\`

## Example: Custom Source Search Component

Here's how to create a custom source search component:

\`\`\`tsx
const CustomSourceSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { sources, searchSources } = useSources('LexioProvider');
  const { loading } = useStatus();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchSources(searchQuery);
    }
  };

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search sources..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      
      {sources.map((source) => (
        <div key={source.id}>
          <h3>{source.title}</h3>
          <span>{source.type}</span>
          {source.relevance && (
            <div>Relevance: {Math.round(source.relevance * 100)}%</div>
          )}
        </div>
      ))}
    </div>
  );
};
\`\`\`

## Example: Custom Chat History Component

Here's how to create a custom chat history component:

\`\`\`tsx
const CustomChatHistory = () => {
  const { messages, currentStream } = useMessages('LexioProvider');
  
  return (
    <div>
      <h2>Chat History</h2>
      
      {messages.map((message) => (
        <div key={message.id}>
          <div>{message.role === 'user' ? 'You' : 'Assistant'}</div>
          <div>{message.content}</div>
        </div>
      ))}
      
      {currentStream && (
        <div>
          <div>Assistant</div>
          <div>{currentStream.content || '...'}</div>
        </div>
      )}
    </div>
  );
};
\`\`\`

## Example: Custom Message Form

Here's how to create a custom message input form:

\`\`\`tsx
const CustomMessageForm = () => {
  const [message, setMessage] = useState('');
  const { addUserMessage } = useMessages('LexioProvider');
  const { loading } = useStatus();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      addUserMessage(message);
      setMessage('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
      />
      <button type="submit" disabled={loading || !message.trim()}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};
\`\`\`

## Putting It All Together

You can combine these custom components within a LexioProvider:

\`\`\`tsx
const App = () => (
  <LexioProvider onAction={handleAction}>
    <CustomChatHistory />
    <CustomMessageForm />
    <CustomSourceSearch />
  </LexioProvider>
);
\`\`\`

### Interactive Example

The example below demonstrates these custom components working together:
`,
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CustomComponentsExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {}; 