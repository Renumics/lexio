import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField, SourcesDisplay, ErrorDisplay } from '../../lib/main';
import type { Message, GenerateInput, RetrievalResult, SourceReference } from '../../lib/main';
import { useCallback, useState } from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ 
    width: '100%', 
    height: '100%', 
    maxWidth: '1000px',
    minHeight: '400px',
    margin: '0 auto', 
    padding: '20px',
    display: 'flex', 
    flexDirection: 'column',
    boxSizing: 'border-box'
  }}>
    {children}
  </div>
);

// Helper to show current workflow step and source state
const WorkflowIndicator = ({ step, retrievedCount, selectedCount }: { 
  step: 'search' | 'analyze',
  retrievedCount: number,
  selectedCount: number 
}) => (
  <div style={{ 
    padding: '10px', 
    background: '#f5f5f5', 
    marginBottom: '20px',
    borderLeft: `4px solid ${step === 'search' ? '#2196F3' : '#4CAF50'}`
  }}>
    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
      Current Step: {step === 'search' ? '1. Search Phase' : '2. Analysis Phase'}
    </div>
    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
      {step === 'search' ? (
        <>
          Start by searching for relevant documents:
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            <li>Try "search for machine learning papers"</li>
            <li>Or "search for deep learning research"</li>
          </ul>
        </>
      ) : (
        <>
          Analyze the retrieved sources ({retrievedCount} total, {selectedCount} selected):
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            <li>Use @mention to select specific sources (e.g. "@Neural-Networks tell me more")</li>
            <li>Multiple sources can be selected with multiple @mentions</li>
            <li>Without @mentions, all sources will be used</li>
          </ul>
        </>
      )}
    </div>
  </div>
);

const generateSampleSource = (topic: string, index: number): RetrievalResult => {
  const timestamp = new Date().toLocaleTimeString();
  return {
    text: `This is a detailed paper about ${topic}. It contains comprehensive information about the topic.`,
    sourceName: `${topic.replace(/\s+/g, '-')}-${index}.pdf`,
    metadata: { 
      type: 'pdf', 
      topic,
      retrievedAt: timestamp,
      authors: ['Author A', 'Author B'],
      year: 2024
    }
  } as const;
};

interface SourcesDisplayProps {
  onSourceSelect: (index: number) => void;
  selectedIndices: number[];
}

// Helper type guard for source with name
const hasSourceName = (source: RetrievalResult): source is RetrievalResult & { sourceName: string } => {
  return 'sourceName' in source && typeof source.sourceName === 'string';
};

const SearchAndAnalyzeExample = () => {
  // Track all retrieved sources
  const [retrievedSources, setRetrievedSources] = useState<RetrievalResult[]>([]);
  // Track which sources are currently selected for analysis
  const [selectedSourceIndices, setSelectedSourceIndices] = useState<number[]>([]);

  // Separate retrieve function for explicit search queries
  const retrieve = useCallback((query: string) => {
    // Generate sample sources based on the query
    const topics = ['Neural Networks', 'Reinforcement Learning', 'Deep Learning', 'Computer Vision'];
    const sources = topics.map((topic, index) => generateSampleSource(topic, index));
    
    setRetrievedSources(sources);
    setSelectedSourceIndices([]); // Reset selection on new search
    return Promise.resolve(sources);
  }, []);

  // Combined retrieveAndGenerate for direct questions
  const retrieveAndGenerate = useCallback((messages: Message[]) => {
    const query = messages[messages.length - 1].content;
    
    // For demonstration, we'll use the same source generation
    const topics = ['Neural Networks', 'Reinforcement Learning', 'Deep Learning', 'Computer Vision'];
    const sources = topics.map((topic, index) => generateSampleSource(topic, index));
    
    // Update source state
    setRetrievedSources(sources);
    setSelectedSourceIndices([]); // Reset selection on new search

    // Generate response using all sources initially
    const response = Promise.resolve(
      `Based on the retrieved sources, here's my analysis of "${query}":\n\n` +
      sources.map(source => {
        const topic = source.metadata?.topic || 'general';
        const authors = source.metadata?.authors?.join(', ') || 'Unknown';
        const text = 'text' in source ? source.text : 'Source content not available';
        const name = hasSourceName(source) ? source.sourceName : 'Unnamed Source';
        return `- From ${name} (${topic}, by ${authors}): ${text}`;
      }).join('\n\n')
    );

    return {
      sources: Promise.resolve(sources),
      response
    };
  }, []);

  // Generate function for follow-up questions
  const generate = useCallback((messages: Message[], sources: RetrievalResult[]) => {
    const query = messages[messages.length - 1].content;
    
    // Check if the message contains @mentions to filter sources
    const mentionRegex = /@([^\s]+)/g;
    const mentions = query.match(mentionRegex);
    
    // Filter sources based on @mentions if present
    const relevantSources = mentions 
      ? sources.filter(source => 
          hasSourceName(source) && mentions.some(mention => 
            source.sourceName.toLowerCase().includes(mention.slice(1).toLowerCase())
          )
        )
      : sources;

    // Update selected sources state if mentions are present
    if (mentions && sources === retrievedSources) {
      const newSelectedIndices = retrievedSources
        .map((source, index) => ({ source, index }))
        .filter(({ source }) => 
          hasSourceName(source) && mentions.some(mention => 
            source.sourceName.toLowerCase().includes(mention.slice(1).toLowerCase())
          )
        )
        .map(({ index }) => index);
      
      setSelectedSourceIndices(newSelectedIndices);
    }

    return Promise.resolve(
      `Based on ${relevantSources.length} selected sources, here's my analysis of "${query}":\n\n` +
      relevantSources.map(source => {
        const topic = source.metadata?.topic || 'general';
        const authors = source.metadata?.authors?.join(', ') || 'Unknown';
        const text = 'text' in source ? source.text : 'Source content not available';
        const name = hasSourceName(source) ? source.sourceName : 'Unnamed Source';
        return `- From ${name} (${topic}, by ${authors}): ${text}`;
      }).join('\n\n')
    );
  }, [retrievedSources]);

  // Workflow management
  const onAddMessage = useCallback((message: Message, previousMessages: Message[]) => {
    const isSearchQuery = message.content.toLowerCase().includes('search');
    const isDirectQuestion = message.content.toLowerCase().includes('what') || 
                           message.content.toLowerCase().includes('how') ||
                           message.content.toLowerCase().includes('why');
    
    if (isSearchQuery) {
      // Use separate retrieve for explicit search
      return { type: 'reretrieve' as const, preserveHistory: true };
    }
    
    // Use follow-up for everything else when we have sources
    if (retrievedSources.length > 0) {
      return { type: 'follow-up' as const };
    }
    
    // Default to retrieve without history for new questions
    return { type: 'reretrieve' as const, preserveHistory: false };
  }, [retrievedSources.length]);

  // Calculate current workflow state
  const workflowStep = retrievedSources.length === 0 ? 'search' : 'analyze';

  return (
    <Layout>
      <WorkflowIndicator 
        step={workflowStep}
        retrievedCount={retrievedSources.length}
        selectedCount={selectedSourceIndices.length}
      />
      <RAGProvider
        retrieve={retrieve}
        generate={generate}
        retrieveAndGenerate={retrieveAndGenerate}
        onAddMessage={onAddMessage}
      >
        <div style={{ display: 'grid', flexGrow: 1, gap: '20px', gridTemplateColumns: '2fr 1fr', minHeight: 0 }}>
          <ChatWindow />
          <div style={{ height: '100%', overflow: 'auto' }}>
            <SourcesDisplay />
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <AdvancedQueryField placeholder={
            workflowStep === 'search' 
              ? 'Try "search for neural networks" or "what do you know about machine learning?"'
              : 'Ask questions about sources, use @mentions to select specific ones'
          }/>
        </div>
      </RAGProvider>
      <ErrorDisplay />
    </Layout>
  );
};

const meta = {
  title: 'Getting Started/05. Source Management',
  component: SearchAndAnalyzeExample,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Source Management and Analysis

This example demonstrates how to work with sources in a RAG workflow, including:
- Retrieving sources through search (either combined or separate)
- Selecting sources via @mentions
- Using sources in follow-up questions

## Key Concepts

### Source Retrieval Methods
The RAG system supports two ways of retrieving sources:

1. **Combined Retrieve and Generate**:
   - Default approach using \`retrieveAndGenerate\`
   - Sources are retrieved and used immediately for generation
   - Best for simple workflows where search is part of the question
   - Example: "What do these papers say about neural networks?"

2. **Separate Retrieve Step**:
   - Uses separate \`retrieve\` function
   - Allows explicit search phase before analysis
   - Better for workflows needing dedicated search step
   - Example: First "search for neural network papers", then ask questions

Choose the method based on your workflow needs:
- Use combined approach for simpler, one-step interactions
- Use separate retrieve for explicit search phases or complex source filtering

### Source States
The RAG system maintains two important source states:
1. **Retrieved Sources**: All sources obtained from search (either method)
2. **Selected Sources**: A subset of retrieved sources selected via @mentions

### Source Selection via @mentions
Sources are selected using @mentions in your queries:
1. **Single Source**: Use "@sourcename" to select one source
2. **Multiple Sources**: Use multiple @mentions to select multiple sources
3. **All Sources**: If no @mentions are used, all sources are included

### Workflow Phases

#### 1. Search Phase
- Initial retrieval of sources using either method:
  - Combined: Part of the question (e.g., "What do papers say about neural networks?")
  - Separate: Explicit search (e.g., "search for neural network papers")
- All retrieved sources are stored

#### 2. Analysis Phase
- Select sources using @mentions in your queries
- Ask questions about selected sources
- Examples:
  - "@Neural-Networks explain the key concepts"
  - "Compare the approaches in @Neural-Networks and @Deep-Learning"
  - "Summarize all papers" (uses all sources when no @mentions)

## Example Usage

\`\`\`tsx
// Example with separate retrieve step
const SearchExample = () => {
  const [retrievedSources, setRetrievedSources] = useState<RetrievalResult[]>([]);
  const [selectedSourceIndices, setSelectedSourceIndices] = useState<number[]>([]);

  // Separate retrieve function for explicit search
  const retrieve = async (query: string) => {
    const sources = await searchSources(query);
    setRetrievedSources(sources);
    return sources;
  };

  // Generate using selected sources
  const generate = (messages: Message[], sources: RetrievalResult[]) => {
    return generateResponse(messages, sources);
  };

  return (
    <RAGProvider
      retrieve={retrieve}
      generate={generate}
      onAddMessage={(message) => {
        if (message.includes('search')) {
          return { type: 'reretrieve', preserveHistory: true };
        }
        return { type: 'follow-up' };
      }}
    >
      <ChatWindow />
      <SourcesDisplay />
    </RAGProvider>
  );
};

// Example with combined retrieve and generate
const CombinedExample = () => {
  return (
    <RAGProvider
      retrieveAndGenerate={(messages) => {
        // Sources are retrieved and used in one step
        return {
          sources: searchSources(messages[messages.length - 1].content),
          response: generateResponse(messages)
        };
      }}
    >
      <ChatWindow />
      <SourcesDisplay />
    </RAGProvider>
  );
};
\`\`\`

Try it out:
1. Start with either:
   - A direct question (combined approach)
   - An explicit search query (separate retrieve)
2. Use @mentions to select specific sources
3. Ask follow-up questions about the selected sources
4. Try queries without @mentions to use all sources
`
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof SearchAndAnalyzeExample>;

export default meta;
type Story = StoryObj<typeof SearchAndAnalyzeExample>;

export const Docs: Story = {};