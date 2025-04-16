<p align="center"><a href="https://renumics.com/lexio-ui"><img src="https://raw.githubusercontent.com/Renumics/lexio/main/lexio/src/stories/assets/lexio%20logo%20transparent.png" alt="Lexio Logo" height="80"/></a></p>

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

It supports multiple document types (PDF, HTML, Markdown, Text, Excel) with advanced features like streaming responses, source highlighting, and a comprehensive state management system.

Developers can use ready-made components or easily build custom ones using React hooks and the flexible action handler pattern.

![RAG UI Example](https://raw.githubusercontent.com/Renumics/lexio/main/lexio/src/assets/lexio_screenshot_el_nino.png)

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


## Dependencies

Lexio has minimal core dependencies, but some advanced components require additional packages that are not installed by default:

- **SpreadsheetViewer**: For Excel/spreadsheet file viewing, you'll need to install:
  ```bash
  npm install exceljs xlsx @tanstack/react-table @tanstack/react-virtual
  ```

- **Explanations Module**: For advanced explanation features, you'll need to install:
  ```bash
  npm install compromise js-tiktoken sbd @types/sbd
  ```

These dependencies are dynamically imported when the components are used, but you must install them yourself to avoid runtime errors.

## Core Concepts

### 🔄 LexioProvider

The [LexioProvider](https://github.com/Renumics/lexio/blob/main/lexio/lib/components/LexioProvider/provider.tsx) is the core component that provides the context for all Lexio UI components:
- It manages the shared state for all UI components
- It processes user actions through the `onAction` ActionHandler
- It handles error states and loading indicators
- It provides configuration options for timeouts and other settings

### 🧩 UI Components 

Lexio provides several ready-to-use UI components:

- **[ChatWindow](https://github.com/Renumics/lexio/blob/main/lexio/lib/components/ChatWindow/ChatWindow.tsx)**: 💬 Displays the conversation history and AI responses with markdown support
- **[AdvancedQueryField](https://github.com/Renumics/lexio/blob/main/lexio/lib/components/AdvancedQueryField/AdvancedQueryField.tsx)**: 📝 Input field for user messages with optional advanced features
- **[SourcesDisplay](https://github.com/Renumics/lexio/blob/main/lexio/lib/components/SourcesDisplay/SourcesDisplay.tsx)**: 📚 Shows retrieved sources with metadata and selection capabilities
- **[ContentDisplay](https://github.com/Renumics/lexio/blob/main/lexio/lib/components/ContentDisplay/ContentDisplay.tsx)**: 📄 Renders the content of selected sources with highlighting
- **[ErrorDisplay](https://github.com/Renumics/lexio/blob/main/lexio/blob/main/lexio/lib/components/ErrorDisplay/ErrorDisplay.tsx)**: ❗ Shows error messages and loading states
### 🔗 React Hooks

Lexio provides a set of React hooks that allow you to interact with the state and trigger actions from your custom components:

- **[useSources](https://github.com/Renumics/lexio/blob/main/lexio/lib/hooks/hooks.ts)**: 📊 Access and manipulate source-related state
- **[useMessages](https://github.com/Renumics/lexio/blob/main/lexio/lib/hooks/hooks.ts)**: 💌 Access and manipulate message-related state
- **[useStatus](https://github.com/Renumics/lexio/blob/main/lexio/lib/hooks/hooks.ts)**: ⏳ Access loading and error states