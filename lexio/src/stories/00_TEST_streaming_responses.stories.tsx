import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField, ErrorDisplay } from '../../lib/main';
import type { Message } from '../../lib/main';

// TODO: remove before merge
const testConten = `# Test Markdown Content

This is a **test paragraph** to showcase Markdown rendering in the 'MarkdownViewer' component.

## Lists:

- Item One
- Item Two
- Item Three

## Table Example:

| Name      | Age | City         |
| --------- | --- | ------------ |
| John Doe  | 30  | New York     |
| Jane Doe  | 28  | Los Angeles  |

\`\`\`python
import lexio

def main():
    source = lexio.SourceReference("example-doc.pdf", type="pdf", metadata={"title": "Example Document"})
    print(source)
\`\`\`
`;

const testContent = `# Test Markdown Content
This is a **test paragraph** to showcase Markdown rendering in the 'MarkdownViewer' component.

\`\`\`
import lexio

def main():
    source = lexio.SourceReference("example-doc.pdf", type="pdf", metadata={"title": "Example Document"})
    print(source)
\`\`\`

\`\`\`python
import lexio

def main():
    source = lexio.SourceReference("example-doc.pdf", type="pdf", metadata={"title": "Example Document"})
    print(source)
\`\`\`
`;

const response = async function* () {
  for (const word of testContent.split('')) {
    yield { content: word };
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  yield { content: '', done: true };
};

const ExampleComponent = () => (
  <div style={{ width: '600px', height: '600px' }}>
    <RAGProvider
      retrieveAndGenerate={(messages: Message[]) => {
        // Example implementation with streaming response
        return {
          sources: Promise.resolve([
            {
              sourceReference: "example-doc.pdf",
              type: "pdf" as const,
              metadata: {
                title: "Example Document"
              }
            }
          ]),
          // Return an async generator for streaming
          response: response()
        };
      }}
      // Follow-up questions can also use streaming
      generate={() => response()}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex-1 max-h-[500px]">
          <ChatWindow renderAsMarkdown />
        </div>
        <div>
          <AdvancedQueryField />
        </div>
      </div>
      <ErrorDisplay />
    </RAGProvider>
  </div>
);

const meta = {
  title: 'Tutorial/00. TEST Streaming Responses',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
        `
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  args: {

  },
};