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


def chunk_text_file(file_path: Path):
    """
    Chunk a text file using a semantic splitter, retrying up to 3 times 
    with decreasing char-chunk sizes if we get any chunk > 512 tokens.
    If still failing, we do a direct token-based split for the large chunk.

    Returns a list of dicts with keys: 'text', 'page_number', 'bbox'.
    """
    tokenizer = get_model().tokenizer
    
    # 1) Read file text
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            text = f.read()
        except UnicodeDecodeError:
            print(f"Unable to read {file_path} as text - skipping")
            return []
    
    if not text.strip():
        return []

    # 2) Estimate average ratio of tokens/characters
    tokens = tokenizer.tokenize(text)
    char_len = len(text)
    token_len = len(tokens)
    if char_len == 0:  # extremely rare if text is empty
        return []
    
    ratio = token_len / char_len  # tokens per character
    # Start with chunk_size_chars ~ 512 tokens worth of characters
    chunk_size_chars = int(512 / ratio) if ratio > 0 else 512
    chunk_size_chars = max(chunk_size_chars, 200)  # floor to avoid super-tiny chunks

    # 3) We'll define a helper to do one pass of semantic chunking
    def semantic_split_pass(txt: str, chunk_size: int) -> list:
        """Split text semantically with a given char chunk size."""
        # Decide which semantic splitter based on extension
        file_extension = file_path.suffix.lower()
        if file_extension == '.md':
            splitter = MarkdownSplitter(chunk_size)
        elif file_extension in {'.py', '.js', '.ts', '.jsx', '.tsx'}:
            # Load tree-sitter
            if file_extension == '.py':
                import tree_sitter_python
                language = tree_sitter_python.language()
            else:
                import tree_sitter_javascript
                language = tree_sitter_javascript.language()
            splitter = CodeSplitter(language, chunk_size)
        else:
            splitter = TextSplitter(chunk_size)
        
        return splitter.chunks(txt)

    # 4) Attempt semantic chunking up to 3 times, each time reducing chunk size if needed
    max_retries = 3
    for attempt in range(1, max_retries + 1):
        text_chunks = semantic_split_pass(text, chunk_size_chars)

        # Check if any chunk > 512 tokens
        chunk_sizes = []
        for c in text_chunks:
            tk_len = len(tokenizer.tokenize(c))
            chunk_sizes.append(tk_len)

        oversize = [sz for sz in chunk_sizes if sz > 512]

        if not oversize:
            # All chunks are within 512 tokens => success
            break
        else:
            # We have an oversized chunk
            if attempt < max_retries:
                # Decrease chunk_size_chars and retry
                # E.g., multiply by 0.5 or 0.75, your choice
                chunk_size_chars = max(int(chunk_size_chars * 0.5), 50)
                print(f"[Retry {attempt}/{max_retries}] Oversized chunk found. "
                      f"Reducing chunk_size_chars to {chunk_size_chars} and retrying...")
            else:
                # After final attempt, we'll accept the chunking and
                # fallback to direct token-based splitting for large chunks
                print(f"[Final Retry] Still oversize after attempts. "
                      "Will forcibly tokenize oversize chunks.")
                break

    # 5) Now we have semantic chunks in `text_chunks`, some might still be >512 tokens.
    #    We'll do a final pass to forcibly split those oversize chunks by tokens.
    final_chunks = []
    for chunk_text in text_chunks:
        sub_tokens = tokenizer.tokenize(chunk_text)
        if len(sub_tokens) <= 512:
            final_chunks.append(chunk_text)
        else:
            # Force-split
            start_idx = 0
            while start_idx < len(sub_tokens):
                end_idx = start_idx + 512
                piece_tokens = sub_tokens[start_idx:end_idx]
                piece_text = tokenizer.detokenize(piece_tokens)
                final_chunks.append(piece_text)
                start_idx = end_idx

    # 6) Package them into your standard chunk dict format
    chunk_dicts = []
    for ck_text in final_chunks:
        chunk_dicts.append({
            'text': ck_text,
            'page_number': None,
            'bbox': None
        })
    
    return chunk_dicts


def chunk_docling_document(doc):
    """
    Chunk a Docling document using HybridChunker, converting bounding boxes
    to top-left orientation in [0..1].
    """
    from docling_core.types.doc import CoordOrigin, Size

    chunker = HybridChunker(
        tokenizer=get_model().tokenizer,
        max_tokens=512,
        merge_peers=True
    )
    raw_chunks = list(chunker.chunk(doc))

    chunks = []
    for chunk in raw_chunks:
        page_number = None
        min_left   = 1.0
        min_top    = 1.0
        max_right  = 0.0
        max_bottom = 0.0
        has_bbox   = False
        
        if hasattr(chunk, 'meta') and hasattr(chunk.meta, 'doc_items'):
            for doc_item in chunk.meta.doc_items:
                if hasattr(doc_item, 'prov') and doc_item.prov:
                    prov = doc_item.prov[0]

                    if page_number is None:
                        page_number = getattr(prov, 'page_no', None)

                    bbox_obj = getattr(prov, 'bbox', None)
                    if bbox_obj:
                        has_bbox = True
                        page = doc.pages.get(page_number) if doc.pages else None
                        if page is not None:
                            page_width  = page.size.width
                            page_height = page.size.height
                        else:
                            page_width  = 1.0
                            page_height = 1.0

                        # If origin is BOTTOMLEFT, convert to top-left
                        if bbox_obj.coord_origin == CoordOrigin.BOTTOMLEFT:
                            top_left_box = bbox_obj.to_top_left_origin(page_height=page_height)
                        else:
                            top_left_box = bbox_obj

                        # Normalize [0..1]
                        normalized_box = top_left_box.normalized(Size(width=page_width, height=page_height))
                        nl, nr = sorted([normalized_box.l, normalized_box.r])
                        nt, nb = sorted([normalized_box.t, normalized_box.b])
                        
                        min_left   = min(min_left, nl)
                        min_top    = min(min_top, nt)
                        max_right  = max(max_right, nr)
                        max_bottom = max(max_bottom, nb)

        bbox = None
        if has_bbox:
            bbox = {
                'l': min_left,
                't': min_top,
                'r': max_right,
                'b': max_bottom
            }
            # Debug print if needed:
            # print("Final normalized top-left box:", bbox)
        
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
            if file in IGNORE_FILES:
                continue

            input_path = Path(root) / file
            try:
                file_extension = input_path.suffix.lower()
                
                if file_extension in TEXT_FILE_EXTENSIONS:
                    print(f"Processing {input_path} as text file")
                    process_document(input_path, None)
                elif file_extension in DOCUMENT_EXTENSIONS:
                    print(f"Processing {input_path} with Docling")
                    try:
                        docling_result = converter.convert(str(input_path))
                        process_document(input_path, docling_result)
                    except Exception as e:
                        print(f"Docling conversion failed for {input_path}: {str(e)}")
                else:
                    print(f"Unknown extension for {input_path}, trying as text file")
                    process_document(input_path, None)
                    
            except Exception as e:
                print(f"Error processing {input_path}: {str(e)}")

    print("Creating vector index...")
    create_vector_index()


if __name__ == "__main__":
    build_index()
