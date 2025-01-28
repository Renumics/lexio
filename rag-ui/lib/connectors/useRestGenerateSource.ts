import { useCallback } from "react";
import { Message } from "../types";

import { RetrievalResult } from "../types";

/**
 * The options for configuring our generate call.
 */
export interface PromiseGenerateOptions {
    /**
     * The REST endpoint (URL) that returns a single response string.
     */
    endpoint: string;
  
    /**
     * (Optional) HTTP method to use for this request. Defaults to 'POST'.
     */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  
    /**
     * A function that builds the request body, only used if method != 'GET'.
     * By default, it includes { messages, sources }.
     */
    buildRequestBody?: (messages: Message[], sources: RetrievalResult[]) => any;
  
    /**
     * A function that parses the server's JSON response into a string (the chat response).
     */
    parseResponse: (data: any) => string | Promise<string>;
  }
  
  /**
   * A React hook returning the generate function suitable for <RAGProvider generate={...}>.
   */
  export function useRESTGenerateSource(options: PromiseGenerateOptions) {
    const {
      endpoint,
      method = 'POST',
      buildRequestBody = defaultGenerateBody,
      parseResponse,
    } = options;
  
    return useCallback(
      (messages: Message[], sources: RetrievalResult[]) => {
        // Build the request config
        const requestInit: RequestInit = {
          method,
          headers: { 'Content-Type': 'application/json' },
        };
  
        // If not GET, build the body
        if (method !== 'GET') {
          const bodyObj = buildRequestBody(messages, sources);
          requestInit.body = JSON.stringify(bodyObj);
        }
  
        // Return a Promise<string> (the chat response)
        return fetch(endpoint, requestInit)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`generate failed with status ${res.status}`);
            }
            return res.json();
          })
          .then((json) => parseResponse(json));
      },
      [endpoint, method, buildRequestBody, parseResponse]
    );
  }
  
  /**
   * Default request body for generate if none provided:
   *  { messages, sources }
   */
  function defaultGenerateBody(messages: Message[], sources: RetrievalResult[]) {
    return { messages, sources };
  }
  