#!/usr/bin/env python3
"""
Post-process the generated Pydantic models to fix type conversions.
This script specifically replaces the complex Data model with a simple bytes type
and replaces UUID with str.
"""

import re
import sys
from pathlib import Path

def post_process_types(file_path):
    """
    Post-process the generated types file to fix Uint8Array conversion
    and replace UUID with str.
    
    Args:
        file_path: Path to the generated __init__.py file
    """
    print(f"Post-processing types in {file_path}")
    
    # Read the file content
    with open(file_path, 'r') as f:
        content = f.read()
    
    # 1. Remove the Data class definition
    data_class_pattern = re.compile(
        r'class Data\(BaseModel\):.*?(?=class \w+\(BaseModel\):)', 
        re.DOTALL
    )
    content = data_class_pattern.sub('', content)
    
    # 2. Fix the imports - remove 'bytes' from typing import if it exists
    if 'from typing import bytes' in content:
        content = re.sub(r'from typing import bytes,\s*', 'from typing import ', content)
    
    # 3. Replace Union[Data, str] with Union[bytes, str] in the Source class
    content = content.replace('Union[Data, str]', 'Union[bytes, str]')
    
    # 4. Fix the data field type in Source class to be Union[str, bytes]
    content = re.sub(
        r'(data: Annotated\[Optional\[)Any(\], Field\(title=\'data\'\)\])',
        r'\1Union[str, bytes]\2',
        content
    )
    
    # 5. Fix invalid escape sequences in docstrings
    content = content.replace('\\`', '`')
    
    # 6. Remove the UUID class definition
    uuid_class_pattern = re.compile(
        r'class UUID\(RootModel\[Any\]\):.*?(?=class \w+\((?:BaseModel|RootModel))', 
        re.DOTALL
    )
    content = uuid_class_pattern.sub('', content)
    
    # 7. Replace all references to UUID with str
    content = re.sub(r'Annotated\[UUID,', 'Annotated[str,', content)
    
    # 8. Make sure Union is imported
    if 'Union' not in content.split('from typing import ')[1].split('\n')[0]:
        content = content.replace(
            'from typing import Annotated, Any,', 
            'from typing import Annotated, Any, Union,'
        )
    
    # Write the modified content back to the file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print("✅ Post-processing completed successfully")

if __name__ == "__main__":
    # Get the file path from command line arguments or use default
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = Path(__file__).parent.parent / "lexio" / "types" / "__init__.py"
    
    post_process_types(file_path) 