import { SourceReference, TextContent, SourceContent, RetrievalResult } from '../types';

function isRecord(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null;
  }
  
  function hasOnlyAllowedKeys<T>(obj: Record<string, any>, allowedKeys: (keyof T)[]): boolean {
    return Object.keys(obj).every(key => allowedKeys.includes(key as keyof T));
  }
  
  function isSourceReference(result: unknown): result is SourceReference {
    if (!isRecord(result)) return false;
    
    const allowedKeys: (keyof SourceReference)[] = ['source', 'type', 'relevanceScore', 'metadata'];
    if (!hasOnlyAllowedKeys<SourceReference>(result, allowedKeys)) {
      return false;
    }
    
    return (
      typeof result.source === 'string' &&
      (result.type === undefined || result.type === 'pdf') &&
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
  
    const allowedKeys: (keyof SourceContent)[] = ['content', 'metadata', 'type'];
    if (!hasOnlyAllowedKeys<SourceContent>(content, allowedKeys)) {
      throw new Error(`Source content contains extra fields. Allowed fields are: ${allowedKeys.join(', ')}`);
    }
  
    if (typeof content.content !== 'string') {
      throw new Error('Source content must have a string content field');
    }
  
    if (content.type !== undefined && content.type !== 'pdf') {
      throw new Error('Source content type must be undefined or "pdf"');
    }
  
    if (content.metadata !== undefined && !isRecord(content.metadata)) {
      throw new Error('Source content metadata must be a record if present');
    }
  
    return content as SourceContent;
  }