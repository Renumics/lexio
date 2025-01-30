import type { Meta, StoryObj } from '@storybook/react';
import { QueryField } from '../../../lib/components/QueryField/QueryField';
import { RAGProvider } from '../../../lib/components/RAGProvider';
import 'tailwindcss/tailwind.css';

// Sample message handler for the story
const SAMPLE_HANDLER = async (message: string) => {
  console.log('Message submitted:', message);
};

const meta: Meta<typeof QueryField> = {
  title: 'Components/QueryField',
  component: QueryField,
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
type Story = StoryObj<typeof QueryField>;

export const Docs: Story = {
  args: {
    onSubmit: SAMPLE_HANDLER,
  },
}; 