"""Tests for the types module."""
import pytest
from lexio.types import (
    Message,
    Rect,
    PDFHighlight,
    SourceReference,
    TextContent,
    MarkdownSourceContent,
    HTMLSourceContent,
    PDFSourceContent,
    Record,
)


def test_message_creation():
    """Test creating a Message."""
    message = Message(role="assistant", content="Hello, how can I help you?")
    
    assert message.role == "assistant"
    assert message.content == "Hello, how can I help you?"


def test_message_invalid_role():
    """Test creating a Message with invalid role."""
    with pytest.raises(ValueError):
        Message(role="invalid", content="test")


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
    highlight = PDFHighlight(page=1, rect=rect, comment="Test comment")
    
    assert highlight.page == 1
    assert highlight.rect == rect
    assert highlight.comment == "Test comment"


def test_pdf_highlight_minimal():
    """Test creating a PDFHighlight without optional fields."""
    rect = Rect(top=0, left=0, width=100, height=100)
    highlight = PDFHighlight(page=1, rect=rect)
    
    assert highlight.page == 1
    assert highlight.rect == rect
    assert highlight.comment is None


def test_text_content_creation():
    """Test creating a TextContent."""
    text_content = TextContent(
        text="Sample text",
        sourceName="test.txt",
        relevanceScore=0.8,
        metadata={"key": "value"},
        highlights=[PDFHighlight(page=1, rect=Rect(top=0, left=0, width=100, height=100))]
    )
    
    assert text_content.text == "Sample text"
    assert text_content.sourceName == "test.txt"
    assert text_content.relevanceScore == 0.8
    assert text_content.metadata.root == {"key": "value"}
    assert len(text_content.highlights) == 1


def test_markdown_source_content():
    """Test creating a MarkdownSourceContent."""
    content = MarkdownSourceContent(
        content="# Title\nContent",
        type="markdown",
        metadata={"author": "test"}
    )
    
    assert content.content == "# Title\nContent"
    assert content.type == "markdown"
    assert content.metadata.root == {"author": "test"}


def test_html_source_content():
    """Test creating an HTMLSourceContent."""
    content = HTMLSourceContent(
        content="<h1>Title</h1><p>Content</p>",
        type="html",
        metadata={"author": "test"}
    )
    
    assert content.content == "<h1>Title</h1><p>Content</p>"
    assert content.type == "html"
    assert content.metadata.root == {"author": "test"}


def test_source_reference_creation():
    """Test creating a SourceReference."""
    source = SourceReference(
        type="pdf",
        sourceReference="example.pdf",
        sourceName="Example PDF",
        relevanceScore=0.95,
        metadata={"pages": 10},
        highlights=[PDFHighlight(page=1, rect=Rect(top=0, left=0, width=100, height=100))],
    )
    
    assert source.type == "pdf"
    assert source.sourceReference == "example.pdf"
    assert source.sourceName == "Example PDF"
    assert source.relevanceScore == 0.95
    assert source.metadata.root == {"pages": 10}
    assert len(source.highlights) == 1
    assert source.highlights[0].page == 1
    assert source.highlights[0].rect.top == 0
    assert source.highlights[0].rect.left == 0
    assert source.highlights[0].rect.width == 100
    assert source.highlights[0].rect.height == 100


def test_source_reference_minimal():
    """Test creating a SourceReference with minimal required fields."""
    source = SourceReference(
        type="pdf",
        sourceReference="example.pdf",
    )
    
    assert source.type == "pdf"
    assert source.sourceReference == "example.pdf"
    assert source.sourceName is None
    assert source.relevanceScore is None
    assert source.metadata is None
    assert source.highlights is None


def test_source_reference_invalid():
    """Test creating a SourceReference with invalid data raises an error."""
    with pytest.raises(ValueError):
        SourceReference(
            type="invalid_type",
            sourceReference=123,  # should be string
        ) 