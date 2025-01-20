import json
import os
from typing import Any, Dict, List

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from sse_starlette import EventSourceResponse
from fastapi.responses import FileResponse, HTMLResponse
import mimetypes
import os.path

from .indexing import DocumentIndexer

# Load environment variables
load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable is not set")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    """A model representing a chat message.

    Attributes:
        role: The role of the message sender (e.g., 'user', 'assistant')
        content: The content of the message
    """

    role: str
    content: str


class MessageHistory(BaseModel):
    """A model representing a chat conversation history.

    Attributes:
        messages: List of chat messages in chronological order
    """

    messages: List[Message]


class MessagesRequest(BaseModel):
    """A model representing the expected JSON schema for the messages query parameter.
    
    Example:
        {
            "messages": [
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi there!"},
                {"role": "user", "content": "How are you?"}
            ]
        }
    
    Attributes:
        messages: List of chat messages, where each message has a role and content
    """
    messages: List[Message]

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "messages": [
                        {"role": "user", "content": "Was ist Machine Learning?"},
                        {"role": "assistant", "content": "Machine Learning ist ein Teilbereich der KI..."},
                        {"role": "user", "content": "Kannst du das genauer erklären?"}
                    ]
                }
            ]
        }
    }


class RetrievalResult(BaseModel):
    """A model representing a document retrieval result.

    Attributes:
        source: The source document identifier
        type: The type of document (e.g., 'pdf')
        metadata: Additional metadata about the document
        highlights: List of highlighted regions in the document
    """

    source: str
    type: str
    metadata: Dict[str, Any]
    highlights: List[Dict[str, Any]] = []


# Initialize components
indexer = DocumentIndexer()

# Check if ChromaDB is set up correctly and contains entries
if not indexer.check_db_setup():
    raise RuntimeError("ChromaDB is not set up correctly or contains no entries. Please run the indexing command to populate the database.")

db = indexer.get_db()

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7, streaming=True)

template = """You are a helpful AI assistant. Answer the user's questions based on the conversation history and the retrieved context.

Context from documents:
{context}

Previous conversation:
{history}

User: {input}
Assistant: """

prompt = ChatPromptTemplate.from_template(template)


def format_docs(docs) -> str:
    """Format a list of documents into a string representation.

    Args:
        docs: List of documents to format

    Returns:
        A string containing the formatted document contents
    """
    return "\n\n".join(f"Document: {doc.page_content}" for doc in docs)


@app.get("/retrieve")
async def retrieve(query: str = Query(...)) -> List[RetrievalResult]:
    """Retrieve relevant documents for a query."""
    try:
        results = db.similarity_search_with_score(query, k=4)
        
        retrieval_results = []
        for doc, score in results:
            metadata = doc.metadata
            source = metadata.get("source", "unknown.pdf")
            page = metadata.get("page", 0)
            
            # Create highlight for the page (this is a simplified version)
            highlight = {
                "page": page,
                "rect": {
                    "top": 0.1,
                    "left": 0.1,
                    "width": 0.8,
                    "height": 0.1
                }
            }
            
            result = RetrievalResult(
                source=source.replace("data/", ""),
                type="pdf",
                metadata={"page": page, "score": score},
                highlights=[highlight]
            )
            retrieval_results.append(result)
        
        return retrieval_results
    except Exception as e:
        print(f"Error in retrieve: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate")
async def generate_text(messages: MessagesRequest):
    """Generate text based on message history using the language model.

    Args:
        messages: Message history as MessagesRequest object

    Returns:
        Server-sent events stream of generated text chunks

    Raises:
        HTTPException: If message format is invalid
    """
    try:
        # Get the last message for context retrieval
        last_message = messages.messages[-1].content
        context_docs = db.similarity_search(last_message)
        
        # Format the context and history
        context = format_docs(context_docs)
        history = "\n".join([
            f"{m.role}: {m.content}" 
            for m in messages.messages[:-1]
        ])
        
        # Create the chain
        chain = prompt | llm | StrOutputParser()

        async def stream():
            async for chunk in chain.astream({
                "context": context,
                "history": history,
                "input": last_message
            }):
                yield {
                    "data": json.dumps({
                        "content": chunk,
                        "done": False
                    })
                }
            yield {
                "data": json.dumps({
                    "content": "",
                    "done": True
                })
            }

        return EventSourceResponse(stream())
    except Exception as e:
        print(f"Error in generate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sources/{filename}")
async def get_source(filename: str):
    """Serve source files (PDF or HTML) with appropriate content type.

    Args:
        filename: Name of the file to serve

    Returns:
        FileResponse or HTMLResponse depending on file type

    Raises:
        HTTPException: If file not found or invalid type
    """
    try:
        # Assuming files are stored in a 'data' directory relative to the backend
        file_path = os.path.join("data", filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Determine content type from file extension
        content_type, _ = mimetypes.guess_type(file_path)
        
        if content_type == "application/pdf":
            return FileResponse(
                file_path,
                media_type="application/pdf",
                filename=filename
            )
        elif content_type in ["text/html", "text/plain"]:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return HTMLResponse(content=content)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type"
            )
            
    except Exception as e:
        print(f"Error serving file {filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def main():
    """Entry point for the FastAPI server."""
    uvicorn.run(app, host="0.0.0.0", port=8000)
    return 0


if __name__ == "__main__":
    main()