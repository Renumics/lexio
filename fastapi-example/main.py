import random
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from typing import List, AsyncIterable, Dict, Any
import os
import json
from pydantic import BaseModel
from pypdf import PdfReader, PdfWriter
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette import EventSourceResponse
import asyncio


class RetrievalResult(BaseModel):
    source: str
    type: str

class Message(BaseModel):
    role: str
    content: str

class MessageHistory(BaseModel):
    messages: List[Message]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to extract a specific page from a PDF and save it as a new PDF
def extract_pdf_page(file_path: str, page_number: int) -> str:
    try:
        reader = PdfReader(file_path)
        if page_number < 0 or page_number >= len(reader.pages):
            raise HTTPException(status_code=400, detail="Invalid page number")
        
        # Create a new PDF with the specified page
        writer = PdfWriter()
        writer.add_page(reader.pages[page_number])
        
        # Save the new PDF to a temporary file
        temp_file_path = f"temp_page_{page_number}.pdf"
        with open(temp_file_path, "wb") as temp_file:
            writer.write(temp_file)
        
        return temp_file_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper function to list PDF files in the data directory
def list_pdf_files() -> List[Dict[str, Any]]:
    pdf_directory = "data"
    files = []
    for filename in os.listdir(pdf_directory):
        if filename.endswith(".pdf"):
            files.append({"source": filename, "type": "pdf"})
    return files

# Create a model for the request body
class QueryRequest(BaseModel):
    query: str

def retrieve_helper(query: str):
    # Mock retrieval based on the presence of the query in the filename
    pdf_files = list_pdf_files()
    retrieved_sources = [
        {**file, "metadata": {"page": random.randint(1, 3)}} 
        for file in pdf_files 
        if any(query_part.lower() in file["source"].lower() for query_part in query.split())
    ]
    return retrieved_sources

# Endpoint to retrieve sources
@app.get("/retrieve", response_model=List[Dict[str, Any]])
async def retrieve(request: QueryRequest):
    return retrieve_helper(request.query)

# Update the generate endpoint to use GET
@app.get("/generate")
async def generate_text(messages: str = Query(...)) -> EventSourceResponse:
    try:
        message_history = MessageHistory.model_validate_json(messages)
        query = message_history.messages[-1].content if message_history.messages else ""
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid message format: {str(e)}")
    
    async def stream():
        yield {"data": json.dumps({
            "content": f"Generated text based on query: {query}",
            "done": False
        })}
        yield {"data": json.dumps({
            "content": "",
            "done": True
        })}

    return EventSourceResponse(stream())

# Update the retrieve-and-generate endpoint to use GET
@app.get("/retrieve-and-generate")
async def retrieve_and_generate(messages: str = Query(...)):
    # Parse the URL-encoded JSON string back to MessageHistory
    try:
        message_history = MessageHistory.model_validate_json(messages)
        query = message_history.messages[-1].content if message_history.messages else ""
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid message format: {str(e)}")
    
    async def event_generator():
        retrieved_sources = retrieve_helper(query)
        
        # Send sources first
        yield {
            "data": json.dumps({
                "sources": retrieved_sources,
            })
        }

        # Simulate streaming text generation
        text_chunks = [
            "Generated text ",
            "based on ",
            f"query: {query}. ",
            "This is some additional ",
            "streaming content ",
            "being generated ",
            "word by word..."
        ]
        
        # Stream each chunk with a delay
        for chunk in text_chunks:
            await asyncio.sleep(random.uniform(0.1, 0.5))
            yield {
                "data": json.dumps({
                    "role": "assistant",
                    "content": chunk,
                    "done": False
                })
            }
        
        # Send completion message
        yield {
            "data": json.dumps({
                "role": "assistant",
                "content": "",
                "done": True
            })
        }

    return EventSourceResponse(event_generator())

# Endpoint to access PDFs
@app.get("/pdfs/{filename}")
async def get_pdf(filename: str, page: int = Query(None, description="Page number to retrieve")):
    pdf_directory = "data"
    file_path = os.path.join(pdf_directory, filename)
    if os.path.exists(file_path):
        if page is not None:
            temp_file_path = extract_pdf_page(file_path, page)
            return FileResponse(temp_file_path, media_type='application/pdf', filename=f"page_{page}.pdf")
        else:
            return FileResponse(file_path, media_type='application/pdf', filename=filename)
    else:
        raise HTTPException(status_code=404, detail="PDF not found")