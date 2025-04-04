import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider, ChatWindow, AdvancedQueryField, ErrorDisplay, SourcesDisplay } from '../../../lib/main';
import { PdfViewer } from '../../../lib/components/Viewers/PdfViewer';
import type { Message, Source, UserAction, PDFHighlight } from '../../../lib/main';
import { ExplanationProcessor } from '../../../lib/explanation';
import { useState } from 'react';

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

// Fetch the PDF from the local file
const fetchPDF = async (): Promise<Uint8Array> => {
  try {
    const response = await fetch('/pdfs/physicsprize2024.pdf');
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

// Memoize the colors to prevent regeneration on every render
const memoizedGenerateHighlightColors = (count: number) => {
  const colors = generateHighlightColors(count);
  return colors;
};

const ExampleComponent = () => {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [highlights, setHighlights] = useState<PDFHighlight[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Memoize the LexioProvider onAction callback to prevent unnecessary re-renders
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
          metadata: {
            authors: 'The Royal Swedish Academy of Sciences',
            year: '2024',
            pages: '8'
          }
        }]),
        response: Promise.resolve(EXAMPLE_RESPONSE)
      };
    }

    if (action.type === 'SET_SELECTED_SOURCE') {
      try {
        setIsProcessing(true);
        // Fetch the actual PDF
        const pdfData = await fetchPDF();
        setPdfData(pdfData);
        
        // Process the explanation using the last message
        const lastMessage = messages[messages.length - 1];
        const explanationResult = await ExplanationProcessor.processResponse(
          lastMessage?.content || '',
          pdfData
        );

        // Generate colors for the number of ideas we have
        const colors = memoizedGenerateHighlightColors(explanationResult.ideaSources.length);

        // Map each idea source to highlights
        const newHighlights = explanationResult.ideaSources.flatMap((source, index) => {
          const colorPair = colors[index];
          return source.supporting_evidence
            .filter(evidence => evidence.highlight?.page && evidence.highlight.page > 0)
            .map(evidence => {
              // Update current page to the first highlight's page
              if (index === 0) {
                setCurrentPage(evidence.highlight!.page);
              }
              return {
                page: evidence.highlight!.page,
                rect: evidence.highlight!.rect || {
                  top: 0.2 + (index * 0.1),
                  left: 0.1,
                  width: 0.8,
                  height: 0.05
                },
                highlightColorRgba: colorPair.transparent
              };
            });
        });

        setHighlights(newHighlights);

        return {
          sourceData: Promise.resolve(pdfData),
          citations: Promise.resolve(
            explanationResult.ideaSources.flatMap((source, index) => {
              const colorPair = colors[index];
              return source.supporting_evidence
                .filter(evidence => evidence.highlight?.page && evidence.highlight.page > 0)
                .map(evidence => ({
                  sourceId: action.sourceId,
                  messageId: lastMessage?.id,
                  messageHighlight: {
                    text: source.answer_idea,
                    color: colorPair.solid
                  },
                  sourceHighlight: {
                    page: evidence.highlight!.page,
                    rect: evidence.highlight!.rect || {
                      top: 0.2 + (index * 0.1),
                      left: 0.1,
                      width: 0.8,
                      height: 0.05
                    },
                    highlightColorRgba: colorPair.transparent
                  }
                }));
            })
          )
        };
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '800px', padding: '20px' }}>
      <LexioProvider
        config={{
          llms: {
            ideaSplittingMethod: 'heuristic'
          }
        }}
        onAction={handleAction}
      >
        <div className="grid h-full gap-4" style={{ gridTemplateColumns: '40% 60%' }}>
          {/* Left panel: Sources (top) and Chat (bottom) */}
          <div className="flex flex-col gap-4">
            {/* Sources on top */}
            <div className="h-1/3 border rounded-lg overflow-auto bg-white">
              <SourcesDisplay />
            </div>
            {/* Chat and Query on bottom */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-auto border rounded-lg bg-white">
                <ChatWindow />
              </div>
              <div className="mt-4">
                <AdvancedQueryField disabled={isProcessing} />
              </div>
            </div>
          </div>
          
          {/* Right panel: Full height PDF viewer (60% width) */}
          <div className="border rounded-lg overflow-hidden bg-white">
            {pdfData ? (
              <PdfViewer 
                data={pdfData}
                highlights={highlights}
                page={currentPage}
                styleOverrides={{
                  contentBackground: '#ffffff',
                  toolbarBackground: '#f8f9fa',
                  borderRadius: '0.5rem'
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a source to view content
              </div>
            )}
          </div>
        </div>
        <ErrorDisplay />
      </LexioProvider>
    </div>
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

The Explanation Mechanism is a core feature of Lexio that connects generated responses with their source material through intelligent matching and highlighting. This example demonstrates how it works using the 2024 Nobel Prize in Physics as source material.

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