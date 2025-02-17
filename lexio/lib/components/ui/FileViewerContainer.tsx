import {FC, PropsWithChildren, ReactNode, useState} from "react";
import {File as FileIcon, Maximize, Minimize2 as MinimizeIcon} from "lucide-react";
import {Dialog, DialogContent} from "./dialog.tsx";

type PropsFileViewerContainer = PropsWithChildren & {
    fileName: string;
    optionsLeft?: ReactNode[] | undefined;
    optionsCenter?: ReactNode[] | undefined;
    optionsRight?: ReactNode[];
    footer?: ReactNode | undefined;
    contentToShowOnFullScreen?: ReactNode | undefined;
    showFullScreenToggleButton?: ReactNode | undefined;
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

    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

    const optionsLeftToShow = optionsLeft ?? [];

    const optionsCenterToShow = [
        ...(optionsCenter ?? []),
        <p className={"font-medium text-xs text-gray-600 truncate"}>{fileName}</p>,
    ];

    const toggleFullScreen = () => {
        if (isFullScreen) {
            setIsFullScreen(false);
            return;
        }
        setIsFullScreen(true)
    }

    const optionsRightToShow = [
        ...(optionsRight ?? []),
        ...(props.contentToShowOnFullScreen || props.showFullScreenToggleButton ? [
            <button
                className={"p-2.5"}
                title={isFullScreen ? "Minimize" : "Expand"}
                onClick={toggleFullScreen}
            >
                {isFullScreen ?
                    <MinimizeIcon
                        className={"size-4 text-center text-gray-800"}
                        strokeWidth={2.4}
                    /> :
                    <Maximize
                        className={"size-4 text-center text-gray-800"}
                        strokeWidth={2.4}
                    />
                }
            </button>
        ]: []),
    ];

    const content = (
        <div className={"grid h-full grid-rows-[max-content_1fr] overflow-hidden"}>
            <div
                className={"flex gap-3 justify-between border-b-[1px] border-b-gray-300 p-1.5 z-[11] items-center content-center bg-gray-200 sticky top-0 shadow-md"}>
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
                <div
                    className={`grid gap-2 items-center content-center justify-center min-w-[0]`}
                    style={{
                        gridTemplateColumns: `repeat(${optionsCenterToShow.length}, auto)`,
                    }}
                >
                    {optionsCenterToShow.map((option, index) =>
                        <div
                            key={index}
                            className={"rounded-2xl min-w-[0]"}
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
                {children ??
                    <div className={"grid gap-4 justify-items-center justify-content-center items-center content-center m-[auto] h-full"} style={{ backgroundColor: "#d1d5dc" }}>
                        <div className={"grid justify-items-center justify-content-center items-center content-center"}>
                            <FileIcon className={"size-40 text-gray-400"} strokeWidth={1.2} />
                            <div className={"text-2xl font-semibold text-gray-400"}>No Source</div>
                        </div>
                        <div className={"text-gray-500"}>No file available to show!</div>
                    </div>
                }
            </div>
            {footer ?
                <div className={"sticky bottom-0 z-[11] border-t p-1 bg-gray-50 overflow-y-hidden overflow-x-auto"}>
                    {footer}
                </div> : null
            }
        </div>
    );

    return (
        <>
            {content}
            {isFullScreen ?
                <Dialog defaultOpen onOpenChange={() => setIsFullScreen(false)}>
                    <DialogContent className="grid grid-rows-[1fr] max-w-[80dvw] w-[100%] h-[100%] max-h-[92dvh] p-0 bg-white z-[1000]">
                        <div className={"grid rounded-md h-full overflow-hidden"}>
                            {props.contentToShowOnFullScreen ?? content}
                        </div>
                    </DialogContent>
                </Dialog> : null}
        </>
    );
};
FileViewerContainer.displayName = "FileViewerContainer";
