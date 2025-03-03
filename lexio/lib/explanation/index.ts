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
        original_text: string;
        key_phrases: string[];
        supporting_evidence: {
            source_text: string;
            similarity_score: number;
            context: string;
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
        }[];
        analysis: {
            average_similarity: number;
        };
        color: string;
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

            // Generate colors based on number of ideas
            const colors = this.generateColors(answerIdeas.length);

            const explanations = await Promise.all(
                answerIdeas.map(async ({ idea, originalText }, ideaIndex) => {
                    const keyPhrases = extractKeyPhrases(idea);
                    const ideaEmbedding = await getEmbedding(idea);
                    
                    if (!ideaEmbedding) {
                        console.warn(`No embedding generated for idea: ${idea}`);
                        return {
                            answer_idea: idea,
                            original_text: originalText,
                            key_phrases: keyPhrases,
                            supporting_evidence: [],
                            analysis: {
                                average_similarity: 0,
                            },
                            color: colors[ideaIndex]
                        };
                    }

                    if (chunkEmbeddings.length === 0) {
                        console.warn('No valid chunk embeddings available');
                        return {
                            answer_idea: idea,
                            original_text: originalText,
                            key_phrases: keyPhrases,
                            supporting_evidence: [],
                            analysis: {
                                average_similarity: 0,
                            },
                            color: colors[ideaIndex]
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

                    // todo: fix this mechanism.
                    // Add highlight information for the best matching evidence
                    const bestEvidence = topSentences[0]; // Get the best match
                    const highlight = bestEvidence ? {
                        page: bestEvidence.metadata.page,
                        rect: {
                            top: 0.1 + (ideaIndex * 0.1),
                            left: 0.1,
                            width: 0.8,
                            height: 0.05
                        },
                        color: colors[ideaIndex]
                    } : undefined;

                    return {
                        answer_idea: idea,
                        original_text: originalText,
                        key_phrases: keyPhrases,
                        supporting_evidence: topSentences.map(match => ({
                            source_text: match.sentence,
                            similarity_score: match.similarity,
                            context: match.originalChunk.text,
                            location: match.metadata,
                            overlapping_keywords: keyPhrases.filter(phrase =>
                                match.sentence.toLowerCase().includes(phrase.toLowerCase())
                            ),
                            highlight
                        })),
                        analysis: {
                            average_similarity: topSentences.length
                                ? topSentences.reduce((sum, m) => sum + m.similarity, 0) / topSentences.length
                                : 0,
                        },
                        color: colors[ideaIndex] // Add color for the answer idea
                    };
                })
            );

            // Filter out any null results
            const validExplanations = explanations.filter(Boolean);

            return {
                summary: `Processed PDF: ${chunks.length} chunks, embeddings generated for ${chunkEmbeddings.length} chunks, ${answerIdeas.length} answer ideas, and ${validExplanations.length} explanations generated.`,
                finalAnswer: response,
                answerIdeas: answerIdeas.map(a => a.idea),
                explanations: validExplanations
            };
        } catch (error) {
            console.error('Error processing explanation:', error);
            throw error;
        }
    }
}

