import type {Meta, StoryObj} from '@storybook/react';
import {useEffect} from 'react';
import {
    RAGProvider,
    ChatWindow,
    AdvancedQueryField,
    SourcesDisplay,
    ContentDisplay,
    useRAGSources, Message, useRAGMessages
} from '../../lib/main';
import type {GetDataSourceResponse, SourceReference} from '../../lib/main';
import {ChatWindowStyles} from "../../lib/components/ChatWindow/ChatWindow.tsx";

// Base layout component for consistent story presentation
const BaseLayout = ({children}: { children: React.ReactNode }) => (
    <div style={{width: '100%', maxWidth: '1200px', height: '800px', margin: '0 auto'}}>
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
    };
}

// Example layout with components using styleOverrides
const SharedLayout = ({styleOverrides}: SharedLayoutProps) => (
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
            <ChatWindow styleOverrides={{ fontSize: '1.25rem', color: 'red' }} />
        </div>
        <div style={{gridArea: 'input'}}>
            <AdvancedQueryField />
        </div>
        <div style={{gridArea: 'sources', minHeight: 0, overflow: 'auto'}}>
            <SourcesDisplay styleOverrides={styleOverrides} />
        </div>
        <div style={{gridArea: 'viewer', height: '300px'}}>
            <ContentDisplay/>
        </div>
    </div>
);

// Mock data and functions
const SAMPLE_MESSAGES: Message[] = [
    {
        role: 'user',
        content: 'What is RAG?',
    },
];

const DataLoader = () => {
    const {addMessage} = useRAGMessages();
    const {setActiveSourceIndex, sources} = useRAGSources();

    useEffect(() => {
        const timer = setTimeout(() => {
            addMessage(SAMPLE_MESSAGES[0]);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setActiveSourceIndex(0);
    }, [sources]);

    return null;
};

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
            }
        ]),
        response: Promise.resolve("I've found relevant information about RAG systems...")
    };
};

const getDataSource = (source: SourceReference): GetDataSourceResponse => {
    if (source.type === 'pdf') {
        return fetch('https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf')
            .then(response => response.arrayBuffer())
            .then(buffer => ({
                type: 'pdf',
                content: new Uint8Array(buffer),
                metadata: source.metadata,
                highlights: source.highlights
            }));
    }
    return Promise.reject(new Error('Unsupported type'));
};

interface StyleOverridesExampleProps {
    styleOverrides: SharedLayoutProps['styleOverrides'];
}

const StyleOverridesExample = ({ styleOverrides }: StyleOverridesExampleProps) => {
    return (
        <BaseLayout>
            <RAGProvider retrieveAndGenerate={getSourcesAndResponse} getDataSource={getDataSource}>
                <DataLoader />
                <SharedLayout styleOverrides={styleOverrides} />
            </RAGProvider>
        </BaseLayout>
    );
};

type Story = StoryObj<typeof StyleOverridesExample>;

const meta = {
    title: 'Tutorial/10. Style Overrides',
    component: StyleOverridesExample,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
# Component Style Overrides

While theming provides a way to customize the global appearance of your UI components, sometimes you need more fine-grained control over individual components. Each component in the \`Lexio\` library accepts a \`styleOverrides\` prop that allows you to customize its appearance. 
Each component has its own set of style properties that can be overridden. Refer to the interfaces of each component for available options.

Components that support style overrides:
- ChatWindow -> ChatWindowStyles
- AdvancedQueryField -> AdvancedQueryFieldStyles
- SourcesDisplay -> SourcesDisplayStyles
- QueryField -> QueryFieldStyles
- ContentDisplay -> ContentDisplayStyles
- PDFViewer -> PdfViewerStyles
- HTMLViewer -> HtmlViewerStyles
- ViewerToolbar -> ViewerToolbarStyles

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
        },
    },
};