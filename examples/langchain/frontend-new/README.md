# Lexio Example

This repository demonstrates how to build a _complex Retrieval-Augmented Generation (RAG)_ system that supports:

- **Real-time streaming** of responses (via Server-Sent Events).
- **Follow-up questions** with conversation history.
- **Dynamic source filtering** from a type-ahead mention (e.g., `@filename`).
- **Local embeddings** and **local LLM** for generation (Qwen2.5-7B-Instruct).
- **LanceDB** for in-process vector search over both repository files and user-supplied PDFs.

## Tech Stack

1. **FastAPI** (Python) for the backend.
2. **React + TypeScript** frontend, using [Lexio](https://github.com/pashpashpash/lexio) components for Chat, Sources, and advanced query fields.
3. **Local Embedding Model** ([jinaai/jina-embeddings-v3](https://huggingface.co/jinaai/jina-embeddings-v3)) for chunk encoding.
4. **Local LLM** ([Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)) for text generation.
5. **LanceDB** for vector storage and retrieval.

---

## Features Overview

1. **Ingestion of Repository Code + Additional PDFs**  
   The system indexes:
    - Source code in this repository (selectively ignoring certain folders and file types).
    - Any PDF or other supported document placed into `examples/data` (or anywhere you configure).
      After indexing, each chunk is stored in LanceDB for later retrieval.

2. **Streaming Responses**  
   The backend uses Server-Sent Events (SSE) to stream tokens to the React frontend in real time, giving you partial answers as they’re generated.

3. **Follow-up Questions**  
   You can keep asking questions in the same chat session, enabling the model to retain conversation context.

4. **Source Filtering**  
   By typing `@` in the query field, you can mention a particular file (or partial name) to limit retrieval only to chunks from that source.

5. **Interactive Source Display**
    - Click on the displayed source references (e.g., PDF links) to open them in the right-hand content viewer.
    - Page-level bounding boxes (for PDFs) allow for highlight-based context if chunk bounding boxes are available.

---

## Setup & Installation

1. **Clone this repository** and navigate into it:
   ```bash
   git clone <repo_url>
   cd examples/rag-ui
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   npm install ../../../lexio --install-links
   ```

4. **Add your documents**:
    - Place any PDF or other files you want to index inside `examples/data` (or point the code to another folder).
    - The system will parse and chunk these documents along with your repository files.

5. **Build the index**:
    - In the `backend` folder, run:
      ```bash
      python build_index.py
      ```
    - This parses, chunks, and embeds your data, then stores it in a LanceDB index at `.lancedb`.

6. **Start the backend**:
   ```bash
   uvicorn main:app --reload
   ```
   By default, this listens on `http://localhost:8000`.

7. **Start the frontend**:
   ```bash
   cd ../frontend
   npm run dev
   ```
   By default, this is served on `http://localhost:5173` (or whichever port Vite chooses).

---

## Usage

1. **Open the frontend** in your browser.  
   Typically at [http://localhost:5173](http://localhost:5173).

2. **Ask a question** about the repository data or the PDF you added.
    - The system will retrieve relevant chunks from LanceDB and stream a response from the local LLM.

3. **View sources**
    - In the chat window, you’ll see clickable references.
    - Click on any source link to open it in the content viewer on the right.

4. **Ask follow-up questions**
    - Simply type the next query in the chat. The conversation history is maintained on the backend.

5. **Filter by sources**
    - Type `@` in the query field, then begin typing a filename or snippet.
    - This constrains retrieval to that source only.

---

## Code Overview

### Frontend Highlights

- The main entry point is `App.tsx`. The wrapper component `src/components/ApplicationMainContent.tsx` uses Lexio components such as:
    - `<ChatWindow />` for streaming conversation.
    - `<SourcesDisplay />` for listing source references.
    - `<ContentDisplay />` for viewing PDF, HTML, Markdown and Spreadsheets(xlsx and csv) content.
    - `<AdvancedQueryField />` for queries with type-ahead filtering.
    - `<ErrorDisplay />` to catch and display any errors.

- **Source Handling**  
  The function `getDataSource` fetches the content of a source (PDF, HTML, Markdown) from the backend (`/pdfs/<id>`). It then returns the appropriate content type to Lexio (e.g., PDF byte array, HTML string, or Markdown text).

- **Event Parsing**  
  The `parseEvent` callback in `App.tsx` processes SSE messages from the backend. First, it extracts relevant source metadata, then it handles incoming token chunks from the LLM.

- **SSE Retrieval**  
  `retrieveAndGenerate` calls `http://localhost:8000/api/retrieve-and-generate` via SSE to get partial results. This route is used for initial queries.

### Backend Highlights

- **Main routes** are in `main.py`, using FastAPI:
    1. **`/api/retrieve-and-generate`**
        - Takes a single query, computes its embedding, finds relevant chunks in LanceDB, returns them as a “sources” SSE message, then streams LLM output as tokens.
    2. **`/api/generate`**
        - Allows follow-up queries with conversation history and an optional list of source IDs to limit retrieval.
    3. **`/pdfs/{id}`**
        - Serves the content of a document by ID (PDF, HTML, or Markdown).

- **Embedding & Indexing**
    - `build_index.py` uses the `DocumentConverter` (Docling) or a text-based chunker to segment documents, then encodes each chunk with the local embedding model (`jinaai/jina-embeddings-v3`).
    - Embeddings are stored in LanceDB, and a vector index (IVF_PQ) is created.

- **LLM Generation**
    - Uses [Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct) from Hugging Face, loaded with 4-bit quantization for performance.
    - Generation is run in a background thread and streamed via `TextIteratorStreamer`.

---

## Suggestions & Next Steps

- **Hardware Requirements**
    - Large models can be RAM/GPU intensive. If you encounter memory issues, consider a smaller model or CPU-friendly settings.
- **Configurable Indexing**
    - You can modify `IGNORE_DIRECTORIES` and `IGNORE_FILES` in `build_index.py` to exclude certain folders or file types.
- **Extending Source Types**
    - The code is written to handle `.pdf`, `.html`, `.md`, or plain text. Adjust `chunk_text_file` and `Docling` usage to handle additional formats or chunking strategies.

---

Enjoy exploring and extending this advanced RAG example! If you have any questions or issues, feel free to open an issue or submit a PR.
