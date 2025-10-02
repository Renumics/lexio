# Lexio

Python package containing API types for the lexio frontend library.

## Installation

```bash
pip install lexio
```

## Usage

```python
from lexio.types import Source

# Use the types in your code
source = Source(
    id="12345678-1234-5678-1234-567812345678",
    title="Example Document",
    type="pdf",
    description="A sample PDF document",
    relevance=0.95,
    href="https://example.com/document.pdf"
)

print(source)
# Output: id='12345678-1234-5678-1234-567812345678' title='Example Document' type='pdf' description='A sample PDF document' relevance=0.95 href='https://example.com/document.pdf' data=None metadata=None highlights=None
```

## License

GPL-3.0 license

## Development

> **Note:** This package is automatically generated from the [lexio](https://github.com/Renumics/lexio) frontend library. Do not modify the files in this package directly.
