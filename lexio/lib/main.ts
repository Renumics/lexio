import './tailwind.css'

import { QueryField } from './components/QueryField'
import { AdvancedQueryField } from './components/AdvancedQueryField'
import { ChatWindow } from './components/ChatWindow'
import { PdfViewer, HtmlViewer, MarkdownViewer } from './components/Viewers/index.ts'
import { RAGProvider, useRAGMessages, useRAGSources, useRAGStatus } from './components/RAGProvider'
import { SourcesDisplay } from './components/SourcesDisplay'
import { ErrorDisplay } from './components/ErrorDisplay'
import { ContentDisplay } from './components/ContentDisplay'

import { useSSERetrieveAndGenerateSource } from './connectors/useSSERetrieveAndGenerateSource'
import { useSSEGenerateSource } from './connectors/useSSEGenerateSource'
import { useRESTGenerateSource } from './connectors/useRestGenerateSource'
import { useRESTRetrieveAndGenerateSource } from './connectors/useRestRetrieveAndGenerateSource'
import { useRestContentSource } from './connectors/useRestContentSource'

import { defaultTheme, createTheme } from './theme/index.ts'

export { QueryField, AdvancedQueryField, ChatWindow,
    PdfViewer, HtmlViewer, MarkdownViewer, RAGProvider, useRAGMessages, useRAGSources, useRAGStatus,
    SourcesDisplay, ErrorDisplay, ContentDisplay, useSSERetrieveAndGenerateSource,
    useSSEGenerateSource, useRESTGenerateSource, useRESTRetrieveAndGenerateSource,
    useRestContentSource, createTheme, defaultTheme }
export * from './types'
export * from './theme/types'

