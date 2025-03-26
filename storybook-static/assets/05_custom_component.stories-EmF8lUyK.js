import{j as e}from"./index-EuO1YB73.js";import"./ContentDisplay-D19Pf_Rz.js";import"./QueryField-HQujzfL2.js";import"./AdvancedQueryField-dmwBg1V3.js";import"./ChatWindow-DByjvp2V.js";import"./PdfViewer-fnhOmsH7.js";import{L as v}from"./provider-DjyZ7jvp.js";import{u as m,b as p,a as y}from"./hooks-DNVfckEt.js";import"./SourcesDisplay-CsqesJNF.js";import{r as h}from"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./MarkdownViewer-CI_XVU6M.js";import"./index-CuqvArXI.js";import"./DocumentPlusIcon-p4mHEHYC.js";import"./floating-ui.react-DaSCc_fA.js";import"./scaleFontSize-B9jNEFC7.js";import"./iframe-DTK7Rc-o.js";import"./tiny-invariant-CopsF_GD.js";const S=()=>{const[s,a]=h.useState(""),{sources:r,searchSources:o}=y("LexioProvider"),{loading:c}=p(),n=()=>{s.trim()&&o(s)},g=t=>t.title?t.title:t.id.slice(0,8);return e.jsxs("div",{className:"w-[600px] p-4 border rounded-lg shadow-sm",children:[e.jsxs("div",{className:"flex gap-2 mb-4",children:[e.jsx("input",{type:"text",value:s,onChange:t=>a(t.target.value),onKeyDown:t=>t.key==="Enter"&&n(),placeholder:"Search sources...",className:"flex-1 px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"}),e.jsx("button",{onClick:n,disabled:c,className:"px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50",children:c?"Searching...":"Search"})]}),e.jsx("div",{className:"space-y-3",children:r.map((t,x)=>e.jsxs("div",{className:"p-4 bg-white border rounded-lg",children:[e.jsx("h3",{className:"font-medium text-gray-800",children:g(t)}),t.type&&e.jsx("span",{className:"inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mt-1",children:t.type}),t.relevance!==void 0&&e.jsxs("div",{className:"mt-2 flex items-center",children:[e.jsx("span",{className:"text-sm text-gray-500",children:"Relevance:"}),e.jsx("div",{className:"ml-2 bg-gray-200 h-2 w-24 rounded-full",children:e.jsx("div",{className:"bg-blue-500 h-2 rounded-full",style:{width:`${Math.round(t.relevance*100)}%`}})}),e.jsxs("span",{className:"ml-2 text-sm text-gray-500",children:[Math.round(t.relevance*100),"%"]})]})]},x))})]})},f=()=>{const{messages:s,currentStream:a}=m("LexioProvider");return e.jsxs("div",{className:"w-[600px] p-4 border rounded-lg shadow-sm max-h-[400px] overflow-auto",children:[e.jsx("h2",{className:"text-lg font-semibold mb-4",children:"Chat History"}),e.jsxs("div",{className:"space-y-4",children:[s.map(r=>e.jsxs("div",{className:`p-3 rounded-lg ${r.role==="user"?"bg-blue-100 ml-8":"bg-gray-100 mr-8"}`,children:[e.jsx("div",{className:"font-medium mb-1",children:r.role==="user"?"You":"Assistant"}),e.jsx("div",{children:r.content})]},r.id)),a&&e.jsxs("div",{className:"p-3 rounded-lg bg-gray-100 mr-8",children:[e.jsx("div",{className:"font-medium mb-1",children:"Assistant"}),e.jsx("div",{children:a.content||"..."})]})]})]})},b=()=>{const[s,a]=h.useState(""),{addUserMessage:r}=m("LexioProvider"),{loading:o}=p(),c=n=>{n.preventDefault(),s.trim()&&(r(s),a(""))};return e.jsx("div",{className:"w-[600px] p-4 border rounded-lg shadow-sm",children:e.jsxs("form",{onSubmit:c,className:"flex flex-col gap-3",children:[e.jsx("textarea",{value:s,onChange:n=>a(n.target.value),placeholder:"Type your message here...",className:"w-full p-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[100px]"}),e.jsx("button",{type:"submit",disabled:o||!s.trim(),className:"px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 self-end",children:o?"Sending...":"Send Message"})]})})},C=()=>e.jsx("div",{className:"space-y-6",children:e.jsx(v,{onAction:(s,a,r)=>{if(s.type==="ADD_USER_MESSAGE")return{response:async function*(){yield{content:'I received your message: "'},await new Promise(o=>setTimeout(o,300)),yield{content:s.message},await new Promise(o=>setTimeout(o,300)),yield{content:'". Let me process that for you...'},await new Promise(o=>setTimeout(o,600)),yield{content:" Here is my response!",done:!0}}(),sources:Promise.resolve([{id:crypto.randomUUID(),title:"Example Source 1",type:"text",relevance:.95,data:"<p>This is example content for source 1</p>"},{id:crypto.randomUUID(),title:"Example Source 2",type:"pdf",relevance:.82,metadata:{author:"Documentation Team"}}])};if(s.type==="SEARCH_SOURCES")return{sources:Promise.resolve([{id:crypto.randomUUID(),title:`Search Result for "${s.query}"`,type:"text",relevance:.91,data:`<p>This is a search result for: ${s.query}</p>`},{id:crypto.randomUUID(),title:"Related Document",type:"markdown",relevance:.78,data:`# Related Information

This document relates to your search for "${s.query}"`}])}},children:e.jsxs("div",{className:"flex flex-col gap-6",children:[e.jsx(f,{}),e.jsx(b,{}),e.jsx(S,{})]})})}),$={title:"Basic Usage/Hooks and Custom Components",component:C,parameters:{layout:"centered",docs:{description:{component:`
## Introduction

This guide demonstrates how to build custom UI components using \`Lexio\`'s state management hooks for reading data and
manipulating state. To use the hooks, you need to wrap your custom components in a \`LexioProvider\` component.

## Available Hooks

Lexio provides several hooks for accessing and manipulating state, which are used to build \`Lexio\`'s components and
can be used in your custom components as well.

The hooks expose the state and triggers for \`UserActions\` that are managed by \`Lexio\`'s state management system.

### useMessages

Access and manage chat messages:

\`\`\`typescript
const { 
  messages,         // Array of completed messages (Message[])
  currentStream,    // Currently streaming message (if any) (StreamChunk)
  addUserMessage,   // Function to add a user message -> dispatches AddUserMessageAction
  setActiveMessage, // Function to set the active message -> dispatches SetActiveMessageAction
  clearMessages     // Function to clear all messages -> dispatches ClearMessagesAction
} = useMessages('LexioProvider');  // To use the hook, you need to pass a component name as string to identify the source of the action
\`\`\`

When building custom components, please provide the component key 'LexioProvider' to identify the source of the action.
As of now, Lexio supports not custom component names other than \`types.ts\`s \`Component\` type.

### useSources

Access and manage sources:

\`\`\`typescript
const { 
  sources,             // Array of all sources (Source[])
  activeSources,       // Array of active sources (Source[])
  activeSourcesIds,    // Array of active source IDs (string[])
  selectedSource,      // Currently selected source (Source | null)
  selectedSourceId,    // ID of selected source (string | null)
  searchSources,       // Function to search for sources -> dispatches SearchSourcesAction
  clearSources,        // Function to clear all sources -> dispatches ClearSourcesAction
  setActiveSources,    // Function to set active sources -> dispatches SetActiveSourcesAction
  setSelectedSource,   // Function to set selected source -> dispatches SetSelectedSourceAction
  setFilterSources,    // Function to filter sources -> dispatches SetFilterSourcesAction
  resetFilterSources   // Function to reset source filters -> dispatches ResetFilterSourcesAction
} = useSources('LexioProvider');
\`\`\`

### useStatus

Access loading and error state:

\`\`\`typescript
const { 
  loading,  // Boolean indicating if any operation is loading
  error     // Error object if an error occurred
} = useStatus();
\`\`\`

## Example: Custom Source Search Component

Here's how to create a custom source search component:

\`\`\`tsx
const CustomSourceSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { sources, searchSources } = useSources('LexioProvider');
  const { loading } = useStatus();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchSources(searchQuery);
    }
  };

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search sources..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      
      {sources.map((source) => (
        <div key={source.id}>
          <h3>{source.title}</h3>
          <span>{source.type}</span>
          {source.relevance && (
            <div>Relevance: {Math.round(source.relevance * 100)}%</div>
          )}
        </div>
      ))}
    </div>
  );
};
\`\`\`

## Example: Custom Chat History Component

Here's how to create a custom chat history component:

\`\`\`tsx
const CustomChatHistory = () => {
  const { messages, currentStream } = useMessages('LexioProvider');
  
  return (
    <div>
      <h2>Chat History</h2>
      
      {messages.map((message) => (
        <div key={message.id}>
          <div>{message.role === 'user' ? 'You' : 'Assistant'}</div>
          <div>{message.content}</div>
        </div>
      ))}
      
      {currentStream && (
        <div>
          <div>Assistant</div>
          <div>{currentStream.content || '...'}</div>
        </div>
      )}
    </div>
  );
};
\`\`\`

## Example: Custom Message Form

Here's how to create a custom message input form:

\`\`\`tsx
const CustomMessageForm = () => {
  const [message, setMessage] = useState('');
  const { addUserMessage } = useMessages('LexioProvider');
  const { loading } = useStatus();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      addUserMessage(message);
      setMessage('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
      />
      <button type="submit" disabled={loading || !message.trim()}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};
\`\`\`

## Putting It All Together

You can combine these custom components within a LexioProvider:

\`\`\`tsx
const App = () => (
  <LexioProvider onAction={handleAction}>
    <CustomChatHistory />
    <CustomMessageForm />
    <CustomSourceSearch />
  </LexioProvider>
);
\`\`\`

### Try it out:

The example below demonstrates these custom components working together:
`}}},tags:["autodocs"]},i={};var u,d,l;i.parameters={...i.parameters,docs:{...(u=i.parameters)==null?void 0:u.docs,source:{originalSource:"{}",...(l=(d=i.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};const q=["Docs"];export{i as Docs,q as __namedExportsOrder,$ as default};
