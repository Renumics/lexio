import pdfplumber
from pathlib import Path
from llama_index.core import VectorStoreIndex , Document
 
import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware


def extract_and_chunk_text_with_positions(pdf_path, chunk_size=200):
    """
    Extract text and metadata from a PDF file, and chunk the text into s
    maller pieces with bounding boxe for highlighting.
    """
    all_chunks = []
    
    with pdfplumber.open(pdf_path) as pdf:
        current_chunk = {"text": "", "metadata": {"pages": [], "bounding_boxes": []}}
        current_length = 0
        
        for page_number, page in enumerate(pdf.pages, start=1):
            words = page.extract_words()
            
            for word in words:
                word_text = word["text"]
                word_length = len(word_text) + 1  # Include space after the word
                
                # If adding this word exceeds the chunk size, save the current chunk
                if current_length + word_length > chunk_size:
                    bounding_box = {
                        "page_number": page_number,
                        "x0": min(b["x0"] for b in current_chunk["metadata"]["bounding_boxes"])/page.width,
                        "x1": max(b["x1"] for b in current_chunk["metadata"]["bounding_boxes"])/page.width,
                        "top": min(b["top"] for b in current_chunk["metadata"]["bounding_boxes"])/page.height,
                        "bottom": max(b["bottom"] for b in current_chunk["metadata"]["bounding_boxes"])/page.height,
                    }

                    current_chunk["metadata"]["bounding_box"] = bounding_box
                    del current_chunk["metadata"]["bounding_boxes"]

                    all_chunks.append(current_chunk)
                    current_chunk = {"text": "", "metadata": {"pages": [], "bounding_boxes": [], "file_name": pdf_path}}
                    current_length = 0
                
                # Add word to the current chunk
                current_chunk["text"] += word_text + " "
                current_chunk["metadata"]["bounding_boxes"].append({
                    "page_number": page_number,
                    "x0": word["x0"],
                    "x1": word["x1"],
                    "top": word["top"],
                    "bottom": word["bottom"],
                })
                if page_number not in current_chunk["metadata"]["pages"]:
                    current_chunk["metadata"]["pages"].append(page_number)
                
                current_length += word_length
        
        # Add the last chunk if it has content - take care for bounding box
        if current_chunk["text"].strip():
            current_chunk["metadata"]["bounding_box"] = {
                "page_number": page_number,
                "x0": min(word["x0"] for word in words),
                "x1": max(word["x1"] for word in words),
                "top": min(word["top"] for word in words),
                "bottom": max(word["bottom"] for word in words),
            }
            del current_chunk["metadata"]["bounding_boxes"]
            all_chunks.append(current_chunk)


    for chunk in all_chunks:
        print(chunk["metadata"]["bounding_box"])
        print(chunk["metadata"]["pages"])
        print(chunk["text"])
        print("--------------------------------")
    
    return all_chunks

def prepare_documents_for_indexing(pdf_data):
    """
    Prepare documents for indexing by creating a list of Document objects 
    with text and metadata.
    """
    documents = []
    for entry in pdf_data:
        doc = Document(
            text=entry["text"],
            extra_info=entry["metadata"]  # Pass metadata as extra_info
        )
        documents.append(doc)
    return documents

def create_index_from_pdf(pdf_path):
    """
    Create the index from the PDF data.
    """
    pdf_data = extract_and_chunk_text_with_positions(pdf_path)
    documents = prepare_documents_for_indexing(pdf_data)
    index = VectorStoreIndex.from_documents(documents)
    return index

# Usage Example
DATA_FOLDER = os.path.dirname(os.path.abspath(__file__)) + "/data"
# get the first pdf file in the data folder
pdf_path = os.path.join(DATA_FOLDER, os.listdir(DATA_FOLDER)[0])
index = create_index_from_pdf(pdf_path)

# Query the Index
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
    path = DATA_FOLDER + "/" + Path(source_reference).name
    if not os.path.exists(path):
        print(f"File not found at absolute path: {Path(path).absolute()}")
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, filename=source_reference)


