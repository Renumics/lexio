import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import {
  LexioProvider,
  ChatWindow,
  AdvancedQueryField,
  SourcesDisplay,
  ContentDisplay,
  createTheme,
  useMessages,
  Message,
  UserAction
} from '../../../lib/main';

// Create a simple theme
const customTheme = createTheme({
  colors: {
    primary: '#1E88E5',
    secondary: '#64B5F6',
  },
});

const BaseLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '100%', maxWidth: '1200px', height: '800px', margin: '0 auto' }}>
    {children}
  </div>
);

const SharedLayout = () => (
  <div style={{ 
    display: 'grid',
    height: '100%',
    gridTemplateColumns: '3fr 1fr',
    gridTemplateRows: '1fr auto 300px',
    gap: '20px',
    gridTemplateAreas: `
      "chat sources"
      "input sources"
      "viewer viewer"
    `
  }}>
    <div style={{ gridArea: 'chat', minHeight: 0, overflow: 'auto' }}>
      <ChatWindow />
    </div>
    <div style={{ gridArea: 'input' }}>
      <AdvancedQueryField />
    </div>
    <div style={{ gridArea: 'sources', minHeight: 0, overflow: 'auto' }}>
      <SourcesDisplay />
    </div>
    <div style={{ gridArea: 'viewer', height: '300px' }}>
      <ContentDisplay />
    </div>
  </div>
);

// Mock data for the example
const SAMPLE_MESSAGES: Message[] = [
  {
    id: crypto.randomUUID(),
    role: 'user',
    content: 'How can I implement RAG in my application?',
  },
];

// Component to load initial data
const DataLoader = () => {
  const { addUserMessage } = useMessages('LexioProvider');

  useEffect(() => {
    // Add sample user message
    const timer = setTimeout(() => {
      addUserMessage(SAMPLE_MESSAGES[0].content);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return null;
};

// Simple component for the user feedback story
const UserFeedbackComponent = () => {
  return (
    <div style={{ width: '100%', height: '800px' }}>
      <LexioProvider 
        theme={customTheme}
        onAction={(
          action: UserAction,
          messages: Message[]
        ) => {
          if (action.type === 'ADD_USER_MESSAGE') {
            return {
              response: Promise.resolve("To implement RAG in your application, you'll need to follow these steps:\n\n1. Set up a document store for your knowledge base\n2. Create embeddings for your documents\n3. Implement a retrieval mechanism\n4. Connect to an LLM for generation\n\nWould you like more details on any specific step?")
            };
          }
          
          // Handle feedback submission
          if (action.type === 'SET_MESSAGE_FEEDBACK') {
            console.log('Feedback received:', {
              messageId: action.messageId,
              feedback: action.feedback,
              comment: action.comment,
              messageContent: action.messageContent
            });
            
            // You could send this to an API, analytics service, etc.
            return {};
          }
        }}
      >
        <BaseLayout>
          <SharedLayout />
        </BaseLayout>
        <DataLoader />
      </LexioProvider>
    </div>
  );
};

// Export Storybook configuration
const meta = {
  title: 'Additional Features/User Feedback',
  component: UserFeedbackComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## User Feedback System

Lexio provides a built-in feedback system that allows users to rate AI responses and provide additional context:

- **Thumbs Up/Down**: Users can quickly indicate if a response was helpful or not
- **Comments**: Users can add detailed feedback explaining why a response was or wasn't helpful

This feedback system helps improve AI responses over time and provides valuable insights for developers.

### Implementation Details

The feedback system is implemented through:

1. **Feedback Component**: A UI component that appears with each assistant message
2. **SET_MESSAGE_FEEDBACK Action**: An action dispatched when users provide feedback
3. **useMessageFeedback Hook**: A hook that components can use to submit feedback programmatically

### Handling Feedback in onAction

You can process feedback in your \`onAction\` handler:

\`\`\`tsx
const onAction = (action, messages) => {
  if (action.type === 'SET_MESSAGE_FEEDBACK') {
    // Log feedback to analytics
    analytics.logFeedback({
      messageId: action.messageId,
      feedback: action.feedback,
      comment: action.comment
    });
    
    // Or store in database
    saveFeedbackToDatabase(action.messageId, action.feedback, action.comment);
    
    return {};
  }
};
\`\`\`

Try interacting with the chat below and look for the feedback options that appear with each AI message.
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UserFeedbackComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {};
