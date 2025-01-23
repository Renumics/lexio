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

# Get the version
from lexio import __version__
print(__version__)
```

## Development

### Setup

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate

# Install development dependencies
pip install -e ".[dev]"
```

### Running Tests

```bash
pytest
```

### Versioning

[//]: # (TODO: Add instructions)
[//]: # (TODO add DISCLAIMER!)

## License

GPL-3.0 license

## Generating the types

Run the bash script [generate-types.sh](scripts%2Fgenerate-types.sh) to generate the types and run the python script [generate_init.py](scripts%2Fgenerate_init.py) to generate the `__init__.py` file of the package.