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
  answer: "# Deep Learning for Traffic Data Imputation\n\nDeep learning improves traffic data imputation by **automatically learning patterns** without manual feature selection. The *Denoising Stacked Autoencoder* (DSAE) approach treats missing and observed data as a whole, enabling robust recovery through:\n\n1. Layer-wise pre-training\n2. Fine-tuning\n\nCompared to traditional methods like ARIMA and k-NN, it maintains:\n- Higher accuracy\n- Stable error rates\n\nAcross different missing data levels, as demonstrated on Caltrans PeMS traffic data.\n\nThe DSAE model architecture consists of multiple layers that progressively encode the input data into a lower-dimensional representation before reconstructing it. This approach is particularly effective for handling the temporal and spatial correlations in traffic data.\n\n```python\n# Example code for DSAE implementation\nimport tensorflow as tf\n\ndef build_autoencoder(input_dim, encoding_dim):\n    # Define encoder\n    input_layer = tf.keras.layers.Input(shape=(input_dim,))\n    encoder = tf.keras.layers.Dense(encoding_dim, activation='relu')(input_layer)\n    \n    # Define decoder\n    decoder = tf.keras.layers.Dense(input_dim, activation='sigmoid')(encoder)\n    \n    # Define autoencoder\n    autoencoder = tf.keras.Model(inputs=input_layer, outputs=decoder)\n    return autoencoder\n```\n\nExperimental results show that DSAE outperforms traditional methods in both accuracy and computational efficiency. The model was validated using real-world traffic data from multiple highway segments."
};

const MOCKED_SOURCES = [{
  title: 'Deep Learning for Traffic Data Imputation',
  type: 'pdf' as const,
  relevance: 1,
  metadata: {
    id: 'traffic-imputation.pdf',
    authors: 'Chen et al.',
    year: '2023',
    pages: '6'
  }
}];

function App() {
  // Add state to track the last processed message ID
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<string | undefined>(undefined);

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
          },
          llms: {
            OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
            OPENAI_ENDPOINT: 'https://api.openai.com/v1',
            ideaSplittingMethod: 'llm' as const
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
            <AdvancedQueryField />
          </div>

          <div
            style={{
              gridArea: 'viewer',
              overflow: 'hidden',
              width: '100%',
              height: '100%',
            }}
          >
            <ContentDisplay />
          </div>
        </div>
        <ErrorDisplay />
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