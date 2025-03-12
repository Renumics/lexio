import os
from typing import List, Dict, Any, Optional
from langchain.tools import BaseTool
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain_core.documents import Document
from langchain.agents import initialize_agent, AgentType
from langchain.chains import RetrievalQA
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from src.indexing import DocumentIndexer
from src.utils import convert_bboxes_to_highlights
from pydantic import BaseModel
from langfuse.callback import CallbackHandler
from langfuse.decorators import observe, langfuse_context

# Load environment variables
load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Initialize Langfuse for observability
langfuse_secret_key = os.getenv("LANGFUSE_SECRET_KEY")
langfuse_public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
langfuse_host = os.getenv("LANGFUSE_HOST", "http://127.0.0.1:3000")

if langfuse_secret_key and langfuse_public_key:
    langfuse_context.configure(
        secret_key=langfuse_secret_key,
        public_key=langfuse_public_key,
        host=langfuse_host,
        enabled=True,
    )
    langfuse_handler = CallbackHandler(
        secret_key=langfuse_secret_key,
        public_key=langfuse_public_key,
        host=langfuse_host,
    )
    if langfuse_context.auth_check():
        print("Langfuse connection established:", langfuse_context.auth_check())
    else:
        print("Connection to Langfuse refused.")
else:
    print("Langfuse credentials not found. Observability features disabled.")

# Initialize components
indexer = DocumentIndexer()

# Check if ChromaDB is set up correctly and contains entries
if not indexer.check_db_setup():
    raise RuntimeError(
        "ChromaDB is not set up correctly or contains no entries. Please run the indexing command to populate the database."
    )

db = indexer.get_db()

# Initialize LLM
llm = ChatOpenAI(
    model="gpt-3.5-turbo", 
    temperature=0.7, 
    streaming=True,
)


def format_document_content(doc: Document) -> Dict[str, Any]:
    """Format a document into a structured dictionary with content and metadata."""
    # Extract page number from metadata
    page_num = doc.metadata.get("page", 0)
    
    # Extract source file information
    source = doc.metadata.get("source", "Unknown source")
    if isinstance(source, str) and "/" in source:
        source = source.split("/")[-1]  # Extract just the filename
    
    # Process bounding box information if available
    highlights = []
    if "text_bboxes" in doc.metadata:
        highlights = convert_bboxes_to_highlights(page_num, doc.metadata["text_bboxes"])
    
    return {
        "content": doc.page_content,
        "metadata": {
            "source": source,
            "page": page_num,
            "highlights": [h.model_dump() for h in highlights] if highlights else []
        }
    }


class ChromaDBTool(BaseTool):
    name: str = "ChromaDBQueryTool"
    description: str = ("A tool to query a ChromaDB vector store and return similarity search results. "
                        "Use this when you need to find information from the knowledge base.")
    vectorstore: Chroma

    def __init__(self, vectorstore: Chroma):
        super().__init__(vectorstore=vectorstore)
        self.vectorstore = vectorstore

    @observe(
        as_type="chroma_similarity_search",
        capture_input=True,
        capture_output=True,
    )
    def _run(self, query: str) -> str:
        results = self.vectorstore.similarity_search(query)
        formatted_results = []
        for i, doc in enumerate(results):
            formatted_doc = format_document_content(doc)
            formatted_results.append(
                f"[Document {i+1}] Source: {formatted_doc['metadata']['source']}, "
                f"Page: {formatted_doc['metadata']['page']}\n"
                f"Content: {formatted_doc['content']}\n"
            )
        return "\n".join(formatted_results) if formatted_results else "No relevant documents found for the query."

    async def _arun(self, query: str):
        # Async version if needed
        raise NotImplementedError("Async execution is not implemented for ChromaDBTool.")


class RAGQueryTool(BaseTool, BaseModel):
    name: str = "RAGQueryTool"
    description: str = ("A tool that combines retrieval and generation to answer questions based on the knowledge base. "
                        "Use this for complex questions that require synthesizing information from multiple sources.")
    vectorstore: Chroma
    llm: ChatOpenAI
    retriever: Any | None
    prompt: ChatPromptTemplate | None
    chain: RetrievalQA | None
    
    def __init__(self, vectorstore: Chroma, llm: ChatOpenAI):
        # First initialize the Pydantic model
        super().__init__(
            vectorstore=vectorstore,
            llm=llm,
            retriever=None,  # Will be set later
            prompt=None,     # Will be set later
            chain=None      # Will be set later
        )
        
        # Then create the components
        self.prompt = ChatPromptTemplate.from_template("""
        You are a helpful assistant that answers questions based on the provided context.
        
        Context:
        {context}
        
        Question: {question}
        
        Answer the question based only on the provided context. If the context doesn't contain the information needed to answer the question, say "I don't have enough information to answer this question."
        """)
        
        self.retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        
        # Initialize the chain
        self.chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": self.prompt},
        )

    @observe(
        as_type="rag_query",
    )
    def _run(self, query: str) -> str:
        langfuse_cb_handler = langfuse_context.get_current_langchain_handler()
        result = self.chain.invoke({"query": query}, config={"callbacks": [langfuse_handler]})
        answer = result.get("result", "No answer generated.")
        source_docs = result.get("source_documents", [])

        # Log the number of source documents
        # if langfuse:
        #     langfuse.log_observation(
        #         name="source_documents",
        #         metadata={"num_sources": len(source_docs)}
        #     )
        sources_info = []
        for i, doc in enumerate(source_docs):
            source = doc.metadata.get("source", "Unknown")
            if isinstance(source, str) and "/" in source:
                source = source.split("/")[-1]
            page = doc.metadata.get("page", "Unknown")
            sources_info.append(f"[{i+1}] {source} (Page {page})")
        # if langfuse:
        #     langfuse.score("answer_length", len(answer))
        final_answer = f"{answer}\n\nSources:\n" + "\n".join(sources_info) if sources_info else answer
        return final_answer

    async def _arun(self, query: str):
        raise NotImplementedError("Async execution is not implemented for RAGQueryTool.")


class DocumentSummaryTool(BaseTool):
    name: str = "DocumentSummaryTool"
    description: str = ("A tool to generate summaries of specific documents in the knowledge base. "
                        "Use this when you need an overview of a particular document.")
    vectorstore: Chroma
    llm: ChatOpenAI

    def __init__(self, vectorstore: Chroma, llm: ChatOpenAI):
        super().__init__(vectorstore=vectorstore, llm=llm)
        self.vectorstore = vectorstore
        self.llm = llm

    @observe(
        as_type="document_summary",
    )
    def _run(self, document_name: str) -> str:
        # Fix: Use $eq instead of $contains for ChromaDB compatibility
        filter_dict = {"source": {"$eq": document_name}}
        
        try:
            results = self.vectorstore.get(where=filter_dict, limit=10)
        except ValueError:
            # Fallback to similarity search if exact match fails
            results = self.vectorstore.similarity_search(document_name, k=5)
            if results:
                # Convert to format similar to get() result
                documents = [doc.page_content for doc in results]
                results = {"documents": documents}
            else:
                results = {"documents": []}
        
        if not results or not results.get("documents", []):
            # Try a more flexible approach with similarity search
            docs = self.vectorstore.similarity_search(f"filename:{document_name}", k=5)
            if docs:
                combined_content = "\n".join([doc.page_content for doc in docs])
                
                summary_prompt = ChatPromptTemplate.from_template("""
                Please provide a concise summary of the following document content:

                {content}

                Summary:
                """)
                
                # Generate summary
                @observe(as_type="generate_summary")
                def generate():
                    langfuse_cb_handler = langfuse_context.get_current_langchain_handler()
                    chain = summary_prompt | self.llm
                    return chain.invoke({"content": combined_content}, config={"callbacks": [langfuse_handler]})

                summary = generate()
                return f"Summary of '{document_name}':\n\n{summary.content}"
            else:
                return f"No documents found matching '{document_name}'."
        
        combined_content = "\n".join(results.get("documents", []))
        
        summary_prompt = ChatPromptTemplate.from_template("""
        Please provide a concise summary of the following document content:

        {content}

        Summary:
        """)
        # Here we use observe on the summary generation step as well
        @observe(as_type="generate_summary")
        def generate():
            langfuse_cb_handler = langfuse_context.get_current_langchain_handler()
            chain = summary_prompt | self.llm
            return chain.invoke({"content": combined_content}, config={"callbacks": [langfuse_handler]})

        summary = generate()
        return f"Summary of '{document_name}':\n\n{summary.content}"

    async def _arun(self, document_name: str):
        raise NotImplementedError("Async execution is not implemented for DocumentSummaryTool.")


# Refactor the main execution block into a function and decorate it with observe
@observe(as_type="rag-query", capture_input=True)
def main(query: str):
    chroma_tool = ChromaDBTool(db)
    rag_tool = RAGQueryTool(db, llm)
    summary_tool = DocumentSummaryTool(db, llm)

    agent = initialize_agent(
        tools=[chroma_tool, rag_tool, summary_tool],
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
    )

    response = agent.invoke(query)

    langfuse_context.score_current_observation(
        name="response_length",
        value=len(response),
    )

    print("\nFinal Response:")
    print(response)
    
    return response


if __name__ == "__main__":
    query = "Which approaches for modelling 3D data exist in the machine learning domain?"
    main(query=query)
    langfuse_context.flush()
