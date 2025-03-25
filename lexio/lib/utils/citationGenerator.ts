import { Citation, MessageHighlight, PDFHighlight, Source } from '../types';

/**
 * Represents a highlighted idea in any content
 */
export interface Idea {
    text: string;
    position: {
        start: number;
        end: number;
    };
    color?: string;
}

/**
 * Represents a location in a source where an idea came from
 */
export interface SourceLocation {
    page?: number;
    position: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
    color?: string;
}

/**
 * Connects an idea with its source
 */
export interface IdeaSource<TIdea extends Idea = Idea, TLocation extends SourceLocation = SourceLocation> {
    sourceId: string;
    idea: TIdea;
    location: TLocation;
}

/**
 * Utility class for connecting ideas with their sources
 */
export class CitationGenerator {
    /**
     * Creates connections between ideas and their sources
     */
    static connect<TIdea extends Idea, TLocation extends SourceLocation>(
        ideas: TIdea[],
        source: { id: string },
        locations: TLocation[]
    ): IdeaSource<TIdea, TLocation>[] {
        if (!ideas?.length || !locations?.length) {
            return [];
        }

        return ideas.map((idea, index) => {
            const location = locations[index];
            if (!location) return null;

            return {
                sourceId: source.id.toString(),
                idea,
                location
            };
        }).filter((connection): connection is IdeaSource<TIdea, TLocation> => connection !== null);
    }

    /**
     * Creates Lexio citations from ideas and their sources
     */
    static createLexioCitations(
        messageHighlights: MessageHighlight[],
        source: Source,
        pdfHighlights: PDFHighlight[]
    ): Citation[] {
        // Convert message highlights to ideas
        const ideas = messageHighlights.map(highlight => {
            if (highlight.text) {
                return {
                    text: highlight.text,
                    position: {
                        start: 0, // These will be ignored since we're using text
                        end: 0
                    },
                    color: highlight.color
                };
            } else if (highlight.startChar !== undefined && highlight.endChar !== undefined) {
                return {
                    text: '', // This will be ignored since we're using startChar/endChar
                    position: {
                        start: highlight.startChar,
                        end: highlight.endChar
                    },
                    color: highlight.color
                };
            }
            // If neither text nor startChar/endChar are provided, use empty values
            return {
                text: '',
                position: {
                    start: 0,
                    end: 0
                },
                color: highlight.color
            };
        });

        const locations = pdfHighlights.map(highlight => ({
            page: highlight.page,
            position: highlight.rect,
            color: highlight.highlightColorRgba
        }));

        const connections = this.connect(ideas, source, locations);

        return connections.map(connection => ({
            sourceId: connection.sourceId,
            messageHighlight: {
                color: connection.idea.color || 'yellow',
                ...(connection.idea.position.start === 0 && connection.idea.position.end === 0
                    ? { text: connection.idea.text }
                    : { startChar: connection.idea.position.start, endChar: connection.idea.position.end }
                )
            },
            sourceHighlight: {
                page: connection.location.page || 1,
                rect: connection.location.position,
                highlightColorRgba: connection.location.color || 'rgba(255, 255, 0, 0.3)'
            }
        }));
    }
} 