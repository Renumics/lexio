import {createContext, FC, PropsWithChildren, ReactNode, Ref, useContext, useRef, useState} from "react";
import { Maximize } from "lucide-react";
import {cn} from "../utils.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./dialog.tsx";
import {Button} from "./button.tsx";

type PropsFileViewerContainer = PropsWithChildren & {
    fileName: string;
    optionsLeft?: ReactNode[] | undefined;
    optionsCenter?: ReactNode[] | undefined;
    optionsRight?: ReactNode[];
    footer?: ReactNode | undefined;
}
export const FileViewerContainer: FC<PropsFileViewerContainer> = (props) => {
    const {
        fileName,
        optionsLeft,
        optionsRight,
        optionsCenter,
        footer,
        children
    } = props;

    const fileViewerRef = useRef<HTMLDivElement>();

    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

    const optionsLeftToShow = optionsLeft ?? [];

    const optionsCenterToShow = [
        ...(optionsCenter ?? []),
        <p className={"font-medium text-xs text-gray-600"}>{fileName}</p>
    ];

    const optionsRightToShow = [
        ...(optionsRight ?? []),
        <button className={"p-1.5"} title={"Expand"}>
            <Maximize
                className={"size-4 text-center"}
                strokeWidth={2.4}
                onClick={() => setIsFullScreen(true)}
            />
        </button>
    ];

    const content = (
        <div ref={fileViewerRef as Ref<HTMLDivElement>}
             className={"grid h-full grid-rows-[max-content_1fr] overflow-hidden"}>
            <div className={"flex gap-3 border-b p-1.5 z-[11] items-center content-center bg-gray-200 sticky top-0"}>
                <div className={"flex gap-2"}>
                    {optionsLeftToShow.map((option, index) =>
                        <div
                            key={index}
                            className={"hover:cursor-pointer p-1 rounded-2xl"}
                        >
                            {option}
                        </div>
                    )}
                </div>
                <div className={"flex flex-1 gap-2 justify-center"}>
                    {optionsCenterToShow.map((option, index) =>
                        <div
                            key={index}
                            className={"rounded-2xl"}
                        >
                            {option}
                        </div>
                    )}
                </div>
                <div className={"flex gap-2.5 items-center content-center"}>
                    {optionsRightToShow.map((option, index) =>
                        <div
                            key={index}
                            className={"hover:cursor-pointer hover:bg-gray-300 rounded-md"}
                        >
                            {option}
                        </div>
                    )}
                </div>
            </div>
            <div className={"h-full w-full overflow-auto"}>
                {children}
            </div>
            {footer ?
                <div className={"sticky bottom-0 z-[11] border-t p-1 bg-gray-50 overflow-y-hidden overflow-x-auto"}>
                    {footer}
                </div> : null
            }
        </div>
    );

    return (
        content
    );
};
FileViewerContainer.displayName = "FileViewerContainer";

// Data model of the singleton FileViewerContextProvider
type FileViewerContextOutput = {
    fileName: string;
    optionsLeft: ReactNode[];
    optionsCenter: ReactNode[];
    optionsRight: ReactNode[];
    footer: ReactNode;
    addOptionsLeft: (options: ReactNode[]) => void;
    addOptionsRight: (options: ReactNode[]) => void;
    addOptionsCenter: (options: ReactNode[]) => void;
    setFooter: (footer: ReactNode[]) => void;
};

// @ts-ignore
const FileViewerContext = createContext<FileViewerContextOutput>({});

// Hook to pass data to the singleton FileViewerContainer
export const useFileViewerContext = () => {
    const context = useContext<FileViewerContextOutput>(FileViewerContext);
    if (!context) {
        throw new Error("The useFileViewerContext hook can only be called inside the FileViewerContextProvider");
    }
    return context;
}

type FileViewerContextInput = PropsWithChildren & {
    fileName: string;
}
// File viewer Provider providing data to the singleton FileViewerContainer
export const FileViewerContextProvider: FC<FileViewerContextInput> = (props) => {
    const {fileName} = props;
    const [optionsLeft, setOptionsLeft] = useState<ReactNode[]>([]);
    const [optionsCenter, setOptionsCenter] = useState<ReactNode[]>([]);
    const [optionsRight, setOptionsRight] = useState<ReactNode[]>([]);
    const [footer, setFooter] = useState<ReactNode | undefined>(undefined);

    const addOptionsLeft = (options: ReactNode[]) => {
        setOptionsLeft((prevState) => ([...prevState, ...options]));
    }
    const addOptionsRight = (options: ReactNode[]) => {
        setOptionsRight((prevState) => ([...prevState, ...options]));
    }
    const addOptionsCenter = (options: ReactNode[]) => {
        setOptionsCenter((prevState) => ([...prevState, ...options]));
    }
    return (
        <FileViewerContext.Provider value={{
            fileName,
            optionsLeft,
            optionsRight,
            optionsCenter,
            footer,
            addOptionsLeft,
            addOptionsRight,
            addOptionsCenter,
            setFooter,
        }}>
            <FileViewerContainer
                fileName={fileName}
                optionsLeft={optionsLeft}
                optionsCenter={optionsCenter}
                optionsRight={optionsRight}
                footer={footer}
            >
                {props.children}
            </FileViewerContainer>
        </FileViewerContext.Provider>
    )
}
FileViewerContextProvider.displayName = "FileViewerContextProvider";

// type PropsOverlay = PropsWithChildren & {
//     className?: string;
// }
// export const Overlay: FC<PropsOverlay> = (props) => {
//     return (
//         <div
//             className={cn(
//                 "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
//                 props.className
//             )}
//         >
//             {props.children}
//         </div>
//     );
// }
// Overlay.displayName = "Overlay";
//
// type PropsDialogContent = PropsWithChildren & {
//     className?: string;
// }
// export const DialogContent: FC<PropsDialogContent> = (props) => {
//     return (
//         <div
//             className={cn(
//                 "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
//                 props.className
//             )}>
//             {props.children}
//         </div>
//     );
// }
// DialogContent.displayName = "DialogContent";
//
//
// type PropsDialog = PropsWithChildren & {
//     className?: string;
// }
// export const Dialog: FC<PropsDialog> = (props) => {
//     return (
//         <div>
//
//         </div>
//     )
// };
// Dialog.displayName = "Dialog";