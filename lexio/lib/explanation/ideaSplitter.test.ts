import { describe, it, expect, beforeAll } from 'vitest';
import { 
  splitIntoIdeasHeuristic, 
  splitIntoIdeasDependencyParsing,
  splitIntoIdeasUsingLLM 
} from './ideaSplitter';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file before tests
beforeAll(() => {
  config({ path: resolve(__dirname, '../../.env') });
  // Force LLM method
  process.env.IDEA_SPLITTING_METHOD = 'llm';
  // More detailed API key logging
  const envKey = process.env.VITE_OPENAI_API_KEY;
  const viteKey = import.meta.env.VITE_OPENAI_API_KEY;
  console.log('API Key check:');
  console.log('- process.env key length:', envKey?.length);
  console.log('- import.meta.env key length:', viteKey?.length);
});

// ------------------------------------------------------------------
// Test data – Various RAG-style answer patterns
// ------------------------------------------------------------------
const mockRagAnswers = {
  // Complex sentence with multiple conjunctions
  complexSentence: `
    The model processes input through multiple layers, transforms the data using attention mechanisms, and generates output based on learned patterns, while maintaining contextual information throughout the pipeline.
  `,

  // Mixed format with headers and paragraphs
  mixedFormat: `
    ### Architecture Overview

    The transformer architecture consists of encoder and decoder components, where the encoder processes input sequences and the decoder generates output tokens.

    Key Benefits:
    * Parallel processing enables faster training
    * Self-attention captures long-range dependencies
    * Residual connections help with gradient flow

    However, the model requires significant computational resources and careful optimization to achieve optimal performance.
  `,

  // Technical explanation with multiple ideas per sentence
  technicalExplanation: `
    The attention mechanism computes query, key, and value matrices from input embeddings, applies scaled dot-product attention to capture relationships between tokens, and combines the results through multi-head attention blocks to enable parallel processing of different relationship patterns.
  `,

  // A comprehensive example designed to test all splitters
  comprehensiveExample: `
### System Overview

The core engine, a retrieval-augmented generation (RAG) system, processes queries by first finding relevant documents; this step is vital for context. It then synthesizes the retrieved information using a large language model, which generates a coherent response considering factors like complexity, tone, and user intent.

Key features include:
* Scalable document ingestion.
* Real-time query processing.
* Customizable response generation.

The system is designed for high performance and accuracy.
`
};

describe('IdeaSplitter – Comparing All Splitting Methods', () => {
  describe('LLM Integration', () => {
    beforeAll(() => {
      // More detailed environment check
      const envKey = process.env.VITE_OPENAI_API_KEY;
      const viteKey = import.meta.env.VITE_OPENAI_API_KEY;
      console.log('Environment check:');
      console.log('- process.env key exists:', !!envKey);
      console.log('- import.meta.env key exists:', !!viteKey);
    });

    it('verifies OpenAI LLM is working properly', async () => {
      const testText = "The model architecture includes multiple attention heads and uses residual connections for better gradient flow.";
      
      try {
        // Get results from all three methods
        console.log('\n=== Testing All Three Methods ===');
        
        console.log('\nTesting Heuristic Method...');
        const heuristicResult = await splitIntoIdeasHeuristic(testText);
        console.log('Heuristic results:', heuristicResult);
        
        console.log('\nTesting Dependency Parsing Method...');
        const depResult = await splitIntoIdeasDependencyParsing(testText);
        console.log('Dependency parsing results:', depResult);
        
        console.log('\nTesting LLM Method...');
        const llmResult = await splitIntoIdeasUsingLLM(testText);
        console.log('LLM results:', llmResult);

        // Verify results from all methods
        expect(heuristicResult.length).toBeGreaterThan(0);
        expect(depResult.length).toBeGreaterThan(0);
        expect(llmResult.length).toBeGreaterThan(0);

        // Compare results
        console.log('\nResults comparison:');
        console.log('- Heuristic ideas count:', heuristicResult.length);
        console.log('- Dependency parsing ideas count:', depResult.length);
        console.log('- LLM ideas count:', llmResult.length);

      } catch (error) {
        console.error("\nDetailed error information:");
        console.error("- Error name:", error.name);
        console.error("- Error message:", error.message);
        console.error("- Error stack:", error.stack);
        throw error;
      }
    });
  });

  describe('Comprehensive Example Processing', () => {
    it('shows results from all three methods for the comprehensive example', async () => {
      console.log('\n=== Comprehensive Example Splitting Results ===');
      const text = mockRagAnswers.comprehensiveExample;

      // Heuristic method
      const heuristicIdeas = await splitIntoIdeasHeuristic(text);
      console.log('\nHeuristic Method Results:');
      heuristicIdeas.forEach((idea, i) => console.log(`${i + 1}. "${idea}"`));
      
      // Dependency parsing method
      const depParsingIdeas = await splitIntoIdeasDependencyParsing(text);
      console.log('\nDependency Parsing Method Results:');
      depParsingIdeas.forEach((idea, i) => console.log(`${i + 1}. "${idea}"`));
      
      // LLM method
      const llmIdeas = await splitIntoIdeasUsingLLM(text);
      console.log('\nLLM Method Results:');
      llmIdeas.forEach((idea, i) => console.log(`${i + 1}. "${idea}"`));
      
      // Basic validations for each method
      expect(heuristicIdeas.length).toBeGreaterThan(0);
      expect(depParsingIdeas.length).toBeGreaterThan(0);
      expect(llmIdeas.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Sentence Processing', () => {
    it('shows results from all three methods', async () => {
      console.log('\n=== Complex Sentence Splitting Results ===');
      
      // Heuristic method
      const heuristicIdeas = await splitIntoIdeasHeuristic(mockRagAnswers.complexSentence);
      console.log('\nHeuristic Method:');
      heuristicIdeas.forEach((idea, i) => console.log(`${i + 1}. "${idea}"`));
      
      // Dependency parsing method
      const depParsingIdeas = await splitIntoIdeasDependencyParsing(mockRagAnswers.complexSentence);
      console.log('\nDependency Parsing Method:');
      depParsingIdeas.forEach((idea, i) => console.log(`${i + 1}. "${idea}"`));
      
      // LLM method
      const llmIdeas = await splitIntoIdeasUsingLLM(mockRagAnswers.complexSentence);
      console.log('\nLLM Method:');
      llmIdeas.forEach((idea, i) => console.log(`${i + 1}. "${idea}"`));
      
      // Basic validations for each method
      expect(heuristicIdeas.length).toBeGreaterThan(0);
      expect(depParsingIdeas.length).toBeGreaterThan(0);
      expect(llmIdeas.length).toBeGreaterThan(0);
    });
  });

  describe('Mixed Format Processing', () => {
    it('shows results from all three methods', async () => {
      console.log('\n=== Mixed Format Splitting Results ===');
      
      // Heuristic method
      const heuristicIdeas = await splitIntoIdeasHeuristic(mockRagAnswers.mixedFormat);
      console.log('\nHeuristic Method:');
      heuristicIdeas.forEach((idea, i) => console.log(`${i + 1}. "${idea}"`));
      
      // Dependency parsing method
      const depParsingIdeas = await splitIntoIdeasDependencyParsing(mockRagAnswers.mixedFormat);
      console.log('\nDependency Parsing Method:');
      depParsingIdeas.forEach((idea, i) => console.log(`${i + 1}. "${idea}"`));
      
      // LLM method
      const llmIdeas = await splitIntoIdeasUsingLLM(mockRagAnswers.mixedFormat);
      console.log('\nLLM Method:');
      llmIdeas.forEach((idea, i) => console.log(`${i + 1}. "${idea}"`));
      
      // Basic validations for each method
      expect(heuristicIdeas.length).toBeGreaterThan(0);
      expect(depParsingIdeas.length).toBeGreaterThan(0);
      expect(llmIdeas.length).toBeGreaterThan(0);
    });
  });
});