#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
OUTPUT_FILE=lexio/types/__init__.py

# Generate types using datamodel-codegen for pydantic v2, the json schema is generated from lexio frontend
datamodel-codegen \
  --input ../../lexio/scripts/types.json \
  --output $OUTPUT_FILE \
  --input-file-type jsonschema \
  --use-schema-description \
  --use-field-description \
  --output-model-type pydantic_v2.BaseModel \
  --disable-timestamp \
  --use-annotated \
  --enum-field-as-literal all \
  --use-one-literal-as-default \
  --target-python-version 3.10

# We use pydantic v2 and support from python 3.10 onwards
# Use schema description to populate class description / docstring
# Use field description to populate field description / docstring

echo "✅ Generated types in $OUTPUT_FILE"

# Run post-processing script to fix type conversions
python scripts/post_process_types.py "$OUTPUT_FILE"

echo "✅ Post-processed types in $OUTPUT_FILE"

