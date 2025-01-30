import type {Meta, StoryObj} from '@storybook/react';
import 'tailwindcss/tailwind.css';
import {RAGProvider} from "../../../lib/components/RAGProvider";
import {MarkdownViewer} from "../../../lib/components/Viewers";
import {extractComponentDescriptionHelper, renderDocsBlocks} from "./helper.tsx";

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
            extractComponentDescription: extractComponentDescriptionHelper,
            page: renderDocsBlocks,
        },
    },
    decorators: [
        (Story) => (
            <div className="h-fit" style={{width: '600px', padding: '1rem'}}>
                <RAGProvider>
                    <Story/>
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
        styleOverrides: {}
    },
};
