import{G as be,j as i}from"./index-EuO1YB73.js";import{R as he,r as c}from"./index-Cqyox1Tj.js";import{u as we,a as ve,b as Se,c as Ce}from"./floating-ui.react-DaSCc_fA.js";import{u as ke,F as Te}from"./DocumentPlusIcon-p4mHEHYC.js";import{a as Ne,u as Re,R as Ae}from"./hooks-DNVfckEt.js";import{T as Ie,r as Ee}from"./provider-DjyZ7jvp.js";const Be=({componentKey:I,onSubmit:z,onSourceAdded:E,onSourceDeleted:B,onChange:u,placeholder:te="Type @ to mention a source...",disabled:H=!1,styleOverrides:ne={},showNewChatButton:re=!0})=>{const L=he.useContext(Ie);if(!L)throw new Error("ThemeContext is undefined");const{colors:x,typography:U,componentDefaults:O}=L.theme,r={...{backgroundColor:x.background,color:x.text,padding:O.padding,fontFamily:U.fontFamily,fontSize:U.fontSizeBase,borderColor:"#e5e7eb",borderRadius:O.borderRadius,mentionChipBackground:"#bee3f8",mentionChipColor:"#2c5282",inputBackgroundColor:"white",inputBorderColor:x.primary,buttonBackground:x.primary,buttonTextColor:x.contrast,buttonBorderRadius:O.borderRadius,modeInitColor:x.primary,modeFollowUpColor:x.success,modeReRetrieveColor:x.secondary},...Ee(ne)},[V,F]=c.useState(!1),[P,q]=c.useState(""),[K,j]=c.useState(0),[m,M]=c.useState([]),[D,oe]=c.useState(null),[w,_]=c.useState(null),[W,k]=c.useState(""),a=c.useRef(null),X=c.useRef(null),G=c.useRef(null),{sources:v,setActiveSources:$}=Ne(I?`AdvancedQueryField-${I}`:"AdvancedQueryField"),{addUserMessage:se,clearMessages:ie}=Re(I?`AdvancedQueryField-${I}`:"AdvancedQueryField"),{refs:ae,context:Y}=we({open:V,onOpenChange:F}),le=ve(Y),ce=Se(Y),{getFloatingProps:de}=Ce([le,ce]),Q=(e,n)=>{if(!e)throw new Error("Invalid source: source is undefined");const t=e.id;return n!==void 0?`${t}#${n}`:t},ue=e=>e.title,b=c.useCallback(()=>{if(!a.current)return;const e=a.current;e.style.height="auto";const n=e.scrollHeight;e.style.height=`${n}px`,e.style.overflowY=n>200?"auto":"hidden"},[]);c.useLayoutEffect(()=>{b()},[b,W]),ke(X,b);const fe=()=>{if(!a.current)return[];const e=Array.from(a.current.querySelectorAll("span[data-source-index]"));return Array.from(new Set(e.map(n=>n.getAttribute("data-source-index")).filter(Boolean).map(String)))},T=c.useCallback(()=>{const e=fe();return be.flushSync(()=>{$(e)}),e},[$]),J=c.useRef(null);c.useEffect(()=>{J.current!==v&&(a.current&&(a.current.textContent=""),M([]),k(""),u==null||u("",[]),b(),J.current=v)},[v,u,b,$]);const S=(v??[]).filter(e=>e?e.title.toLowerCase().includes(P.toLowerCase()):!1),Z=c.useCallback(e=>{var N,C;if(!a.current||!w)return;const n=v.findIndex(d=>Q(d)===Q(e));if(n===-1)return;const t=Q(e,n),f=ue(e),s={id:t,name:f,source:e},o=document.createElement("span");o.contentEditable="false",o.className="inline-flex items-center px-2 py-0.5 mx-1 select-none align-baseline rounded",o.style.fontSize=r.fontSize||"0.8rem",o.style.backgroundColor=r.mentionChipBackground||"#bee3f8",o.style.color=r.mentionChipColor||"#2c5282",r.borderRadius&&(o.style.borderRadius=r.borderRadius),o.setAttribute("data-mention-id",t),o.setAttribute("data-source-index",e.id),o.textContent=`@${f}`;const p=w.node;if(p.nodeType===Node.TEXT_NODE){const d=p.parentNode;if(!d)return;const h=((N=p.textContent)==null?void 0:N.slice(0,w.offset))||"",g=((C=p.textContent)==null?void 0:C.slice(w.offset))||"";p.textContent=h,d.insertBefore(o,p.nextSibling);const l=document.createTextNode(" ");if(d.insertBefore(l,o.nextSibling),g){const A=document.createTextNode(g);d.insertBefore(A,l.nextSibling)}const R=window.getSelection();if(R){const A=document.createRange();A.setStartAfter(l),A.collapse(!0),R.removeAllRanges(),R.addRange(A)}}else{const d=a.current,h=document.createTextNode(" ");d.insertBefore(o,d.childNodes[w.offset]||null),d.insertBefore(h,o.nextSibling);const g=window.getSelection();if(g){const l=document.createRange();l.setStartAfter(h),l.collapse(!0),g.removeAllRanges(),g.addRange(l)}}M(d=>[...d,s]);const y=a.current.textContent||"";k(y),u==null||u(y,[...m,s]),F(!1),q(""),_(null),a.current.focus(),queueMicrotask(()=>{const d=T();E==null||E(e,d)})},[w,m,v,r,u,E,T]),pe=c.useCallback(e=>{var h,g;const n=e.getAttribute("data-mention-id"),t=e.getAttribute("data-source-index");if(!n||!t)return;const f=m.find(l=>l.id===n);if(!f)return;const s=e.parentNode,o=e.nextSibling;e.remove();let p=null;o&&o.nodeType===Node.TEXT_NODE?p=o:(p=document.createTextNode(""),s&&(o?s.insertBefore(p,o):s.appendChild(p)));const y=window.getSelection();if(y&&p){const l=document.createRange();l.setStart(p,0),l.collapse(!0),y.removeAllRanges(),y.addRange(l)}const N=(h=a.current)==null?void 0:h.querySelectorAll(`span[data-source-index="${t}"]`),C=!N||N.length===0;C&&M(l=>l.filter(R=>R.id!==n));const d=((g=a.current)==null?void 0:g.textContent)||"";k(d),u==null||u(d,C?m.filter(l=>l.id!==n):m),queueMicrotask(C?()=>{const l=T();B==null||B(f.source,l)}:()=>{T()})},[m,B,u,T]),ee=e=>{e.preventDefault();const n=a.current;if(!n)return;const t=n.textContent||"";t.trim()&&(z==null||z(t,m),se(t),n.textContent="",M([]),k(""),b())},me=e=>{var n;e.key==="Enter"&&S.length>0?(e.preventDefault(),e.stopPropagation(),Z(S[K])):e.key==="ArrowUp"?(e.preventDefault(),j(t=>t===0?S.length-1:t-1)):e.key==="ArrowDown"?(e.preventDefault(),j(t=>t===S.length-1?0:t+1)):e.key==="Escape"&&(F(!1),(n=a.current)==null||n.focus())},ye=(e,n)=>{const t=e.startContainer;if(t===a.current){const s=Array.from(a.current.childNodes);if(n==="backward"&&e.startOffset>0){const o=s[e.startOffset-1];if(o instanceof HTMLSpanElement&&o.hasAttribute("data-mention-id"))return o}else if(n==="forward"&&e.startOffset<s.length){const o=s[e.startOffset];if(o instanceof HTMLSpanElement&&o.hasAttribute("data-mention-id"))return o}return null}if(t.nodeType===Node.TEXT_NODE){const s=t.textContent||"";if(n==="backward"){if(e.startOffset>0&&s.slice(0,e.startOffset).trim())return null;if(t.previousSibling instanceof HTMLSpanElement&&t.previousSibling.hasAttribute("data-mention-id"))return t.previousSibling}else{if(e.startOffset<s.length&&s.slice(e.startOffset).trim())return null;if(t.nextSibling instanceof HTMLSpanElement&&t.nextSibling.hasAttribute("data-mention-id"))return t.nextSibling}return null}const f=n==="backward"?t.previousSibling:t.nextSibling;return f instanceof HTMLSpanElement&&f.hasAttribute("data-mention-id")?f:null},ge=e=>{var n;if(e.key==="@"){e.preventDefault();const t=window.getSelection(),f=t==null?void 0:t.getRangeAt(0);if(!t||!f)return;const s=(n=a.current)==null?void 0:n.getBoundingClientRect();if(!s)return;const o=document.createElement("span");o.textContent="@",o.style.visibility="hidden",f.insertNode(o),_({node:f.startContainer,offset:f.startOffset});const p=o.getBoundingClientRect();o.remove(),oe({x:p.left-s.left,y:p.bottom-s.top}),F(!0),j(0),q(""),setTimeout(()=>{var y;return(y=G.current)==null?void 0:y.focus()},0);return}if(e.key==="Enter"&&!e.shiftKey){e.preventDefault(),ee(e);return}if((e.key==="Backspace"||e.key==="Delete")&&a.current){const t=window.getSelection();if(!t||t.rangeCount===0)return;const f=t.getRangeAt(0),s=ye(f,e.key==="Backspace"?"backward":"forward");s&&(e.preventDefault(),pe(s))}},xe=c.useCallback(e=>{const n=e.currentTarget.textContent||"";k(n),u==null||u(n,m),b()},[u,m,b]);return i.jsx(Ae,{children:i.jsxs("form",{ref:X,onSubmit:ee,className:"w-full flex flex-col",style:{backgroundColor:r.backgroundColor,color:r.color,padding:r.padding,fontFamily:r.fontFamily,borderRadius:r.borderRadius},children:[i.jsxs("div",{className:"relative",children:[i.jsx("div",{ref:a,className:`
            w-full resize-none px-3 py-2
            border rounded-lg
            focus:ring-1 focus:ring-gray-300 focus:outline-none
            min-h-[2.5rem] max-h-[200px]
            empty:before:content-[attr(data-placeholder)]
            empty:before:text-gray-400
            whitespace-pre-wrap break-words
          `,contentEditable:!H,"data-placeholder":te,suppressContentEditableWarning:!0,onInput:xe,onKeyDown:ge,style:{backgroundColor:r.inputBackgroundColor,color:r.color,borderColor:r.inputBorderColor,borderRadius:r.borderRadius,fontSize:r.fontSize}}),V&&D&&i.jsxs("div",{ref:ae.setFloating,style:{position:"absolute",left:`${D.x}px`,top:`${D.y}px`,width:"256px",zIndex:50,backgroundColor:r.inputBackgroundColor,borderColor:r.inputBorderColor,color:r.color},className:"rounded-lg shadow-lg border overflow-hidden",...de(),children:[i.jsx("div",{className:"p-2 border-b",style:{borderColor:r.inputBorderColor},children:i.jsx("input",{ref:G,type:"text",className:`
                  w-full px-2 py-1 border rounded
                  focus:outline-none focus:ring-2
                `,style:{backgroundColor:r.inputBackgroundColor,color:r.color,borderColor:r.inputBorderColor,fontSize:r.fontSize},placeholder:"Filter sources...",value:P,onChange:e=>q(e.target.value),onKeyDown:me})}),i.jsx("div",{className:"max-h-48 overflow-y-auto",children:S.length===0?i.jsx("div",{className:"px-4 py-2 text-gray-500",children:"No matches found"}):S.map((e,n)=>{const t=e.title;return i.jsx("div",{className:`px-4 py-2 cursor-pointer ${K===n?"bg-blue-50":"hover:bg-gray-50"}`,onClick:()=>Z(e),onMouseEnter:()=>j(n),children:i.jsxs("div",{className:"flex flex-col max-w-full",children:[i.jsx("span",{className:"truncate max-w-full",title:t,style:{fontSize:`calc(${r.fontSize} * 0.9)`,lineHeight:"1.1"},children:t}),i.jsxs("div",{className:"flex items-center gap-2 mt-1",children:[e.type&&i.jsx("span",{className:"px-2 py-0.5 bg-blue-100 text-blue-800 rounded whitespace-nowrap",style:{fontSize:`calc(${r.fontSize} * 0.8)`},children:e.type}),e.relevance&&i.jsxs("span",{className:"text-gray-500 whitespace-nowrap",style:{fontSize:`calc(${r.fontSize} * 0.8)`},children:["Score: ",Math.round(e.relevance*100),"%"]})]})]})},n)})})]})]}),i.jsxs("div",{className:"flex items-center justify-end gap-2 mt-2",children:[i.jsx("div",{className:"flex items-center",children:re&&i.jsx("button",{type:"button",onClick:ie,className:"p-2 rounded-full hover:opacity-90 transition-colors",style:{color:r.buttonTextColor,backgroundColor:r.buttonBackground,border:"none",cursor:"pointer"},title:"New conversation","aria-label":"New conversation",children:i.jsx(Te,{className:"size-5"})})}),i.jsx("button",{type:"submit",disabled:H||!W.trim(),className:`
            px-4 py-2
            rounded-md
            hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
          `,style:{backgroundColor:r.buttonBackground,color:r.buttonTextColor,borderRadius:r.buttonBorderRadius,fontSize:`calc(${r.fontSize} * 0.95)`},children:"Send"})]})]})})};Be.__docgenInfo={description:`A rich text editor component that allows users to mention and reference sources within their queries.

The AdvancedQueryField provides a more sophisticated input experience than the standard QueryField,
with support for source mentions that appear as interactive chips within the text.

@component

Features:
- Source mentions with @ symbol trigger
- Interactive source chips that can be deleted
- Keyboard navigation between source chips
- Customizable styling
- Responsive design

@example

\`\`\`tsx
<AdvancedQueryField
  componentKey="my-query-field"
  onSubmit={(text, sources) => console.log(text, sources)}
  onSourceAdded={(source) => console.log('Source added:', source)}
  onSourceDeleted={(source) => console.log('Source deleted:', source)}
  onChange={(text) => console.log('Text changed:', text)}
  placeholder="Type @ to mention a source..."
  styleOverrides={{
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '12px',
  }}
/>
\`\`\``,methods:[],displayName:"AdvancedQueryField",props:{componentKey:{required:!1,tsType:{name:"string"},description:"Unique key for the component which can be used to identify the source of UserAction's if multiple AdvancedQueryField components are used.\nThe default is 'AdvancedQueryField', if key is provided it will be appended to the default key as following 'AdvancedQueryField-${key}'."},onSubmit:{required:!1,tsType:{name:"signature",type:"function",raw:"(message: string, mentions: Mention[]) => void",signature:{arguments:[{type:{name:"string"},name:"message"},{type:{name:"Array",elements:[{name:"Mention"}],raw:"Mention[]"},name:"mentions"}],return:{name:"void"}}},description:`Callback triggered when a message is submitted
@param message The message text that was submitted
@param mentions Array of source mentions included in the message`},onSourceAdded:{required:!1,tsType:{name:"signature",type:"function",raw:"(source: Source, allIndices: string[]) => void",signature:{arguments:[{type:{name:"Source"},name:"source"},{type:{name:"Array",elements:[{name:"string"}],raw:"string[]"},name:"allIndices"}],return:{name:"void"}}},description:`Called after a source mention is inserted into the editor
@param source The source that was added
@param allIndices Updated array of all currently referenced source indices`},onSourceDeleted:{required:!1,tsType:{name:"signature",type:"function",raw:"(source: Source, allIndices: string[]) => void",signature:{arguments:[{type:{name:"Source"},name:"source"},{type:{name:"Array",elements:[{name:"string"}],raw:"string[]"},name:"allIndices"}],return:{name:"void"}}},description:`Called after a source mention is removed from the editor
@param source The source that was removed
@param allIndices Updated array of all currently referenced source indices`},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string, mentions: Mention[]) => void",signature:{arguments:[{type:{name:"string"},name:"value"},{type:{name:"Array",elements:[{name:"Mention"}],raw:"Mention[]"},name:"mentions"}],return:{name:"void"}}},description:`Callback for when the editor content changes
@param value The new editor content
@param mentions Array of current source mentions`},placeholder:{required:!1,tsType:{name:"string"},description:`Placeholder text shown when editor is empty
@default 'Type @ to mention a source...'`,defaultValue:{value:"'Type @ to mention a source...'",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:`Whether the editor is disabled
@default false`,defaultValue:{value:"false",computed:!1}},styleOverrides:{required:!1,tsType:{name:"AdvancedQueryFieldStyles"},description:"Style overrides for the component",defaultValue:{value:"{}",computed:!1}},showNewChatButton:{required:!1,tsType:{name:"boolean"},description:`Whether to show the "New Chat" button
@default true`,defaultValue:{value:"true",computed:!1}}}};export{Be as A};
