import './tailwind.css'

import { QueryField } from './components/QueryField'
import { AdvancedQueryField } from './components/AdvancedQueryField'
import { ChatWindow } from './components/ChatWindow'
import { PdfViewer } from './components/Viewers/PdfViewer'
import { HtmlViewer } from './components/Viewers/HtmlViewer'
import { MarkdownViewer } from './components/Viewers/MarkdownViewer'
import { SpreadsheetViewer } from './components/Viewers/SpreadsheetViewer'
import { LexioProvider } from './components/LexioProvider'
import { useMessages, useSources, useStatus, useMessageFeedback, useLexioTheme } from './hooks'
import { SourcesDisplay } from './components/SourcesDisplay'
import { ErrorDisplay } from './components/ErrorDisplay'
import { ContentDisplay } from './components/ContentDisplay'

import { defaultTheme, createTheme } from './theme/index.ts'

import { createRESTContentSource } from './connectors/createRESTContentSource'
import { createSSEConnector } from './connectors/createSSEConnector'
import { createRESTConnector } from './connectors/createRESTConnector'


import { MessageWithOptionalId } from './types'
export type { MessageWithOptionalId }

export {

    // Components
    AdvancedQueryField,
    ChatWindow,
    ContentDisplay,
    ErrorDisplay,
    QueryField,
    LexioProvider,
    SourcesDisplay,
    PdfViewer,
    HtmlViewer,
    MarkdownViewer,
    SpreadsheetViewer,

    // Connectors
    createRESTContentSource,
    createSSEConnector,
    createRESTConnector,

    // Hooks
    useMessages,
    useSources,
    useStatus,
    useMessageFeedback,
    useLexioTheme,

    // Theme
    createTheme,
    defaultTheme,
}
export * from './types'
export * from './theme/types'

