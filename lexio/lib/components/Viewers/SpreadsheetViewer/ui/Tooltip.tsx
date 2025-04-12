import {ComponentProps, ReactNode, useState} from "react";

/**
 * TooltipProps type
 *
 * @type TooltipProps
 * @property {ReactNode} tooltipContent - The content of the tooltip
 * @property {boolean | undefined} shouldNotDisplayCondition - Sets when the tooltip content should not be displayed. E.g when children is empty
 */
type TooltipProps = ComponentProps<"div"> & {
    tooltipContent: ReactNode;
    shouldNotDisplayCondition?: boolean | undefined;
}

/**
 * Component used to truncate text and display a tooltip on mouse hover
 *
 * @component Tooltip
 * @param {ReactNode} tooltipContent - The content of the tooltip
 * @param {boolean | undefined} shouldNotDisplayCondition - Sets when the tooltip content should not be displayed. E.g when children is empty
 */
const Tooltip = (
    {
        children,
        tooltipContent,
        shouldNotDisplayCondition = false,
        ...divProps
    }: TooltipProps) => {
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
