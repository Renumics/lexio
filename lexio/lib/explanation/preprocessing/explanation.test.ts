import { describe, it, expect, vi } from 'vitest';
import { parsePdfWithMarker } from './parser';
import textItems from './data';
import metadata from './metadata';

describe('PDF Parser Manual Test', () => {
    it('should parse a test PDF file successfully', async () => {
        // Create a mock PDF file with array buffer content
        const pdfContent = new Uint8Array([/* some pdf bytes */]);
        const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
        const mockFile = new File([pdfBlob], 'test.pdf', { type: 'application/pdf' });
        
        // Add arrayBuffer method to the mock file
        mockFile.arrayBuffer = () => Promise.resolve(pdfContent.buffer);

        // Mock fetch response
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            blob: () => Promise.resolve(pdfBlob)
        });

        const result = await parsePdfWithMarker(mockFile);

        // Verify the structure of the result
        expect(result).toBeDefined();
        expect(result.metadata).toEqual(expect.objectContaining({
            fileName: 'test.pdf',
            numPages: expect.any(Number)
        }));
        expect(result.blocks).toBeDefined();
    });

    it('should handle PDF loading errors', async () => {
        const pdfContent = new Uint8Array([/* some pdf bytes */]);
        const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
        const mockFile = new File([pdfBlob], 'test.pdf', { type: 'application/pdf' });
        
        // Add arrayBuffer method to the mock file
        mockFile.arrayBuffer = () => Promise.resolve(pdfContent.buffer);

        // Mock fetch to simulate error
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            statusText: 'Not Found'
        });

        await expect(parsePdfWithMarker(mockFile)).rejects.toThrow();
    });
});