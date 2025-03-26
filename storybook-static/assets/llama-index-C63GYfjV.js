import{j as e}from"./index-EuO1YB73.js";import{useMDXComponents as r}from"./index-BLKynSmM.js";import{M as d}from"./index-DvK65IPP.js";import{R as t}from"./shot_lexio_llama_index-Bi_S1jeq.js";import"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./iframe-DTK7Rc-o.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";function s(i){const n={code:"code",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(d,{title:"Gallery/Base: Llama-Index"}),`
`,e.jsx(n.h1,{id:"-llama-index-demo",children:"🚀 Llama Index Demo"}),`
`,e.jsx(n.p,{children:"This demo shows the integration of a Llama Index with a FastAPI backend and a React frontend with Lexio UI components.  Llama Index is used to index and query documents."}),`
`,e.jsx(n.h2,{id:"preparation",children:"Preparation"}),`
`,e.jsx(n.p,{children:"To run this demo, you need to clone the Lexio repo:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`git@github.com:Renumics/lexio.git
`})}),`
`,e.jsx(n.p,{children:"You need to build the Lexio UI components:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`cd lexio
npm run build
`})}),`
`,e.jsxs(n.p,{children:["and put some data in the ",e.jsx(n.code,{children:"examples/llama-index/data"})," folder."]}),`
`,e.jsxs(n.p,{children:["Make sure you have a OpenAI API key set as ",e.jsx(n.code,{children:"OPENAI_API_KEY"})," environment variable."]}),`
`,e.jsxs(n.p,{children:["Now you can run the demo in the ",e.jsx(n.code,{children:"examples/llama-index"})," folder. You can run the demo by running the following commands from the examples/llama-index folder:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`make setup-backend
make setup-frontend
make start-backend
make start-frontend
`})}),`
`,e.jsx(n.p,{children:"This will open a browser window with the demo:"}),`
`,e.jsx("img",{src:t,alt:"Screenshot of the demo"}),`
`,e.jsx("small",{children:e.jsx("i",{children:'(Document source: WMO-No. 1360: " State of the Climate in Africa")'})}),`
`,e.jsx(n.h2,{id:"backend-description",children:"Backend Description"}),`
`,e.jsx(n.p,{children:"The backend is built with FastAPI and uses the Llama Index to manage document indexing and querying. The main components include:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Document Indexing with Llama Index"}),": PDF documents are processed, indexed and a query engine is created with just a few line of code:"]}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`index = VectorStoreIndex.from_documents(SimpleDirectoryReader(DATA_FOLDER).load_data())
query_engine = index.as_query_engine()
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Query endpoint with FastAPI"}),": The query engine is exposed as an endpoint that can be queried by the frontend:"]}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`@app.get("/query")
async def retrieve_and_generate(messages: str = Query(...)):
    response = query_engine.query(messages)
    print(response)
    return response
`})}),`
`,e.jsxs(n.p,{children:["In addition, the backend exposes a ",e.jsx(n.code,{children:"/getDataSource"})," endpoint that can be used to retrieve the original PDF file for a given source reference. You can find the full code in the ",e.jsx(n.code,{children:"examples/llama-index/backend/main.py"})," file."]}),`
`,e.jsxs(n.p,{children:["Note: There is an advanced example of a backend with highlighting in the ",e.jsx(n.code,{children:"examples/llama-index/backend/main_with_highlighting.py"})," file."]}),`
`,e.jsx(n.h2,{id:"frontend-description",children:"Frontend Description"}),`
`,e.jsx(n.p,{children:"The frontend is a React application configured with Vite. It provides GUI to interact with the backend and display query results together with the original PDF file and sources. The main components are:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"RAG UI Components"}),": The application uses ",e.jsx(n.code,{children:"lexio"})," components only:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"AdvancedQueryField"})," for inputting queries."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"ChatWindow"})," for displaying conversation history."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"SourcesDisplay"})," and ",e.jsx(n.code,{children:"ContentDisplay"})," for showing retrieved documents and their content with highlighting."]}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(n.p,{children:["For more details, check out the ",e.jsx(n.code,{children:"examples/llama-index/frontend"})," directory, which contains the full source code."]})]})}function j(i={}){const{wrapper:n}={...r(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{j as default};
