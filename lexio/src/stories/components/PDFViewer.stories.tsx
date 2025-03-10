import type {Meta, StoryObj} from '@storybook/react';
import React, {useEffect, useState} from 'react';
import {PdfViewer} from '../../../lib/components/Viewers/PdfViewer';
import 'tailwindcss/tailwind.css';
import {LexioProvider} from "../../../lib/components/LexioProvider";
import {extractComponentDescriptionHelper, renderDocsBlocks} from "./helper.tsx";
import type {UserAction, PDFHighlight} from "../../../lib/types";

async function fetchPdfAsUint8Array(url: string): Promise<Uint8Array> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    } catch (error) {
        console.error("Error fetching the PDF:", error);
        return new Uint8Array(); // Return empty array in case of error
    }
}

// Sample highlights for the PDF
const sampleHighlights: PDFHighlight[] = [
    {
        page: 2,
        rect: {
            top: 0.3,
            left: 0.1,
            width: 0.8,
            height: 0.05
        }
    },
    {
        page: 3,
        rect: {
            top: 0.4,
            left: 0.1,
            width: 0.8,
            height: 0.05
        }
    }
];

// PDF Wrapper Component
const PdfViewerWrapper = ({url}: { url: string }) => {
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

    useEffect(() => {
        fetchPdfAsUint8Array(url).then(setPdfData);
    }, [url]);

    if (!pdfData) {
        return <p>Loading PDF...</p>;
    }

    return (<div className="w-full h-full">
        <PdfViewer data={pdfData} highlights={sampleHighlights} page={2} styleOverrides={{
            contentBackground: '#f8f8f8',
        }} />
    </div>);
};

// Sample action handler for the story
const sampleActionHandler = (action: UserAction) => {
    // Return undefined for all actions as this story doesn't need to handle any specific actions
    return undefined;
};

const pdfUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf";

const meta: Meta<typeof PdfViewer> = {
    title: 'Components/PdfViewer',
    component: PdfViewer,
    tags: ['autodocs'],
    parameters: {
      docs: {
          extractComponentDescription: extractComponentDescriptionHelper,
          page: renderDocsBlocks,
      },
    },
    decorators: [
        (Story) => (
            <div className="h-[600px]"  style={{width: '600px', padding: '1rem'}}>
                <LexioProvider onAction={sampleActionHandler}>
                    <Story/>
                </LexioProvider>
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof PdfViewer>;

export const Docs: Story = {
    render: () => <PdfViewerWrapper url={pdfUrl}/>,
};
