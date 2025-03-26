import type { Meta, StoryObj } from '@storybook/react';
import { LexioProvider } from '../../../lib/components/LexioProvider/index.tsx';
import type { 
  Message, 
  Source,
  UserAction
} from '../../../lib/types.ts';
import 'tailwindcss/tailwind.css';
import {extractComponentDescriptionHelper, renderDocsBlocks} from "./helper.tsx";

// Sample action handler for the story
const sampleActionHandler = (
  action: UserAction, 
  messages: Message[], 
  sources: Source[], 
  activeSources: Source[] | null, 
  selectedSource: Source | null
) => {
  console.log('Action handler called with:', { action, messages, sources, activeSources, selectedSource });
  
  // Handle user message action
  if (action.type === 'ADD_USER_MESSAGE') {
    // Return sources as a Promise
    const sourcesPromise = Promise.resolve([{
      id: crypto.randomUUID(),
      title: 'Sample Document',
      type: 'pdf',
      relevance: 0.95,
      metadata: { page: 1 }
    }]);

    // Return streaming response
    const streamingResponse = (async function* () {
      yield { content: 'Sample ', done: false };
      yield { content: 'streaming ', done: false };
      yield { content: 'response', done: true };
    })();

    return {
      sources: sourcesPromise,
      response: streamingResponse
    };
  }
  
  // Handle source selection
  if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
    console.log('Loading data for source:', action.sourceObject.title);
    
    return {
      sourceData: Promise.resolve("# Sample Content\n\nThis is the content of the selected source.")
    };
  }
  
  // Return undefined for other actions
  return undefined;
};

const meta: Meta<typeof LexioProvider> = {
  title: 'Components/LexioProvider',
  component: LexioProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      extractComponentDescription: extractComponentDescriptionHelper,
      page: renderDocsBlocks,
      canvas: {
        sourceState: 'hidden'
      },
    },
    layout: 'centered',
    controls: { hideNoControlsWarning: true },
  }
};

export default meta;
type Story = StoryObj<typeof LexioProvider>;

export const Docs: Story = {
  args: {
    onAction: sampleActionHandler,
    children: <div>LexioProvider wraps your app components. There is no preview.</div>,
    config: {
      timeouts: {
        stream: 10000,
        request: 60000
      }
    }
  }
}; 