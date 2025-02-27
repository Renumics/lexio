import React, { useContext } from 'react';
import { ThemeContext } from '../../theme/ThemeContext';
import { useLexio, useRAGMessages } from '../../hooks/hooks';
import { ResetWrapper } from '../../utils/ResetWrapper';
import DocumentPlusIcon from '@heroicons/react/24/outline/esm/DocumentPlusIcon';
import { ColoredMessage, ColoredMessageProps } from './ColoredMessage';
import { HighlightedMessage } from '../../../src/HighlightedMessage';
import { Message, Source, UUID } from '../../types';

// Define a type for the shape of the overrides
export interface ChatWindowStyles extends React.CSSProperties {
  backgroundColor?: string;
  color?: string;
  padding?: string;
  fontFamily?: string;
  fontSize?: string;
  borderRadius?: string;
}

// Add interface for colored idea
interface ColoredIdea {
  text: string;
  color: string;
}

/**
 * Props for the ChatWindow component
 * @see {@link ChatWindow}
 */
export interface ChatWindowProps {
  /**
   * Unique key for the component which can be used to identify the source of UserAction's if multiple ChatWindow components are used.
   * The default is 'ChatWindow', if key is provided it will be appended to the default key as following 'ChatWindow-${key}'.
   */
  componentKey?: string;
  /**
   * Style overrides for the component
   */
  styleOverrides?: ChatWindowStyles;
  /**
   * Whether to show role labels (User:, Assistant:) before messages
   * @default true
   */
  showRoleLabels?: boolean;
  /**
   * Custom label for user messages
   * @default "User: "
   */
  userLabel?: string;
  /**
   * Custom label for assistant messages
   * @default "Assistant: "
   */
  assistantLabel?: string;
}

/**
 * ChatWindow component displays a conversation between a user and an assistant
 *
 * @example
 *
 * ```tsx
 * <ChatWindow 
 *   showRoleLabels={true}
 *   userLabel="You: "
 *   assistantLabel="Bot: "
 *   styleOverrides={{
 *     backgroundColor: '#f5f5f5',
 *     padding: '1rem'
 *   }}
 * />
 * ```
 */
const ChatWindow: React.FC<ChatWindowProps> = ({
  componentKey,
  styleOverrides = {},
  showRoleLabels = true,
  userLabel = 'User: ',
  assistantLabel = 'Assistant: ',
}) => {
  const { messages, currentStream } = useRAGMessages();
  
  console.log('ChatWindow received messages:', messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    metadata: msg.metadata
  })));

  // Get the lexio methods we need
  const { clearMessages, setSelectedSource, setActiveSources } = useLexio(componentKey ? `ChatWindow-${componentKey}` : 'ChatWindow');

  // Add ref for scrolling
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages or currentStream changes
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStream]);

  // --- use theme ---
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('ThemeContext is undefined');
  }
  const { colors, typography, componentDefaults } = theme.theme;

  // Merge theme defaults + overrides
  const style: ChatWindowStyles = {
    backgroundColor: colors.background,
    color: colors.text,
    padding: componentDefaults.padding,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    borderRadius: componentDefaults.borderRadius,
    ...styleOverrides, // ensure these override theme defaults
  };

  // Create a ref for the highlighted content container
  const highlightedContentRef = React.useRef<HTMLDivElement>(null);
  
  // Set up the click handler for highlighted ideas
  React.useEffect(() => {
    if (highlightedContentRef.current) {
      const highlights = highlightedContentRef.current.querySelectorAll('.idea-highlight');
      
      const handleHighlightClick = (e: Event) => {
        const target = e.target as HTMLElement;
        const ideaIndex = target.getAttribute('data-idea-index');
        
        if (ideaIndex !== null) {
          console.log(`Clicked on idea ${ideaIndex}`);
          
          // Get the index of the clicked idea
          const index = parseInt(ideaIndex);
          
          // In a real implementation, we would navigate to the corresponding evidence
          // For now, just log what would happen
          console.log(`Navigating to evidence for idea ${index}`);
          
          // We can use the available methods from useLexio to navigate
          // For example, we could select the source and set it as active
          // This is just a placeholder - you would need to implement the actual navigation logic
          // based on your application's requirements
          
          // Example (commented out to avoid actual execution):
          // if (sources.length > 0) {
          //   const sourceId = sources[0].id;
          //   setSelectedSource(sourceId);
          //   setActiveSources([sourceId]);
          // }
        }
      };
      
      highlights.forEach(highlight => {
        highlight.addEventListener('click', handleHighlightClick);
      });
      
      // Clean up event listeners when component unmounts
      return () => {
        highlights.forEach(highlight => {
          highlight.removeEventListener('click', handleHighlightClick);
        });
      };
    }
  }, [messages, setSelectedSource, setActiveSources]); // Include the functions in the dependency array
  
  const renderMessage = (message: Message) => {
    console.log('ChatWindow renderMessage (full message):', {
        id: message.id,
        role: message.role,
        content: message.content?.substring(0, 50) + (message.content?.length > 50 ? '...' : ''),
        contentIsHTML: typeof message.content === 'string' && message.content.startsWith('__HTML__'),
        metadata: message.metadata,
        hasMetadata: !!message.metadata,
        metadataKeys: message.metadata ? Object.keys(message.metadata) : []
    });
    
    // For assistant messages, check if we need to highlight specific phrases
    if (message.role === 'assistant' && typeof message.content === 'string') {
        // Define the phrases we want to highlight and their colors
        const COLORS = [
            'rgba(255, 99, 132, 0.3)',   // red
            'rgba(54, 162, 235, 0.3)',   // blue
            'rgba(255, 206, 86, 0.3)',   // yellow
            'rgba(75, 192, 192, 0.3)',   // green
            'rgba(153, 102, 255, 0.3)',  // purple
            'rgba(255, 159, 64, 0.3)',   // orange
        ];
        
        const phrasesToHighlight = [
            "starting with a small set of high-quality chain-of-thought examples (cold-start data)",
            "using reinforcement learning to refine its outputs",
            "multi-stage approach",
            "improves accuracy",
            "produces clearer and more coherent reasoning",
            "outperfrming traditional supervised fine-tuning methods"
        ];
        
        // Create HTML content with highlighting
        let htmlContent = message.content;
        let hasHighlights = false;
        
        // Add markers in the content for highlighting
        phrasesToHighlight.forEach((phrase, index) => {
            const escapedText = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedText})`, 'gi');
            if (regex.test(htmlContent)) {
                hasHighlights = true;
                // Make the highlight clickable with a data attribute for the index
                htmlContent = htmlContent.replace(
                    regex, 
                    `<span 
                        style="background-color:${COLORS[index % COLORS.length]}; cursor: pointer;" 
                        class="idea-highlight" 
                        data-idea-index="${index}"
                    >$1</span>`
                );
            }
        });
        
        if (hasHighlights) {
            console.log('Rendering message with highlights');
            return <div ref={highlightedContentRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
        }
    }
    
    // Check if content is in the special JSON format for HighlightedMessage
    if (message.role === 'assistant' && typeof message.content === 'string') {
        try {
            // Try to parse as JSON
            const contentObj = JSON.parse(message.content);
            if (contentObj.text && Array.isArray(contentObj.highlights)) {
                console.log('Content is in HighlightedMessage format, rendering with HighlightedMessage component');
                return <HighlightedMessage content={message.content} />;
            }
        } catch (e) {
            // Not JSON, continue with normal processing
            console.log('Failed to parse content as JSON:', e);
        }
    }
    
    // Type guard to ensure we have valid coloredIdeas
    const coloredIdeas = message.metadata?.coloredIdeas;
    
    if (
        message.role === 'assistant' && 
        coloredIdeas && 
        Array.isArray(coloredIdeas) && 
        coloredIdeas.length > 0
    ) {
        console.log('Rendering ColoredMessage with ideas:', coloredIdeas);
        
        // If we have rawContent in metadata, use that instead of message.content
        const contentToUse = message.metadata?.rawContent || message.content;
        
        return (
            <ColoredMessage
                content={contentToUse}
                coloredIdeas={coloredIdeas}
            />
        );
    }
    
    // If there's HTML content in the metadata, use that instead
    if (message.role === 'assistant' && message.metadata?.htmlContent) {
        console.log('Rendering HTML content from metadata');
        return <div dangerouslySetInnerHTML={{ __html: message.metadata.htmlContent }} />;
    }
    
    console.log('Rendering plain message:', {
        reason: !message.metadata ? 'no metadata' 
            : !coloredIdeas ? 'no coloredIdeas in metadata'
            : !Array.isArray(coloredIdeas) ? 'coloredIdeas not an array'
            : coloredIdeas.length === 0 ? 'empty coloredIdeas array'
            : 'unknown'
    });
    
    // If we have rawContent in metadata, use that instead of message.content
    const contentToDisplay = message.metadata?.rawContent || message.content;
    return <div>{contentToDisplay}</div>;
  };

  return (
    <ResetWrapper>
      <div
        className="w-full h-full flex flex-col"
        style={style}
      >
        {/* Fixed header */}
        <div className="flex justify-end p-2 h-14 flex-none">
          <button
            onClick={clearMessages}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{
              color: colors.text,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            title="New conversation"
            aria-label="New conversation"
          >
            <DocumentPlusIcon className="size-5" />
          </button>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4">
            {messages.map((msg, index) => {
              console.log(`Message ${index} detailed:`, {
                role: msg.role,
                content: msg.content,
                metadata: msg.metadata,
                coloredIdeas: msg.metadata?.coloredIdeas
              });
              return (
                <div key={index} className={`mb-2 ${msg.role}`}>
                  {showRoleLabels && (
                    <strong className="inline-block mr-2">
                      {msg.role === 'user' ? userLabel : assistantLabel}
                    </strong>
                  )}
                  {renderMessage(msg)}
                </div>
              );
            })}
            {currentStream && (
              <div className="mb-2 assistant streaming">
                {showRoleLabels && (
                  <strong className="inline-block mr-2">{assistantLabel}</strong>
                )}
                <div className="inline" style={{ whiteSpace: 'pre-wrap' }}>
                  {currentStream.content}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    </ResetWrapper>
  );
};

export { ChatWindow }