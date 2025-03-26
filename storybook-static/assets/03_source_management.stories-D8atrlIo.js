import{j as e}from"./index-EuO1YB73.js";import{C as d,E as l}from"./ContentDisplay-D19Pf_Rz.js";import"./QueryField-HQujzfL2.js";import{A as u}from"./AdvancedQueryField-dmwBg1V3.js";import{C as h}from"./ChatWindow-DByjvp2V.js";import"./PdfViewer-fnhOmsH7.js";import{L as m}from"./provider-DjyZ7jvp.js";import{S as y}from"./SourcesDisplay-CsqesJNF.js";import"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./hooks-DNVfckEt.js";import"./MarkdownViewer-CI_XVU6M.js";import"./index-CuqvArXI.js";import"./DocumentPlusIcon-p4mHEHYC.js";import"./floating-ui.react-DaSCc_fA.js";import"./scaleFontSize-B9jNEFC7.js";import"./iframe-DTK7Rc-o.js";import"./tiny-invariant-CopsF_GD.js";const f=async o=>{try{const r=await fetch(o);if(!r.ok)throw new Error(`Failed to fetch PDF: ${r.status} ${r.statusText}`);const i=await r.arrayBuffer();return new Uint8Array(i)}catch(r){return console.error("Error fetching PDF:",r),new Uint8Array([37,80,68,70,45,49,46,53,10])}},g=()=>e.jsx("div",{style:{width:"100%",height:"100%"},children:e.jsxs(m,{onAction:(o,r,i,w,S)=>{var s;if(o.type==="ADD_USER_MESSAGE")return{response:async function*(){yield{content:`### Analysis Result

`},await new Promise(t=>setTimeout(t,500)),yield{content:`Based on the document, here are the key points:

`},await new Promise(t=>setTimeout(t,500)),yield{content:`1. First important finding
`},await new Promise(t=>setTimeout(t,500)),yield{content:`2. Second key insight

`},await new Promise(t=>setTimeout(t,500)),yield{content:"**Conclusion**: This demonstrates both streaming *and* markdown support!",done:!0}}(),sources:Promise.resolve([{id:crypto.randomUUID(),title:"Example PDF Document",type:"pdf",relevance:.95,metadata:{author:"Documentation Team",page:3,_href:"https://arxiv.org/pdf/2005.11401",_internal:"Hidden metadata with underscore prefix"},highlights:[{page:3,rect:{top:.2,left:.1,width:.8,height:.05}}]},{id:crypto.randomUUID(),title:"Example Text Document",type:"text",description:"A sample text document for demonstration",relevance:.82,href:"https://renumics.com",metadata:{section:"Introduction",_lastUpdated:"2023-05-15"}}])};if(o.type==="SET_SELECTED_SOURCE"&&o.sourceObject)return console.log("Loading data for source:",o.sourceObject.title),o.sourceObject.type==="pdf"?{sourceData:f(((s=o.sourceObject.metadata)==null?void 0:s._href)??"")}:{sourceData:new Promise(t=>{setTimeout(()=>{t(`<div>
                    <h2>Example Content</h2>
                    <p>This content was loaded lazily when the source was selected.</p>
                    <p>In a real application, you would fetch this from your backend.</p>
                  </div>`)},1e3)})}},children:[e.jsxs("div",{style:{display:"grid",height:"100%",gridTemplateColumns:"3fr 1fr",gridTemplateRows:"1fr auto 200px",gap:"20px",gridTemplateAreas:`
          "chat sources"
          "input sources"
          "viewer viewer"
        `},children:[e.jsx("div",{style:{gridArea:"chat",minHeight:0,overflow:"auto"},children:e.jsx(h,{markdown:!0})}),e.jsx("div",{style:{gridArea:"input"},children:e.jsx(u,{})}),e.jsx("div",{style:{gridArea:"sources",minHeight:0,overflow:"auto"},children:e.jsx(y,{showSearch:!1})}),e.jsx("div",{style:{gridArea:"viewer",height:"200px"},children:e.jsx(d,{})})]}),e.jsx(l,{})]})}),I={title:"Basic Usage/Source Management and Lazy Loading",component:g,parameters:{layout:"centered",docs:{description:{component:`
## Introduction

This guide demonstrates how to implement streaming responses and effectively manage \`Source\`s in \`Lexio\`.

## Efficient Source Management

When working with \`Source\`s, it's important to consider performance and user experience:

### Lightweight Source Objects

When returning \`Source\`s from your backend, consider omitting the \`.data\` property initially to reduce network traffic:

\`\`\`typescript
// Return lightweight source objects without data
return {
  sources: Promise.resolve([
    {
      title: "Example Document",
      type: "pdf",
      description: "A sample document for demonstration", // Optional description will be shown below the title
      href: "https://example.com/document.pdf",           // Optional link to source will be shown next to the title and opens in a new tab
      relevance: 0.95,
      // data is omitted initially to reduce payload size
      metadata: {
        author: "Documentation Team",
        page: 3,                                          // Will be used from ContentDisplay when source is selected
        _internal: "Hidden metadata with underscore prefix", // Hidden from display
        _sourceId: "doc-123"                              // Hidden from display -> use for lazy loading
      }
    }
  ])
};
\`\`\`

### Source Properties

The \`Source\` object supports several properties to enhance the user experience:

**1. Description**: The optional \`description\` property provides additional context about the source  
**2. Href**: The optional \`href\` property creates a clickable link to the given URL  
**3. Relevance**: The \`relevance\` property (0-1) indicates how relevant a source is to the query  
**4. Highlights**: For PDF sources, the \`highlights\` array specifies regions to highlight  

\`\`\`typescript
{
  title: "Example Document",
  description: "A comprehensive analysis of the topic",  // Shown below the title
  href: "https://example.com/document.pdf",             // Creates a clickable link
  relevance: 0.95,                                      // Displayed as a relevance bar
  highlights: [
    {
      page: 3,
      rect: { top: 0.2, left: 0.1, width: 0.8, height: 0.05 }
    }
  ]
}
\`\`\`

### Source Metadata

The \`metadata\` property allows you to attach additional information to \`Source\`s:

**1. Display Properties**: Regular metadata properties are displayed in the SourcesDisplay component  
**2. Hidden Properties**: Properties with names starting with underscore (e.g., \`_internal\`) are hidden from display  
**3. Special Properties**: For PDF sources, the \`page\` and \`_page\` property specifies which page to display initially  

\`\`\`typescript
{
  metadata: {
    author: "Documentation Team",    // Displayed in UI
    page: 3,                         // Controls initial PDF page
    _page: 3,                        // Also controls initial PDF page!
    _internal: "Hidden metadata",    // Hidden from UI (starts with _)
    _sourceId: "doc-123"             // Can be used for internal reference
  }
}
\`\`\`

### Relevance Scores

The \`relevance\` property (0-1) indicates how relevant a source is to the query. The score is displayed as a bar in the SourcesDisplay component.

\`\`\`typescript
{
  relevance: 0.95  // 95% relevance score
}
\`\`\`

## Lazy Loading Source Content

To optimize performance, you can load source content only when needed using the \`SET_SELECTED_SOURCE\` action:

\`\`\`typescript
// In your onAction handler:
if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
  // Return a Promise that resolves to the source data
  return {
    sourceData: fetchDataForSource(action.sourceObject.metadata._sourceId)  // Use metadata for lookup
  };
}
\`\`\`

The \`sourceData\` property must be a Promise that resolves to either:
- a \`string\` for HTML, text, or markdown content, or
- a \`Uint8Array\` for PDF binary data

This allows Lexio to show a loading state while your data is being fetched.


## Using Source State in onAction

Your \`onAction\` handler receives the current state, which you can use to make decisions:

\`\`\`typescript
const onAction = (
  action: UserAction,
  messages: Message[],
  sources: Source[],          // All available sources
  activeSources: Source[],    // Currently active sources
  selectedSource: Source | null  // Currently selected source
) => {
  // Example: Use active sources to provide context for a follow-up question
  if (action.type === 'ADD_USER_MESSAGE' && activeSources.length > 0) {
    // Generate a response that references active sources
    return {
      response: generateResponseWithContext(action.message, activeSources)
    };
  }
  
  // Example: Update content when a source is selected
  if (action.type === 'SET_SELECTED_SOURCE') {
    // Load content for the selected source
    return {
      sourceData: fetchSourceContent(action.sourceId)
    };
  }
};
\`\`\`

### Try it out:

Try the interactive example to see:

**1.** Streaming responses with markdown formatting  
**2.** Source metadata display (with hidden properties)  
**3.** Lazy loading of source content when selected  
**4.** Description and href properties in action
        `}}},tags:["autodocs"]},a={};var n,c,p;a.parameters={...a.parameters,docs:{...(n=a.parameters)==null?void 0:n.docs,source:{originalSource:"{}",...(p=(c=a.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};const z=["Docs"];export{a as Docs,z as __namedExportsOrder,I as default};
