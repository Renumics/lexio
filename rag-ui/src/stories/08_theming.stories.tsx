import type {Meta, StoryObj} from '@storybook/react';
import {RAGProvider, ChatWindow, AdvancedQueryField, SourcesDisplay, ContentDisplay} from '../../lib/main';
import type { GetDataSourceResponse } from '../../lib/main';
import {defaultTheme} from "../../lib/theme";

export const customTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: '#FF0000', // custom brand color
  },
};

// TODO: Create Theming tutorial
interface ExampleProps {
    variant: 'text' | 'reference' | 'mixed';
}

const BaseLayout = ({children}: { children: React.ReactNode }) => (
    <div style={{width: '100%', maxWidth: '1200px', height: '800px', margin: '0 auto'}}>
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
        <div style={{gridArea: 'chat', minHeight: 0, overflow: 'auto'}}>
            <ChatWindow/>
        </div>
        <div style={{gridArea: 'input'}}>
            <AdvancedQueryField/>
        </div>
        <div style={{gridArea: 'sources', minHeight: 0, overflow: 'auto'}}>
            <SourcesDisplay/>
        </div>
        <div style={{gridArea: 'viewer', height: '300px'}}>
            <ContentDisplay/>
        </div>
    </div>
);

const SourceTypesExample = ({variant}: ExampleProps) => {
    const getSourcesAndResponse = () => {
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
                        rect: {top: 100, left: 100, width: 400, height: 100},
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
                theme={customTheme}
            >
                <SharedLayout/>
            </RAGProvider>
        </BaseLayout>
    );
};

type Story = StoryObj<typeof SourceTypesExample>;

const meta = {
    title: 'Getting Started/08. Theming',
    component: SourceTypesExample,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
## Type Definitions

\`\`\`typescript
import {RAGProvider, defaultTheme} from "lexio";

/* .... */
export const customTheme = {
  ...defaultTheme,
  /*colors: {
    ...defaultTheme.colors,
    background: '#FF0000', // custom brand color
  },*/
};

/* .... */
<RAGProvider
    ...
    theme={customTheme}>
>
    ...
</RAGProvider>

\`\`\`

Try out the interactive example below and switch between different source types using the controls.
Next, move on to "03. Streaming Responses" to learn how to provide a more interactive experience with streaming responses.
        `
            }
        }
    },
    tags: ['autodocs']
} satisfies Meta<typeof SourceTypesExample>;

export default meta;

export const Docs: Story = {
    args: {
    }
}; 