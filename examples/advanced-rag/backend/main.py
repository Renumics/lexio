from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import db_utils
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from concurrent.futures import ThreadPoolExecutor
from lancedb.pydantic import Vector
app = FastAPI()
executor = ThreadPoolExecutor(max_workers=1)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model globally
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
model_name = "HuggingFaceTB/SmolLM2-1.7B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name).to(device)

class Message(BaseModel):
    role: str
    content: str

class QueryRequest(BaseModel):
    query: str

def generate_response(messages: List[Message], context: str = "") -> str:
    """Generate response using SmolLM2"""
    formatted_messages = [{"role": msg.role, "content": msg.content} for msg in messages]
    if context:
        last_user_msg = formatted_messages[-1]["content"]
        formatted_messages[-1]["content"] = f"{last_user_msg}\n\nContext:\n{context}"
    
    input_text = tokenizer.apply_chat_template(formatted_messages, tokenize=False)
    inputs = tokenizer.encode(input_text, return_tensors="pt").to(device)
    
    with torch.no_grad():
        outputs = model.generate(
            inputs,
            max_new_tokens=512,
            do_sample=False
        )
    
    return tokenizer.decode(outputs[0][len(inputs[0]):], skip_special_tokens=True)

@app.post("/api/retrieve-and-generate")
async def retrieve_and_generate(request: QueryRequest):
    """One-shot retrieve and generate endpoint"""
    try:
        # Search and get relevant chunks
        query_embedding = db_utils.get_model().encode(request.query)
        table = db_utils.get_table()
        results = table.search(query=query_embedding, vector_column_name="embedding").limit(5).to_list()
        
        # Create context from results
        context = "\n".join([f"From {r['doc_path']}: {r['text']}" for r in results])
        
        # Generate response
        messages = [Message(role="user", content=request.query)]
        response = executor.submit(generate_response, messages, context).result()
        
        return {
            "sources": [
                {
                    "doc_path": result["doc_path"],
                    "text": result["text"],
                    "id": result["id"],
                    "score": float(result.score) if hasattr(result, "score") else None
                }
                for result in results
            ],
            "response": response
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/generate")
async def generate(messages: List[Message], source_ids: Optional[List[str]] = None):
    """Generate follow-up response using message history and optional source filtering"""
    try:
        context = ""
        if source_ids:
            # Get specific chunks by IDs
            table = db_utils.get_table()
            # Fix the SQL syntax by using proper IN clause format
            source_ids_str = "('" + "','".join(source_ids) + "')"
            chunks = table.search().where(f"id in {source_ids_str}", prefilter=True).to_list()
            context = "\n".join([f"From {chunk['doc_path']}: {chunk['text']}" for chunk in chunks])
        
        response = executor.submit(generate_response, messages, context).result()
        return {"response": response}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
