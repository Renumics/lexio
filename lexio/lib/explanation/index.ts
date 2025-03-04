import { parseAndCleanPdf } from './preprocessing';
import { groupSentenceObjectsIntoChunks, splitIntoSentences } from './chunking';
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

export class ExplanationProcessor {
    /**
     * Generates evenly distributed colors based on the number of ideas
     */
    private static generateColors(count: number): string[] {
        return Array.from({ length: count }, (_, i) => {
            const hue = (i * 360) / count;
            return `hsla(${hue}, 70%, 70%, 0.3)`;
        });
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

            // Generate colors for the answer ideas
            const colors = this.generateColors(answerIdeas.length);
            
            // Assign colors to answer ideas
            const coloredAnswerIdeas = answerIdeas.map((idea, index) => ({
                text: idea.idea,
                color: colors[index]
            }));

            const ideaSources = await Promise.all(
                answerIdeas.map(async ({ idea, originalText }, ideaIndex) => {
                    const keyPhrases = extractKeyPhrases(idea);
                    const ideaEmbedding = await getEmbedding(idea);
                    
                    if (!ideaEmbedding) {
                        console.warn(`No embedding generated for idea: ${idea}`);
                        return {
                            answer_idea: idea,
                            color: colors[ideaIndex],
                            supporting_evidence: []
                        };
                    }

                    if (chunkEmbeddings.length === 0) {
                        console.warn('No valid chunk embeddings available');
                        return {
                            answer_idea: idea,
                            color: colors[ideaIndex],
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
                        idea,
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
                        color: colors[ideaIndex],
                        supporting_evidence: topSentences.map(match => {
                            // Find the original chunk that contains this sentence
                            const originalChunk = originalChunks.find(c => c.text === match.originalChunk.text);
                            
                            // Find the matching sentence in the original chunk
                            let matchingSentence = null;
                            if (originalChunk && originalChunk.sentences) {
                                // Try to find an exact match first
                                matchingSentence = originalChunk.sentences.find(s => s.text === match.sentence);
                                
                                // If no exact match, try a fuzzy match (sentence might be slightly different)
                                if (!matchingSentence) {
                                    matchingSentence = originalChunk.sentences.find(s => 
                                        match.sentence.includes(s.text) || s.text.includes(match.sentence)
                                    );
                                }
                            }
                            
                            console.log('Original chunk found:', !!originalChunk);
                            console.log('Matching sentence found:', !!matchingSentence);
                            console.log('Page number:', matchingSentence?.metadata?.page);
                            
                            return {
                                source_sentence: match.sentence,
                                similarity_score: match.similarity,
                                context_chunk: match.originalChunk.text,
                                highlight: {
                                    page: matchingSentence?.metadata?.page || 0,
                                    rect: {
                                        top: 0.1 + (ideaIndex * 0.1),
                                        left: 0.1,
                                        width: 0.8,
                                        height: 0.05
                                    },
                                    color: colors[ideaIndex]
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
                answerIdeas: coloredAnswerIdeas,
                ideaSources: ideaSources.filter(Boolean)
            };
        } catch (error) {
            console.error('Error processing explanation:', error);
            throw error;
        }
    }
}

