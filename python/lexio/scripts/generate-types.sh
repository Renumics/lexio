#!/bin/bash
OUTPUT_FILE=lexio/types/__init__.py

# Generate types using datamodel-codegen for pydantic v2, the json schema is generated from lexio frontend
datamodel-codegen \
  --input ../../lexio/scripts/types.json \
  --output $OUTPUT_FILE \
  --input-file-type jsonschema \
  --use-schema-description \
  --use-field-description \
  --output-model-type pydantic_v2.BaseModel \
  --use-annotated \
  --enum-field-as-literal all \
  --use-one-literal-as-default \
  --target-python-version 3.9

# We use pydantic v2 and support from python 3.9 onwards
# Use schema description to populate class description / docstring
# Use field description to populate field description / docstring

echo "✅ Generated types in $OUTPUT_FILE"

# Run post-processing script to fix type conversions
python3 $(dirname "$0")/post_process_types.py "$OUTPUT_FILE"

echo "✅ Post-processed types in $OUTPUT_FILE"

