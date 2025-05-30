import { parseAndCleanPdf, TextWithMetadata } from './preprocessing';
import { 
    groupSentenceObjectsIntoChunks, 
    groupSentenceObjectsIntoChunksHeuristic,
    Chunk, 
    TextPosition 
} from './chunking';
import { getEmbedding, generateEmbeddingsForChunks, ProcessedChunk } from './embedding';
import {
    splitIntoIdeasHeuristic,
    splitIntoIdeasDependencyParsing,
    splitIntoIdeasUsingLLM,
} from './ideaSplitter';
import {
    findTopKImproved,
    findTopSentencesGlobally,
    IChunkEmbedding
} from './matching_advanced';
import {
    IMatch
} from './matching_heuristic';
import {
    extractKeyPhrasesAsync,
    findTopKHeuristicAsync,
    findTopSentencesGloballyHeuristicAsync,
    terminateWorker
} from './workerWrapper';
import config from './config';

// Debug logging utility
const debugLog = (...args: any[]) => {
    if (config.DEBUG) {
        console.log('[ExplanationProcessor]', ...args);
    }
};

export interface ColoredIdea {
    text: string;
    color: string;
    evidence?: {
        text: string;
        page?: number;
        rect?: {
            top: number;
            left: number;
            width: number;
            height: number;
        };
    };
}

export interface IdeaSource {
    answer_idea: string;
    color: string;
    supporting_evidence: Array<{
        source_sentence: string;
        similarity_score: number;
        context_chunk: string;
        highlight?: {
            color: string;
            page: number;
            rect?: {
                top: number;
                left: number;
                width: number;
                height: number;
            };
        };
        overlapping_keywords: string[];
    }>;
}

export interface ExplanationResult {
    summary: string;
    answer: string;
    answerIdeas: Array<{
        text: string;
        color: string;
    }>;
    ideaSources: Array<{
        answer_idea: string;
        color: string;
        supporting_evidence: Array<{
            source_sentence: string;
            similarity_score: number;
            context_chunk: string;
            highlight: {
                page: number;
                rect: {
                    top: number;
                    left: number;
                    width: number;
                    height: number;
                };
                color: string;
            };
            overlapping_keywords: string[];
        }>;
    }>;
}

export interface HighlightPosition {
    page: number;
    rect: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
    color: string;
}

export class ExplanationProcessor {
    /**
     * Finds the best position for highlighting a sentence within a chunk
     */
    private static findSentencePosition(
        sentence: string,
        chunk: Chunk
    ): TextPosition[] | null {
        const normalizedSearchSentence = sentence.trim().replace(/\s+/g, ' ');
        
        // Find all sentences that belong to this chunk, grouped by page
        const sentencesByPage = chunk.sentences.reduce((acc, s) => {
            const page = s.metadata.page;
            if (!acc[page]) acc[page] = [];
            acc[page].push(s);
            return acc;
        }, {} as Record<number, TextWithMetadata[]>);
        
        // Search within each page's sentences
        for (const [_, pageSentences] of Object.entries(sentencesByPage)) {
            // Try exact match first
            let exactMatch = pageSentences.find(s => {
                const normalizedText = s.text.trim().replace(/\s+/g, ' ');
                return normalizedText === normalizedSearchSentence;
            });
            
            // If no exact match and sentence starts with "The", try without it
            if (!exactMatch && normalizedSearchSentence.startsWith('The ')) {
                const withoutThe = normalizedSearchSentence.slice(4);
                exactMatch = pageSentences.find(s => {
                    const normalizedText = s.text.trim().replace(/\s+/g, ' ');
                    return normalizedText.endsWith(withoutThe) && 
                           normalizedText.startsWith('The');
                });
            }
            
            if (exactMatch?.metadata?.linePositions) {
                return exactMatch.metadata.linePositions;
            }
            
            // If still no match, try finding a sentence that contains our search sentence
            const containingMatch = pageSentences.find(s => {
                const normalizedText = s.text.trim().replace(/\s+/g, ' ');
                return normalizedText.includes(normalizedSearchSentence) &&
                       // Ensure the match is at a word boundary
                       (!normalizedText.startsWith(normalizedSearchSentence) || 
                        normalizedText.length === normalizedSearchSentence.length);
            });
            
            if (containingMatch?.metadata?.linePositions) {
                return containingMatch.metadata.linePositions;
            }
        }
        
        return null;
    }

    /**
     * Creates a bounding rectangle for a set of positions
     */
    private static createBoundingRect(positions: TextPosition[]): TextPosition {
        const top = Math.min(...positions.map(p => p.top));
        const bottom = Math.max(...positions.map(p => p.top + p.height));
        const left = Math.min(...positions.map(p => p.left));
        const right = Math.max(...positions.map(p => p.left + p.width));

        return {
            top,
            left,
            width: right - left,
            height: bottom - top
        };
    }

    static async processResponse(
        response: string,
        sourceData: Uint8Array | File
    ): Promise<ExplanationResult> {
        try {
            const sourceFile = sourceData instanceof File 
                ? sourceData 
                : new File([sourceData], 'document.pdf', { type: 'application/pdf' });

            const cleanedSentences = await parseAndCleanPdf(sourceFile);
            debugLog('Cleaned sentences count:', Array.isArray(cleanedSentences) ? cleanedSentences.length : 'unknown');

            // Use different chunking strategy based on matching method
            const chunks = config.MATCHING_METHOD === 'heuristic'
                ? await groupSentenceObjectsIntoChunksHeuristic(cleanedSentences)
                : await groupSentenceObjectsIntoChunks(cleanedSentences, config.MAX_TOKENS);
            debugLog('Number of chunks:', chunks.length);

            // Store the original chunks for later reference
            const originalChunks = chunks;

            // Generate embeddings only if not using heuristic matching
            let chunkEmbeddings: IChunkEmbedding[] = [];
            if (config.MATCHING_METHOD !== 'heuristic') {
                const rawChunkEmbeddings = await generateEmbeddingsForChunks(chunks);
                chunkEmbeddings = rawChunkEmbeddings
                    .filter((chunk): chunk is ProcessedChunk => chunk !== null && chunk.embedding !== null)
                    .map(chunk => ({
                        chunk: chunk.chunk,
                        embedding: chunk.embedding
                    }));
                debugLog('Generated embeddings for chunks:', chunkEmbeddings.length);
            }

            const answerIdeas: Array<{ idea: string }> = [];

            // Use the appropriate idea splitting method directly on the full response
            let allIdeas: string[] = [];
            if (config.IDEA_SPLITTING_METHOD === 'heuristic') {
                allIdeas = await splitIntoIdeasHeuristic(response);
            } else if (config.IDEA_SPLITTING_METHOD === 'dependency') {
                allIdeas = await splitIntoIdeasDependencyParsing(response);
            } else if (config.IDEA_SPLITTING_METHOD === 'llm') {
                allIdeas = await splitIntoIdeasUsingLLM(response);
            }
            
            // Add all extracted ideas directly to answerIdeas without extra filtering or cleaning
            answerIdeas.push(...allIdeas.map(idea => ({ idea })));
            
            debugLog('Number of answer ideas:', answerIdeas.length);
            debugLog('Answer ideas:', answerIdeas);

            const ideaSources = await Promise.all(
                answerIdeas.map(async ({ idea }) => {
                    debugLog(`Processing idea: "${idea}"`);
                    const startTime = performance.now();
                    
                    const keyPhrases = await extractKeyPhrasesAsync(idea);
                    debugLog(`Found ${keyPhrases.length} key phrases`);
                    
                    let topMatches: IMatch[];
                    let topSentences;

                    if (config.MATCHING_METHOD === 'heuristic') {
                        debugLog('Using heuristic matching with web worker');
                        // Use heuristic matching with web worker
                        topMatches = await findTopKHeuristicAsync(
                            idea,
                            chunks
                        );

                        // Add debug logging for top matches
                        debugLog(`Found ${topMatches.length} potential chunk matches`);
                        topMatches.slice(0, 3).forEach((match, idx) => {
                            debugLog(`Match ${idx+1} (score: ${match.similarity.toFixed(3)}): "${match.chunk?.text}"`);
                        });

                        topSentences = await findTopSentencesGloballyHeuristicAsync(
                            idea,
                            topMatches
                        );

                        const duration = performance.now() - startTime;
                        debugLog(`Completed processing idea in ${duration.toFixed(2)}ms`);

                        // Add debug logging for all sentences found
                        debugLog(`Found ${topSentences.length} sentence matches`);
                        topSentences.forEach((match, idx) => {
                            debugLog(`Sentence ${idx+1} (score: ${match.similarity.toFixed(3)}): "${match.sentence}"`);
                            debugLog(`Overlapping keywords: ${match.metadata?.overlappingKeywords?.join(', ') || 'none'}`);
                        });
                    } else {
                        // Use embedding-based matching
                        const ideaEmbedding = await getEmbedding(idea);
                        
                        if (!ideaEmbedding) {
                            console.warn(`No embedding generated for idea: ${idea}`);
                            return {
                                answer_idea: idea,
                                color: '',
                                supporting_evidence: []
                            };
                        }

                        if (chunkEmbeddings.length === 0) {
                            console.warn('No valid chunk embeddings available');
                            return {
                                answer_idea: idea,
                                color: '',
                                supporting_evidence: []
                            };
                        }

                        topMatches = await findTopKImproved(
                            ideaEmbedding,
                            chunkEmbeddings,
                            6,
                            0.75
                        );

                        topSentences = await findTopSentencesGlobally(
                            ideaEmbedding,
                            topMatches,
                            {
                                topK: 5,
                                minSimilarity: 0.5,
                                minDistance: 0.05
                            }
                        );
                    }

                    return {
                        answer_idea: idea,
                        color: '',
                        supporting_evidence: topSentences
                            .sort((a, b) => b.similarity - a.similarity) // Sort by similarity score descending
                            .map((match, index) => {
                                // Find the original chunk
                                const originalChunk = originalChunks.find(c => c.text === match.originalChunk.text);
                                
                                // Calculate matched keywords once
                                const matchedKeywords = keyPhrases.filter(phrase => {
                                    const phraseWords = phrase.toLowerCase().split(/\s+/);
                                    const sentenceWords = match.sentence.toLowerCase().split(/\s+/);
                                    return phraseWords.every(word => 
                                        sentenceWords.some((sWord: string) => 
                                            sWord.includes(word) || word.includes(sWord)
                                        )
                                    );
                                });

                                // Debug logging for match quality
                                if (index === 0) { // Only log for the best match
                                    debugLog(`Match details for idea: "${idea}"`);
                                    debugLog(`Best matching sentence: "${match.sentence}"`);
                                    debugLog(`Confidence score: ${match.similarity.toFixed(3)}`);
                                    debugLog('Overlapping keywords:', matchedKeywords);
                                }
                                
                                let highlight: HighlightPosition | undefined;
                                
                                // Only create highlight for the best match
                                if (index === 0 && originalChunk) {
                                    // Find the best chunk match for this sentence
                                    const bestChunkMatch = topMatches[0];
                                    
                                    debugLog(`\nHighlight decision for idea: "${idea}"`);
                                    debugLog(`Best chunk score: ${bestChunkMatch?.similarity.toFixed(3)}`);
                                    debugLog(`Best sentence score: ${match.similarity.toFixed(3)}`);
                                    
                                    // If the best chunk has a higher score than the best sentence,
                                    // use the entire chunk for highlighting
                                    if (bestChunkMatch && bestChunkMatch.similarity > match.similarity && bestChunkMatch.chunk) {
                                        // Calculate the percentage difference
                                        const percentageDifference = ((bestChunkMatch.similarity - match.similarity) / match.similarity) * 100;
                                        debugLog(`Score difference: ${percentageDifference.toFixed(1)}%`);
                                        
                                        // Require higher difference for longer chunks
                                        const chunkLength = bestChunkMatch.chunk.text.length;
                                        const sentenceLength = match.sentence.length;
                                        const lengthRatio = chunkLength / sentenceLength;
                                        
                                        // Required difference scales with length ratio
                                        const requiredDifference = Math.min(
                                            20 + Math.floor(lengthRatio * 5), // Base 20% + 5% per length ratio
                                            40 // Cap at 40%
                                        );
                                        
                                        // Check if chunk has more relevant technical terms
                                        const chunkKeywords = bestChunkMatch.metadata?.overlappingKeywords || [];
                                        const sentenceKeywords = match.metadata?.overlappingKeywords || [];
                                        const hasMoreTechnicalTerms = chunkKeywords.length > sentenceKeywords.length + 1;
                                        
                                        // Only use chunk if score difference exceeds required threshold
                                        // AND either the chunk isn't too long OR it has significantly more technical terms
                                        if (percentageDifference >= requiredDifference && 
                                            (lengthRatio < 4 || hasMoreTechnicalTerms)) {
                                            debugLog(`Decision: Using entire chunk because score is ${percentageDifference.toFixed(1)}% higher and length ratio is ${lengthRatio.toFixed(1)}`);
                                            debugLog(`Chunk keywords: ${chunkKeywords.join(', ')}`);
                                            debugLog(`Sentence keywords: ${sentenceKeywords.join(', ')}`);
                                            
                                            // Find the original chunk that matches the best chunk
                                            const bestOriginalChunk = originalChunks.find(c => c.text === bestChunkMatch.chunk?.text);
                                            
                                            if (bestOriginalChunk) {
                                                // Get all positions from the chunk's sentences
                                                const allPositions = bestOriginalChunk.sentences
                                                    .map(s => s.metadata?.linePositions)
                                                    .filter((pos): pos is TextPosition[] => Array.isArray(pos))
                                                    .flat();
                                                    
                                                if (allPositions.length > 0) {
                                                    const boundingRect = this.createBoundingRect(allPositions);
                                                    highlight = {
                                                        page: bestOriginalChunk.page || 0,
                                                        rect: boundingRect,
                                                        color: ''
                                                    };
                                                    // Update the source sentence to use the entire chunk
                                                    match.sentence = bestChunkMatch.chunk.text;
                                                    debugLog('Successfully created highlight for entire chunk');
                                                    debugLog(`Using chunk from page ${bestOriginalChunk.page}`);
                                                } else {
                                                    debugLog('Warning: Could not find positions for chunk highlighting');
                                                }
                                            } else {
                                                debugLog('Warning: Could not find original chunk matching the best chunk match');
                                            }
                                        } else {
                                            debugLog('Decision: Using single sentence because chunk score is not 10% higher');
                                            debugLog(`Sentence text: "${match.sentence}"`);
                                            
                                            // Use original sentence-based highlighting
                                            const positions = this.findSentencePosition(match.sentence, originalChunk);
                                            if (positions && positions.length > 0) {
                                                const boundingRect = this.createBoundingRect(positions);
                                                highlight = {
                                                    page: originalChunk.page || 0,
                                                    rect: boundingRect,
                                                    color: ''
                                                };
                                                debugLog('Successfully created highlight for sentence');
                                                debugLog(`Using sentence from page ${originalChunk.page}`);
                                            } else {
                                                debugLog('Warning: Could not find positions for sentence highlighting');
                                            }
                                        }
                                    } else {
                                        debugLog('Decision: Using single sentence for highlighting because sentence score is higher or equal');
                                        debugLog(`Sentence text: "${match.sentence}"`);
                                        
                                        // Use original sentence-based highlighting
                                        const positions = this.findSentencePosition(match.sentence, originalChunk);
                                        if (positions && positions.length > 0) {
                                            const boundingRect = this.createBoundingRect(positions);
                                            highlight = {
                                                page: originalChunk.page || 0,
                                                rect: boundingRect,
                                                color: ''
                                            };
                                            debugLog('Successfully created highlight for sentence');
                                            debugLog(`Using sentence from page ${originalChunk.page}`);
                                        } else {
                                            debugLog('Warning: Could not find positions for sentence highlighting');
                                        }
                                    }
                                }

                                return {
                                    source_sentence: match.sentence,
                                    similarity_score: match.similarity,
                                    context_chunk: match.originalChunk.text,
                                    highlight: highlight || {
                                        page: 0,
                                        rect: { top: 0, left: 0, width: 0, height: 0 },
                                        color: ''
                                    },
                                    overlapping_keywords: matchedKeywords
                                };
                            })
                    };
                })
            );

            debugLog('==========================================\n');

            debugLog('\n=== Best Matches ===');
            ideaSources.forEach(source => {
                const bestEvidence = source.supporting_evidence[0];
                if (bestEvidence) {
                    debugLog(`idea: "${source.answer_idea}" -> source: "${bestEvidence.source_sentence}"`);
                }
            });
            debugLog('==========================================\n');

            // Clean up worker
            terminateWorker();

            return {
                summary: `Processed PDF: ${chunks.length} chunks, ${config.MATCHING_METHOD === 'heuristic' ? 'using heuristic matching' : `embeddings generated for ${chunkEmbeddings.length} chunks`}, ${answerIdeas.length} answer ideas, and ${ideaSources.length} idea sources found.`,
                answer: response,
                answerIdeas: answerIdeas.map((idea) => ({
                    text: idea.idea,
                    color: ''
                })),
                ideaSources: ideaSources.filter(Boolean)
            };
        } catch (error) {
            // Clean up worker in case of error
            terminateWorker();
            console.error('Error processing explanation:', error);
            throw error;
        }
    }
}



