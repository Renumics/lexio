# Contributing to Lexio

We're excited about your interest in contributing to Lexio!

### Prerequisites

- Node.js (v20 or higher)
- Python 3.9+
- npm
- Git

### Setting up the Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/lexio.git
   cd lexio
   ```
3. Install dependencies:
   ```bash
   # install the React UI dependencies
   cd lexio
   npm install
   ```

## Python Package

The python package is located in the [lexio](python/lexio) directory. The Python package is auto-generated from the frontend library. It contains API types for the lexio frontend library as pydantic models.  

### Python Package Structure

The core types are defined in `python/lexio/lexio/types/__init__.py` and are generated from the frontend library's TypeScript definitions. These models include:

- `Source`: Represents a source of information that can be displayed and referenced
- `Message`: Represents a chat message in the conversation
- `StreamChunk`: Represents a chunk of streamed content
- Other utility types like `Rect`, `PDFHighlight`, etc.

### Working with the Python Package

1. Update the frontend library with the latest changes.
2. If you want to add new types to the Python package, update the [types-to-include.json](scripts/types-to-include.json) file.
3. Run `npm run build-python-package` to:
   1. Generate the Python package with Pydantic models from the TypeScript types
   2. Run tests to ensure the package is working as expected
   3. Build the package in the `python/lexio` folder
4. Commit the changes to the Python package.

> Note: We use the version from the frontend library's `package.json` file as the version for the Python package.

### Using the Python Models in Your Backend

The Pydantic models can be imported directly in your backend code:

```python
from lexio.types import Source, Message, StreamChunk
```

These models provide type safety and validation for data exchanged between your backend and the Lexio frontend.

### Publishing the Package to PyPI

```bash
# cd to the python/lexio directory from the root of the project
cd python/lexio

# activate the virtual environment
source .venv/bin/activate

# build the package
hatch build

# check the package
twine check dist/*

# upload the package
twine upload dist/*
```

### Testing the Python Package

Since we are creating the `lexio` Python package automatically, we run several tests with 'pytest' to ensure the package is working as expected. The tests are located in the [python/lexio/tests](python/lexio/tests) folder.

If you add new types which are exported to the Python package, you should also add tests for them to ensure they work correctly.

## Code Style

### TypeScript/React

- Follow the existing ESLint configuration
- Use TypeScript strict mode
- Use TSDoc notation for documenting code
- Use functional components and hooks
- Follow React best practices

## Documentation

- Include docstrings/TSDoc comments for new functions and components
- Update type definitions where necessary
- Add examples to the documentation where necessary
- Add stories to the Storybook for new components under [components](lexio/src/stories/components)

## Questions & Support

- Open an issue for bugs or feature requests
- Check the existing [documentation](https://renumics.com/lexio-ui) and issues before opening new ones

## License

By contributing, you agree that your contributions will be licensed under the project's license.

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Provide comprehensive type definitions
- Document public APIs with JSDoc comments

### Component Guidelines
- Components should be well-documented with JSDoc comments
- Follow the existing pattern of separating component logic from presentation
- Use the ThemeContext for styling to maintain consistency
- Ensure components are accessible

### Testing
- Write tests for new functionality
- Update tests when modifying existing functionality
- Aim for good test coverage

## Storybook Documentation
When adding new components, please include Storybook stories that demonstrate:
- Basic usage
- Different configurations/props
- Edge cases

## Commit Guidelines
- Use clear, descriptive commit messages
- Reference issue numbers in commit messages when applicable

## Code Review
All submissions require review. We use GitHub pull requests for this purpose.

---

Thank you for contributing to Lexio! 