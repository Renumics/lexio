export interface TextPosition {
    top: number;
    left: number;
    width: number;
    height: number;
    pageWidth: number;    // Added for viewport dimensions
    pageHeight: number;   // Added for viewport dimensions
    isTitle?: boolean;
  }
  
  export interface TextItem {
    text: string;
    position: TextPosition;
    startIndex: number;
    endIndex: number;
  }
  
  export interface LineBox {
    x: number;
    y: number;
    w: number;
    h: number;
  }
  
  export interface TextWithMetadata {
    text: string;
    metadata: {
      page: number;
      position?: TextPosition;
      linePositions?: TextPosition[]; // Store positions of all text items in the line
      isFigure?: boolean;            // Flag to indicate this is a figure
      figureNumber?: number;         // Optional figure number
    };
  }
  
  export interface ParseResult {
    blocks: {
      block_type: string;
      children: Array<{
        id: string;
        block_type: string;
        text: string;
        page: number;
        textItems: TextItem[][];  // Array of lines, each line is array of text items
        lineBoxes: (LineBox | null)[];  // Added for line bounding boxes
      }>;
    };
    metadata: {
      numPages: number;
      fileName: string;
    };
  } 