import {FC, PropsWithChildren, ReactNode, useState, MouseEvent} from "react";
import {File as FileIcon, Maximize, Minimize2 as MinimizeIcon, ChevronDown} from "lucide-react";
import {Dialog, DialogContent} from "./dialog.tsx";
import ParentSizeObserver from "./parentSizeObserver.tsx";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuShortcut,
} from "../ui/dropdown-menu.tsx";

type Option = {
    label: string;
    icon: ReactNode;
    onClick?: (() => void) | undefined;
}
type PropsFileViewerContainer = PropsWithChildren & {
    fileName: string;
    optionsLeft?: Option[] | undefined;
    optionsCenter?: Option[] | undefined;
    optionsRight?: Option[];
    footer?: ReactNode | undefined;
    contentToShowOnFullScreen?: ReactNode | undefined;
    showFullScreenToggleButton?: ReactNode | undefined;
}

const TOOLBAR_BREAK_POINT = 550 as const;

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

    const optionsLeftToShow: ReactNode[] = optionsLeft ? optionsLeft.map((o) => o.icon) : [];

    const optionsCenterToShow: ReactNode[] = [
        ...(optionsCenter ? optionsCenter.map((o) => o.icon) : []),
        <p className={"font-medium text-xs text-gray-600 truncate"}>{fileName}</p>,
    ];

    const toggleFullScreen = () => {
        if (isFullScreen) {
            setIsFullScreen(false);
            return;
        }
        setIsFullScreen(true)
    }

    const defaultOptionsRight: Option[] = [
        ...(props.contentToShowOnFullScreen || props.showFullScreenToggleButton ? [
            {
                label: isFullScreen ? "Minimize" : "Maximize",
                icon: (
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
                ),
                onClick: toggleFullScreen,
            }
        ] : [])
    ];

    const optionsRightToShow: ReactNode[] = [
        ...(optionsRight ? optionsRight.map((o) => o.icon) : []),
        ...defaultOptionsRight.map((o) => o.icon),
    ];

    const optionRightOnMobile: Option[] = (optionsRight ? [...optionsRight, ...defaultOptionsRight] : [...defaultOptionsRight]);

    const desktopView = (
        <>
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
                <div className={"sticky bottom-0 z-[11] border-t p-1 bg-white overflow-y-hidden overflow-x-auto"}>
                    {footer}
                </div> : null
            }
        </>
    );

    const handleClickDropdownItemOnMobile = (event:  MouseEvent<HTMLDivElement, globalThis.MouseEvent>, callback?: (() => void) | undefined) => {
        event?.stopPropagation();
        if (!callback) return;
        callback();
    }

    const mobileView = (
        <>
            <div className={"flex gap-3 justify-between border-b-[1px] border-b-gray-300 p-1.5 z-[11] items-center content-center bg-gray-200 sticky top-0 shadow-md"}>
                <div className={"grid gap-2 items-center content-center justify-center min-w-[0]"}>
                    <p className={"font-medium text-xs text-gray-600 truncate px-1"}>{fileName}</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div
                            className={"hover:cursor-pointer hover:bg-gray-300 rounded-md"}
                        >
                            <button
                                className={"p-2.5"}
                                title={"Show toolbar options"}
                            >
                                <ChevronDown
                                    className={"size-4 text-center text-gray-800"}
                                    strokeWidth={2.4}
                                />
                            </button>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px] bg-white z-[1000]">
                        <DropdownMenuGroup>
                            {optionsLeft?.map((option, index) =>
                                <DropdownMenuItem className={"hover:bg-gray-200 hover:cursor-pointer rounded-lg"} key={index} onClick={(e) => handleClickDropdownItemOnMobile(e, option.onClick)}>
                                    <DropdownMenuShortcut className={"flex-1 text-left tracking-tight"}>{option.label}</DropdownMenuShortcut>
                                    <div className={"hover:cursor-pointer hover:bg-gray-300 rounded-md"}>
                                        {option.icon}
                                    </div>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className={"bg-gray-200"} />

                        <DropdownMenuGroup>
                            {optionRightOnMobile?.map((option, index) =>
                                <DropdownMenuItem className={"hover:bg-gray-200 hover:cursor-pointer rounded-lg px-3"} key={index} onClick={(e) => handleClickDropdownItemOnMobile(e, option.onClick)}>
                                    <DropdownMenuShortcut className={"flex-1 text-left tracking-tight"}>{option.label}</DropdownMenuShortcut>
                                    {option.icon}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
            <div className={"h-full w-full overflow-auto"}>
                {children ??
                    <div
                        className={"grid gap-4 justify-items-center justify-content-center items-center content-center m-[auto] h-full"}
                        style={{backgroundColor: "#d1d5dc"}}>
                        <div className={"grid justify-items-center justify-content-center items-center content-center"}>
                            <FileIcon className={"size-40 text-gray-400"} strokeWidth={1.2}/>
                            <div className={"text-2xl font-semibold text-gray-400"}>No Source</div>
                        </div>
                        <div className={"text-gray-500"}>No file available to show!</div>
                    </div>
                }
            </div>
            {footer ?
                <div className={"sticky bottom-0 z-[11] border border-t p-1 bg-gray-50 overflow-y-hidden overflow-x-auto"}>
                    {footer}
                </div> : null
            }
        </>
    );

    const contentToShow = (
        <ParentSizeObserver className={"grid h-full grid-rows-[max-content_1fr] overflow-hidden"}>
            {(parentSize) => parentSize.width >= TOOLBAR_BREAK_POINT ? desktopView : mobileView}
        </ParentSizeObserver>
    );

    return (
        <>
            {contentToShow}
            {isFullScreen ?
                <Dialog defaultOpen onOpenChange={() => setIsFullScreen(false)}>
                    <DialogContent className="grid grid-rows-[1fr] max-w-[80dvw] w-[100%] h-[100%] max-h-[92dvh] p-0 bg-white z-[1000] rounded-md">
                        <div className={"grid rounded-md h-full overflow-hidden"}>
                            {props.contentToShowOnFullScreen ?? contentToShow}
                        </div>
                    </DialogContent>
                </Dialog> : null}
        </>
    );
};
FileViewerContainer.displayName = "FileViewerContainer";
