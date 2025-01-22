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
```

## License

## Generating the types

```bash
datamodel-codegen --input ../../rag-ui/scripts/openapi-schema.json --output lexio/types/__init__.py --input-file-type jsonschema
```

MIT License
