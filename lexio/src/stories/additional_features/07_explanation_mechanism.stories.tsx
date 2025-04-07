import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider, ChatWindow, AdvancedQueryField, ErrorDisplay, SourcesDisplay, ContentDisplay } from '../../../lib/main';
import type { Message, Source, UserAction } from '../../../lib/main';
import { ExplanationProcessor } from '../../../lib/explanation';
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

// Fetch the PDF
const fetchPDF = async (): Promise<Uint8Array> => {
  try {
    const response = await fetch('/pdfs/physicsprize2024.pdf');
    //const response = await fetch('https://www.nobelprize.org/uploads/2024/10/popular-physicsprize2024-2.pdf');
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    throw error;
  }
};

// Helper function to generate evenly distributed colors using HSL
const generateHighlightColors = (count: number): { solid: string, transparent: string }[] => {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * 360) / count;
    // Using higher saturation (80%) and lightness (60%) for better visibility
    return {
      solid: `hsl(${hue}, 80%, 60%)`,
      transparent: `hsla(${hue}, 80%, 60%, 0.3)`
    };
  });
};

const ExampleComponent = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<string | undefined>(undefined);

  const handleAction = async (
    action: UserAction,
    messages: Message[],
    sources: Source[],
    activeSources: Source[] | null,
    selectedSource: Source | null
  ) => {
    if (action.type === 'ADD_USER_MESSAGE') {
      return {
        sources: Promise.resolve([{
          id: 'physics-prize-2024',
          title: "The Nobel Prize in Physics 2024",
          type: "pdf" as const,
          relevance: 1,
          description: "Popular science background on the 2024 Nobel Prize in Physics",
          href: "https://www.nobelprize.org/uploads/2024/10/popular-physicsprize2024-2.pdf",
          metadata: {
            authors: 'The Royal Swedish Academy of Sciences',
            year: '2024',
            pages: '8',
            page: 1
          }
        }]),
        response: Promise.resolve(EXAMPLE_RESPONSE)
      };
    }

    if (action.type === 'SET_SELECTED_SOURCE') {
      try {
        setIsProcessing(true);
        
        // Get the ID of the last message to use as messageId in citations
        const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : undefined;
        
        // Check if we've already processed this message
        if (lastMessageId && lastMessageId === lastProcessedMessageId) {
          console.log('Skipping explanation processing - message already processed');
          // Return source data with page 1 even when skipping processing
          return {
            sourceData: fetchPDF()
          };
        }

        // Create a promise for fetching the source data
        const sourceDataPromise = fetchPDF();
        
        // Return both sourceData and citations independently
        return {
          // Return source data immediately after fetching
          sourceData: sourceDataPromise,
          
          // Process citations based on explanation processor
          citations: Promise.resolve().then(async () => {
            try {
              // Start the full processing in the background
              const pdfData = await sourceDataPromise;
              
              // Get the last message content for context
              const lastMessageContent = messages.length > 0 ? messages[messages.length - 1].content : "";
              
              // Process the document using ExplanationProcessor
              const explanationResult = await ExplanationProcessor.processResponse(
                lastMessageContent,
                pdfData
              );

              // Update the last processed message ID
              if (lastMessageId) {
                setLastProcessedMessageId(lastMessageId);
              }

              // Map explanation results to citations with color coding
              return explanationResult.ideaSources.flatMap((source, index) => {
                const colorPair = generateHighlightColors(explanationResult.ideaSources.length)[index];
                
                return source.supporting_evidence
                  .filter(evidence => evidence.highlight?.page && evidence.highlight.page > 0)
                  .map(evidence => ({
                    sourceId: action.sourceId,
                    messageId: lastMessageId,
                    messageHighlight: {
                      text: source.answer_idea,
                      color: colorPair.solid
                    },
                    sourceHighlight: {
                      page: evidence.highlight!.page,
                      rect: evidence.highlight!.rect,
                      highlightColorRgba: colorPair.transparent
                    }
                  }));
              });
            } catch (error) {
              console.error("Error processing citations:", error);
              // Return empty citations array if there's an error
              return [];
            }
          })
        };
      } finally {
        setIsProcessing(false);
      }
    }

    return {};
  };

  return (
    <BaseLayout>
      <LexioProvider
        config={{
          llms: {
            ideaSplittingMethod: 'heuristic'
          }
        }}
        onAction={handleAction}
      >
        <div style={{ 
          display: 'grid',
          height: '100%',
          gridTemplateColumns: '3fr 4fr',
          gridTemplateRows: '1fr',
          gap: '20px',
          width: '100%',
          boxSizing: 'border-box',
          minHeight: '760px',
          overflow: 'visible'
        }}>
          {/* Left panel: Sources (top) and Chat (bottom) */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            height: '100%',
            minWidth: '350px',
            maxWidth: '350px',
            width: '100%',
            boxSizing: 'border-box',
            flex: '0 0 auto'
          }}>
            {/* Sources on top */}
            <div style={{ 
              height: '30%', 
              minHeight: '200px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'auto',
              backgroundColor: 'white',
              width: '100%',
              boxSizing: 'border-box',
              flex: '0 0 auto'
            }}>
              <SourcesDisplay />
            </div>
            {/* Chat and Query on bottom */}
            <div style={{ 
              height: '70%',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              width: '100%',
              boxSizing: 'border-box',
              flex: '0 0 auto'
            }}>
              <div style={{ 
                flex: 1,
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'auto',
                backgroundColor: 'white',
                minHeight: '300px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <ChatWindow />
              </div>
              <div style={{ 
                height: '80px',
                width: '100%',
                boxSizing: 'border-box',
                flex: '0 0 auto'
              }}>
                <AdvancedQueryField disabled={isProcessing} />
              </div>
            </div>
          </div>

          {/* Right panel: Full height PDF viewer */}
          <div style={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'auto',
            backgroundColor: 'white',
            height: '100%',
            minWidth: '550px',
            maxWidth: '550px',
            width: '100%',
            boxSizing: 'border-box',
            flex: '0 0 auto'
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
  title: 'Additional Features/Explanation Mechanism',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Introduction

Lexio's Explanation Mechanism helps connect generated responses with their source material through intelligent matching and highlighting.

## Matching Approaches

Lexio provides two methods for matching responses with sources:

**1. Heuristic Matching**
   - Fast, rule-based pattern matching
   - Suitable for prototypes and demos
   - No external API dependencies

**2. API-Based Matching**
   - Higher accuracy for production use
   - Advanced semantic understanding
   - Configurable matching parameters

## Key Components

**1. Idea Splitting**
   - Breaks down responses into distinct ideas using rule-based text analysis

**2. Source Matching**
   - Uses pattern-based matching to connect ideas with source content
   - Identifies relevant passages and their locations

**3. Highlighting System**
   - Automatically generates color-coded highlights
   - Links response segments to source document locations
   - Provides visual feedback for source verification

## Implementation Example

Here's how to implement the explanation mechanism with the Lexio provider:

\`\`\`tsx
<LexioProvider
  config={{
    llms: {
      ideaSplittingMethod: 'heuristic'
    }
  }}
  onAction={async (action) => {
    if (action.type === 'SET_SELECTED_SOURCE') {
      // Get your source data (PDF, HTML, etc.)
      const sourceData = await fetchSourceData();
      
      // Process the explanation
      const explanationResult = await ExplanationProcessor.processResponse(
        messageContent,
        sourceData
      );
      
      // Map the results to citations with color coding
      const citations = explanationResult.ideaSources.flatMap((source, index) => {
        const color = generateColor(index, explanationResult.ideaSources.length);
        return source.supporting_evidence.map(evidence => ({
          sourceId: sourceId,
          messageId: messageId,
          messageHighlight: {
            text: source.answer_idea,
            color: color
          },
          sourceHighlight: {
            page: evidence.highlight.page,
            rect: evidence.highlight.rect,
            highlightColorRgba: \`\${color}40\`
          }
        }));
      });
      
      return {
        sourceData: Promise.resolve(sourceData),
        citations: Promise.resolve(citations)
      };
    }
  }}
>
  <YourComponents />
</LexioProvider>
\`\`\`

## Processing Flow

1. **Response Processing**
   - Message content is analyzed
   - Ideas are extracted using rule-based analysis
   - Each idea is prepared for source matching

2. **Source Analysis**
   - Documents are preprocessed
   - Content is chunked appropriately
   - Pattern matching is applied

3. **Matching & Highlighting**
   - Ideas are matched with source content
   - Relevant passages are identified
   - Highlight positions are calculated
   - Color coding is applied for visual correlation

## Best Practices

**1. Configure Chunk Sizes**
   - Adjust based on document structure
   - Balance precision vs. processing speed

**2. Handle Highlighting**
   - Implement smooth scroll to highlights
   - Use distinct colors for different ideas
   - Provide clear visual feedback

**3. Error Handling**
   - Handle cases where matches aren't found
   - Provide fallback highlighting strategies
   - Log matching quality metrics

## Interactive Example

This example demonstrates how the explanation mechanism processes the 2024 Nobel Prize in Physics, showing how ideas are matched with source content and highlighted in both the response and the document.
        `
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