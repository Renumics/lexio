import type { Meta, StoryObj } from '@storybook/react';
import { AdvancedQueryField } from '../../../lib/components/AdvancedQueryField/AdvancedQueryField';
import { RAGProvider } from '../../../lib/components/RAGProvider';
import 'tailwindcss/tailwind.css';

// Sample message handler for the story
const SAMPLE_HANDLER = async (message: string, mentions: any[]) => {
  console.log('Message submitted:', message);
  console.log('With mentions:', mentions);
};

const meta: Meta<typeof AdvancedQueryField> = {
  title: 'Components/AdvancedQueryField',
  component: AdvancedQueryField,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-fit"  style={{ width: '600px', padding: '1rem' }}>
        <RAGProvider retrieve={async () => []}>
          <Story />
        </RAGProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdvancedQueryField>;

export const Docs: Story = {
  args: {
    onSubmit: SAMPLE_HANDLER,
  },
}; 