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

[//]: # (## Development)

[//]: # ([//]: # &#40;TODO add DEV DISCLAIMER!&#41;)
[//]: # (Run the bash script [generate-types.sh]&#40;scripts%2Fgenerate-types.sh&#41; to generate the types and run the python script [generate_init.py]&#40;scripts%2Fgenerate_init.py&#41; to generate the `__init__.py` file of the package.)