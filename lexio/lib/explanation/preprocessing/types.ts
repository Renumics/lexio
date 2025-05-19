export interface TextPosition {
    top: number;
    left: number;
    width: number;
    height: number;
    isTitle?: boolean;
  }
  
  export interface TextItem {
    text: string;
    position: TextPosition;
    startIndex: number;
    endIndex: number;
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
      }>;
    };
    metadata: {
      numPages: number;
      fileName: string;
    };
  } 