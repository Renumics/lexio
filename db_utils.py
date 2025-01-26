def create_embeddings_batch(doc_path: Path, content):
    """
    Create embeddings batch from either a Docling document or a list of text chunks.
    
    Args:
        doc_path: Path to the original document
        content: Either a Docling document or a list of text chunks
    """
    embeddings_batch = []
    
    if isinstance(content, list):
        # Handle plain text chunks
        for chunk in content:
            embeddings_batch.append({
                'text': chunk,
                'metadata': {
                    'source': str(doc_path),
                    'chunk_type': 'text'
                }
            })
    else:
        # Handle Docling document
        for item in content.iterate_items():
            embeddings_batch.append({
                'text': item.text,
                'metadata': {
                    'source': str(doc_path),
                    'chunk_type': 'docling',
                    # Add any other Docling-specific metadata
                }
            })
    
    return embeddings_batch 