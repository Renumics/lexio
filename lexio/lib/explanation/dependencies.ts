/**
 * Dynamically loads the compromise library.
 * @throws Error if compromise is not installed
 */
export async function loadCompromise() {
  try {
    const compromise = await import('compromise');
    return compromise.default;
  } catch (error) {
    throw new Error(
      'Explainability features require the compromise library. Please install it:\n' +
      'npm install compromise\n' +
      'or\n' +
      'yarn add compromise'
    );
  }
}

/**
 * Dynamically loads the js-tiktoken library.
 * @throws Error if js-tiktoken is not installed
 */
export async function loadTiktoken() {
  try {
    const tiktoken = await import('js-tiktoken');
    return tiktoken;
  } catch (error) {
    throw new Error(
      'Token counting features require the js-tiktoken library. Please install it:\n' +
      'npm install js-tiktoken\n' +
      'or\n' +
      'yarn add js-tiktoken'
    );
  }
}

/**
 * Dynamically loads the sbd (sentence boundary detection) library.
 * @throws Error if sbd is not installed
 */
export async function loadSbd() {
  try {
    const sbd = await import('sbd');
    return sbd.default;
  } catch (error) {
    throw new Error(
      'Sentence boundary detection features require the sbd library. Please install it:\n' +
      'npm install sbd\n' +
      'or\n' +
      'yarn add sbd'
    );
  }
}

/**
 * Handles OpenAI chat completions using direct REST API calls.
 * This is a lighter alternative to the full OpenAI SDK.
 * @throws Error if the API key is not set
 */
export async function loadOpenAIChat() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY is not defined in your environment variables.');
  }

  return {
    async createChatCompletion(messages: Array<{ role: string; content: string }>, options: { model: string; max_tokens?: number; temperature?: number; } = { model: 'gpt-3.5-turbo' }) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: options.model,
          messages,
          max_tokens: options.max_tokens,
          temperature: options.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data || !data.choices || data.choices.length === 0) {
        throw new Error("Invalid response data from OpenAI API");
      }
      return data.choices[0].message?.content || '';
    }
  };
}

/**
 * Handles OpenAI embeddings using direct REST API calls.
 * This is a lighter alternative to the full OpenAI SDK.
 * @throws Error if the API key is not set
 */
export async function loadOpenAIEmbeddings() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY is not defined in your environment variables.');
  }

  return {
    async createEmbedding(input: string) {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "text-embedding-ada-002",
          input,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data || !data.data || data.data.length === 0) {
        throw new Error("Invalid response data from OpenAI API");
      }
      return data.data[0].embedding;
    }
  };
} 