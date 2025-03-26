import type { Meta, StoryObj } from '@storybook/react';
import { AdvancedQueryField } from '../../../lib/components/AdvancedQueryField/AdvancedQueryField';
import { LexioProvider } from '../../../lib/components/LexioProvider';
import 'tailwindcss/tailwind.css';
import {extractComponentDescriptionHelper, renderDocsBlocks} from './helper';

const meta: Meta<typeof AdvancedQueryField> = {
  title: 'Components/AdvancedQueryField',
  component: AdvancedQueryField,
  tags: ['autodocs'],
  parameters: {
      docs: {
          extractComponentDescription: extractComponentDescriptionHelper,
          page: renderDocsBlocks,
      },
  },
  decorators: [
    (Story) => (
      <div className="h-fit"  style={{ width: '600px', padding: '1rem' }}>
        <LexioProvider onAction={() => {}}>
          <Story />
        </LexioProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdvancedQueryField>;

export const Docs: Story = {
  args: {
  },
}; 