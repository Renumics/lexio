import {useRef, useState, useEffect, useCallback, RefObject} from "react";

type ObserverRect = Omit<DOMRectReadOnly, "toJSON">;

const defaultRect: ObserverRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
};

export function useResizeObserver<T extends HTMLElement = any>(): [RefObject<T>, ObserverRect] {
    const ref = useRef<T | null>(null);
    const [rect, setRect] = useState<ObserverRect>(defaultRect);

    const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
        if (entries[0]) {
            const { x, y, width, height, top, left, bottom, right } = entries[0].contentRect;
            setRect({ x, y, width, height, top, left, bottom, right });
        }
    }, []);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver(handleResize);
        observer.observe(ref.current);

        // Initialize rect on mount
        if (ref.current) {
            const { x, y, width, height, top, left, bottom, right } = ref.current.getBoundingClientRect();
            setRect({ x, y, width, height, top, left, bottom, right });
        }

        return () => {
            observer.disconnect();
        }
    }, [handleResize]);

    return [ref, rect];
}
