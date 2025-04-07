import {ComponentProps, ReactNode, useState} from "react";

type Props = ComponentProps<"div"> & {
    tooltipContent: ReactNode;
    // Sets when the tooltip content should not be displayed. E.g when children is empty
    shouldNotDisplayCondition?: boolean | undefined;
}
const Tooltip = (
    {
        children,
        tooltipContent,
        shouldNotDisplayCondition = false,
        ...divProps
    }: Props) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            {...divProps}
            className={`relative inline-block" ${divProps.className ?? ""}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && !shouldNotDisplayCondition ?
                <div
                    className="fixed top-[10%] z-[1000] p-2.5 bg-gray-800 text-white rounded-md text-xs"
                >
                    {tooltipContent}
                </div> : null
            }
        </div>
    );
};
Tooltip.displayName = "Tooltip";

export default Tooltip;
