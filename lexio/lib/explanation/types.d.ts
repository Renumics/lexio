declare module 'js-tiktoken' {
    export interface Tiktoken {
        encode(text: string): number[];
        decode(tokens: number[]): string;
    }
    
    export function getEncoding(encodingName: string): Tiktoken;
    export function encodingForModel(modelName: string): Tiktoken;
}

declare module 'sbd' {
    interface SbdOptions {
        newline_boundaries?: boolean;
        html_boundaries?: boolean;
        sanitize?: boolean;
        allowed_tags?: string[];
        preserve_whitespace?: boolean;
    }

    export function sentences(text: string, options?: SbdOptions): string[];
    const sbd: {
        sentences: typeof sentences;
    };
    export default sbd;
}

declare module 'compromise' {
    interface Term {
        text: string;
        normal: string;
        tags: Set<string>;
    }

    interface Document {
        sentences(): Document;
        text(): string;
        terms(): Document;
        out(format: "array"): string[];
        out(format: string): string;
        contractions(): {
            expand(): Document;
        };
        people(): Document;
        places(): Document;
        organizations(): Document;
        topics(): Document;
    }

    export default function nlp(text: string): Document;
} 