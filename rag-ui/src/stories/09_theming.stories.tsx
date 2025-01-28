import type {Meta, StoryObj} from '@storybook/react';
import {
    RAGProvider,
    ChatWindow,
    AdvancedQueryField,
    SourcesDisplay,
    ContentDisplay,
    useRAGSources,
    Message,
    useRAGMessages,
    createTheme,
    defaultTheme,
    Theme,
} from '../../lib/main';
import type {GetDataSourceResponse, SourceReference} from '../../lib/main';
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
    borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
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
    spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
    }
});

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

// ----- Mocked Data and Functions -----
// We mock a basic retrieval state for the story
const SAMPLE_MESSAGES: Message[] = [
    {
        role: 'user',
        content: 'What is RAG?',
    },
];

// Component to load initial data, add sample messages, and set the active source index
const DataLoader = () => {
    const {addMessage} = useRAGMessages();
    const {setActiveSourceIndex, sources} = useRAGSources();

    useEffect(() => {
        // Small delay to ensure provider is ready
        const timer = setTimeout(() => {
            addMessage(SAMPLE_MESSAGES[0]);

        }, 0);

        return () => clearTimeout(timer);
    }, []);

    // todo: we could mock the mentioning feature here
    useEffect(() => {
        // we mock active source selection to display viewer
        setActiveSourceIndex(0);
    }, [sources]);

    return null;
};

// Mocked retrieval function that returns sources and a response
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

// Mocked getDataSource function that returns SourceContent
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
};

interface ThemeStoryProps {
    customTheme?: Theme;
}

const SourceTypesExample = ({customTheme}: ThemeStoryProps) => {
    const {setActiveSourceIndex} = useRAGSources();
    return (
        <BaseLayout>
            <RAGProvider
                retrieveAndGenerate={() => getSourcesAndResponse()}
                getDataSource={(source) => getDataSource(source)}
                theme={customTheme}
            >
                {/* We use the Dataloader to add messages to the ChatWindow, the retrieveAndGenerate function will populate the SourcesDisplay */}
                <DataLoader/>
                <SharedLayout/>
            </RAGProvider>
        </BaseLayout>
    );
};

type Story = StoryObj<typeof SourceTypesExample>;

const meta = {
    title: 'Getting Started/09. Theming',
    component: SourceTypesExample,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
# Theming

The RAG UI library provides a flexible theming system that allows you to customize the look and feel of all components. You can either use the default theme, modify specific parts of it, or create an entirely new theme.

## Theme Structure

The theme consists of four main parts:

\`\`\`typescript
interface Theme {
  colors: Colors;       // Color palette
  typography: Typography; // Font settings
  spacing: Spacing;     // Spacing scale
  borderRadius: BorderRadius; // Border radius scale
}
\`\`\`

### 1. Colors

The color system includes:

\`\`\`typescript
interface Colors {
  primary: string;            // Primary brand color
  secondary: string;          // Secondary brand color
  contrast: string;           // Contrast color for text on primary/secondary
  background: string;         // Main background color
  secondaryBackground: string; // Secondary background color
  toolbarBackground: string;   // Background for toolbars
  text: string;               // Main text color
  secondaryText: string;      // Secondary text color
  lightText: string;          // Light text color
  success: string;            // Success state color
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

### 3. Spacing

A consistent spacing scale:

\`\`\`typescript
interface Spacing {
  none: string;  // No spacing (0px)
  xs: string;    // Extra small spacing
  sm: string;    // Small spacing
  md: string;    // Medium spacing
  lg: string;    // Large spacing
  xl: string;    // Extra large spacing
}
\`\`\`

### 4. Border Radius

Border radius scale for consistent corner rounding:

\`\`\`typescript
interface BorderRadius {
  none: string;  // No border radius
  sm: string;    // Small border radius
  md: string;    // Medium border radius
  lg: string;    // Large border radius
  xl: string;    // Extra large border radius
}
\`\`\`

## Using Themes

### Default Theme

The default theme is automatically applied when no theme is provided:

\`\`\`typescript
import { RAGProvider } from 'lexio';

function App() {
  return (
    <RAGProvider>
      <YourComponents />
    </RAGProvider>
  );
}
\`\`\`

### Custom Theme

You can create a custom theme in two ways:

**1:** Modify the default theme:

\`\`\`typescript
import { createTheme } from 'lexio';

const myTheme = createTheme({
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  }
});
\`\`\`

**2:** Create a complete theme from scratch, which requires all values to be defined:

\`\`\`typescript
import { Theme } from 'lexio';

const myTheme: Theme = {
  colors: {
    // ... all color values required
  },
  typography: {
    // ... all typography values required
  },
  spacing: {
    // ... all spacing values required
  },
  borderRadius: {
    // ... all border radius values required
  }
};
\`\`\`

Apply your custom theme:

\`\`\`typescript
<RAGProvider theme={myTheme}>
  <YourComponents />
</RAGProvider>
\`\`\`

Try out the interactive examples below to see different theme variations in action.
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
} satisfies Meta<typeof SourceTypesExample>;

export default meta;

export const Docs: Story = {
    args: {
        customTheme: defaultTheme,
    }
};