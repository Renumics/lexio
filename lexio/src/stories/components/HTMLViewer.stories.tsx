import type { Meta, StoryObj } from '@storybook/react';
import 'tailwindcss/tailwind.css';
import {RAGProvider} from "../../../lib/components/RAGProvider";
import {HtmlViewer} from "../../../lib/components/Viewers";
import {extractComponentDescription} from "@storybook/docs-tools";

const testContent = `
<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
  <h1 style="color: #4A90E2;">Test HTML Content</h1>
  <p>This is a <strong>test paragraph</strong> to showcase HTML rendering in the <code>HtmlViewer</code> component.</p>

  <h2>Lists:</h2>
  <ul>
    <li>Item One</li>
    <li>Item Two</li>
    <li>Item Three</li>
  </ul>

  <h2>Table Example:</h2>
  <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
    <tr style="background-color: #f4f4f4;">
      <th>Name</th>
      <th>Age</th>
      <th>City</th>
    </tr>
    <tr>
      <td>John Doe</td>
      <td>30</td>
      <td>New York</td>
    </tr>
    <tr>
      <td>Jane Doe</td>
      <td>28</td>
      <td>Los Angeles</td>
    </tr>
  </table>
</div>
`;

const meta: Meta<typeof HtmlViewer> = {
  title: 'Components/HtmlViewer',
  component: HtmlViewer,
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
type Story = StoryObj<typeof HtmlViewer>;

export const Docs: Story = {
  args: {
    htmlContent: testContent,
    styleOverrides: {
      contentPadding: '20px'
    }
  },
};
