import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField, SourcesDisplay } from '../../lib/main';
import type { Message, GenerateInput } from '../../lib/main';
import { useCallback, useState } from 'react';

// Simple toggle for reretrieve mode
const ReretrieveToggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <div style={{ padding: '10px', background: '#f5f5f5', marginBottom: '20px' }}>
    <button onClick={onToggle} style={{ background: enabled ? '#4CAF50' : '#f44336', color: 'white', border: 'none', padding: '8px 16px' }}>
      Force Reretrieve: {enabled ? 'ON' : 'OFF'}
    </button>
    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
      Try sending a message containing "search" or toggle this button
    </div>
  </div>
);

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
    <div style={{ display: 'grid', flexGrow: 1, gap: '20px', gridTemplateColumns: '2fr 1fr', minHeight: 0 }}>
      <ChatWindow />
      <SourcesDisplay />
    </div>
    <div style={{ marginTop: '20px' }}>
      <AdvancedQueryField />
    </div>
  </div>
);

const WorkflowExample = () => {
  const [forceReretrieve, setForceReretrieve] = useState(false);

  const onAddMessage = useCallback((message: Message, previousMessages: Message[]) => {
    // Reretrieve if forced by toggle or if message contains "search"
    const shouldReretrieve = forceReretrieve || message.content.toLowerCase().includes('search');
    return shouldReretrieve 
      ? { type: 'reretrieve', preserveHistory: true }
      : { type: 'follow-up' };
  }, [forceReretrieve]);

  return (
    <Layout>
      <ReretrieveToggle 
        enabled={forceReretrieve} 
        onToggle={() => setForceReretrieve(prev => !prev)} 
      />
      <RAGProvider
        // onAddMessage={onAddMessage}
        retrieveAndGenerate={(messages: GenerateInput) => ({
          sources: Promise.resolve([
            {
              text: 'Sample source content',
              sourceName: 'Document 1',
              metadata: { type: 'sample' }
            }
          ]),
          response: Promise.resolve('Response: ' + (forceReretrieve ? 'Forced reretrieve mode!' : 'Normal mode'))
        })}
        generate={(messages: Message[]) => Promise.resolve("Follow-up response")}
      >
        <div />
      </RAGProvider>
    </Layout>
  );
};

const meta = {
  title: 'RAG/Message-Based Workflow',
  component: WorkflowExample,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
This example demonstrates how to use the \`onAddMessage\` handler to make workflow decisions based on message content or UI state.

### Example Implementation

\`\`\`tsx
const WorkflowExample = () => {
  const [forceReretrieve, setForceReretrieve] = useState(false);

  return (
    <RAGProvider
      onAddMessage={(message, previousMessages) => {
        // Decide workflow based on message content or UI state
        const shouldReretrieve = forceReretrieve || 
          message.content.toLowerCase().includes('search');
        
        return shouldReretrieve 
          ? { type: 'reretrieve', preserveHistory: true }
          : { type: 'follow-up' };
      }}
      retrieveAndGenerate={...}
      generate={...}
    >
      <ChatWindow />
      <SourcesDisplay />
    </RAGProvider>
  );
};
\`\`\`

Try it out:
1. Type a message containing "search" to trigger reretrieve mode
2. Use the toggle button to force reretrieve mode for all messages
3. Observe how the workflow changes based on these conditions
        `
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof WorkflowExample>;

export default meta;
type Story = StoryObj<typeof WorkflowExample>;

export const Docs: Story = {}; 