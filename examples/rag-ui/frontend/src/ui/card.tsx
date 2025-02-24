import {ComponentProps, FC, PropsWithChildren} from "react";
import {cn} from "../utils"

type PropsCardContainer = PropsWithChildren & ComponentProps<"div">;

const baseStyles: ComponentProps<"div">["className"] = "grid gap-2 grid-cols-1 border-[0.5px] border-solid border-gray-300 bg-white rounded-md justify-between leading-normal overflow-x-auto";

export const CardContainer: FC<PropsCardContainer> = (props) => {
    const { children, className, ...rest } = props;
    return (
        <div
            {...rest}
            className={cn(baseStyles, className)}
        >
            {children}
        </div>
    );
}
CardContainer.displayName = "CardContainer";
