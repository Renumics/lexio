import {SourceReference, TextContent, SourceContent, PDFSourceContent, RetrievalResult, PDFHighlight, HTMLSourceContent} from '../types';

function isRecord(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null;
}

function hasOnlyAllowedKeys<T>(obj: Record<string, any>, allowedKeys: (keyof T)[]): boolean {
    return Object.keys(obj).every(key => allowedKeys.includes(key as keyof T));
}

function isSourceReference(result: unknown): result is SourceReference {
    if (!isRecord(result)) return false;

    const allowedKeys: (keyof SourceReference)[] = ['source', 'type', 'relevanceScore', 'metadata', 'highlights'];
    if (!hasOnlyAllowedKeys<SourceReference>(result, allowedKeys)) {
        return false;
    }

    return (
        typeof result.source === 'string' &&
        (result.type === undefined || result.type === 'pdf' || result.type === 'html') &&
        (result.relevanceScore === undefined || typeof result.relevanceScore === 'number') &&
        (result.metadata === undefined || isRecord(result.metadata))
    );
}

function isTextContent(result: unknown): result is TextContent {
    if (!isRecord(result)) return false;

    const allowedKeys: (keyof TextContent)[] = ['text', 'relevanceScore', 'metadata'];
    if (!hasOnlyAllowedKeys<TextContent>(result, allowedKeys)) {
        return false;
    }

    return (
        typeof result.text === 'string' &&
        (result.relevanceScore === undefined || typeof result.relevanceScore === 'number') &&
        (result.metadata === undefined || isRecord(result.metadata))
    );
}

function isHighlight(value: unknown): value is Highlight {
    if (!isRecord(value)) return false;

    const allowedKeys: (keyof PDFHighlight)[] = ['page', 'rect', 'comment'];
    if (!hasOnlyAllowedKeys<PDFHighlight>(value, allowedKeys)) {
        return false;
    }

    const {rect, comment} = value;
    if (!isRecord(rect)) return false;

    const rectKeys: (keyof PDFHighlight['rect'])[] = ['top', 'left', 'width', 'height'];
    if (!hasOnlyAllowedKeys<PDFHighlight['rect']>(rect, rectKeys)) {
        return false;
    }

    return (
        typeof value.page === 'number' &&
        typeof rect.top === 'number' &&
        typeof rect.left === 'number' &&
        typeof rect.width === 'number' &&
        typeof rect.height === 'number' &&
        (comment === undefined || typeof comment === 'string')
    );
}

export function validateRetrievalResults(results: unknown): RetrievalResult[] {
    if (!Array.isArray(results)) {
        throw new Error(
            'Retrieval results must be an array of SourceReference or TextContent objects'
        );
    }

    for (const result of results) {
        if (!isSourceReference(result) && !isTextContent(result)) {
            throw new Error(
                `Invalid retrieval result format: ${JSON.stringify(result)}\n` +
                'Expected format is either:\n' +
                '- SourceReference: { source: string, type?: "pdf", relevanceScore?: number, metadata?: object }\n' +
                '- TextContent: { text: string, relevanceScore?: number, metadata?: object }'
            );
        }
    }

    return results;
}

export function validateSourceContent(content: unknown): SourceContent {
    if (!isRecord(content)) {
        throw new Error('Source content must be an object');
    }

    if (typeof content.content !== 'string' && !(content.content instanceof Uint8Array)) {
        throw new Error('Source content must have a string or Uint8Array content field');
    }

    if (content.metadata !== undefined && !isRecord(content.metadata)) {
        throw new Error('Source content metadata must be a record if present');
    }

    if (content.type === 'pdf') {
        // Enforce Uint8Array content for PDF
        if (!(content.content instanceof Uint8Array)) {
            throw new Error('PDF source content must have a Uint8Array content field');
        }

        // Validate `highlights` for PDF
        if (content.highlights !== undefined) {
            if (!Array.isArray(content.highlights) || !content.highlights.every(isHighlight)) {
                throw new Error('Source content highlights must be an array of Highlight objects');
            }
        }

        // Define allowed keys specifically for `type: 'pdf'`
        const allowedKeys = ['content', 'metadata', 'type', 'highlights'] as (keyof PDFSourceContent)[];
        if (!hasOnlyAllowedKeys<PDFSourceContent>(content, allowedKeys)) {
            throw new Error(`Source content contains extra fields. Allowed fields are: ${allowedKeys.join(', ')}`);
        }

        return content as PDFSourceContent;
    } else if (content.type === 'html') {
        // Enforce string content for HTML
        if (typeof content.content !== 'string') {
            throw new Error('HTML source content must have a string content field');
        }

        // Define allowed keys specifically for `type: 'html'`
        const allowedKeys = ['content', 'metadata', 'type'] as (keyof HTMLSourceContent)[];
        if (!hasOnlyAllowedKeys<HTMLSourceContent>(content, allowedKeys)) {
            throw new Error(`Source content contains extra fields. Allowed fields are: ${allowedKeys.join(', ')}`);
        }

        return content as HTMLSourceContent;
    } else {
        throw new Error('Source content type must be "pdf" or "html"');
    }
}