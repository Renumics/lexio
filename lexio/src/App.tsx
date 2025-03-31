import { useCallback, useMemo } from 'react';
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
import { ExplanationProcessor } from '../lib/explanation';
import './App.css';

// This is a temporary mocked response for testing purposes
// In the future, this will be replaced with a real response from the RAG system
const MOCKED_RESPONSE = {
  answer: "# Deep Learning for Traffic Data Imputation\n\nDeep learning improves traffic data imputation by **automatically learning patterns** without manual feature selection. The *Denoising Stacked Autoencoder* (DSAE) approach treats missing and observed data as a whole, enabling robust recovery through:\n\n1. Layer-wise pre-training\n2. Fine-tuning\n\nCompared to traditional methods like ARIMA and k-NN, it maintains:\n- Higher accuracy\n- Stable error rates\n\nAcross different missing data levels, as demonstrated on Caltrans PeMS traffic data.\n\nThe DSAE model architecture consists of multiple layers that progressively encode the input data into a lower-dimensional representation before reconstructing it. This approach is particularly effective for handling the temporal and spatial correlations in traffic data.\n\n```python\n# Example code for DSAE implementation\nimport tensorflow as tf\n\ndef build_autoencoder(input_dim, encoding_dim):\n    # Define encoder\n    input_layer = tf.keras.layers.Input(shape=(input_dim,))\n    encoder = tf.keras.layers.Dense(encoding_dim, activation='relu')(input_layer)\n    \n    # Define decoder\n    decoder = tf.keras.layers.Dense(input_dim, activation='sigmoid')(encoder)\n    \n    # Define autoencoder\n    autoencoder = tf.keras.Model(inputs=input_layer, outputs=decoder)\n    return autoencoder\n```\n\nExperimental results show that DSAE outperforms traditional methods in both accuracy and computational efficiency. The model was validated using real-world traffic data from multiple highway segments."
};

const MOCKED_CITATIONS = [
  // Page 1 citation - Title and introduction
  {
    sourceIndex: 0,
    messageHighlight: {
      text: "# Deep Learning for Traffic Data Imputation",
      color: '#ffeb3b'  // Yellow
    },
    sourceHighlight: {
      page: 1,
      rect: {
        top: 0.2,
        left: 0.1,
        width: 0.8,
        height: 0.1
      }
    }
  },
  // Page 2 citation - DSAE approach
  {
    sourceIndex: 0,
    messageHighlight: {
      text: "The Denoising Stacked Autoencoder (DSAE) approach treats missing and observed data as a whole, enabling robust recovery through",
      color: '#4caf50'  // Green
    },
    sourceHighlight: {
      page: 2,
      rect: {
        top: 0.3,
        left: 0.2,
        width: 0.7,
        height: 0.15
      }
    }
  },
  // Page 3 citation - Comparison with traditional methods
  {
    sourceIndex: 0,
    messageHighlight: {
      startChar: 177,
      endChar: 245,
      color: '#2196f3'  // Blue
    },
    sourceHighlight: {
      page: 3,
      rect: {
        top: 0.4,
        left: 0.15,
        width: 0.75,
        height: 0.12
      }
    }
  },
  // Page 4 citation - DSAE architecture
  {
    sourceIndex: 0,
    messageHighlight: {
      startChar: 310,
      endChar: 420,
      color: '#9c27b0'  // Purple
    },
    sourceHighlight: {
      page: 4,
      rect: {
        top: 0.25,
        left: 0.1,
        width: 0.8,
        height: 0.2
      }
    }
  },
  // Page 5 citation - Code example
  {
    sourceIndex: 0,
    messageHighlight: {
      startChar: 500,
      endChar: 650,
      color: '#f44336'  // Red
    },
    sourceHighlight: {
      page: 5,
      rect: {
        top: 0.5,
        left: 0.1,
        width: 0.8,
        height: 0.3
      }
    }
  },
  // Page 6 citation - Experimental results
  {
    sourceIndex: 0,
    messageHighlight: {
      startChar: 700,
      endChar: 830,
      color: '#ff9800'  // Orange
    },
    sourceHighlight: {
      page: 6,
      rect: {
        top: 0.6,
        left: 0.2,
        width: 0.7,
        height: 0.15
      }
    }
  }
];

const MOCKED_SOURCES = [{
  title: 'Deep Learning for Traffic Data Imputation',
  type: 'pdf' as const,
  relevance: 1,
  metadata: {
    id: 'traffic-imputation.pdf',
    authors: 'Chen et al.',
    year: '2023',
    pages: '6'  // Updated to reflect 6 pages
  }
}];

function App() {

  const contentSourceOptions = useMemo(() => ({
    buildFetchRequest: (_source: Source) => ({
      // url: '/pdfs/deepseek.pdf',  
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
        
        // Process citations based on mocked data for now
        citations: Promise.resolve().then(async () => {
          try {
            // Mock some citations for demonstration
            const mockCitations = [
              {
                sourceId: action.sourceId,
                messageId: lastMessageId, // Reference to the current/last message
                messageHighlight: {
                  text: "Deep learning improves traffic data imputation"
                },
                sourceHighlight: {
                  page: 1,
                  rect: {
                    top: 0.38,
                    left: 0.08,
                    width: 0.40,
                    height: 0.02
                  },
                  highlightColorRgba: 'rgba(255, 235, 59, 0.5)' // Yellow with 50% opacity
                }
              },
              {
                sourceId: action.sourceId,
                messageId: lastMessageId, // Reference to the current/last message
                messageHighlight: {
                  text: "The Denoising Stacked Autoencoder (DSAE) approach"
                },
                sourceHighlight: {
                  page: 2,
                  rect: {
                    top: 0.52,
                    left: 0.51,
                    width: 0.40,
                    height: 0.04
                  },
                  highlightColorRgba: 'rgba(76, 175, 80, 0.5)' // Green with 50% opacity
                }
              },
              {
                sourceId: action.sourceId,
                messageId: lastMessageId, // Reference to the current/last message
                messageHighlight: {
                  text: "Higher accuracy and stable error rates"
                },
                sourceHighlight: {
                  page: 5,
                  rect: {
                    top: 0.45,
                    left: 0.51,
                    width: 0.40,
                    height: 0.03
                  },
                  highlightColorRgba: 'rgba(33, 150, 243, 0.5)' // Blue with 50% opacity
                }
              }
            ] as Omit<Citation, 'id'>[];
            
            return mockCitations;
            
            /* 
            // COMMENTED OUT: ExplanationProcessor implementation for future use
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
              // Return initial citations if data type is unsupported
              return [{
                sourceId: action.sourceId,
                sourceHighlight: {
                  page: 1,
                  rect: {
                    top: 0.2,
                    left: 0.1,
                    width: 0.8,
                    height: 0.1
                  }
                }
              }] as Omit<Citation, 'id'>[];
            }
            
            // Get the last message content for context, or use empty string if no messages
            const lastMessageContent = messages.length > 0 ? messages[messages.length - 1].content : "";
            
            // Process the document using ExplanationProcessor
            const explanationResult = await ExplanationProcessor.processResponse(
              lastMessageContent,
              processableData
            );

            console.log('Explanation result:', explanationResult);
            
            // Map explanation result to citations
            return mapExplanationResultToCitations(explanationResult, action.sourceId, lastMessageId);
            */
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

      // For now, use the mocked response
      const ragResponse = MOCKED_RESPONSE.answer;
      
      // For now, return the mocked data
      return {
        response: Promise.resolve(ragResponse),
        sources: Promise.resolve(MOCKED_SOURCES),
        citations: Promise.resolve(MOCKED_CITATIONS),
      };
    }

  }, [contentSource]);

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

/* 
// COMMENTED OUT: Helper function for future use
// Helper function to map explanation result to citations
function mapExplanationResultToCitations(explanationResult, sourceId, messageId) {
  if (!explanationResult.ideaSources || !explanationResult.ideaSources.length) {
    return [];
  }
  
  // Generate a color palette for different ideas
  const colors = ['#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#f44336', '#ff9800'];
  
  // Map each idea source to citations
  const processedCitations = explanationResult.ideaSources.flatMap((ideaSource, ideaIndex) => {
    // Get color for this idea
    const color = colors[ideaIndex % colors.length] + '80'; // Add 50% opacity
    
    // Map each supporting evidence to a citation
    return ideaSource.supporting_evidence
      .filter(evidence => evidence.highlight && evidence.highlight.page > 0)
      .map(evidence => ({
        sourceId: sourceId,
        messageId: messageId, // Add reference to the message
        messageHighlight: {
          text: ideaSource.answer_idea
        },
        sourceHighlight: {
          page: evidence.highlight.page,
          rect: evidence.highlight.rect,
          highlightColorRgba: color
        }
      }));
  });
  
  // Return processed citations if available, otherwise return initial citations
  return processedCitations.length > 0 ? processedCitations : [{
    sourceId: sourceId,
    messageId: messageId, // Add reference to the message
    sourceHighlight: {
      page: 1,
      rect: {
        top: 0.2,
        left: 0.1,
        width: 0.8,
        height: 0.1
      }
    }
  }] as Omit<Citation, 'id'>[];
}
*/

export default App;