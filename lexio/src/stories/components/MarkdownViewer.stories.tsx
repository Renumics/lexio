import type { Meta, StoryObj } from '@storybook/react';
import 'tailwindcss/tailwind.css';
import {RAGProvider} from "../../../lib/components/RAGProvider";
import {MarkdownViewer} from "../../../lib/components/Viewers";
import {extractComponentDescription} from "@storybook/docs-tools";

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
  parameters: {
        docs: {
            extractComponentDescription: (component, { notes }) => {
                // Use Storybook's default extractor
                let description = extractComponentDescription(component, { notes });

                if (description) {
                    // Customize the description by filtering unwanted TSDoc decorators
                    description = description
                        .split('\n') // Split lines
                        .filter(line =>
                            !line.startsWith('@param') &&  // Remove @param tags
                            !line.startsWith('@component') &&  // Remove @param tags
                            !line.startsWith('@remarks') &&  // Remove @param tags
                            !line.startsWith('@example') &&  // Remove @param tags
                            !line.startsWith('@todo') &&  // Remove @param tags
                            !line.startsWith('@returns')   // Remove @returns tags
                        )
                        .join('\n'); // Rejoin the lines
                }

                return description || ""; // Return modified description
            },
        },
    },
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
