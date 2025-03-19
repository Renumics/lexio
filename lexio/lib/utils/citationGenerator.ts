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
        const ideas = messageHighlights.map(highlight => ({
            text: highlight.text,
            position: {
                start: highlight.startChar,
                end: highlight.endChar
            },
            color: highlight.color
        }));

        const locations = pdfHighlights.map(highlight => ({
            page: highlight.page,
            position: highlight.rect,
            color: highlight.highlightColorRgba
        }));

        const connections = this.connect(ideas, source, locations);

        return connections.map(connection => ({
            sourceId: connection.sourceId,
            messageHighlight: {
                text: connection.idea.text,
                startChar: connection.idea.position.start,
                endChar: connection.idea.position.end,
                color: connection.idea.color || 'yellow'
            },
            sourceHighlight: {
                page: connection.location.page || 1,
                rect: connection.location.position,
                highlightColorRgba: connection.location.color || 'rgba(255, 255, 0, 0.3)'
            }
        }));
    }
} 