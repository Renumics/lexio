import requests
import json

BASE_URL = "http://localhost:8000"

def test_rag_workflow():
    # 1. Initial query with retrieve-and-generate
    initial_query = "How can i query my server using lexio?"
    response = requests.post(
        f"{BASE_URL}/api/retrieve-and-generate",
        json={"query": initial_query}
    )
    
    print("\n=== Initial Query ===")
    print(f"Query: {initial_query}")
    
    initial_data = response.json()
    print(initial_data)
    print("\nResponse:", initial_data["response"])
    # print("\nSources found:", len(initial_data["sources"]))
    
    # Get some source IDs from the results for the follow-up
    source_ids = [source["id"] for source in initial_data["sources"][:2]]  # Take first 2 sources
    
    # 2. Follow-up question using previous sources
    messages = [
        {"role": "user", "content": initial_query},
        {"role": "assistant", "content": initial_data["response"]},
        {"role": "user", "content": "Can you explain more about supervised learning based on these sources?"}
    ]
    
    follow_up_response = requests.post(
        f"{BASE_URL}/api/generate",
        json={
            "messages": messages,
            "source_ids": source_ids
        }
    )
    
    print("\n=== Follow-up Query ===")
    print("Using source IDs:", source_ids)
    print("\nResponse:", follow_up_response.json())

if __name__ == "__main__":
    test_rag_workflow()
