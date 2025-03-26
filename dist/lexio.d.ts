import { CSSProperties } from 'react';
import { default as default_2 } from 'react';
import { JSX as JSX_2 } from 'react/jsx-runtime';
import { Message as Message_2 } from '../types';
import { Source as Source_2 } from '../types';

/**
 * Defines an action handler for a specific component.
 *
 * @interface ActionHandler
 * @property {Component} component - The component this handler is associated with
 * @property {Function} handler - Function that processes actions and returns responses
 */
export declare type ActionHandler = {
    component: Component;
    /**
     * Handler function that processes actions and returns responses.
     *
     * @param {UserAction} actionHandlerFunction - The action to handle
     * @param {Message[]} messages - Current messages in the conversation
     * @param {Source[]} sources - Available sources
     * @param {Source[] | null} activeSources - Currently active sources, if any
     * @param {Source | null} selectedSource - Currently selected source, if any
     * @returns {ActionHandlerResponse | Promise<ActionHandlerResponse> | undefined | Promise<undefined>} - Response to the action
     */
    handler: (actionHandlerFunction: UserAction, messages: Message[], sources: Source[], activeSources: Source[] | null, selectedSource: Source | null) => ActionHandlerResponse | Promise<ActionHandlerResponse> | undefined | Promise<undefined>;
};

/**
 * Union type of all possible action handler responses.
 */
export declare type ActionHandlerResponse = AddUserMessageActionResponse | SetActiveMessageActionResponse | ClearMessagesActionResponse | SearchSourcesActionResponse | ClearSourcesActionResponse | SetActiveSourcesActionResponse | SetSelectedSourceActionResponse | SetFilterSourcesActionResponse | ResetFilterSourcesActionResponse | SetMessageFeedbackActionResponse;

/**
 * Action to add a user message to the chat.
 * This is typically triggered when a user submits a message in the QueryField component.
 *
 * @property {string} type - The action type identifier
 * @property {string} message - The message content to add
 * @property {Component} source - The component that triggered the action
 */
export declare type AddUserMessageAction = {
    type: 'ADD_USER_MESSAGE';
    message: string;
    source: Component;
};

/**
 * Response for the ADD_USER_MESSAGE action.
 *
 * To handle a NO-OP, return an empty object -> {}.
 *
 * @interface AddUserMessageActionResponse
 * @property {Promise<string> | AsyncIterable<StreamChunk>} [response] - The assistant's response. Can be a Promise resolving to a string or an AsyncIterable for streaming responses.
 * @property {Promise<Source[]>} [sources] - Sources related to the message. These will be displayed in the SourcesDisplay component.
 * @property {string} [setUserMessage] - Updated user message. Can be used to modify the user's message before it's added to the chat.
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes. Useful for chaining actions.
 */
export declare interface AddUserMessageActionResponse {
    response?: Promise<string> | AsyncIterable<StreamChunk>;
    sources?: Promise<Source[]>;
    setUserMessage?: string;
    followUpAction?: UserAction;
}

/**
 * A rich text editor component that allows users to mention and reference sources within their queries.
 *
 * The AdvancedQueryField provides a more sophisticated input experience than the standard QueryField,
 * with support for source mentions that appear as interactive chips within the text.
 *
 * @component
 *
 * Features:
 * - Source mentions with @ symbol trigger
 * - Interactive source chips that can be deleted
 * - Keyboard navigation between source chips
 * - Customizable styling
 * - Responsive design
 *
 * @example
 *
 * ```tsx
 * <AdvancedQueryField
 *   componentKey="my-query-field"
 *   onSubmit={(text, sources) => console.log(text, sources)}
 *   onSourceAdded={(source) => console.log('Source added:', source)}
 *   onSourceDeleted={(source) => console.log('Source deleted:', source)}
 *   onChange={(text) => console.log('Text changed:', text)}
 *   placeholder="Type @ to mention a source..."
 *   styleOverrides={{
 *     backgroundColor: '#f5f5f5',
 *     borderRadius: '8px',
 *     padding: '12px',
 *   }}
 * />
 * ```
 */
export declare const AdvancedQueryField: default_2.FC<AdvancedQueryFieldProps>;

/**
 * Props for the AdvancedQueryField component
 * @see {@link AdvancedQueryField}
 */
declare interface AdvancedQueryFieldProps {
    /**
     * Unique key for the component which can be used to identify the source of UserAction's if multiple AdvancedQueryField components are used.
     * The default is 'AdvancedQueryField', if key is provided it will be appended to the default key as following 'AdvancedQueryField-${key}'.
     */
    componentKey?: string;
    /**
     * Callback triggered when a message is submitted
     * @param message The message text that was submitted
     * @param mentions Array of source mentions included in the message
     */
    onSubmit?: (message: string, mentions: Mention[]) => void;
    /**
     * Called after a source mention is inserted into the editor
     * @param source The source that was added
     * @param allIndices Updated array of all currently referenced source indices
     */
    onSourceAdded?: (source: Source, allIndices: string[]) => void;
    /**
     * Called after a source mention is removed from the editor
     * @param source The source that was removed
     * @param allIndices Updated array of all currently referenced source indices
     */
    onSourceDeleted?: (source: Source, allIndices: string[]) => void;
    /**
     * Callback for when the editor content changes
     * @param value The new editor content
     * @param mentions Array of current source mentions
     */
    onChange?: (value: string, mentions: Mention[]) => void;
    /**
     * Placeholder text shown when editor is empty
     * @default 'Type @ to mention a source...'
     */
    placeholder?: string;
    /**
     * Whether the editor is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Style overrides for the component
     */
    styleOverrides?: AdvancedQueryFieldStyles;
    /**
     * Whether to show the "New Chat" button
     * @default true
     */
    showNewChatButton?: boolean;
}

/**
 * Styles interface for the AdvancedQueryField component
 * @see {@link AdvancedQueryField}
 */
declare interface AdvancedQueryFieldStyles extends CSSProperties {
    /**
     * Background color of the entire query container
     */
    backgroundColor?: string;
    /**
     * Text color for the entire query container
     */
    color?: string;
    /**
     * Padding for the container
     */
    padding?: string;
    /**
     * Font family for the container text
     */
    fontFamily?: string;
    /**
     *  Font size for the container text
     */
    fontSize?: string;
    /**
     * General border color (used for the editor)
     */
    borderColor?: string;
    /**
     * Border radius for the editor container, mention chips, etc.
     */
    borderRadius?: string;
    /**
     * Background color for inserted mention chips
     */
    mentionChipBackground?: string;
    /**
     * Text color for inserted mention chips
     */
    mentionChipColor?: string;
    /**
     * Background color for the editor field
     */
    inputBackgroundColor?: string;
    /**
     * Border color for the editor field or input boxes
     */
    inputBorderColor?: string;
    /**
     * Background color for the "Send" button
     */
    buttonBackground?: string;
    /**
     * Text color for the "Send" button
     */
    buttonTextColor?: string;
    /**
     * Border radius for the button
     */
    buttonBorderRadius?: string;
    /**
     * Colors for the different workflow modes
     */
    modeInitColor?: string;
    modeFollowUpColor?: string;
    modeReRetrieveColor?: string;
}

/**
 * --- Type Definitions for Default Functions ---
 */
declare type BuildFetchRequestFn = (source: Source) => {
    url: string;
    init?: RequestInit;
};

/**
 * The ChatWindow component displays a conversation between a user and an assistant. It supports the display
 * of **markdown-formatted** messages, **role indicators**, and **custom icons** for user and assistant messages.
 *
 * This component is responsible for rendering a dynamic chat interface using messages provided by
 * the `LexioProvider` (via the `useMessages` hook). It supports both **static and streaming messages**,
 * and automatically scrolls to the most recent message upon updates.
 *
 * The appearance of the ChatWindow is primarily determined by theme defaults from the `ThemeContext`
 * but can be customized via the `styleOverrides` prop. These overrides merge with the default theme styles,
 * ensuring a consistent yet flexible look and feel.
 *
 * @component
 *
 * Features:
 * - Distinct styling for user and assistant messages
 * - Markdown rendering for assistant messages
 * - Code syntax highlighting with copy functionality
 * - Automatic scrolling to the latest message
 * - Customizable role labels and icons
 * - Responsive design
 *
 * @example
 *
 * ```tsx
 * <ChatWindow
 *   userLabel="Customer"
 *   userIcon={<UserIcon className="w-5 h-5" />}
 *   assistantLabel="Support"
 *   assistantIcon={<BotIcon className="w-5 h-5" />}
 *   styleOverrides={{
 *     backgroundColor: '#f5f5f5',
 *     padding: '1rem',
 *     messageBackgroundColor: '#ffffff',
 *     borderRadius: '8px',
 *   }}
 *   showRoleIndicator={true}
 *   markdown={true}
 *   showCopy={true}
 *   componentKey="support-chat"
 * />
 * ```
 *
 * @see ChatWindowUserMessage for details on rendering user messages.
 * @see ChatWindowAssistantMessage for details on rendering assistant messages.
 */
export declare const ChatWindow: default_2.FC<ChatWindowProps>;

/**
 * Props for the ChatWindow component
 * @see {@link ChatWindow}
 */
declare interface ChatWindowProps {
    /**
     * Style overrides for the component
     */
    styleOverrides?: ChatWindowStyles;
    /**
     * Whether to show role labels (User, Assistant) or Icons before messages
     * @default true
     */
    showRoleIndicator?: boolean;
    /**
     * Custom label for user messages
     * @default "User"
     */
    userLabel?: string;
    /**
     * Custom label for assistant messages
     * @default "Assistant"
     */
    assistantLabel?: string;
    /**
     * Custom icon for user messages. Must be a ReactElement. If provided, this will be shown instead of the role label
     */
    userIcon?: default_2.ReactElement;
    /**
     * Custom icon for assistant messages. Must be a ReactElement. If provided, this will be shown instead of the role label
     */
    assistantIcon?: default_2.ReactElement;
    /**
     * Whether to render markdown in assistant messages
     * @default true
     */
    markdown?: boolean;
    /**
     * Whether to show the copy button in assistant messages
     * @default true
     */
    showCopy?: boolean;
    /**
     * Whether to show the feedback options in assistant messages
     */
    showFeedback?: boolean;
    componentKey?: string;
}

declare interface ChatWindowStyles extends default_2.CSSProperties {
    backgroundColor?: string;
    messageBackgroundColor?: string;
    messageBorderRadius?: string;
    messageFontSize?: string;
    roleLabelFontSize?: string;
    accent?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;
    fontSize?: string;
    borderRadius?: string;
}

/**
 * Action to clear all messages from the chat.
 *
 * @property {string} type - The action type identifier
 * @property {Component} source - The component that triggered the action
 */
export declare type ClearMessagesAction = {
    type: 'CLEAR_MESSAGES';
    source: Component;
};

/**
 * Response for the CLEAR_MESSAGES action.
 *
 * @interface ClearMessagesActionResponse
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export declare interface ClearMessagesActionResponse {
    followUpAction?: UserAction;
}

/**
 * Action to clear all sources.
 *
 * @property {string} type - The action type identifier
 * @property {Component} source - The component that triggered the action
 */
export declare type ClearSourcesAction = {
    type: 'CLEAR_SOURCES';
    source: Component;
};

/**
 * Response for the CLEAR_SOURCES action.
 *
 * @interface ClearSourcesActionResponse
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export declare interface ClearSourcesActionResponse {
    followUpAction?: UserAction;
}

/**
 * Defines the color palette used throughout the application.
 * These colors are used for various UI elements like buttons, backgrounds, and text.
 *
 * @interface Colors
 * @property {string} primary - Primary brand color for main actions and important UI elements. This is also the default button color.
 * @property {string} secondary - Secondary brand color for less prominent actions.
 * @property {string} background - Main application background color.
 * @property {string} secondaryBackground - Background for cards and secondary containers.
 * @property {string} toolbarBackground - Specific background color for toolbar of the Viewers.
 * @property {string} text - Primary text color for high contrast content.
 * @property {string} secondaryText - Secondary text color for less important content.
 * @property {string} lightText - Light text color for use on dark backgrounds
 * @property {string} success - Color indicating successful operations.
 * @property {string} warning - Color indicating warnings or cautionary states.
 * @property {string} error - Color indicating errors or destructive states and ErrorDisplay.
 */
export declare interface Colors {
    primary: string;
    contrast: string;
    secondary: string;
    background: string;
    secondaryBackground: string;
    toolbarBackground: string;
    text: string;
    secondaryText: string;
    lightText: string;
    success: string;
    warning: string;
    error: string;
}

/**
 * Identifies a component in the Lexio system.
 * Can be a standard component or a custom component with an optional identifier suffix.
 * The suffix allows multiple instances of the same component type to be used in the application
 * while maintaining separate state and handlers.
 */
export declare type Component = 'LexioProvider' | 'QueryField' | 'ChatWindow' | 'ContentDisplay' | 'SourcesDisplay' | 'AdvancedQueryField' | 'MessageFeedback' | `QueryField-${string}` | `ChatWindow-${string}` | `ContentDisplay-${string}` | `SourcesDisplay-${string}` | `AdvancedQueryField-${string}` | `MessageFeedback-${string}` | `CustomComponent` | `CustomComponent-${string}`;

/**
 * Defines the default styling for components in the application.
 * These values are used to provide consistent padding and border radius for components.
 *
 * @interface ComponentDefaults
 * @property {string} borderRadius - Default border radius for components.
 * @property {string} padding - Default padding for components.
 */
export declare interface ComponentDefaults {
    borderRadius: string;
    padding: string;
}

/**
 * A component for displaying various content types from selected sources.
 *
 * ContentDisplay renders the content of the currently selected source, automatically
 * choosing the appropriate viewer based on the source type (PDF, HTML, or Markdown).
 *
 * @component
 *
 * Features:
 * - Automatic content type detection
 * - PDF viewer with navigation, zoom, and highlight support
 * - HTML viewer with sanitization and styling
 * - Markdown viewer with formatting
 * - Loading state indication
 * - Responsive design
 *
 * @example
 *
 * ```tsx
 * <ContentDisplay
 *   componentKey="main-content"
 *   styleOverrides={{
 *     backgroundColor: '#ffffff',
 *     padding: '1rem',
 *     borderRadius: '8px',
 *     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
 *   }}
 * />
 * ```
 */
export declare const ContentDisplay: default_2.FC<ContentDisplayProps>;

declare interface ContentDisplayProps {
    styleOverrides?: ContentDisplayStyles;
    componentKey?: string;
}

declare interface ContentDisplayStyles extends default_2.CSSProperties {
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
}

/**
 * Returns a function that executes a REST call and returns
 * an object shaped depending on the mode:
 *
 * - 'text' => { response: Promise<string> }
 * - 'sources' => { sources: Promise<Source[]> }
 * - 'both' => { response: Promise<string>, sources: Promise<Source[]> }
 */
export declare function createRESTConnector(options: RESTConnectorOptions): (messagesOrRequest: Omit<Message, "id">[] | RESTConnectorRequest, sources?: Source[], metadata?: Record<string, any>) => Promise<{
    response: Promise<string>;
    sources?: undefined;
} | {
    sources: Promise<Source[]>;
    response?: undefined;
} | {
    response: Promise<string>;
    sources: Promise<Source[]>;
}>;

/**
 * --- The Hook ---
 * Returns a function that RAGProvider can use as getDataSource={...}.
 */
export declare function createRESTContentSource(options?: PromiseSourceContentConnectorOptions): (source: Source) => Promise<Source>;

/**
 * Create an SSE connector as a React hook, returning a function you call to open a stream.
 * The returned function will:
 *   - Start the SSE using fetchEventSource
 *   - Return either:
 *       { response: AsyncIterable<StreamChunk> }            // if mode === 'text'
 *       { sources: Promise<Source[]> }                      // if mode === 'sources'
 *       { response: AsyncIterable<StreamChunk>, sources: Promise<Source[]> } // if 'both'
 */
export declare function createSSEConnector(options: SSEConnectorOptions): (messagesOrRequest: Message[] | SSEConnectorRequest, sources?: Source[], metadata?: Record<string, any>) => {
    response: AsyncIterable<StreamChunk>;
    sources?: undefined;
} | {
    sources: Promise<Source[]>;
    response?: undefined;
} | {
    response: AsyncIterable<StreamChunk>;
    sources: Promise<Source[]>;
};

/**
 * Creates a new theme by merging the default theme with the provided overrides.
 *
 * @param {Partial<PartialTheme>} overrides - The theme overrides to apply on top of the default theme.
 * @returns {Theme} The new theme object with the applied overrides.
 * @example
 * ```tsx
 * import { createTheme, RAGProvider } from 'lexio';
 *
 * const customTheme = createTheme({
 *    colors: {
 *      primary: '#1E88E5',
 *      secondary: '#64B5F6'
 *      }
 * });
 *
 * <RAGProvider theme={customTheme}>
 *     ... your app components ...
 * <RAGProvider />
 * ```
 */
export declare const createTheme: (overrides: Partial<PartialTheme>) => Theme;

export declare const defaultTheme: Theme;

/**
 * A component for displaying error notifications.
 *
 * ErrorDisplay shows toast notifications for errors that occur within the Lexio
 * application. It automatically listens to the error state and displays
 * appropriate messages.
 *
 * @component
 *
 * Features:
 * - Automatic error detection and display
 * - Customizable styling
 * - Timed auto-dismissal
 * - Non-intrusive toast notifications
 *
 * @example
 *
 * ```tsx
 * <ErrorDisplay
 *   styleOverrides={{
 *     backgroundColor: '#f8d7da',
 *     textColor: '#721c24',
 *     borderRadius: '4px',
 *     progressBarColor: '#721c24',
 *   }}
 * />
 * ```
 */
export declare const ErrorDisplay: React.FC<ErrorDisplayProps>;

declare interface ErrorDisplayProps {
    styleOverrides?: ErrorDisplayStyles;
}

declare interface ErrorDisplayStyles {
    fontFamily?: string;
    fontSize?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    progressBarColor?: string;
}

/**
 * A component for displaying HTML content with zoom and navigation controls.
 *
 * HtmlViewer renders HTML content with proper sanitization, styling, and interactive
 * controls for zooming and navigation. It's used internally by ContentDisplay when
 * displaying HTML source content.
 *
 * @component
 *
 * Features:
 * - Secure HTML rendering with DOMPurify sanitization
 * - Zoom controls with keyboard shortcuts
 * - Customizable styling
 * - Support for both HTML strings and React elements
 *
 * @example
 *
 * ```tsx
 * <HtmlViewer
 *   htmlContent="<div>Your HTML content here</div>"
 *   styleOverrides={{
 *     contentBackground: '#ffffff',
 *     contentPadding: '20px',
 *     viewerBorderRadius: '8px',
 *   }}
 * />
 * ```
 */
export declare const HtmlViewer: ({ htmlContent, styleOverrides }: HTMLViewerProps) => JSX_2.Element;

/**
 * Props for the HtmlViewer component.
 *
 * @interface HTMLViewerProps
 * @property {React.ReactNode | string} htmlContent - The HTML content to display. Can be either a string of HTML or React elements
 * @property {HtmlViewerStyles} [styleOverrides] - Optional style overrides for customizing the viewer's appearance
 */
declare interface HTMLViewerProps {
    /**
     * The HTML content to display. Can be either a string of HTML or React elements
     *
     * @remarks
     * - Supports both HTML strings (sanitized with DOMPurify) and React elements (unsafe)
     */
    htmlContent: default_2.ReactNode | string;
    /**
     * Optional style overrides for customizing the viewer's appearance
     *
     * @remarks
     * - The default styling uses the theme system for consistent styling
     */
    styleOverrides?: HtmlViewerStyles;
}

/**
 * Style configuration interface for the HtmlViewer component.
 * Extends ViewerToolbarStyles to include additional styling options specific to HTML content display.
 *
 * @interface HtmlViewerStyles
 * @extends {ViewerToolbarStyles}
 * @property {string} [backgroundColor] - Background color of the entire HTMLViewer
 * @property {string} [color] - Text color for the text elements in the HTMLViewer
 * @property {string} [padding] - Padding around the content
 * @property {string} [fontFamily] - Font family for the text elements in the HTMLViewer
 * @property {string} [viewerBorderRadius] - Border radius of the HTMLViewer container
 * @property {string} [viewerBackground] - Background color of the HTMLViewer area
 * @property {string} [viewerPadding] - Padding around the HTMLViewer area
 * @property {string} [contentBackground] - Background color of the content area
 * @property {string} [contentPadding] - Padding around the content area
 * @property {string} [contentBorderRadius] - Border radius of the content area
 */
declare interface HtmlViewerStyles extends ViewerToolbarStyles {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;
    fontSize?: string;
    viewerBorderRadius?: string;
    viewerBackground?: string;
    viewerPadding?: string;
    contentBackground?: string;
    contentPadding?: string;
    contentBorderRadius?: string;
}

/**
 * **LexioProvider** is a top-level context provider that wraps your application with necessary state management and theming.
 *
 * @component
 *
 * @param props.children - React child components to be wrapped by the provider
 * @param props.onAction - Optional callback function to handle custom actions triggered within Lexio components
 * @param props.theme - Optional custom theme object to override the default styling
 * @param props.config - Optional provider configuration object to customize behavior and settings
 *
 * @component
 *
 * This provider:
 * - Creates and provides a Jotai store for global state management
 * - Sets up theme context with either custom or default theme
 * - Registers action handlers for component interactions
 * - Applies provider configuration through the config prop
 *
 * @example
 *
 * ```tsx
 * <LexioProvider
 *   onAction={(action) => {
 *     // Handle custom actions
 *     if (action.type === 'SEARCH_SOURCES') {
 *       return {
 *         sources: fetchSources(action.query)
 *       };
 *     }
 *     return undefined;
 *   }}
 *   theme={customTheme}
 *   config={{
 *     apiKey: 'your-api-key',
 *     endpoint: 'https://your-api-endpoint.com'
 *   }}
 * >
 *   <YourApplication />
 * </LexioProvider>
 * ```
 */
export declare const LexioProvider: ({ children, onAction, theme, config, }: LexioProviderProps) => JSX_2.Element;

/**
 * Props for the LexioProvider component.
 *
 * @interface LexioProviderProps
 * @property {React.ReactNode} children - React child components to be wrapped by the provider
 * @property {ActionHandler['handler']} [onAction] - Optional callback function to handle custom actions triggered within Lexio components
 * @property {Theme} [theme] - Optional custom theme object to override the default styling
 * @property {ProviderConfig} [config] - Optional provider configuration object to customize behavior and settings
 */
declare interface LexioProviderProps {
    children: React.ReactNode;
    onAction?: ActionHandler['handler'];
    theme?: Theme;
    config?: ProviderConfig;
}

/**
 * A component for rendering Markdown content with formatting and syntax highlighting.
 *
 * MarkdownViewer converts Markdown text into formatted HTML with support for GitHub
 * Flavored Markdown features like tables, task lists, and strikethrough. It uses
 * HtmlViewer internally for display.
 *
 * @component
 *
 * Features:
 * - GitHub Flavored Markdown support
 * - Code syntax highlighting
 * - Zoom controls inherited from HtmlViewer
 * - Customizable styling
 *
 * @param {MarkdownViewerProps} props - The props for the MarkdownViewer
 * @returns {JSX.Element} A themed markdown viewer with zoom controls
 *
 * @remarks
 * **Highlights:**
 * - Uses react-markdown with remark-gfm plugin for GitHub Flavored Markdown support
 * - Inherits all features from HtmlViewer (zoom, theme support, etc.)
 * - Used internally by ContentDisplay when displaying Markdown source content
 *
 * @example
 *
 * ```tsx
 * <MarkdownViewer
 *   markdownContent="# Hello World\n\nThis is **bold** and this is *italic*."
 *   styleOverrides={{
 *     contentBackground: '#ffffff',
 *     contentPadding: '20px',
 *     viewerBorderRadius: '8px',
 *   }}
 * />
 * ```
 */
export declare const MarkdownViewer: ({ markdownContent, styleOverrides }: MarkdownViewerProps) => JSX_2.Element;

/**
 * Props for the MarkdownViewer component.
 * @see {@link MarkdownViewer}
 *
 * @interface MarkdownViewerProps
 * @property {string} markdownContent - The raw markdown string to render
 * @property {HtmlViewerStyles} [styleOverrides] - Optional style overrides that will be passed to the underlying HtmlViewer
 */
declare interface MarkdownViewerProps {
    /** The raw markdown string to render */
    markdownContent: string;
    /** Optional style overrides that will be passed to the underlying HtmlViewer */
    styleOverrides?: HtmlViewerStyles;
}

/**
 * Interface representing a source mention within the editor
 */
declare interface Mention {
    /** Unique identifier for the mention */
    id: string;
    /** Display name of the mentioned source */
    name: string;
    /** The full source object being referenced */
    source: Source;
}

/**
 * Represents a chat message in the conversation.
 *
 * @interface Message
 * @property {UUID} id - Unique identifier for the message. This is automatically generated by Lexio.
 * @property {"user" | "assistant"} role - Role of the message sender
 * @property {string} content - Text content of the message
 */
export declare interface Message {
    readonly id: UUID;
    role: "user" | "assistant";
    content: string;
}

/**
 * A Message type where the id property is optional.
 * Used when creating new messages where the id may be generated later.
 * This is useful when you need to create a message object before it's added to the state.
 */
export declare type MessageWithOptionalId = Partial<Pick<Message, 'id'>> & Omit<Message, 'id'>;

declare type ParsePDFFn = (arrayBuffer: ArrayBuffer, source: Source) => Source;

declare type ParseTextFn = (text: string, source: Source) => Source;

/**
 * Partial theme interface that allows for partial overrides of the main theme configuration.
 *
 * @interface PartialTheme
 * @property {Partial<Colors>} colors - Partial color palette configuration for the application.
 * @property {Partial<Typography>} typography - Partial typography settings for consistent text rendering.
 * @property {Partial<ComponentDefaults>} componentDefaults - Partial component defaults for consistent styling.
 */
export declare interface PartialTheme {
    colors: Partial<Colors>;
    typography: Partial<Typography>;
    componentDefaults: Partial<ComponentDefaults>;
}

/**
 * Represents a highlight annotation in a PDF document.
 *
 * @interface PDFHighlight
 * @property {number} page - The page number where the highlight appears. Page numbers are 1-based.
 * @property {object} rect - The rectangle coordinates of the highlight
 * @property {number} rect.top - Top position of the highlight (relative to the page)
 * @property {number} rect.left - Left position of the highlight (relative to the page)
 * @property {number} rect.width - Width of the highlight (relative to the page width)
 * @property {number} rect.height - Height of the highlight (relative to the page height)
 */
export declare interface PDFHighlight {
    /**
     * The page number where the highlight appears. Page numbers are 1-based.
     * @TJS-type integer
     * @minimum 1
     */
    page: number;
    /**
     * The rectangle coordinates of the highlight
     */
    rect: {
        /**
         * Top position of the highlight (relative to the page)
         */
        top: number;
        /**
         * Left position of the highlight (relative to the page)
         */
        left: number;
        /**
         * Width of the highlight (relative to the page width)
         */
        width: number;
        /**
         * Height of the highlight (relative to the page height)
         */
        height: number;
    };
}

/**
 * A component for displaying PDF documents with advanced viewing controls.
 * Used in the ContentDisplay component to display PDF source content with highlight support.
 *
 * If no `page` number is provided, the component will automatically select the most frequently highlighted page.
 *
 * @component
 * @param {PdfViewerProps} props - The props for the PdfViewer
 * @returns {JSX.Element} A themed PDF viewer with navigation and zoom controls
 *
 * @remarks
 * **Features:**
 * - Page navigation with keyboard shortcuts (Left/Right arrows, Space, Backspace)
 * - Zoom controls (Ctrl/Cmd + Up/Down)
 * - Page rotation (.)
 * - Support for highlight annotations
 * - Automatic page selection based on highlight density
 * - Mouse wheel zoom support
 *
 * @remarks
 * **Keyboard Shortcuts:**
 * - Next Page: Right Arrow, Space
 * - Previous Page: Left Arrow, Backspace
 * - First Page: Home
 * - Last Page: End
 * - Zoom In: Ctrl/Cmd + Up
 * - Zoom Out: Ctrl/Cmd + Down
 * - Fit to View: Ctrl/Cmd + 0
 * - Rotate Page: .
 *
 * @example
 *
 * ```tsx
 * <PdfViewer
 *   data={pdfBinaryData as Uint8Array}
 *   highlights={[
 *     { page: 1, rect: { top: 0.1, left: 0.1, width: 0.2, height: 0.05 } }
 *   ]}
 *   page={1}
 *   styleOverrides={{
 *     contentBackground: '#ffffff',
 *     contentPadding: '20px',
 *     viewerBorderRadius: '8px',
 *   }}
 * />
 * ```
 */
export declare const PdfViewer: ({ data, highlights, page, styleOverrides }: PdfViewerProps) => JSX_2.Element;

/**
 * Props for the PdfViewer component.
 *
 * @interface PdfViewerProps
 * @property {Uint8Array} data - The binary PDF data to display
 * @property {PDFHighlight[]} [highlights] - Optional array of highlight annotations to display on the PDF
 * @property {number} [page] - Optional page number to display initially
 * @property {PdfViewerStyles} [styleOverrides] - Optional style overrides for customizing the viewer's appearance
 */
declare interface PdfViewerProps {
    data: Uint8Array;
    highlights?: PDFHighlight[];
    page?: number;
    styleOverrides?: PdfViewerStyles;
}

/**
 * Style configuration interface for the PdfViewer component.
 * Extends ViewerToolbarStyles to include additional styling options specific to PDF display.
 *
 * @interface PdfViewerStyles
 * @extends {ViewerToolbarStyles}
 * @property {string} [color] - Text color for the viewer
 * @property {string} [fontFamily] - Font family for text elements
 * @property {string} [contentBackground] - Background color of the PDF content area
 * @property {string} [contentPadding] - Padding around the PDF content
 */
declare interface PdfViewerStyles extends ViewerToolbarStyles {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    contentBackground?: string;
    contentPadding?: string;
    borderRadius?: string;
}

/**
 * --- Connector Options ---
 */
declare interface PromiseSourceContentConnectorOptions {
    /**
     * A function that, given a SourceReference, returns the URL and optional RequestInit for fetch.
     * Defaults to using the 'id' in source.metadata and building:
     *   http://localhost:8000/pdfs/<id>
     */
    buildFetchRequest?: BuildFetchRequestFn;
    /**
     * Parse an ArrayBuffer from PDF responses into a PDFSourceContent.
     */
    parsePDF?: ParsePDFFn;
    /**
     * Parse text responses into either HTML or Markdown content (or both).
     * We treat everything that isn't 'pdf' as text-based.
     */
    parseText?: ParseTextFn;
}

/**
 * Configuration options for the Lexio provider.
 *
 * @interface ProviderConfig
 * @property {object} [timeouts] - Optional timeout configuration settings
 * @property {number} [timeouts.stream] - Timeout between stream chunks in milliseconds
 * @property {number} [timeouts.request] - Overall request timeout in milliseconds
 */
export declare interface ProviderConfig {
    timeouts?: {
        stream?: number;
        request?: number;
    };
}

/**
 * A textarea-based input component for submitting queries with workflow status indication.
 *
 * `QueryField` provides a simple yet powerful interface for users to input and submit
 * queries. It features auto-expanding behavior and keyboard shortcuts for submission.
 *
 * @component
 *
 * Features:
 * - Auto-expanding textarea
 * - Enter to submit (Shift+Enter for new line)
 * - Visual workflow status indicator
 * - Customizable styling
 * - Responsive design
 *
 * @example
 *
 * ```tsx
 * <QueryField
 *   componentKey="search-query"
 *   placeholder="Ask a question..."
 *   disabled={false}
 *   styleOverrides={{
 *     backgroundColor: '#f5f5f5',
 *     color: '#333333',
 *     borderRadius: '8px',
 *     padding: '12px',
 *   }}
 * />
 * ```
 */
export declare const QueryField: default_2.FC<QueryFieldProps>;

/**
 * Props for the QueryField component
 */
declare interface QueryFieldProps {
    /**
     * Unique key for the component which can be used to identify the source of UserAction's if multiple QueryField components are used.
     * The default is 'QueryField', if key is provided it will be appended to the default key as following 'QueryField-${key}'.
     */
    componentKey?: string;
    /**
     * Custom placeholder text for the input field
     * @default "Type a message..."
     */
    placeholder?: string;
    /**
     * Whether the input field is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Style overrides for the component
     */
    styleOverrides?: QueryFieldStyles;
    /**
     * Whether to show the "New Chat" button
     * @default true
     */
    showNewChatButton?: boolean;
}

/**
 * Styles interface for the QueryField component
 * @see {@link QueryField}
 */
declare interface QueryFieldStyles extends default_2.CSSProperties {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;
    fontSize?: string;
    borderColor?: string;
    borderRadius?: string;
    inputBackgroundColor?: string;
    inputBorderColor?: string;
    inputBorderRadius?: string;
    buttonBackground?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: string;
    modeInitColor?: string;
    modeFollowUpColor?: string;
    modeReRetrieveColor?: string;
    statusTextColor?: string;
}

/**
 * Action to reset source filters.
 *
 * @property {string} type - The action type identifier
 * @property {Component} source - The component that triggered the action
 */
export declare type ResetFilterSourcesAction = {
    type: 'RESET_FILTER_SOURCES';
    source: Component;
};

/**
 * Response for the RESET_FILTER_SOURCES action.
 *
 * @interface ResetFilterSourcesActionResponse
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export declare interface ResetFilterSourcesActionResponse {
    followUpAction?: UserAction;
}

declare interface RESTConnectorOptions<TData = any> {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    /**
     * parseResponse interprets the REST response data.
     * Return `{ content?: string, sources?: Source[] }`.
     */
    parseResponse(data: TData): {
        content?: string;
        sources?: Source[];
    };
    /**
     * Function to build the request body (when method != 'GET').
     * Default: `{ messages, sources, metadata }`.
     */
    buildRequestBody?: (messages: Omit<Message, 'id'>[], sources: Source[], metadata?: Record<string, any>) => any;
    /**
     * Optional headers to include in the request.
     */
    headers?: Record<string, string>;
    /**
     * The default mode (if not specified per request).
     * 'text' | 'sources' | 'both'
     */
    defaultMode?: 'text' | 'sources' | 'both';
}

/**
 * You can call the connector either with the old signature:
 *    (messages, sources, metadata?)
 * or by passing a request object:
 *    { messages, sources, metadata, mode? }
 */
declare interface RESTConnectorRequest {
    messages: Omit<Message, 'id'>[];
    sources: Source[];
    metadata?: Record<string, any>;
    mode?: 'text' | 'sources' | 'both';
}

/**
 * Action to search for sources using a query.
 *
 * @property {string} type - The action type identifier
 * @property {string} query - The search query
 * @property {Component} source - The component that triggered the action
 */
export declare type SearchSourcesAction = {
    type: 'SEARCH_SOURCES';
    query: string;
    source: Component;
};

/**
 * Response for the SEARCH_SOURCES action.
 *
 * @interface SearchSourcesActionResponse
 * @property {Promise<Source[]>} [sources] - Sources found by the search
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export declare interface SearchSourcesActionResponse {
    sources?: Promise<Source[]>;
    followUpAction?: UserAction;
}

/**
 * Action to set a message as active in the chat.
 *
 * @property {string} type - The action type identifier
 * @property {string} messageId - ID of the message to set as active
 * @property {Component} source - The component that triggered the action
 */
export declare type SetActiveMessageAction = {
    type: 'SET_ACTIVE_MESSAGE';
    messageId: string;
    source: Component;
};

/**
 * Response for the SET_ACTIVE_MESSAGE action.
 *
 * @interface SetActiveMessageActionResponse
 * @property {string} [messageId] - ID of the active message
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export declare interface SetActiveMessageActionResponse {
    messageId?: string;
    followUpAction?: UserAction;
}

/**
 * Action to set active sources by their IDs.
 *
 * @property {string} type - The action type identifier
 * @property {string[]} sourceIds - Array of source IDs to set as active
 * @property {Component} source - The component that triggered the action
 */
export declare type SetActiveSourcesAction = {
    type: 'SET_ACTIVE_SOURCES';
    sourceIds: string[];
    source: Component;
};

/**
 * Response for the SET_ACTIVE_SOURCES action.
 *
 * @interface SetActiveSourcesActionResponse
 * @property {string[]} [activeSourceIds] - IDs of the active sources
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export declare interface SetActiveSourcesActionResponse {
    activeSourceIds?: string[];
    followUpAction?: UserAction;
}

/**
 * Action to set a filter for sources.
 *
 * @property {string} type - The action type identifier
 * @property {any} filter - Filter criteria to apply
 * @property {Component} source - The component that triggered the action
 */
export declare type SetFilterSourcesAction = {
    type: 'SET_FILTER_SOURCES';
    filter: any;
    source: Component;
};

/**
 * Response for the SET_FILTER_SOURCES action.
 *
 * @interface SetFilterSourcesActionResponse
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export declare interface SetFilterSourcesActionResponse {
    followUpAction?: UserAction;
}

/**
 * Action to submit feedback for a message.
 *
 * @property {string} type - The action type identifier
 * @property {string} messageId - ID of the message receiving feedback
 * @property {'positive' | 'negative' | null} feedback - The feedback type
 * @property {string} [comment] - Optional comment explaining the feedback
 * @property {string} [messageContent] - The content of the message receiving feedback (for convenience)
 * @property {Component} source - The component that triggered the action
 */
export declare type SetMessageFeedbackAction = {
    type: 'SET_MESSAGE_FEEDBACK';
    messageId: string;
    feedback: 'positive' | 'negative' | null;
    comment?: string;
    messageContent?: string;
    source: Component;
};

/**
 * Response for the SET_MESSAGE_FEEDBACK action.
 *
 * @interface SetMessageFeedbackActionResponse
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export declare interface SetMessageFeedbackActionResponse {
    followUpAction?: UserAction;
}

/**
 * Action to set a selected source.
 *
 * @property {string} type - The action type identifier
 * @property {string} sourceId - ID of the source to select
 * @property {Source} [sourceObject] - Optional source object to use
 * @property {Component} source - The component that triggered the action
 */
export declare type SetSelectedSourceAction = {
    type: 'SET_SELECTED_SOURCE';
    sourceId: string;
    sourceObject?: Source;
    source: Component;
};

/**
 * Response for the SET_SELECTED_SOURCE action.
 * This response is used when a source is selected in the SourcesDisplay component.
 *
 * @interface SetSelectedSourceActionResponse
 * @property {string | null} [selectedSourceId] - ID of the selected source. Set to null to deselect.
 * @property {Promise<string | Uint8Array>} [sourceData] - Data for the selected source. This will be displayed in the ContentDisplay component.
 * @property {UserAction} [followUpAction] - Optional action to trigger after this one completes
 */
export declare interface SetSelectedSourceActionResponse {
    selectedSourceId?: string | null;
    sourceData?: Promise<string | Uint8Array>;
    followUpAction?: UserAction;
}

/**
 * Represents a source of information that can be displayed and referenced.
 *
 * @interface Source
 * @property {UUID} id - Unique identifier for the source. This is automatically generated by Lexio.
 * @property {string} title - Title of the source displayed in the SourcesDisplay component
 * @property {"text" | "pdf" | "markdown" | "html"} type - Type of the source, determines how the source is displayed in the ContentDisplay component
 * @property {string} [description] - Optional description of the source displayed in SourcesDisplay
 * @property {number} [relevance] - Optional relevance score displayed as a bar in SourcesDisplay. Should be a value between 0 and 1.
 * @property {string} [href] - Optional link to the source
 * @property {string | Uint8Array} [data] - Optional content data of the source
 * @property {object} [metadata] - Optional metadata for the source
 * @property {PDFHighlight[]} [highlights] - Optional highlight annotations for PDF sources
 */
export declare interface Source {
    readonly id: UUID;
    /**
     * Title of the source displayed in the SourcesDisplay component.
     */
    title: string;
    /**
     * Type of the source, used to determine the type of data to display in the ContentDisplay component.
     */
    type: "text" | "pdf" | "markdown" | "html";
    /**
     * Description of the source displayed in the SourcesDisplay component if provided.
     */
    description?: string;
    /**
     * Relevance score of the source. It is displayed in the SourcesDisplay component as bar chart.
     * Should be a value between 0 and 1.
     *
     * @minimum 0
     * @maximum 1
     */
    relevance?: number;
    /**
     * Optional href to display a link to the source in the SourcesDisplay component.
     */
    href?: string;
    /**
     * Optional data to display in the ContentDisplay component. This can be set initially
     * or lazily loaded when the `SET_SELECTED_SOURCE` action is handled. Simply return the data
     * from your `onAction()` function as `sourceData\` in the response.
     *
     * For PDF sources, this should be a Uint8Array containing the binary PDF data.
     * For text, markdown, and HTML sources, this should be a string.
     *
     * @TJS-type [string, bytes]
     * @python-type Union[str, bytes]
     */
    data?: string | Uint8Array;
    /**
     * Optional metadata associated with the source.
     *
     * If type='pdf', you can set the 'page' and '_page' properties to specify the page number to display in the SourcesDisplay component.
     * Properties with a leading underscore (e.g., '_page') are hidden from display in the UI.
     *
     * @remarks metadata is not used by the LexioProvider. It is shown as-is in the SourcesDisplay component.
     *
     * @TJS-type object
     * @python-type Dict[str, any]
     * @TJS-extra allow
     */
    metadata?: Record<string, any> & {
        /**
         * The page number to display for PDF documents. Page numbers are 1-based.
         * @TJS-type integer
         * @minimum 1
         */
        page?: number;
        /**
         * Hidden from display. The page number to display for PDF documents. Page numbers are 1-based.
         * @TJS-type integer
         * @minimum 1
         */
        _page?: number;
    };
    /**
     * Highlight annotations in the PDF document. Only applicable for PDF sources.
     * These highlights will be visually displayed in the PDF viewer.
     */
    highlights?: PDFHighlight[];
}

/**
 * A component for displaying, searching, and selecting sources.
 *
 * `SourcesDisplay` shows a list of available sources with search functionality,
 * allowing users to browse, filter, and select sources for viewing or reference.
 *
 * @component
 *
 * Features:
 * - Source listing with titles and metadata
 * - Search functionality for filtering sources
 * - Source selection for viewing content
 * - Relevance score display
 * - Metadata tag display
 * - Clear sources functionality
 * - Responsive design
 *
 * @example
 *
 * ```tsx
 * <SourcesDisplay
 *   componentKey="main-sources"
 *   title="Knowledge Base"
 *   searchPlaceholder="Search documents..."
 *   showSearch={true}
 *   showRelevanceScore={true}
 *   showMetadata={true}
 *   styleOverrides={{
 *     backgroundColor: '#ffffff',
 *     borderRadius: '8px',
 *     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
 *     padding: '1rem',
 *   }}
 * />
 * ```
 */
export declare const SourcesDisplay: React.FC<SourcesDisplayProps>;

/**
 * Props for the SourcesDisplay component
 * @see {@link SourcesDisplay}
 */
declare interface SourcesDisplayProps {
    /**
     * Unique key for the component which can be used to identify the source of UserAction's if multiple SourcesDisplay components are used.
     * The default is 'SourcesDisplay', if key is provided it will be appended to the default key as following 'SourcesDisplay-${key}'.
     */
    componentKey?: string;
    /**
     * The title displayed above the sources list
     * @default "Retrieved Sources"
     */
    title?: string;
    /**
     * Placeholder text for the search input field
     * @default "Search sources..."
     */
    searchPlaceholder?: string;
    /**
     * Controls visibility of the search functionality
     * @default true
     */
    showSearch?: boolean;
    /**
     * Controls visibility of relevance scores
     * @default true
     */
    showRelevanceScore?: boolean;
    /**
     * Controls visibility of metadata tags
     * @default true
     */
    showMetadata?: boolean;
    /**
     * Style customization options
     */
    styleOverrides?: SourcesDisplayStyles;
}

declare interface SourcesDisplayStyles extends React.CSSProperties {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;
    fontSize?: string;
    borderRadius?: string;
    inputBackgroundColor?: string;
    inputBorderColor?: string;
    buttonBackground?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: string;
    activeSourceBackground?: string;
    activeSourceBorderColor?: string;
    selectedSourceBackground?: string;
    selectedSourceBorderColor?: string;
    inactiveSourceBackground?: string;
    inactiveSourceBorderColor?: string;
    inputFocusRingColor?: string;
    metadataTagBackground?: string;
    metadataTagColor?: string;
    relevanceScoreColor?: string;
    sourceTypeBackground?: string;
    sourceTypeColor?: string;
}

/**
 * The connector options, including a parseEvent function (once).
 *  'text' => only text stream
 *  'sources' => only sources promise
 *  'both' => both text stream & sources promise
 */
declare interface SSEConnectorOptions<TData = any> {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    /**
     * parseEvent is the single place to translate incoming SSE data
     * into your text content, any sources, and a `done` signal.
     */
    parseEvent(data: TData): {
        content?: string;
        sources?: Source[];
        done?: boolean;
    };
    /**
     * If you need to build a request body differently, override this.
     */
    buildRequestBody?: (messages: MessageWithOptionalId[], sources: Source[], metadata?: Record<string, any>) => any;
    /**
     * Default mode if not specified at request time.
     */
    defaultMode?: 'text' | 'sources' | 'both';
}

declare interface SSEConnectorRequest {
    messages: MessageWithOptionalId[];
    sources: Source[];
    metadata?: Record<string, any>;
    /**
     * Allows overriding mode for this specific request.
     */
    mode?: 'text' | 'sources' | 'both';
}

/**
 * Represents a chunk of streamed content.
 * Used for streaming responses from the assistant in real-time.
 *
 * @interface StreamChunk
 * @property {string} [content] - Text content in this chunk
 * @property {Source[]} [sources] - Sources related to this chunk that can be displayed alongside the content
 * @property {boolean} [done] - Indicates if this is the final chunk in the stream
 */
export declare type StreamChunk = {
    content?: string;
    sources?: Source[];
    done?: boolean;
};

/**
 * Main theme interface that combines all theme-related configurations.
 * Used to provide consistent styling throughout the application via ThemeProvider.
 *
 * @interface Theme
 * @property {Colors} colors - Color palette configuration for the application.
 * @property {Typography} typography - Typography settings for consistent text rendering.
 * @property {ComponentDefaults} componentDefaults - Component defaults for consistent styling.
 *
 * @remarks
 * The theme is provided to the application via the RAGProvider component, which wraps the entire application.
 *
 * @example
 * ```tsx
 * import { defaultTheme, RAGProvider } from 'lexio';
 *
 * ... your code here ...
 *
 * <RAGProvider theme={defaultTheme}>
 *     ... your app components ...
 * <RAGProvider />
 * ```
 */
export declare interface Theme {
    colors: Colors;
    typography: Typography;
    componentDefaults: ComponentDefaults;
}

/**
 * Defines the typography settings used throughout the application.
 * Controls the font family, base size, and line height for consistent text rendering.
 *
 * @interface Typography
 * @property {string} fontFamily - Main font family stack for the application. The font should be imported in the global styles.
 * @property {string} fontSizeBase - Base font size from which other sizes are calculated.
 * @property {string} lineHeight - Default line height for optimal readability
 */
export declare interface Typography {
    fontFamily: string;
    /**
     * Base font size from which other sizes are calculated.
     * @remarks This value is used to calculate other font sizes in the application using a relative scale.
     */
    fontSizeBase: string;
    lineHeight: string;
}

/**
 * Hook to access the current theme in any component within the LexioThemeProvider.
 *
 * @returns {Theme} The current theme object
 *
 * @example
 * ```tsx
 * import { useLexioTheme } from 'lexio';
 *
 * function MyCustomComponent() {
 *   const theme = useLexioTheme();
 *
 *   return (
 *     <div style={{
 *       color: theme.colors.text,
 *       backgroundColor: theme.colors.background,
 *       padding: theme.componentDefaults.padding,
 *       borderRadius: theme.componentDefaults.borderRadius
 *     }}>
 *       My themed custom component
 *     </div>
 *   );
 * }
 * ```
 *
 * @throws {Error} If used outside of a LexioThemeProvider
 */
export declare function useLexioTheme(): Theme;

/**
 * Hook to submit feedback for messages.
 * @param component - The component name to identify the source of the action.
 * @returns An object containing functions to submit feedback.
 */
export declare const useMessageFeedback: (component: Component) => {
    submitFeedback: (messageId: string | UUID, feedback: "positive" | "negative" | null, comment?: string, messageContent?: string) => void;
};

/**
 * Hook to read and manipulate message state.
 * @param component - The component name to identify the source of an action.
 * @returns An object containing message state and functions to manipulate messages.
 */
export declare const useMessages: (component: Component) => {
    messages: Message_2[];
    currentStream: Message_2 | null;
    addUserMessage: (message: string) => void;
    setActiveMessage: (messageId: string | UUID | null) => void;
    clearMessages: () => void;
};

/**
 * Union type of all possible user actions in the system.
 */
export declare type UserAction = AddUserMessageAction | SetActiveMessageAction | ClearMessagesAction | SearchSourcesAction | ClearSourcesAction | SetActiveSourcesAction | SetSelectedSourceAction | SetFilterSourcesAction | ResetFilterSourcesAction | SetMessageFeedbackAction;

/**
 * Hook to read and manipulate sources state.
 * @param component - The component name to identify the source of a action source.
 * @returns An object containing source state and functions to manipulate sources.
 */
export declare const useSources: (component: Component) => {
    sources: Source_2[];
    activeSources: Source_2[] | null;
    activeSourcesIds: string[] | null;
    selectedSource: Source_2 | null;
    selectedSourceId: string | null;
    searchSources: (query: string) => void;
    clearSources: () => void;
    setActiveSources: (sourceIds: string[] | UUID[] | null) => void;
    setSelectedSource: (sourceId: string | UUID | null) => void;
    setFilterSources: (filter: any) => void;
    resetFilterSources: () => void;
};

/**
 * Hook to access the current loading and error state.
 * @returns An object containing the current loading state and any error information.
 */
export declare const useStatus: () => {
    loading: boolean;
    error: string | null;
};

/**
 * A UUID string in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".
 * Used as unique identifiers for messages, sources, and other entities in the system.
 */
export declare type UUID = `${string}-${string}-${string}-${string}-${string}`;

declare interface ViewerToolbarStyles extends React.CSSProperties {
    fontFamily?: string;
    fontSize?: string;
    toolbarBorderRadius?: string;
    toolbarTextColor?: string;
    toolbarBackground?: string;
    toolbarSecondaryBackground?: string;
    toolbarButtonBackground?: string;
    toolbarButtonColor?: string;
    toolbarButtonBorderRadius?: string;
    toolbarBoxShadow?: string;
    toolbarChipBackground?: string;
    toolbarChipBorderRadius?: string;
    toolbarChipInputBackground?: string;
}

export { }
