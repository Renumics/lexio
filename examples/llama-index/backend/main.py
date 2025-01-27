import pickle
from pathlib import Path
from io import BytesIO
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

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, load_index_from_storage

persist_dir = "index_storage"
DATA_FOLDER = os.path.dirname(os.path.abspath(__file__)) + "/data"
try:
    storage_context = StorageContext.from_defaults(persist_dir=persist_dir)
    index = load_index_from_storage(storage_context)
except FileNotFoundError:
    index = VectorStoreIndex.from_documents(SimpleDirectoryReader(DATA_FOLDER).load_data())
    index.storage_context.persist(persist_dir=persist_dir)

query_engine = index.as_query_engine()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/query")
#def query(question: str):
async def retrieve_and_generate(messages: str = Query(...)):
    response = query_engine.query(messages)
    print(response)
    return response

@app.get("/getDataSource")
async def get_data_source(source_reference: str):
    path = DATA_FOLDER + "/" + source_reference
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, filename=source_reference)

if __name__ == "__main__":
    uvicorn.run(app, port=8000)
