"""Tests for the types module."""
import pytest
from typing import Union
from lexio.types import (
    Message,
    Rect,
    PDFHighlight,
    Source,
    StreamChunk,
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
    assert source.metadata is not None
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


def test_source_data_union_type():
    """Test that Source.data can be either str or bytes."""
    # Test with string
    source1 = Source(
        id="12345678-1234-5678-1234-567812345678",
        title="Text Source",
        type="text",
        data="text data"
    )
    assert isinstance(source1.data, str)
    
    # Test with bytes
    source2 = Source(
        id="12345678-1234-5678-1234-567812345678",
        title="Binary Source",
        type="pdf",
        data=b"binary data"
    )
    assert isinstance(source2.data, bytes)
    
    # Verify the type annotation
    # This is a bit of a hack to check the type annotation at runtime
    import inspect
    from lexio.types import Source as SourceClass
    
    # Get the type annotation for the data field
    annotations = getattr(SourceClass, "__annotations__", {})
    data_type = annotations.get("data", None)
    
    # Check if it's a Union type with str and bytes
    assert "Union" in str(data_type) and "str" in str(data_type) and "bytes" in str(data_type)


def test_uuid_validation():
    """Test UUID validation."""
    # Since UUID is no longer exported, we test that IDs are accepted as strings
    message = Message(id="12345678-1234-5678-1234-567812345678", role="assistant", content="test")
    assert message.id == "12345678-1234-5678-1234-567812345678"
    
    # Test with an invalid UUID format (should still work as we're using strings)
    message2 = Message(id="not-a-uuid", role="assistant", content="test")
    assert message2.id == "not-a-uuid" 