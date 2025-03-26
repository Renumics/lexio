import{j as n}from"./index-EuO1YB73.js";import{useMDXComponents as r}from"./index-BLKynSmM.js";import{M as l}from"./index-DvK65IPP.js";import"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./iframe-DTK7Rc-o.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";const t=""+new URL("shot_langchain-D8MAdV-t.png",import.meta.url).href;function i(s){const e={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...s.components};return n.jsxs(n.Fragment,{children:[n.jsx(l,{title:"Gallery/Base: Langchain"}),`
`,n.jsx(e.h1,{id:"lexio-rag-demo-with-langchain-chromadb-and-openai--pdf-highlights-with-pymupdf",children:"Lexio RAG Demo with Langchain, ChromaDB, and OpenAI + PDF Highlights with PyMuPDF"}),`
`,n.jsx(e.p,{children:`This repository demonstrates how to build a Retrieval-Augmented Generation (RAG) system on PDF data using
Langchain, ChromaDB, PyMuPDF and the Lexio UI components. The demo showcases:`}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Advanced PDF Processing"})," with PyMuPDF for intelligent text extraction and highlighting"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Real-time streaming"})," of responses (via Server-Sent Events)"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Document retrieval"})," from a ChromaDB vector store"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Modern React frontend"})," with Lexio UI components"]}),`
`]}),`
`,n.jsx("img",{src:t,alt:"Screenshot of the demo"}),`
`,n.jsx(e.h2,{id:"tech-stack",children:"Tech Stack"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"FastAPI"})," (Python) for the backend"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"React + TypeScript"})," frontend using ",n.jsx(e.a,{href:"https://github.com/Renumics/lexio",rel:"nofollow",children:"Lexio"})," components"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"PyMuPDF"})," for advanced PDF processing and text position extraction"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Langchain"})," for document processing and LLM integration"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"ChromaDB"})," for vector storage and retrieval"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"OpenAI"})," for embeddings and text generation"]}),`
`]}),`
`,n.jsx(e.h2,{id:"features-overview",children:"Features Overview"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Advanced PDF Processing & Display"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Intelligent PDF text extraction with positional information"}),`
`,n.jsx(e.li,{children:"Automatic highlighting of relevant text passages"}),`
`,n.jsx(e.li,{children:"Precise bounding box calculation for text spans"}),`
`,n.jsx(e.li,{children:"Interactive PDF viewer with highlight overlay support"}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Document Processing & Storage"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Automatic indexing of PDF documents placed in the ",n.jsx(e.code,{children:"data"})," directory"]}),`
`,n.jsx(e.li,{children:"Smart text chunking with positional metadata preservation"}),`
`,n.jsx(e.li,{children:"ChromaDB vector store for efficient retrieval"}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Streaming Responses"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Real-time token streaming via Server-Sent Events (SSE)"}),`
`,n.jsx(e.li,{children:"Immediate feedback as responses are generated"}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Conversation Context"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Support for follow-up questions"}),`
`,n.jsx(e.li,{children:"Maintains conversation history for contextual responses"}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Modern UI Components"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Chat interface with streaming support"}),`
`,n.jsx(e.li,{children:"Interactive PDF viewer with highlight support"}),`
`,n.jsx(e.li,{children:"Clean query interface for natural language questions"}),`
`]}),`
`]}),`
`]}),`
`,n.jsx(e.h2,{id:"setup--installation",children:"Setup & Installation"}),`
`,n.jsx(e.h3,{id:"requirements",children:"Requirements"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Make (optional)"}),`
`,n.jsx(e.li,{children:"Python 3.12 or higher"}),`
`,n.jsx(e.li,{children:"Node.js 20 or higher"}),`
`,n.jsx(e.li,{children:"OpenAI API key"}),`
`,n.jsx(e.li,{children:"Modern web browser with SSE support"}),`
`]}),`
`,n.jsx(e.h3,{id:"backend",children:"Backend"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Clone this repository"})," and navigate into the demo ",n.jsx(e.code,{children:"backend"})," folder:"]}),`
`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`git clone <repo_url>
cd examples/langchain/backend
`})}),`
`,n.jsxs(e.ol,{start:"2",children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Create a virtual environment"})," and activate it:"]}),`
`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
`})}),`
`,n.jsxs(e.ol,{start:"3",children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Install dependencies"}),":"]}),`
`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`pip install -e .
`})}),`
`,n.jsxs(e.ol,{start:"4",children:[`
`,n.jsxs(e.li,{children:["Create a ",n.jsx(e.code,{children:".env"})," file with your OpenAI API key:"]}),`
`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`echo "OPENAI_API_KEY=your-api-key-here" > .env
`})}),`
`,n.jsxs(e.ol,{start:"5",children:[`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Add your PDF documents"})," to the ",n.jsx(e.code,{children:"data"})," directory"]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Index"})," the documents:"]}),`
`]}),`
`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`index-files
`})}),`
`,n.jsxs(e.ol,{start:"7",children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Start"})," the backend server:"]}),`
`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`run-server
`})}),`
`,n.jsx(e.h3,{id:"frontend",children:"Frontend"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsx(e.li,{children:n.jsx(e.strong,{children:"Navigate to the frontend directory:"})}),`
`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`cd examples/langchain/frontend
`})}),`
`,n.jsxs(e.ol,{start:"2",children:[`
`,n.jsx(e.li,{children:n.jsx(e.strong,{children:"Install dependencies:"})}),`
`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`npm install
`})}),`
`,n.jsxs(e.ol,{start:"3",children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Start"})," the development server:"]}),`
`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`npm run dev
`})}),`
`,n.jsxs(e.ol,{start:"4",children:[`
`,n.jsx(e.li,{children:"Open http://localhost:5173 in your browser"}),`
`]}),`
`,n.jsx(e.h2,{id:"usage",children:"Usage"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Open the frontend"}),` in your browser.
Typically at `,n.jsx(e.a,{href:"http://localhost:5173",rel:"nofollow",children:"http://localhost:5173"}),"."]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Ask a question"})," about the PDFs that you added."]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"The system will retrieve relevant chunks from ChromaDB and stream a response from the OpenAI model."}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"View sources"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"In the SourcesDisplay component, you’ll see clickable references."}),`
`,n.jsx(e.li,{children:"Click on any source link to open it in the ContentDisplay in the middle."}),`
`]}),`
`]}),`
`]}),`
`,n.jsx(e.hr,{})]})}function p(s={}){const{wrapper:e}={...r(),...s.components};return e?n.jsx(e,{...s,children:n.jsx(i,{...s})}):i(s)}export{p as default};
