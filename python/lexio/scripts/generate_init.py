#!/usr/bin/env python3

"""
Script to generate the __init__.py file for lexio package based on the types list.
"""

from pathlib import Path
from datetime import datetime

# List of types to include (matching the TypeScript types)
TYPES_TO_INCLUDE = [
    'RetrievalResult',
    'BaseSourceContent',
    'BaseRetrievalResult',
    'Message',
    'SourceReference',
    'TextContent',
    'MarkdownSourceContent',
    'HTMLSourceContent',
    'PDFSourceContent',
    'PDFHighlight',
    'SourceContent',
    'RetrievalResult',
    'RetrieveResponse',
    'GenerateInput',
    'GenerateResponse'
]

def generate_init():
    # Remove duplicates and sort
    types = sorted(set(TYPES_TO_INCLUDE))
    
    # Generate the import statement
    imports = '\n'.join(f'    {type_name},' for type_name in types)
    
    # Generate the __all__ list
    all_list = '\n'.join(f'    "{type_name}",' for type_name in types)

    # Get current timestamp
    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S+00:00")
    
    # Template for the __init__.py file
    template = '''"""
Lexio - API types for the lexio frontend library
This file is auto-generated. Do not edit directly.

Generated from:
  source:    lexio.types
  timestamp: {timestamp}
"""

from lexio.types import (
{imports}
)

__version__ = "0.1.0"

__all__ = [
{all_list}
]
'''
    
    # Get the path to the __init__.py file
    init_path = Path(__file__).parent.parent / 'lexio' / '__init__.py'
    
    # Write the content to the file
    init_path.write_text(template.format(
        imports=imports,
        all_list=all_list,
        timestamp=timestamp
    ))
    print(f"Generated {init_path}")

if __name__ == '__main__':
    generate_init() 