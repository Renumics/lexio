<p align="center"><a href="https://renumics.com/lexio-ui"><img src="lexio/src/stories/assets/lexio logo transparent.png" alt="Lexio Logo" height="80"/></a></p>

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

Lexio is a powerful React library for building Retrieval-Augmented Generation (RAG) interfaces, handling complex workflows out of the box while remaining simple to use and highly customizable.

It supports multiple document types (PDF, HTML, Markdown, Text) with advanced features like streaming responses, source highlighting, and a comprehensive state management system.

Developers can use ready-made components or easily build custom ones using React hooks and the flexible action handler pattern.

![RAG UI Example](lexio/src/stories/assets/shot_lexio_llama_index.png)

## Quick Start

You can install the library with npm or yarn:

```bash
npm install lexio
```

To use the GUI components, you need to provide an action handler to the `LexioProvider` context:

```tsx
const App = () => (
  <LexioProvider
    onAction={(action, messages, sources, activeSources, selectedSource) => {
      // Handle user messages
      if (action.type === 'ADD_USER_MESSAGE') {
        return {
          // Return sources as a Promise that resolves to Source[]
          sources: fetchSources(),
          // Return a response as a Promise or use streaming
          response: Promise.resolve("This is a sample response based on the retrieved documents.")
        };
      }
      // Handle source selection
      if (action.type === 'SET_SELECTED_SOURCE' && action.sourceObject) {
        return {
          sourceData: fetchSourceContent(action.sourceObject.id)
        };
      }
      return undefined;
    }}
  >
    <ChatWindow markdown={true} />
    <AdvancedQueryField />
    <SourcesDisplay />
    <ContentDisplay />
  </LexioProvider>
);
```

Follow the [documentation](https://renumics.com/lexio/) to learn more about the library.

## Core Concepts

### 🔄 LexioProvider

The [LexioProvider](lexio%2Flib%2Fcomponents%2FLexioProvider%2Fprovider.tsx) is the core component that provides the context for all Lexio UI components:
- It manages the shared state for all UI components
- It processes user actions through the `onAction` ActionHandler
- It handles error states and loading indicators
- It provides configuration options for timeouts and other settings

### 🧩 UI Components 

Lexio provides several ready-to-use UI components:

- **[ChatWindow](lexio%2Flib%2Fcomponents%2FChatWindow%2FChatWindow.tsx)**: 💬 Displays the conversation history and AI responses with markdown support
- **[AdvancedQueryField](lexio%2Flib%2Fcomponents%2FAdvancedQueryField%2FAdvancedQueryField.tsx)**: 📝 Input field for user messages with optional advanced features
- **[SourcesDisplay](lexio%2Flib%2Fcomponents%2FSourcesDisplay%2FSourcesDisplay.tsx)**: 📚 Shows retrieved sources with metadata and selection capabilities
- **[ContentDisplay](lexio%2Flib%2Fcomponents%2FContentDisplay%2FContentDisplay.tsx)**: 📄 Renders the content of selected sources with highlighting
- **[ErrorDisplay](lexio%2Flib%2Fcomponents%2FErrorDisplay%2FErrorDisplay.tsx)**: ❗ Shows error messages and loading states

### 🔗 React Hooks

Lexio provides a set of React hooks that allow you to interact with the state and trigger actions from your custom components:

- **[useSources](lexio%2Flib%2Fhooks%2Fhooks.ts)**: 📊 Access and manipulate source-related state
- **[useMessages](lexio%2Flib%2Fhooks%2Fhooks.ts)**: 💌 Access and manipulate message-related state
- **[useStatus](lexio%2Flib%2Fhooks%2Fhooks.ts)**: ⏳ Access loading and error states

## Key Features

<div align="center">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; color: #000;">
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #3498db;">
      <h3>🔄 Action Handler Pattern</h3>
      <p style="color: #000;">A flexible pattern for handling user interactions and state updates</p>
    </div>
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #3498db;">
      <h3>🧩 Powerful Components</h3>
      <p style="color: #000;">Pre-built components for chat interfaces, source selection, and document viewing with highlighting</p>
    </div>
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #3498db;">
      <h3>⚙️ Integrated State Management</h3>
      <p style="color: #000;">Transparent state handling for seamless interaction between components</p>
    </div>
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #3498db;">
      <h3>🌊 Streaming Responses</h3>
      <p style="color: #000;">Support for real-time, incremental responses with source updates</p>
    </div>
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #3498db;">
      <h3>🛡️ Comprehensive Error Handling</h3>
      <p style="color: #000;">Built-in error handling and timeout management</p>
    </div>
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #3498db;">
      <h3>🎨 Highly Customizable</h3>
      <p style="color: #000;">Theming and component customization options</p>
    </div>
  </div>
</div>

## Advantages

<div align="center">
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; color: #000;">
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #2ecc71;">
      <h3>⚡ Quick Implementation</h3>
      <p style="color: #000;">Get your RAG interface running with just a few lines of code</p>
    </div>
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #2ecc71;">
      <h3>🚀 Production Ready</h3>
      <p style="color: #000;">Built for integration into mature web applications</p>
    </div>
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #2ecc71;">
      <h3>📚 Best Practices Built-in</h3>
      <p style="color: #000;">Follows RAG implementation patterns from real-world applications</p>
    </div>
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #2ecc71;">
      <h3>🔌 Framework Agnostic</h3>
      <p style="color: #000;">Works with any backend RAG implementation</p>
    </div>
  </div>
  <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #2ecc71; max-width: 500px; margin: 0 auto; color: #000;">
    <h3>🧩 Flexible Architecture</h3>
    <p style="color: #000;">Adapt to various use cases from simple chat to complex document analysis</p>
  </div>
</div>

## Target Groups

<div align="center">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; color: #000;">
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #e74c3c;">
      <h3>🚀 Startups</h3>
      <ul>
        <li style="color: #000;">Rapid prototyping capabilities</li>
        <li style="color: #000;">Quick time-to-market</li>
        <li style="color: #000;">Flexible customization options</li>
      </ul>
    </div>
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #e74c3c;">
      <h3>🌐 Enterprise</h3>
      <ul>
        <li style="color: #000;">Enterprise-grade reliability</li>
        <li style="color: #000;">Seamless integration with existing systems</li>
        <li style="color: #000;">Production-ready components</li>
        <li style="color: #000;">Professional support options</li>
      </ul>
    </div>
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; border-left: 4px solid #e74c3c;">
      <h3>👨‍💻 AI Developers</h3>
      <ul>
        <li style="color: #000;">Full control over RAG pipeline</li>
        <li style="color: #000;">Custom component development</li>
        <li style="color: #000;">Advanced configuration options</li>
        <li style="color: #000;">Direct access to underlying state</li>
      </ul>
    </div>
  </div>
</div>
