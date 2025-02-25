import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, AsyncIterable
import db_utils
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
import torch
from threading import Thread
from sse_starlette import EventSourceResponse
import json
import time  # Add this import at the top
import os
from fastapi.responses import FileResponse
from fastapi import HTTPException

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Choose device
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

# Load model & tokenizer
model_name = "Qwen/Qwen2.5-7B-Instruct" if device == "cuda" else "HuggingFaceTB/SmolLM2-360M-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name, 
    device_map="auto", 
    load_in_4bit=True if device == "cuda" else False,
    bnb_4bit_compute_dtype=torch.float16  # Set compute dtype to float16
).to(device)

class Message(BaseModel):
    role: str
    content: str

class QueryRequest(BaseModel):
    query: str

def generate_stream(messages: List[Message], context: str = "") -> TextIteratorStreamer:
    """
    Create a TextIteratorStreamer, start model.generate() in a separate thread,
    and immediately return the streamer so we can iterate over tokens in real time.
    """
    # 1) Prepare input text
    formatted_messages = [{"role": msg.role, "content": msg.content} for msg in messages]
    if context:
        last_user_msg = formatted_messages[-1]["content"]
        prompt_template = """User Query: {query}

Reference Documents:
{context}

Please answer the query based on the reference documents above."""
        
        formatted_messages[-1]["content"] = prompt_template.format(
            query=last_user_msg,
            context=context
        )
    
    input_text = tokenizer.apply_chat_template(formatted_messages, tokenize=False)
    inputs = tokenizer.encode(input_text, return_tensors="pt").to(device)

    # 2) Create the streamer (handles partial text as tokens arrive)
    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True)

    # 3) Define a thread function that does generation
    def run_generation():
        try:
            with torch.no_grad():
                model.generate(
                    inputs=inputs,
                    streamer=streamer,
                    max_new_tokens=1024,
                    do_sample=False,
                    top_p=None,
                    top_k=None,
                    temperature=None
                )
        finally:
            # Ensure streamer is properly ended even if generation fails
            streamer.end()

    # 4) Start generation in a background thread
    thread = Thread(target=run_generation)
    thread.start()

    # 5) Return the streamer to the caller
    return streamer


@app.get("/pdfs/{id}")
async def get_pdf(id: str):
    """
    Endpoint to serve document content by looking up the ID in the database.
    Handles both binary (PDF) and text-based (HTML, Markdown) content.
    """
    # First look up the document path using the ID from the database
    table = db_utils.get_table()
    results = table.search().where(f"id = '{id}'", prefilter=True).to_list()
    
    if not results:
        raise HTTPException(status_code=404, detail="Document ID not found")
    
    # Get the document path from the first result
    doc_path = results[0]['doc_path']
    
    if not os.path.exists(doc_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    # Determine content type based on file extension
    if doc_path.endswith('.pdf'):
        return FileResponse(
            doc_path,
            media_type='application/pdf',
            filename=os.path.basename(doc_path)
        )
    elif doc_path.endswith('.html'):
        return FileResponse(
            doc_path,
            media_type='text/html',
            filename=os.path.basename(doc_path)
        )
    else:  # Markdown or other text files
        return FileResponse(
            doc_path,
            media_type='text/plain',
            filename=os.path.basename(doc_path)
        )

class ChatRequest(BaseModel):
    messages: List[Message]
    source_ids: Optional[List[str]] = None

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Unified SSE endpoint that handles both initial queries and follow-ups:
      - messages: list of chat messages (required)
      - source_ids: optional list of specific source IDs to use
        If source_ids are provided, those specific sources will be used as context
        If no source_ids are provided, the system will automatically retrieve relevant sources
        based on the latest user query
    """
    print("Request received:", request)
    try:
        messages_list = request.messages
        print(f"Chat history length: {len(messages_list)}")
        print("Message roles:", [msg.role for msg in messages_list])
        
        context_str = ""
        sources = []
        
        # Get the latest user message as the query for retrieval
        latest_query = next((msg.content for msg in reversed(messages_list) if msg.role == "user"), None)
        
        table = db_utils.get_table()
        
        if request.source_ids:
            # Use specified sources if provided
            print(f"Using provided source IDs: {request.source_ids}")
            source_ids_str = "('" + "','".join(request.source_ids) + "')"
            results = table.search().where(f"id in {source_ids_str}", prefilter=True).to_list()
        else:
            # Otherwise perform semantic search based on the latest query
            print(f"Performing semantic search for: {latest_query}")
            query_embedding = db_utils.get_model().encode(latest_query)
            results = (
                table.search(query=query_embedding, vector_column_name="embedding")
                     .limit(5)
                     .to_list()
            )
        
        # Process results into sources and context
        sources = [
            {
                "doc_path": r["doc_path"],
                "page": r["page_number"],
                "text": r["text"],
                "id": r["id"],
                "highlights": [{
                    "page": r["page_number"],
                    "bbox": {
                        "l": r["bbox_left"],
                        "t": r["bbox_top"],
                        "r": r["bbox_right"],
                        "b": r["bbox_bottom"]
                    }
                }] if all(r.get(k) is not None for k in ["page_number", "bbox_left", "bbox_top", "bbox_right", "bbox_bottom"]) else None,
                "score": float(r.score) if hasattr(r, "score") else None
            }
            for r in results
        ]
        
        context_str = "\n\n".join([
            f"[Document: {r['doc_path']}]\n{r['text']}"
            for r in results
        ])

        # 2) Build async generator for SSE
        async def event_generator():
            try:
                # First yield the sources if we have any
                if sources:
                    yield {"data": json.dumps({"sources": sources})}

                # Create the streamer & generate tokens
                streamer = generate_stream(messages_list, context_str)

                for token in streamer:
                    if token:
                        try:
                            data = json.dumps({"content": token, "done": False})
                            yield {"data": data}
                            await asyncio.sleep(0)
                        except Exception as e:
                            print(f"Error during token streaming: {str(e)}")
                            continue

                yield {"data": json.dumps({"content": "", "done": True})}
            except Exception as e:
                print(f"Error in event generator: {str(e)}")
                yield {"data": json.dumps({"error": str(e)})}

        return EventSourceResponse(event_generator())

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
