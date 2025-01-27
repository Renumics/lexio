from pathlib import Path
from docling.document_converter import DocumentConverter
import os
from db_utils import get_table, create_embeddings_batch, create_vector_index, get_model
import shutil
from docling.chunking import HybridChunker
from semantic_text_splitter import TextSplitter, CodeSplitter, MarkdownSplitter

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
    """
    Chunk a text file using semantic text splitting with the same tokenizer as HybridChunker.
    Returns a list of chunk dicts with keys: 'text', 'page_number', 'bbox'.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            text = f.read()
        except UnicodeDecodeError:
            print(f"Unable to read {file_path} as text file - skipping")
            return []
    
    # Choose splitter based on file extension
    file_extension = file_path.suffix.lower()
    
    if file_extension == '.md':
        splitter = MarkdownSplitter(512)
    elif file_extension in {'.py', '.js', '.ts', '.jsx', '.tsx'}:
        # Import appropriate tree-sitter language based on extension
        if file_extension == '.py':
            import tree_sitter_python
            language = tree_sitter_python.language()
        elif file_extension in {'.js', '.ts', '.jsx', '.tsx'}:
            import tree_sitter_javascript
            language = tree_sitter_javascript.language()
        
        splitter = CodeSplitter(language, 512)
    else:
        # Default to TextSplitter for other file types
        splitter = TextSplitter(512)
    
    # Get semantic chunks
    text_chunks = splitter.chunks(text)
    
    # Format chunks to match expected format
    chunks = []
    for chunk_text in text_chunks:
        chunks.append({
            'text': chunk_text,
            'page_number': None,
            'bbox': None
        })
    
    return chunks


def chunk_docling_document(doc):
    """
    Chunk a Docling document using HybridChunker.
    Returns a list of chunk dicts with keys: 'text', 'page_number', 'bbox'.

    IMPORTANT:
      - Each bounding box is converted to top-left orientation in [0..1].
      - 'l' = left, 't' = top, 'r' = right, 'b' = bottom,
        where (0,0) is top-left, (1,1) is bottom-right.
      - Some elements might already be in TOPLEFT coords, some in BOTTOMLEFT.
        We use the bounding box's "to_top_left_origin" and "normalized" methods to unify them.
    """
    from docling_core.types.doc import CoordOrigin, Size  # Ensure these are imported if needed

    chunker = HybridChunker(
        tokenizer=get_model().tokenizer,
        max_tokens=512,
        merge_peers=True
    )
    raw_chunks = list(chunker.chunk(doc))

    chunks = []
    for chunk in raw_chunks:
        page_number = None

        # We'll track bounding box in final top-left coords [0..1]
        min_left   = 1.0
        min_top    = 1.0
        max_right  = 0.0
        max_bottom = 0.0
        has_bbox   = False

        # Check if chunk has doc_items
        if hasattr(chunk, 'meta') and hasattr(chunk.meta, 'doc_items'):
            for doc_item in chunk.meta.doc_items:
                if hasattr(doc_item, 'prov') and doc_item.prov:
                    prov = doc_item.prov[0]

                    # Page number
                    if page_number is None:
                        page_number = getattr(prov, 'page_no', None)

                    # Original bounding box
                    bbox_obj = getattr(prov, 'bbox', None)
                    if bbox_obj:
                        has_bbox = True
                        # Get page dimensions for normalization
                        page = doc.pages.get(page_number) if doc.pages else None
                        if page is not None:
                            page_width  = page.size.width
                            page_height = page.size.height
                        else:
                            page_width  = 1.0
                            page_height = 1.0
                        
                        # 1) Convert everything to top-left coords
                        if bbox_obj.coord_origin == CoordOrigin.BOTTOMLEFT:
                            top_left_box = bbox_obj.to_top_left_origin(page_height=page_height)
                        else:
                            # Already in top-left
                            top_left_box = bbox_obj

                        # 2) Normalize to [0,1]
                        normalized_box = top_left_box.normalized(Size(width=page_width, height=page_height))
                        
                        # normalized_box.* should now be in top-left coords:
                        #   l, r in [0..1],  t, b in [0..1], but we must ensure t < b
                        nl = normalized_box.l
                        nr = normalized_box.r
                        nt = normalized_box.t
                        nb = normalized_box.b

                        # Ensure left < right
                        if nl > nr:
                            nl, nr = nr, nl
                        # Ensure top < bottom
                        if nt > nb:
                            nt, nb = nb, nt

                        # Expand chunk bounding box
                        min_left   = min(min_left, nl)
                        min_top    = min(min_top, nt)
                        max_right  = max(max_right, nr)
                        max_bottom = max(max_bottom, nb)
        
        # Prepare final bounding box dict
        bbox = None
        if has_bbox:
            bbox = {
                'l': min_left,
                't': min_top,
                'r': max_right,
                'b': max_bottom
            }
            # Debug-print if needed:
            print("Final normalized top-left box:", bbox)
        
        chunks.append({
            'text': chunker.serialize(chunk),
            'page_number': page_number,
            'bbox': bbox
        })
    
    return chunks


def process_document(doc_path: Path, docling_result):
    """
    Process a document by creating embeddings and storing them in the database.
    """
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
