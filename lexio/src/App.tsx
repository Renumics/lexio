import './App.css'
import {
    ChatWindow,
    RAGProvider,
    SourcesDisplay,
    ContentDisplay,
    QueryField,
    ErrorDisplay,
    Message,
    AdvancedQueryField,
    createTheme
} from '../lib/main'

const customTheme = createTheme({
    colors: {
        primary: '#1E88E5',
        secondary: '#64B5F6'
    }
});

function App() {
    // Mock retrieveAndGenerate function
    const retrieveAndGenerate = (messages: Message[]) => {
        return {
            sources: Promise.resolve([
                {
                    sourceReference: "example-doc.pdf",
                    type: "pdf" as const,
                    sourceName: "Example Document",
                    metadata: {
                        title: "Example Document"
                    },
                    relevanceScore: 0.95,
                }
            ]),
            response: Promise.resolve("This is a sample response based on the retrieved documents.")
        };
    };

    // Mock retrieve function
    const retrieve = async (query: string) => {
        return [
            {
                sourceReference: "example-doc.pdf",
                type: "pdf" as const,
                sourceName: "Search Result",
                metadata: {
                    title: "Search Result"
                },
                relevanceScore: 0.9,
            }
        ];
    };

    // Mock getDataSource function
    const getDataSource = async (source: any) => {
        return {
            type: 'pdf',
            content: new Uint8Array([/* mock PDF data */]),
            metadata: source.metadata || {},
            highlights: source.highlights || []
        };
    };

    // Problematic parent styles that should not affect our components
    const parentStyles = {
        // Typography challenges
        fontFamily: 'Comic Sans MS, cursive', // Should not override component fonts
        fontSize: '20px', // Should not affect component text sizes
        lineHeight: '2.5', // Should not affect component line heights
        textAlign: 'right' as const, // Should not affect component text alignment
        fontWeight: '900', // Should not affect component font weights
        letterSpacing: '3px', // Should not affect component letter spacing
        
        // Color challenges
        color: 'red', // Should not override component text colors
        backgroundColor: '#e6ff00', // Should not override component backgrounds
        
        // Spacing challenges
        padding: '30px',
        margin: '25px',
        
        // Other challenging styles
        cursor: 'crosshair',
        textTransform: 'uppercase' as const,
        // textDecoration: 'underline wavy',
        border: '5px dotted purple',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        
        // Flex/Grid challenges
        display: 'flex', // Should not break our grid layout
        flexDirection: 'column' as const,
        alignItems: 'flex-end',
        justifyContent: 'center',
    };

    return (
        <div style={{ ...parentStyles, width: '100%', height: '100vh' }}>
            <RAGProvider
                retrieveAndGenerate={retrieveAndGenerate}
                retrieve={retrieve}
                getDataSource={getDataSource}
                config={{
                    timeouts: {
                        stream: 10000,
                        request: 60000
                    }
                }}
                theme={customTheme}
            >
                <div style={{ 
                    display: 'grid', // This should override parent's flex
                    height: '100%',
                    gridTemplateColumns: '3fr 1fr',
                    gridTemplateRows: '1fr auto 300px',
                    gap: '20px',
                    gridTemplateAreas: `
                        "chat sources"
                        "input sources"
                        "viewer viewer"
                    `,
                    // Reset some parent styles for grid container
                    padding: '20px',
                    margin: 0,
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
                    <ErrorDisplay />
                </div>
            </RAGProvider>
        </div>
    )
}

export default App 