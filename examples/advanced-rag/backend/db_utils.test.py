import db_utils

def test_existing_data():
    # Get the table
    table = db_utils.get_table()
    
    # Print schema and table information
    print("\nDatabase Schema Information:")
    print("-" * 50)
    print(f"Table Schema: {table.schema}")
    print(f"Total Records: {table.count_rows()}")
    print(f"Vector Dimension: {db_utils.EMBEDDING_DIM}")
    
    # Print index information if available
    try:
        index_info = table.list_indices()
        print("\nVector Indices:")
        for idx in index_info:
            print(f"- {idx}")
    except Exception as e:
        print(f"\nNo index information available: {e}")
    
    print("\nStarting Search Tests")
    print("=" * 50)
    
    # Test different queries
    queries = [
        "What is machine learning?",
        "Tell me about Python programming",
        "Explain artificial intelligence"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        print("-" * 50)
        
        # Create embedding for the query (same as in main.py)
        query_embedding = db_utils.get_model().encode(query)
        
        # Search using the embedding
        results = table.search(query=query_embedding, vector_column_name="embedding").limit(3).to_list()    

        print(f"Top 3 results:")
        for i, result in enumerate(results, 1):
            print(result)

if __name__ == "__main__":
    test_existing_data()
