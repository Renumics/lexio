import React, { useEffect, useRef } from 'react';
import { useHotkeys, Options } from 'react-hotkeys-hook';
import { ViewerToolbar } from "../ViewerToolbar";
import { ZOOM_CONSTANTS } from "../types";
import './HtmlViewer.css';
import DOMPurify from 'dompurify';

const { ZOOM_STEP, MIN_SCALE, MAX_SCALE } = ZOOM_CONSTANTS;

interface HTMLViewerProps {
    htmlContent: React.ReactNode | string; // Accept both string and React elements
}

const HtmlViewer = ({ htmlContent }: HTMLViewerProps) => {
    const [scale, setScale] = React.useState(1);
    const containerRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;

    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
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
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    const zoomIn = () => {
        setScale((prevScale) => Math.min(prevScale + ZOOM_STEP, MAX_SCALE));
    };

    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - ZOOM_STEP, MIN_SCALE));
    };

    const fitParent = () => {
        setScale(1);
    };

    const focusContainer = () => {
        containerRef.current?.focus();
    };

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

    const hotkeyOptions: Options = {
        enableOnFormTags: false,
        enabled: true,
    };

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

    const combineRefs = (element: HTMLDivElement) => {
        [zoomInRef, zoomOutRef, fitRef].forEach(ref => {
            if (typeof ref === 'function') {
                ref(element);
            } else if (ref) {
                (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
            }
        });
    };

    const renderContent = (content: React.ReactNode | string) => {
        if (typeof htmlContent === 'string') {
            return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />;
        } else {
            console.warn('HtmlViewer: Unsafe use! You are using React elements as content. ' +
                'The content will be rendered as is without sanitization.');
            return content;
        }
    }

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
                    className="html-viewer-content h-fit"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                    }}
                >
                    {renderContent(htmlContent)}
                </div>
            </div>
        </div>
    );
};

export { HtmlViewer };