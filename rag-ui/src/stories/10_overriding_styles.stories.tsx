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

// TODO
// Base layout component for consistent story presentation
const BaseLayout = ({children}: { children: React.ReactNode }) => (
    <div style={{width: '100%', maxWidth: '1200px', height: '800px', margin: '0 auto'}}>
        {children}
    </div>
);

// Example layout with components using styleOverrides
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
            <ChatWindow
            //     styleOverrides={{
            //     backgroundColor: '#f8f9fa',
            //     color: '#2d3748',
            //     padding: '1.5rem',
            //     borderRadius: '12px',
            //     fontSize: '1rem',
            // }}
            />
        </div>
        <div style={{gridArea: 'input'}}>
            <AdvancedQueryField
            //     styleOverrides={{
            //     backgroundColor: '#ffffff',
            //     color: '#2d3748',
            //     padding: '1rem',
            //     borderRadius: '12px',
            //     inputBackgroundColor: '#f8f9fa',
            //     inputBorderColor: '#e2e8f0',
            //     buttonBackground: '#4a90e2',
            //     buttonTextColor: '#ffffff',
            //     buttonBorderRadius: '8px',
            //     mentionChipBackground: '#ebf5ff',
            //     mentionChipColor: '#2b6cb0',
            // }}
            />
        </div>
        <div style={{gridArea: 'sources', minHeight: 0, overflow: 'auto'}}>
            <SourcesDisplay
            //     styleOverrides={{
            //     backgroundColor: '#ffffff',
            //     color: '#2d3748',
            //     padding: '1rem',
            //     borderRadius: '12px',
            //     inputBackgroundColor: '#f8f9fa',
            //     inputBorderColor: '#e2e8f0',
            //     activeSourceBackground: '#f7fafc',
            //     activeSourceBorderColor: '#4a90e2',
            //     metadataTagBackground: '#edf2f7',
            //     metadataTagColor: '#4a5568',
            //     relevanceScoreColor: '#4a90e2',
            //     sourceTypeBackground: '#ebf5ff',
            //     sourceTypeColor: '#2b6cb0',
            // }}
            />
        </div>
        <div style={{gridArea: 'viewer', height: '300px'}}>
            <ContentDisplay/>
        </div>
    </div>
);

// Mock data and functions (similar to theming story)
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

const StyleOverridesExample = () => {
    return (
        <BaseLayout>
            <RAGProvider
                retrieveAndGenerate={() => getSourcesAndResponse()}
                getDataSource={(source) => getDataSource(source)}
            >
                <DataLoader/>
                <SharedLayout/>
            </RAGProvider>
        </BaseLayout>
    );
};

type Story = StoryObj<typeof StyleOverridesExample>;

const meta = {
    title: 'Getting Started/10. Style Overrides',
    component: StyleOverridesExample,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: ``,

            },
        },
    },
//                 component: `
// # Component Style Overrides
//
// While theming provides a way to customize the global appearance of your RAG UI components, sometimes you need more fine-grained control over individual components. Each component in the RAG UI library accepts a \`styleOverrides\` prop that allows you to customize its appearance.
//
// ## Available Components and Their Style Properties
//
// ### ChatWindow
// \`\`\`typescript
// interface ChatWindowStyles extends React.CSSProperties {
//     backgroundColor?: string;
//     color?: string;
//     padding?: string;
//     fontFamily?: string;
//     fontSize?: string;
//     borderRadius?: string;
// }
// \`\`\`
//
// ### AdvancedQueryField
// \`\`\`typescript
// interface AdvancedQueryFieldStyles extends React.CSSProperties {
//     backgroundColor?: string;
//     color?: string;
//     padding?: string;
//     fontFamily?: string;
//     borderColor?: string;
//     borderRadius?: string;
//     mentionChipBackground?: string;
//     mentionChipColor?: string;
//     inputBackgroundColor?: string;
//     inputBorderColor?: string;
//     buttonBackground?: string;
//     buttonTextColor?: string;
//     buttonBorderRadius?: string;
//     modeInitColor?: string;
//     modeFollowUpColor?: string;
//     modeReRetrieveColor?: string;
// }
// \`\`\`
//
// ### SourcesDisplay
// \`\`\`typescript
// interface SourcesDisplayStyles extends React.CSSProperties {
//     backgroundColor?: string;
//     color?: string;
//     padding?: string;
//     borderRadius?: string;
//     inputBackgroundColor?: string;
//     inputBorderColor?: string;
//     inputFocusRingColor?: string;
//     buttonBackground?: string;
//     buttonTextColor?: string;
//     buttonBorderRadius?: string;
//     activeSourceBackground?: string;
//     activeSourceBorderColor?: string;
//     selectedSourceBackground?: string;
//     selectedSourceBorderColor?: string;
//     inactiveSourceBackground?: string;
//     inactiveSourceBorderColor?: string;
//     metadataTagBackground?: string;
//     metadataTagColor?: string;
//     relevanceScoreColor?: string;
//     sourceTypeBackground?: string;
//     sourceTypeColor?: string;
// }
// \`\`\`
//
// ## Using Style Overrides
//
// To override styles for a component, pass a \`styleOverrides\` object with the desired properties:
//
// \`\`\`typescript
// <ChatWindow
//     styleOverrides={{
//         backgroundColor: '#f8f9fa',
//         color: '#2d3748',
//         padding: '1.5rem',
//         borderRadius: '12px',
//     }}
// />
//
// <AdvancedQueryField
//     styleOverrides={{
//         backgroundColor: '#ffffff',
//         inputBackgroundColor: '#f8f9fa',
//         buttonBackground: '#4a90e2',
//         buttonTextColor: '#ffffff',
//         mentionChipBackground: '#ebf5ff',
//         mentionChipColor: '#2b6cb0',
//     }}
// />
//
// <SourcesDisplay
//     styleOverrides={{
//         backgroundColor: '#ffffff',
//         activeSourceBackground: '#f7fafc',
//         activeSourceBorderColor: '#4a90e2',
//         metadataTagBackground: '#edf2f7',
//         sourceTypeBackground: '#ebf5ff',
//     }}
// />
// \`\`\`
//
// ## Best Practices
//
// 1. **Component-Specific Properties**: Each component has its own set of style properties that can be overridden. Refer to the interfaces above for available options.
//
// 2. **Theme Consistency**: While you can override styles for individual components, try to maintain consistency with your theme's color palette and design tokens.
//
// 3. **Responsive Design**: Consider how your style overrides will work across different screen sizes. Use relative units (rem, em) when appropriate.
//
// 4. **Performance**: Style overrides are applied at runtime. For better performance with static styles, consider using the global theme system instead.
//
// ## Example
//
// Check out the interactive example below to see how different style overrides affect the components. The example shows custom styling for the ChatWindow, AdvancedQueryField, and SourcesDisplay components.
// `
//             }
//         }
//     },
    tags: ['autodocs'],
} satisfies Meta<typeof StyleOverridesExample>;

export default meta;

export const Docs: Story = {};
