import {FC, ReactNode, useEffect, useRef, useState} from "react";

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
const ParentSizeObserver: FC<Props> = (props) => {

    const { className, debounceTime = 100, children } = props;

    const [parentSize, setParentSize] = useState<ContainerSize>(DEFAULT_PARENT_SIZE);

    const parentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!parentRef.current) return;

        let timeout: NodeJS.Timeout | undefined = undefined;

        const handleResize = (entries: ResizeObserverEntry[]) => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                setParentSize({
                    width: Math.floor(width),
                    height: Math.floor(height),
                });
            }
        }

        const observeParent = () => {
            if (!parentRef.current) return DEFAULT_PARENT_SIZE;
            const resizeObserver = new ResizeObserver((entries) => {
                if (debounceTime > 0) {
                    timeout = setTimeout(() => {
                        handleResize(entries);
                    }, debounceTime);
                    return;
                }
                handleResize(entries);
            });

            resizeObserver.observe(parentRef.current as Element);

            return () => {
                resizeObserver.disconnect();
            };
        };

        return () => {
            observeParent();
            if (!timeout) return;
            clearTimeout(timeout as NodeJS.Timeout);
        }
    }, [debounceTime, parentRef, children]);

    return (
        <div ref={parentRef} className={className}>
            {children ? children(parentSize) : null}
        </div>
    );
}
ParentSizeObserver.displayName = "ParentSizeObserver";

export default ParentSizeObserver;
