from io import BytesIO
import random
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from typing import List, AsyncIterable, Dict, Any, Union
import os
import json
from pydantic import BaseModel
from pypdf import PdfReader, PdfWriter
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette import EventSourceResponse
import asyncio


class PDFHighlight(BaseModel):
    page: int
    rect: Dict[str, float]
    comment: str | None = None

class BaseRetrievalResult(BaseModel):
    sourceName: str | None = None
    relevanceScore: float | None = None
    metadata: Dict[str, Any] | None = None
    highlights: List[PDFHighlight] | None = None

class SourceReference(BaseRetrievalResult):
    sourceReference: str
    type: str

class TextContent(BaseRetrievalResult):
    text: str

RetrievalResult = Union[SourceReference, TextContent]

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
def extract_pdf_page(file_path: str, page_number: int) -> BytesIO:
    try:
        reader = PdfReader(file_path)
        if page_number < 0 or page_number >= len(reader.pages):
            raise HTTPException(status_code=400, detail="Invalid page number")
        
        # Create a new PDF with the specified page
        writer = PdfWriter()
        writer.add_page(reader.pages[page_number])
        
        # Write the new PDF to an in-memory bytes buffer
        pdf_buffer = BytesIO()
        writer.write(pdf_buffer)
        pdf_buffer.seek(0)  # Reset buffer position to the beginning
        
        return pdf_buffer
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper function to list PDF files in the data directory
def list_pdf_files() -> List[SourceReference]:
    pdf_directory = "data"
    files = []
    for filename in os.listdir(pdf_directory):
        if filename.endswith(".pdf"):
            files.append(SourceReference(
                sourceReference=filename,
                type="pdf",
                sourceName=filename,
                relevanceScore=random.uniform(0.0, 0.99),
                metadata={"title": filename},
                highlights=[PDFHighlight(
                    page=1,
                    rect={
                        "top": 0.1,
                        "left": 0.25,
                        "width": 0.5,
                        "height": 0.6
                    },
                    comment="Relevant section"
                )]
            ))
    return files

# Helper function to list HTML files in the data directory
def list_html_files() -> List[SourceReference]:
    html_directory = "data"
    files = []
    for filename in os.listdir(html_directory):
        if filename.endswith(".html"):
            files.append(SourceReference(
                sourceReference=filename,
                type="html",
                sourceName=filename or "",  # Ensure sourceName is never None
                relevanceScore=random.uniform(0.0, 0.99),
                metadata={"title": filename}
            ))
    return files

# Helper function to list markdown files in the data directory
def list_markdown_files() -> List[SourceReference]:
    markdown_directory = "data"
    files = []
    for filename in os.listdir(markdown_directory):
        if filename.endswith(".md"):
            files.append(SourceReference(
                sourceReference=filename,
                type="markdown",
                sourceName=filename or "",  # Ensure sourceName is never None
                relevanceScore=random.uniform(0.0, 0.99),
                metadata={"title": filename}
            ))
    return files

def retrieve_helper(query: str) -> List[RetrievalResult]:
    # Mock retrieval based on the presence of the query in the filename
    pdf_files = list_pdf_files()
    html_files = list_html_files()
    markdown_files = list_markdown_files()
    
    # Add some text content as well
    text_content = TextContent(
        text="<div><h1>Quick Tips</h1>Here are some relevant tips about your query.</div>",
        sourceName="Quick Tips",
        relevanceScore=0.82,
        metadata={"type": "Tips"}
    )
    
    retrieved_sources: List[RetrievalResult] = [
        source for source in pdf_files + html_files + markdown_files
        if source.sourceName and any(query_part.lower() in source.sourceName.lower() for query_part in query.split())
    ]
    
    # Always add the text content for demonstration
    retrieved_sources.append(text_content)
    
    return retrieved_sources

# Endpoint to retrieve sources
@app.get("/retrieve")
async def retrieve(query: str = Query(...)) -> List[RetrievalResult]:
    return retrieve_helper(query)

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
            "content": f"Generated text based on query: {query}"
        })}
        await asyncio.sleep(0.5)
        yield {"data": json.dumps({
            "content": " Hope this helps!",
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
                "sources": [source.model_dump() for source in retrieved_sources],
            })
        }

        # Simulate streaming text generation like in streaming.stories.tsx
        yield {"data": json.dumps({"content": "Based on the document, "})}
        await asyncio.sleep(0.5)
        
        yield {"data": json.dumps({"content": "the answer is..."})}
        await asyncio.sleep(0.5)
        
        yield {"data": json.dumps({"content": " Hope this helps!", "done": True})}

    return EventSourceResponse(event_generator())

# Endpoint to access PDFs
@app.get("/pdfs/{filename}")
async def get_pdf(filename: str, page: int = Query(None, description="Page number to retrieve")):
    pdf_directory = "data"
    file_path = os.path.join(pdf_directory, filename)
    if os.path.exists(file_path):
        if page is not None:
            pdf_buffer = extract_pdf_page(file_path, page)
            return StreamingResponse(pdf_buffer, media_type='application/pdf', headers={
                "Content-Disposition": f"attachment; filename=page_{page}.pdf"
            })
        else:
            return FileResponse(file_path, media_type='application/pdf', filename=filename)
    else:
        raise HTTPException(status_code=404, detail="PDF not found")

# Endpoint to access HTML files
@app.get("/htmls/{filename}")
async def get_html(filename: str):
    html_directory = "data"
    file_path = os.path.join(html_directory, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='text/html', filename=filename)
    else:
        raise HTTPException(status_code=404, detail="HTML file not found")

# Endpoint to access markdown files
@app.get("/markdowns/{filename}")
async def get_markdown(filename: str):
    markdown_directory = "data"
    file_path = os.path.join(markdown_directory, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='text/markdown', filename=filename)
    else:
        raise HTTPException(status_code=404, detail="Markdown file not found")