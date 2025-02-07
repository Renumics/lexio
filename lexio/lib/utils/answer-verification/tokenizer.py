import sys
import tiktoken
import json

enc = tiktoken.get_encoding("cl100k_base")

def count_tokens(sentences):
    return [len(enc.encode(sentence)) for sentence in sentences]

if __name__ == "__main__":
    try:
        text = sys.stdin.read().strip()
        sentences = json.loads(text)  # Expecting a JSON list of sentences
        print(json.dumps(count_tokens(sentences)))  # Return token counts as JSON
    except Exception as e:
        print(json.dumps([]))  # Return empty list if an error occurs
