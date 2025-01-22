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
datamodel-codegen \
  --input ../../rag-ui/scripts/types.json \
  --output lexio/types/__init__.py \
  --input-file-type jsonschema \
  --use-schema-description \
  --output-model-type pydantic_v2.BaseModel \
  --use-field-description 
```

MIT License
