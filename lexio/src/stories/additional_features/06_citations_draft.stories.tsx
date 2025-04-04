import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider, ChatWindow, AdvancedQueryField, ErrorDisplay, SourcesDisplay, ContentDisplay } from '../../../lib/main';
import type { Message, Source, UserAction, PDFHighlight, Citation } from '../../../lib/main';
import { useState } from 'react';

// Base layout component for consistent story presentation
const BaseLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ 
    width: '100%', 
    maxWidth: '1000px',
    minWidth: '1000px',
    height: '800px', 
    margin: '0 auto',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative'
  }}>
    {children}
  </div>
);

// Example response about Physics and Machine Learning
const EXAMPLE_RESPONSE = `# Foundations of Machine Learning through Physics

Physics has shaped AI, as highlighted by the 2024 Nobel Prize in Physics.

Key Contributions:
1. Hopfield Networks – using energy landscapes to recover patterns
2. Boltzmann Machines – applying statistical physics to neural design
3. Deep Learning – integrating physics principles into modern AI

Impact:
- Improved pattern recognition and memory
- Enhanced data retrieval from partial inputs
- Revolutionized NLP and computer vision

These contributions continue to drive AI innovation.`;

// Helper function to generate evenly distributed colors using HSL
const generateHighlightColors = (count: number): { solid: string, transparent: string }[] => {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * 360) / count;
    return {
      solid: `hsl(${hue}, 80%, 60%)`,
      transparent: `hsla(${hue}, 80%, 60%, 0.3)`
    };
  });
};

const ExampleComponent = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (
    action: UserAction,
    messages: Message[],
    sources: Source[],
    activeSources: Source[] | null,
    selectedSource: Source | null
  ) => {
    if (action.type === 'ADD_USER_MESSAGE') {
      const colors = generateHighlightColors(2);
      
      // Return response with citations directly
      return {
        sources: Promise.resolve([{
          id: 'physics-prize-2024',
          title: "The Nobel Prize in Physics 2024",
          type: "pdf" as const,
          relevance: 1,
          metadata: {
            authors: 'The Royal Swedish Academy of Sciences',
            year: '2024',
            pages: '8'
          }
        }]),
        response: Promise.resolve(EXAMPLE_RESPONSE),
        citations: Promise.resolve([
          {
            sourceId: 'physics-prize-2024',
            messageHighlight: {
              text: "Hopfield Networks – using energy landscapes to recover patterns",
              color: colors[0].solid
            },
            sourceHighlight: {
              page: 1,
              rect: { top: 0.2, left: 0.1, width: 0.8, height: 0.05 },
              highlightColorRgba: colors[0].transparent
            }
          },
          {
            sourceId: 'physics-prize-2024',
            messageHighlight: {
              text: "Boltzmann Machines – applying statistical physics to neural design",
              color: colors[1].solid
            },
            sourceHighlight: {
              page: 2,
              rect: { top: 0.3, left: 0.1, width: 0.8, height: 0.05 },
              highlightColorRgba: colors[1].transparent
            }
          }
        ])
      };
    }

    if (action.type === 'SET_SELECTED_SOURCE') {
      setIsProcessing(true);
      try {
        return {
          sourceData: fetch('https://www.nobelprize.org/uploads/2024/11/press-physicsprize2024-2.pdf')
            .then(res => res.arrayBuffer())
            .then(buffer => new Uint8Array(buffer))
        };
      } finally {
        setIsProcessing(false);
      }
    }

    return {};
  };

  return (
    <BaseLayout>
      <LexioProvider onAction={handleAction}>
        <div style={{ 
          display: 'grid',
          height: '100%',
          gridTemplateColumns: '350px 1fr',
          gap: '20px',
          width: '100%',
          boxSizing: 'border-box',
          minHeight: '760px',
          overflow: 'hidden'
        }}>
          {/* Left panel */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            height: '100%',
            width: '100%'
          }}>
            <div style={{ 
              height: '30%', 
              minHeight: '200px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <SourcesDisplay />
            </div>
            <div style={{ 
              height: '70%',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ 
                flex: 1,
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <ChatWindow />
              </div>
              <div style={{ height: '80px' }}>
                <AdvancedQueryField disabled={isProcessing} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ 
            height: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <ContentDisplay />
          </div>
        </div>
        <ErrorDisplay />
      </LexioProvider>
    </BaseLayout>
  );
};

const meta = {
  title: 'Additional Features/Citations',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 
`Citations in Lexio can be returned in two ways:

1. Promise-Based Response (shown in this example)

\`\`\`typescript
return {
  response: Promise.resolve({
    content: "Your content",
    citations: [{
      sourceId: "doc-1",
      messageHighlight: { ... },
      sourceHighlight: { ... }
    }]
  })
}
\`\`\`

2. Stream-Based Response

\`\`\`typescript
return {
  response: (async function* () {
    yield {
      content: "Part 1",
      citations: [{ ... }]
    };
    yield {
      content: "Part 2",
      citations: [{ ... }]
    };
  })()
}
\`\`\`

Citation Structure:

\`\`\`typescript
{
  sourceId: string;
  messageHighlight: {
    text: string;    // Text to highlight in response
    color: string;   // Highlight color
  };
  sourceHighlight: {
    page: number;    // Source page number
    rect: {          // Location in source (0-1 range)
      top: number;
      left: number;
      width: number;
      height: number;
    };
    highlightColorRgba: string;
  };
}
\`\`\`

This example shows promise-based citations with the 2024 Nobel Prize in Physics document, demonstrating how response text connects to source content.`
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  args: {}
};
