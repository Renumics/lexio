import ApplicationLayout from "./components/ApplicationLayout.tsx";
import ApplicationMainContent from "./components/ApplicationMainContent.tsx";
import {FC, useEffect, useState} from "react"
import {ActionHandlerResponse, createTheme, ErrorDisplay, Message, LexioProvider, Source, UserAction} from "lexio";
import {v4 as uuid} from "uuid";

const customTheme = createTheme({
    colors: {
        primary: '#1E88E5',
        secondary: '#64B5F6'
    }
});

const App: FC = () => {
    const { sources: mockSources } = useMockData();

    const mockActionResult: ActionHandlerResponse = {
        response: Promise.resolve("This is what jarvis is about"),
        sources: Promise.resolve<Source[]>(mockSources),
    }
    // @ts-ignore
    const handleAction = (actionHandlerFunction: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: (Source | null)): ActionHandlerResponse | undefined => {
        return mockActionResult;
    }

    return (
        <LexioProvider
            // @ts-ignore
            onAction={handleAction}
            config={undefined}
            theme={customTheme}
        >
            <ApplicationLayout>
                <ApplicationMainContent />
                <ErrorDisplay />
            </ApplicationLayout>
        </LexioProvider>
    );
}

type MockData = {
    sources: Source[];
}
const useMockData = (): MockData => {
    const [jarvisPdfBuffer, setJarvisPdfBuffer] = useState<ArrayBuffer | undefined>(undefined);
    const [dummyPdfBuffer, setDummyPdfBuffer] = useState<ArrayBuffer | undefined>(undefined);
    const [excelSampleBuffer, setExcelSampleBuffer] = useState<ArrayBuffer | undefined>(undefined);

    // Pdf content mocks
    useEffect(() => {
        // Jarvis pdf
        const getJarvisPdfSource = async () => {
            const response = await fetch("http://localhost:5173/Current_State_Of_LLM-based_Assistants_For_Engineering.pdf");
            const data = await response.arrayBuffer() as Uint8Array<ArrayBufferLike>;
            setJarvisPdfBuffer(data);
        }
        // Dummy pdf
        const getDummyPdfSource = async () => {
            const response = await fetch("http://localhost:5173/dummy.pdf");
            const data = await response.arrayBuffer() as Uint8Array<ArrayBufferLike>;
            setDummyPdfBuffer(data);
        }
        // Excel file
        const getExcelSampleSource = async () => {
            const response = await fetch("http://localhost:5173/excel_sample.xlsx");
            const data = await response.arrayBuffer();
            setExcelSampleBuffer(data);
        }

        getJarvisPdfSource();
        getDummyPdfSource();
        getExcelSampleSource();
    }, []);

    const sources: Source[] = [
        // PDF Sources
        {
            id: uuid(),
            title: "Current_State_Of_LLM-based_Assistants_For_Engineering.pdf",
            type: "pdf",
            relevance: 40,
            data: new Uint8Array(jarvisPdfBuffer as ArrayBuffer),
            metadata: {
                page: 4,
            }
        },
        {
            id: uuid(),
            title: "dummy.pdf",
            type: "pdf",
            relevance: 30,
            data: new Uint8Array(dummyPdfBuffer as ArrayBuffer),
            metadata: {
                page: 1,
            }
        },
        // Excel Sources
        {
            id: uuid(),
            title: "excel_sample.xlsx",
            type: "xlsx",
            relevance: 30,
            data: excelSampleBuffer,
            // TODO 3: Reset worksheet on tab switch -> add loading spinner
            // highlights: [
            //     {
            //         sheetName: "Equipment List",
            //         ranges: ["A1:B8", "B9:C15", "C18:E20", "D5:F15", "F9:H15", "B42:E50", "F20:G29"],
            //     }
            // ],
        },
    ] as Source[];

    return {
        sources,
    };
}

export default App
