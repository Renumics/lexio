import type {Meta, StoryObj} from '@storybook/react';
import {
    LexioProvider,
    ChatWindow,
    AdvancedQueryField,
    SourcesDisplay,
    ContentDisplay,
    useSources,
    Message,
    useMessages,
    createTheme,
    defaultTheme,
    Theme,
    UserAction,
    Source,
    useLexioTheme
} from '../../../lib/main';
import {useEffect} from "react";

const warmTheme = createTheme({
    colors: {
        primary: '#FF7043',
        secondary: '#FFB74D',
        contrast: '#FFFFFF',
        background: '#FFF3E0',
        secondaryBackground: '#FFFFFF',
        toolbarBackground: '#F4511E',
        text: '#3E2723',
        secondaryText: '#5D4037',
        lightText: '#8D6E63',
    },
    typography: {
        fontFamily: '"Lato", sans-serif',
        fontSizeBase: '18px',
        lineHeight: '1.8',
    },
    componentDefaults: {
        borderRadius: '0.5rem',
        padding: '1.2rem',
    }
});

const modernTheme = createTheme({
    colors: {
        primary: '#6200EA',
        secondary: '#B388FF',
        contrast: '#FFFFFF',
        background: '#F5F5F5',
        secondaryBackground: '#FFFFFF',
        toolbarBackground: '#651FFF',
        text: '#212121',
        secondaryText: '#616161',
        lightText: '#9E9E9E',
    },
    typography: {
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSizeBase: '16px',
        lineHeight: '1.75',
    },
    componentDefaults: {
        borderRadius: '1.5rem',
        padding: '1.5rem',
    }
});

const BaseLayout = ({children}: { children: React.ReactNode }) => (
    <div style={{width: '100%', maxWidth: '1200px', height: '1000px', margin: '0 auto'}}>
        {children}
    </div>
);


const SharedLayout = () => (
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
            <ChatWindow/>
        </div>
        <div style={{gridArea: 'input'}}>
            <AdvancedQueryField/>
        </div>
        <div style={{gridArea: 'sources', minHeight: 0, overflow: 'auto'}}>
            <SourcesDisplay/>
        </div>
        <div style={{gridArea: 'viewer', height: '400px'}}>
            <ContentDisplay/>
        </div>
    </div>
);

// ----- Mocked Data and Functions -----
// We mock a basic retrieval state for the story
const SAMPLE_MESSAGES: Message[] = [
    {
        id: crypto.randomUUID(),
        role: 'user',
        content: 'What is RAG?',
    },
];

// Sample sources for the demo
const SAMPLE_SOURCES: Source[] = [
    {
        id: crypto.randomUUID(),
        title: "RAG Whitepaper",
        type: "pdf",
        relevance: 0.95,
        metadata: {
            title: "Understanding RAG Systems",
            page: 2,
            author: "Research Team"
        },
    },
    {
        id: crypto.randomUUID(),
        title: "Implementation Guide",
        type: "html",
        relevance: 0.88,
        metadata: {
            section: "Setup",
            difficulty: "Intermediate"
        }
    },
    {
        id: crypto.randomUUID(),
        title: "Best Practices",
        type: "text",
        relevance: 0.82,
        data: `
## Quick Tips
- Always validate your data sources
- Monitor retrieval performance
- Keep your knowledge base updated
`,
        metadata: {
            type: "Tips",
            lastUpdated: "2024-03-20"
        }
    }
];

// Fetch a sample PDF from a URL
const fetchSamplePDF = async (): Promise<Uint8Array> => {
  try {
    const pdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';
    
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return new Uint8Array([37, 80, 68, 70, 45, 49, 46, 53, 10]); // "%PDF-1.5" header
  }
};

// Component to load initial data, add sample messages, and set the active source index
const DataLoader = () => {
    const {addUserMessage} = useMessages('LexioProvider');
    const {setActiveSources, sources} = useSources('LexioProvider');

    useEffect(() => {
        // Small delay to ensure provider is ready
        const timer = setTimeout(() => {
            addUserMessage(SAMPLE_MESSAGES[0].content);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (sources.length > 0) {
            // Set the first source as active
            setActiveSources([sources[0].id]);
        }
    }, [sources]);

    return null;
};

interface ThemeStoryProps {
    customTheme?: Theme;
}

// Example of a custom component using the theme
const ThemedCustomComponent = () => {
  // Access the theme using the useLexioTheme hook
  const theme = useLexioTheme();
  
  return (
    <div style={{
      background: theme.colors.secondaryBackground,
      color: theme.colors.text,
      padding: theme.componentDefaults.padding,
      borderRadius: theme.componentDefaults.borderRadius,
      fontFamily: theme.typography.fontFamily,
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: theme.colors.primary, marginTop: 0 }}>Custom Themed Component</h3>
      <p>This component uses the useLexioTheme hook to access the current theme.</p>
    </div>
  );
};

const ThemingExample = ({customTheme}: ThemeStoryProps) => {
    return (
        <BaseLayout>
            <LexioProvider
                theme={customTheme}
                onAction={(
                    action: UserAction,
                    messages: Message[],
                    sources: Source[],
                    activeSources: Source[],
                    selectedSource: Source | null
                ) => {
                    if (action.type === 'ADD_USER_MESSAGE') {
                        return {
                            response: Promise.resolve("I've found relevant information about RAG systems from multiple sources..."),
                            sources: Promise.resolve(SAMPLE_SOURCES)
                        };
                    }
                    
                    if (action.type === 'SET_SELECTED_SOURCE') {
                        if (action.sourceObject?.type === 'pdf') {
                            return {
                                sourceData: fetchSamplePDF()
                            };
                        } else if (action.sourceObject?.type === 'html') {
                            return {
                                sourceData: Promise.resolve(`
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
                                `)
                            };
                        } else {
                            return {
                                sourceData: Promise.resolve(action.sourceObject?.data)
                            };
                        }
                    }
                }}
            >
                <DataLoader/>
                
                {/* Add the custom themed component to showcase useLexioTheme */}
                <ThemedCustomComponent />
                <SharedLayout/>
            </LexioProvider>
        </BaseLayout>
    );
};

type Story = StoryObj<typeof ThemingExample>;

const meta = {
    title: 'Additional Features/Theming',
    component: ThemingExample,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `# Theming in Lexio

Lexio provides a comprehensive theming system that allows you to customize the appearance of all components. The theming system is based on a central theme object that defines colors, typography, and component defaults.

## Theme Structure

A theme in Lexio consists of three main parts:

### 1. Colors

The color palette includes:

\`\`\`typescript
interface Colors {
  primary: string;             // Primary brand color
  secondary: string;           // Secondary brand color
  contrast: string;            // Contrast color (usually white)
  background: string;          // Main background color
  secondaryBackground: string; // Secondary background color
  toolbarBackground: string;   // Toolbar background color
  text: string;                // Main text color
  secondaryText: string;       // Secondary text color
  lightText: string;           // Light text color
  success: string;             // Success state color
  warning: string;            // Warning state color
  error: string;              // Error state color
}
\`\`\`

### 2. Typography

Font settings include:

\`\`\`typescript
interface Typography {
  fontFamily: string;    // Main font family
  fontSizeBase: string;  // Base font size
  lineHeight: string;    // Base line height
}
\`\`\`

### 3. Component Defaults

A consistent spacing scale:

\`\`\`typescript
interface ComponentDefaults {
    borderRadius: string;  // Default border radius
    padding: string;       // Default padding
}
\`\`\`

## Using Themes

### Default Theme

The default theme is automatically applied when no theme is provided:

\`\`\`typescript
import { LexioProvider } from 'lexio';

function App() {
  return (
    <LexioProvider onAction={handleAction}>
      <YourComponents />
    </LexioProvider>
  );
}
\`\`\`

### Custom Theme

You can create a custom theme in two ways:

#### **1:** Modify the default theme partially with the provided \`createTheme\` function:

\`\`\`typescript
import { createTheme } from 'lexio';

const myTheme = createTheme({
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    fontBaseSize: '16px',  // many of our components use a relative scale to this value
  }
});
\`\`\`

#### **2:** Create a complete theme from scratch, which requires all values to be defined:

\`\`\`typescript
import { Theme } from 'lexio';

const myTheme: Theme = {
  colors: {
    // ... all color values required
  },
  typography: {
    // ... all typography values required
  },
  componentDefaults: {
    // ... all component defaults required
  }
};
\`\`\`

#### Apply your custom theme:

\`\`\`typescript
<LexioProvider theme={myTheme} onAction={handleAction}>
  <YourComponents />
</LexioProvider>
\`\`\`

## Accessing the Theme in Custom Components

You can access the current theme in your custom components using the \`useLexioTheme\` hook:

\`\`\`typescript
import { useLexioTheme } from 'lexio';

function MyCustomComponent() {
  const theme = useLexioTheme();
  
  return (
    <div style={{ 
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      padding: theme.componentDefaults.padding,
      borderRadius: theme.componentDefaults.borderRadius,
      fontFamily: theme.typography.fontFamily
    }}>
      My themed custom component
    </div>
  );
}
\`\`\`

This allows you to create components that automatically adapt to the current theme, maintaining a consistent look and feel throughout your application.

## Interactive Example 
Try out the interactive examples below to see different theme variations in action.  
Change the \`customTheme\` value via the dropdown menu under \`Control\`. 
`
            }
        }
    },
    tags: ['autodocs'],
    argTypes: {
        customTheme: {
            control: 'select',
            options: ['default', 'warm', 'modern'],
            mapping: {
                default: defaultTheme,
                warm: warmTheme,
                modern: modernTheme
            },
            description: 'Select a predefined theme to see how it affects the components.',
        },
    }
} satisfies Meta<typeof ThemingExample>;

export default meta;

export const Docs: Story = {
    args: {
        customTheme: warmTheme,
    }
};