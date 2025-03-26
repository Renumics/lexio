import{j as r}from"./index-EuO1YB73.js";import{r as i}from"./index-Cqyox1Tj.js";import{u as R,F as k}from"./DocumentPlusIcon-p4mHEHYC.js";import{T as F,r as S}from"./provider-DjyZ7jvp.js";import{u as T,R as B}from"./hooks-DNVfckEt.js";const j=({componentKey:u=void 0,placeholder:y="Type a message...",disabled:d=!1,styleOverrides:h={},showNewChatButton:b=!0})=>{const{addUserMessage:g,clearMessages:x}=T(u?`QueryField-${u}`:"QueryField"),c=i.useContext(F);if(!c)throw new Error("ThemeContext is undefined");const{colors:t,typography:w,componentDefaults:l}=c.theme,e={...{backgroundColor:t.background,color:t.text,padding:l.padding,fontFamily:"inherit",fontSize:w.fontSizeBase,borderColor:"#e5e7eb",borderRadius:l.borderRadius,inputBackgroundColor:"white",inputBorderColor:t.primary,inputBorderRadius:l.borderRadius,buttonBackground:t.primary,buttonTextColor:t.contrast,buttonBorderRadius:l.borderRadius,modeInitColor:t.primary,modeFollowUpColor:t.success,modeReRetrieveColor:t.secondary,statusTextColor:t.secondaryText},...S(h)},[a,f]=i.useState(""),n=i.useRef(null),s=i.useRef(null),p=()=>{if(n.current&&s.current){n.current.style.height="auto";const o=s.current.clientHeight-50;n.current.style.height=`${Math.min(n.current.scrollHeight,o)}px`}};i.useEffect(()=>{p()},[a]),R(s,p);const m=o=>{o.preventDefault(),a.trim()&&(g(a),f(""))},v=o=>{o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),m(o))},C=s.current&&n.current&&n.current.scrollHeight>s.current.clientHeight-50;return r.jsx(B,{children:r.jsxs("form",{ref:s,onSubmit:m,className:"w-full h-full flex flex-col relative",style:{backgroundColor:e.backgroundColor,color:e.color,padding:e.padding,fontFamily:e.fontFamily,borderRadius:e.borderRadius,fontSize:e.fontSize},children:[r.jsx("textarea",{ref:n,value:a,onChange:o=>f(o.target.value),onKeyDown:v,placeholder:y,disabled:d,rows:1,className:`w-full resize-none min-h-[2.5rem] max-h-full transition-colors 
          focus:ring-1 focus:ring-gray-300 focus:outline-none
          ${C?"overflow-y-auto":"overflow-y-hidden"}
        `,style:{backgroundColor:e.inputBackgroundColor,color:e.color,border:`1px solid ${e.inputBorderColor}`,borderRadius:e.inputBorderRadius,fontFamily:e.fontFamily,fontSize:e.fontSize,padding:"0.5rem 0.75rem",outline:"none"}}),r.jsxs("div",{className:"flex items-center justify-end gap-2 mt-2",children:[r.jsx("div",{className:"flex items-center gap-2",children:b&&r.jsx("button",{type:"button",onClick:x,className:"p-2 rounded-full hover:opacity-90 transition-colors",style:{color:e.buttonTextColor,backgroundColor:e.buttonBackground,border:"none",cursor:"pointer"},title:"New conversation","aria-label":"New conversation",children:r.jsx(k,{className:"size-5"})})}),r.jsx("button",{type:"submit",disabled:d||!a.trim(),className:"px-4 py-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",style:{backgroundColor:e.buttonBackground,color:e.buttonTextColor,borderRadius:e.buttonBorderRadius,fontFamily:e.fontFamily,fontSize:`calc(${e.fontSize} * 0.95)`},children:"Send"})]})]})})};j.__docgenInfo={description:`A textarea-based input component for submitting queries with workflow status indication.

\`QueryField\` provides a simple yet powerful interface for users to input and submit
queries. It features auto-expanding behavior and keyboard shortcuts for submission.

@component

Features:
- Auto-expanding textarea
- Enter to submit (Shift+Enter for new line)
- Visual workflow status indicator
- Customizable styling
- Responsive design

@example

\`\`\`tsx
<QueryField
  componentKey="search-query"
  placeholder="Ask a question..."
  disabled={false}
  styleOverrides={{
    backgroundColor: '#f5f5f5',
    color: '#333333',
    borderRadius: '8px',
    padding: '12px',
  }}
/>
\`\`\``,methods:[],displayName:"QueryField",props:{componentKey:{required:!1,tsType:{name:"string"},description:"Unique key for the component which can be used to identify the source of UserAction's if multiple QueryField components are used.\nThe default is 'QueryField', if key is provided it will be appended to the default key as following 'QueryField-${key}'.",defaultValue:{value:"undefined",computed:!0}},placeholder:{required:!1,tsType:{name:"string"},description:`Custom placeholder text for the input field
@default "Type a message..."`,defaultValue:{value:"'Type a message...'",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:`Whether the input field is disabled
@default false`,defaultValue:{value:"false",computed:!1}},styleOverrides:{required:!1,tsType:{name:"QueryFieldStyles"},description:"Style overrides for the component",defaultValue:{value:"{}",computed:!1}},showNewChatButton:{required:!1,tsType:{name:"boolean"},description:`Whether to show the "New Chat" button
@default true`,defaultValue:{value:"true",computed:!1}}}};export{j as Q};
