import sys
import json
import re
import nltk
from nltk.tokenize import sent_tokenize

# Ensure the NLTK 'punkt' tokenizer is available.
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

def strip_html(html):
    """
    Remove HTML tags using a simple regex.
    (For more robust handling consider using an HTML parser like BeautifulSoup.)
    """
    return re.sub(r'<[^>]+>', '', html)

def traverse_and_collect_text(block, parent_metadata=None):
    """
    Recursively traverse the block structure.
    
    - First, attempt to extract text from a block's "text" field.
    - If not present, try to extract from the "html" field by stripping HTML.
    - Each extracted piece is stored with metadata (block_id, block_type).
    """
    if parent_metadata is None:
        parent_metadata = {}
    collected = []

    # Capture current block's metadata.
    current_metadata = {
        'block_id': block.get('id'),
        'block_type': block.get('block_type')
    }
    # Merge with any parent metadata.
    metadata = {**parent_metadata, **current_metadata}

    # Try to get text from the "text" field.
    text_val = block.get('text')
    if text_val and isinstance(text_val, str) and text_val.strip():
        collected.append({
            'text': text_val.strip(),
            'metadata': metadata
        })
    else:
        # Fallback: try using the "html" field.
        html_val = block.get('html')
        if html_val and isinstance(html_val, str):
            stripped = strip_html(html_val).strip()
            if stripped:
                collected.append({
                    'text': stripped,
                    'metadata': metadata
                })

    # Recursively process children.
    for child in block.get('children') or []:
        collected.extend(traverse_and_collect_text(child, metadata))

    return collected

def remove_special_tokens(text, tokens=("<EOS>", "<pad>")):
    """
    Remove specified special tokens from text and collapse extra whitespace.
    """
    pattern = r'(' + '|'.join(map(re.escape, tokens)) + r')'
    cleaned_text = re.sub(pattern, '', text)
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
    return cleaned_text

def main():
    # Read input from stdin.
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {e}"}))
        sys.exit(1)

    # Expect the Marker JSON under "rawBlocks". Fallback to "rawText" if necessary.
    raw_blocks = input_data.get('rawBlocks')
    if raw_blocks is None:
        raw_text = input_data.get('rawText', '')
        texts_with_metadata = [{'text': raw_text, 'metadata': {}}]
    else:
        # If the root block is a Document, traverse its children.
        if raw_blocks.get('block_type') == 'Document':
            texts_with_metadata = traverse_and_collect_text(raw_blocks)
        else:
            texts_with_metadata = []

    processed_sentences = []
    for item in texts_with_metadata:
        #print("DEBUG: Raw collected text:", repr(item['text']), file=sys.stderr)
        text = item['text']
        metadata = item['metadata']

        # Clean the text.
        text = re.sub(r'-\s*\n', '', text)       # Merge hyphenated words split by newline.
        text = re.sub(r'\n+', '\n', text)          # Collapse multiple newlines.
        text = re.sub(r'sourcetarget', 'source-target', text)
        text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
        text = text.strip()
        text = remove_special_tokens(text, tokens=("<EOS>", "<pad>"))

        # Use NLTK to split the text into sentences.
        sentences_raw = sent_tokenize(text, language="english")
        for sentence in sentences_raw:
            cleaned_sentence = re.sub(r'\s+', ' ', sentence).strip()
            if cleaned_sentence:
                processed_sentences.append({
                    'text': cleaned_sentence,
                    'metadata': metadata
                })

    # Output the resulting sentences as a JSON array.
    print(json.dumps(processed_sentences))

if __name__ == "__main__":
    main()
