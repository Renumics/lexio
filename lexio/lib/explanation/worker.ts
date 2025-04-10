import * as Comlink from 'comlink';
import {
    calculateHeuristicSimilarity,
    findTopKHeuristic,
    findTopSentencesGloballyHeuristic,
    IMatch,
    IChunk
} from './heuristic-matching';
import { Chunk } from './chunking';

// Debug logging utility
const workerLog = (...args: any[]) => {
    console.log('[Worker]', ...args);
};

// Worker API interface
export interface WorkerAPI {
    extractKeyPhrases: (text: string) => Promise<string[]>;
    findTopKHeuristic: (idea: string, chunks: Chunk[]) => Promise<IMatch[]>;
    findTopSentencesGloballyHeuristic: (idea: string, matches: IMatch[]) => Promise<any[]>;
}

// Worker implementation
const worker: WorkerAPI = {
    async extractKeyPhrases(text: string) {
        workerLog('Starting extractKeyPhrases operation');
        const startTime = performance.now();
        const { overlappingKeywords } = calculateHeuristicSimilarity(text, text);
        const duration = performance.now() - startTime;
        workerLog(`Completed extractKeyPhrases in ${duration.toFixed(2)}ms`);
        return overlappingKeywords;
    },

    async findTopKHeuristic(idea: string, chunks: Chunk[]) {
        workerLog('Starting findTopKHeuristic operation');
        workerLog(`Processing ${chunks.length} chunks`);
        const startTime = performance.now();
        const results = findTopKHeuristic(idea, chunks);
        const duration = performance.now() - startTime;
        workerLog(`Completed findTopKHeuristic in ${duration.toFixed(2)}ms`);
        workerLog(`Found ${results.length} matches with scores: ${results.slice(0, 3).map(r => r.similarity.toFixed(3)).join(', ')}...`);
        return results;
    },

    async findTopSentencesGloballyHeuristic(idea: string, matches: IMatch[]) {
        workerLog('Starting findTopSentencesGloballyHeuristic operation');
        workerLog(`Processing ${matches.length} matches for idea: "${idea.slice(0, 50)}..."`);
        const startTime = performance.now();
        try {
            const results = findTopSentencesGloballyHeuristic(idea, matches);
            const duration = performance.now() - startTime;
            workerLog(`Completed findTopSentencesGloballyHeuristic in ${duration.toFixed(2)}ms`);
            workerLog(`Found ${results.length} sentence matches`);
            if (results.length > 0) {
                workerLog(`Top sentence score: ${results[0].similarity.toFixed(3)}`);
            }
            return results;
        } catch (error) {
            workerLog('Error in findTopSentencesGloballyHeuristic:', error);
            throw error;
        }
    }
};

workerLog('Worker initialized');

// Expose the worker API using Comlink
Comlink.expose(worker); 