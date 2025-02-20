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

import { createRESTContentSource } from './connectors/createRESTContentSource'
import { createSSEConnector } from './connectors/createSSEConnector'
import { createRESTConnector } from './connectors/createRESTConnector'

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

    // Connectors
    createRESTContentSource,
    createSSEConnector,
    createRESTConnector,

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

