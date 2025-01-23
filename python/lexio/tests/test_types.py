"""Tests for the types module."""
import pytest
from lexio.types import SourceReference, PDFHighlight, Rect


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
    assert source.metadata == {"pages": 10}
    assert source.highlights == [{"page": 1}]


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