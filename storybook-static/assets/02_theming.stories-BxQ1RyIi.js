import{j as e}from"./index-EuO1YB73.js";import{C as y}from"./ContentDisplay-D19Pf_Rz.js";import"./QueryField-HQujzfL2.js";import{A as f}from"./AdvancedQueryField-dmwBg1V3.js";import{C as g}from"./ChatWindow-DByjvp2V.js";import"./PdfViewer-fnhOmsH7.js";import{c as u,d as x,L as F}from"./provider-DjyZ7jvp.js";import{u as T,a as v}from"./hooks-DNVfckEt.js";import{S}from"./SourcesDisplay-CsqesJNF.js";import{r as m}from"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./MarkdownViewer-CI_XVU6M.js";import"./index-CuqvArXI.js";import"./DocumentPlusIcon-p4mHEHYC.js";import"./floating-ui.react-DaSCc_fA.js";import"./scaleFontSize-B9jNEFC7.js";import"./iframe-DTK7Rc-o.js";import"./tiny-invariant-CopsF_GD.js";const h=u({colors:{primary:"#FF7043",secondary:"#FFB74D",contrast:"#FFFFFF",background:"#FFF3E0",secondaryBackground:"#FFFFFF",toolbarBackground:"#F4511E",text:"#3E2723",secondaryText:"#5D4037",lightText:"#8D6E63"},typography:{fontFamily:'"Lato", sans-serif',fontSizeBase:"18px",lineHeight:"1.8"},componentDefaults:{borderRadius:"0.5rem",padding:"1.2rem"}}),w=u({colors:{primary:"#6200EA",secondary:"#B388FF",contrast:"#FFFFFF",background:"#F5F5F5",secondaryBackground:"#FFFFFF",toolbarBackground:"#651FFF",text:"#212121",secondaryText:"#616161",lightText:"#9E9E9E"},typography:{fontFamily:'"Inter", system-ui, sans-serif',fontSizeBase:"16px",lineHeight:"1.75"},componentDefaults:{borderRadius:"1.5rem",padding:"1.5rem"}}),A=({children:r})=>e.jsx("div",{style:{width:"100%",maxWidth:"1200px",height:"1000px",margin:"0 auto"},children:r}),D=()=>e.jsxs("div",{style:{display:"grid",height:"100%",gridTemplateColumns:"3fr 1fr",gridTemplateRows:"1fr auto 400px",gap:"20px",gridTemplateAreas:`
      "chat sources"
      "input sources"
      "viewer viewer"
    `},children:[e.jsx("div",{style:{gridArea:"chat",minHeight:0,overflow:"auto"},children:e.jsx(g,{})}),e.jsx("div",{style:{gridArea:"input"},children:e.jsx(f,{})}),e.jsx("div",{style:{gridArea:"sources",minHeight:0,overflow:"auto"},children:e.jsx(S,{})}),e.jsx("div",{style:{gridArea:"viewer",height:"400px"},children:e.jsx(y,{})})]}),E=[{id:crypto.randomUUID(),role:"user",content:"What is RAG?"}],b=[{id:crypto.randomUUID(),title:"RAG Whitepaper",type:"pdf",relevance:.95,metadata:{title:"Understanding RAG Systems",page:2,author:"Research Team"}},{id:crypto.randomUUID(),title:"Implementation Guide",type:"html",relevance:.88,metadata:{section:"Setup",difficulty:"Intermediate"}},{id:crypto.randomUUID(),title:"Best Practices",type:"text",relevance:.82,data:`
## Quick Tips
- Always validate your data sources
- Monitor retrieval performance
- Keep your knowledge base updated
`,metadata:{type:"Tips",lastUpdated:"2024-03-20"}}],C=async()=>{try{const t=await fetch("https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf");if(!t.ok)throw new Error(`Failed to fetch PDF: ${t.status} ${t.statusText}`);const o=await t.arrayBuffer();return new Uint8Array(o)}catch(r){return console.error("Error fetching PDF:",r),new Uint8Array([37,80,68,70,45,49,46,53,10])}},j=()=>{const{addUserMessage:r}=T("LexioProvider"),{setActiveSources:t,sources:o}=v("LexioProvider");return m.useEffect(()=>{const a=setTimeout(()=>{r(E[0].content)},0);return()=>clearTimeout(a)},[]),m.useEffect(()=>{o.length>0&&t([o[0].id])},[o]),null},P=({customTheme:r})=>e.jsx(A,{children:e.jsxs(F,{theme:r,onAction:(t,o,a,B,U)=>{var i,n,c;if(t.type==="ADD_USER_MESSAGE")return{response:Promise.resolve("I've found relevant information about RAG systems from multiple sources..."),sources:Promise.resolve(b)};if(t.type==="SET_SELECTED_SOURCE")return((i=t.sourceObject)==null?void 0:i.type)==="pdf"?{sourceData:C()}:((n=t.sourceObject)==null?void 0:n.type)==="html"?{sourceData:Promise.resolve(`
                                <div style="padding: 20px; font-family: system-ui;">
                                  <h1>RAG Implementation Guide</h1>
                                  <h2>Setup Instructions</h2>
                                  <p>Follow these steps to implement a RAG system in your application:</p>
                                  <ol>
                                    <li>Set up your document store</li>
                                    <li>Implement the retrieval mechanism</li>
                                    <li>Configure the generation model</li>
                                    <li>Connect the components</li>
                                  </ol>
                                  <p>For more details, refer to the API documentation.</p>
                                </div>
                                `)}:{sourceData:Promise.resolve((c=t.sourceObject)==null?void 0:c.data)}},children:[e.jsx(j,{}),e.jsx(D,{})]})}),V={title:"Additional Features/Global Theme",component:P,parameters:{layout:"centered",docs:{description:{component:`
## Introduction

The \`Lexio\` library provides a flexible theming system that allows you to customize the look and feel of all components. You can either use the default theme, modify specific parts of it, or create an entirely new theme.

## Theme Structure

The theme consists of three main parts:

\`\`\`typescript
interface Theme {
  colors: Colors;                       // Color palette
  typography: Typography;               // Font settings
  componentDefaults: ComponentDefaults; // Default component styles
}
\`\`\`

### 1. Colors

The color system includes:

\`\`\`typescript
interface Colors {
  primary: string;            // Primary brand color
  secondary: string;          // Secondary brand color
  contrast: string;           // Contrast color for text on primary/secondary
  background: string;         // Main background color
  secondaryBackground: string;// Secondary background color
  toolbarBackground: string;  // Background for toolbars
  text: string;               // Main text color
  secondaryText: string;      // Secondary text color
  lightText: string;          // Light text color
  success: string;            // Success state color
  warning: string;            // Warning state color
  error: string;              // Error state color
}
\`\`\`

### 2. Typography

Font settings include:

\`\`\`typescript
interface Typography {
  fontFamily: string;    // Main font family
  fontSizeBase: string;  // Base font size
  lineHeight: string;    // Base line height
}
\`\`\`

### 3. Component Defaults

A consistent spacing scale:

\`\`\`typescript
interface ComponentDefaults {
    borderRadius: string;  // Default border radius
    padding: string;       // Default padding
}
\`\`\`

## Using Themes

### Default Theme

The default theme is automatically applied when no theme is provided:

\`\`\`typescript
import { LexioProvider } from 'lexio';

function App() {
  return (
    <LexioProvider onAction={handleAction}>
      <YourComponents />
    </LexioProvider>
  );
}
\`\`\`

### Custom Theme

You can create a custom theme in two ways:

#### **1:** Modify the default theme partially with the provided \`createTheme\` function:

\`\`\`typescript
import { createTheme } from 'lexio';

const myTheme = createTheme({
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    fontBaseSize: '16px',  // many of our components use a relative scale to this value
  }
});
\`\`\`

#### **2:** Create a complete theme from scratch, which requires all values to be defined:

\`\`\`typescript
import { Theme } from 'lexio';

const myTheme: Theme = {
  colors: {
    // ... all color values required
  },
  typography: {
    // ... all typography values required
  },
  componentDefaults: {
    // ... all component defaults required
  }
};
\`\`\`

#### Apply your custom theme:

\`\`\`typescript
<LexioProvider theme={myTheme} onAction={handleAction}>
  <YourComponents />
</LexioProvider>
\`\`\`

## Interactive Example 
Try out the interactive examples below to see different theme variations in action.  
Change the \`customTheme\` value via the dropdown menu under \`Control\`. 
`}}},tags:["autodocs"],argTypes:{customTheme:{control:"select",options:["default","warm","modern"],mapping:{default:x,warm:h,modern:w},description:"Select a predefined theme to see how it affects the components."}}},s={args:{customTheme:h}};var l,p,d;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    customTheme: warmTheme
  }
}`,...(d=(p=s.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};const X=["Docs"];export{s as Docs,X as __namedExportsOrder,V as default};
