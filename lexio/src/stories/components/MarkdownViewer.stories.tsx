import type { Meta, StoryObj } from '@storybook/react';
import 'tailwindcss/tailwind.css';
import {RAGProvider} from "../../../lib/components/RAGProvider";
import {MarkdownViewer} from "../../../lib/components/Viewers";

const testContent = `# Test Markdown Content

This is a **test paragraph** to showcase Markdown rendering in the \`MarkdownViewer\` component.

## Lists:

- Item One
- Item Two
- Item Three

## Table Example:

| Name      | Age | City         |
| --------- | --- | ------------ |
| John Doe  | 30  | New York     |
| Jane Doe  | 28  | Los Angeles  |
`;

const meta: Meta<typeof MarkdownViewer> = {
  title: 'Components/MarkDownViewer',
  component: MarkdownViewer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '600px', minHeight: '600px', padding: '1rem' }}>
        <RAGProvider>
          <Story />
          </RAGProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MarkdownViewer>;

export const Docs: Story = {
  args: {
    markdownContent: testContent,
    styleOverrides: {
    }
  },
};
