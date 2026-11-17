#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
uv sync --locked --project "$SCRIPT_DIR/.."
source "$SCRIPT_DIR/../.venv/bin/activate"
