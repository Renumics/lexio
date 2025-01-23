#!/bin/bash

# Exit on error
set -e

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LEXIO_DIR="$(dirname "$SCRIPT_DIR")"

echo "Setting up development environment in $LEXIO_DIR"

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "$LEXIO_DIR/.venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$LEXIO_DIR/.venv"
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
VENV_ACTIVATE="$LEXIO_DIR/.venv/bin/activate"
if [ ! -f "$VENV_ACTIVATE" ]; then
    echo "Error: Virtual environment activation script not found at $VENV_ACTIVATE"
    exit 1
fi

source "$VENV_ACTIVATE"

# Verify virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Error: Virtual environment activation failed"
    exit 1
fi

# Install development dependencies
echo "Installing development dependencies..."
pip install -e "$LEXIO_DIR[dev]"

echo "Development environment setup complete!"
echo "Virtual environment is now active and ready to use" 