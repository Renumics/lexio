import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, useRAGSources, useRAGStatus } from '../../lib/main';
import { useState } from 'react';
import { RetrievalResult, SourceReference, TextContent } from '../../lib/main';

// Type guard to check if source is SourceReference
const isSourceReference = (source: RetrievalResult): source is SourceReference => {
  return 'sourceReference' in source;
};

// Type guard to check if source is TextContent
const isTextContent = (source: RetrievalResult): source is TextContent => {
  return 'text' in source;
};

// Custom component that demonstrates using hooks and components
const CustomSourceSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { sources, retrieveSources } = useRAGSources();
  const { loading } = useRAGStatus();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      retrieveSources(searchQuery);
    }
  };

  const getSourceDisplayName = (source: RetrievalResult): string => {
    if (source.sourceName) return source.sourceName;
    if (isSourceReference(source)) return source.sourceReference;
    if (isTextContent(source)) return source.text.slice(0, 50);
    return '';
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
            {isSourceReference(source) && source.type && (
              <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mt-1">
                {source.type}
              </span>
            )}
            {source.relevanceScore !== undefined && (
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-500">Relevance:</span>
                <div className="ml-2 bg-gray-200 h-2 w-24 rounded-full">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.round(source.relevanceScore * 100)}%` }}
                  />
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {Math.round(source.relevanceScore * 100)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Example component that uses the custom component
const ExampleComponent = () => (
  <div style={{ width: '600px', height: '400px' }}>
    <RAGProvider
      retrieveAndGenerate={(messages) => {
        // Example implementation returning promises
        return {
          sources: Promise.resolve([
            {
              sourceReference: "document1.pdf",
              type: "pdf" as const,
              metadata: {
                title: "First Document"
              },
              relevanceScore: 0.95,
            },
            {
              sourceReference: "document2.pdf",
              type: "pdf" as const,
              metadata: {
                title: "Second Document"
              },
              relevanceScore: 0.75,
            }
          ]),
          response: Promise.resolve("This is a sample response based on the retrieved documents.")
        };
      }}
      retrieve={async (query: string) => {
        // Example implementation of source retrieval
        return [
          {
            sourceReference: "search-result1.pdf",
            type: "pdf" as const,
            metadata: {
              title: "Search Result 1"
            },
            relevanceScore: 0.92,
          },
          {
            sourceReference: "search-result2.pdf",
            type: "pdf" as const,
            metadata: {
              title: "Search Result 2"
            },
            relevanceScore: 0.85,
          }
        ];
      }}
    >
      <CustomSourceSearch />
    </RAGProvider>
  </div>
);

const meta = {
  title: 'Getting Started/08. Building Custom Components',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Building Custom Components

Now that you understand the basics of RAG UI, let's explore how to build custom components using the provided hooks.
This guide will show you how to:
- Use the RAG UI hooks to access state and functionality
- Create custom search interfaces
- Handle loading states and errors
- Display sources with metadata and relevance scores

## Available Hooks

The RAG UI provides several hooks for building custom components:

\`\`\`typescript
// For managing messages and chat
const { addMessage, messages, currentStream } = useRAGMessages();

// For managing sources
const { 
  sources,              // Retrieved sources
  currentSources,       // Currently selected sources
  currentSourceContent, // Content of active source
  activeSourceIndex,    // Index of active source
  setActiveSourceIndex, // Function to set active source
  retrieveSources      // Function to retrieve sources
} = useRAGSources();

// For managing status
const { 
  workflowMode,  // Current workflow mode
  loading,       // Loading state
  error          // Error state
} = useRAGStatus();
\`\`\`

## Provider Configuration

To use source retrieval functionality, you need to configure the RAGProvider with a retrieve function:

\`\`\`tsx
<RAGProvider
  retrieve={async (query: string) => {
    // Implement your source retrieval logic here
    return [
      {
        sourceReference: "document.pdf",
        type: "pdf",
        metadata: {
          title: "Document Title"
        },
        relevanceScore: 0.95
      }
    ];
  }}
  // ... other props
>
  {/* Your components */}
</RAGProvider>
\`\`\`

## Example Implementation

Here's how to create a custom source search component:

\`\`\`tsx
const CustomSourceSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { sources, retrieveSources } = useRAGSources();
  const { loading } = useRAGStatus();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      retrieveSources(searchQuery);
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
      {sources.map((source, index) => (
        <div key={index}>
          {/* Display source information */}
        </div>
      ))}
    </div>
  );
};
\`\`\`

Try it out:
1. Enter a search query and press Enter or click Search
2. Notice how the loading state is handled
3. See how sources are displayed with their metadata and relevance scores

Next, move on to explore more advanced features and customizations in the Examples section.
`,
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {}; 