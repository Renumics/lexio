import React from 'react';

export interface ColoredMessageProps {
    content: string;
    coloredIdeas: Array<{
        text: string;
        color: string;
    }>;
}

export const ColoredMessage: React.FC<ColoredMessageProps> = ({ content, coloredIdeas }) => {
    console.log('ColoredMessage component rendered with:', {
        content,
        coloredIdeas,
        hasIdeas: !!coloredIdeas?.length
    });

    if (!coloredIdeas?.length) {
        console.log('No coloredIdeas provided, rendering plain content');
        return <div>{content}</div>;
    }

    // Create a list of text segments and their colors
    let segments: { text: string; color?: string }[] = [];
    let currentText = content;
    
    // Sort ideas by length (longest first) to avoid nested replacements
    const sortedIdeas = [...coloredIdeas].sort((a, b) => b.text.length - a.text.length);
    console.log('Sorted ideas:', sortedIdeas);
    
    // Process each idea one at a time
    for (const { text, color } of sortedIdeas) {
        // Create a new result array for this iteration
        const newSegments: { text: string; color?: string }[] = [];
        
        // Process each existing segment
        for (const segment of segments.length ? segments : [{ text: currentText }]) {
            // Skip already colored segments
            if (segment.color) {
                newSegments.push(segment);
                continue;
            }
            
            // Split the current segment by the highlight text
            const parts = segment.text.split(text);
            
            // Process the parts
            for (let i = 0; i < parts.length; i++) {
                // Add the regular text part if it exists
                if (parts[i]) {
                    newSegments.push({ text: parts[i] });
                }
                
                // Add the highlighted part if not at the end
                if (i < parts.length - 1) {
                    newSegments.push({ text, color });
                }
            }
        }
        
        // Update segments for the next iteration
        segments = newSegments;
    }

    console.log('Final segments to render:', segments);

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
}; 