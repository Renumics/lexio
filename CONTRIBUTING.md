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

Follow these steps to create the package:

1. Update the frontend library with the latest changes.
2. If you want to add new types to the python package, update the [types-to-include.json](scripts%2Ftypes-to-include.json) file.
3. Run `npm run build-python-package` to (1) generate the python package, (2) run tests and (3) build the package in the `python/lexio` folder.
   1. How? The pydantic classes are generated with `datamodel-codegen` from a json schema file. The schema file is generated from the types in the frontend library.
   2. The tests are run with `pytest` to ensure the package is working as expected.
   3. The version of the package is set automatically from the frontend library's `package.json` file.
4. Commit the changes to the python package.

> Note: We use the version from the frontend library's `package.json` file as the version for the Python package.

To publish the package to PyPI: 
```
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

Since we are creating the `lexio` python package automatically we run several test with 'pytest' to ensure the package is working as expected. The tests are located in the [tests](tests)[tests](..%2Fpython%2Flexio%2Ftests) folder.
If you add new types which are exported to the python package, you should also add tests for them.

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

---

Thank you for contributing to Lexio! 