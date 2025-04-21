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
  //answer: "# Deep Learning for Traffic Data Imputation\n\nDeep learning improves traffic data imputation by **automatically learning patterns** without manual feature selection. The *Denoising Stacked Autoencoder* (DSAE) approach treats missing and observed data as a whole, enabling robust recovery through:\n\n1. Layer-wise pre-training\n2. Fine-tuning\n\nCompared to traditional methods like ARIMA and k-NN, it maintains:\n- Higher accuracy\n- Stable error rates\n\nAcross different missing data levels, as demonstrated on Caltrans PeMS traffic data.\n\nThe DSAE model architecture consists of multiple layers that progressively encode the input data into a lower-dimensional representation before reconstructing it. This approach is particularly effective for handling the temporal and spatial correlations in traffic data.\n\n```python\n# Example code for DSAE implementation\nimport tensorflow as tf\n\ndef build_autoencoder(input_dim, encoding_dim):\n    # Define encoder\n    input_layer = tf.keras.layers.Input(shape=(input_dim,))\n    encoder = tf.keras.layers.Dense(encoding_dim, activation='relu')(input_layer)\n    \n    # Define decoder\n    decoder = tf.keras.layers.Dense(input_dim, activation='sigmoid')(encoder)\n    \n    # Define autoencoder\n    autoencoder = tf.keras.Model(inputs=input_layer, outputs=decoder)\n    return autoencoder\n```\n\nExperimental results show that DSAE outperforms traditional methods in both accuracy and computational efficiency. The model was validated using real-world traffic data from multiple highway segments."
  //answer: "# Deep Learning for Retrieval-Augmented Generation\n\nDeep learning improves retrieval-augmented generation by **jointly optimizing retrieval and generation** using expected utility maximization. The *Stochastic RAG* framework addresses limitations of traditional RAG models by enabling end-to-end differentiable training through:\n\n1. Modeling retrieval as **sampling without replacement**\n2. Applying **straight-through Gumbel-top-k** for gradient-based learning\n\nCompared to pipeline-based methods, it achieves:\n- Higher task-specific performance (EM, BLEU, F1)\n- Improved relevance and fluency of generated outputs\n\nAcross diverse NLP tasks like open-domain QA, fact verification, and dialogue (KILT benchmark).\n\nThe Stochastic RAG architecture integrates retrieval scores and generation in a unified loop, approximating gradients through sampling to update both retriever and generator.\n\n```python\n# Example: Expected Utility Maximization with Gumbel-top-k\nfor x, y_true in training_data:\n    scores = R_phi(x)  # retrieval scores\n    docs = gumbel_top_k(scores, k)\n    y_pred = G_theta(x, docs)\n    utility = U(y_pred, y_true)\n    loss = -utility\n    backpropagate(loss)\n```"
  //answer: "# Gravitational Waves and the Legacy of LIGO\n\nKip Thorne's Nobel Lecture chronicles decades of breakthroughs in gravitational-wave detection using laser interferometers. His narrative emphasizes:\n\n1. Innovative Detection Methods\n - Development of laser interferometers to detect minuscule spacetime distortions.\n - Overcoming noise challenges with advanced techniques like frequency-dependent squeezed vacuum.\n\n2. Advances in Numerical Relativity and Data Analysis\n - Utilization of simulation tools (e.g., SpEC) to predict gravitational waveforms.\n - Integration of numerical and quasi-analytic models for precise data extraction.\n\n3. Collaborative Scientific Endeavors\n - Synergistic efforts between theorists and experimentalists, paving the way for multi-messenger astronomy.\n - A transformative era in astronomy with unprecedented insights into cosmic phenomena.\n\nThis comprehensive approach has revolutionized our understanding of the universe and continues to drive forward the field of gravitational-wave astronomy."
  //answer: "# Foundations of Machine Learning through Physics\n\nPhysics has shaped AI, as highlighted by the 2024 Nobel Prize in Physics.\n\nKey Contributions:\n1. Hopfield Networks – using energy landscapes to recover patterns\n2. Boltzmann Machines – applying statistical physics to neural design\n3. Deep Learning – integrating physics principles into modern AI\n\nImpact:\n- Improved pattern recognition and memory\n- Enhanced data retrieval from partial inputs\n- Revolutionized NLP and computer vision\n\nThese contributions continue to drive AI innovation."
  //answer: "# Real-Time Object Detection Revolutionized by YOLO\n\nYOLO (You Only Look Once) transformed object detection by treating it as a **single regression task**, enabling real-time performance.\n\nKey Innovations:\n1. Unified Detection Model – one network predicts boxes and probabilities directly\n2. End-to-End Optimization – joint training system for optimal detection\n3. Real-Time Processing – achieves 45-155 FPS while maintaining accuracy\n\nImpact:\n- Context-aware detection reducing false positives\n- Improved generalization across diverse domains\n- Enabled real-time applications in robotics and autonomous systems\n\nYOLO's approach continues to influence modern computer vision systems." 
  //answer: "# LIMU-BERT: Unleashing the Potential of Unlabeled IMU Data\n\nLIMU-BERT proposes a **lightweight self-supervised learning model** for mobile sensing that extracts **general features** from **unlabeled IMU data**, enabling strong performance with limited labeled data.\n\nKey Contributions:\n1. Inspired by BERT – adapts the Masked Language Model (MLM) concept to IMU time-series data\n2. Fusion + Normalization – processes accelerometer, gyroscope, and magnetometer data while preserving distribution information\n3. Span Masking Mechanism – masks subsequences instead of individual points for richer context learning\n4. Lightweight + Efficient – designed for mobile devices, with low parameter count and fast inference\n\nImpact:\n- Achieves ~10%+ improvement over state-of-the-art on HAR and DPC tasks\n- Requires only 1% labeled data for training classifiers with high accuracy\n- Learns generalizable representations transferable across datasets\n- Publicly available code and pretrained models accelerate adoption"
  //answer: "# Physics Foundations of Machine Learning\n\nThe 2024 Nobel Prize in Physics recognized Hopfield and Hinton for pioneering work linking physics and AI.\n\nCore Ideas:\n\n1. Hopfield Networks: memory as energy minimization in neural systems.\n2. Boltzmann Machines: learning from noise via statistical physics.\n3. Deep Learning: built on physical models, enabling modern AI.\n\nImpact:\n\n• Revolutionized memory, perception, and optimization in AI.\n\n• Unified insights from physics, biology, and computation.\n\nThese ideas reshaped both how we understand the brain and how we build intelligent machines."
  answer: "# Attention Is All You Need\n\nThe Transformer eliminates recurrence and convolution by using only attention mechanisms, leading to faster training and enhanced parallelism.\n\nCore Components:\n\n1. Self-Attention utilizes Scaled Dot-Product Attention and Multi-Head Attention for constant sequential operations.\n\n2. Encoder-Decoder Architecture stacks self-attention with position-wise feed-forward networks, residual connections, and layer normalization.\n\n3. Positional Encoding adds order information to embeddings using sine and cosine functions.\n\nImpact:\n\n• Sets new state-of-the-art BLEU scores on WMT 2014 machine translation tasks.\n\n• Reduces training time and cost while generalizing well to tasks like English constituency parsing.\n\nOverall, the Transformer shows that attention alone is sufficient for effective sequence transduction."
}; 

const MOCKED_SOURCES = [{
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
}];

function App() {
  // Add state to track the last processed message ID
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<string | undefined>(undefined);
  // Add new state variables for loading overlay
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);

  const contentSourceOptions = useMemo(() => ({
    buildFetchRequest: (_source: Source) => ({
      //url: '/pdfs/physicsprize2024.pdf',  //'/pdfs/kahnemann-lecture.pdf', 
      //url: 'https://arxiv.org/pdf/2412.18030',
      //url: 'https://arxiv.org/pdf/1805.01978',
      url: 'https://arxiv.org/pdf/1706.03762',
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