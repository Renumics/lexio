import { useCallback } from 'react';
import type { Message, Source, ActionHandlerResponse } from '../types';

export interface RESTConnectorOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  /**
   * parseResponse() interprets the REST response data.
   * Return { content?, sources? } as needed.
   */
  parseResponse(data: any): { 
    content?: string;
    sources?: Source[];
  };

  /**
   * Optional method to build the request body (when method != 'GET').
   * By default: { messages, metadata }
   */
  buildRequestBody?: (messages: Message[], sources: Source[], metadata?: Record<string, any>) => any;

  /**
   * Optional headers to include in the request
   */
  headers?: Record<string, string>;
}

export function createRESTConnector(options: RESTConnectorOptions) {
  const {
    endpoint,
    method = 'POST',
    parseResponse,
    buildRequestBody = (messages, sources, metadata) => ({ messages, sources, metadata }),
    headers: customHeaders = {},
  } = options;

  return useCallback(
    (messages: Message[], sources: Source[], metadata?: Record<string, any>): Promise<ActionHandlerResponse> => {
      const requestInit: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...customHeaders,
        },
      };

      if (method !== 'GET') {
        requestInit.body = JSON.stringify(buildRequestBody(messages, sources, metadata));
      }

      return fetch(endpoint, requestInit)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          const parsed = parseResponse(data);
          
          return {
            // If content exists, return it as a Promise<string>
            ...(parsed.content && { response: Promise.resolve(parsed.content) }),
            
            // If sources exist, normalize them with UUIDs and return as Promise<Source[]>
            ...(parsed.sources && {
              sources: Promise.resolve(
                parsed.sources.map(s => ({
                  ...s,
                  id: s.id ?? crypto.randomUUID(),
                }))
              )
            }),
          };
        });
    },
    [endpoint, method, parseResponse, buildRequestBody, customHeaders]
  );
}

// Example usage:
/*
const restConnector = createRESTConnector({
  endpoint: 'https://api.example.com/chat',
  parseResponse: (data) => ({
    content: data.answer,
    sources: data.references,
  }),
});

// In your component:
const handleAction = async (action) => {
  if (action.type === 'ADD_USER_MESSAGE') {
    return restConnector(messages, sources, { someMetadata: 'value' });
  }
};
*/
