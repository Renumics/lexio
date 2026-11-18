# Lexio RAG Demo with Langchain, ChromaDB, and OpenAI + PDF Highlights with PyMuPDF

![Lexio Logo](./frontend/src/assets/lexio.svg)

This repository demonstrates how to build a Retrieval-Augmented Generation (RAG) system on PDF data using 
Langchain, ChromaDB, PyMuPDF and the Lexio UI components. The demo showcases:

- **Advanced PDF Processing** with PyMuPDF for intelligent text extraction and highlighting
- **Real-time streaming** of responses (via Server-Sent Events)
- **Document retrieval** from a ChromaDB vector store
- **Modern React frontend** with Lexio UI components

## Tech Stack

1. **FastAPI** (Python) for the backend
2. **React + TypeScript** frontend using [Lexio](https://github.com/Renumics/lexio) components
3. **PyMuPDF** for advanced PDF processing and text position extraction
4. **Langchain** for document processing and LLM integration
5. **ChromaDB** for vector storage and retrieval
6. **OpenAI** for embeddings and text generation

## Features Overview

1. **Advanced PDF Processing & Display**
   - Intelligent PDF text extraction with positional information
   - Automatic highlighting of relevant text passages
   - Precise bounding box calculation for text spans
   - Interactive PDF viewer with highlight overlay support

2. **Document Processing & Storage**
   - Automatic indexing of PDF documents placed in the `data` directory
   - Smart text chunking with positional metadata preservation
   - ChromaDB vector store for efficient retrieval

3. **Streaming Responses**
   - Real-time token streaming via Server-Sent Events (SSE)
   - Immediate feedback as responses are generated

4. **Conversation Context**
   - Support for follow-up questions
   - Maintains conversation history for contextual responses

5. **Modern UI Components**
   - Chat interface with streaming support
   - Interactive PDF viewer with highlight support
   - Clean query interface for natural language questions

## Setup & Installation

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate
# or
uv venv
```

3. Install dependencies:
```bash
pip install -e ../../../python/lexio -e .
# or
uv sync --locked
```

4. Create a `.env` file with your OpenAI API key:
```bash
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

5. Add your documents to the `data` directory

6. Index the documents:
```bash
index-files # with the pip environment activated
# or
uv run --locked index-files
```

7. Start the backend server:
```bash
run-server # with the pip environment activated
# or
uv run --locked run-server
```

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install --frozen-lockfile
pnpm --filter lexio build
```

The source checkout uses a pnpm workspace. To use the published library in another frontend, install it with `npm install lexio` or `pnpm add lexio`.

3. Start the development server:
```bash
npm run dev
# or
pnpm run dev
```

4. Open http://localhost:5173 in your browser

## Project Structure

### Backend Components

- **PDF Processing**: PyMuPDF-powered text extraction with positional information
- **Document Indexing**: Uses Langchain's document loaders and text splitters for processing
- **Vector Store**: ChromaDB for efficient similarity search
- **API Routes**: FastAPI endpoints for querying and document retrieval
- **Streaming**: SSE implementation for real-time response streaming

### Frontend Components

- **Content Display with PDFViewer + MarkdownViewer + HTMLViewer**: Interactive document display with highlight overlay
- **ChatWindow**: Real-time conversation with streaming responses
- **AdvancedQueryField**: Clean interface for user questions

## Development

The project uses modern development tools and practices:

- **Type Safety**: TypeScript for frontend, Python type hints for backend
- **Code Quality**: ESLint, Prettier, Black, and Ruff for code formatting
- **Development Server**: Vite for frontend, Uvicorn for backend
- **Package Management**: pnpm for frontend, uv for backend

## Quick Start with Make

For convenience, you can use the provided Makefile commands:

```bash
make setup-backend    # Set up the Python environment and install dependencies
make index            # Index the PDF documents - assert that the data directory is populated
make setup-frontend   # Install frontend dependencies
make start-backend    # Start the FastAPI server
make start-frontend   # Start the Vite development server
```

## Docker Setup

Build both images from the repository root so the local Lexio packages are included:

```bash
docker build -f examples/langchain/backend/Dockerfile -t lexio-langchain-backend .
docker build -f examples/langchain/frontend/Dockerfile -t lexio-langchain-frontend .
```

Index your PDFs using the backend steps above, then start the containers on a shared network:

```bash
docker network create lexio-langchain
docker run -d --name backend --network lexio-langchain -p 8000:8000 \
  --env-file examples/langchain/backend/.env \
  -v "$PWD/examples/langchain/backend/data:/app/examples/langchain/backend/data" \
  -v "$PWD/examples/langchain/backend/.chroma:/app/examples/langchain/backend/.chroma" \
  lexio-langchain-backend
docker run --rm --network lexio-langchain -p 5173:80 lexio-langchain-frontend
```

Open http://localhost:5173 in your browser.

## Requirements

- Make (optional)
- Python 3.12 or higher
- Node.js 24.22.2
- OpenAI API key
- Modern web browser with SSE support

---
