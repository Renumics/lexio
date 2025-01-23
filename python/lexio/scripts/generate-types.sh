#!/bin/bash

# Generate types using datamodel-codegen
datamodel-codegen \
  --input ../../rag-ui/scripts/types.json \
  --output lexio/types/__init__.py \
  --input-file-type jsonschema \
  --use-schema-description \
  --use-field-description \
  --output-model-type pydantic_v2.BaseModel \
  --use-annotated \
  --enum-field-as-literal all \
  --target-python-version 3.9

echo "Types generated successfully"

# We use pydantic v2 and support from python 3.9 onwards
# Use schema description to populate class description / docstring
# Use field description to populate field description / docstring
