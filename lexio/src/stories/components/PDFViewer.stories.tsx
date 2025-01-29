import type { Meta, StoryObj } from '@storybook/react';
import { PdfViewer } from '../../../lib/components/Viewers/PdfViewer';
import 'tailwindcss/tailwind.css';
import {RAGProvider} from "../../../lib/components/RAGProvider";

const meta: Meta<typeof PdfViewer> = {
  title: 'Components/PdfViewer',
  component: PdfViewer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '600px', minHeight: '800px', padding: '1rem' }}>
        <RAGProvider>
          <Story data={() => fetch('https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf')
              .then(response => response.arrayBuffer())} />
          </RAGProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PdfViewer>;

export const Docs: Story = {
};