import{j as d}from"./index-EuO1YB73.js";import{L as l}from"./provider-DjyZ7jvp.js";import{r as u,e as f}from"./helper-Ckk0Nnss.js";import"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./index-DvK65IPP.js";import"./iframe-DTK7Rc-o.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";const g=(e,s,i,a,c)=>{if(console.log("Action handler called with:",{action:e,messages:s,sources:i,activeSources:a,selectedSource:c}),e.type==="ADD_USER_MESSAGE"){const p=Promise.resolve([{id:crypto.randomUUID(),title:"Sample Document",type:"pdf",relevance:.95,metadata:{page:1}}]),m=async function*(){yield{content:"Sample ",done:!1},yield{content:"streaming ",done:!1},yield{content:"response",done:!0}}();return{sources:p,response:m}}if(e.type==="SET_SELECTED_SOURCE"&&e.sourceObject)return console.log("Loading data for source:",e.sourceObject.title),{sourceData:Promise.resolve(`# Sample Content

This is the content of the selected source.`)}},L={title:"Components/LexioProvider",component:l,tags:["autodocs"],parameters:{docs:{extractComponentDescription:f,page:u,canvas:{sourceState:"hidden"}},layout:"centered",controls:{hideNoControlsWarning:!0}}},o={args:{onAction:g,children:d.jsx("div",{children:"LexioProvider wraps your app components. There is no preview."}),config:{timeouts:{stream:1e4,request:6e4}}}};var r,t,n;o.parameters={...o.parameters,docs:{...(r=o.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    onAction: sampleActionHandler,
    children: <div>LexioProvider wraps your app components. There is no preview.</div>,
    config: {
      timeouts: {
        stream: 10000,
        request: 60000
      }
    }
  }
}`,...(n=(t=o.parameters)==null?void 0:t.docs)==null?void 0:n.source}}};const P=["Docs"];export{o as Docs,P as __namedExportsOrder,L as default};
