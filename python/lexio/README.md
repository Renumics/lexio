# Lexio

Python package containing API types for the lexio frontend library.

## Installation

```bash
pip install lexio
```

## Usage

```python
from lexio.types import SourceReference

# Use the types in your code
source = SourceReference(type='pdf', sourceReference='example.pdf')

print(source)
# Output: type='pdf' sourceReference='example.pdf' sourceName=None relevanceScore=None metadata=None highlights=None
```

## License

GPL-3.0 license

## Development

> **Note:** This package is automatically generated from the [lexio](https://github.com/Renumics/lexio) frontend library. Do not modify the files in this package directly.
