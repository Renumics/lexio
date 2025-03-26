import { parseAndCleanPdf, TextWithMetadata } from './preprocessing';
import { groupSentenceObjectsIntoChunks, splitIntoSentences, Chunk, TextPosition } from './chunking';
import { getEmbedding, generateEmbeddingsForChunks, ProcessedChunk } from './embedding';
import {
    splitIntoIdeasHeuristic,
    splitIntoIdeasDependencyParsing,
    splitIntoIdeasUsingLLM,
} from './ideaSplitter';
import {
    findTopKImproved,
    findTopSentencesGlobally,
    extractKeyPhrases,
    IChunkEmbedding
} from './matching';
import config from './config';

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
            console.log('Cleaned sentences count:', Array.isArray(cleanedSentences) ? cleanedSentences.length : 'unknown');

            const chunks = await groupSentenceObjectsIntoChunks(cleanedSentences, config.MAX_TOKENS);
            console.log('Number of chunks:', chunks.length);

            const rawChunkEmbeddings = await generateEmbeddingsForChunks(chunks);
            
            // Convert ProcessedChunk[] to IChunkEmbedding[]
            const chunkEmbeddings: IChunkEmbedding[] = rawChunkEmbeddings
                .filter((chunk): chunk is ProcessedChunk => chunk !== null && chunk.embedding !== null)
                .map(chunk => ({
                    chunk: chunk.chunk,
                    embedding: chunk.embedding
                }));
            
            console.log('Generated embeddings for chunks:', chunkEmbeddings.length);

            // Store the original chunks for later reference
            const originalChunks = chunks;

            const sentences = splitIntoSentences(response);
            const answerIdeas: Array<{ idea: string, originalText: string }> = [];

            for (const sentence of sentences) {
                const ideas = config.IDEA_SPLITTING_METHOD === 'heuristic' ? splitIntoIdeasHeuristic(sentence)
                    : config.IDEA_SPLITTING_METHOD === 'dependency' ? splitIntoIdeasDependencyParsing(sentence)
                    : config.IDEA_SPLITTING_METHOD === 'llm' ? await splitIntoIdeasUsingLLM(sentence)
                    : [sentence];
                
                // For each idea, find its specific part within the sentence
                ideas.forEach(idea => {
                    // Clean up the idea text for better matching
                    const cleanIdea = idea
                        .replace(/^[-\s.]+|[-\s.]+$/g, '') // Remove leading/trailing dashes, spaces, periods
                        .replace(/^(It|This)\s+/i, ''); // Remove leading "It" or "This"
                    
                    // Create a regex to find the specific part in the sentence
                    const ideaRegex = new RegExp(
                        cleanIdea
                            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
                            .replace(/\s+/g, '\\s+'), // Make whitespace flexible
                        'i'
                    );
                    
                    const match = sentence.match(ideaRegex);
                    const originalText = match ? match[0] : sentence;

                    answerIdeas.push({
                        idea: cleanIdea,
                        originalText
                    });
                });
            }
            console.log('Number of answer ideas:', answerIdeas.length);
            console.log('Answer ideas:', answerIdeas);

            const ideaSources = await Promise.all(
                answerIdeas.map(async ({ idea }) => {
                    const keyPhrases = await extractKeyPhrases(idea);
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

                    const topMatches = await findTopKImproved(
                        ideaEmbedding,
                        chunkEmbeddings,
                        6, // Using default values since config might not have these
                        0.75
                    );

                    const topSentences = await findTopSentencesGlobally(
                        ideaEmbedding,
                        topMatches,
                        {
                            topK: 5,
                            minSimilarity: 0.5,
                            minDistance: 0.05
                        }
                    );

                    return {
                        answer_idea: idea,
                        color: '',
                        supporting_evidence: topSentences.map(match => {
                            // Find the original chunk
                            const originalChunk = originalChunks.find(c => c.text === match.originalChunk.text);
                            
                            let highlight: HighlightPosition | undefined;
                            
                            if (originalChunk) {
                                const positions = this.findSentencePosition(match.sentence, originalChunk);
                                if (positions && positions.length > 0) {
                                    const boundingRect = this.createBoundingRect(positions);
                                    highlight = {
                                        page: originalChunk.page || 0,
                                        rect: boundingRect,
                                        color: ''
                                    };
                                    // console.log(`Created highlight for "${match.sentence.substring(0, 50)}..."`);
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
                                overlapping_keywords: keyPhrases.filter(phrase =>
                                    match.sentence.toLowerCase().includes(phrase.toLowerCase())
                                )
                            };
                        })
                    };
                })
            );

            return {
                summary: `Processed PDF: ${chunks.length} chunks, embeddings generated for ${chunkEmbeddings.length} chunks, ${answerIdeas.length} answer ideas, and ${ideaSources.length} idea sources found.`,
                answer: response,
                answerIdeas: answerIdeas.map((idea) => ({
                    text: idea.idea,
                    color: ''
                })),
                ideaSources: ideaSources.filter(Boolean)
            };
        } catch (error) {
            console.error('Error processing explanation:', error);
            throw error;
        }
    }
}

