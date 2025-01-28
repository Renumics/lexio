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
model_name = "Qwen/Qwen2.5-7B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto", load_in_4bit=True).to(device)

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
                    do_sample=False  # set to True if you'd like more "interactive" sampling
                )
        finally:
            # Ensure streamer is properly ended even if generation fails
            streamer.end()

    # 4) Start generation in a background thread
    thread = Thread(target=run_generation)
    thread.start()

    # 5) Return the streamer to the caller
    return streamer

class RetrieveAndGenerateRequest(BaseModel):
    query: str

@app.post("/api/retrieve-and-generate")
async def retrieve_and_generate(request: RetrieveAndGenerateRequest):
    """
    SSE endpoint that:
      1) Retrieves relevant chunks from your DB
      2) Yields a JSON with 'sources' first
      3) Streams tokens from the model as they are generated (real time)
    """
    query = request.query
    try:
        # Start timing
        start_time = time.time()
        
        # 1) Time the embedding generation
        embed_start = time.time()
        query_embedding = db_utils.get_model().encode(query)
        embed_time = time.time() - embed_start
        print(f"Embedding generation took: {embed_time:.2f} seconds")
        
        # 2) Time the database search
        search_start = time.time()
        table = db_utils.get_table()
        results = (
            table.search(query=query_embedding, vector_column_name="embedding")
                 .limit(5)
                 .to_list()
        )

        search_time = time.time() - search_start
        print(f"Database search took: {search_time:.2f} seconds")
        
        # 3) Time the sources processing
        process_start = time.time()
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
        process_time = time.time() - process_start
        print(f"Processing results took: {process_time:.2f} seconds")

        # Log total preparation time
        total_prep_time = time.time() - start_time
        print(f"Total preparation time: {total_prep_time:.2f} seconds")

        # 4) Build context
        context_str = "\n\n".join([
            f"[Document: {r['doc_path']}]\n{r['text']}"
            for r in results
        ])
        messages = [Message(role="user", content=query)]

        # 5) Create async generator to yield SSE
        async def event_generator():
            try:
                # First yield the sources
                yield {"data": json.dumps({"sources": sources})}

                # Now create the streamer & generate tokens
                streamer = generate_stream(messages, context_str)

                # For each partial token, yield SSE data
                for token in streamer:
                    if token:  # Only send if token is not empty
                        try:
                            data = json.dumps({"content": token, "done": False})
                            yield {"data": data}
                            await asyncio.sleep(0)  # let the event loop flush data
                        except Exception as e:
                            print(f"Error during token streaming: {str(e)}")
                            continue

                # Finally, yield "done"
                yield {"data": json.dumps({"content": "", "done": True})}
            except Exception as e:
                print(f"Error in event generator: {str(e)}")
                yield {"data": json.dumps({"error": str(e)})}

        # 6) Return SSE
        return EventSourceResponse(event_generator())

    except Exception as e:
        return {"error": str(e)}
    
class GenerateRequest(BaseModel):
    messages: List[Message]
    source_ids: Optional[List[str]] = None

@app.post("/api/generate")
async def generate_endpoint(request: GenerateRequest):
    """
    SSE endpoint for follow-up requests using:
      - messages: list of previous chat messages
      - source_ids: optional list of doc references to build context
    Streams the model response in real time.
    """
    try:
        # No need to parse messages JSON string anymore
        messages_list = request.messages
        
        # Use source_ids directly as a list
        source_ids_list = request.source_ids
        
        # 1) Build context from source IDs (if provided)
        context_str = ""
        if source_ids_list:
            table = db_utils.get_table()
            source_ids_str = "('" + "','".join(source_ids_list) + "')"
            chunks = table.search().where(f"id in {source_ids_str}", prefilter=True).to_list()
            context_str = "\n\n".join([
                f"[Document: {chunk['doc_path']}]\n{chunk['text']}"
                for chunk in chunks
            ])

        # 2) Build async generator for SSE
        async def event_generator():
            try:
                # Create the streamer
                streamer = generate_stream(messages_list, context_str)

                # For each partial token, yield SSE data
                for token in streamer:
                    if token:  # Only send if token is not empty
                        try:
                            data = json.dumps({"content": token, "done": False})
                            yield {"data": data}
                            await asyncio.sleep(0)  # yield control so data can flush
                        except Exception as e:
                            print(f"Error during token streaming: {str(e)}")
                            continue

                # Finally, yield "done"
                yield {"data": json.dumps({"content": "", "done": True})}
            except Exception as e:
                print(f"Error in event generator: {str(e)}")
                yield {"data": json.dumps({"error": str(e)})}

        # 3) Return SSE
        return EventSourceResponse(event_generator())

    except Exception as e:
        return {"error": str(e)}

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
