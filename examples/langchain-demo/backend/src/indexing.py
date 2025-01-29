import os
import json
from pathlib import Path
from typing import Optional

import fitz
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from src.utils import PositionalMetadata

DATA_DIR = Path("data")
DB_DIR = Path(".chroma")


def get_bbox_of_text(document: Document) -> Document:
    """
    Extracts bounding boxes of text spans from a given document page and adds
    this positional metadata to the document.

    Args:
        document (Document): The document object containing metadata about the file path and page number.

    Returns:
        Document: The document object with added positional metadata in the 'text_bboxes' field.
    """
    doc = fitz.open(document.metadata["source"])

    spans = []
    for block in doc[document.metadata["page"]].get_text("dict")["blocks"]:
        if "lines" in block:
            for line in block["lines"]:
                for idx, span in enumerate(line["spans"]):
                    span["idx"] = idx
                    spans.append(span)

    page_dim = doc[document.metadata["page"]].rect
    hits = [PositionalMetadata(**span, width=page_dim.width, height=page_dim.height).model_dump() for span in spans if
            span["text"] in document.page_content]

    if not hits:
        return document

    document.metadata["text_bboxes"] = json.dumps(hits)

    return document


class DocumentIndexer:
    """A class to handle document indexing and retrieval using ChromaDB and OpenAI embeddings.

    This class provides functionality to:
    - Load and split PDF documents into chunks
    - Index documents using OpenAI embeddings
    - Store and retrieve documents from ChromaDB
    """

    def __init__(
            self,
            data_dir: str = DATA_DIR,
            db_dir: str = DB_DIR,
            chunk_size: int = 1000,
            chunk_overlap: int = 200,
    ):
        """Initialize the DocumentIndexer.

        Args:
            data_dir: Directory containing the documents to index
            db_dir: Directory to store the ChromaDB database
            chunk_size: Size of text chunks for splitting documents
            chunk_overlap: Overlap between consecutive chunks
        """
        self.data_dir = Path(data_dir)
        self.db_dir = Path(db_dir)
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.embeddings = OpenAIEmbeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            add_start_index=True,
        )

    def load_and_split_pdf(self, pdf_path: Path) -> list:
        """Load a PDF and split it into chunks."""
        loader = PyPDFLoader(str(pdf_path))
        pages = loader.load()
        return self.text_splitter.split_documents(pages)

    def index_directory(self, collection_name: Optional[str] = None) -> Chroma:
        """Index all PDFs in the data directory."""
        if not collection_name:
            collection_name = "langchain_demo"

        documents = []
        for pdf_path in self.data_dir.glob("*.pdf"):
            try:
                chunks = self.load_and_split_pdf(pdf_path)
                documents.extend(chunks)
            except Exception as e:
                print(f"Error processing {pdf_path}: {e}")

        if not documents:
            raise ValueError(f"No documents found in {self.data_dir}")

        documents = list(map(get_bbox_of_text, documents))

        db = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            persist_directory=str(self.db_dir),
            collection_name=collection_name,
        )
        return db

    def get_db(self, collection_name: Optional[str] = None) -> Chroma:
        """Get the vector store for the indexed documents."""
        if not collection_name:
            collection_name = "langchain_demo"

        return Chroma(
            persist_directory=str(self.db_dir),
            embedding_function=self.embeddings,
            collection_name=collection_name,
        )

    def check_db_setup(self) -> bool:
        """Check if the ChromaDB is set up correctly and contains entries."""
        try:
            # Attempt to load the database
            db = self.get_db()
            # Perform a simple query to ensure it's operational
            results = db.similarity_search("test", k=1)
            if not results:
                print("ChromaDB is set up but contains no entries.")
                return False
            return True
        except Exception as e:
            print(f"ChromaDB setup check failed: {e}")
            return False


def main():
    """Entry point for the indexing script."""
    # Load environment variables
    load_dotenv()

    if not os.getenv("OPENAI_API_KEY"):
        raise ValueError("OPENAI_API_KEY environment variable is not set")

    # Initialize and run indexer
    indexer = DocumentIndexer()
    _ = indexer.index_directory()
    print(f"Successfully indexed documents. Vector store persisted to {indexer.db_dir}")
    return 0


if __name__ == "__main__":
    main()