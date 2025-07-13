import React, { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

/**
 * Props for the LoadingSpinner component.
 * 
 * @interface LoadingSpinnerProps
 * @property {string} color - The color of the spinner
 * @property {number} [size] - The size of the spinner in pixels. Default is 42.
 * @property {number} [timeout] - The timeout in milliseconds for showing the "No data" message. Default is 2000. Set to 0 to disable.
 */
interface LoadingSpinnerProps {
    color: string;
    size?: number;
    timeout?: number;
}

/**
 * LoadingSpinner is a shared component that displays a loading spinner.
 * After the specified timeout of loading, it shows a "No data" message.
 * 
 * Used across all viewer components (PdfViewer, SpreadsheetViewer, etc.) for consistent loading UX.
 * 
 * It is based on the Lucide-React LoaderCircle component.
 * 
 * @component
 * @param {LoadingSpinnerProps} props - The props for the LoadingSpinner
 * @returns {JSX.Element} The LoadingSpinner component
 * 
 * @example
 * ```tsx
 * <LoadingSpinner 
 *   color="#3b82f6" 
 *   size={42} 
 *   timeout={2000} 
 * />
 * ```
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    color, 
    size = 42, 
    timeout = 2000
}) => {
    const [showNoData, setShowNoData] = useState(false);

    useEffect(() => {
        if (timeout <= 0) return;
        
        const timer = setTimeout(() => {
            setShowNoData(true);
        }, timeout);

        return () => clearTimeout(timer);
    }, [timeout]);

    if (showNoData && timeout > 0) {
        return (
            <div className="flex flex-col justify-center items-center gap-2 w-full absolute top-0" style={{color: color}}>
                <span>No data available.</span>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center w-full absolute top-0">
            <LoaderCircle className="animate-spin" size={size} strokeWidth={2.5} style={{color: color}}/>
        </div>
    );
};

export { LoadingSpinner };
export type { LoadingSpinnerProps }; 