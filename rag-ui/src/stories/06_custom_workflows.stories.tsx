import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField, SourcesDisplay, ErrorDisplay } from '../../lib/main';
import type { Message, GenerateInput } from '../../lib/main';
import { useCallback, useState } from 'react';

// Simple toggle for reretrieve mode
const ReretrieveToggle = ({ enabled, onToggle, preserveHistory, onPreserveHistoryToggle }: { 
  enabled: boolean; 
  onToggle: () => void;
  preserveHistory: boolean;
  onPreserveHistoryToggle: () => void;
}) => (
  <div style={{ padding: '10px', background: '#f5f5f5', marginBottom: '20px' }}>
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button 
        onClick={onToggle} 
        style={{ background: enabled ? '#4CAF50' : '#f44336', color: 'white', border: 'none', padding: '8px 16px' }}
      >
        Force Reretrieve: {enabled ? 'ON' : 'OFF'}
      </button>
      <button 
        onClick={onPreserveHistoryToggle} 
        style={{ background: preserveHistory ? '#2196F3' : '#9E9E9E', color: 'white', border: 'none', padding: '8px 16px' }}
      >
        Preserve History: {preserveHistory ? 'ON' : 'OFF'}
      </button>
    </div>
    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
      Try these:
      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
        <li>Type "search documents" - to maake the workflow reretrieve</li>
        <li>Toggle history preservation to see different chat behaviors</li>
      </ul>
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
  </div>
);

const WorkflowExample = () => {
  const [forceReretrieve, setForceReretrieve] = useState(false);
  const [preserveHistory, setPreserveHistory] = useState(true);

  const getSourcesForQuery = useCallback((query: string) => {
    // Add timestamp to show when sources were retrieved
    const timestamp = new Date().toLocaleTimeString();
    
    if (query.toLowerCase().includes('web')) {
      return [
        {
          text: 'This source was retrieved at ' + timestamp,
          sourceName: `Web Search Result #${Math.floor(Math.random() * 100)}`,
          metadata: { 
            type: 'web', 
            url: 'https://example.com/search',
            retrievedAt: timestamp,
            confidence: Math.random().toFixed(2)
          }
        },
        {
          text: 'Another source retrieved at ' + timestamp,
          sourceName: `Blog Post #${Math.floor(Math.random() * 100)}`,
          metadata: { 
            type: 'web', 
            url: 'https://blog.example.com',
            retrievedAt: timestamp,
            confidence: Math.random().toFixed(2)
          }
        }
      ];
    }
    if (query.toLowerCase().includes('document')) {
      return [
        {
          text: 'PDF content retrieved at ' + timestamp,
          sourceName: `Document-${Math.floor(Math.random() * 100)}.pdf`,
          metadata: { 
            type: 'pdf', 
            pages: [Math.floor(Math.random() * 10) + 1],
            retrievedAt: timestamp,
            confidence: Math.random().toFixed(2)
          }
        },
        {
          text: 'Another document retrieved at ' + timestamp,
          sourceName: `Report-${Math.floor(Math.random() * 100)}.pdf`,
          metadata: { 
            type: 'pdf', 
            pages: [Math.floor(Math.random() * 10) + 1],
            retrievedAt: timestamp,
            confidence: Math.random().toFixed(2)
          }
        }
      ];
    }
    return [
      {
        text: 'Default source retrieved at ' + timestamp,
        sourceName: `Source-${Math.floor(Math.random() * 100)}`,
        metadata: { 
          type: 'default',
          retrievedAt: timestamp,
          confidence: Math.random().toFixed(2)
        }
      }
    ];
  }, []);

  const onAddMessage = useCallback((message: Message, previousMessages: Message[]) => {
    const shouldReretrieve = forceReretrieve || message.content.toLowerCase().includes('search');
    return shouldReretrieve 
      ? { type: 'reretrieve' as const, preserveHistory }
      : { type: 'follow-up' as const };
  }, [forceReretrieve, preserveHistory]);

  return (
    <Layout>
      <ReretrieveToggle 
        enabled={forceReretrieve} 
        onToggle={() => setForceReretrieve(prev => !prev)}
        preserveHistory={preserveHistory}
        onPreserveHistoryToggle={() => setPreserveHistory(prev => !prev)}
      />
      <RAGProvider
        onAddMessage={onAddMessage}
        retrieveAndGenerate={(messages: GenerateInput) => ({
          sources: Promise.resolve(getSourcesForQuery(messages[messages.length - 1].content)),
          response: Promise.resolve(
            `Response: ${forceReretrieve ? 'Forced reretrieve mode!' : 'Normal mode'}\n` +
            `${preserveHistory ? 'Keeping chat history.' : 'Started fresh conversation.'}\n` +
            `Each source now includes:\n` +
            `- Random source name\n` +
            `- Timestamp when retrieved\n` +
            `- Random confidence score\n` +
            `Try the same query multiple times to see different sources!`
          )
        })}
        generate={(messages: Message[]) => Promise.resolve("This is a follow-up response using existing sources.")}
      >
        <div style={{ display: 'grid', flexGrow: 1, gap: '20px', gridTemplateColumns: '2fr 1fr', minHeight: 0 }}>
          <ChatWindow />
          <SourcesDisplay />
        </div>
        <div style={{ marginTop: '20px' }}>
          <AdvancedQueryField />
        </div>
        <ErrorDisplay />
      </RAGProvider>
    </Layout>
  );
};

const meta = {
  title: 'Getting Started/06. Custom Workflows',
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