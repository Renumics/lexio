import{j as t}from"./index-EuO1YB73.js";import{E as a}from"./ContentDisplay-D19Pf_Rz.js";import"./QueryField-HQujzfL2.js";import{A as c}from"./AdvancedQueryField-dmwBg1V3.js";import{C as d}from"./ChatWindow-DByjvp2V.js";import"./PdfViewer-fnhOmsH7.js";import{L as l}from"./provider-DjyZ7jvp.js";import"./SourcesDisplay-CsqesJNF.js";import"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./hooks-DNVfckEt.js";import"./MarkdownViewer-CI_XVU6M.js";import"./index-CuqvArXI.js";import"./DocumentPlusIcon-p4mHEHYC.js";import"./floating-ui.react-DaSCc_fA.js";import"./scaleFontSize-B9jNEFC7.js";import"./iframe-DTK7Rc-o.js";import"./tiny-invariant-CopsF_GD.js";const p=()=>t.jsx("div",{style:{width:"100%",height:"100%"},children:t.jsxs(l,{onAction:(o,m,u,h,y)=>{if(o.type==="ADD_USER_MESSAGE")return{sources:Promise.resolve([{id:crypto.randomUUID(),title:"Example Document",type:"pdf",relevance:.95,metadata:{author:"Documentation Team",page:3,_internal:"Hidden metadata"}}]),response:async function*(){yield{content:`### Analysis Result

`},await new Promise(e=>setTimeout(e,500)),yield{content:`Based on the document, here are the key points:

`},await new Promise(e=>setTimeout(e,500)),yield{content:`1. First important finding
`},await new Promise(e=>setTimeout(e,500)),yield{content:`2. Second key insight

`},await new Promise(e=>setTimeout(e,500)),yield{content:"**Conclusion**: This demonstrates streaming with markdown!",done:!0}}()};if(o.type==="SET_SELECTED_SOURCE"&&o.sourceObject)return console.log("Loading data for source:",o.sourceObject.title),{sourceData:new Promise(e=>{setTimeout(()=>{e(`# Example Content

This is the content of the selected source.`)},1e3)})}},children:[t.jsxs("div",{className:"flex flex-col gap-4 h-full w-[600px]",children:[t.jsx("div",{className:"flex-1",children:t.jsx(d,{markdown:!0})}),t.jsx("div",{children:t.jsx(c,{})})]}),t.jsx(a,{})]})}),L={title:"Basic Usage/Streaming Responses",component:p,parameters:{layout:"centered",docs:{description:{component:`
## Introduction

This guide demonstrates how to implement streaming responses and handle different action types in Lexio. Streaming allows you to provide real-time, incremental responses to users, creating a more engaging and responsive experience.

## Understanding Action Handlers

The \`onAction\` function is the central place to handle user interactions. It receives:

\`\`\`typescript
onAction(
  action: UserAction,           // The action that was triggered
  messages: Message[],          // All messages in the chat
  sources: Source[],            // All available sources
  activeSources: Source[] | null, // Currently active sources (null by default)
  selectedSource: Source | null // Currently selected source
) => ActionHandlerResponse | Promise<ActionHandlerResponse> | undefined
\`\`\`

## Implementing Streaming Responses

For streaming responses, return an \`AsyncIterable\` that yields chunks of the response:

\`\`\`typescript
if (action.type === 'ADD_USER_MESSAGE') {
  return {
    response: (async function* () {
      yield { content: "First part of the response" };
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      yield { content: "Second part of the response" };
      yield { content: "Final part", done: true }; // Mark as done
    })()
  };
}
\`\`\`

#### The StreamChunk Interface (for streaming responses)

Each chunk should conform to the \`StreamChunk\` interface:

\`\`\`typescript
interface StreamChunk {
  content?: string;   // Text to append to the response
  sources?: Source[]; // Optional sources to add during streaming
  done?: boolean;     // Set to true for the final chunk
}
\`\`\`

Let's explore each property in detail:

- **content**: Optional string that will be appended to the current response. This allows for incremental text generation, creating a typing-like effect. Markdown formatting is supported if you've enabled it in the ChatWindow component.

- **sources**: Optional array of Source objects that can be added during streaming. **This property can only be handled once in the \`AsyncIterable\` response.** Updates are not supported.

- **done**: Boolean flag that indicates the final chunk of the stream. When set to \`true\`, Lexio will:
  - Add the sources to the state
  - Mark the response as done

## Non-Streaming Responses

For non-streaming responses, return a Promise that resolves to a string:

\`\`\`typescript
if (action.type === 'ADD_USER_MESSAGE') {
  return {
    response: Promise.resolve("This is a non-streaming response")
  };
}
\`\`\`

## Example Implementation

\`\`\`tsx
<LexioProvider
  onAction={(action, messages, sources, activeSources, selectedSource) => {
    // Handle user messages
    if (action.type === 'ADD_USER_MESSAGE') {
      return {
        sources: Promise.resolve([
          {
            id: crypto.randomUUID(),
            title: "Example Document",
            type: "pdf",
            metadata: { author: "Documentation Team" }
          }
        ]),
        response: (async function* () {
          yield { content: "### Analysis Result\\n\\n" };
          yield { content: "Based on the document...\\n\\n" };
          yield { content: "**Conclusion**: This works!", done: true };
        })()
      };
    }
    
    // Handle source selection
    if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
      return {
        sourceData: fetchPdfData(action.sourceObject.id)
      };
    }
  }}
>
  <ChatWindow markdown={true} />
  <AdvancedQueryField />
</LexioProvider>
\`\`\`


### Try it out:
- Ask a question - notice how the response appears word by word with markdown formatting
- Select a source to see lazy loading in action
        `}}},tags:["autodocs"]},n={};var s,r,i;n.parameters={...n.parameters,docs:{...(s=n.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(i=(r=n.parameters)==null?void 0:r.docs)==null?void 0:i.source}}};const O=["Docs"];export{n as Docs,O as __namedExportsOrder,L as default};
