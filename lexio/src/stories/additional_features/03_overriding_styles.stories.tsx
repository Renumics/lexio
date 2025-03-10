import type {Meta, StoryObj} from '@storybook/react';
import {useEffect} from 'react';
import {
    LexioProvider,
    ChatWindow,
    AdvancedQueryField,
    SourcesDisplay,
    ContentDisplay,
    useSources, 
    Message, 
    useMessages,
    Source,
    UserAction
} from '../../../lib/main';

// Base layout component for consistent story presentation
const BaseLayout = ({children}: { children: React.ReactNode }) => (
    <div style={{width: '100%', maxWidth: '1200px', height: '1000px', margin: '0 auto'}}>
        {children}
    </div>
);

interface SharedLayoutProps {
    styleOverrides: {
        color?: string;
        backgroundColor?: string;
        activeSourceBackground?: string;
        activeSourceBorderColor?: string;
        secondaryBackgroundColor?: string;
        metadataTagBackground?: string;
        sourceTypeBackground?: string;
        fontSize?: string;
    };
}

// Example layout with components using styleOverrides
const SharedLayout = ({styleOverrides}: SharedLayoutProps) => (
    <div style={{
        display: 'grid',
        height: '100%',
        gridTemplateColumns: '3fr 1fr',
        gridTemplateRows: '1fr auto 400px',
        gap: '20px',
        gridTemplateAreas: `
      "chat sources"
      "input sources"
      "viewer viewer"
    `
    }}>
        <div style={{gridArea: 'chat', minHeight: 0, overflow: 'auto'}}>
            <ChatWindow styleOverrides={{ fontSize: '1.25rem', color: 'red' }} />
        </div>
        <div style={{gridArea: 'input'}}>
            <AdvancedQueryField />
        </div>
        <div style={{gridArea: 'sources', minHeight: 0, overflow: 'auto'}}>
            <SourcesDisplay styleOverrides={styleOverrides} />
        </div>
        <div style={{gridArea: 'viewer', height: '400px'}}>
            <ContentDisplay/>
        </div>
    </div>
);

// Mock data and functions
const SAMPLE_MESSAGES: Message[] = [
    {
        id: crypto.randomUUID(),
        role: 'user',
        content: 'What is RAG?',
    },
];

// Fetch a sample PDF from a URL
const fetchSamplePDF = async (): Promise<Uint8Array> => {
  try {
    // URL to a sample PDF from GitHub (this worked before)
    const pdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';
    
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    // Fallback to minimal PDF header if fetch fails
    return new Uint8Array([37, 80, 68, 70, 45, 49, 46, 53, 10]); // "%PDF-1.5" header
  }
};

const SAMPLE_SOURCES: [] = [
    {
        title: "Example PDF",
        type: "pdf",
        relevance: 0.95,
        metadata: {
            title: "Understanding RAG Systems",
            page: 2,
        },
    },
    {
        title: "Best Practices",
        type: "html",
        relevance: 0.82,
        metadata: {
            type: "Tips",
            lastUpdated: "2024-03-20"
        },
        data: `<div class="content">
      <h2>Quick Tips</h2>
      <ul>
        <li>Always validate your data sources</li>
        <li>Monitor retrieval performance</li>
        <li>Keep your knowledge base updated</li>
      </ul>
    </div>`
    }
];

const DataLoader = () => {
    const {addUserMessage} = useMessages('LexioProvider');
    const {setActiveSources, sources} = useSources('LexioProvider');

    useEffect(() => {
        const timer = setTimeout(() => {
            addUserMessage(SAMPLE_MESSAGES[0].content);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (sources.length > 0) {
            setActiveSources([sources[0].id]);
        }
    }, [sources]);

    return null;
};

interface StyleOverridesExampleProps {
    styleOverrides: SharedLayoutProps['styleOverrides'];
}

const StyleOverridesExample = ({ styleOverrides }: StyleOverridesExampleProps) => {
    return (
        <BaseLayout>
            <LexioProvider onAction={(
                action: UserAction,
                messages: Message[],
                sources: Source[],
                activeSources: Source[],
                selectedSource: Source | null
            ) => {
                if (action.type === 'ADD_USER_MESSAGE' && messages.length === 0) {
                    return {
                        response: Promise.resolve("RAG is a technology that allows you to search for information in a database of documents."),
                        sources: Promise.resolve(SAMPLE_SOURCES)
                    }
                } else if (action.type === 'ADD_USER_MESSAGE' && messages.length > 0) {
                    return {
                        response: Promise.resolve("I am sorry, I don't know the answer to that question."),
                    }
                }
                if (action.type === 'SET_SELECTED_SOURCE') {
                    if (action.sourceObject?.type === 'pdf') {
                        return {
                            sourceData: fetchSamplePDF()
                        }
                    } else {
                        return {
                            sourceData: Promise.resolve(action.sourceObject?.data)
                        }
                    }
                }
            }}>
                <DataLoader />
                <SharedLayout styleOverrides={styleOverrides} />
            </LexioProvider>
        </BaseLayout>
    );
};

type Story = StoryObj<typeof StyleOverridesExample>;

const meta = {
    title: 'Additional Features/ Component Style Overrides',
    component: StyleOverridesExample,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
## Introduction

While theming provides a way to customize the global appearance of your UI components, sometimes you need more fine-grained control over individual components. Each component in the \`Lexio\` library accepts a \`styleOverrides\` prop that allows you to customize its appearance. 
Each component has its own set of style properties that can be overridden. Refer to the interfaces of each component for available options.

Components that support style overrides:
- ChatWindow: ChatWindowStyles
- QueryField: QueryFieldStyles
- AdvancedQueryField: AdvancedQueryFieldStyles
- SourcesDisplay: SourcesDisplayStyles
- ContentDisplay: ContentDisplayStyles
- PDFViewer: PdfViewerStyles
- HTMLViewer: HtmlViewerStyles
- ViewerToolbar: ViewerToolbarStyles

#### Example: ChatWindow and ChatWindowStyles

\`\`\`typescript
export interface ChatWindowStyles extends React.CSSProperties {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;
    fontSize?: string;
    borderRadius?: string;
}

<ChatWindow styleOverrides={{ fontSize: '1.25rem', color: 'red' }} />
\`\`\`

## Using Style Overrides

To override styles for a component, pass a \`styleOverrides\` object with the desired properties:

\`\`\`typescript
// define style overrides for the ChatWindow component directly
<ChatWindow styleOverrides={{ fontSize: '1.25rem', color: 'red' }} />

// define a subset of style overrides for the SourcesDisplay component
const styleOverrides = {
    backgroundColor: '#ffffff',
    activeSourceBackground: '#f7fafc',
    activeSourceBorderColor: '#4a90e2',
    metadataTagBackground: '#edf2f7',
    sourceTypeBackground: '#ebf5ff',
    fontSize: '0.9rem',
}

// pass the styleOverrides object to the SourcesDisplay component
<SourcesDisplay styleOverrides={styleOverrides} />
\`\`\`

## Tips for Style Overrides

- **Component-Specific Properties**: Each component has its own set of style properties that can be overridden. Refer to the interfaces above for available options.

- **Theme Consistency**: While you can override styles for individual components, try to maintain consistency with your theme's color palette and design tokens. Unset properties will fall back to the global theme.

## Example

Check out the interactive example below to see how different style overrides affect the components. The example shows custom styling for the ChatWindow. The styling of the SourcesDisplay component can be changed interactively with the \`Control\` value.
`
            }
        }
    },
    tags: ['autodocs'],
} satisfies Meta<typeof StyleOverridesExample>;

export default meta;

export const Docs: Story = {
    args: {
        styleOverrides: {
            backgroundColor: '#e0f7fa',
            activeSourceBackground: '#b2ebf2',
            activeSourceBorderColor: '#00acc1',
            metadataTagBackground: '#b3e5fc',
            sourceTypeBackground: '#e1f5fe',
            fontSize: '0.9rem',
        },
    },
};