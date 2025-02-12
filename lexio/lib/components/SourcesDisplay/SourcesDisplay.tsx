import React, {useState, useContext, useEffect, FC} from "react";
import {RetrievalResult, SourceReference, TextContent} from "../../types";
import { useRAGSources } from "../RAGProvider/hooks";
import { ThemeContext, removeUndefined } from "../../theme/ThemeContext";
import { ResetWrapper } from "../../utils/ResetWrapper";
import { Search as SearchIcon, File as FileIcon } from "lucide-react";

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
 * @example
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

  useEffect(() => {
    console.log("sources: ", sources);
  }, [sources]);

  useEffect(() => {
    console.log("currentSources: ", currentSources);
  }, [currentSources]);

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
    // padding: componentDefaults.padding,
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
    <ResetWrapper>
    <div className="grid auto-cols-fr gap-3 overflow-hidden min-w-[300px] w-full" style={{
      backgroundColor: style.backgroundColor,
      color: style.color,
      padding: style.padding,
      borderRadius: style.borderRadius,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
    }}>
      <div className={"grid auto-cols-fr gap-1.5 sticky top-0 z-[11]"}>
        <div>
          <h2 className="font-light"
              style={{color: style.color, fontSize: `calc(${style.fontSize} * 1.15)`}}>{title}</h2>
        </div>
        {/* Search field and button */}
        {showSearch && (
            <div
                className="grid gap-1 grid-cols-[1fr_max-content] content-center items-center border border-solid border-gray-300 rounded-md p-2 overflow-y-auto">
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full flex-1 transition-colors focus:outline-none"
                  style={{
                    color: style.color,
                    // padding: '0.5rem 0.75rem',
                    outline: 'none',
                    // border: '1px solid',
                    borderRadius: style.buttonBorderRadius,
                    // borderColor: style.inputBorderColor,
                    backgroundColor: style.inputBackgroundColor,
                    fontSize: `calc(${style.fontSize} * 0.95)`
                  }}
              />
              <button
                  onClick={handleSearch}
                  className="whitespace-nowrap transition-colors hover:opacity-80"
                  style={{
                    // backgroundColor: style.buttonBackground,
                    // color: style.buttonTextColor,
                    borderRadius: style.borderRadius,
                    // padding: '0.5rem 1rem',
                    fontSize: `calc(${style.fontSize} * 0.95)`
                  }}
              >
                <SearchIcon size={"20px"} color={style.buttonBackground}/>
              </button>
            </div>
        )}
      </div>
        {sources.length === 0 ? (
            <p style={{ color: style.color, fontStyle: 'italic', fontSize: style.fontSize }}>No sources available</p>
        ) : (
            <div className="grid grid-cols-1 gap-2 mt-2">
              {sources.map((source, index) =>
                <SourceItem
                  key={index}
                  isSelected={index === activeSourceIndex}
                  style={style}
                  currentSources={currentSources}
                  source={source}
                  setActiveSourceIndex={() => setActiveSourceIndex(index)}
                  showRelevanceScore={showRelevanceScore}
                  isSourceReference={isSourceReference}
                  showMetadata={showMetadata}
                />
              )}
            </div>
        )}
    </div>
    </ResetWrapper>
  );
};

type SourceItemProps = {
  isSelected: boolean;
  style: SourcesDisplayStyles;
  currentSources: RetrievalResult[];
  source: RetrievalResult;
  setActiveSourceIndex: () => void;
  showRelevanceScore: boolean;
  isSourceReference: (source: RetrievalResult) => boolean;
  showMetadata: boolean;
}
const SourceItem: FC<SourceItemProps> = (props) => {
  const {
    isSelected,
    style,
    currentSources,
    source,
    setActiveSourceIndex,
    showRelevanceScore,
    isSourceReference,
    showMetadata,
  } = props;

  return (
      <div
          className="p-2 transition-all cursor-pointer"
          style={{
            backgroundColor: "#efefef",
            // backgroundColor: index === activeSourceIndex
            //     ? style.activeSourceBackground
            //     : currentSources.includes(source)
            //         ? style.selectedSourceBackground
            //         : currentSources.length > 0
            //             ? style.inactiveSourceBackground
            //             : style.inactiveSourceBackground,
            borderColor: isSelected
                ? style.activeSourceBorderColor
                : currentSources.includes(source)
                    ? style.selectedSourceBorderColor
                    : style.inactiveSourceBorderColor,
            opacity: currentSources.length > 0 && !currentSources.includes(source) ? 0.6 : 1,
            borderRadius: style.borderRadius,
            fontSize: style.fontSize,
            border: isSelected? `2px solid #2563eb` : "2px solid transparent"
          }}
          onClick={() => setActiveSourceIndex()}
      >
        <div className={"grid grid-cols-[max-content_1fr] gap-2 items-start content-start"}>
          <FileIcon size={"35px"} style={{color: "gray"}} strokeWidth={1.1}/>
          <div>
            <p className="font-medium text-sm truncate" style={{color: style.color}}>
              {source.sourceName || (isSourceReference(source) ? (source as SourceReference).sourceReference : (source as TextContent).text.slice(0, 50))}
            </p>
            <div className={"grid gap-2 grid-cols-[max-content_1fr_1fr] items-center content-center"}>
              <div>
                {isSourceReference(source) && (source as SourceReference).type && (
                    <span className="inline-block py-0.5 px-2 font-medium text-xs rounded-md" style={{
                      backgroundColor: style.sourceTypeBackground,
                      color: style.sourceTypeColor,
                      fontSize: `calc(${style.fontSize} * 0.75)`
                    }}>
                        {(source as SourceReference).type}
                      </span>
                )}
              </div>
              {showMetadata && source.metadata && Object.keys(source.metadata).length > 0 && (
                  <div className="border-t" style={{borderColor: style.inactiveSourceBorderColor}}>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(source.metadata).map(([key, value]) => (
                          <span
                              key={key}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs"
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
            </div>
          </div>
        </div>
        <div className={"grid justify-end"}>
          <div>
            {showRelevanceScore && source.relevanceScore !== undefined && (
                <p className="flex items-center text-xs">
                  {(source.relevanceScore * 100).toFixed()}% Relevance
                </p>
            )}
          </div>
        </div>
      </div>
  )
};
SourceItem.displayName = "SourceItem";

export {SourcesDisplay}