import {FunctionComponent} from "react";
import {CardContainer} from "../ui/card";
import {ChatWindow, ContentDisplay, QueryField, SourcesDisplay,} from "../../../../../lexio/lib/main";

const ApplicationMainContent: FunctionComponent = () => {
    const gridColumns = "grid-cols-[1fr_max-content_1fr]";

    return (
        <div className={`grid gap-4 ${gridColumns} h-full max-w-[1700px]`}>
            <CardContainer className={"p-1 border-none overflow-hidden gap-0"}>
                <div className={"overflow-auto pt-4"}>
                    <ChatWindow />
                </div>
                <div className={"self-end sticky bottom-0"}>
                    <QueryField />
                </div>
            </CardContainer>
            <CardContainer className={"mb-10 overflow-hidden border-gray-300"}>
                <div className={"overflow-hidden"}>
                    <SourcesDisplay />
                </div>
            </CardContainer>
            <CardContainer className={"mb-10 overflow-hidden"}>
                <div className={"overflow-auto"}>
                    <ContentDisplay />
                </div>
            </CardContainer>
        </div>
    )
};
ApplicationMainContent.displayName = "ApplicationMainContent";

export default ApplicationMainContent;
