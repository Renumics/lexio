import './tailwind.css'

import { QueryField } from './components/QueryField'
import { AdvancedQueryField } from './components/AdvancedQueryField'
import { ChatWindow } from './components/ChatWindow'
import { PdfViewer } from './components/Viewers/PdfViewer'
import { LexioProvider } from './components/LexioProvider'
import { useMessages, useSources, useStatus } from './hooks'
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
    PdfViewer,
    QueryField,
    LexioProvider,
    SourcesDisplay,

    // Connectors
    createRESTContentSource,
    createSSEConnector,
    createRESTConnector,

    // Hooks
    useMessages,
    useSources,
    useStatus,

    // Theme
    createTheme,
    defaultTheme,
}
export * from './types'
export * from './theme/types'

