from lancedb.pydantic import LanceModel, Vector
import lancedb
from pathlib import Path
from docling.chunking import HybridChunker
from docling_core.types.doc import DoclingDocument
from sentence_transformers import SentenceTransformer
from typing import Optional

# Initialize the embedding model
model = SentenceTransformer('jinaai/jina-embeddings-v3', trust_remote_code=True, device='mps')
EMBEDDING_DIM = 1024  # jina-embeddings-v3 dimension

# Global database connection
_db = None
_table = None

class DocumentChunkEmbedding(LanceModel):
    doc_path: str
    doc_type: str
    chunk_index: int
    text: str
    embedding: Vector(EMBEDDING_DIM)
    # All metadata fields should be optional
    page_number: Optional[int] = None
    bbox_left: Optional[float] = None
    bbox_top: Optional[float] = None
    bbox_right: Optional[float] = None
    bbox_bottom: Optional[float] = None

def get_db():
    """Get or create the database connection."""
    global _db
    if _db is None:
        _db = lancedb.connect("./.lancedb")
    return _db

def get_table(table_name: str = "docstore"):
    """Get or create the table with connection reuse."""
    global _table
    if _table is None:
        db = get_db()
        try:
            _table = db.create_table(
                table_name,
                schema=DocumentChunkEmbedding,
                mode="overwrite"
            )
        except Exception as e:
            print(f"Error creating table: {e}")
            _table = db.open_table(table_name)
    return _table

def create_embeddings_batch(doc_path: Path, chunks):
    """
    Create embeddings batch from a list of chunks.
    
    Args:
        doc_path: Path to the original document
        chunks: List of dicts containing:
            - text: str
            - page_number: Optional[int]
            - bbox: Optional[dict] with l, t, r, b keys
    
    Returns:
        List of DocumentChunkEmbedding objects ready for database insertion
    """
    texts = [chunk['text'] for chunk in chunks]
    embeddings = model.encode(texts)
    
    embeddings_batch = []
    for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        # Safely get bbox values with defaults
        bbox = chunk.get('bbox') or {}
        
        embedding_obj = DocumentChunkEmbedding(
            doc_path=str(doc_path),
            doc_type=doc_path.suffix[1:] if doc_path.suffix else 'txt',
            chunk_index=idx,
            text=chunk['text'],
            embedding=embedding,
            page_number=chunk.get('page_number'),
            # All bbox fields are now optional
            bbox_left=bbox.get('l') if bbox else None,
            bbox_top=bbox.get('t') if bbox else None,
            bbox_right=bbox.get('r') if bbox else None,
            bbox_bottom=bbox.get('b') if bbox else None
        )
        embeddings_batch.append(embedding_obj)
    
    return embeddings_batch