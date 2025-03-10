import type { Meta, StoryObj } from '@storybook/react';
import { SourcesDisplay } from '../../../lib/components/SourcesDisplay/SourcesDisplay';
import { LexioProvider } from '../../../lib/components/LexioProvider';
import { useSources } from '../../../lib/hooks/hooks';
import 'tailwindcss/tailwind.css';
import type { Source, UserAction, UUID, PDFHighlight } from '../../../lib/types';
import { useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import { extractComponentDescriptionHelper, renderDocsBlocks} from "./helper.tsx";

// Sample data for the story
const SAMPLE_RESULTS: Source[] = [
  {
    id: crypto.randomUUID() as UUID,
    title: 'Introduction to Machine Learning',
    type: 'text',
    description: 'A comprehensive guide to machine learning concepts and applications.',
    relevance: 0.95,
    href: 'https://example.com/ml-intro',
    data: 'Machine learning is a branch of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.',
    metadata: {
      author: 'John Smith',
      date: '2023-01-15',
      pages: 42,
    },
    highlights: [
      {
        page: 1,
        rect: {
          top: 0.1,
          left: 0.1,
          width: 0.8,
          height: 0.05
        }
      },
      {
        page: 1,
        rect: {
          top: 0.2,
          left: 0.1,
          width: 0.8,
          height: 0.05
        }
      },
    ],
  },
  {
    id: crypto.randomUUID() as UUID,
    title: 'Deep Learning Fundamentals',
    type: 'pdf',
    description: 'An exploration of neural networks and deep learning techniques.',
    relevance: 0.85,
    href: 'https://example.com/deep-learning',
    data: 'Deep learning is a subset of machine learning that uses neural networks with many layers (hence "deep") to analyze various factors of data. It is particularly effective for tasks like image and speech recognition.',
    metadata: {
      author: 'Jane Doe',
      date: '2023-02-20',
      pages: 78,
      page: 3,
    },
    highlights: [
      {
        page: 3,
        rect: {
          top: 0.3,
          left: 0.1,
          width: 0.8,
          height: 0.05
        }
      },
      {
        page: 4,
        rect: {
          top: 0.4,
          left: 0.1,
          width: 0.8,
          height: 0.05
        }
      },
    ],
  },
];

// Component to load initial data
const DataLoader = () => {
  const { searchSources } = useSources('SourcesDisplay-DataLoader');
  
  useEffect(() => {
    // Small delay to ensure provider is ready
    const timer = setTimeout(() => {
      searchSources('machine learning');
    }, 0);
    
    return () => clearTimeout(timer);
  }, [searchSources]);
  
  return null;
};

// Sample action handler for the story
const sampleActionHandler = (action: UserAction) => {
  // Handle search sources action
  if (action.type === 'SEARCH_SOURCES') {
    return {
      sources: Promise.resolve(SAMPLE_RESULTS)
    };
  }
  
  // Handle set selected source action
  if (action.type === 'SET_SELECTED_SOURCE') {
    return {
      // Just acknowledge the action, no specific response needed
    };
  }
  
  // Return undefined for other actions
  return undefined;
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
      <div className="h-fit" style={{ width: '600px', padding: '1rem' }}>
        <LexioProvider onAction={sampleActionHandler}>
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