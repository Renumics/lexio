import type { Meta, StoryObj } from '@storybook/react';
import { SourcesDisplay } from '../../../lib/components/SourcesDisplay/SourcesDisplay';
import { RAGProvider } from '../../../lib/components/RAGProvider';
import { useRAGSources } from '../../../lib/components/RAGProvider/hooks';
import { useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import type { RetrievalResult } from '../../../lib/types';

// Sample data for the story
const SAMPLE_RESULTS: RetrievalResult[] = [
  {
    text: 'This document discusses the implementation of machine learning models...',
    metadata: { type: 'technical_doc', fileName: 'guide.pdf' },
    relevanceScore: 0.95,
  },
  {
    sourceReference: 'KB-2024-001',
    sourceName: 'System Architecture Overview',
    type: 'pdf',
    metadata: { author: 'Engineering Team' },
    relevanceScore: 0.88,
  },
];

// Component to load initial data
const DataLoader = () => {
  const { retrieveSources } = useRAGSources();
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // Wait for next tick to ensure provider is ready
      await new Promise(resolve => setTimeout(resolve, 0));
      if (mounted) {
        await retrieveSources("");
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [retrieveSources]);
  
  return null;
};

const meta: Meta<typeof SourcesDisplay> = {
  title: 'Components/SourcesDisplay',
  component: SourcesDisplay,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '600px', minHeight: '500px', padding: '1rem' }}>
        <RAGProvider 
          retrieve={async () => {
            // Add small delay to simulate network request
            await new Promise(resolve => setTimeout(resolve, 100));
            return SAMPLE_RESULTS;
          }}
        >
          <DataLoader />
          <Story />
        </RAGProvider>
      </div>
    ),
  ],
 
};

export default meta;
type Story = StoryObj<typeof SourcesDisplay>;

export const Docs: Story = {

}; 