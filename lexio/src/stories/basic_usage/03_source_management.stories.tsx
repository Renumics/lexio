import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider, ChatWindow, AdvancedQueryField, SourcesDisplay, ContentDisplay, ErrorDisplay } from '../../../lib/main';
import type { UserAction, Source, StreamChunk } from '../../../lib/types';
import { fetchSamplePDF } from './utils';


const ExampleComponent = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <LexioProvider
      onAction={(action, messages, sources, activeSources, selectedSource) => {
        // Handle user messages with streaming response
        if (action.type === 'ADD_USER_MESSAGE') {
          return {
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
            })(),
            
            // Return lightweight source objects (without data property)
            sources: Promise.resolve([
              {
                id: crypto.randomUUID(),
                title: "Example PDF Document",
                type: "pdf",
                relevance: 0.95,
                metadata: {
                  author: "Documentation Team",
                  page: 3,
                  _href: "https://arxiv.org/pdf/2005.11401",
                  _internal: "Hidden metadata with underscore prefix"
                },
                highlights: [
                  {
                    page: 3,
                    rect: {
                      top: 0.2,
                      left: 0.1,
                      width: 0.8,
                      height: 0.05
                    }
                  }
                ]
              },
              {
                id: crypto.randomUUID(),
                title: "Example Text Document",
                type: "text",
                description: "A sample text document for demonstration",
                relevance: 0.82,
                href: "https://renumics.com",
                metadata: {
                  section: "Introduction",
                  _lastUpdated: "2023-05-15"
                }
              }
            ])
          };
        }
        
        // Handle source selection with lazy loading
        if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
          console.log('Loading data for source:', action.sourceObject.title);
          
          // Simulate fetching data based on source type
          if (action.sourceObject.type === 'pdf') {
            // Return a PDF byte array (mock)
            return {
              sourceData: fetchSamplePDF(action.sourceObject.metadata?._href ?? '')
            };
          } else {
            // Return text content
            return {
              sourceData: new Promise(resolve => {
                setTimeout(() => {
                  resolve(`<div>
                    <h2>Example Content</h2>
                    <p>This content was loaded lazily when the source was selected.</p>
                    <p>In a real application, you would fetch this from your backend.</p>
                  </div>`);
                }, 1000);
              })
            };
          }
        }
        
        return undefined;
      }}
    >
      <div style={{ 
        display: 'grid',
        height: '100%',
        gridTemplateColumns: '3fr 1fr',
        gridTemplateRows: '1fr auto 200px',
        gap: '20px',
        gridTemplateAreas: `
          "chat sources"
          "input sources"
          "viewer viewer"
        `
      }}>
        <div style={{ gridArea: 'chat', minHeight: 0, overflow: 'auto' }}>
          <ChatWindow markdown={true} />
        </div>
        <div style={{ gridArea: 'input' }}>
          <AdvancedQueryField />
        </div>
        <div style={{ gridArea: 'sources', minHeight: 0, overflow: 'auto' }}>
          <SourcesDisplay showSearch={false}/>
        </div>
        <div style={{ gridArea: 'viewer', height: '200px' }}>
          <ContentDisplay />
        </div>
      </div>
      <ErrorDisplay />
    </LexioProvider>
  </div>
);

const meta = {
  title: 'Basic Usage/Source Management and Lazy Loading',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Introduction

This guide demonstrates how to implement streaming responses and effectively manage \`Source\`s in \`Lexio\`.

## Efficient Source Management

When working with \`Source\`s, it's important to consider performance and user experience:

### Lightweight Source Objects

When returning \`Source\`s from your backend, consider omitting the \`.data\` property initially to reduce network traffic:

\`\`\`typescript
// Return lightweight source objects without data
return {
  sources: Promise.resolve([
    {
      title: "Example Document",
      type: "pdf",
      description: "A sample document for demonstration", // Optional description will be shown below the title
      href: "https://example.com/document.pdf",           // Optional link to source will be shown next to the title and opens in a new tab
      relevance: 0.95,
      // data is omitted initially to reduce payload size
      metadata: {
        author: "Documentation Team",
        page: 3,                                          // Will be used from ContentDisplay when source is selected
        _internal: "Hidden metadata with underscore prefix", // Hidden from display
        _sourceId: "doc-123"                              // Hidden from display -> use for lazy loading
      }
    }
  ])
};
\`\`\`

### Source Properties

The \`Source\` object supports several properties to enhance the user experience:

**1. Description**: The optional \`description\` property provides additional context about the source  
**2. Href**: The optional \`href\` property creates a clickable link to the given URL  
**3. Relevance**: The \`relevance\` property (0-1) indicates how relevant a source is to the query  
**4. Highlights**: For PDF sources, the \`highlights\` array specifies regions to highlight  

\`\`\`typescript
{
  title: "Example Document",
  description: "A comprehensive analysis of the topic",  // Shown below the title
  href: "https://example.com/document.pdf",             // Creates a clickable link
  relevance: 0.95,                                      // Displayed as a relevance bar
  highlights: [
    {
      page: 3,
      rect: { top: 0.2, left: 0.1, width: 0.8, height: 0.05 }
    }
  ]
}
\`\`\`

### Source Metadata

The \`metadata\` property allows you to attach additional information to \`Source\`s:

**1. Display Properties**: Regular metadata properties are displayed in the SourcesDisplay component  
**2. Hidden Properties**: Properties with names starting with underscore (e.g., \`_internal\`) are hidden from display  
**3. Special Properties**: For PDF sources, the \`page\` and \`_page\` property specifies which page to display initially  

\`\`\`typescript
{
  metadata: {
    author: "Documentation Team",    // Displayed in UI
    page: 3,                         // Controls initial PDF page
    _page: 3,                        // Also controls initial PDF page!
    _internal: "Hidden metadata",    // Hidden from UI (starts with _)
    _sourceId: "doc-123"             // Can be used for internal reference
  }
}
\`\`\`

### Relevance Scores

The \`relevance\` property (0-1) indicates how relevant a source is to the query. The score is displayed as a bar in the SourcesDisplay component.

\`\`\`typescript
{
  relevance: 0.95  // 95% relevance score
}
\`\`\`

## Lazy Loading Source Content

To optimize performance, you can load source content only when needed using the \`SET_SELECTED_SOURCE\` action:

\`\`\`typescript
// In your onAction handler:
if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
  // Return a Promise that resolves to the source data
  return {
    sourceData: fetchDataForSource(action.sourceObject.metadata._sourceId)  // Use metadata for lookup
  };
}
\`\`\`

The \`sourceData\` property must be a Promise that resolves to either:
- a \`string\` for HTML, text, or markdown content, or
- a \`Uint8Array\` for PDF binary data

This allows Lexio to show a loading state while your data is being fetched.


## Using Source State in onAction

Your \`onAction\` handler receives the current state, which you can use to make decisions:

\`\`\`typescript
const onAction = (
  action: UserAction,
  messages: Message[],
  sources: Source[],          // All available sources
  activeSources: Source[],    // Currently active sources
  selectedSource: Source | null  // Currently selected source
) => {
  // Example: Use active sources to provide context for a follow-up question
  if (action.type === 'ADD_USER_MESSAGE' && activeSources.length > 0) {
    // Generate a response that references active sources
    return {
      response: generateResponseWithContext(action.message, activeSources)
    };
  }
  
  // Example: Update content when a source is selected
  if (action.type === 'SET_SELECTED_SOURCE') {
    // Load content for the selected source
    return {
      sourceData: fetchSourceContent(action.sourceId)
    };
  }
};
\`\`\`

### Try it out:

Try the interactive example to see:

**1.** Streaming responses with markdown formatting  
**2.** Source metadata display (with hidden properties)  
**3.** Lazy loading of source content when selected  
**4.** Description and href properties in action
        `
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {}; 