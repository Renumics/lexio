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
    assert source.metadata["page"] == 5
    assert source.metadata["_page"] == 5  # Direkter Zugriff auf Dict-Werte


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


def test_message_serialization_deserialization():
    """Test serializing and deserializing a Message."""
    # Create a message
    original_message = Message(
        id="12345678-1234-5678-1234-567812345678", 
        role="assistant", 
        content="Hello, how can I help you?"
    )
    
    # Serialize to JSON
    json_data = original_message.model_dump_json()
    
    # Deserialize from JSON
    deserialized_message = Message.model_validate_json(json_data)
    
    # Verify the deserialized message matches the original
    assert deserialized_message.id == original_message.id
    assert deserialized_message.role == original_message.role
    assert deserialized_message.content == original_message.content


def test_source_serialization_deserialization():
    """Test serializing and deserializing a Source with various data types."""
    # Create a source with text data
    source_with_text = Source(
        id="12345678-1234-5678-1234-567812345678",
        title="Text Source",
        type="text",
        data="This is text data"
    )
    
    # Serialize to JSON
    json_data = source_with_text.model_dump_json()
    
    # Deserialize from JSON
    deserialized_source = Source.model_validate_json(json_data)
    
    # Verify the deserialized source matches the original
    assert deserialized_source.id == source_with_text.id
    assert deserialized_source.title == source_with_text.title
    assert deserialized_source.type == source_with_text.type
    # String data might be converted to bytes during serialization/deserialization
    if isinstance(deserialized_source.data, bytes) and isinstance(source_with_text.data, str):
        assert deserialized_source.data.decode('utf-8') == source_with_text.data
    else:
        assert deserialized_source.data == source_with_text.data
    
    # Test with binary data - this requires special handling
    binary_data = b"Binary PDF data"
    source_with_binary = Source(
        id="12345678-1234-5678-1234-567812345678",
        title="Binary Source",
        type="pdf",
        data=binary_data
    )
    
    # For binary data, we need to use model_dump instead of model_dump_json
    dict_data = source_with_binary.model_dump()
    
    # In a real scenario, you would encode the binary data for transmission
    # For example, using base64
    import base64
    dict_data['data'] = base64.b64encode(dict_data['data']).decode('utf-8')
    
    # Then on the receiving end, you would decode it
    received_data = dict_data.copy()
    received_data['data'] = base64.b64decode(received_data['data'].encode('utf-8'))
    
    # Create a new Source from the received data
    reconstructed_source = Source.model_validate(received_data)
    
    # Verify the reconstructed source matches the original
    assert reconstructed_source.id == source_with_binary.id
    assert reconstructed_source.title == source_with_binary.title
    assert reconstructed_source.type == source_with_binary.type
    assert reconstructed_source.data == source_with_binary.data


def test_complex_source_serialization_deserialization():
    """Test serializing and deserializing a Source with nested objects."""
    # Create a source with highlights and metadata
    source = Source(
        id="12345678-1234-5678-1234-567812345678",
        title="Complex Source",
        type="pdf",
        description="A complex source with highlights and metadata",
        relevance=0.95,
        href="https://example.com/doc.pdf",
        metadata={"page": 5, "_page": 5},  # Dict statt Metadata-Klasse
        highlights=[
            PDFHighlight(
                page=1, 
                rect=Rect(top=10, left=20, width=100, height=50)
            ),
            PDFHighlight(
                page=2, 
                rect=Rect(top=30, left=40, width=200, height=60)
            )
        ]
    )
    
    # Serialize to JSON
    json_data = source.model_dump_json()
    
    # Deserialize from JSON
    deserialized_source = Source.model_validate_json(json_data)
    
    # Verify the deserialized source matches the original
    assert deserialized_source.id == source.id
    assert deserialized_source.title == source.title
    assert deserialized_source.type == source.type
    assert deserialized_source.description == source.description
    assert deserialized_source.relevance == source.relevance
    assert deserialized_source.href == source.href
    
    # Check metadata
    assert deserialized_source.metadata is not None
    assert deserialized_source.metadata["page"] == 5
    assert deserialized_source.metadata["_page"] == 5
    
    # Check highlights
    assert len(deserialized_source.highlights) == 2
    
    # Check first highlight
    highlight1 = deserialized_source.highlights[0]
    assert highlight1.page == 1
    assert highlight1.rect.top == 10
    assert highlight1.rect.left == 20
    assert highlight1.rect.width == 100
    assert highlight1.rect.height == 50
    
    # Check second highlight
    highlight2 = deserialized_source.highlights[1]
    assert highlight2.page == 2
    assert highlight2.rect.top == 30
    assert highlight2.rect.left == 40
    assert highlight2.rect.width == 200
    assert highlight2.rect.height == 60


def test_stream_chunk_serialization_deserialization():
    """Test serializing and deserializing a StreamChunk."""
    # Create a stream chunk
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
    
    # Serialize to JSON
    json_data = chunk.model_dump_json()
    
    # Deserialize from JSON
    deserialized_chunk = StreamChunk.model_validate_json(json_data)
    
    # Verify the deserialized chunk matches the original
    assert deserialized_chunk.content == chunk.content
    assert len(deserialized_chunk.sources) == 1
    assert deserialized_chunk.sources[0].id == chunk.sources[0].id
    assert deserialized_chunk.sources[0].title == chunk.sources[0].title
    assert deserialized_chunk.sources[0].type == chunk.sources[0].type
    assert deserialized_chunk.done == chunk.done


def test_frontend_backend_compatibility():
    """Test compatibility with frontend JSON format."""
    # This is an example of JSON that might come from the frontend
    frontend_json = """
    {
        "id": "12345678-1234-5678-1234-567812345678",
        "role": "user",
        "content": "What is the capital of France?"
    }
    """
    
    # Parse the JSON into a Message
    message = Message.model_validate_json(frontend_json)
    
    # Verify the parsed message has the expected values
    assert message.id == "12345678-1234-5678-1234-567812345678"
    assert message.role == "user"
    assert message.content == "What is the capital of France?"
    
    # Convert back to JSON for sending to frontend
    backend_json = message.model_dump_json()
    
    # The JSON should be compatible with the frontend's expectations
    import json
    parsed_json = json.loads(backend_json)
    assert parsed_json["id"] == "12345678-1234-5678-1234-567812345678"
    assert parsed_json["role"] == "user"
    assert parsed_json["content"] == "What is the capital of France?"


def test_invalid_json_deserialization():
    """Test handling of invalid JSON during deserialization."""
    # Invalid JSON missing required fields
    invalid_json = """
    {
        "role": "user"
    }
    """
    
    # Attempting to parse invalid JSON should raise a validation error
    with pytest.raises(Exception):  # Pydantic will raise ValidationError
        Message.model_validate_json(invalid_json)
    
    # Invalid JSON with wrong field types
    invalid_type_json = """
    {
        "id": "12345678-1234-5678-1234-567812345678",
        "role": "invalid_role",
        "content": "Test content"
    }
    """
    
    # Attempting to parse JSON with invalid role should raise a validation error
    with pytest.raises(Exception):  # Pydantic will raise ValidationError
        Message.model_validate_json(invalid_type_json)


def test_metadata_extra_fields():
    """Test if extra fields are allowed in metadata dictionary."""
    # Create a Source with metadata that includes extra fields
    source = Source(
        id="12345678-1234-5678-1234-567812345678",
        title="Test Source",
        type="pdf",
        metadata={"page": 1, "_page": 1, "extra_field": "value"}
    )
    
    # Verify the extra field is present
    assert source.metadata["extra_field"] == "value"