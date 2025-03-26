import { useState, useContext } from "react";
import { ThemeContext, removeUndefined } from "../../theme/ThemeContext";
import { ResetWrapper } from "../../utils/ResetWrapper";
import { useSources} from "../../hooks";
import { TrashIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {addOpacity, scaleFontSize} from "../../utils/scaleFontSize.tsx";

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
   * Unique key for the component which can be used to identify the source of UserAction's if multiple SourcesDisplay components are used.
   * The default is 'SourcesDisplay', if key is provided it will be appended to the default key as following 'SourcesDisplay-${key}'.
   */
  componentKey?: string;
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
 * A component for displaying, searching, and selecting sources.
 * 
 * `SourcesDisplay` shows a list of available sources with search functionality,
 * allowing users to browse, filter, and select sources for viewing or reference.
 * 
 * @component
 * 
 * Features:
 * - Source listing with titles and metadata
 * - Search functionality for filtering sources
 * - Source selection for viewing content
 * - Relevance score display
 * - Metadata tag display
 * - Clear sources functionality
 * - Responsive design
 * 
 * @example
 * 
 * ```tsx
 * <SourcesDisplay
 *   componentKey="main-sources"
 *   title="Knowledge Base"
 *   searchPlaceholder="Search documents..."
 *   showSearch={true}
 *   showRelevanceScore={true}
 *   showMetadata={true}
 *   styleOverrides={{
 *     backgroundColor: '#ffffff',
 *     borderRadius: '8px',
 *     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
 *     padding: '1rem',
 *   }}
 * />
 * ```
 */
const SourcesDisplay: React.FC<SourcesDisplayProps> = ({
  componentKey,
  title = "Retrieved Sources",
  searchPlaceholder = "Search knowledge base...",
  showSearch = true,
  showRelevanceScore = true,
  showMetadata = true,
  styleOverrides = {},
}) => {
  const { sources, activeSources, selectedSourceId, setSelectedSource, searchSources, clearSources } = useSources(componentKey ? `SourcesDisplay-${componentKey}` : 'SourcesDisplay'); // todo: make use of new API
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
    inputBorderColor: colors.primary,
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

    sourceTypeBackground: addOpacity(colors.secondary, 0.17),
    sourceTypeColor: colors.secondary,
    ...removeUndefined(styleOverrides),
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchSources(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <ResetWrapper>
      <div className="w-full h-full flex flex-col" style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderRadius: style.borderRadius,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
      }}>
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <h2 className="font-semibold" style={{ color: style.color, fontSize: `calc(${style.fontSize} * 1.15)` }}>
            {title}
          </h2>
          <button
            onClick={clearSources}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
            style={{
              color: style.color,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: sources.length > 0 ? 'pointer' : 'not-allowed',
            }}
            disabled={sources.length === 0}
            title={sources.length > 0 ? "Clear all sources" : "No sources to clear"}
            aria-label={sources.length > 0 ? "Clear all sources" : "No sources to clear"}
          >
            <TrashIcon className="size-5" />
          </button>
        </div>

        {/* Scrollable Sources List */}
        <div className="flex-1 overflow-y-auto px-4">
          {sources.length === 0 ? (
            <p style={{ color: style.color, fontStyle: 'italic', fontSize: style.fontSize }}>No sources available</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {sources.map((source, index) => (
                <li
                  key={index}
                  className="p-4 shadow-sm border transition-all cursor-pointer"
                  style={{
                    backgroundColor: source.id === selectedSourceId
                      ? style.selectedSourceBackground
                      : activeSources && activeSources.includes(source)
                        ? style.activeSourceBackground
                        : activeSources && activeSources.length > 0
                          ? style.inactiveSourceBackground
                          : style.inactiveSourceBackground,
                    borderColor: source.id === selectedSourceId
                      ? style.selectedSourceBorderColor
                      : activeSources && activeSources.includes(source)
                        ? style.activeSourceBorderColor
                        : style.inactiveSourceBorderColor,
                    opacity: activeSources && activeSources.length > 0 && !activeSources.includes(source) ? 0.6 : 1,
                    borderRadius: style.borderRadius,
                    fontSize: style.fontSize,
                  }}
                  onClick={() => setSelectedSource(source.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="overflow-hidden flex-1 mr-2">
                      <p className="font-medium truncate" style={{ 
                        color: style.color,
                        fontSize: scaleFontSize(style.fontSize || '16px', 1.0)
                      }}>
                        {source.title}
                      </p>
                      {source.description && (
                        <p className="text-gray-500 line-clamp-2" style={{ 
                          color: addOpacity(style.color || colors.text, 0.6),
                          fontSize: scaleFontSize(style.fontSize || '14px', 0.95)
                        }}>
                            {source.description}
                        </p>
                      )}
                      {showRelevanceScore && source.relevance !== undefined && (
                        <div className="mt-2 flex items-center group relative">
                          <span style={{ 
                            color: addOpacity(style.color || colors.text, 0.6), 
                            fontSize: scaleFontSize(style.fontSize || '12px', 0.85),
                            }}>Relevance:</span>
                          <div 
                            className="ml-2 h-2 w-24 rounded-full" 
                            style={{
                              backgroundColor: style.metadataTagBackground,
                            }}
                          >
                            <div
                              className="h-2 rounded-full"
                              style={{
                                backgroundColor: style.relevanceScoreColor,
                                width: `${Math.round(source.relevance * 100)}%`
                              }}
                            />
                          </div>
                          <div className="absolute bottom-full left-1/3 transform -translate-x-1 mb-1 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200" 
                            style={{
                              backgroundColor: style.backgroundColor,
                              color: style.color,
                              border: `1px solid ${style.metadataTagBackground}`,
                              fontSize: scaleFontSize(style.fontSize || '12px', 0.75),
                            }}>
                            {Math.round(source.relevance * 100)}%
                          </div>
                        </div>
                      )}
                    </div>
                    {source.type && (
                      <span className="inline-block px-2 py-1 font-medium rounded-full flex-shrink-0" style={{
                        backgroundColor: style.sourceTypeBackground,
                        color: style.sourceTypeColor,
                        fontSize: scaleFontSize(style.fontSize || '12px', 0.8)
                      }}>
                        {source.type}
                      </span>
                    )}
                  </div>
                  {showMetadata && source.metadata && Object.keys(source.metadata).length > 0 && (
                    <div className="pt-2 border-t" style={{ borderColor: style.inactiveSourceBorderColor }}>
                      <div className="flex flex-wrap gap-2 overflow-hidden">
                        {Object.entries(source.metadata)
                            .filter(([key]) => typeof key === "string" && !key.startsWith("_"))
                            .map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center px-2 py-1 rounded-md"
                                style={{
                                  backgroundColor: style.metadataTagBackground,
                                  color: style.metadataTagColor,
                                  fontSize: scaleFontSize(style.fontSize || '12px', 0.85),
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

        {/* Search Section with proper focus behavior */}
        {showSearch && (
          <div className="border-t px-4 py-3" style={{ 
            borderColor: style.inputBorderColor + '20',
            backgroundColor: style.backgroundColor
          }}>
            <div className="flex items-center gap-3">
              <div 
                className="flex-1 flex items-center gap-2 group 
                           bg-white border shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]
                           focus-within:ring-1 focus-within:ring-opacity-20 transition-all"
                style={{
                  borderColor: `${style.inputBorderColor}30`,
                  borderRadius: style.borderRadius,
                }}
              >
                <MagnifyingGlassIcon 
                  className="ml-3 size-4 transition-colors group-focus-within:text-primary-600" 
                  style={{ 
                    color: style.buttonBackground + '60',
                  }} 
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full py-2 pr-3 border-0 focus:ring-0 focus:outline-none"
                  style={{
                    color: style.color,
                    backgroundColor: 'transparent',
                    fontSize: style.fontSize,
                  }}
                />
              </div>
              <button
                onClick={handleSearch}
                className="rounded-md px-4 py-2 transition-all hover:opacity-90 active:transform active:scale-[0.98]"
                style={{
                  backgroundColor: style.buttonBackground,
                  color: style.buttonTextColor,
                  fontSize: style.fontSize,
                  fontWeight: '500',
                  borderRadius: style.buttonBorderRadius,
                }}
              >
                Search
              </button>
            </div>
          </div>
        )}

      </div>
    </ResetWrapper>
  );
};

export { SourcesDisplay }