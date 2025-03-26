import{j as e}from"./index-EuO1YB73.js";import{r as c}from"./index-Cqyox1Tj.js";import{C as u}from"./ContentDisplay-D19Pf_Rz.js";import"./QueryField-HQujzfL2.js";import{A as m}from"./AdvancedQueryField-dmwBg1V3.js";import{C as f}from"./ChatWindow-DByjvp2V.js";import"./PdfViewer-fnhOmsH7.js";import{L as y}from"./provider-DjyZ7jvp.js";import{u as h,a as v}from"./hooks-DNVfckEt.js";import{S}from"./SourcesDisplay-CsqesJNF.js";import"./index-D-LGQApf.js";import"./MarkdownViewer-CI_XVU6M.js";import"./index-CuqvArXI.js";import"./DocumentPlusIcon-p4mHEHYC.js";import"./floating-ui.react-DaSCc_fA.js";import"./scaleFontSize-B9jNEFC7.js";import"./iframe-DTK7Rc-o.js";import"./tiny-invariant-CopsF_GD.js";const g=({children:r})=>e.jsx("div",{style:{width:"100%",maxWidth:"1200px",height:"1000px",margin:"0 auto"},children:r}),w=({styleOverrides:r})=>e.jsxs("div",{style:{display:"grid",height:"100%",gridTemplateColumns:"3fr 1fr",gridTemplateRows:"1fr auto 400px",gap:"20px",gridTemplateAreas:`
      "chat sources"
      "input sources"
      "viewer viewer"
    `},children:[e.jsx("div",{style:{gridArea:"chat",minHeight:0,overflow:"auto"},children:e.jsx(f,{styleOverrides:{fontSize:"1.25rem",color:"red"}})}),e.jsx("div",{style:{gridArea:"input"},children:e.jsx(m,{})}),e.jsx("div",{style:{gridArea:"sources",minHeight:0,overflow:"auto"},children:e.jsx(S,{styleOverrides:r})}),e.jsx("div",{style:{gridArea:"viewer",height:"400px"},children:e.jsx(u,{})})]}),x=[{id:crypto.randomUUID(),role:"user",content:"What is RAG?"}],b=async()=>{try{const t=await fetch("https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf");if(!t.ok)throw new Error(`Failed to fetch PDF: ${t.status} ${t.statusText}`);const o=await t.arrayBuffer();return new Uint8Array(o)}catch(r){return console.error("Error fetching PDF:",r),new Uint8Array([37,80,68,70,45,49,46,53,10])}},C=[{title:"Example PDF",type:"pdf",relevance:.95,metadata:{title:"Understanding RAG Systems",page:2}},{title:"Best Practices",type:"html",relevance:.82,metadata:{type:"Tips",lastUpdated:"2024-03-20"},data:`<div class="content">
      <h2>Quick Tips</h2>
      <ul>
        <li>Always validate your data sources</li>
        <li>Monitor retrieval performance</li>
        <li>Keep your knowledge base updated</li>
      </ul>
    </div>`}],E=()=>{const{addUserMessage:r}=h("LexioProvider"),{setActiveSources:t,sources:o}=v("LexioProvider");return c.useEffect(()=>{const i=setTimeout(()=>{r(x[0].content)},0);return()=>clearTimeout(i)},[]),c.useEffect(()=>{o.length>0&&t([o[0].id])},[o]),null},D=({styleOverrides:r})=>e.jsx(g,{children:e.jsxs(y,{onAction:(t,o,i,A,T)=>{var a,n;if(t.type==="ADD_USER_MESSAGE"&&o.length===0)return{response:Promise.resolve("RAG is a technology that allows you to search for information in a database of documents."),sources:Promise.resolve(C)};if(t.type==="ADD_USER_MESSAGE"&&o.length>0)return{response:Promise.resolve("I am sorry, I don't know the answer to that question.")};if(t.type==="SET_SELECTED_SOURCE")return((a=t.sourceObject)==null?void 0:a.type)==="pdf"?{sourceData:b()}:{sourceData:Promise.resolve((n=t.sourceObject)==null?void 0:n.data)}},children:[e.jsx(E,{}),e.jsx(w,{styleOverrides:r})]})}),$={title:"Additional Features/ Component Style Overrides",component:D,parameters:{layout:"centered",docs:{description:{component:`
## Introduction

While theming provides a way to customize the global appearance of your UI components, sometimes you need more fine-grained control over individual components. Each component in the \`Lexio\` library accepts a \`styleOverrides\` prop that allows you to customize its appearance. 
Each component has its own set of style properties that can be overridden. Refer to the interfaces of each component for available options.

Components that support style overrides:
- ChatWindow: ChatWindowStyles
- QueryField: QueryFieldStyles
- AdvancedQueryField: AdvancedQueryFieldStyles
- SourcesDisplay: SourcesDisplayStyles
- ContentDisplay: ContentDisplayStyles
- PDFViewer: PdfViewerStyles
- HTMLViewer: HtmlViewerStyles
- ViewerToolbar: ViewerToolbarStyles

#### Example: ChatWindow and ChatWindowStyles

\`\`\`typescript
export interface ChatWindowStyles extends React.CSSProperties {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    fontFamily?: string;
    fontSize?: string;
    borderRadius?: string;
}

<ChatWindow styleOverrides={{ fontSize: '1.25rem', color: 'red' }} />
\`\`\`

## Using Style Overrides

To override styles for a component, pass a \`styleOverrides\` object with the desired properties:

\`\`\`typescript
// define style overrides for the ChatWindow component directly
<ChatWindow styleOverrides={{ fontSize: '1.25rem', color: 'red' }} />

// define a subset of style overrides for the SourcesDisplay component
const styleOverrides = {
    backgroundColor: '#ffffff',
    activeSourceBackground: '#f7fafc',
    activeSourceBorderColor: '#4a90e2',
    metadataTagBackground: '#edf2f7',
    sourceTypeBackground: '#ebf5ff',
    fontSize: '0.9rem',
}

// pass the styleOverrides object to the SourcesDisplay component
<SourcesDisplay styleOverrides={styleOverrides} />
\`\`\`

## Tips for Style Overrides

- **Component-Specific Properties**: Each component has its own set of style properties that can be overridden. Refer to the interfaces above for available options.

- **Theme Consistency**: While you can override styles for individual components, try to maintain consistency with your theme's color palette and design tokens. Unset properties will fall back to the global theme.

## Example

Check out the interactive example below to see how different style overrides affect the components. The example shows custom styling for the ChatWindow. The styling of the SourcesDisplay component can be changed interactively with the \`Control\` value.
`}}},tags:["autodocs"]},s={args:{styleOverrides:{backgroundColor:"#e0f7fa",activeSourceBackground:"#b2ebf2",activeSourceBorderColor:"#00acc1",metadataTagBackground:"#b3e5fc",sourceTypeBackground:"#e1f5fe",fontSize:"0.9rem"}}};var l,d,p;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    styleOverrides: {
      backgroundColor: '#e0f7fa',
      activeSourceBackground: '#b2ebf2',
      activeSourceBorderColor: '#00acc1',
      metadataTagBackground: '#b3e5fc',
      sourceTypeBackground: '#e1f5fe',
      fontSize: '0.9rem'
    }
  }
}`,...(p=(d=s.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};const q=["Docs"];export{s as Docs,q as __namedExportsOrder,$ as default};
