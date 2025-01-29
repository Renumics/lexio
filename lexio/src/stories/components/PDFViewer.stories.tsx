import type {Meta, StoryObj} from '@storybook/react';
import React, {useEffect, useState} from 'react';
import {PdfViewer} from '../../../lib/components/Viewers/PdfViewer';
import 'tailwindcss/tailwind.css';
import {RAGProvider} from "../../../lib/components/RAGProvider";

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
        <PdfViewer data={pdfData} highlights={[]} page={2} styleOverrides={{
            contentBackground: '#f8f8f8',
        }} />
    </div>);
};

const pdfUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf";

const meta: Meta<typeof PdfViewer> = {
    title: 'Components/PdfViewer',
    component: PdfViewer,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{width: '600px', height: '600px', padding: '1rem'}}>
                <RAGProvider>
                    <Story/>
                </RAGProvider>
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof PdfViewer>;

export const Docs: Story = {
    render: () => <PdfViewerWrapper url={pdfUrl}/>,
};
