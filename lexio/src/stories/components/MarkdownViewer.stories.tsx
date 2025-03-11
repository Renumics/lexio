import type {Meta, StoryObj} from '@storybook/react';
import 'tailwindcss/tailwind.css';
import {LexioProvider} from "../../../lib/components/LexioProvider";
import {MarkdownViewer} from "../../../lib/components/Viewers";
import {extractComponentDescriptionHelper, renderDocsBlocks} from "./helper.tsx";
import type {UserAction} from "../../../lib/types";

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

// Sample action handler for the story
const sampleActionHandler = (action: UserAction) => {
  // Return undefined for all actions as this story doesn't need to handle any specific actions
  return undefined;
};

const meta: Meta<typeof MarkdownViewer> = {
    title: 'Components/MarkDownViewer',
    component: MarkdownViewer,
    tags: ['autodocs'],
    parameters: {
        docs: {
            extractComponentDescription: extractComponentDescriptionHelper,
            page: renderDocsBlocks,
        },
    },
    decorators: [
        (Story) => (
            <div className="h-fit" style={{width: '600px', padding: '1rem'}}>
                <LexioProvider onAction={sampleActionHandler}>
                    <Story/>
                </LexioProvider>
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof MarkdownViewer>;

export const Docs: Story = {
    args: {
        markdownContent: testContent,
        styleOverrides: {}
    },
};
