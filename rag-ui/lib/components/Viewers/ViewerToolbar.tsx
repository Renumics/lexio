import {
    ArrowsPointingOutIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/solid";
import { ViewerToolbarProps } from "./types";

export const ViewerToolbar = ({ zoomIn, zoomOut, scale, fitParent, children, isLoaded = true }: ViewerToolbarProps) => {
    return (
        <div className="px-2 bg-gray-400 gap-x-1 flex flex-row justify-between text-gray-700 z-10 py-1"
             style={{
                 borderTopLeftRadius: '0.5rem',
                 borderTopRightRadius: '0.5rem',
                 boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
             }}
        >
            {children}
            <div className="flex flex-row gap-x-1">
                <button
                    className="px-2 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={zoomIn}
                    title="Zoom In (Ctrl+Up, Cmd+Up)"
                    disabled={!isLoaded}>
                    <MagnifyingGlassPlusIcon className="size-5 text-black"/>
                </button>
                <div className="m-auto min-w-14 text-center bg-gray-100 rounded-md">
                    {isLoaded ? Math.round(scale * 100) + '%' : '--'}
                </div>
                <button
                    className="px-2 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={zoomOut}
                    title="Zoom Out (Ctrl+Down, Cmd+Down)"
                    disabled={!isLoaded}>                        
                    <MagnifyingGlassMinusIcon className="size-5 text-black"/>
                </button>
                {fitParent && (
                    <button
                        className="px-2 rounded-md bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={fitParent}
                        title="Fit to Parent (Ctrl+0, Cmd+0)"
                        disabled={!isLoaded}>
                        <ArrowsPointingOutIcon className="size-5 text-black"/>
                    </button>
                )}
            </div>
        </div>
    );
}; 