import * as Comlink from 'comlink';
import type { WorkerAPI } from './worker';
import { Chunk } from './chunking';
import { IMatch } from './heuristic-matching';
import config from './config';

// Debug logging utility
const debugLog = (...args: any[]) => {
    if (config.DEBUG) {
        console.log('[WorkerWrapper]', ...args);
    }
};

let workerInstance: Worker | null = null;
let workerAPI: Comlink.Remote<WorkerAPI> | null = null;
let operationCount = 0;
let operationTimes: Record<string, { count: number, totalTime: number }> = {
    extractKeyPhrases: { count: 0, totalTime: 0 },
    findTopKHeuristic: { count: 0, totalTime: 0 },
    findTopSentencesGloballyHeuristic: { count: 0, totalTime: 0 }
};

export const initWorker = () => {
    if (!workerInstance) {
        debugLog('Initializing new worker');
        workerInstance = new Worker(new URL('./worker.ts', import.meta.url), {
            type: 'module'
        });
        workerAPI = Comlink.wrap<WorkerAPI>(workerInstance);
        debugLog('Worker initialized');
    }
    return workerAPI;
};

export const terminateWorker = () => {
    if (workerInstance) {
        debugLog(`Terminating worker after ${operationCount} total operations`);
        debugLog('Operation statistics:');
        Object.entries(operationTimes).forEach(([op, stats]) => {
            if (stats.count > 0) {
                const avgTime = (stats.totalTime / stats.count).toFixed(2);
                debugLog(`- ${op}: ${stats.count} calls, avg ${avgTime}ms per call`);
            }
        });
        workerInstance.terminate();
        workerInstance = null;
        workerAPI = null;
        operationCount = 0;
        operationTimes = {
            extractKeyPhrases: { count: 0, totalTime: 0 },
            findTopKHeuristic: { count: 0, totalTime: 0 },
            findTopSentencesGloballyHeuristic: { count: 0, totalTime: 0 }
        };
        debugLog('Worker terminated and stats reset');
    }
};

const trackOperation = (operation: string, startTime: number) => {
    const duration = performance.now() - startTime;
    operationCount++;
    operationTimes[operation].count++;
    operationTimes[operation].totalTime += duration;
    return duration;
};

// Wrapper functions for worker operations
export const extractKeyPhrasesAsync = async (text: string): Promise<string[]> => {
    const startTime = performance.now();
    debugLog(`Operation ${operationCount + 1}: Starting extractKeyPhrases`);
    
    const worker = initWorker();
    if (!worker) throw new Error('Worker initialization failed');
    
    try {
        const result = await worker.extractKeyPhrases(text);
        const duration = trackOperation('extractKeyPhrases', startTime);
        debugLog(`Operation ${operationCount}: Completed extractKeyPhrases in ${duration.toFixed(2)}ms`);
        return result;
    } catch (error) {
        debugLog('Error in extractKeyPhrases:', error);
        throw error;
    }
};

export const findTopKHeuristicAsync = async (idea: string, chunks: Chunk[]): Promise<IMatch[]> => {
    const startTime = performance.now();
    debugLog(`Operation ${operationCount + 1}: Starting findTopKHeuristic with ${chunks.length} chunks`);
    
    const worker = initWorker();
    if (!worker) throw new Error('Worker initialization failed');
    
    try {
        const result = await worker.findTopKHeuristic(idea, chunks);
        const duration = trackOperation('findTopKHeuristic', startTime);
        debugLog(`Operation ${operationCount}: Completed findTopKHeuristic in ${duration.toFixed(2)}ms`);
        return result;
    } catch (error) {
        debugLog('Error in findTopKHeuristic:', error);
        throw error;
    }
};

export const findTopSentencesGloballyHeuristicAsync = async (idea: string, matches: IMatch[]): Promise<any[]> => {
    const startTime = performance.now();
    debugLog(`Operation ${operationCount + 1}: Starting findTopSentencesGloballyHeuristic with ${matches.length} matches`);
    
    const worker = initWorker();
    if (!worker) throw new Error('Worker initialization failed');
    
    try {
        const result = await worker.findTopSentencesGloballyHeuristic(idea, matches);
        const duration = trackOperation('findTopSentencesGloballyHeuristic', startTime);
        debugLog(`Operation ${operationCount}: Completed findTopSentencesGloballyHeuristic in ${duration.toFixed(2)}ms`);
        return result;
    } catch (error) {
        debugLog('Error in findTopSentencesGloballyHeuristic:', error);
        throw error;
    }
}; 