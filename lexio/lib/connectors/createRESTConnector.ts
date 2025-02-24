import { useCallback } from 'react';
import type { Message, Source } from '../types';

export interface RESTConnectorOptions<TData = any> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  /**
   * parseResponse interprets the REST response data.
   * Return `{ content?: string, sources?: Source[] }`.
   */
  parseResponse(data: TData): {
    content?: string;
    sources?: Source[];
  };

  /**
   * Function to build the request body (when method != 'GET').
   * Default: `{ messages, sources, metadata }`.
   */
  buildRequestBody?: (
    messages: Omit<Message, 'id'>[],
    sources: Source[],
    metadata?: Record<string, any>
  ) => any;

  /**
   * Optional headers to include in the request.
   */
  headers?: Record<string, string>;

  /**
   * The default mode (if not specified per request).
   * 'text' | 'sources' | 'both'
   */
  defaultMode?: 'text' | 'sources' | 'both';
}

/**
 * You can call the connector either with the old signature:
 *    (messages, sources, metadata?)
 * or by passing a request object:
 *    { messages, sources, metadata, mode? }
 */
export interface RESTConnectorRequest {
  messages: Omit<Message, 'id'>[];
  sources: Source[];
  metadata?: Record<string, any>;
  mode?: 'text' | 'sources' | 'both';
}

/**
 * Returns a function that executes a REST call and returns
 * an object shaped depending on the mode:
 *
 * - 'text' => { response: Promise<string> }
 * - 'sources' => { sources: Promise<Source[]> }
 * - 'both' => { response: Promise<string>, sources: Promise<Source[]> }
 */
export function createRESTConnector(options: RESTConnectorOptions) {
  const {
    endpoint,
    method = 'POST',
    parseResponse,
    buildRequestBody = (messages, sources, metadata) => ({ messages, sources, metadata }),
    headers: customHeaders = {},
    defaultMode = 'both',
  } = options;

  return useCallback(
    (
      messagesOrRequest: Omit<Message, 'id'>[] | RESTConnectorRequest,
      sources?: Source[],
      metadata?: Record<string, any>
    ) => {
      // 1) Normalize input
      let request: RESTConnectorRequest;
      if (Array.isArray(messagesOrRequest)) {
        // Old signature: (messages, sources, metadata?)
        request = {
          messages: messagesOrRequest,
          sources: sources ?? [],
          metadata,
        };
      } else {
        // Request object form
        request = messagesOrRequest;
      }

      const {
        messages,
        sources: reqSources,
        metadata: reqMetadata,
        mode: requestMode,
      } = request;

      const mode = requestMode || defaultMode;

      // 2) Construct fetch options
      const requestInit: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...customHeaders,
        },
      };

      if (method !== 'GET') {
        requestInit.body = JSON.stringify(
          buildRequestBody(messages, reqSources, reqMetadata)
        );
      }

      // 3) Perform fetch
      return fetch(endpoint, requestInit)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // 4) Parse the server response
          const parsed = parseResponse(data);

          // Safely handle missing fields
          const content = parsed.content ?? '';
          const sources = parsed.sources ?? [];

          // 5) Shape the return based on mode
          if (mode === 'text') {
            // Only text
            return { response: Promise.resolve(content) };
          } else if (mode === 'sources') {
            // Only sources
            return { sources: Promise.resolve(sources) };
          } else {
            // 'both'
            return {
              response: Promise.resolve(content),
              sources: Promise.resolve(sources),
            };
          }
        });
    },
    [endpoint, method, parseResponse, buildRequestBody, customHeaders, defaultMode]
  );
}
