import React, { useEffect, useRef } from 'react';
import { useHotkeys, Options } from 'react-hotkeys-hook';
import { ViewerToolbar } from "../ViewerToolbar";
import { ZOOM_CONSTANTS } from "../types";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../HtmlViewer/HtmlViewer.css'

const { ZOOM_STEP, MIN_SCALE, MAX_SCALE } = ZOOM_CONSTANTS;

interface MarkdownViewerProps {
    markdownContent: string;   // The raw HTML string you want to render
}

const MarkdownViewer = ({markdownContent}: MarkdownViewerProps) => {
    const [scale, setScale] = React.useState(1);
    const containerRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;

    // Optional: Handle mouse wheel zoom
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            // Prevent default scrolling behavior when zooming
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                if (event.deltaY < 0) {
                    wrappedActions.zoomIn();
                } else {
                    wrappedActions.zoomOut();
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, {passive: false});
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    // ---- Hotkeys ----

    const zoomIn = () => {
        setScale((prevScale) => Math.min(prevScale + ZOOM_STEP, MAX_SCALE));
    };

    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - ZOOM_STEP, MIN_SCALE));
    };

    const fitParent = () => {
        setScale(1);
    };

    // Helper function to focus the container
    const focusContainer = () => {
        containerRef.current?.focus();
    };

    // Wrap the existing actions with focus
    const wrappedActions = {
        zoomIn: () => {
            zoomIn();
            focusContainer();
        },
        zoomOut: () => {
            zoomOut();
            focusContainer();
        },
        fitParent: () => {
            fitParent();
            focusContainer();
        }
    };

    // Common options for hotkeys
    const hotkeyOptions: Options = {
        enableOnFormTags: false,
        enabled: true,
    };

    // Use the ref returned by useHotkeys
    const zoomInRef = useHotkeys('ctrl+up, cmd+up', 
        (event) => {
            event.preventDefault();
            zoomIn();
        }, 
        hotkeyOptions,
        [zoomIn]
    );

    const zoomOutRef = useHotkeys('ctrl+down, cmd+down', 
        (event) => {
            event.preventDefault();
            zoomOut();
        }, 
        hotkeyOptions,
        [zoomOut]
    );

    const fitRef = useHotkeys('ctrl+0, cmd+0', 
        (event) => {
            event.preventDefault();
            fitParent();
        }, 
        hotkeyOptions,
        [fitParent]
    );

    // Combine all refs into one using callback ref
    const combineRefs = (element: HTMLDivElement) => {
        [zoomInRef, zoomOutRef, fitRef].forEach(ref => {
            if (typeof ref === 'function') {
                ref(element);
            } else if (ref) {
                (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
            }
        });
    };

    return (
        <div 
            className="h-full w-full flex flex-col bg-gray-50 text-gray-700 rounded-lg focus:outline-none"
            ref={(element: HTMLDivElement | null) => {
                if (element) {
                    containerRef.current = element;
                    combineRefs(element);
                }
            }}
            tabIndex={-1}
        >
            <ViewerToolbar
                zoomIn={wrappedActions.zoomIn}
                zoomOut={wrappedActions.zoomOut}
                scale={scale}
                fitParent={wrappedActions.fitParent}
                isLoaded={true}
            />
            <div
                style={{
                    overflow: 'auto',
                    width: '100%',
                    height: '100%',
                }}
            >
                <div
                    className="html-viewer-content"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        height: '100%',
                    }}
                >
                    <Markdown remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>
                </div>
            </div>
        </div>
    );
};

export { MarkdownViewer };