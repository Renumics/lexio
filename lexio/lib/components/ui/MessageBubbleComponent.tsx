import {FC, ReactNode} from "react";
import {cn} from "../utils";
import {Bot, Copy} from "lucide-react";

type Props = {
    text: string;
    name: ReactNode;
    isFromUser: boolean;
    className?: string | undefined;
    onResponseCopy?: ((text: string) => void) | undefined;
}
export const MessageBubbleComponent: FC<Props> = (props: Props) => {
    const { text, isFromUser, name, className } = props;

    const handleResponseCopy = async () => {
        await navigator.clipboard.writeText(text);
        if (!props.onResponseCopy) return;
        props.onResponseCopy(text);
    };

    const userMessageBubble = (
        <div className={"grid auto-cols-fr justify-items-end justify-end"}>
            <div className={`grid grid-cols-1 items-start content-start max-w-[80%]`}>
                <div className={cn("bg-blue-600 text-white py-3 px-4 rounded-3xl w-full whitespace-pre-wrap", className)}>
                    {/*<div>{name}</div>*/}
                    <div className={"tracking-tight"}>{text}</div>
                </div>
            </div>
        </div>
    );
    const assistantMessageBubble = (
        <div className={"grid auto-cols-fr justify-items-start justify-start"}>
            <div className={`grid grid-cols-[max-content_1fr] gap-2 items-start content-start max-w-[80%]`}>
                <div className={"grid items-center content-center justify-center rounded-[50%] border-[1px] mt-1 w-[30px] h-[30px]"} style={{ borderColor: "gray"}}>
                    <Bot style={{color: "gray"}} size={"20px"} />
                </div>
                <div className={"grid auto-cols-fr gap-2"}>
                    <div className={cn("bg-gray-300 py-3 px-4 rounded-3xl w-full whitespace-pre-wrap", className)}>
                        <div className={"tracking-tight"}>{name}</div>
                        <div className={"tracking-tight"}>{text}</div>
                    </div>
                    <div className={"flex gap-4 px-3"}>
                        {/*<ThumbsUp style={{color: "gray"}} size={"20px"} />*/}
                        {/*<ThumbsDown style={{color: "gray"}} size={"20px"} />*/}
                        <Copy
                            style={{color: "gray"}}
                            size={"20px"}
                            className={"hover:cursor-pointer"}
                            onClick={handleResponseCopy}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
    return (
        isFromUser ? userMessageBubble : assistantMessageBubble
        // <div
        //     style={{
        //         display: "grid",
        //         gridAutoColumns: "1fr",
        //         justifyItems: isFromUser ? "right" : "left",
        //         justifyContent: isFromUser ? "right" : "left",
        //     }}
        // >
        //     <div
        //         className={`grid items-start content-start max-w-[80%] ${!isFromUser ? "grid-cols-[max-content_1fr] gap-2" : "grid-cols-1"}`}>
        //         {!isFromUser ?
        //             <div
        //                 className={"grid items-center content-center justify-center rounded-[50%] border-[2px] mt-1 w-[30px] h-[30px]"}>
        //                 <Bot style={{color: "gray"}} size={"20px"}/>
        //             </div> : null
        //         }
        //         <div className={cn({
        //             "bg-blue-600": isFromUser,
        //             "bg-gray-300": !isFromUser,
        //             "text-white": isFromUser,
        //             "py-3 px-4 rounded-2xl": true,
        //         }, className)}
        //              style={{
        //                  width: "100%",
        //                  whiteSpace: "pre-wrap",
        //              }}
        //         >
        //             <div>{name}</div>
        //             <div>{text}</div>
        //         </div>
        //     </div>
        // </div>
    );
}
MessageBubbleComponent.displayName = "MessageBubbleComponent";