import type { Meta, StoryObj } from '@storybook/react';
import { SourcesDisplay } from '../../../lib/components/SourcesDisplay/SourcesDisplay';
import { LexioProvider } from '../../../lib/components/LexioProvider';
import { useSources } from '../../../lib/hooks/hooks.ts';
import { useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import type { Source } from '../../../lib/types';
import {configureDocsRendering, extractComponentDescriptionHelper, renderDocsBlocks} from "./helper.tsx";

// Sample data for the story
const SAMPLE_RESULTS: Source[] = [
  {
    id: crypto.randomUUID(),
    title: 'Technical Documentation',
    description: "This document discusses the technical documentation",
    type: 'text',
    data: 'This document discusses the implementation of machine learning models...',
    href: 'https://www.renumics.com',
    metadata: { 
      type: 'technical_doc', 
      fileName: 'guide.pdf',
      _internal: 'Hidden metadata with underscore prefix' 
    },
    relevance: 0.95,
  },
  {
    id: crypto.randomUUID(),
    title: 'System Architecture Overview',
    description: 'This is a description of the system architecture overview',
    type: 'pdf',
    href: 'https://www.renumics.com',
    metadata: { 
      author: 'Engineering Team',
      page: 3,
      _lastUpdated: '2023-05-15' 
    },
    relevance: 0.88,
  },
];

// Component to load initial data
const DataLoader = () => {
  const { sources, searchSources } = useSources('DataLoader');
  
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // Wait for next tick to ensure provider is ready
      await new Promise(resolve => setTimeout(resolve, 0));
      if (mounted) {
        searchSources("");
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [searchSources]);
  
  return null;
};

const meta: Meta<typeof SourcesDisplay> = {
  title: 'Components/SourcesDisplay',
  component: SourcesDisplay,
  tags: ['autodocs'],
  parameters: {
      docs: {
          extractComponentDescription: extractComponentDescriptionHelper,
          page: renderDocsBlocks,
      },
  },
  decorators: [
    (Story) => (
      <div className="h-fit" style={{ width: '600px',  padding: '1rem' }}>
        <LexioProvider 
          onAction={(action, messages, sources, activeSources, selectedSource) => {
            // Handle search sources action
            if (action.type === 'SEARCH_SOURCES') {
              // Add small delay to simulate network request
              return {
                sources: new Promise(resolve => {
                  setTimeout(() => resolve(SAMPLE_RESULTS), 100);
                })
              };
            }
          }}
        >
          <DataLoader />
          <Story />
        </LexioProvider>
      </div>
    ),
  ],
 
};

export default meta;
type Story = StoryObj<typeof SourcesDisplay>;

export const Docs: Story = {
  args: {
    title: "Retrieved Sources",
    searchPlaceholder: "Search sources...",
    showSearch: true,
    showRelevanceScore: true,
    showMetadata: true,
    styleOverrides: {
    },
  },
}; 