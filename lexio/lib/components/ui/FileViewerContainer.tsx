import {FC, PropsWithChildren, ReactNode} from "react";

type Props = PropsWithChildren & {
    fileName: string;
    optionsLeft?: ReactNode[] | undefined;
    optionsCenter?: ReactNode[] | undefined;
    optionsRight?: ReactNode[];
    footer?: ReactNode | undefined;
}
export const FileViewerContainer: FC<Props> = (props) => {
    const {
        fileName,
        optionsLeft,
        optionsRight,
        optionsCenter,
        footer,
        children
    } = props;

    const optionsLeftToShow = optionsLeft ?? [];

    const optionsCenterToShow = [
        ...(optionsCenter ?? []),
        <p className={"font-medium text-xs text-gray-600"}>{fileName}</p>
    ];

    const optionsRightToShow = optionsRight ?? [];

    return (
        <div className={"grid"}>
            <div className={"flex gap-3 border-b p-1 z-[10] bg-gray-200 sticky top-0"}>
                <div className={"flex gap-2"}>
                    {optionsLeftToShow.map((option, index) =>
                        <div
                            key={index}
                            className={"hover:cursor-pointer p-1 rounded-2xl hover:bg-gray-300"}
                        >
                            {option}
                        </div>
                    )}
                </div>
                <div className={"flex flex-1 gap-2 justify-center"}>
                    {optionsCenterToShow.map((option, index) =>
                        <div
                            key={index}
                            className={"hover:cursor-pointer p-1 rounded-2xl hover:bg-gray-300"}
                        >
                            {option}
                        </div>
                    )}
                </div>
                <div className={"flex gap-2"}>
                    {optionsRightToShow.map((option, index) =>
                        <div
                            key={index}
                            className={"hover:cursor-pointer p-1 rounded-2xl hover:bg-gray-300"}
                        >
                            {option}
                        </div>
                    )}
                </div>
            </div>
            <div className={"h-full"}>{children}</div>
            {footer ?
                <div className={"sticky bottom-0 z-[11] border-t p-1 bg-gray-50 overflow-y-hidden overflow-x-auto"}>
                    {footer}
                </div> : null
            }
        </div>
    );
};
FileViewerContainer.displayName = "FileViewerContainer";
