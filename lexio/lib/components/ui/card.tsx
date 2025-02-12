import {FC, forwardRef, PropsWithChildren, ReactNode} from "react";
import {cn} from "../utils"

type PropsCardContainer = PropsWithChildren & {
    className?: string | undefined;
};
const baseStyles = "relative grid gap-2 grid-cols-1 border-[0.5px] border-solid border-gray-300 bg-white rounded-md justify-between leading-normal overflow-x-auto";

export const CardContainer: FC<PropsCardContainer> = (props) => {
    const { children, className } = props;
    return (
        <div className={cn(baseStyles, className)}>{children}</div>
    );
}
CardContainer.displayName = "CardContainer";

type PropsCardContainerWithOptions = PropsWithChildren & {
    title: string;
    className?: string | undefined;
    options: ReactNode[];
};
export const CardContainerWithOptions = forwardRef<HTMLDivElement, PropsCardContainerWithOptions>((props, ref) => {
    const {title, options, children, className} = props;
    return (
        <div ref={ref} className={cn(`${baseStyles} gap-4 items-start content-start`, className)}>
            <div className={"grid grid-cols-[1fr_max-content] gap-1"}>
                <div>
                    <p className={"truncate"}>{title}</p>
                </div>
                <div className={"flex gap-3"}>
                    {options.map((option, index) =>
                        <div
                            key={index}
                            className={"hover:cursor-pointer p-0.5 rounded-2xl hover:bg-gray-200"}
                        >
                            {option}
                        </div>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
})
CardContainerWithOptions.displayName = "CardContainerWithOptions";
