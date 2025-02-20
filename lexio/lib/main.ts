import './tailwind.css'

import { QueryField } from './components/QueryField'
import { AdvancedQueryField } from './components/AdvancedQueryField'
import { ChatWindow } from './components/ChatWindow'
import { PdfViewer } from './components/Viewers/PdfViewer'
import { RAGProvider } from './components/RAGProvider'
import { useRAGMessages, useRAGSources, useLexioStatus, useLexio } from './hooks'
import { SourcesDisplay } from './components/SourcesDisplay'
import { ErrorDisplay } from './components/ErrorDisplay'
import { ContentDisplay } from './components/ContentDisplay'

import { defaultTheme, createTheme } from './theme/index.ts'

export {
    // Components
    AdvancedQueryField,
    ChatWindow,
    ContentDisplay,
    ErrorDisplay,
    PdfViewer,
    QueryField,
    RAGProvider,
    SourcesDisplay,

    // Hooks
    useRAGMessages,
    useRAGSources,
    useLexioStatus,
    useLexio,

    // Theme
    createTheme,
    defaultTheme,
}
export * from './types'
export * from './theme/types'

