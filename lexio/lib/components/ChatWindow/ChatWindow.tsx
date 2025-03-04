import React, { useContext } from 'react';
import { ThemeContext } from '../../theme/ThemeContext';
import { useLexio, useRAGMessages } from '../../hooks/hooks';
import { ResetWrapper } from '../../utils/ResetWrapper';
import DocumentPlusIcon from '@heroicons/react/24/outline/esm/DocumentPlusIcon';
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

    if (message.role === 'assistant' && typeof message.content === 'string') {
        const coloredIdeas = message.metadata?.coloredIdeas;
        
        if (coloredIdeas && Array.isArray(coloredIdeas)) {
            let htmlContent = message.content;
            let hasHighlights = false;
            
            coloredIdeas.forEach((idea: { text: string; color: string }, index: number) => {
                const escapedText = idea.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedText})`, 'gi');
                
                if (regex.test(htmlContent)) {
                    hasHighlights = true;
                    htmlContent = htmlContent.replace(
                        regex, 
                        `<span 
                            style="background-color:${idea.color}; cursor: pointer;" 
                            class="idea-highlight" 
                            data-idea-index="${index}"
                        >$1</span>`
                    );
                }
            });
            
            if (hasHighlights) {
                return <div ref={highlightedContentRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
            }
        }
    }

    // Remove the JSON parsing attempt since we're not using that format
    return <div>{message.content}</div>;
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