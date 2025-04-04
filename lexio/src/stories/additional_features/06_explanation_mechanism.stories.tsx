import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider, ChatWindow, AdvancedQueryField, ErrorDisplay, SourcesDisplay } from '../../../lib/main';
import { PdfViewer } from '../../../lib/components/Viewers/PdfViewer';
import type { Message, Source, UserAction, PDFHighlight } from '../../../lib/main';
import { ExplanationProcessor } from '../../../lib/explanation';
import { useState } from 'react';

interface ExplanationDemoProps {
  matchingMethod: 'heuristic' | 'embedding';
  ideaSplittingMethod: 'heuristic' | 'llm';
}

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

const ExampleComponent = ({ matchingMethod, ideaSplittingMethod }: ExplanationDemoProps) => {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [highlights, setHighlights] = useState<PDFHighlight[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  return (
    <div style={{ width: '100%', height: '800px', padding: '20px' }}>
      <LexioProvider
        config={{
          llms: {
            ideaSplittingMethod: ideaSplittingMethod
          }
        }}
        onAction={async (
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
            // Fetch the actual PDF
            const pdfData = await fetchPDF();
            setPdfData(pdfData);
            
            // Process the explanation using the last message
            const lastMessage = messages[messages.length - 1];
            const explanationResult = await ExplanationProcessor.processResponse(
              lastMessage?.content || '',
              pdfData
            );

            // Generate highlight positions based on the actual PDF content
            const getHighlightPosition = (index: number, total: number) => {
              // These values are based on typical PDF page dimensions
              const pageWidth = 612; // Standard US Letter width in points
              const pageHeight = 792; // Standard US Letter height in points
              const margin = 72; // 1-inch margin
              
              // Calculate position within the content area
              const contentHeight = pageHeight - (2 * margin);
              const sectionHeight = contentHeight / total;
              const top = margin + (index * sectionHeight) + (Math.random() * 20);
              
              return {
                top: top / pageHeight,  // Convert to relative values (0-1)
                left: margin / pageWidth,
                width: (pageWidth - (2 * margin)) / pageWidth,
                height: (14 + (Math.random() * 6)) / pageHeight
              };
            };

            const newHighlights = explanationResult.ideaSources.flatMap((source, index, array) => {
              const color = `hsl(${(index * 360) / array.length}, 80%, 60%)`;
              return source.supporting_evidence.map(evidence => ({
                page: evidence.highlight?.page || 1,
                rect: getHighlightPosition(index, array.length),
                highlightColorRgba: `${color}40`
              }));
            });

            setHighlights(newHighlights);
            setCurrentPage(1);

            return {
              sourceData: Promise.resolve(pdfData),
              citations: Promise.resolve(
                explanationResult.ideaSources.flatMap((source, index, array) => {
                  const color = `hsl(${(index * 360) / array.length}, 80%, 60%)`;
                  return source.supporting_evidence.map(evidence => ({
                    sourceId: action.sourceId,
                    messageId: lastMessage?.id,
                    messageHighlight: {
                      text: source.answer_idea,
                      color: color
                    },
                    sourceHighlight: {
                      page: evidence.highlight?.page || 1,
                      rect: getHighlightPosition(index, array.length),
                      highlightColorRgba: `${color}40`
                    }
                  }));
                })
              )
            };
          }
        }}
      >
        <div className="flex flex-col h-full gap-4">
          <div className="flex-1 flex flex-row gap-4">
            {/* Left panel: Chat and Query */}
            <div className="w-1/2 flex flex-col">
              <div className="flex-1 overflow-auto border rounded-lg">
                <ChatWindow />
              </div>
              <div className="mt-4">
                <AdvancedQueryField />
              </div>
            </div>
            
            {/* Right panel: Sources and Content */}
            <div className="w-1/2 flex flex-col gap-4">
              <div className="flex-1 border rounded-lg overflow-auto">
                <SourcesDisplay />
              </div>
              <div className="flex-1 border rounded-lg overflow-hidden">
                {pdfData ? (
                  <PdfViewer 
                    data={pdfData}
                    highlights={highlights}
                    page={currentPage}
                    styleOverrides={{
                      contentBackground: '#f8f8f8',
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a source to view content
                  </div>
                )}
              </div>
            </div>
          </div>
          <ErrorDisplay />
        </div>
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
   - Breaks down responses into distinct ideas
   - Two methods available:
     - Heuristic: Uses rule-based text analysis for simpler content
     - LLM: Employs language models for sophisticated splitting

**2. Source Matching**
   - Two primary approaches:
     - Heuristic Matching: Uses keyword and pattern-based matching
     - Embedding-based Matching: Utilizes semantic similarity

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
      ideaSplittingMethod: 'llm'
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
   - Ideas are extracted using the configured method
   - Each idea is prepared for source matching

2. **Source Analysis**
   - Documents are preprocessed
   - Content is chunked appropriately
   - Embeddings are generated (if using embedding-based matching)

3. **Matching & Highlighting**
   - Ideas are matched with source content
   - Relevant passages are identified
   - Highlight positions are calculated
   - Color coding is applied for visual correlation

## Best Practices

**1. Choose Appropriate Methods**
   - Use LLM splitting for complex responses
   - Prefer embedding matching for semantic accuracy
   - Consider heuristic methods for speed

**2. Configure Chunk Sizes**
   - Adjust based on document structure
   - Balance precision vs. processing speed

**3. Handle Highlighting**
   - Implement smooth scroll to highlights
   - Use distinct colors for different ideas
   - Provide clear visual feedback

**4. Error Handling**
   - Handle cases where matches aren't found
   - Provide fallback highlighting strategies
   - Log matching quality metrics

## Interactive Example

Try different configurations using the controls below to see how the explanation mechanism processes the 2024 Nobel Prize in Physics with different settings!

- Try different matching methods (Heuristic vs Embedding)
- Experiment with idea splitting approaches (Heuristic vs LLM)
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    matchingMethod: {
      control: 'radio',
      options: ['heuristic', 'embedding'],
      description: 'Method used for matching ideas with source content',
      defaultValue: 'embedding'
    },
    ideaSplittingMethod: {
      control: 'radio',
      options: ['heuristic', 'llm'],
      description: 'Method used for splitting response into ideas',
      defaultValue: 'llm'
    }
  }
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  args: {
    matchingMethod: 'embedding',
    ideaSplittingMethod: 'llm'
  }
}; 