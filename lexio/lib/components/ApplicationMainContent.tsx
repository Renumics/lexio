import {FunctionComponent} from "react";
import {CardContainer} from "./ui/card";
import {ChatWindow} from "./ChatWindow";
import {QueryField} from "./QueryField";
import {useRAGSources} from "./RAGProvider";
import {ContentDisplay, SourcesDisplay} from "../main.ts";

const ApplicationMainContent: FunctionComponent = () => {
    const  {
        sources,
        currentSourceContent,
        isRetrievedSourcesComponentOpen,
        toggleIsRetrievedSourcesComponentOpen,
        isFileViewerComponentOpen,
        toggleIsFileViewerComponentOpen,
    } = useRAGSources()

    const areSourcesAvailable = sources !== undefined && sources !== null && sources.length > 0;

    const isCurrentSourceContentAvailable = currentSourceContent !== undefined && currentSourceContent !== null;

    const onQuerySubmission = () => {
        if (isRetrievedSourcesComponentOpen) return
        toggleIsRetrievedSourcesComponentOpen()
    }

    const onSourceSelection = () => {
        if (isFileViewerComponentOpen) return
        toggleIsFileViewerComponentOpen()
    }

    let gridColumns = "grid-cols-[1fr]";

    if (areSourcesAvailable || isCurrentSourceContentAvailable) {
        gridColumns = "grid-cols-[1fr_max-content]"
    }
    if (areSourcesAvailable && isCurrentSourceContentAvailable) {
        gridColumns = "grid-cols-[1fr_max-content_2fr]"
    }
    if (isRetrievedSourcesComponentOpen && !isFileViewerComponentOpen && areSourcesAvailable) {
        gridColumns = "grid-cols-[1fr_max-content]"
    }
    if (isFileViewerComponentOpen && !isRetrievedSourcesComponentOpen && areSourcesAvailable) {
        gridColumns = "grid-cols-[1fr_1fr]"
    }
    if (!isFileViewerComponentOpen && !isRetrievedSourcesComponentOpen && areSourcesAvailable) {
        gridColumns = "grid-cols-[1fr]"
    }
    if (isFileViewerComponentOpen && isRetrievedSourcesComponentOpen && areSourcesAvailable) {
        gridColumns = "grid-cols-[1fr_max-content_2fr]"
    }

    return (
        <div className={`grid gap-4 ${gridColumns} h-full max-w-[1700px]`}>
            <CardContainer className={"p-1 border-none overflow-hidden gap-0"}>
                <div className={"overflow-auto pt-4"}>
                    <ChatWindow />
                </div>
                <div className={"self-end sticky bottom-0"}>
                    <QueryField
                        onSubmit={(msg: string) => onQuerySubmission()}
                        toggleRetrievedSourcesComponent={toggleIsRetrievedSourcesComponentOpen}
                        toggleFileViewerComponent={toggleIsFileViewerComponentOpen}
                    />
                </div>
            </CardContainer>
            {areSourcesAvailable && isRetrievedSourcesComponentOpen ?
                <CardContainer className={"mb-10 p-3 drop-shadow-md overflow-hidden"}>
                    <div className={"overflow-auto"}>
                        <SourcesDisplay onSourceSelection={onSourceSelection} />
                    </div>
                </CardContainer> : null
            }
            {isCurrentSourceContentAvailable && isFileViewerComponentOpen ?
                <CardContainer className={"mb-10 drop-shadow-md overflow-hidden"}>
                    <div className={"overflow-auto"}>
                        <ContentDisplay />
                    </div>
                    {/*<FileViewerContainer*/}
                    {/*    fileName={"dummy.pdf"}*/}
                    {/*    optionsLeft={[]}*/}
                    {/*    optionsCenter={[]}*/}
                    {/*    optionsRight={[<CloseIcon size={"20px"} />]}*/}
                    {/*/>*/}
                </CardContainer> : null
            }
        </div>
    )
};
ApplicationMainContent.displayName = "ApplicationMainContent";

export default ApplicationMainContent;
