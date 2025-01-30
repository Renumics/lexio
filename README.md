<p align="center"><a href="https://renumics.com/lexio-ui"><img src="lexio/src/stories/assets/lexio logo transparent.png" alt="Gray shape shifter" height="60"/></a></p>

<p align="center">Quickest way to production grade RAG UI. </p>

<p align="center">
	<a href="https://github.com/Renumics/lexio/blob/main/LICENSE"><img src="https://img.shields.io/github/license/renumics/lexio" height="20"/></a>
    <a href="README.md"><img src="https://img.shields.io/github/actions/workflow/status/Renumics/lexio/check.yml" height="20"/></a>
    <a href="https://www.npmjs.com/package/lexio"><img src="https://img.shields.io/npm/v/lexio" height="20"/></a>
    <a href="https://pypi.org/project/lexio/"><img src="https://img.shields.io/pypi/v/lexio" height="20"/></a>
</p>

<h3 align="center">
   <a href="https://renumics.com/lexio-ui"><b>Documentation</b></a> &bull;
   <a href="https://renumics.com/blog/"><b>Blog</b></a>
 </h3>

Lexio is a robust React library for Retrieval-Augmented Generation (RAG) document QA interfaces, handling complex workflows out of the box while remaining simple to use. 

It supports multiple document types (PDF, HTML, Markdown) with advanced features like streaming responses and source highlighting. 

Developers can use ready-made components or easily build custom ones using React hooks.

![RAG UI Example](lexio/src/stories/assets/shot_lexio_llama_index.png)


## Quick Start

You can install the library with npm or yarn:

```bash
npm install lexio
```

To use the GUI components, you need to provide retrieval and generation functions to the `RAGProvider` context:

```tsx
import { RAGProvider, ChatWindow, AdvancedQueryField, SourcesDisplay, ContentDisplay, ErrorDisplay } from 'lexio';

const App = () => (
<RAGProvider
  retrieveAndGenerate={(messages) => {
    return {
      sources: Promise.resolve([
        {
          source: "example-doc.pdf",
        },
          relevanceScore: 0.95
        }
      ]),
      response: Promise.resolve("This is a sample response based on the retrieved documents.")
    };
  }}
>
  <ChatWindow />
  <AdvancedQueryField />
  <SourcesDisplay />
  <ContentDisplay />
  <ErrorDisplay />
</RAGProvider>
);
```
Follow the Tutorial to learn more about the library.

## Key Features
- **Powerful Viewers**: Pre-built components for chat interfaces, source selection and viewing with source highlighting
- **Integrated State Management**: Transparent state handling for interaction between components
- **Opinionated Architecture**: Implements RAG best practices out of the box
- **Highly Customizable**: Theming and component customization options through ...

## Advantages
- **Quick Implementation**: Get your RAG interface running with just a few lines of code
- **Production Ready**: Built for integration into mature web applications
- **Best Practices Built-in**: Follows RAG implementation patterns from real-world applications
- **Framework Agnostic**: Works with any backend RAG implementation

## Target Groups

### 🚀 Startups
- Rapid prototyping capabilities
- Quick time-to-market
- Flexible customization options

### 🌐 Enterprise
- Enterprise-grade reliability
- Seamless integration with existing systems
- Production-ready components
- Professional support options

### 👨‍💻 AI Developers
- Full control over RAG pipeline
- Custom component development
- Advanced configuration options
- Direct access to underlying state
