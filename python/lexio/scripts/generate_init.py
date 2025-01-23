#!/usr/bin/env python3

"""
Script to generate the __init__.py file for lexio package based on the types list.
"""

import sys
import json
from pathlib import Path
from datetime import datetime, UTC, timedelta, timezone

# Bedingter Import von UTC
if sys.version_info >= (3, 11):
    from datetime import UTC
else:
    UTC = timezone.utc


def generate_init(types_to_include: list):
    # Remove duplicates and sort
    types = sorted(set(types_to_include))
    
    # Generate the import statement
    imports = '\n'.join(f'    {type_name},' for type_name in types)
    
    # Generate the __all__ list
    all_list = '\n'.join(f'    "{type_name}",' for type_name in types)

    # Get current timestamp
    timestamp = datetime.now(UTC).astimezone(timezone(timedelta(hours=1))).strftime("%Y-%m-%dT%H:%M:%S+00:00")
    
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
from lexio.version import __version__

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
    # read the types to include from the json file which is copied from the frontend
    with open(Path(__file__).parent / 'types-to-include.json', 'r') as file:
        parsed_data = json.load(file)
        assert 'typesToInclude' in parsed_data.keys() and isinstance(parsed_data['typesToInclude'], list)

    # generate the __init__.py file
    generate_init(types_to_include=parsed_data['typesToInclude'])