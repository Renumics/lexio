import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider, ChatWindow, AdvancedQueryField, ErrorDisplay, SourcesDisplay, ContentDisplay } from '../../../lib/main';
import type { Message, Source, UserAction } from '../../../lib/main';
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
const EXAMPLE_RESPONSE = "# Attention Is All You Need\n\nCore Components:\n\n1. Self-Attention utilizes Scaled Dot-Product Attention and Multi-Head Attention for constant sequential operations.\n\n2. Encoder-Decoder Architecture stacks self-attention with position-wise feed-forward networks, residual connections, and layer normalization.\n\n3. Positional Encoding adds order information to embeddings using sine and cosine functions.\n\n";

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
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);

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
          id: 'attention-paper',
          title: "Attention Is All You Need",
          type: "pdf" as const,
          relevance: 1,
          description: "The original Transformer paper that revolutionized natural language processing",
          href: "https://arxiv.org/pdf/1706.03762.pdf",
          metadata: {
            authors: 'Vaswani et al.',
            year: '2017',
            pages: '11',
            page: 1
          }
        }]),
        response: Promise.resolve(EXAMPLE_RESPONSE),
        citations: Promise.resolve([
          {
            sourceId: 'attention-paper',
            messageHighlight: {
              text: "Self-Attention utilizes Scaled Dot-Product Attention and Multi-Head Attention for constant sequential operations",
              color: colors[0].solid
            },
            sourceHighlight: {
              page: 4,
              rect: { top: 0.34, left: 0.17, width: 0.67, height: 0.04 },
              highlightColorRgba: colors[0].transparent
            }
          },
          {
            sourceId: 'attention-paper',
            messageHighlight: {
              text: "Encoder-Decoder Architecture stacks self-attention with position-wise feed-forward networks",
              color: colors[1].solid
            },
            sourceHighlight: {
              page: 3,
              rect: { top: 0.54, left: 0.17, width: 0.67, height: 0.06 },
              highlightColorRgba: colors[1].transparent
            }
          }
        ])
      };
    }

    if (action.type === 'SET_SELECTED_SOURCE') {
      setIsProcessing(true);
      try {
        const sourceDataPromise = fetch('https://arxiv.org/pdf/1706.03762')
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);
            }
            return res.arrayBuffer();
          })
          .then(buffer => new Uint8Array(buffer));

        // Set PDF as loaded when data is available
        sourceDataPromise.then(() => setIsPdfLoaded(true));
        
        return {
          sourceData: sourceDataPromise
        };
      } catch (error) {
        console.error("Error loading PDF:", error);
        throw error;
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
          gridTemplateColumns: '2fr 3fr',
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
            width: '100%',
            overflow: 'auto'
          }}>
            <div style={{ 
              height: '30%', 
              minHeight: '200px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              flex: '0 0 auto'
            }}>
              <SourcesDisplay />
            </div>
            <div style={{ 
              height: '70%',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              flex: '0 0 auto'
            }}>
              <div style={{ 
                flex: 1,
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                minHeight: '300px'
              }}>
                <ChatWindow />
              </div>
              <div style={{ 
                height: '80px',
                flex: '0 0 auto'
              }}>
                <AdvancedQueryField disabled={isProcessing} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white',
            height: '100%',
            width: '100%',
            boxSizing: 'border-box',
            flex: '0 0 auto',
            position: 'sticky',
            top: 0
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
`Citations allow Lexio to connect AI responses with their source material, providing transparency and verifiability to users. By highlighting text in both the response and source document, citations create visual links that help users verify information and explore supporting evidence.

Citations in Lexio can be returned in two ways:

## 1. Promise-Based Response (shown in this example)

Best for responses where all citations are known upfront:

\`\`\`typescript
return {
  response: Promise.resolve(responseText),
  citations: Promise.resolve([{
    sourceId: "doc-1",
    messageHighlight: { text: "...", color: "..." },
    sourceHighlight: { page: 1, rect: {...}, highlightColorRgba: "..." }
  }])
}
\`\`\`

## 2. Stream-Based Response

Ideal for real-time citation generation during streaming:

\`\`\`typescript
return {
  response: (async function* () {
    yield {
      content: "Part 1",
      citations: [{ sourceId: "...", messageHighlight: {...}, sourceHighlight: {...} }]
    };
    yield {
      content: "Part 2",
      citations: [{ sourceId: "...", messageHighlight: {...}, sourceHighlight: {...} }]
    };
  })()
}
\`\`\`

## Citation Structure

\`\`\`typescript
interface Citation {
  // Identifies the source document
  sourceId: string;
  
  // Defines how to highlight text in the response
  messageHighlight: {
    text: string;      // Text to highlight
    color: string;     // CSS color value
  };
  
  // Defines where to highlight in the source
  sourceHighlight: {
    page: number;      // Page number in source
    rect: {            // Rectangle coordinates (0-1 range)
      top: number;
      left: number;
      width: number;
      height: number;
    };
    highlightColorRgba: string;  // Semi-transparent highlight color
  };
}
\`\`\`

## Example

This example demonstrates promise-based citations with the "Attention Is All You Need" paper, showing how AI responses can be connected to their source material through synchronized highlighting between the response and the original paper.`
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
