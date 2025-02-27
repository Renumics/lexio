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

export interface ExplanationResult {
    summary: string;
    finalAnswer: string;
    answerIdeas: string[];
    explanations: Array<{
        answer_idea: string;
        key_phrases: string[];
        supporting_evidence: {
            source_text: string;
            similarity_score: number;
            context: string;
            location: {
                page: number;
                rect?: {
                    top: number;
                    left: number;
                    width: number;
                    height: number;
                };
            };
            overlapping_keywords: string[];
        }[];
        analysis: {
            average_similarity: number;
        };
    }>;
}

export class ExplanationProcessor {
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

            const sentences = splitIntoSentences(response);
            let answerIdeas: string[] = [];

            for (const sentence of sentences) {
                const ideas = config.IDEA_SPLITTING_METHOD === 'heuristic' ? splitIntoIdeasHeuristic(sentence)
                    : config.IDEA_SPLITTING_METHOD === 'dependency' ? splitIntoIdeasDependencyParsing(sentence)
                    : config.IDEA_SPLITTING_METHOD === 'llm' ? await splitIntoIdeasUsingLLM(sentence)
                    : [sentence];
                answerIdeas.push(...ideas);
            }
            console.log('Number of answer ideas:', answerIdeas.length);

            const COLORS = [
                'rgba(255, 99, 132, 0.3)',   // red
                'rgba(54, 162, 235, 0.3)',   // blue
                'rgba(255, 206, 86, 0.3)',   // yellow
                'rgba(75, 192, 192, 0.3)',   // green
                'rgba(153, 102, 255, 0.3)',  // purple
                'rgba(255, 159, 64, 0.3)',   // orange
            ];

            const explanations = await Promise.all(
                answerIdeas.map(async (idea, ideaIndex) => {
                    const keyPhrases = extractKeyPhrases(idea);
                    const ideaEmbedding = await getEmbedding(idea);
                    
                    if (!ideaEmbedding) {
                        console.warn(`No embedding generated for idea: ${idea}`);
                        return {
                            answer_idea: idea,
                            key_phrases: keyPhrases,
                            supporting_evidence: [],
                            analysis: {
                                average_similarity: 0,
                            }
                        };
                    }

                    if (chunkEmbeddings.length === 0) {
                        console.warn('No valid chunk embeddings available');
                        return {
                            answer_idea: idea,
                            key_phrases: keyPhrases,
                            supporting_evidence: [],
                            analysis: {
                                average_similarity: 0,
                            }
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

                    // Add highlight information for the best matching evidence
                    const bestEvidence = topSentences[0]; // Get the best match
                    const highlight = bestEvidence ? {
                        page: 1, // Default to page 1 if not specified
                        rect: {
                            top: 0.1 + (ideaIndex * 0.1), // Stagger highlights vertically
                            left: 0.1,
                            width: 0.8,
                            height: 0.05
                        },
                        color: COLORS[ideaIndex % COLORS.length]
                    } : undefined;

                    return {
                        answer_idea: idea,
                        key_phrases: keyPhrases,
                        supporting_evidence: topSentences.map(match => ({
                            source_text: match.sentence,
                            similarity_score: match.similarity,
                            context: match.originalChunk.text,
                            location: match.metadata,
                            overlapping_keywords: keyPhrases.filter(phrase =>
                                match.sentence.toLowerCase().includes(phrase.toLowerCase())
                            ),
                            highlight // Add highlight information
                        })),
                        analysis: {
                            average_similarity: topSentences.length
                                ? topSentences.reduce((sum, m) => sum + m.similarity, 0) / topSentences.length
                                : 0,
                        },
                        color: COLORS[ideaIndex % COLORS.length] // Add color for the answer idea
                    };
                })
            );

            // Filter out any null results
            const validExplanations = explanations.filter(Boolean);

            return {
                summary: `Processed PDF: ${chunks.length} chunks, embeddings generated for ${chunkEmbeddings.length} chunks, ${answerIdeas.length} answer ideas, and ${validExplanations.length} explanations generated.`,
                finalAnswer: response,
                answerIdeas,
                explanations: validExplanations
            };
        } catch (error) {
            console.error('Error processing explanation:', error);
            throw error;
        }
    }
}

