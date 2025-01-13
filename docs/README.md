# RAG UI (insert cool name here)

## Tutorials

### Getting Started
* Install RAG UI
* Most simple usage is to just use the retrieveAndGenerate function to connect to your backend. For llama-index use our connector function, else use the function shown below.

### Browsing sources
* Showcase viewer for PDF and HTML.
* Showcase highlighting features and the associated data formats.

### Asking follow up questions
* Additionally, implement the generate function to trigger an LLM only endpoint.
* Concrete example for this or showcasing a connector, e.g., based on vercel ai package.

### Specifying a custom workflow and integrating with a surrounding application
* Showcase workflow control mechanisms such as onMessage handler
* Showcase how to use data from the outside app in the RAG workflow

### Specifying sources for retrieval
* Showcase filtering of sources of an initial retrieval.
* Showcase retrieving first and then specifying sources for answer generation.
* One component to showcase here is the SourcesDisplay component with an additional search field, the other is the queryfield that supports mentions in some way.

### Using metadata for retrieval
* Showcase display and filtering based on source names and metadata. !!! this is maybe not implemented within the first release, only if I have time on the weekend or evenings.

### Applying custom styling to the UI
* Showcase how to apply custom styling to the UI, e.g. via some sort of theming mechanism for the components.

### Writing own RAG components
* Showcase writing an own Query or Chatfield based on the hooks.

### Error handling
* Showcase how errors are automatically handled and also show how application can react on errors.

## Examples
### Using RAG UI with llama-index
..

### Using RAG UI with completely custom backend
...

## API Docs
Generate some nice API docs for everything.