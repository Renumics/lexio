import { useCallback } from 'react';

import type { 
  Message, 
  RetrievalResult 
} from '../types';

/**
 * The options for configuring our retrieveAndGenerate call.
 */
export interface PromiseRetrieveAndGenerateOptions {
  /**
   * The REST endpoint (URL) that returns both sources and a response.
   */
  endpoint: string;

  /**
   * (Optional) HTTP method to use for this request. Defaults to 'POST'.
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  /**
   * A function that builds the request body, only used if method != 'GET'.
   * By default, it simply includes { messages }.
   */
  buildRequestBody?: (messages: Message[]) => any;

  /**
   * A function that parses the server's JSON response into:
   *  {
   *    sources: RetrievalResult[] | Promise<RetrievalResult[]>;
   *    response: string | Promise<string>;
   *  }
   */
  parseResponse: (data: any) => {
    sources: RetrievalResult[] | Promise<RetrievalResult[]>;
    response: string | Promise<string>;
  };
}

/**
 * A React hook returning the retrieveAndGenerate function suitable for <RAGProvider retrieveAndGenerate={...}>.
 */
export function useRESTRetrieveAndGenerateSource(options: PromiseRetrieveAndGenerateOptions) {
  const {
    endpoint,
    method = 'POST',
    buildRequestBody = defaultRetrieveAndGenerateBody,
    parseResponse,
  } = options;

  return useCallback(
    (messages: Message[]) => {
      // Build the request config
      const requestInit: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      // If not GET, build the body
      if (method !== 'GET') {
        const bodyObj = buildRequestBody(messages);
        requestInit.body = JSON.stringify(bodyObj);
      }

      // We'll make ONE fetch call.
      // Then parse the JSON into { sources, response } and return those as two separate Promises
      const fetchPromise = fetch(endpoint, requestInit)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`retrieveAndGenerate failed with status ${res.status}`);
          }
          return res.json();
        })
        .then((json) => parseResponse(json));

      return {
        sources: fetchPromise.then((data) => data.sources),
        response: fetchPromise.then((data) => data.response),
      };
    },
    [endpoint, method, buildRequestBody, parseResponse]
  );
}

/**
 * Default request body for retrieveAndGenerate if none provided:
 *  { messages }
 */
function defaultRetrieveAndGenerateBody(messages: Message[]) {
  return { messages };
}