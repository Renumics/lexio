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
model_name = "HuggingFaceTB/SmolLM2-1.7B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name).to(device)

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
        formatted_messages[-1]["content"] = f"{last_user_msg}\n\nContext:\n{context}"
    
    input_text = tokenizer.apply_chat_template(formatted_messages, tokenize=False)
    inputs = tokenizer.encode(input_text, return_tensors="pt").to(device)

    # 2) Create the streamer (handles partial text as tokens arrive)
    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True)

    # 3) Define a thread function that does generation
    def run_generation():
        with torch.no_grad():
            model.generate(
                inputs=inputs,
                streamer=streamer,
                max_new_tokens=512,
                do_sample=False  # set to True if you'd like more "interactive" sampling
            )

    # 4) Start generation in a background thread so we can read from 'streamer' in the main thread
    thread = Thread(target=run_generation)
    thread.start()

    # 5) Return the streamer to the caller
    return streamer

@app.post("/api/retrieve-and-generate")
async def retrieve_and_generate(request: QueryRequest):
    """
    SSE endpoint that:
      1) Retrieves relevant chunks from your DB
      2) Yields a JSON with 'sources' first
      3) Streams tokens from the model as they are generated (real time)
    """
    try:
        # Start timing
        start_time = time.time()
        
        # 1) Time the embedding generation
        embed_start = time.time()
        query_embedding = db_utils.get_model().encode(request.query)
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
                "text": r["text"],
                "id": r["id"],
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
        context_str = "\n".join([f"From {r['doc_path']}: {r['text']}" for r in results])
        messages = [Message(role="user", content=request.query)]

        # 5) Create async generator to yield SSE
        async def event_generator():
            # First yield the sources
            yield {"data": json.dumps({"sources": sources})}

            # Now create the streamer & generate tokens
            streamer = generate_stream(messages, context_str)

            # For each partial token, yield SSE data
            for token in streamer:
                yield {"data": json.dumps({"content": token, "done": False})}
                await asyncio.sleep(0)  # let the event loop flush data

            # Finally, yield "done"
            yield {"data": json.dumps({"content": "", "done": True})}

        # 6) Return SSE
        return EventSourceResponse(event_generator())

    except Exception as e:
        return {"error": str(e)}

@app.post("/api/generate")
async def generate_endpoint(messages: List[Message], source_ids: Optional[List[str]] = None):
    """
    SSE endpoint for follow-up requests using:
      - messages: previous chat messages
      - source_ids: optional doc references to build context
    Streams the model response in real time.
    """
    try:
        # 1) Build context from source IDs (if provided)
        context_str = ""
        if source_ids:
            table = db_utils.get_table()
            source_ids_str = "('" + "','".join(source_ids) + "')"
            chunks = table.search().where(f"id in {source_ids_str}", prefilter=True).to_list()
            context_str = "\n".join([f"From {chunk['doc_path']}: {chunk['text']}" for chunk in chunks])

        # 2) Build async generator for SSE
        async def event_generator():
            # Create the streamer
            streamer = generate_stream(messages, context_str)

            # For each partial token, yield SSE data
            for token in streamer:
                yield {"data": json.dumps({"content": token, "done": False})}
                await asyncio.sleep(0)  # yield control so data can flush

            # Finally, yield "done"
            yield {"data": json.dumps({"content": "", "done": True})}

        # 3) Return SSE
        return EventSourceResponse(event_generator())

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
