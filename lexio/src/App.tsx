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
    StreamChunk,
} from '../lib/main';
// import { ExplanationProcessor } from '../lib/explanation';
import './App.css';

// This is a temporary mocked response for testing purposes
// In the future, this will be replaced with a real response from the RAG system
const MOCKED_RESPONSE = {
    answer: "# Deep Learning for Traffic Data Imputation\n\nDeep learning improves traffic data imputation by **automatically learning patterns** without manual feature selection. The *Denoising Stacked Autoencoder* (DSAE) approach treats missing and observed data as a whole, enabling robust recovery through:\n\n1. Layer-wise pre-training\n2. Fine-tuning\n\nCompared to traditional methods like ARIMA and k-NN, it maintains:\n- Higher accuracy\n- Stable error rates\n\nAcross different missing data levels, as demonstrated on Caltrans PeMS traffic data.\n\n```python\n# Example code for DSAE implementation\nimport tensorflow as tf\n\ndef build_autoencoder(input_dim, encoding_dim):\n    # Define encoder\n    input_layer = tf.keras.layers.Input(shape=(input_dim,))\n    encoder = tf.keras.layers.Dense(encoding_dim, activation='relu')(input_layer)\n    \n    # Define decoder\n    decoder = tf.keras.layers.Dense(input_dim, activation='sigmoid')(encoder)\n    \n    # Define autoencoder\n    autoencoder = tf.keras.Model(inputs=input_layer, outputs=decoder)\n    return autoencoder\n```"
    //answer: "Deep learning improves traffic data imputation by automatically learning patterns without manual feature selection. The Denoising Stacked Autoencoder (DSAE) approach treats missing and observed data as a whole, enabling robust recovery through layer-wise pre-training and fine-tuning. Compared to traditional methods like ARIMA and k-NN, it maintains higher accuracy and stable error rates across different missing data levels, as demonstrated on Caltrans PeMS traffic data."
};

const MOCKED_CITATIONS = [
  {
    sourceIndex: 0,
    messageHighlight: {
      startChar: 0,
      endChar: 100,
      color: '#ffeb3b'
    },
    sourceHighlight: {
      page: 1,
      rect: {
        top: 0,
        left: 0,
        width: 1,
        height: 0.5
      }
    }
  }
];

const MOCKED_SOURCES = [{
    title: '... Paper',
    type: 'pdf' as const,
    relevance: 1,
    metadata: {
        id: 'id.pdf'
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
        _messages: Message[],
        sources: Source[], 
        activeSources: Source[] | null, 
        selectedSource: Source | null
    ): Promise<ActionHandlerResponse> => {
        console.log('Action received:', action.type);
        console.log('Current sources:', sources);
        console.log('Active sources:', activeSources);
        console.log('Selected source:', selectedSource);


        if (action.type === 'SET_SELECTED_SOURCE') {
            if (!action.sourceObject) {
                return {};
            }
            // Always load the source data fresh
            return {
                sourceData: contentSource(action.sourceObject)
                    .then(sourceWithData => {
                        // Normalize data to Uint8Array
                        const data = sourceWithData.data;
                        
                        if (data instanceof Blob) {
                            return data.arrayBuffer().then(buffer => new Uint8Array(buffer));
                        } else if (data instanceof ArrayBuffer) {
                            return new Uint8Array(data);
                        } else if (data instanceof Uint8Array) {
                            return data;
                        } else {
                            throw new Error(`Unsupported data type: ${typeof data}`);
                        }
                    }),
            };
        }
        
        if (action.type === 'ADD_USER_MESSAGE') {
            console.log('ADD_USER_MESSAGE action started');

            // For now, use the mocked response
            const ragResponse = MOCKED_RESPONSE.answer;
            
            // Simple response without any explanation processing
            return {
                response: Promise.resolve({
                    content: ragResponse,
                }),
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

export default App;