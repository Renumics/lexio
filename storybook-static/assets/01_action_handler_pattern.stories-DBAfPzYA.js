import{j as e}from"./index-EuO1YB73.js";import{r as c}from"./index-Cqyox1Tj.js";import{C as u}from"./ContentDisplay-D19Pf_Rz.js";import"./QueryField-HQujzfL2.js";import{A as p}from"./AdvancedQueryField-dmwBg1V3.js";import{C as l}from"./ChatWindow-DByjvp2V.js";import"./PdfViewer-fnhOmsH7.js";import{L as m,c as d}from"./provider-DjyZ7jvp.js";import{S as h}from"./SourcesDisplay-CsqesJNF.js";import"./index-D-LGQApf.js";import"./hooks-DNVfckEt.js";import"./MarkdownViewer-CI_XVU6M.js";import"./index-CuqvArXI.js";import"./DocumentPlusIcon-p4mHEHYC.js";import"./floating-ui.react-DaSCc_fA.js";import"./scaleFontSize-B9jNEFC7.js";import"./iframe-DTK7Rc-o.js";import"./tiny-invariant-CopsF_GD.js";const S=d({colors:{primary:"#1E88E5",secondary:"#64B5F6"}});function E(){return c.useCallback((s,R,g,U,_)=>{const r=[{title:"Example Source",type:"text",data:"Here is some relevant text from the example source."}];return s.type==="ADD_USER_MESSAGE"?{response:async function*(){yield{content:"Thanks for your question... "},await new Promise(o=>setTimeout(o,600)),yield{content:"Let me think for a moment... "},await new Promise(o=>setTimeout(o,600)),yield{content:"Here is a brief answer based on the sources above!",done:!0}}(),sources:Promise.resolve(r)}:s.type==="SEARCH_SOURCES"?{sources:Promise.resolve(r)}:{}},[])}const A=({children:s})=>e.jsx("div",{style:{width:"100%",maxWidth:"1200px",height:"800px",margin:"0 auto"},children:s}),f=()=>e.jsxs("div",{style:{display:"grid",height:"100%",gridTemplateColumns:"3fr 1fr",gridTemplateRows:"1fr auto 300px",gap:"20px",gridTemplateAreas:`
      "chat sources"
      "input sources"
      "viewer viewer"
    `},children:[e.jsx("div",{style:{gridArea:"chat",minHeight:0,overflow:"auto"},children:e.jsx(l,{})}),e.jsx("div",{style:{gridArea:"input"},children:e.jsx(p,{})}),e.jsx("div",{style:{gridArea:"sources",minHeight:0,overflow:"auto"},children:e.jsx(h,{})}),e.jsx("div",{style:{gridArea:"viewer",height:"300px"},children:e.jsx(u,{})})]}),y=()=>{const s=E();return e.jsx("div",{style:{width:"100%",height:"800px"},children:e.jsx(m,{onAction:s,theme:S,children:e.jsx(A,{children:e.jsx(f,{})})})})},W={title:"Basic Usage/The onAction() function",component:y,parameters:{layout:"centered",docs:{description:{component:`
## Understanding the Action Handler Pattern

The core of \`Lexio\` is built around a simple yet powerful \`ActionHandler\` pattern that processes user interactions and updates the UI state accordingly.
The \`onAction()\` function is the main entry point for this pattern. It is a function that receives user actions and returns appropriate responses.

## 1. Action Handler Basics

The \`onAction()\` function is a function that receives the user action \`action\`, the current messages history \`messsages\`, the current sources \`sources\`, 
and returns an appropriate respons by returning an \`ActionHandlerResponse\` object that satisfies the type of the action.

\`\`\`typescript
const onAction = (action: UserAction, messages: Message[], sources: Source[], ...) => {
  if (action.type === 'ADD_USER_MESSAGE') {
    return {
      response: streamingResponse(),  // AI response
      sources: Promise.resolve(sources)  // Retrieved sources
    } satisfies AddUserMessageActionResponse;
  }
}
\`\`\`

In the example above, the \`onAction()\` function checks if the action is an \`ADD_USER_MESSAGE\`. If it is, it returns an \`ActionHandlerResponse\` object that satisfies the \`AddUserMessageActionResponse\` type.
Depending on the action type, different properties can be present in the \`ActionHandlerResponse\` object.

## 2. Core Actions

The system responds to these key actions:

- \`ADD_USER_MESSAGE\`: When users send messages (accepts response, sources, setUserMessage as return values)
- \`SEARCH_SOURCES\`: When users search for sources (accepts sources as return value)
- \`CLEAR_MESSAGES\`: Resets the current chat history
- \`SET_ACTIVE_MESSAGE\`: Change which message is currently active
- \`SET_ACTIVE_SOURCES\`: Update active source selection
- \`SET_SELECTED_SOURCE\`: Select a specific source to be displayed in the \`ContentDisplay\` component (accepts sourceData as return value)
- \`CLEAR_SOURCES\`: Remove all sources from the current context
- \`SET_FILTER_SOURCES\`: Apply filters to the source list
- \`RESET_FILTER_SOURCES\`: Clear all source filters

Each action type has specific return values defined in the \`allowedActionReturnValues\` object in \`rag-state.ts\`.

\`\`\`typescript
const allowedActionReturnValues: Record<UserAction['type'], string[]> = {
    ADD_USER_MESSAGE: ['response', 'sources', 'setUserMessage', 'followUpAction'],
    SET_ACTIVE_MESSAGE: ['followUpAction'],
    CLEAR_MESSAGES: ['followUpAction'],
    SEARCH_SOURCES: ['sources', 'followUpAction'],
    CLEAR_SOURCES: ['followUpAction'],
    SET_ACTIVE_SOURCES: ['followUpAction'],
    SET_SELECTED_SOURCE: ['sourceData', 'followUpAction'],
    SET_FILTER_SOURCES: ['followUpAction'],
    RESET_FILTER_SOURCES: ['followUpAction']
};
\`\`\`

Learn more about the ActionHandler pattern and followUpActions in X.

## Example Implementation

This story demonstrates a basic action handler that:
- Streams AI responses for user messages
- Returns mock sources for searches
- Shows different response patterns based on interaction count

\`\`\`tsx
const ExampleImplementation = () => {
  const onAction = (action: UserAction, messages: Message[], sources: Source[], ...) => {
    // If the user added a new message in the chat
    if (action.type === 'ADD_USER_MESSAGE') {
      // Return a streaming response + a list of sources
      return {
        response: (async function* () {
          yield { content: 'Thanks for your question... ' };
          await new Promise(resolve => setTimeout(resolve, 600));
          yield { content: 'Let me think for a moment... ' };
          await new Promise(resolve => setTimeout(resolve, 600));
          yield { content: 'Here is a brief answer based on the sources above!', done: true };
        })(),
        sources: Promise.resolve(mockSources),
      };
    }

    // If the user triggered a source search
    if (action.type === 'SEARCH_SOURCES') {
      // Return the same mock sources asynchronously
      return {
        sources: Promise.resolve(mockSources),
      };
    }

    // Default case: no special handling
    return {};
  };

  return (
    <LexioProvider onAction={onAction}>
      <ChatWindow />
      <AdvancedQueryField />
      <SourcesDisplay />
      <ContentDisplay />
      <ErrorDisplay />
    </LexioProvider>
  );
};
\`\`\`

Try it out below and explore the source code for more details.
        `}}},tags:["autodocs"]},t={};var n,i,a;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:"{}",...(a=(i=t.parameters)==null?void 0:i.docs)==null?void 0:a.source}}};const B=["Docs"];export{t as Docs,B as __namedExportsOrder,W as default};
