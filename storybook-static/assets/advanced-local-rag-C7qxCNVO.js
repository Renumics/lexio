import{j as n}from"./index-EuO1YB73.js";import{useMDXComponents as r}from"./index-BLKynSmM.js";import{M as l}from"./index-DvK65IPP.js";import"./index-Cqyox1Tj.js";import"./index-D-LGQApf.js";import"./iframe-DTK7Rc-o.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";function i(s){const e={a:"a",br:"br",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...s.components};return n.jsxs(n.Fragment,{children:[n.jsx(l,{title:"Gallery/Advanced: Local RAG"}),`
`,n.jsx(e.h1,{id:"advanced-local-rag",children:"Advanced Local RAG"}),`
`,n.jsxs(e.p,{children:["This repository demonstrates how to build a ",n.jsx(e.em,{children:"complex Retrieval-Augmented Generation (RAG)"})," system that supports:"]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Real-time streaming"})," of responses (via Server-Sent Events)."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Follow-up questions"})," with conversation history."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Dynamic source filtering"})," from a type-ahead mention (e.g., ",n.jsx(e.code,{children:"@filename"}),")."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Local embeddings"})," and ",n.jsx(e.strong,{children:"local LLM"})," for generation (Qwen2.5-7B-Instruct)."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"LanceDB"})," for in-process vector search over both repository files and user-supplied PDFs."]}),`
`]}),`
`,n.jsx(e.h2,{id:"tech-stack",children:"Tech Stack"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"FastAPI"})," (Python) for the backend."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"React + TypeScript"})," frontend, using ",n.jsx(e.a,{href:"https://github.com/pashpashpash/lexio",rel:"nofollow",children:"Lexio"})," components for Chat, Sources, and advanced query fields."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Local Embedding Model"})," (",n.jsx(e.a,{href:"https://huggingface.co/jinaai/jina-embeddings-v3",rel:"nofollow",children:"jinaai/jina-embeddings-v3"}),") for chunk encoding."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Local LLM"})," (",n.jsx(e.a,{href:"https://huggingface.co/Qwen/Qwen2.5-7B-Instruct",rel:"nofollow",children:"Qwen2.5-7B-Instruct"}),") for text generation."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"LanceDB"})," for vector storage and retrieval."]}),`
`]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"features-overview",children:"Features Overview"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Ingestion of Repository Code + Additional PDFs"}),n.jsx(e.br,{}),`
`,"The system indexes:"]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Source code in this repository (selectively ignoring certain folders and file types)."}),`
`,n.jsxs(e.li,{children:["Any PDF or other supported document placed into ",n.jsx(e.code,{children:"examples/data"}),` (or anywhere you configure).
After indexing, each chunk is stored in LanceDB for later retrieval.`]}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Streaming Responses"}),n.jsx(e.br,{}),`
`,"The backend uses Server-Sent Events (SSE) to stream tokens to the React frontend in real time, giving you partial answers as they’re generated."]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Follow-up Questions"}),n.jsx(e.br,{}),`
`,"You can keep asking questions in the same chat session, enabling the model to retain conversation context."]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Source Filtering"}),n.jsx(e.br,{}),`
`,"By typing ",n.jsx(e.code,{children:"@"})," in the query field, you can mention a particular file (or partial name) to limit retrieval only to chunks from that source."]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Interactive Source Display"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Click on the displayed source references (e.g., PDF links) to open them in the right-hand content viewer."}),`
`,n.jsx(e.li,{children:"Page-level bounding boxes (for PDFs) allow for highlight-based context if chunk bounding boxes are available."}),`
`]}),`
`]}),`
`]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"setup--installation",children:"Setup & Installation"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Clone this repository"})," and navigate into it:"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`git clone <repo_url>
cd examples/advanced-local-rag
`})}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Install backend dependencies"}),":"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`cd backend
pip install -r requirements.txt
`})}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Install frontend dependencies"}),":"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`cd ../frontend
npm install
npm install ../../../lexio --install-links
`})}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Add your documents"}),":"]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Place any PDF or other files you want to index inside ",n.jsx(e.code,{children:"examples/data"})," (or point the code to another folder)."]}),`
`,n.jsx(e.li,{children:"The system will parse and chunk these documents along with your repository files."}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Build the index"}),":"]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["In the ",n.jsx(e.code,{children:"backend"})," folder, run:",`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`python build_index.py
`})}),`
`]}),`
`,n.jsxs(e.li,{children:["This parses, chunks, and embeds your data, then stores it in a LanceDB index at ",n.jsx(e.code,{children:".lancedb"}),"."]}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Start the backend"}),":"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`uvicorn main:app --reload
`})}),`
`,n.jsxs(e.p,{children:["By default, this listens on ",n.jsx(e.code,{children:"http://localhost:8000"}),"."]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Start the frontend"}),":"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-bash",children:`cd ../frontend
npm run dev
`})}),`
`,n.jsxs(e.p,{children:["By default, this is served on ",n.jsx(e.code,{children:"http://localhost:5173"})," (or whichever port Vite chooses)."]}),`
`]}),`
`]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"usage",children:"Usage"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Open the frontend"})," in your browser.",n.jsx(e.br,{}),`
`,"Typically at ",n.jsx(e.a,{href:"http://localhost:5173",rel:"nofollow",children:"http://localhost:5173"}),"."]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Ask a question"})," about the repository data or the PDF you added."]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"The system will retrieve relevant chunks from LanceDB and stream a response from the local LLM."}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"View sources"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"In the chat window, you’ll see clickable references."}),`
`,n.jsx(e.li,{children:"Click on any source link to open it in the content viewer on the right."}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Ask follow-up questions"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Simply type the next query in the chat. The conversation history is maintained on the backend."}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Filter by sources"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Type ",n.jsx(e.code,{children:"@"})," in the query field, then begin typing a filename or snippet."]}),`
`,n.jsx(e.li,{children:"This constrains retrieval to that source only."}),`
`]}),`
`]}),`
`]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"code-overview",children:"Code Overview"}),`
`,n.jsx(e.h3,{id:"frontend-highlights",children:"Frontend Highlights"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:["The main entry point is ",n.jsx(e.code,{children:"App.tsx"}),", which uses Lexio components such as:"]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"<ChatWindow />"})," for streaming conversation."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"<SourcesDisplay />"})," for listing source references."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"<ContentDisplay />"})," for viewing PDF/HTML/Markdown content."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"<AdvancedQueryField />"})," for queries with type-ahead filtering."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"<ErrorDisplay />"})," to catch and display any errors."]}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Source Handling"}),n.jsx(e.br,{}),`
`,"The function ",n.jsx(e.code,{children:"getDataSource"})," fetches the content of a source (PDF, HTML, Markdown) from the backend (",n.jsx(e.code,{children:"/pdfs/<id>"}),"). It then returns the appropriate content type to Lexio (e.g., PDF byte array, HTML string, or Markdown text)."]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Event Parsing"}),n.jsx(e.br,{}),`
`,"The ",n.jsx(e.code,{children:"parseEvent"})," callback in ",n.jsx(e.code,{children:"App.tsx"})," processes SSE messages from the backend. First, it extracts relevant source metadata, then it handles incoming token chunks from the LLM."]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"SSE Retrieval"}),n.jsx(e.br,{}),`
`,n.jsx(e.code,{children:"retrieveAndGenerate"})," calls ",n.jsx(e.code,{children:"http://localhost:8000/api/retrieve-and-generate"})," via SSE to get partial results. This route is used for initial queries."]}),`
`]}),`
`]}),`
`,n.jsx(e.h3,{id:"backend-highlights",children:"Backend Highlights"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[`
`,n.jsxs(e.p,{children:[n.jsx(e.strong,{children:"Main routes"})," are in ",n.jsx(e.code,{children:"main.py"}),", using FastAPI:"]}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:n.jsx(e.code,{children:"/api/retrieve-and-generate"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Takes a single query, computes its embedding, finds relevant chunks in LanceDB, returns them as a “sources” SSE message, then streams LLM output as tokens."}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:n.jsx(e.code,{children:"/api/generate"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Allows follow-up queries with conversation history and an optional list of source IDs to limit retrieval."}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:n.jsx(e.code,{children:"/pdfs/{id}"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Serves the content of a document by ID (PDF, HTML, or Markdown)."}),`
`]}),`
`]}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Embedding & Indexing"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"build_index.py"})," uses the ",n.jsx(e.code,{children:"DocumentConverter"})," (Docling) or a text-based chunker to segment documents, then encodes each chunk with the local embedding model (",n.jsx(e.code,{children:"jinaai/jina-embeddings-v3"}),")."]}),`
`,n.jsx(e.li,{children:"Embeddings are stored in LanceDB, and a vector index (IVF_PQ) is created."}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"LLM Generation"})}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Uses ",n.jsx(e.a,{href:"https://huggingface.co/Qwen/Qwen2.5-7B-Instruct",rel:"nofollow",children:"Qwen2.5-7B-Instruct"})," from Hugging Face, loaded with 4-bit quantization for performance."]}),`
`,n.jsxs(e.li,{children:["Generation is run in a background thread and streamed via ",n.jsx(e.code,{children:"TextIteratorStreamer"}),"."]}),`
`]}),`
`]}),`
`]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"suggestions--next-steps",children:"Suggestions & Next Steps"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Hardware Requirements"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Large models can be RAM/GPU intensive. If you encounter memory issues, consider a smaller model or CPU-friendly settings."}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Configurable Indexing"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["You can modify ",n.jsx(e.code,{children:"IGNORE_DIRECTORIES"})," and ",n.jsx(e.code,{children:"IGNORE_FILES"})," in ",n.jsx(e.code,{children:"build_index.py"})," to exclude certain folders or file types."]}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Extending Source Types"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["The code is written to handle ",n.jsx(e.code,{children:".pdf"}),", ",n.jsx(e.code,{children:".html"}),", ",n.jsx(e.code,{children:".md"}),", or plain text. Adjust ",n.jsx(e.code,{children:"chunk_text_file"})," and ",n.jsx(e.code,{children:"Docling"})," usage to handle additional formats or chunking strategies."]}),`
`]}),`
`]}),`
`]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.p,{children:"Enjoy exploring and extending this advanced RAG example! If you have any questions or issues, feel free to open an issue or submit a PR."})]})}function u(s={}){const{wrapper:e}={...r(),...s.components};return e?n.jsx(e,{...s,children:n.jsx(i,{...s})}):i(s)}export{u as default};
