import{j as e}from"./index-EuO1YB73.js";import{r as i}from"./index-Cqyox1Tj.js";import{C as c}from"./ContentDisplay-D19Pf_Rz.js";import"./QueryField-HQujzfL2.js";import{A as d}from"./AdvancedQueryField-dmwBg1V3.js";import{C as m}from"./ChatWindow-DByjvp2V.js";import"./PdfViewer-fnhOmsH7.js";import{L as p,c as l}from"./provider-DjyZ7jvp.js";import{u}from"./hooks-DNVfckEt.js";import{S as h}from"./SourcesDisplay-CsqesJNF.js";import"./index-D-LGQApf.js";import"./MarkdownViewer-CI_XVU6M.js";import"./index-CuqvArXI.js";import"./DocumentPlusIcon-p4mHEHYC.js";import"./floating-ui.react-DaSCc_fA.js";import"./scaleFontSize-B9jNEFC7.js";import"./iframe-DTK7Rc-o.js";import"./tiny-invariant-CopsF_GD.js";const g=l({colors:{primary:"#1E88E5",secondary:"#64B5F6"}}),f=({children:t})=>e.jsx("div",{style:{width:"100%",maxWidth:"1200px",height:"800px",margin:"0 auto"},children:t}),y=()=>e.jsxs("div",{style:{display:"grid",height:"100%",gridTemplateColumns:"3fr 1fr",gridTemplateRows:"1fr auto 300px",gap:"20px",gridTemplateAreas:`
      "chat sources"
      "input sources"
      "viewer viewer"
    `},children:[e.jsx("div",{style:{gridArea:"chat",minHeight:0,overflow:"auto"},children:e.jsx(m,{})}),e.jsx("div",{style:{gridArea:"input"},children:e.jsx(d,{})}),e.jsx("div",{style:{gridArea:"sources",minHeight:0,overflow:"auto"},children:e.jsx(h,{})}),e.jsx("div",{style:{gridArea:"viewer",height:"300px"},children:e.jsx(c,{})})]}),x=[{id:crypto.randomUUID(),role:"user",content:"How can I implement RAG in my application?"}],b=()=>{const{addUserMessage:t}=u("LexioProvider");return i.useEffect(()=>{const s=setTimeout(()=>{t(x[0].content)},0);return()=>clearTimeout(s)},[]),null},A=()=>e.jsx("div",{style:{width:"100%",height:"800px"},children:e.jsxs(p,{theme:g,onAction:(t,s)=>{if(t.type==="ADD_USER_MESSAGE")return{response:Promise.resolve(`To implement RAG in your application, you'll need to follow these steps:

1. Set up a document store for your knowledge base
2. Create embeddings for your documents
3. Implement a retrieval mechanism
4. Connect to an LLM for generation

Would you like more details on any specific step?`)};if(t.type==="SET_MESSAGE_FEEDBACK")return console.log("Feedback received:",{messageId:t.messageId,feedback:t.feedback,comment:t.comment,messageContent:t.messageContent}),{}},children:[e.jsx(f,{children:e.jsx(y,{})}),e.jsx(b,{})]})}),R={title:"Additional Features/User Feedback",component:A,parameters:{layout:"centered",docs:{description:{component:`
## User Feedback System

Lexio provides a built-in feedback system that allows users to rate AI responses and provide additional context:

- **Thumbs Up/Down**: Users can quickly indicate if a response was helpful or not
- **Comments**: Users can add detailed feedback explaining why a response was or wasn't helpful

This feedback system helps improve AI responses over time and provides valuable insights for developers.

### Implementation Details

The feedback system is implemented through:

1. **Feedback Component**: A UI component that appears with each assistant message
2. **SET_MESSAGE_FEEDBACK Action**: An action dispatched when users provide feedback
3. **useMessageFeedback Hook**: A hook that components can use to submit feedback programmatically

### Handling Feedback in onAction

You can process feedback in your \`onAction\` handler:

\`\`\`tsx
const onAction = (action, messages) => {
  if (action.type === 'SET_MESSAGE_FEEDBACK') {
    // Log feedback to analytics
    analytics.logFeedback({
      messageId: action.messageId,
      feedback: action.feedback,
      comment: action.comment
    });
    
    // Or store in database
    saveFeedbackToDatabase(action.messageId, action.feedback, action.comment);
    
    return {};
  }
};
\`\`\`

Try interacting with the chat below and look for the feedback options that appear with each AI message.
        `}}},tags:["autodocs"]},o={};var a,r,n;o.parameters={...o.parameters,docs:{...(a=o.parameters)==null?void 0:a.docs,source:{originalSource:"{}",...(n=(r=o.parameters)==null?void 0:r.docs)==null?void 0:n.source}}};const P=["Docs"];export{o as Docs,P as __namedExportsOrder,R as default};
