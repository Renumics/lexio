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

This package uses [Semantic Versioning](https://semver.org/). The version number is automatically managed using `setuptools-scm` based on git tags.

To create a new release:

1. Create and push a new tag:
```bash
git tag -a v0.1.0 -m "Initial release"
git push origin v0.1.0
```

2. The version will be automatically derived from the git tag when building the package.

## License

MIT

## Generating the types

Run the bash script [generate-types.sh](scripts%2Fgenerate-types.sh) to generate the types and run the python script [generate_init.py](scripts%2Fgenerate_init.py) to generate the `__init__.py` file of the package.