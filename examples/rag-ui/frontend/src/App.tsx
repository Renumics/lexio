import ApplicationLayout from "./components/ApplicationLayout.tsx";
import ApplicationMainContent from "./components/ApplicationMainContent.tsx";
import {FC, useEffect, useState} from "react"
import {ActionHandlerResponse, createTheme, ErrorDisplay, Message, RAGProvider, Source, UserAction} from "lexio";
import {v4 as uuid} from "uuid";

const customTheme = createTheme({
    colors: {
        primary: '#1E88E5',
        secondary: '#64B5F6'
    }
});

const App: FC = () => {
    const { sources: mockSources } = useMockData();
    // @ts-ignore
    const handleAction = (actionHandlerFunction: UserAction, messages: Message[], sources: Source[], activeSources: Source[], selectedSource: (Source | null)): ActionHandlerResponse | undefined => {
        return {
            response: Promise.resolve("This is what jarvis is about"),
            messages: [""],
            sources: Promise.resolve<Source[]>(mockSources),
        };
    }

    return (
        <RAGProvider
            onAction={handleAction}
            config={undefined}
            theme={customTheme}
        >
            <ApplicationLayout>
                <ApplicationMainContent />
                <ErrorDisplay />
            </ApplicationLayout>
        </RAGProvider>
    );
}

type MockData = {
    sources: Source[];
}
const useMockData = (): MockData => {
    const [jarvisPdfBufferData, setJarvisPdfBufferData] = useState<ArrayBuffer | undefined>(undefined);
    const [dummyPdfBufferData, setDummyPdfBufferData] = useState<ArrayBuffer | undefined>(undefined);

    // Pdf content mocks
    useEffect(() => {
        // Jarvis pdf
        const getJarvisPdfSource = async () => {
            const response = await fetch("http://localhost:5173/Current_State_Of_LLM-based_Assistants_For_Engineering.pdf");
            const data = await response.arrayBuffer() as Uint8Array<ArrayBufferLike>;
            setJarvisPdfBufferData(data);
        }
        // Dummy pdf
        const getDummyPdfSource = async () => {
            const response = await fetch("http://localhost:5173/dummy.pdf");
            const data = await response.arrayBuffer() as Uint8Array<ArrayBufferLike>;
            setDummyPdfBufferData(data);
        }

        getJarvisPdfSource();
        getDummyPdfSource();
    }, []);

    const sources: Source[] = [
        // PDF Sources
        {
            id: uuid(),
            title: "Current_State_Of_LLM-based_Assistants_For_Engineering.pdf",
            type: "pdf",
            relevance: 40,
            data: new Uint8Array(jarvisPdfBufferData as ArrayBuffer),
            metadata: {
                page: 4,
            }
        },
        {
            id: uuid(),
            title: "dummy.pdf",
            type: "pdf",
            relevance: 30,
            data: new Uint8Array(dummyPdfBufferData as ArrayBuffer),
            metadata: {
                page: 1,
            }
        },
    ] as Source[];

    return {
        sources,
    };
}

export default App
