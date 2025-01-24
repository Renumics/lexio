# Tests for the lexio types

We test the types in the `lexio` package with the `pytest` framework.
Currently, we only have component tests for the types and no integration tests.

## Base-Types:

- Message
- Rect
- PDFHighlight
- Record (implicitly tested in other tests)

## Content-Types:

- BaseSourceContent
- TextContent
- MarkdownSourceContent
- HTMLSourceContent
- PDFSourceContent
- SourceContent (Union-Typ)

## Retrieval-Types:

- BaseRetrievalResult
- SourceReference
- RetrievalResult
- RetrieveResponse

## Generate-Types:

- GenerateInput
- GenerateResponse (implicitly tested in other tests)
