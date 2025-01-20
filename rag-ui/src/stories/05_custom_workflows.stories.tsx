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
  title: 'Getting Started/05. Custom Workflows',
  component: WorkflowExample,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Custom Workflows

Now that you understand the basic chat flow, let's customize how the chat behaves.
This guide will show you how to:
- Customize the chat workflow
- Control when to reretrieve sources
- Preserve or reset chat history

## Workflow Types

The RAG UI supports different workflow types through the \`onAddMessage\` prop:

1. \`follow-up\`: Use existing sources (default)
2. \`reretrieve\`: Get new sources, with options to preserve history

## Example Implementation

\`\`\`tsx
<RAGProvider
  retrieveAndGenerate={(messages) => {
    return {
      sources: Promise.resolve([/* ... */]),
      response: Promise.resolve("Response...")
    };
  }}
  onAddMessage={(message, previousMessages) => {
    // Force reretrieve if message contains "search"
    if (message.content.toLowerCase().includes('search')) {
      return {
        type: 'reretrieve',
        preserveHistory: true  // Keep chat history
      };
    }
    // Otherwise use follow-up mode
    return { type: 'follow-up' };
  }}
>
  <ChatWindow />
  <AdvancedQueryField />
</RAGProvider>
\`\`\`

Try it out:
1. Ask a normal question - uses follow-up mode
2. Include "search" in your message - forces reretrieve mode

Next, move on to "06. Error Handling" to learn how to handle timeouts and errors gracefully.
        `
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof WorkflowExample>;

export default meta;
type Story = StoryObj<typeof WorkflowExample>;

export const Docs: Story = {}; 