import {useEffect, useState} from 'react';
import pdfFile from './Air-Quality-and-Climate-Bulletin_4_en.pdf';
import {PdfViewer} from '../../../lib/components/Viewers/PdfViewer';

const loadPdfAsUint8Array = async (url: string): Promise<Uint8Array> => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
};

export default {
    title: 'Viewers/PdfViewer',
    component: PdfViewer,
};

const Template = (args) => {
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

    useEffect(() => {
        loadPdfAsUint8Array(pdfFile).then(setPdfData);
    }, []);

    if (!pdfData) {
        return <div>Loading...</div>;
    }

    return (<div style={{
        height: '90vh',
        }}>
            <PdfViewer {...args} data={pdfData}/>
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    highlights: [],
};