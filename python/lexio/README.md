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

MIT

## Generating the types

Run the bash script [generate-types.sh](scripts%2Fgenerate-types.sh) to generate the types and run the python script [generate_init.py](scripts%2Fgenerate_init.py) to generate the `__init__.py` file of the package.