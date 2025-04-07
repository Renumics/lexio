import {ReactNode, useCallback, useEffect, useRef, useState} from "react";

export type ContainerSize = {
    width: number;
    height: number;
}

const DEFAULT_PARENT_SIZE: ContainerSize = {
    width: 0,
    height: 0,
};

type Props = {
    className?: string;
    debounceTime?: number | undefined;
    children?: ((parentSize: ContainerSize) => ReactNode) | undefined;
}
const ParentSizeObserver = ({ className, debounceTime = 100, children }: Props) => {

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
            timeout = setTimeout(() => handleResize(entries), debounceTime);
        });

        resizeObserver.observe(parentRef.current as Element);

        window.addEventListener("resize", () => {
            if (!parentRef.current) return;
            resizeObserver.observe(parentRef.current as Element);
        })

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current as number);
                animationFrameId.current = null;
            }

            if (timeout) {
                clearTimeout(timeout as NodeJS.Timeout);
            }

            resizeObserver.disconnect();

            window.removeEventListener("resize", () => {
                resizeObserver.disconnect();
            });
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
