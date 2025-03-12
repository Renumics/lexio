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
    children?: ((parentSize: ContainerSize) => ReactNode) | undefined;
}
const ParentSizeObserver: FC<Props> = (props) => {

    const [parentSize, setParentSize] = useState<ContainerSize>(DEFAULT_PARENT_SIZE);

    const parentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observeParent = () => {
            if (!parentRef.current) return DEFAULT_PARENT_SIZE;

            const resizeObserver = new ResizeObserver(entries => {
                entries.forEach((entry) => {
                    const { width, height } = entry.contentRect;
                    setParentSize({ width, height });
                })
            });

            resizeObserver.observe(parentRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        };

        return () => {
            observeParent();
        }
    }, []);

    return (
        <div ref={parentRef} className={props.className}>
            {props.children ? props.children(parentSize) : null}
        </div>
    );
}
ParentSizeObserver.displayName = "ParentSizeObserver";

export default ParentSizeObserver;
