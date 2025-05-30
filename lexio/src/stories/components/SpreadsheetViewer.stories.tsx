import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SpreadsheetViewer } from '../../../lib/components/Viewers/SpreadsheetViewer';
import 'tailwindcss/tailwind.css';
import { LexioProvider } from "../../../lib/components/LexioProvider";
import { extractComponentDescriptionHelper, renderDocsBlocks } from "./helper.tsx";
import type { UserAction, SpreadsheetHighlight } from "../../../lib/types";

async function fetchExcelAsArrayBuffer(url: string): Promise<ArrayBuffer> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch Excel file: ${response.status} ${response.statusText}`);
        }
        return await response.arrayBuffer();
    } catch (error) {
        console.error("Error fetching the Excel file:", error);
        throw error;
    }
}

// Sample highlights for the spreadsheet
const sampleHighlights: SpreadsheetHighlight[] = [
    {
        sheetName: "Call Center Data",
        ranges: ["B4:B4", "B8:F8"]
    },
];

// SpreadsheetViewer Wrapper Component
const SpreadsheetViewerWrapper = ({ url }: { url: string }) => {
    const [excelData, setExcelData] = useState<ArrayBuffer | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchExcelAsArrayBuffer(url)
            .then(setExcelData)
            .catch(err => setError(err.message));
    }, [url]);

    if (error) {
        return <p>Error loading Excel file: {error}</p>;
    }

    if (!excelData) {
        return <p>Loading Excel file...</p>;
    }

    return (
        <div className="w-full h-full">
            <SpreadsheetViewer
                fileName="Call Center Data"
                fileBufferArray={excelData as ArrayBuffer}
                defaultSelectedSheet="Call Center Data"
                rangesToHighlight={sampleHighlights}
            />
        </div>
    );
};

// Using a sample Excel file from a public source
// This is a financial report template from Microsoft's sample templates
const excelUrl = "https://www.exceldemy.com/wp-content/uploads/2023/12/Call-Center-Sentiment-Sample-Data.xlsx";

const meta: Meta<typeof SpreadsheetViewer> = {
    title: 'Components/SpreadsheetViewer',
    component: SpreadsheetViewer,
    tags: ['autodocs'],
    parameters: {
        docs: {
            extractComponentDescription: extractComponentDescriptionHelper,
            page: renderDocsBlocks,
        },
    },
    decorators: [
        (Story) => (
            <div className="h-[600px]" style={{ width: '100%', padding: '1rem', }}>
                <LexioProvider onAction={() => {}}>
                    <Story />
                </LexioProvider>
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof SpreadsheetViewer>;

export const Docs: Story = {
    render: () => <SpreadsheetViewerWrapper url={excelUrl} />,
};