import{j as e}from"./index-EuO1YB73.js";import{C as c,E as l}from"./ContentDisplay-D19Pf_Rz.js";import"./QueryField-HQujzfL2.js";import{A as m}from"./AdvancedQueryField-dmwBg1V3.js";import{C as u}from"./ChatWindow-DByjvp2V.js";import"./PdfViewer-fnhOmsH7.js";import{L as p}from"./provider-DjyZ7jvp.js";import{S as d}from"./SourcesDisplay-CsqesJNF.js";import"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./hooks-DNVfckEt.js";import"./MarkdownViewer-CI_XVU6M.js";import"./index-CuqvArXI.js";import"./DocumentPlusIcon-p4mHEHYC.js";import"./floating-ui.react-DaSCc_fA.js";import"./scaleFontSize-B9jNEFC7.js";import"./iframe-DTK7Rc-o.js";import"./tiny-invariant-CopsF_GD.js";const y=({errorType:a})=>e.jsx("div",{style:{width:"800px",height:"600px"},children:e.jsx(p,{config:{timeouts:{stream:2e3,request:5e3}},onAction:(n,h,f,x,g)=>{if(n.type==="ADD_USER_MESSAGE")switch(a){case"request-timeout":return{sources:new Promise(r=>{setTimeout(()=>{r([{id:crypto.randomUUID(),title:"Example Document",type:"pdf",metadata:{title:"Example Document"}}])},6e3)}),response:new Promise(r=>{setTimeout(()=>{r("This response won't be shown due to request timeout")},6e3)})};case"stream-timeout":return{sources:Promise.resolve([{id:crypto.randomUUID(),title:"Example Document",type:"pdf",metadata:{title:"Example Document"}}]),response:async function*(){yield{content:"Starting analysis... "},await new Promise(r=>setTimeout(r,200)),yield{content:"Processing content... "},await new Promise(r=>setTimeout(r,200)),yield{content:`

Processing additional details...`},await new Promise(r=>setTimeout(r,3e3)),yield{content:"This content will never appear due to stream timeout"}}()};case"operation-error":return{sources:(async()=>{throw await new Promise(r=>setTimeout(r,500)),new Error("Failed to connect to knowledge base")})(),response:async function*(){throw yield{content:"Initializing generation..."},await new Promise(r=>setTimeout(r,500)),new Error("Generation service unavailable")}()}}},children:e.jsxs("div",{className:"flex flex-col gap-4 h-full",children:[e.jsxs("div",{className:"flex flex-row h-full gap-4",children:[e.jsxs("div",{className:"flex-1 flex flex-col",children:[e.jsx("div",{className:"flex-1 overflow-auto",children:e.jsx(u,{})}),e.jsx("div",{children:e.jsx(m,{})})]}),e.jsx("div",{className:"w-1/3",children:e.jsx(d,{})})]}),e.jsx("div",{className:"h-1/3",children:e.jsx(c,{})}),e.jsx(l,{})]})})}),_={title:"Additional Features/Error Handling",component:y,parameters:{layout:"centered",docs:{description:{component:`
## Introduction

The \`Lexio\` library implements a comprehensive error handling system to ensure robustness and good user experience.
This guide demonstrates how to handle various types of errors and implement proper error handling in your application.

## Error Types & Handling

The \`Lexio\` library handles several types of errors:

**1. Operation Errors**
   - Concurrent operation attempts
   - Missing capabilities
   - Configuration errors
   - API failures

**2. Timeout Errors**
   - Request timeout: Overall operation timeout
   - Stream timeout: Gap between stream chunks

**3. Source Errors**
   - Source fetch failures
   - Invalid source content
   - Missing source configuration

These errors will be automatically displayed if you use the \`ErrorDisplay\` component inside your \`LexioProvider\`.
Additionally you can use the \`useStatus\` hook to access the current loading state and any error information. 
See \`hooks.ts\` for more details.

## Implementation Example

The following example demonstrates how to implement error handling in your application with the \`LexioProvider\`.
Timeouts can be configured via the \`config\` prop (see \`ProviderConfig\` for more details).

\`\`\`tsx
<LexioProvider
  config={{
    timeouts: {
      request: 30000,  // 30s for entire operation
      stream: 10000    // 10s between chunks
    }
  }}
  onAction={(action, messages, sources, activeSources, selectedSource) => {
    if (action.type === 'ADD_USER_MESSAGE') {
      try {
        return {
          sources: fetchSources(messages),
          response: generateResponse(messages)
        };
      } catch (error) {
        // Errors are automatically displayed via ErrorDisplay
        throw new Error(\`Operation failed: \${error.message}\`);
      }
    }
  }}
>
  <ChatWindow />
  <AdvancedQueryField />
  <SourcesDisplay />
  <ContentDisplay />
  <ErrorDisplay />
</LexioProvider>
\`\`\`

## Error Recovery

The system implements automatic state recovery:
- Message history preservation
- Workflow mode restoration
- Source state recovery

## Best Practices

**1. Always Include ErrorDisplay**
   - Add \`<ErrorDisplay />\` to show user-friendly error messages
   - Position it appropriately in your UI

**2. Configure Timeouts**
   - Set appropriate timeout values for your use case
   - Consider network latency and operation complexity

## Interactive Example
Try out different error scenarios using the controls below!
        `}}},tags:["autodocs"],argTypes:{errorType:{control:"radio",options:["request-timeout","stream-timeout","operation-error"],description:"Type of error to demonstrate",defaultValue:"request-timeout"}}},o={args:{errorType:"request-timeout"}};var t,s,i;o.parameters={...o.parameters,docs:{...(t=o.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    errorType: 'request-timeout'
  }
}`,...(i=(s=o.parameters)==null?void 0:s.docs)==null?void 0:i.source}}};const M=["Docs"];export{o as Docs,M as __namedExportsOrder,_ as default};
