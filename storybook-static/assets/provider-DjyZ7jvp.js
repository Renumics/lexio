import{j as te}from"./index-EuO1YB73.js";import{R as Se,r as P}from"./index-Cqyox1Tj.js";function it(e){return Object.fromEntries(Object.entries(e).filter(([t,o])=>o!==void 0))}const be=Se.createContext(void 0),me=({theme:e,children:t})=>{const o=P.useMemo(()=>({theme:e}),[e]);return te.jsx(be.Provider,{value:o,children:t})};me.__docgenInfo={description:`Provider component for making a theme available throughout the application.

@component
@param {ThemeProviderProps} props - The props for the ThemeProvider
@returns {JSX.Element} A ThemeContext.Provider wrapping the children

@remarks
The ThemeProvider is typically used within the RAGProvider component, which
handles the complete setup of the RAG UI system --> **There is no need to use the ThemeProvider directly.**

@example
\`\`\`tsx
import { defaultTheme, RAGProvider } from 'lexio';

function App() {
  return (
    <RAGProvider theme={defaultTheme}>
      <YourComponents />
    </RAGProvider>
  );
}
\`\`\`

@example
If you need to use the ThemeProvider directly:
\`\`\`tsx
import { ThemeProvider, defaultTheme } from 'lexio';

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <YourComponents />
    </ThemeProvider>
  );
}
\`\`\``,methods:[],displayName:"ThemeProvider",props:{theme:{required:!0,tsType:{name:"Theme"},description:""},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};const D={},ue=(e,t)=>e.unstable_is?e.unstable_is(t):t===e,fe=e=>"init"in e,Y=e=>!!e.write,pe=e=>"v"in e||"e"in e,z=e=>{if("e"in e)throw e.e;if((D?"production":void 0)!=="production"&&!("v"in e))throw new Error("[Bug] atom state is not initialized");return e.v},ve=Symbol(),se=e=>e[ve],oe=e=>{var t;return ce(e)&&!((t=se(e))!=null&&t[1])},Pe=(e,t)=>{const o=se(e);if(o)o[1]=!0,o[0].forEach(n=>n(t));else if((D?"production":void 0)!=="production")throw new Error("[Bug] cancelable promise not found")},Ce=e=>{if(se(e))return;const t=[new Set,!1];e[ve]=t;const o=()=>{t[1]=!0};e.then(o,o),e.onCancel=n=>{t[0].add(n)}},ce=e=>typeof(e==null?void 0:e.then)=="function",ye=(e,t,o)=>{o.p.has(e)||(o.p.add(e),t.then(()=>{o.p.delete(e)},()=>{o.p.delete(e)}))},X=(e,t,o)=>{const n=o(e),s="v"in n,f=n.v,i=oe(n.v)?n.v:null;if(ce(t)){Ce(t);for(const m of n.d.keys())ye(e,t,o(m))}n.v=t,delete n.e,(!s||!Object.is(f,n.v))&&(++n.n,i&&Pe(i,t))},he=(e,t,o)=>{var n;const s=new Set;for(const f of((n=o.get(e))==null?void 0:n.t)||[])o.has(f)&&s.add(f);for(const f of t.p)s.add(f);return s},Ie=()=>{const e=new Set,t=()=>{e.forEach(o=>o())};return t.add=o=>(e.add(o),()=>{e.delete(o)}),t},Q=()=>{const e={},t=new WeakMap,o=n=>{var s,f;(s=t.get(e))==null||s.forEach(i=>i(n)),(f=t.get(n))==null||f.forEach(i=>i())};return o.add=(n,s)=>{const f=n||e,i=(t.has(f)?t:t.set(f,new Set)).get(f);return i.add(s),()=>{i==null||i.delete(s),i.size||t.delete(f)}},o},Ue=e=>(e.c||(e.c=Q()),e.m||(e.m=Q()),e.u||(e.u=Q()),e.f||(e.f=Ie()),e),De=Symbol(),Fe=(e=new WeakMap,t=new WeakMap,o=new WeakMap,n=new Set,s=new Set,f=new Set,i={},m=(a,...l)=>a.read(...l),u=(a,...l)=>a.write(...l),v=(a,l)=>{var R;return(R=a.unstable_onInit)==null?void 0:R.call(a,l)},S=(a,l)=>{var R;return(R=a.onMount)==null?void 0:R.call(a,l)},...h)=>{const a=h[0]||(r=>{if((D?"production":void 0)!=="production"&&!r)throw new Error("Atom is undefined or null");let y=e.get(r);return y||(y={d:new Map,p:new Set,n:0},e.set(r,y),v==null||v(r,K)),y}),l=h[1]||(()=>{let r,y;const A=c=>{try{c()}catch(d){r||(r=!0,y=d)}};do{i.f&&A(i.f);const c=new Set,d=c.add.bind(c);n.forEach(p=>{var g;return(g=t.get(p))==null?void 0:g.l.forEach(d)}),n.clear(),f.forEach(d),f.clear(),s.forEach(d),s.clear(),c.forEach(A),n.size&&R()}while(n.size||f.size||s.size);if(r)throw y}),R=h[2]||(()=>{const r=[],y=new WeakSet,A=new WeakSet,c=Array.from(n);for(;c.length;){const d=c[c.length-1],p=a(d);if(A.has(d)){c.pop();continue}if(y.has(d)){if(o.get(d)===p.n)r.push([d,p]);else if((D?"production":void 0)!=="production"&&o.has(d))throw new Error("[Bug] invalidated atom exists");A.add(d),c.pop();continue}y.add(d);for(const g of he(d,p,t))y.has(g)||c.push(g)}for(let d=r.length-1;d>=0;--d){const[p,g]=r[d];let w=!1;for(const I of g.d.keys())if(I!==p&&n.has(I)){w=!0;break}w&&(C(p),j(p)),o.delete(p)}}),C=h[3]||(r=>{var y,A;const c=a(r);if(pe(c)&&(t.has(r)&&o.get(r)!==c.n||Array.from(c.d).every(([_,q])=>C(_).n===q)))return c;c.d.clear();let d=!0;const p=()=>{t.has(r)&&(j(r),R(),l())},g=_=>{var q;if(ue(r,_)){const de=a(_);if(!pe(de))if(fe(_))X(_,_.init,a);else throw new Error("no atom init");return z(de)}const H=C(_);try{return z(H)}finally{c.d.set(_,H.n),oe(c.v)&&ye(r,c.v,H),(q=t.get(_))==null||q.t.add(r),d||p()}};let w,I;const V={get signal(){return w||(w=new AbortController),w.signal},get setSelf(){return(D?"production":void 0)!=="production"&&!Y(r)&&console.warn("setSelf function cannot be used with read-only atom"),!I&&Y(r)&&(I=(..._)=>{if((D?"production":void 0)!=="production"&&d&&console.warn("setSelf function cannot be called in sync"),!d)try{return O(r,..._)}finally{R(),l()}}),I}},N=c.n;try{const _=m(r,g,V);return X(r,_,a),ce(_)&&((y=_.onCancel)==null||y.call(_,()=>w==null?void 0:w.abort()),_.then(p,p)),c}catch(_){return delete c.v,c.e=_,++c.n,c}finally{d=!1,N!==c.n&&o.get(r)===N&&(o.set(r,c.n),n.add(r),(A=i.c)==null||A.call(i,r))}}),J=h[4]||(r=>{const y=[r];for(;y.length;){const A=y.pop(),c=a(A);for(const d of he(A,c,t)){const p=a(d);o.set(d,p.n),y.push(d)}}}),O=h[5]||((r,...y)=>{let A=!0;const c=p=>z(C(p)),d=(p,...g)=>{var w;const I=a(p);try{if(ue(r,p)){if(!fe(p))throw new Error("atom not writable");const V=I.n,N=g[0];X(p,N,a),j(p),V!==I.n&&(n.add(p),(w=i.c)==null||w.call(i,p),J(p));return}else return O(p,...g)}finally{A||(R(),l())}};try{return u(r,c,d,...y)}finally{A=!1}}),j=h[6]||(r=>{var y;const A=a(r),c=t.get(r);if(c&&!oe(A.v)){for(const[d,p]of A.d)if(!c.d.has(d)){const g=a(d);$(d).t.add(r),c.d.add(d),p!==g.n&&(n.add(d),(y=i.c)==null||y.call(i,d),J(d))}for(const d of c.d||[])if(!A.d.has(d)){c.d.delete(d);const p=G(d);p==null||p.t.delete(r)}}}),$=h[7]||(r=>{var y;const A=a(r);let c=t.get(r);if(!c){C(r);for(const d of A.d.keys())$(d).t.add(r);if(c={l:new Set,d:new Set(A.d.keys()),t:new Set},t.set(r,c),(y=i.m)==null||y.call(i,r),Y(r)){const d=()=>{let p=!0;const g=(...w)=>{try{return O(r,...w)}finally{p||(R(),l())}};try{const w=S(r,g);w&&(c.u=()=>{p=!0;try{w()}finally{p=!1}})}finally{p=!1}};s.add(d)}}return c}),G=h[8]||(r=>{var y;const A=a(r);let c=t.get(r);if(c&&!c.l.size&&!Array.from(c.t).some(d=>{var p;return(p=t.get(d))==null?void 0:p.d.has(r)})){c.u&&f.add(c.u),c=void 0,t.delete(r),(y=i.u)==null||y.call(i,r);for(const d of A.d.keys()){const p=G(d);p==null||p.t.delete(r)}return}return c}),Te=[e,t,o,n,s,f,i,m,u,v,S,a,l,R,C,J,O,j,$,G],K={get:r=>z(C(r)),set:(r,...y)=>{try{return O(r,...y)}finally{R(),l()}},sub:(r,y)=>{const c=$(r).l;return c.add(y),l(),()=>{c.delete(y),G(r),l()}}};return Object.defineProperty(K,De,{value:Te}),K},Ee=Fe,xe=Ue,ie={};let Oe=0;function E(e,t){const o=`atom${++Oe}`,n={toString(){return(ie?"production":void 0)!=="production"&&this.debugLabel?o+":"+this.debugLabel:o}};return typeof e=="function"?n.read=e:(n.init=e,n.read=Le,n.write=Me),t&&(n.write=t),n}function Le(e){return e(this)}function Me(e,t,o){return t(this,typeof o=="function"?o(e(this)):o)}const ke=()=>{let e=0;const t=xe({}),o=new WeakMap,n=new WeakMap,s=Ee(o,n,void 0,void 0,void 0,void 0,t,void 0,(m,u,v,...S)=>e?v(m,...S):m.write(u,v,...S)),f=new Set;return t.m.add(void 0,m=>{f.add(m);const u=o.get(m);u.m=n.get(m)}),t.u.add(void 0,m=>{f.delete(m);const u=o.get(m);delete u.m}),Object.assign(s,{dev4_get_internal_weak_map:()=>o,dev4_get_mounted_atoms:()=>f,dev4_restore_atoms:m=>{const u={read:()=>null,write:(v,S)=>{++e;try{for(const[h,a]of m)"init"in h&&S(h,a)}finally{--e}}};s.set(u)}})},ae=()=>(ie?"production":void 0)!=="production"?ke():Ee();let L;const je=()=>(L||(L=ae(),(ie?"production":void 0)!=="production"&&(globalThis.__JOTAI_DEFAULT_STORE__||(globalThis.__JOTAI_DEFAULT_STORE__=L),globalThis.__JOTAI_DEFAULT_STORE__!==L&&console.warn("Detected multiple Jotai instances. It may cause unexpected behavior with the default store. https://github.com/pmndrs/jotai/discussions/2044"))),L),Ae={},_e=P.createContext(void 0),we=e=>P.useContext(_e)||je(),$e=({children:e,store:t})=>{const o=P.useRef(void 0);return!t&&!o.current&&(o.current=ae()),P.createElement(_e.Provider,{value:t||o.current},e)},ge=e=>typeof(e==null?void 0:e.then)=="function",Ge=e=>{e.status="pending",e.then(t=>{e.status="fulfilled",e.value=t},t=>{e.status="rejected",e.reason=t})},Ne=Se.use||(e=>{if(e.status==="pending")throw e;if(e.status==="fulfilled")return e.value;throw e.status==="rejected"?e.reason:(Ge(e),e)}),Z=new WeakMap,qe=e=>{let t=Z.get(e);return t||(t=new Promise((o,n)=>{let s=e;const f=u=>v=>{s===u&&o(v)},i=u=>v=>{s===u&&n(v)},m=u=>{"onCancel"in u&&typeof u.onCancel=="function"&&u.onCancel(v=>{if((Ae?"production":void 0)!=="production"&&v===u)throw new Error("[Bug] p is not updated even after cancelation");ge(v)?(Z.set(v,t),s=v,v.then(f(v),i(v)),m(v)):o(v)})};e.then(f(e),i(e)),m(e)}),Z.set(e,t)),t};function at(e,t){const o=we(),[[n,s,f],i]=P.useReducer(v=>{const S=o.get(e);return Object.is(v[0],S)&&v[1]===o&&v[2]===e?v:[S,o,e]},void 0,()=>[o.get(e),o,e]);let m=n;if((s!==o||f!==e)&&(i(),m=o.get(e)),P.useEffect(()=>{const v=o.sub(e,()=>{i()});return i(),v},[o,e,void 0]),P.useDebugValue(m),ge(m)){const v=qe(m);return Ne(v)}return m}function lt(e,t){const o=we();return P.useCallback((...s)=>{if((Ae?"production":void 0)!=="production"&&!("write"in e))throw new Error("not writable atom");return o.set(e,...s)},[o,e])}const ze={ADD_USER_MESSAGE:["response","sources","setUserMessage","followUpAction"],SET_ACTIVE_MESSAGE:["followUpAction"],CLEAR_MESSAGES:["followUpAction"],SEARCH_SOURCES:["sources","followUpAction"],CLEAR_SOURCES:["followUpAction"],SET_ACTIVE_SOURCES:["followUpAction"],SET_SELECTED_SOURCE:["sourceData","followUpAction"],SET_FILTER_SOURCES:["followUpAction"],RESET_FILTER_SOURCES:["followUpAction"],SET_MESSAGE_FEEDBACK:["followUpAction"]},le=E({timeouts:{stream:2e3,request:5e3}}),T=E([]),ee=E(null),Re=E(null);E(e=>{const t=e(Re),o=e(T);return t?o.find(n=>n.id===t)??null:null});const b=E([]),k=E(null),x=E(null),We=E(e=>{const t=e(b),o=e(k);return o===null?null:t.filter(n=>o.includes(n.id))}),Be=E(e=>{const t=e(b),o=e(x);return o?t.find(n=>n.id===o)??null:null}),F=E(!1),B=E(null),ne=E(null,(e,t,o)=>{t(B,`${new Date().toISOString()}: ${o}`)}),U=E([]);E(null,(e,t,o)=>{if(e(U).find(f=>f.component===o.component))throw new Error(`Handler for component ${o.component} already registered`);t(U,[...e(U),o])});E(null,(e,t,o)=>{const n=e(U),s=n.filter(f=>f.component!==o.component);if(s.length===n.length)throw new Error(`Handler for component ${o.component} not found`);t(U,s)});const Je=E(null,async(e,t,{action:o,response:n})=>{const s=e(T),f=e(b),i=e(le),m=new AbortController;n.setUserMessage?t(T,[...e(T),{id:crypto.randomUUID(),role:"user",content:n.setUserMessage}]):t(T,[...e(T),{id:crypto.randomUUID(),role:"user",content:o.message}]);const u=async()=>{var a;if(!n.sources)return;const h=(await re(n.sources.then(l=>l),(a=i.timeouts)==null?void 0:a.request,"Sources request timeout exceeded",m.signal)).map(l=>({...l,id:l.id||crypto.randomUUID()}));return t(b,h),t(k,null),t(x,null),h},v=async()=>{var S,h;if(n.response){let a="";if(Symbol.asyncIterator in n.response){const l=crypto.randomUUID(),R=new ot((S=i.timeouts)==null?void 0:S.stream);for await(const C of n.response){if(m.signal.aborted)break;R.check(),a+=C.content??"",t(ee,{id:l,role:"assistant",content:a})}return t(T,[...e(T),{id:l,role:"assistant",content:a}]),t(ee,null),a}else{const l=await re(n.response,(h=i.timeouts)==null?void 0:h.request,"Response timeout exceeded",m.signal);return t(T,[...e(T),{id:crypto.randomUUID(),role:"assistant",content:l}]),l}}};try{const S=await Promise.allSettled([u(),v()]),h=S.filter(a=>a.status==="rejected");if(h.length>0){m.abort(),t(T,s),t(b,f),t(ee,null);const a=h.map(l=>l.reason instanceof Error?l.reason.message:String(l.reason)).join("; ");throw new Error(a)}return S}catch(S){throw t(ne,`Failed to process user message: ${S instanceof Error?S.message:S}`),S}}),Ke=E(null,(e,t,{action:o,response:n})=>{console.log("setActiveMessageAtom",o,n);const s=n.messageId??o.messageId;t(Re,s||null)}),Ve=E(null,(e,t,{action:o,response:n})=>{console.log("clearMessagesAtom",o,n),t(T,[])}),He=E(null,async(e,t,{action:o,response:n})=>{var m;console.log("searchSourcesAtom",o,n);const s=e(b),f=e(le),i=new AbortController;try{if(t(F,!0),!n.sources)return console.warn("No sources provided to searchSourcesAtom. Operation skipped."),s;const v=(await re(n.sources,(m=f.timeouts)==null?void 0:m.request,"Sources request timeout exceeded in searchSourcesAtom",i.signal)).map(S=>({...S,id:S.id||crypto.randomUUID()}));return t(b,v),t(k,null),t(x,null),v}catch(u){throw i.abort(),t(b,s),t(B,`Failed to search sources: ${u instanceof Error?u.message:String(u)}`),u}finally{t(F,!1)}}),Ye=E(null,(e,t,{action:o,response:n})=>{console.log("clearSourcesAtom",o,n),t(b,[]),t(k,null),t(x,null)}),Xe=E(null,(e,t,{action:o,response:n})=>{console.log("setActiveSourcesAtom",o,n);const s=n.activeSourceIds??o.sourceIds;t(k,s===null?[]:s)}),Qe=E(null,async(e,t,{action:o,response:n})=>{if(console.log("setSelectedSourceAtom",o,n),o.sourceId===null||o.sourceId===""){t(x,null);return}const s=e(b),f=s.find(i=>i.id===o.sourceId);if(!f){console.warn(`Source with id ${o.sourceId} not found`);return}if(t(x,o.sourceId),n.sourceData){if(f.data){console.warn(`Source ${o.sourceId} already has data but new data was provided`);return}try{const i=await n.sourceData,m=s.map(u=>u.id===o.sourceId?{...u,data:i}:u);t(b,m)}catch(i){console.error(`Failed to load data for source ${o.sourceId}:`,i),t(B,`Failed to load source data: ${i instanceof Error?i.message:String(i)}`)}}}),Ze=E(null,(e,t,{action:o,response:n})=>{throw console.log("setFilterSourcesAtom",o,n),new Error("Not implemented yet")}),et=E(null,(e,t,{action:o,response:n})=>{throw console.log("resetFilterSourcesAtom",o,n),new Error("Not implemented yet")}),W=e=>{switch(e.type){case"ADD_USER_MESSAGE":case"SEARCH_SOURCES":case"CLEAR_MESSAGES":return!0;case"SET_SELECTED_SOURCE":case"SET_ACTIVE_SOURCES":case"SET_FILTER_SOURCES":case"RESET_FILTER_SOURCES":return!1;default:return!1}},tt=E(null,async(e,t,o,n=!1)=>{if(!n&&W(o)&&e(F)){t(ne,"RAG Operation already in progress");return}!n&&W(o)&&(t(F,!0),t(B,null));try{const f=e(U).find(h=>h.component==="LexioProvider");if(!f){console.warn(`Handler for component ${o.source} not found`),!n&&W(o)&&t(F,!1);return}if(o.type==="SET_SELECTED_SOURCE"){const h=e(b).find(a=>a.id===o.sourceId);h&&(o.sourceObject=h)}const i=e(b),m=e(We),u=await Promise.resolve(f.handler(o,e(T),i,m,e(Be))),v=ze[o.type]||[];if(u){const h=Object.keys(u).filter(a=>!v.includes(a));h.length>0&&console.warn(`Handler for action "${o.type}" returned unused properties: ${h.join(", ")}`)}const S=[];switch(o.type){case"ADD_USER_MESSAGE":{const l=t(Je,{action:o,response:u});S.push(Promise.resolve(l));break}case"SET_ACTIVE_MESSAGE":{const l=t(Ke,{action:o,response:u});S.push(Promise.resolve(l));break}case"CLEAR_MESSAGES":{const l=t(Ve,{action:o,response:u});S.push(Promise.resolve(l));break}case"SEARCH_SOURCES":{const l=t(He,{action:o,response:u});S.push(Promise.resolve(l));break}case"CLEAR_SOURCES":{const l=t(Ye,{action:o,response:u});S.push(Promise.resolve(l));break}case"SET_ACTIVE_SOURCES":{const l=t(Xe,{action:o,response:u});S.push(Promise.resolve(l));break}case"SET_SELECTED_SOURCE":{const l=t(Qe,{action:o,response:u});S.push(Promise.resolve(l));break}case"SET_FILTER_SOURCES":{const l=t(Ze,{action:o,response:u});S.push(Promise.resolve(l));break}case"RESET_FILTER_SOURCES":{const l=t(et,{action:o,response:u});S.push(Promise.resolve(l));break}case"SET_MESSAGE_FEEDBACK":{const l=t(nt,{action:o,response:u});S.push(Promise.resolve(l));break}default:console.warn(`Unhandled action type: ${o.type}`)}u&&u.followUpAction&&S.push(Promise.resolve(t(tt,u.followUpAction,!0))),await Promise.all(S)}catch(s){console.error("Error in dispatch async writes:",s),t(ne,`Dispatch failed: ${s instanceof Error?s.message:String(s)}`)}finally{!n&&W(o)&&t(F,!1)}}),re=(e,t,o,n)=>t?Promise.race([e,new Promise((s,f)=>{const i=setTimeout(()=>{f(new Error(o))},t);n==null||n.addEventListener("abort",()=>{clearTimeout(i)})})]):e;class ot{constructor(t){this.timeout=t,this.lastCheck=Date.now()}check(){if(!this.timeout)return;const t=Date.now();if(t-this.lastCheck>this.timeout)throw new Error("Stream timeout exceeded");this.lastCheck=t}}const nt=E(null,(e,t,{action:o,response:n})=>{console.log("setMessageFeedbackAtom",o,n)}),M={colors:{primary:"#1E88E5",secondary:"#64B5F6",contrast:"#FFFFFF",background:"#F4F6F8",secondaryBackground:"#FFFFFF",toolbarBackground:"#42a6f5",text:"#212121",secondaryText:"#757575",lightText:"#E0E0E0",success:"#4CAF50",warning:"#FFB300",error:"#E53935"},typography:{fontFamily:'"Poppins", Helvetica, Arial, sans-serif',fontSizeBase:"1.rem",lineHeight:"1.75"},componentDefaults:{borderRadius:"0.5rem",padding:"1.0rem"}},dt=e=>({...M,colors:{...M.colors,...e.colors||{}},typography:{...M.typography,...e.typography||{}},componentDefaults:{...M.componentDefaults,...e.componentDefaults||{}}}),rt=({children:e,onAction:t,theme:o,config:n})=>{const s=P.useMemo(()=>ae(),[]);return P.useEffect(()=>{t&&s.set(U,[{component:"LexioProvider",handler:t}])},[s,t]),P.useEffect(()=>{n&&s.set(le,n)},[s,n]),te.jsx($e,{store:s,children:te.jsx(me,{theme:o!==void 0?o:M,children:e})})};rt.__docgenInfo={description:`**LexioProvider** is a top-level context provider that wraps your application with necessary state management and theming.

@component

@param props.children - React child components to be wrapped by the provider
@param props.onAction - Optional callback function to handle custom actions triggered within Lexio components
@param props.theme - Optional custom theme object to override the default styling
@param props.config - Optional provider configuration object to customize behavior and settings

@component

This provider:
- Creates and provides a Jotai store for global state management
- Sets up theme context with either custom or default theme
- Registers action handlers for component interactions
- Applies provider configuration through the config prop

@example

\`\`\`tsx
<LexioProvider
  onAction={(action) => {
    // Handle custom actions
    if (action.type === 'SEARCH_SOURCES') {
      return {
        sources: fetchSources(action.query)
      };
    }
    return undefined;
  }}
  theme={customTheme}
  config={{
    apiKey: 'your-api-key',
    endpoint: 'https://your-api-endpoint.com'
  }}
>
  <YourApplication />
</LexioProvider>
\`\`\``,methods:[],displayName:"LexioProvider",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},onAction:{required:!1,tsType:{name:"signature",raw:"ActionHandler['handler']"},description:""},theme:{required:!1,tsType:{name:"Theme"},description:""},config:{required:!1,tsType:{name:"ProviderConfig"},description:""}}};export{rt as L,be as T,at as a,Be as b,dt as c,M as d,k as e,We as f,b as g,ee as h,T as i,B as j,tt as k,F as l,it as r,x as s,lt as u};
