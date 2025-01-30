import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider } from '../../../lib/components/RAGProvider';
import type { 
  Message, 
  GenerateStreamChunk, 
  RetrievalResult, 
  SourceReference, 
  SourceContent,
} from '../../../lib/types';
import 'tailwindcss/tailwind.css';
import {configureDocsRendering, extractComponentDescriptionHelper, renderDocsBlocks} from "./helper.tsx";

// Sample handlers for the story
const sampleHandlers = {
  retrieveAndGenerate: (messages: Message[]) => {
    console.log('RetrieveAndGenerate called with:', messages);
    
    
    // Mock EventSource behavior
    const sourcesPromise = new Promise<RetrievalResult[]>((resolve) => {
      resolve([{
        sourceReference: 'sample.pdf',
        type: 'pdf',
        sourceName: 'Sample PDF',
        relevanceScore: 0.95,
        metadata: { page: 1 },
        highlights: []
      } as SourceReference]);
    });

    async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
      yield { content: 'Sample ', done: false };
      yield { content: 'streaming ', done: false };
      yield { content: 'response', done: true };
    }

    return {
      sources: sourcesPromise,
      response: streamChunks()
    };
  },

  generate: (messages: Message[], sources: RetrievalResult[]) => {
    console.log('Generate called with:', { messages, sources });
    
    async function* streamChunks(): AsyncIterable<GenerateStreamChunk> {
      yield { content: 'Sample ', done: false };
      yield { content: 'response', done: true };
    }

    return streamChunks();
  },

  getDataSource: async (source: SourceReference): Promise<SourceContent> => {
    console.log('GetDataSource called with:', source);
    return {
      type: 'pdf',
      content: new Uint8Array([/* sample PDF bytes */]),
      metadata: source.metadata || {},
      highlights: source.highlights || []
    };
  }
};

const meta: Meta<typeof RAGProvider> = {
  title: 'Components/RAGProvider',
  component: RAGProvider,
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
type Story = StoryObj<typeof RAGProvider>;

export const Docs: Story = {
  args: {
    retrieveAndGenerate: sampleHandlers.retrieveAndGenerate,
    generate: sampleHandlers.generate,
    getDataSource: sampleHandlers.getDataSource,
    children: <div>RAGProvider wraps your app components. There is no preview.</div>,
    config: {
      timeouts: {
        stream: 10000,
        request: 60000
      }
    }
  }
}; 