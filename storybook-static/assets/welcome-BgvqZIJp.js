import{j as e}from"./index-EuO1YB73.js";import{useMDXComponents as t}from"./index-BLKynSmM.js";import{M as r}from"./index-DvK65IPP.js";import{R as o}from"./shot_lexio_llama_index-Bi_S1jeq.js";import"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./iframe-DTK7Rc-o.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";function s(i){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...t(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"Welcome"}),`
`,e.jsx(n.h1,{id:"-welcome-to-lexio",children:"🚀 Welcome to Lexio"}),`
`,e.jsx(n.p,{children:"Lexio is a powerful React library for building Retrieval-Augmented Generation (RAG) interfaces. It handles complex workflows out of the box while remaining simple to use and highly customizable."}),`
`,e.jsx(n.p,{children:"It supports multiple document types (PDF, HTML, Markdown, Text) with advanced features like streaming responses, source highlighting, and a comprehensive state management system."}),`
`,e.jsx(n.p,{children:"Developers can use ready-made components or easily build custom ones using React hooks and the flexible action handler pattern."}),`
`,e.jsx("img",{src:o,alt:"Lexio UI Example"}),`
`,e.jsx(n.h2,{id:"quick-start",children:"Quick Start"}),`
`,e.jsx(n.p,{children:"You can install the library with npm or yarn:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`npm install lexio
`})}),`
`,e.jsxs(n.p,{children:["To use the GUI components, you need to provide an action handler to the ",e.jsx(n.code,{children:"LexioProvider"})," context:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { 
  LexioProvider, 
  ChatWindow, 
  AdvancedQueryField, 
  SourcesDisplay, 
  ContentDisplay, 
  ErrorDisplay 
} from 'lexio';

const App = () => (
  <LexioProvider
    onAction={(action, messages, sources, activeSources, selectedSource) => {
      // Handle user messages
      if (action.type === 'ADD_USER_MESSAGE') {
        return {
          // Return sources as a Promise that resolves to Source[]
          sources: Promise.resolve([
            {
              id: crypto.randomUUID(),
              title: "Example Document",
              type: "pdf",
              relevance: 0.95,
              metadata: {
                author: "Documentation Team",
                page: 3
              }
            }
          ]),
          // Return a response as a Promise or use streaming
          response: Promise.resolve("This is a sample response based on the retrieved documents.")
        };
      }
      
      // Handle source selection
      if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
        return {
          sourceData: fetchSourceContent(action.sourceObject.id)
        };
      }
      
      return undefined;
    }}
  >
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <ChatWindow markdown={true} />
      </div>
      <div>
        <AdvancedQueryField />
      </div>
      <div className="flex">
        <SourcesDisplay />
        <ContentDisplay />
      </div>
    </div>
    <ErrorDisplay />
  </LexioProvider>
);
`})}),`
`,e.jsxs(n.p,{children:["Follow the ",e.jsx(n.a,{href:"../?path=/docs/basic-usage-01-action-handler-pattern--docs",children:"Basic Usage"})," guides to learn more about the library."]}),`
`,e.jsx(n.h2,{id:"key-features",children:"Key Features"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Action Handler Pattern"}),": A flexible pattern for handling user interactions and state updates"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Powerful Components"}),": Pre-built components for chat interfaces, source selection, and document viewing with highlighting"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Integrated State Management"}),": Transparent state handling for seamless interaction between components"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Streaming Responses"}),": Support for real-time, incremental responses with source updates"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Comprehensive Error Handling"}),": Built-in error handling and timeout management"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Highly Customizable"}),": Theming and component customization options"]}),`
`]}),`
`,e.jsx(n.h2,{id:"advantages",children:"Advantages"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Quick Implementation"}),": Get your RAG interface running with just a few lines of code"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Production Ready"}),": Built for integration into mature web applications"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Best Practices Built-in"}),": Follows RAG implementation patterns from real-world applications"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Framework Agnostic Backend"}),": Works with any backend RAG implementation (LangChain, LlamaIndex, custom solutions)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Flexible Architecture"}),": Adapt to various use cases from simple chat to complex document analysis"]}),`
`]}),`
`,e.jsx(n.h2,{id:"target-groups",children:"Target Groups"}),`
`,e.jsx(n.h3,{id:"-startups",children:"🚀 Startups"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Rapid prototyping capabilities"}),`
`,e.jsx(n.li,{children:"Quick time-to-market"}),`
`,e.jsx(n.li,{children:"Flexible customization options"}),`
`]}),`
`,e.jsx(n.h3,{id:"-enterprise",children:"🌐 Enterprise"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Enterprise-grade reliability"}),`
`,e.jsx(n.li,{children:"Seamless integration with existing systems"}),`
`,e.jsx(n.li,{children:"Production-ready components"}),`
`,e.jsx(n.li,{children:"Professional support options"}),`
`]}),`
`,e.jsx(n.h3,{id:"-ai-developers",children:"👨‍💻 AI Developers"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Full control over RAG pipeline"}),`
`,e.jsx(n.li,{children:"Custom component development"}),`
`,e.jsx(n.li,{children:"Advanced configuration options"}),`
`,e.jsx(n.li,{children:"Direct access to underlying state"}),`
`]})]})}function j(i={}){const{wrapper:n}={...t(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{j as default};
