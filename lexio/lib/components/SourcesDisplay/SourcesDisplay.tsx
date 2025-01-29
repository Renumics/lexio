import { useState, useContext } from "react";
import { RetrievalResult, SourceReference } from "../../types";
import { useRAGSources } from "../RAGProvider/hooks";
import { ThemeContext, removeUndefined } from "../../theme/ThemeContext";

export interface SourcesDisplayStyles extends React.CSSProperties {
  backgroundColor?: string;
  color?: string;
  padding?: string;
  fontFamily?: string;
  fontSize?: string;
  borderRadius?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;
  activeSourceBackground?: string;
  activeSourceBorderColor?: string;
  selectedSourceBackground?: string;
  selectedSourceBorderColor?: string;
  inactiveSourceBackground?: string;
  inactiveSourceBorderColor?: string;
  inputFocusRingColor?: string;
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
export interface SourcesDisplayProps {
  /**
   * The title displayed above the sources list
   * @default "Retrieved Sources"
   */
  title?: string;

  /**
   * Placeholder text for the search input field
   * @default "Search sources..."
   */
  searchPlaceholder?: string;

  /**
   * Controls visibility of the search functionality
   * @default true
   */
  showSearch?: boolean;

  /**
   * Controls visibility of relevance scores
   * @default true
   */
  showRelevanceScore?: boolean;

  /**
   * Controls visibility of metadata tags
   * @default true
   */
  showMetadata?: boolean;

  /**
   * Style customization options
   */
  styleOverrides?: SourcesDisplayStyles;
}

/**
 * SourcesDisplay component shows a list of retrieved sources with search functionality
 * 
 * ```tsx
 * <SourcesDisplay 
 *   title="Search Results"
 *   searchPlaceholder="Search documents..."
 *   showSearch={true}
 *   showRelevanceScore={true}
 *   showMetadata={true}
 *   styleOverrides={{
 *     backgroundColor: '#f5f5f5',
 *     buttonBackground: '#0066cc',
 *     metadataTagBackground: '#e2e8f0'
 *   }}
 * />
 * ```
 */
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
  const { colors, typography, componentDefaults } = theme.theme;

  // Merge theme defaults + overrides
  const style: SourcesDisplayStyles = {
    backgroundColor: colors.background,
    color: colors.text,
    padding: componentDefaults.padding,
    borderRadius: componentDefaults.borderRadius,
    fontSize: typography.fontSizeBase,

    inputBackgroundColor: 'white',
    inputBorderColor: 'gray',
    inputFocusRingColor: colors.primary,

    buttonBackground: colors.primary,
    buttonTextColor: colors.contrast,
    buttonBorderRadius: componentDefaults.borderRadius,

    activeSourceBackground: colors.secondaryBackground,
    activeSourceBorderColor: colors.primary,

    selectedSourceBackground: colors.secondaryBackground,
    selectedSourceBorderColor: colors.secondary,

    inactiveSourceBackground: colors.secondaryBackground,
    inactiveSourceBorderColor: 'transparent',

    metadataTagBackground: colors.background,
    metadataTagColor: colors.secondaryText,
    relevanceScoreColor: colors.primary,

    sourceTypeBackground: colors.secondary + '30',
    sourceTypeColor: colors.secondary,
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
      fontSize: style.fontSize,
    }}>
      <h2 className="font-semibold mb-4" style={{ color: style.color, fontSize: `calc(${style.fontSize} * 1.15)` }}>{title}</h2>
      {/* Search field and button */}
      {showSearch && (
        <div className="w-full flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="w-full flex-1 transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none"
            style={{
              color: style.color,
              padding: '0.5rem 0.75rem',
              outline: 'none',
              border: '1px solid',
              borderRadius: style.buttonBorderRadius,
              borderColor: style.inputBorderColor,
              backgroundColor: style.inputBackgroundColor,
              fontSize: `calc(${style.fontSize} * 0.95)`
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
              fontSize: `calc(${style.fontSize} * 0.95)`
            }}
          >
            Search
          </button>
        </div>
      )}

      {sources.length === 0 ? (
        <p style={{ color: style.color, fontStyle: 'italic', fontSize: style.fontSize }}>No sources available</p>
      ) : (
        <ul className="space-y-3">
          {sources.map((source, index) => (
            <li
              key={index}
              className="p-4 shadow-sm border transition-all cursor-pointer"
              style={{
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
                fontSize: style.fontSize,
              }}
              onClick={() => setActiveSourceIndex(index)}
            >
              <div className="flex items-start justify-between">
                <div className="overflow-hidden">
                  <p className="font-medium truncate" style={{ color: style.color }}>
                    {source.sourceName || (isSourceReference(source) ? source.sourceReference : source.text.slice(0, 50))}
                  </p>
                  {isSourceReference(source) && source.type && (
                    <span className="inline-block px-2 py-1 font-medium rounded-full mt-1" style={{
                      backgroundColor: style.sourceTypeBackground,
                      color: style.sourceTypeColor,
                      fontSize: `calc(${style.fontSize} * 0.75)`
                    }}>
                      {source.type}
                    </span>
                  )}
                  {showRelevanceScore && source.relevanceScore !== undefined && (
                    <div className="mt-2 flex items-center">
                      <span style={{ color: style.color + '90', fontSize: `calc(${style.fontSize} * 0.9)` }}>Relevance:</span>
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
                        className="inline-flex items-center px-2 py-1 rounded-md"
                        style={{
                          backgroundColor: style.metadataTagBackground,
                          color: style.metadataTagColor,
                          fontSize: `calc(${style.fontSize} * 0.75)`,
                          lineHeight: '1.2',
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
