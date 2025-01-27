from pathlib import Path
from docling.document_converter import DocumentConverter
import os
from db_utils import get_table, create_embeddings_batch, create_vector_index, get_model
import shutil
from docling.chunking import HybridChunker

EMBEDDING_MODEL = "jinaai/jina-embeddings-v3"

# Directories to ignore during processing
IGNORE_DIRECTORIES = {
    '.venv',
    'node_modules',
    'converted_data',
    '.git',
    '__pycache__',
    'build',
    'dist',
    '.next',
    'venv',
    'env',
    '.lancedb',
    '.mypy_cache'
}

# Files to ignore during processing
IGNORE_FILES = {
    'package-lock.json',
    "LICENSE",
}

# File extensions that should be processed as plain text
TEXT_FILE_EXTENSIONS = {
    '.py', '.js', '.ts', '.jsx', '.tsx', '.css', '.html', '.md', '.txt', '.json', 
    '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf', '.sh', '.bash', '.env',
    '.gitignore', '.dockerignore', '.sql', '.graphql', '.rs', '.go', '.java',
    '.cpp', '.hpp', '.c', '.h', '.cs', '.rb', '.php'
}

# File extensions that should be processed by Docling
DOCUMENT_EXTENSIONS = {
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.odt', 
    '.ods', '.odp', '.epub', '.rtf'
}

def chunk_text_file(file_path: Path, chunk_size: int = 1000):
    """Chunk a text file using simple character-based chunking."""
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            text = f.read()
        except UnicodeDecodeError:
            print(f"Unable to read {file_path} as text file - skipping")
            return []
    
    chunks = []
    # Simple sliding window chunking
    for i in range(0, len(text), chunk_size):
        chunk_text = text[i:i + chunk_size]
        # Match the expected format for create_embeddings_batch
        chunks.append({
            'text': chunk_text,
            'page_number': None,
            'bbox': None
        })
    
    return chunks

def chunk_docling_document(doc):
    """Chunk a Docling document using HybridChunker."""
    chunker = HybridChunker(
        tokenizer=get_model().tokenizer,
        max_tokens=512,
        merge_peers=True
    )
    raw_chunks = list(chunker.chunk(doc))

    chunks = []
    for chunk in raw_chunks:
        # Extract page and bbox information from provenance if available
        page_number = None
        min_l = float('inf')    # leftmost position
        min_t = float('inf')    # lowest position from bottom
        max_r = float('-inf')   # rightmost position
        max_b = float('-inf')   # highest position from bottom
        has_bbox = False
        
        # Check if chunk has meta attribute and doc_items
        if hasattr(chunk, 'meta') and hasattr(chunk.meta, 'doc_items'):
            for doc_item in chunk.meta.doc_items:
                if hasattr(doc_item, 'prov') and doc_item.prov:
                    prov = doc_item.prov[0]
                    if page_number is None:
                        page_number = getattr(prov, 'page_no', None)
                    
                    bbox_obj = getattr(prov, 'bbox', None)
                    print(bbox_obj)
                    if bbox_obj:
                        has_bbox = True
                        min_l = min(min_l, bbox_obj.l)      # leftmost
                        min_t = min(min_t, bbox_obj.t)      # lowest from bottom
                        max_r = max(max_r, bbox_obj.r)      # rightmost
                        max_b = max(max_b, bbox_obj.b)      # highest from bottom
        
        bbox = None
        if has_bbox:
            bbox = {
                'l': min_l,
                't': min_t,  # lowest position from bottom
                'r': max_r,
                'b': max_b   # highest position from bottom
            }
        
        chunks.append({
            'text': chunker.serialize(chunk),
            'page_number': page_number,
            'bbox': bbox
        })
    
    return chunks

def process_document(doc_path: Path, docling_result):
    """Process a document by creating embeddings and storing them in the database."""
    try:
        if docling_result is not None:
            # Process with Docling
            chunks = chunk_docling_document(docling_result.document)
        else:
            # Handle as plain text file
            chunks = chunk_text_file(doc_path)
            
        if chunks:
            embeddings_batch = create_embeddings_batch(doc_path, chunks)
            table = get_table()
            table.add(embeddings_batch)
            print(f"Added {len(embeddings_batch)} embeddings for {doc_path}")
            
    except Exception as e:
        print(f"Error processing {doc_path}: {str(e)}")

def build_index():
    print("Building index")
    
    # Clear existing database if it exists
    db_path = Path("./.lancedb")
    if db_path.exists():
        print("Clearing existing database...")
        shutil.rmtree(db_path)
    
    # Get repository root (3 levels up from current script)
    current_dir = Path(__file__).resolve().parent
    repo_root = current_dir.parents[2]
    
    # Initialize the document converter
    converter = DocumentConverter()
    
    # Walk through all files in the repository
    for root, dirs, files in os.walk(repo_root):
        # Modify dirs in-place to skip ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRECTORIES]
        
        for file in files:
            # Skip ignored files
            if file in IGNORE_FILES:
                continue
                
            input_path = Path(root) / file
            
            try:
                # Check file extension
                file_extension = input_path.suffix.lower()
                
                if file_extension in TEXT_FILE_EXTENSIONS:
                    # Process directly as text file
                    print(f"Processing {input_path} as text file")
                    process_document(input_path, None)
                elif file_extension in DOCUMENT_EXTENSIONS:
                    # Try to convert document with Docling
                    try:
                        print(f"Processing {input_path} with Docling")
                        docling_result = converter.convert(str(input_path))
                        process_document(input_path, docling_result)
                    except Exception as e:
                        print(f"Docling conversion failed for {input_path}: {str(e)}")
                else:
                    # Try as text file for unknown extensions
                    print(f"Unknown extension for {input_path}, trying as text file")
                    process_document(input_path, None)
                    
            except Exception as e:
                print(f"Error processing {input_path}: {str(e)}")

    # Create vector index after all documents are processed
    print("Creating vector index...")
    create_vector_index()

if __name__ == "__main__":
    build_index()

