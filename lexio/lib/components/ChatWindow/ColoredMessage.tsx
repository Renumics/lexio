import React from 'react';

interface ColoredMessageProps {
    message: string;
    coloredIdeas?: Array<{ text: string; color: string }>;
}

export const ColoredMessage: React.FC<ColoredMessageProps> = ({ message, coloredIdeas }) => {
    if (!coloredIdeas?.length) {
        return <div>{message}</div>;
    }

    // Create a list of text segments and their colors
    const segments: { text: string; color?: string }[] = [];
    let currentText = message;

    // Sort ideas by length (longest first) to avoid nested replacements
    const sortedIdeas = [...coloredIdeas].sort((a, b) => b.text.length - a.text.length);
    
    for (const { text, color } of sortedIdeas) {
        // Create a regex that matches the idea text while ignoring case and handling word boundaries
        const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedText})`, 'gi');
        
        const parts = currentText.split(regex);
        
        // Clear the current text
        currentText = '';
        
        // Process each part
        parts.forEach((part) => {
            if (regex.test(part)) {
                segments.push({ text: part, color });
            } else {
                segments.push({ text: part });
            }
        });
        
        // Update currentText for the next iteration
        currentText = parts.join('');
    }

    return (
        <div style={{ whiteSpace: 'pre-wrap' }}>
            {segments.map((segment, index) => (
                segment.color ? (
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
                )
            ))}
        </div>
    );
}; 