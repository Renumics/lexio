# Langchain Demo

[//]: # (TODO: write a good readme -> use case, features, how to get started)
This demo shows how to use the RAG UI components with a Langchain-powered backend.

## Setup

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -e .
```

4. Create a `.env` file with your OpenAI API key:
```bash
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

5. Index the documents:
```bash
index-files
```

6. Start the backend server:
```bash
run-server
```

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## Features

- Chat interface with streaming responses
- Powered by GPT-3.5 Turbo
- Conversation history support 