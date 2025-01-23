import { useState, useContext } from "react";
import { RetrievalResult, SourceReference } from "../../types";
import { useRAGSources } from "../RAGProvider/hooks";
import { ThemeContext, removeUndefined } from "../../theme/ThemeContext";

export interface SourcesDisplayStyles extends React.CSSProperties {
  backgroundColor?: string;
  color?: string;
  padding?: string;
  fontFamily?: string;
  borderRadius?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputFocusRingColor?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;
  activeSourceBackground?: string;
  activeSourceBorderColor?: string;
  selectedSourceBackground?: string;
  selectedSourceBorderColor?: string;
  inactiveSourceBackground?: string;
  inactiveSourceBorderColor?: string;
  metadataTagBackground?: string;
  metadataTagColor?: string;
  relevanceScoreColor?: string;
  sourceTypeBackground?: string;
  sourceTypeColor?: string;
}

/**
 * Props for the SourcesDisplay component
 * @see {@link SourcesDisplay}
 */
interface SourcesDisplayProps {
  /**
   * Custom title for the sources section
   * @default "Retrieved Sources"
   */
  title?: string;
  /**
   * Custom placeholder for the search input
   * @default "Search sources..."
   */
  searchPlaceholder?: string;
  /**
   * Whether to show the search functionality
   * @default true
   */
  showSearch?: boolean;
  /**
   * Whether to show relevance scores for each source
   * @default true
   */
  showRelevanceScore?: boolean;
  /**
   * Whether to show metadata tags for each source
   * @default true
   */
  showMetadata?: boolean;
  /**
   * Style overrides for the component
   */
  styleOverrides?: SourcesDisplayStyles;
}

const SourcesDisplay: React.FC<SourcesDisplayProps> = ({
  title = "Retrieved Sources",
  searchPlaceholder = "Search sources...",
  showSearch = true,
  showRelevanceScore = true,
  showMetadata = true,
  styleOverrides = {},
}) => {
  const { sources, currentSources, activeSourceIndex, setActiveSourceIndex, retrieveSources } = useRAGSources();
  const [searchQuery, setSearchQuery] = useState("");

  // use theme
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('ThemeContext is undefined');
  }
  const { colors, spacing, borderRadius } = theme.theme;

  // Merge theme defaults + overrides
  const style: SourcesDisplayStyles = {
    backgroundColor: colors.background,
    color: colors.text,
    padding: spacing.md,
    borderRadius: borderRadius.md,

    inputBackgroundColor: colors.secondaryBackground,
    inputBorderColor: 'gray',
    inputFocusRingColor: colors.primary,

    buttonBackground: colors.primary,
    buttonTextColor: colors.lightText,
    buttonBorderRadius: borderRadius.md,

    activeSourceBackground: colors.secondaryBackground,
    activeSourceBorderColor: colors.primary,

    selectedSourceBackground: colors.secondaryBackground,
    selectedSourceBorderColor: colors.success,

    inactiveSourceBackground: colors.secondaryBackground,
    inactiveSourceBorderColor: colors.text + '20',

    metadataTagBackground: colors.text + '10',
    metadataTagColor: colors.secondaryText,
    relevanceScoreColor: colors.secondary,

    sourceTypeBackground: colors.primary + '20',
    sourceTypeColor: colors.primary,
    ...removeUndefined(styleOverrides),
  };

  const isSourceReference = (source: RetrievalResult): source is SourceReference => {
    return 'sourceReference' in source;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      retrieveSources(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto" style={{
      backgroundColor: style.backgroundColor,
      color: style.color,
      padding: style.padding,
      borderRadius: style.borderRadius,
      fontFamily: style.fontFamily,
    }}>
      <h2 className="text-lg font-semibold mb-4" style={{ color: style.color }}>{title}</h2>
      {/* Search field and button */}
      {showSearch && (
        <div className="w-full flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="w-full flex-1 transition-colors focus:ring-2"
            style={{
              color: style.color,
              padding: '0.5rem 0.75rem',
              outline: 'none',
              border: '1px solid',
              borderRadius: style.buttonBorderRadius,
              borderColor: style.inputBorderColor,
              backgroundColor: style.inputBackgroundColor,
            }}
          />
          <button
            onClick={handleSearch}
            className="whitespace-nowrap transition-colors hover:opacity-80"
            style={{
              backgroundColor: style.buttonBackground,
              color: style.buttonTextColor,
              borderRadius: style.borderRadius,
              padding: '0.5rem 1rem',
            }}
          >
            Search
          </button>
        </div>
      )}

      {sources.length === 0 ? (
        <p style={{ color: style.color, fontStyle: 'italic' }}>No sources available</p>
      ) : (
        <ul className="space-y-3">
          {sources.map((source, index) => (
            <li
              key={index}
              className="p-4 shadow-sm border transition-all cursor-pointer"
              style={{
                // todo: check this?? did this ever work as expected?
                backgroundColor: index === activeSourceIndex
                  ? style.activeSourceBackground
                  : currentSources.includes(source)
                    ? style.selectedSourceBackground
                    : currentSources.length > 0
                      ? style.inactiveSourceBackground
                      : style.inactiveSourceBackground,
                borderColor: index === activeSourceIndex
                  ? style.activeSourceBorderColor
                  : currentSources.includes(source)
                    ? style.selectedSourceBorderColor
                    : style.inactiveSourceBorderColor,
                opacity: currentSources.length > 0 && !currentSources.includes(source) ? 0.6 : 1,
                borderRadius: style.borderRadius,
              }}
              onClick={() => setActiveSourceIndex(index)}
            >
              <div className="flex items-start justify-between">
                <div className="overflow-hidden">
                  <p className="font-medium truncate" style={{ color: style.color }}>
                    {source.sourceName || (isSourceReference(source) ? source.sourceReference : source.text.slice(0, 50))}
                  </p>
                  {isSourceReference(source) && source.type && (
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mt-1" style={{
                      backgroundColor: style.sourceTypeBackground,
                      color: style.sourceTypeColor,
                    }}>
                      {source.type}
                    </span>
                  )}
                  {showRelevanceScore && source.relevanceScore !== undefined && (
                    <div className="mt-2 flex items-center">
                      <span className="text-sm" style={{ color: style.color + '90' }}>Relevance:</span>
                      <div className="ml-2 h-2 w-24 rounded-full" style={{ backgroundColor: style.metadataTagBackground }}>
                        <div
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: style.relevanceScoreColor,
                            width: `${Math.round(source.relevanceScore * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {showMetadata && source.metadata && Object.keys(source.metadata).length > 0 && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: style.inactiveSourceBorderColor }}>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(source.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs"
                        style={{
                          backgroundColor: style.metadataTagBackground,
                          color: style.metadataTagColor,
                        }}
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { SourcesDisplay };
