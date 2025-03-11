import type { Meta, StoryObj } from '@storybook/react';
import { QueryField } from '../../../lib/components/QueryField/QueryField';
import { LexioProvider } from '../../../lib/components/LexioProvider';
import 'tailwindcss/tailwind.css';
import {extractComponentDescriptionHelper, renderDocsBlocks} from "./helper.tsx";

const meta: Meta<typeof QueryField> = {
  title: 'Components/QueryField',
  component: QueryField,
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
type Story = StoryObj<typeof QueryField>;

export const Docs: Story = {
  args: {
  },
}; 