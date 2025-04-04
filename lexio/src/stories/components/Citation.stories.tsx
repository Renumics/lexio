import type { Meta, StoryObj } from '@storybook/react';
import { Citation } from '../../../lib/components/Citation/Citation';
import { LexioProvider } from '../../../lib/components/LexioProvider';
import 'tailwindcss/tailwind.css';
import { extractComponentDescriptionHelper } from './helper';
import type { UserAction, Message, Source, ActionHandlerResponse } from '../../../lib/types';
import * as DocBlocks from "@storybook/blocks";

// Sample action handler for the stories
const sampleActionHandler = (
  action: UserAction,
  messages: Message[],
  sources: Source[],
  activeSources: Source[] | null,
  selectedSource: Source | null
): ActionHandlerResponse | Promise<ActionHandlerResponse> | Promise<undefined> => {
  return undefined;
};

const meta = {
  title: 'Components/Citation',
  component: Citation,
  parameters: {
    layout: 'centered',
    docs: {
      extractComponentDescription: extractComponentDescriptionHelper,
      page: () => (
        <>
          <DocBlocks.Title />
          <h2>Citation Component</h2>
          <p>
            A generic component for connecting content with its reference source.
            Displays text content with its source location and supports interaction.
          </p>
          <DocBlocks.Primary />
          <DocBlocks.Controls />
        </>
      ),
    }
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4" style={{ width: '400px', padding: '1rem', background: '#f8fafc' }}>
        <LexioProvider onAction={sampleActionHandler}>
          <Story />
        </LexioProvider>
      </div>
    ),
  ],
  tags: ['autodocs']
} satisfies Meta<typeof Citation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Main story showing citation variations
export const Docs: Story = {
  args: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    sourceId: "source-1",
    content: {
      text: "A basic citation showing referenced content.",
      color: "#2563eb"
    },
    reference: {
      page: 1,
      rect: { top: 0.1, left: 0.1, width: 0.8, height: 0.05 }
    },
    onSelect: () => console.log("Citation selected")
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4">
        <Story />
        <Citation
          id="123e4567-e89b-12d3-a456-426614174001"
          sourceId="source-1"
          content={{
            text: "A longer piece of content demonstrating how the component handles extended text while maintaining clear connection to its source.",
            color: "#2563eb"
          }}
          reference={{
            page: 15,
            rect: { top: 0.2, left: 0.1, width: 0.8, height: 0.1 }
          }}
        />
        <Citation
          id="123e4567-e89b-12d3-a456-426614174002"
          sourceId="source-2"
          content={{
            text: "Content with custom visual styling.",
            color: "#16a34a"
          }}
          reference={{
            page: 8,
            rect: { top: 0.3, left: 0.1, width: 0.8, height: 0.05 }
          }}
          styleOverrides={{
            backgroundColor: '#f0fdf4',
            borderRadius: '8px'
          }}
        />
      </div>
    )
  ]
}; 