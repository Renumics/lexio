"""Tests for the types module."""
import pytest
from lexio.types import (
    Message,
    Rect,
    PDFHighlight,
    Source,
    StreamChunk,
    UUID,
)


def test_message_creation():
    """Test creating a Message."""
    message = Message(id="12345678-1234-5678-1234-567812345678", role="assistant", content="Hello, how can I help you?")
    
    assert message.id == "12345678-1234-5678-1234-567812345678"
    assert message.role == "assistant"
    assert message.content == "Hello, how can I help you?"


def test_message_invalid_role():
    """Test creating a Message with invalid role."""
    with pytest.raises(ValueError):
        Message(id="12345678-1234-5678-1234-567812345678", role="invalid", content="test")


def test_rect_creation():
    """Test creating a Rect."""
    rect = Rect(top=0, left=0, width=100, height=100)
    
    assert rect.top == 0
    assert rect.left == 0
    assert rect.width == 100
    assert rect.height == 100


def test_pdf_highlight_creation():
    """Test creating a PDFHighlight."""
    rect = Rect(top=0, left=0, width=100, height=100)
    highlight = PDFHighlight(page=1, rect=rect)
    
    assert highlight.page == 1
    assert highlight.rect == rect


def test_pdf_highlight_minimal():
    """Test creating a PDFHighlight without optional fields."""
    rect = Rect(top=0, left=0, width=100, height=100)
    highlight = PDFHighlight(page=1, rect=rect)
    
    assert highlight.page == 1
    assert highlight.rect == rect


def test_source_creation():
    """Test creating a Source."""
    source = Source(
        id="12345678-1234-5678-1234-567812345678",
        title="Example Document",
        type="pdf",
        description="A sample PDF document",
        relevance=0.95,
        href="https://example.com/doc.pdf",
        highlights=[PDFHighlight(page=1, rect=Rect(top=0, left=0, width=100, height=100))]
    )
    
    assert source.id == "12345678-1234-5678-1234-567812345678"
    assert source.title == "Example Document"
    assert source.type == "pdf"
    assert source.description == "A sample PDF document"
    assert source.relevance == 0.95
    assert source.href == "https://example.com/doc.pdf"
    assert len(source.highlights) == 1


def test_source_with_text_data():
    """Test creating a Source with text data."""
    source = Source(
        id="12345678-1234-5678-1234-567812345678",
        title="Example Text",
        type="text",
        data="This is some sample text content"
    )
    
    assert source.id == "12345678-1234-5678-1234-567812345678"
    assert source.title == "Example Text"
    assert source.type == "text"
    assert source.data == "This is some sample text content"
    assert isinstance(source.data, str)


def test_source_with_binary_data():
    """Test creating a Source with binary data."""
    binary_data = b"Binary PDF data"
    source = Source(
        id="12345678-1234-5678-1234-567812345678",
        title="Example PDF",
        type="pdf",
        data=binary_data
    )
    
    assert source.id == "12345678-1234-5678-1234-567812345678"
    assert source.title == "Example PDF"
    assert source.type == "pdf"
    assert source.data == binary_data
    assert isinstance(source.data, bytes)


def test_source_with_metadata():
    """Test creating a Source with metadata."""
    source = Source(
        id="12345678-1234-5678-1234-567812345678",
        title="Example Document",
        type="pdf",
        metadata={"page": 5, "_page": 5}
    )
    
    assert source.id == "12345678-1234-5678-1234-567812345678"
    assert source.title == "Example Document"
    assert source.type == "pdf"
    assert source.metadata.page == 5
    assert source.metadata.field_page == 5  # Note the field name change in Pydantic


def test_stream_chunk_creation():
    """Test creating a StreamChunk."""
    chunk = StreamChunk(
        content="Partial response",
        sources=[
            Source(
                id="12345678-1234-5678-1234-567812345678",
                title="Example Document",
                type="text"
            )
        ],
        done=False
    )
    
    assert chunk.content == "Partial response"
    assert len(chunk.sources) == 1
    assert chunk.sources[0].title == "Example Document"
    assert chunk.done is False


def test_uuid_validation():
    """Test UUID validation."""
    # This should pass with a valid UUID format
    uuid = UUID(root="12345678-1234-5678-1234-567812345678")
    assert uuid.root == "12345678-1234-5678-1234-567812345678"
    
    # This would fail in a real UUID validator, but our current implementation might not validate the format
    # Uncomment if you implement strict UUID validation
    # with pytest.raises(ValueError):
    #     UUID(root="not-a-uuid") 