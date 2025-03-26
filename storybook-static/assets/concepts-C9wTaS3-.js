import{j as e}from"./index-EuO1YB73.js";import{useMDXComponents as r}from"./index-BLKynSmM.js";import{M as o}from"./index-DvK65IPP.js";import"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./iframe-DTK7Rc-o.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";function i(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{title:"Concepts"}),`
`,e.jsx(n.h1,{id:"-core-concepts",children:"🚀 Core Concepts"}),`
`,e.jsx(n.p,{children:"This page explains the fundamental concepts and building blocks of Lexio, providing a foundation for understanding how to use the library effectively."}),`
`,e.jsx(n.h2,{id:"basic-components",children:"Basic Components"}),`
`,e.jsx(n.h3,{id:"-lexioprovider",children:"🧠 LexioProvider"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"LexioProvider"})," is the core component that provides the context for all Lexio UI components:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"It manages the shared state for all UI components"}),`
`,e.jsxs(n.li,{children:["It processes user actions through the ",e.jsx(n.code,{children:"onAction"})," ActionHandler"]}),`
`,e.jsx(n.li,{children:"It handles error states and loading indicators"}),`
`,e.jsx(n.li,{children:"It provides configuration options for timeouts and other settings"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<LexioProvider
  onAction={(action, messages, sources, activeSources, selectedSource) => {
    // Handle different action types
    if (action.type === 'ADD_USER_MESSAGE') {
      // Process user message and return response
    }
    // Return undefined for actions you don't need to handle
  }}
  config={{
    timeouts: {
      request: 30000,  // 30 seconds for entire operations
      stream: 5000     // 5 seconds between stream chunks
    }
  }}
>
  {/* Your Lexio components here */}
</LexioProvider>
`})}),`
`,e.jsx(n.h3,{id:"️-ui-components",children:"🖥️ UI Components"}),`
`,e.jsx(n.p,{children:"Lexio provides several ready-to-use UI components:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"ChatWindow"}),": Displays the conversation history and AI responses with markdown support"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"AdvancedQueryField"}),": Input field for user messages with optional advanced features"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"SourcesDisplay"}),": Shows retrieved sources with metadata and selection capabilities"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"ContentDisplay"}),": Renders the content of selected sources with highlighting"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"ErrorDisplay"}),": Shows error messages and loading states"]}),`
`]}),`
`,e.jsx(n.h3,{id:"-react-hooks",children:"🪝 React Hooks"}),`
`,e.jsx(n.p,{children:"Lexio provides a set of React hooks that allow you to interact with the state and trigger actions from your custom components:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"useSources"}),": Access and manipulate source-related state"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"useMessages"}),": Access and manipulate message-related state"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"useStatus"}),": Access loading and error states"]}),`
`]}),`
`,e.jsx(n.p,{children:"These hooks enable you to:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Trigger user actions programmatically from your React code"}),`
`,e.jsx(n.li,{children:"Access the current state of the application"}),`
`,e.jsx(n.li,{children:"Build custom components that integrate with Lexio's state management"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`// Example of using hooks in a custom component
import { useSources, useMessages, useStatus } from 'lexio';

const MyCustomComponent = () => {
  // Access source-related functionality
  const { 
    sources, 
    activeSources, 
    selectedSource,
    searchSources,
    setSelectedSource,
    setActiveSources,
    clearSources
  } = useSources('MyCustomComponent');
  
  // Access message-related functionality
  const {
    messages,
    activeMessage,
    addUserMessage,
    clearMessages
  } = useMessages('MyCustomComponent');
  
  // Access loading and error states
  const { loading, error } = useStatus();
  
  // Example: Trigger a user message programmatically
  const handleSubmit = () => {
    addUserMessage('My programmatic message');
  };
  
  return (
    <div>
      {/* Your custom UI */}
      <button onClick={handleSubmit} disabled={loading}>
        Send Message
      </button>
      {/* Display sources, messages, etc. */}
    </div>
  );
};
`})}),`
`,e.jsx(n.p,{children:"All built-in Lexio UI components use these same hooks internally, ensuring consistent behavior across the application. The component name parameter (e.g., 'MyCustomComponent') helps with debugging by identifying which component triggered an action."}),`
`,e.jsx(n.h2,{id:"action-handler-pattern",children:"Action Handler Pattern"}),`
`,e.jsx(n.p,{children:"The action handler pattern is central to Lexio's architecture:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"User Interactions"})," trigger actions (e.g., sending a message, selecting a source)"]}),`
`,e.jsxs(n.li,{children:["These actions are passed to the ",e.jsx(n.code,{children:"onAction"})," handler in the ",e.jsx(n.code,{children:"LexioProvider"})]}),`
`,e.jsx(n.li,{children:"The handler processes the action and returns an appropriate response"}),`
`,e.jsx(n.li,{children:"Lexio updates its internal state based on the response"}),`
`,e.jsx(n.li,{children:"UI components automatically reflect the updated state"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`onAction(
  action: UserAction,           // The action that was triggered
  messages: Message[],          // All messages in the chat
  sources: Source[],            // All available sources
  activeSources: Source[] | null, // Currently active sources
  selectedSource: Source | null // Currently selected source
) => ActionHandlerResponse | Promise<ActionHandlerResponse> | undefined
`})}),`
`,e.jsx(n.h3,{id:"-common-action-types",children:"📋 Common Action Types"}),`
`,e.jsx(n.p,{children:"Lexio provides a set of predefined action types that cover most common user interactions:"}),`
`,e.jsx(n.h4,{id:"message-actions",children:"Message Actions"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"ADD_USER_MESSAGE"}),": User sends a new message (requires response handling)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"CLEAR_MESSAGES"}),": Conversation history is cleared"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"SET_ACTIVE_MESSAGE"}),": A specific message is highlighted or focused"]}),`
`]}),`
`,e.jsx(n.h4,{id:"source-actions",children:"Source Actions"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"SEARCH_SOURCES"}),": User initiates a source search (requires source retrieval)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"CLEAR_SOURCES"}),": All sources are removed from the state"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"SET_SELECTED_SOURCE"}),": User selects a specific source for detailed viewing"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"SET_ACTIVE_SOURCES"}),": Multiple sources are activated for context"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"SET_FILTER_SOURCES"}),": Sources are filtered based on criteria"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"RESET_FILTER_SOURCES"}),": Source filters are cleared"]}),`
`]}),`
`,e.jsxs(n.p,{children:["Each action type has a specific structure and expected response format. For example, ",e.jsx(n.code,{children:"ADD_USER_MESSAGE"})," typically returns both a response and sources, while ",e.jsx(n.code,{children:"SET_SELECTED_SOURCE"})," might return source data for the selected document."]}),`
`,e.jsx(n.h2,{id:"state-management",children:"State Management"}),`
`,e.jsx(n.p,{children:"Lexio manages several key state elements:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Messages"}),": The conversation history between user and AI"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Sources"}),": Retrieved documents or text snippets"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Selected Source"}),": Currently focused source for detailed viewing"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Active Sources"}),": Sources currently being used for context"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Loading State"}),": Indicates ongoing operations"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Error State"}),": Captures and displays errors"]}),`
`]}),`
`,e.jsx(n.h2,{id:"advanced-concepts",children:"Advanced Concepts"}),`
`,e.jsx(n.h3,{id:"-response-handling",children:"💬 Response Handling"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Streaming Responses"}),": Real-time, incremental responses using AsyncIterable"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Source Updates During Streaming"}),": Adding or updating sources during streaming"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Error Handling"}),": Comprehensive error handling for various failure scenarios"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Timeouts"}),": Configurable timeouts for requests and streaming"]}),`
`]}),`
`,e.jsx(n.h3,{id:"️-action-flow-customization",children:"⚙️ Action Flow Customization"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Blocking vs. Non-blocking Actions"}),": Some actions block the UI during processing"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Lazy Loading"}),": Lazy loading of sources and data"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Follow-up Actions"}),": Chain multiple actions together for complex workflows"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Custom Action Types"}),": Define your own action types for specialized behavior"]}),`
`]}),`
`,e.jsx(n.h3,{id:"-customization-and-theming",children:"🎨 Customization and Theming"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Component Customization"}),": Override styles for individual components"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Global Theme"}),": Apply consistent styling across all components"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Custom Components"}),": Build your own components using Lexio's hooks"]}),`
`]}),`
`,e.jsx(n.h2,{id:"-integration-patterns",children:"🔌 Integration Patterns"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Backend Integration"}),": Connect to any RAG backend (LangChain, LlamaIndex, custom)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Authentication"}),": Pass authentication tokens through your action handler"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Stateful vs. Stateless"}),": Choose between maintaining state on client or server"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Progressive Enhancement"}),": Start simple and add advanced features as needed"]}),`
`]})]})}function g(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{g as default};
