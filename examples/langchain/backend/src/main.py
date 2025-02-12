import json
import os
from typing import List

import uvicorn
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from sse_starlette import EventSourceResponse
from fastapi.responses import FileResponse, HTMLResponse
import mimetypes
import os.path

# We import the necessary classes from lexio to interact with the frontend
from lexio import SourceReference, RetrievalResult, Message

from src.indexing import DocumentIndexer
from src.utils import convert_bboxes_to_highlights

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


class MessageHistory(BaseModel):
    """A model representing a chat conversation history.

    Attributes:
        messages: List of chat messages in chronological order
    """

    messages: List[Message]


# Initialize components
indexer = DocumentIndexer()

# Check if ChromaDB is set up correctly and contains entries
if not indexer.check_db_setup():
    raise RuntimeError(
        "ChromaDB is not set up correctly or contains no entries. Please run the indexing command to populate the database.")

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
            page = metadata.get("page", 0) + 1
            highlights = convert_bboxes_to_highlights(page, metadata.get("text_bboxes", []))

            result = SourceReference(
                sourceReference=source.replace("data/", ""),
                type="pdf",
                metadata={"page": page},
                relevanceScore=score,
                highlights=[h.model_dump() for h in highlights]
            )
            retrieval_results.append(result)

        return retrieval_results
    except Exception as e:
        print(f"Error in retrieve: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/retrieve-and-generate")
async def retrieve_and_generate(messages: str = Query(...)) -> EventSourceResponse:
    try:
        message_history = MessageHistory.model_validate_json(messages)
        query = message_history.messages[-1].content if message_history.messages else ""
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid message format: {str(e)}")

    # Retrieve relevant documents
    retrieval_results = []
    retrieval_docs = []
    try:
        results = db.similarity_search_with_score(query, k=4)
        for doc, score in results:
            metadata = doc.metadata
            source = metadata.get("source", "unknown.pdf")
            page = metadata.get("page", 0) + 1
            highlights = convert_bboxes_to_highlights(page, metadata.get("text_bboxes", []))

            result = {}
            if str(source).endswith(".pdf"):
                result = SourceReference(
                    sourceReference=source.replace("data/", ""),
                    type="pdf",
                    metadata={"page": page + 1},
                    relevanceScore=score,
                    highlights=[h.model_dump() for h in highlights]
                )
            if str(source).endswith(".xlsx"):
                result = SourceReference(
                    sourceReference=source.replace("data/", ""),
                    type="xlsx",
                    relevanceScore=score,
                    rangesHighlights=[
                        {
                            "sheetName": "Equipment List",
                            "ranges": ["A1:B8", "B9:C15", "C18:E20", "D5:F15", "F9:H15", "B42:E50"]
                        }
                    ]
                )
            if str(source).endswith(".csv"):
                result = SourceReference(
                    sourceReference=source.replace("data/", ""),
                    type="csv",
                    relevanceScore=score,
                    rangesHighlights=[
                        {
                            "sheetName": "Equipment List",
                            "ranges": ["A1:B8", "B9:C15", "C18:E20", "D5:F15", "F9:H15", "B42:E50"]
                        }
                    ]
                )
            retrieval_results.append(result)
            retrieval_docs.append(doc)

    except Exception as e:
        print(f"Error in retrieve: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # Format the context and prompt
    formatted_context = format_docs(retrieval_docs)
    formatted_prompt = prompt.format(
        context=formatted_context,
        history="\n".join([f"{msg.role}: {msg.content}" for msg in message_history.messages[:-1]]),
        input=query
    )

    async def stream():
        # Yield the retrieval results first
        yield {
            "data": json.dumps({
                # We exclude Optional fields since we do not expect them in the frontend if missing
                "sources": [source.model_dump(exclude_none=True) for source in retrieval_results],
            })
        }

        # Then yield the generated text
        async for chunk in llm.astream(formatted_prompt):
            # Convert AIMessageChunk to string before serialization,
            # see https://python.langchain.com/v0.1/docs/expression_language/streaming/
            chunk_text = chunk.content if hasattr(chunk, 'content') else str(chunk)
            yield {"data": json.dumps({"content": chunk_text, "done": False})}

        # Add a final chunk to indicate the end of the stream
        yield {"data": json.dumps({"content": "", "done": True})}

    return EventSourceResponse(stream())


@app.get("/generate")
async def generate_text(messages: str = Query(...)) -> EventSourceResponse:
    try:
        message_history = MessageHistory.model_validate_json(messages)
        query = message_history.messages[-1].content if message_history.messages else ""
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid message format: {str(e)}")

    formatted_context = format_docs([])  # Placeholder for actual document retrieval logic
    formatted_prompt = prompt.format(
        context=formatted_context,
        history="\n".join([f"{msg.role}: {msg.content}" for msg in message_history.messages[:-1]]),
        input=query
    )

    async def stream():
        async for chunk in llm.astream(formatted_prompt):
            # Convert AIMessageChunk to string before serialization,
            # see https://python.langchain.com/v0.1/docs/expression_language/streaming/
            chunk_text = chunk.content if hasattr(chunk, 'content') else str(chunk)
            yield {"data": json.dumps({"content": chunk_text, "done": False})}

        # Add a final chunk to indicate the end of the stream
        yield {"data": json.dumps({"content": "", "done": True})}

    return EventSourceResponse(stream())


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
        base_path = os.path.abspath("data")
        file_path = os.path.normpath(os.path.join(base_path, filename))

        if not file_path.startswith(base_path):
            raise HTTPException(status_code=400, detail="Invalid file path")

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
        elif content_type in ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"]:
            return FileResponse(
                file_path,
                media_type=content_type,
                filename=filename
            )
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
    uvicorn.run(app, host="localhost", port=8000)
    return 0


if __name__ == "__main__":
    main()