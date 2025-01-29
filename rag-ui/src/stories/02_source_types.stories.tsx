import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField, SourcesDisplay, ContentDisplay, ErrorDisplay } from '../../lib/main';
import type { Message, RetrievalResult, GetDataSourceResponse } from '../../lib/main';

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
  const getSourcesAndResponse = () => {
    switch (variant) {
      case 'text':
        return {
          sources: Promise.resolve([
            {
              text: `<div class="content">
                <h2>Introduction to RAG Systems</h2>
                <p>Retrieval Augmented Generation (RAG) is a technique that enhances large language models by providing them with relevant context from a knowledge base.</p>
                <p>This approach combines the benefits of retrieval-based and generation-based methods.</p>
              </div>`,
              sourceName: "RAG Documentation",
              relevanceScore: 0.95,
              metadata: {
                section: "Introduction",
                author: "Technical Team"
              }
            }
          ]),
          response: Promise.resolve("Here's some information about RAG systems from our documentation...")
        };
      case 'reference':
        return {
          sources: Promise.resolve([
            {
              sourceReference: "example.pdf",
              sourceName: "RAG Whitepaper",
              type: "pdf" as const,
              relevanceScore: 0.95,
              metadata: {
                title: "Understanding RAG Systems",
                page: 1,
                author: "Research Team"
              },
              highlights: [{
                page: 1,
                rect: { top: 100, left: 100, width: 400, height: 100 },
                comment: "Key concept definition"
              }]
            }
          ]),
          response: Promise.resolve("I found a relevant section in our whitepaper...")
        };
      case 'mixed':
        return {
          sources: Promise.resolve([
            {
              sourceReference: "example.pdf",
              sourceName: "RAG Whitepaper",
              type: "pdf" as const,
              relevanceScore: 0.95,
              metadata: {
                title: "Understanding RAG Systems",
                page: 1,
                author: "Research Team"
              },
              highlights: [{
                page: 1,
                rect: { top: 100, left: 100, width: 400, height: 100 },
                comment: "Key concept definition"
              }]
            },
            {
              sourceReference: "implementation_guide.html",
              sourceName: "Implementation Guide",
              type: "html" as const,
              relevanceScore: 0.88,
              metadata: {
                section: "Setup",
                difficulty: "Intermediate"
              }
            },
            {
              text: `<div class="content">
                <h2>Quick Tips</h2>
                <ul>
                  <li>Always validate your data sources</li>
                  <li>Monitor retrieval performance</li>
                  <li>Keep your knowledge base updated</li>
                </ul>
              </div>`,
              sourceName: "Best Practices",
              relevanceScore: 0.82,
              metadata: {
                type: "Tips",
                lastUpdated: "2024-03-20"
              }
            }
          ]),
          response: Promise.resolve("I've found relevant information from multiple sources...")
        };
    }
  };

  return (
    <BaseLayout>
      <RAGProvider
        retrieveAndGenerate={() => getSourcesAndResponse()}
        getDataSource={variant !== 'text' ? (source): GetDataSourceResponse => {
          if (source.type === 'pdf') {
            return fetch('https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf')
              .then(response => response.arrayBuffer())
              .then(buffer => ({
                type: 'pdf',
                content: new Uint8Array(buffer),
                metadata: source.metadata,
                highlights: source.highlights
              }));
          } else if (source.type === 'html') {
            return Promise.resolve({
              type: 'html',
              content: `
                <div style="padding: 20px; font-family: system-ui;">
                  <h1>RAG Implementation Guide</h1>
                  <h2>Setup Instructions</h2>
                  <p>Follow these steps to implement a RAG system in your application:</p>
                  <ol>
                    <li>Set up your document store</li>
                    <li>Implement the retrieval mechanism</li>
                    <li>Configure the generation model</li>
                    <li>Connect the components</li>
                  </ol>
                  <p>For more details, refer to the API documentation.</p>
                </div>
              `,
              metadata: source.metadata
            });
          }
          return Promise.reject(new Error('Unsupported type'));
        } : undefined}
      >
        <SharedLayout />
        <ErrorDisplay />
      </RAGProvider>
    </BaseLayout>
  );
};

type Story = StoryObj<typeof SourceTypesExample>;

const meta = {
  title: 'Tutorial/02. Source Types',
  component: SourceTypesExample,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Source Types

Now that you understand the basics, let's explore different types of sources that can be used in the retrieval results.
This guide will show you how to:
- Use direct text content for simple snippets
- Handle PDF and HTML file references
- Combine different source types in a single response
- Add metadata and highlights to sources

## Text Sources

The simplest form is direct text content included in the retrieval result. This is useful for small snippets or when content is already available.

\`\`\`tsx
// Example of using text content directly
<RAGProvider
  retrieveAndGenerate={(messages) => ({
    sources: Promise.resolve([
      {
        text: "<div><h2>Introduction to RAG</h2><p>RAG enhances LLMs with context...</p></div>",
        sourceName: "RAG Documentation",
        relevanceScore: 0.95,
        metadata: {
          section: "Introduction",
          author: "Technical Team"
        }
      }
    ]),
    response: Promise.resolve("Here's what I found in the documentation...")
  })}
>
  <ChatWindow />
  <SourcesDisplay />
  <ContentDisplay />
</RAGProvider>
\`\`\`

## Reference Sources

For larger documents like PDFs or HTML files, use reference sources that are loaded on demand. These are particularly useful for:
- Large documents that shouldn't be included directly in the response
- Content that needs special rendering (like PDFs)
- Documents that might be referenced multiple times

\`\`\`tsx
// Example of using PDF reference
<RAGProvider
  retrieveAndGenerate={(messages) => ({
    sources: Promise.resolve([
      {
        sourceReference: "whitepaper.pdf",
        sourceName: "RAG Whitepaper",
        type: "pdf" as const,
        relevanceScore: 0.95,
        metadata: {
          title: "Understanding RAG",
          page: 1
        },
        highlights: [{
          page: 1,
          rect: { top: 100, left: 100, width: 400, height: 100 },
          comment: "Key concept"
        }]
      }
    ]),
    response: Promise.resolve("According to the whitepaper...")
  })}
  getDataSource={(source) => {
    if (source.type === 'pdf') {
      return fetchPdfContent(source.sourceReference);
    } else if (source.type === 'html') {
      return fetchHtmlContent(source.sourceReference);
    }
  }}
>
  <ChatWindow />
  <SourcesDisplay />
  <ContentDisplay />
</RAGProvider>
\`\`\`

## Combined Usage

You can mix both types in a single response. This is useful when you want to combine different types of sources:
- PDF documents for detailed information
- HTML pages for implementation guides
- Direct text content for quick tips or summaries

\`\`\`tsx
// Example of mixing different source types
<RAGProvider
  retrieveAndGenerate={(messages) => ({
    sources: Promise.resolve([
      {
        sourceReference: "whitepaper.pdf",
        type: "pdf" as const,
        sourceName: "Whitepaper",
        relevanceScore: 0.95
      },
      {
        text: "<div>Quick tip: Always validate sources</div>",
        sourceName: "Best Practices",
        relevanceScore: 0.82
      }
    ]),
    response: Promise.resolve("Found information in multiple sources...")
  })}
  getDataSource={source => fetchDocument(source)}
>
  <ChatWindow />
  <SourcesDisplay />
  <ContentDisplay />
</RAGProvider>
\`\`\`

## Type Definitions

\`\`\`typescript
// Text source
interface TextSource {
  text: string;              // HTML content
  sourceName?: string;       // Display name
  relevanceScore?: number;   // Relevance score (0-1)
  metadata?: Record<string, any>;
}

// Reference source
interface ReferenceSource {
  sourceReference: string;   // Document identifier
  type: "pdf" | "html";     // Document type
  sourceName?: string;      
  relevanceScore?: number;  
  metadata?: Record<string, any>;
  highlights?: Array<{      // PDF highlights
    page: number;
    rect: { top: number; left: number; width: number; height: number };
    comment?: string;
  }>;
}

// Data source response
interface GetDataSourceResponse {
  type: "pdf" | "html";
  content: string | Uint8Array;  // HTML string or PDF bytes
  metadata?: Record<string, any>;
  highlights?: Array<{          // PDF only
    page: number;
    rect: { top: number; left: number; width: number; height: number };
    comment?: string;
  }>;
}
\`\`\`

Try out the interactive example below and switch between different source types using the controls.
Next, move on to "03. Streaming Responses" to learn how to provide a more interactive experience with streaming responses.
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
    variant: 'text'
  }
}; 