import { useCallback, useMemo, useState } from 'react';
import {
  ChatWindow,
  LexioProvider,
  SourcesDisplay,
  ContentDisplay,
  AdvancedQueryField,
  ErrorDisplay,
  UserAction,
  Message,
  Source,
  createRESTContentSource,
  ActionHandlerResponse,
  Citation,
} from '../lib/main';
import { ExplanationProcessor, ExplanationResult, IdeaSource } from '../lib/explanation';
import './App.css';

// This is a temporary mocked response for testing purposes
// In the future, this will be replaced with a real response from the RAG system
const MOCKED_RESPONSE = {
  answer: "## Technical Implementation:\n\nThe DSAE architecture is designed to handle missing traffic data by learning robust representations that can reconstruct incomplete patterns. The denoising component helps the model become resilient to noise and missing values, while the stacked structure enables hierarchical feature extraction for better imputation accuracy."
}; 

const MOCKED_SOURCES = [{
  id: 'traffic-paper',
  title: "A deep learning based approach for traffic data imputation",
  type: "pdf" as const,
  relevance: 1,
  description: "IEEE paper introducing deep learning methods for handling missing traffic data using denoising stacked autoencoders",
  href: "https://ieeexplore.ieee.org/document/6957805",
  metadata: {
    authors: 'Y. Duan et al.',
    year: '2014',
    pages: '6',
    page: 1
  }
}];

function App() {
  // Add state to track the last processed message ID
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<string | undefined>(undefined);
  // Add new state variables for loading overlay
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);

  const contentSourceOptions = useMemo(() => ({
    buildFetchRequest: (_source: Source) => ({
      url: '/pdfs/traffic.pdf',
      options: {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          'Cache-Control': 'no-cache'
        },
        responseType: 'blob',
        credentials: 'same-origin'
      }
    }),
  }), []);

  const contentSource = createRESTContentSource(contentSourceOptions);

  const onAction = useCallback(async (
    action: UserAction,
    messages: Message[],
    _sources: Source[],
    _activeSources: Source[] | null,
    _selectedSource: Source | null
  ): Promise<ActionHandlerResponse> => {

    if (action.type === 'SET_SELECTED_SOURCE') {
      if (!action.sourceObject) {
        return {};
      }
      
      // Create a promise for fetching the source data
      const sourceDataPromise = contentSource(action.sourceObject);
      
      // Get the ID of the last message to use as messageId in citations
      const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : undefined;
      
      // Set PDF as loaded when source data is fetched
      sourceDataPromise.then(() => setIsPdfLoaded(true));
      
      // Return both sourceData and citations independently
      return {
        // Return source data immediately after fetching
        sourceData: sourceDataPromise.then(sourceWithData => {
          console.log('Source data fetched successfully');
          if (!sourceWithData.data) {
            throw new Error('No data returned from content source');
          }
          return sourceWithData.data;
        }),
        
        // Process citations based on explanation processor
        citations: Promise.resolve().then(async () => {
          try {
            // Check if we've already processed this message
            if (lastMessageId && lastMessageId === lastProcessedMessageId) {
              console.log('Skipping explanation processing - message already processed');
              return []; // Return empty array as citations are already displayed
            }
            
            setIsProcessing(true);
            
            // Start the full processing in the background
            const sourceWithData = await sourceDataPromise;
            const data = sourceWithData.data;
            
            // Normalize data to Uint8Array for processing
            let processableData: Uint8Array;
            if (data instanceof Blob) {
              const arrayBuffer = await data.arrayBuffer();
              processableData = new Uint8Array(arrayBuffer);
            } else if (data instanceof ArrayBuffer) {
              processableData = new Uint8Array(data);
            } else if (data instanceof Uint8Array) {
              processableData = data;
            } else {
              console.error(`Unsupported data type: ${typeof data}`);
              return [];
            }
            
            // Get the last message content for context, or use empty string if no messages
            const lastMessageContent = messages.length > 0 ? messages[messages.length - 1].content : "";
            
            // Process the document using ExplanationProcessor
            const explanationResult = await ExplanationProcessor.processResponse(
              lastMessageContent,
              processableData
            );

            console.log('Explanation result:', explanationResult);
            
            // Update the last processed message ID
            if (lastMessageId) {
              setLastProcessedMessageId(lastMessageId);
            }
            
            // Map explanation result to citations
            return mapExplanationResultToCitations(explanationResult, action.sourceId, lastMessageId);
            
          } catch (error) {
            console.error("Error processing citations:", error);
            // Return empty citations array if there's an error
            return [];
          } finally {
            setIsProcessing(false);
          }
        })
      };
    }

    if (action.type === 'ADD_USER_MESSAGE') {
      console.log('ADD_USER_MESSAGE action started');

      // For now, use the mocked response and sources, but let citations be generated
      return {
        response: Promise.resolve(MOCKED_RESPONSE.answer),
        sources: Promise.resolve(MOCKED_SOURCES),
        citations: Promise.resolve([]), // Empty citations - they'll be generated when source is selected
      };
    }

  }, [contentSource, lastProcessedMessageId]);

  return (
    <div className="app-container">
      <LexioProvider
        onAction={onAction}
        config={{
          timeouts: {
            stream: 10000
          }
        }}
      >
        <div
          style={{
            display: 'grid',
            height: '100vh',
            width: '100%',
            gridTemplateColumns: '1fr 2fr',
            gridTemplateRows: '1fr 100px',
            gap: '20px',
            gridTemplateAreas: `
                            "chat viewer"
                            "input viewer"
                        `,
            maxHeight: '100vh',
            overflow: 'hidden',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              gridArea: 'chat',
              overflow: 'auto',
              minWidth: 0,
              maxWidth: '100%',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: '1', overflow: 'auto', height: '50%' }}>
                <SourcesDisplay />
              </div>
              <div style={{ flex: '1', overflow: 'auto', height: '50%' }}>
                <ChatWindow />
              </div>
            </div>
          </div>

          <div
            style={{
              gridArea: 'input',
              height: '100px',
              minWidth: 0,
              maxWidth: '100%',
            }}
          >
            <AdvancedQueryField disabled={isProcessing} />
          </div>

          <div
            style={{
              gridArea: 'viewer',
              overflow: 'hidden',
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            <ContentDisplay />
            {isPdfLoaded && isProcessing && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.85)', // More opaque
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999999, // Much higher z-index
                pointerEvents: 'all' // Ensure the overlay captures clicks
              }}>
                <div style={{
                  padding: '16px 24px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <div style={{
                    color: '#1a1a1a',
                    fontSize: '14px',
                    fontWeight: 500
                  }}>Searching for message ideas in source...</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <ErrorDisplay />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </LexioProvider>
    </div>
  );
}

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

// Helper function to map explanation result to citations
function mapExplanationResultToCitations(
  explanationResult: ExplanationResult,
  sourceId: string,
  messageId: string | undefined
): Omit<Citation, 'id'>[] {
  if (!explanationResult.ideaSources || !explanationResult.ideaSources.length) {
    return [];
  }
  
  // Generate colors for the number of ideas we have
  const colors = generateHighlightColors(explanationResult.ideaSources.length);
  
  // Map each idea source to citations
  const processedCitations = explanationResult.ideaSources.flatMap((ideaSource: IdeaSource, ideaIndex: number) => {
    // Get color pair for this idea
    const colorPair = colors[ideaIndex];
    
    // Map each supporting evidence to a citation
    return ideaSource.supporting_evidence
      .filter((evidence): evidence is typeof evidence & { highlight: NonNullable<typeof evidence.highlight> } => 
        evidence.highlight != null && evidence.highlight.page > 0
      )
      .map(evidence => ({
        sourceId: sourceId,
        messageId: messageId,
        messageHighlight: {
          text: ideaSource.answer_idea,
          color: colorPair.solid
        },
        sourceHighlight: {
          page: evidence.highlight.page,
          rect: evidence.highlight.rect || {
            top: 0,
            left: 0,
            width: 0,
            height: 0
          },
          highlightColorRgba: colorPair.transparent
        }
      } as Omit<Citation, 'id'>));
  });
  
  return processedCitations;
}

export default App;