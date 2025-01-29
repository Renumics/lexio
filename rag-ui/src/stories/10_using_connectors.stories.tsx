// ConnectorExample.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import {
  // Connectors/Hooks:
  useRestContentSource,
  useSSEGenerateSource,
  useSSERetrieveAndGenerateSource,
  useRESTGenerateSource,
  useRESTRetrieveAndGenerateSource,
} from '../../lib/main';

/**
 * A tiny placeholder component so we can satisfy the 'component' requirement
 * and still have a doc-only story.
 */
const Placeholder = () => null;

const meta: Meta<typeof Placeholder> = {
  title: 'Getting Started/10. Using Connectors',
  component: Placeholder,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Using Connectors

Connectors provide a straightforward way to hook up your data sources to a RAG (Retrieval-Augmented Generation) workflow. They unify:
1. **Fetching** or **loading** sources (via REST, SSE, etc.)
2. **Streaming** or **batch** generation
3. **Common transformations** into the data formats expected by the RAG components

Their aim is to simplify the connection to various backends by providing sensible defaults for request building and content parsing. You can swap between a REST or SSE approach without overhauling your main UI.

---

## Available Connectors

**\`useRestContentSource\`**  
Fetches source files via REST. Returns a function you can pass as \`getDataSource\`. Includes default logic for building fetch requests and parsing PDF/HTML/Markdown.

**\`useRESTRetrieveAndGenerateSource\`**  
Calls a single REST endpoint to retrieve relevant sources *and* produce a final answer. Returns two Promises: \`sources\` and \`response\`.

**\`useRESTGenerateSource\`**  
Similar to the above, but only handles generation. Returns a Promise string (the generated text).

**\`useSSEGenerateSource\`**  
Streams partial text from an SSE endpoint. Returns an \`AsyncIterable\` to yield chunks of text in real-time.

**\`useSSERetrieveAndGenerateSource\`**  
Combines source retrieval and streaming generation in one SSE call. Returns a Promise for \`sources\` and an \`AsyncIterable\` for partial responses.

---

## Example Usage

Below is a more complete example illustrating how you might combine several connectors:

\`\`\`tsx
import { useCallback, useMemo } from 'react';
import {
    ChatWindow,
    RAGProvider,
    SourcesDisplay,
    ContentDisplay,
    AdvancedQueryField,
    ErrorDisplay,
    useSSERetrieveAndGenerateSource,
    useSSEGenerateSource,
    SourceReference,
    Message,
    RetrievalResult,
    useRestContentSource,
} from '../lib/main';
import './App.css';
import { SSEParsedEvent } from '../lib/connectors/useSSERetrieveAndGenerateSource';

function App() {
    // Create REST-based data source retrieval with custom request + parse logic
    const getDataSourceOptions = useMemo(() => ({
        buildFetchRequest: (source: SourceReference) => {
            const id = source.metadata?.id;
            if (!id) {
                throw new Error('No ID in source metadata');
            }
            return {
                url: \`http://localhost:8000/pdfs/\${encodeURIComponent(id)}\`,
            };
        },
        parseText: (text: string, source: SourceReference) => {
            const codeFileExtensions = ['.tsx', '.ts', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.rs'];
            const isCodeFile = source.sourceName && codeFileExtensions.some(ext => source.sourceName.endsWith(ext));

            if (isCodeFile) {
                // Escape backticks and wrap content in code fences
                const escapedText = text.replace(/\\\`/g, '\\\\\`');
                const extension = source.sourceName?.split('.').pop() || 'txt';
                return {
                    type: source.type,
                    content: \`\\\`\\\`\\\`\${extension}\\n\${escapedText}\\n\\\`\\\`\\\`\`,
                    metadata: source.metadata || {}
                };
            }

            // For non-code files, return text as-is
            return {
                type: source.type,
                content: text,
                metadata: source.metadata || {}
            };
        }
    }), []);

    const getDataSource = useRestContentSource(getDataSourceOptions);

    // SSE retrieve-and-generate logic
    const retrieveAndGenerateOptions = useMemo(() => ({
        endpoint: 'http://localhost:8000/api/retrieve-and-generate',
        method: 'POST' as const,
        buildRequestBody: (messages: Message[], metadata?: Record<string, any>) => ({
            query: messages[messages.length - 1].content,
            metadata
        }),
        parseEvent: (data: any): SSEParsedEvent => {
            if (Array.isArray(data.sources)) {
                const sources = data.sources.map((item: any) => {
                    const relevanceScore = item.score != null ? item.score : undefined;
                    const fileName = item.doc_path.split('/').pop();
                    return {
                        type: item.doc_path.endsWith('.pdf') ? 'pdf'
                             : item.doc_path.endsWith('.html') ? 'html'
                             : 'markdown',
                        sourceReference: item.doc_path,
                        sourceName: fileName,
                        relevanceScore,
                        highlights: item.highlights?.map((highlight: any) => ({
                            page: highlight.page,
                            rect: {
                                left: highlight.bbox.l,
                                top: highlight.bbox.t,
                                width: highlight.bbox.r - highlight.bbox.l,
                                height: highlight.bbox.b - highlight.bbox.t
                            }
                        })),
                        metadata: {
                            id: item.id,
                            page: item.page
                        }
                    } as SourceReference;
                });
                return { sources, done: false };
            }
            if (typeof data.content === 'string') {
                return { content: data.content, done: !!data.done };
            }
            return {};
        }
    }), []);

    // SSE generate logic
    const generateOptions = useMemo(() => ({
        endpoint: 'http://localhost:8000/api/generate',
        method: 'POST' as const,
        buildRequestBody: (messages: Message[], sources?: RetrievalResult[]) => ({
            messages,
            // Here we just pass source IDs to the backend for context
            source_ids: sources?.map(source => source.metadata?.id).filter(Boolean)
        }),
        parseEvent: (data: any): SSEParsedEvent => ({
            content: data.content,
            done: !!data.done
        })
    }), []);

    const retrieveAndGenerate = useSSERetrieveAndGenerateSource(retrieveAndGenerateOptions);
    const generate = useSSEGenerateSource(generateOptions);

    return (
        <div className="app-container">
            <RAGProvider
                retrieveAndGenerate={retrieveAndGenerate}
                generate={generate}
                getDataSource={getDataSource}
                config={{
                    timeouts: {
                        stream: 10000
                    }
                }}
            >
                <div style={{
                    display: 'grid',
                    height: '100vh',
                    width: '100%',
                    gridTemplateColumns: '1fr 2fr',
                    gridTemplateRows: '1fr 100px',
                    gap: '20px',
                    gridTemplateAreas: \`
                        "chat viewer"
                        "input viewer"
                    \`,
                    maxHeight: '100vh',
                    overflow: 'hidden',
                    padding: '20px',
                    boxSizing: 'border-box'
                }}>
                    {/* Main chat UI */}
                    <div style={{ gridArea: 'chat', overflow: 'auto', minWidth: 0, maxWidth: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ flex: '1', overflow: 'auto', height: '50%' }}>
                                <SourcesDisplay />
                            </div>
                            <div style={{ flex: '1', overflow: 'auto', height: '50%' }}>
                                <ChatWindow />
                            </div>
                        </div>
                    </div>

                    {/* Advanced query input */}
                    <div style={{
                        gridArea: 'input',
                        height: '100px',
                        minWidth: 0,
                        maxWidth: '100%'
                    }}>
                        <AdvancedQueryField />
                    </div>

                    {/* Content viewer */}
                    <div style={{
                        gridArea: 'viewer',
                        overflow: "hidden",
                        width: '100%',
                        height: '100%'
                    }}>
                        <ContentDisplay />
                    </div>
                </div>
                <ErrorDisplay />
            </RAGProvider>
        </div>
    );
}

export default App;
\`\`\`

In this example:
- **\`useRestContentSource\`** configures fetching PDFs or text (like code files) from a REST API.
- **\`useSSERetrieveAndGenerateSource\`** retrieves sources *and* streams a generated response via SSE.
- **\`useSSEGenerateSource\`** streams partial responses from an existing set of sources.
- We memoize connector options to avoid re-creating them on every render.

These connectors can be mixed or matched based on your backend's API. The key is that each connector takes care of the "plumbing" of data transformations, letting you focus on building your UI and orchestrating RAG workflows.
`
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Placeholder>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Docs story with no visual component, only documentation. */
export const Docs: Story = {};
