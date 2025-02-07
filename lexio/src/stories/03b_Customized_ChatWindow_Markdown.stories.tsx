import type { Meta, StoryObj } from '@storybook/react';
import { RAGProvider, ChatWindow, AdvancedQueryField, ErrorDisplay } from '../../lib/main';
import type { Message } from '../../lib/main';

const markdownResponse = `# Data Analysis Report

## Introduction
This is a sample markdown-formatted response that demonstrates various formatting capabilities.

### Key Findings
1. **Important metrics** showed significant improvement
2. *Italic text* for emphasis
3. Combined **bold and *italic*** formatting

## Code Examples
Here's a Python code snippet:
\`\`\`python
import pandas as pd

def analyze_data(data):
    # Calculate summary statistics
    summary = data.describe()
    return summary
\`\`\`

## Data Table
| Metric | Value | Change |
|--------|--------|--------|
| Revenue | $1.2M | +15% |
| Users | 50k | +25% |
| Engagement | 78% | +5% |

## Links and References
- [Documentation](https://example.com)
- Visit our [website](https://example.com/home)

> **Note:** This is a blockquote highlighting important information.
`;

const ExampleComponent = () => (
  <div style={{ width: '800px', height: '600px' }}>
    <RAGProvider
      retrieveAndGenerate={(messages: Message[]) => {
        return {
          sources: Promise.resolve([
            {
              sourceReference: "analysis-report.pdf",
              type: "pdf" as const,
              metadata: {
                title: "Quarterly Analysis Report"
              }
            }
          ]),
          response: (async function* () {
            // Simulate streaming the markdown content word by word
            const words = markdownResponse.split(/(\s+)/);
            for (const word of words) {
              yield { content: word };
              // Add a small delay to make the streaming visible
              await new Promise(resolve => setTimeout(resolve, 20));
            }
            yield { content: '', done: true };
          })()
        };
      }}
      generate={(messages: Message[]) => {
        return (async function* () {
          yield { content: "Let me provide a follow-up analysis in markdown:\n\n" };
          yield { content: "## Follow-up Analysis\n\n" };
          yield { content: "Based on the previous data, here are some **key insights**:\n\n" };
          yield { content: "1. Point one\n2. Point two\n3. Point three" };
          yield { content: '', done: true };
        })();
      }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex-1">
          <ChatWindow markdown />
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
  title: 'Tutorial/03.b Markdown Responses',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Markdown Support in Chat Responses

The ChatWindow component supports rendering markdown-formatted responses, enabling rich text formatting, code blocks, tables, and more.
This feature is particularly useful for:
- Displaying structured documentation
- Showing code examples with syntax highlighting
- Creating formatted reports
- Rendering data tables

## Usage

The ChatWindow component accepts a \`markdown\` prop to enable markdown rendering, it is set to \`true\` by default.

\`\`\`tsx
<ChatWindow markdown />
\`\`\`

## Supported Markdown Features
- Headers (H1-H4)
- Bold and italic text
- Code blocks with syntax highlighting
- Tables
- Lists (ordered and unordered)
- Blockquotes
- Links

The markdown rendering is handled by a markdown processor that ensures safe and consistent output while maintaining the streaming capability of the chat interface.
        `
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  args: {},
};