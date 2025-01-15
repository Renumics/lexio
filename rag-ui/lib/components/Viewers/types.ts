export interface ViewerToolbarProps {
    zoomIn: () => void;
    zoomOut: () => void;
    scale: number;
    fitParent?: () => void;
    children?: React.ReactNode;
    isLoaded?: boolean;
}

export interface CanvasDimensions {
    width: number;
    height: number;
}

export const ZOOM_CONSTANTS = {
    ZOOM_STEP: 0.1,
    MIN_SCALE: 0.25,
    MAX_SCALE: 5,
}; 