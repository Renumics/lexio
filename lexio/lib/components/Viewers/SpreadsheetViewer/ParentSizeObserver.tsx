import {ReactNode, useCallback, useEffect, useRef, useState} from "react";

/**
 * Represents the size of a container with width and height properties.
 */
export type ContainerSize = {
    width: number;
    height: number;
}

/**
 * Default size for the parent container, initialized to zero width and height.
 */
const DEFAULT_PARENT_SIZE: ContainerSize = {
    width: 0,
    height: 0,
};

/**
 * Props for the ParentSizeObserver component.
 *
 * @type ParentSizeObserverProps
 * @property {string | undefined} className - CSS class name to apply to the parent container.
 * @property {number | undefined} debounceTime - Debounce time in milliseconds for resize events. Determines how frequently the resize handler is triggered.
 * @property {((parentSize: ContainerSize) => ReactNode) | undefined} children - Render function that receives the parent container's size and returns React nodes to render inside the container.
 */
type ParentSizeObserverProps = {
    className?: string | undefined;
    debounceTime?: number | undefined;
    children?: ((parentSize: ContainerSize) => ReactNode) | undefined;
}
/**
 * Component that observes the size of its parent container and provides the dimensions to its children via a render function.
 *
 * @param {string | undefined} className - CSS class name to apply to the parent container.
 * @param {number | undefined} debounceTime - Debounce time in milliseconds for resize events. Determines how frequently the resize handler is triggered.
 * @param {((parentSize: ContainerSize) => ReactNode) | undefined} children - Render function that receives the parent container's size and returns React nodes to render inside the container.
 * @returns {JSX.Element} The rendered component.
 */
const ParentSizeObserver = ({ className, debounceTime = 100, children }: ParentSizeObserverProps) => {
    const [parentSize, setParentSize] = useState<ContainerSize>(DEFAULT_PARENT_SIZE);

    const parentRef = useRef<HTMLDivElement | null>(null);

    const animationFrameId = useRef<number | null>(null);

    const handleResize = useCallback( (entries: ResizeObserverEntry[]) => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current as number);
        }
        animationFrameId.current = requestAnimationFrame(() => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                setParentSize({
                    width: Math.floor(width),
                    height: Math.floor(height),
                });
            }
        });
    }, []);

    useEffect(() => {
        if (!parentRef.current) return;

        let timeout: NodeJS.Timeout | undefined = undefined;

        const resizeObserver = new ResizeObserver((entries) => {
            timeout = setTimeout(() => {
                handleResize(entries);
            }, debounceTime as number);
        });

        resizeObserver.observe(parentRef.current as Element);

        function resizeParentContainer() {
            if (!parentRef.current) return;
            resizeObserver.observe(parentRef.current as Element);
        }

        window.addEventListener("resize", resizeParentContainer)

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current as number);
                animationFrameId.current = null;
            }

            clearTimeout(timeout);

            resizeObserver.disconnect();

            window.removeEventListener("resize", resizeObserver.disconnect);
        }
    }, [debounceTime, parentRef, children, handleResize]);

    return (
        <div ref={parentRef} className={className}>
            {children ? children(parentSize) : null}
        </div>
    );
}
ParentSizeObserver.displayName = "ParentSizeObserver";

export default ParentSizeObserver;
