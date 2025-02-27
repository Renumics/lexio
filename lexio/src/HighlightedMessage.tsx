import React from 'react';

interface HighlightedMessageProps {
    content: string;
}

interface SpecialContent {
    text: string;
    highlights: Array<{
        text: string;
        color: string;
    }>;
}

export const HighlightedMessage: React.FC<HighlightedMessageProps> = ({ content }) => {
    // Try to parse the content as JSON
    try {
        const specialContent = JSON.parse(content) as SpecialContent;
        
        // If it's not in the expected format, just render the content as is
        if (!specialContent.text || !specialContent.highlights) {
            return <div>{content}</div>;
        }
        
        // Create a list of text segments and their colors
        let segments: { text: string; color?: string }[] = [];
        let currentText = specialContent.text;
        
        // Sort highlights by length (longest first) to avoid nested replacements
        const sortedHighlights = [...specialContent.highlights].sort((a, b) => b.text.length - a.text.length);
        
        // Find all occurrences of each highlight in the text
        for (const { text, color } of sortedHighlights) {
            const parts = currentText.split(text);
            const result: { text: string; color?: string }[] = [];
            
            for (let i = 0; i < parts.length; i++) {
                if (i > 0) {
                    result.push({ text, color });
                }
                if (parts[i]) {
                    result.push({ text: parts[i] });
                }
            }
            
            currentText = result.map(r => r.text).join('');
            segments = result;
        }
        
        return (
            <div style={{ whiteSpace: 'pre-wrap' }}>
                {segments.map((segment, index) => {
                    return segment.color ? (
                        <span 
                            key={index}
                            style={{ 
                                backgroundColor: segment.color,
                                borderRadius: '2px',
                                padding: '0 2px',
                                margin: '0 1px'
                            }}
                        >
                            {segment.text}
                        </span>
                    ) : (
                        <span key={index}>{segment.text}</span>
                    );
                })}
            </div>
        );
    } catch (e) {
        // If parsing fails, just render the content as is
        return <div>{content}</div>;
    }
};