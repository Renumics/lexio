import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField, SourcesDisplay } from '../../lib/main';
import type { Message, GenerateInput } from '../../lib/main';
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

// Helper to show current workflow step
const WorkflowIndicator = ({ step }: { step: 'search' | 'analyze' }) => (
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
            <li>Then proceed to analyze the sources</li>
          </ul>
        </>
      ) : (
        <>
          Now analyze the retrieved sources:
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            <li>Ask specific questions about the sources</li>
            <li>Compare different concepts</li>
            <li>Request summaries of specific topics</li>
          </ul>
        </>
      )}
    </div>
  </div>
);

const SearchAndAnalyzeExample = () => {
  const [currentSources, setCurrentSources] = useState<any[]>([]);

  // Simple retrieve function to get sources
  const retrieve = useCallback((query: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const sources = [
      {
        text: 'Neural networks are computational models inspired by biological neural networks.',
        sourceName: `Neural-Networks-${Math.floor(Math.random() * 100)}.pdf`,
        metadata: { 
          type: 'pdf', 
          topic: 'neural networks',
          retrievedAt: timestamp
        }
      },
      {
        text: 'Reinforcement learning is a type of machine learning where agents learn by interacting with an environment.',
        sourceName: `RL-Basics-${Math.floor(Math.random() * 100)}.pdf`,
        metadata: { 
          type: 'pdf', 
          topic: 'reinforcement learning',
          retrievedAt: timestamp
        }
      }
    ];
    setCurrentSources(sources);
    return Promise.resolve(sources);
  }, []);

  // Simple generate function to analyze sources
  const generate = useCallback((messages: Message[], sources: any[]) => {
    const query = messages[messages.length - 1].content;
    return Promise.resolve(
      `Based on the ${sources.length} sources, here's my analysis of "${query}":\n\n` +
      sources.map(source => {
        const topic = source.metadata?.topic || 'general';
        return `- From ${source.sourceName} (topic: ${topic}): ${source.text}`;
      }).join('\n\n')
    );
  }, []);

  // Workflow management
  const onAddMessage = useCallback((message: Message, previousMessages: Message[]) => {
    const isSearchQuery = message.content.toLowerCase().includes('search');
    
    if (isSearchQuery) {
      return { type: 'reretrieve' as const, preserveHistory: true };
    }
    
    if (currentSources.length > 0) {
      return { type: 'follow-up' as const };
    }
    
    return { type: 'reretrieve' as const, preserveHistory: false };
  }, [currentSources.length]);

  return (
    <Layout>
      <RAGProvider
        retrieve={retrieve}
        generate={generate}
        onAddMessage={onAddMessage}
      >
        <div style={{ display: 'grid', flexGrow: 1, gap: '20px', gridTemplateColumns: '2fr 1fr', minHeight: 0 }}>
          <ChatWindow />
          <SourcesDisplay />
        </div>
        <div style={{ marginTop: '20px' }}>
          <AdvancedQueryField />
        </div>
      </RAGProvider>
    </Layout>
  );
};

const meta = {
  title: 'Getting Started/05 Search and Analyze',
  component: SearchAndAnalyzeExample,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Search and Analyze Workflow

This example demonstrates a two-step workflow:
1. **Search Phase**: Gather relevant sources
2. **Analysis Phase**: Deep dive into specific aspects

This pattern is useful when you want users to:
- First collect a broad set of relevant documents
- Then ask specific questions about those documents
- Keep the context focused on the retrieved sources

## Key Features

- **Explicit Workflow Phases**:
  - Search phase for gathering sources
  - Analysis phase for detailed questions
  - Visual indicators for current phase

- **Source Management**:
  - Sources gathered during search phase
  - Preserved during analysis phase
  - Rich metadata for better context

## Example Implementation

\`\`\`tsx
const Example = () => {
  const [step, setStep] = useState<'search' | 'analyze'>('search');
  const [currentSources, setCurrentSources] = useState([]);

  return (
    <RAGProvider
      onAddMessage={(message, previousMessages) => {
        const isSearchQuery = message.includes('search');
        
        if (isSearchQuery) {
          setStep('search');
          return { type: 'reretrieve', preserveHistory: true };
        }
        
        if (currentSources.length > 0) {
          setStep('analyze');
          return { type: 'follow-up' };
        }
        
        // No sources yet, force search
        setStep('search');
        return { type: 'reretrieve', preserveHistory: false };
      }}
      retrieveAndGenerate={...}
    >
      <ChatWindow />
      <SourcesDisplay />
    </RAGProvider>
  );
};
\`\`\`

Try it out:
1. Start with "search for machine learning papers"
2. Notice the diverse sources retrieved
3. Ask specific questions about the sources
4. Observe how the workflow guides you through the process

Next, move on to "05. Custom Workflows" to learn about more advanced workflow patterns.
        `
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof SearchAndAnalyzeExample>;

export default meta;
type Story = StoryObj<typeof SearchAndAnalyzeExample>;

export const Docs: Story = {}; 