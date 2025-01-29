import requests
import json
import sseclient

BASE_URL = "http://localhost:8000"

def print_separator(title):
    print(f"\n{'='*20} {title} {'='*20}")

def stream_response(url, json_data):
    response = requests.post(url, json=json_data, stream=True)
    client = sseclient.SSEClient(response)
    
    accumulated_text = ""
    source_ids = []  # Add this to collect source IDs
    
    for event in client.events():
        data = json.loads(event.data)
        
        if "sources" in data:
            sources = data["sources"]
            source_ids = [source["id"] for source in sources]  # Collect all source IDs
            print("\nSources found:", len(sources))
            for idx, source in enumerate(sources, 1):
                print(f"\nSource {idx}:")
                print(f"  Path: {source['doc_path']}")
                score = source.get('score')
                if score is not None:
                    print(f"  Score: {score:.3f}")
                else:
                    print("  Score: N/A")
                print(f"  ID: {source['id']}")
            print("\nGenerating response...\n")
        
        elif "content" in data:
            text = data["content"]
            if text:
                print(text, end="", flush=True)
            if data.get("done", False):
                print("\n")
    
    return source_ids  # Return the collected source IDs

def test_rag_workflow():
    # 1. Initial query with retrieve-and-generate
    print_separator("Initial Query")
    initial_query = "What is the rag provider? Answer in 3 sentences."
    print(f"Query: {initial_query}")
    
    # Get source IDs from initial response
    source_ids = stream_response(
        f"{BASE_URL}/api/retrieve-and-generate",
        {"query": initial_query}
    )
    
    # 2. Follow-up question using previous sources
    print_separator("Follow-up Query")
    messages = [
        {"role": "user", "content": initial_query},
        {"role": "assistant", "content": "Let me check the previous response..."},
        {"role": "user", "content": "What specifically are the parameters for the rag provider? Answer compactly!"}
    ]
    
    print(f"Using {len(source_ids)} source IDs:", source_ids)
    
    stream_response(
        f"{BASE_URL}/api/generate",
        {
            "messages": messages,
            "source_ids": source_ids
        }
    )

if __name__ == "__main__":
    test_rag_workflow()
