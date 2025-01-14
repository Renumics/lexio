import {useEffect, useState} from "react";

const highlightStyleDefaults = {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    border: '1px solid rgba(255, 255, 0, 0.6)',
    pointerEvents: 'none',
    pointer: 'select',
    borderRadius: '5px',
    zIndex: 100,
};

const Highlight = ({rect, scale, pageDimensions}) => {
    const [highlightStyle, setHighlightStyle] = useState({});

    useEffect(() => {
        const newStyle = {
            ...highlightStyleDefaults,
            top: `${(rect.top) * pageDimensions.height * scale}px`, // Adjust top position
            left: `${(rect.left) * pageDimensions.width * scale}px`, // Adjust left position
            width: `${(rect.width) * pageDimensions.width * scale}px`, // Adjust width
            height: `${(rect.height) * pageDimensions.height * scale}px`, // Adjust height
        };

        setHighlightStyle(newStyle);
    }, [rect, scale, pageDimensions]);

    return (
        <div style={highlightStyle}></div>
    )
};

export {Highlight};