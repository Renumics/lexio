import { useState } from "react";
import { RetrievalResult, SourceReference } from "../../types";
import { useRAGSources } from "../RAGProvider/hooks";

/**
 * Props for the SourcesDisplay component
 * @see {@link SourcesDisplay}
 */
interface SourcesDisplayProps {
  /**
   * Custom title for the sources section
   * @default "Retrieved Sources"
   * @example "My Sources"
   */
  title?: string;
  /**
   * Custom placeholder for the search input
   * @default "Search sources..."
   * @example "Filter documents..."
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
}

const SourcesDisplay = ({
  title = "Retrieved Sources",
  searchPlaceholder = "Search sources...",
  showSearch = true,
  showRelevanceScore = true,
  showMetadata = true,
}: SourcesDisplayProps) => {
  const { sources, currentSources, activeSourceIndex, setActiveSourceIndex, retrieveSources } = useRAGSources();

  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="w-full h-full overflow-y-auto p-4 bg-gray-50 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      {/* Search field and button */}
      {showSearch && (
        <div className="w-full flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="w-full flex-1 px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="whitespace-nowrap px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
      )}

      {sources.length === 0 ? (
        <p className="text-gray-500 italic">No sources available</p>
      ) : (
        <ul className="space-y-3">
          {sources.map((source, index) => (
            <li
              key={index}
              className={`p-4 rounded-lg shadow-sm border transition-all cursor-pointer ${index === activeSourceIndex
                ? 'bg-blue-50 border-blue-500' // Currently viewed source - lighter blue with matching border
                : currentSources.includes(source)
                  ? 'bg-green-50 border-green-500'   // Source selected for questions - success state
                  : currentSources.length > 0
                    ? 'bg-gray-50 border-gray-200 opacity-60' // Unselected when some sources are selected
                    : 'bg-white border-gray-200 hover:border-blue-400' // Default state with matching hover
              }`}
              onClick={() => setActiveSourceIndex(index)}
            >
              <div className="flex items-start justify-between">
                <div className="overflow-hidden">
                  <p className="font-medium text-gray-800 truncate">
                    {source.sourceName || (isSourceReference(source) ? source.sourceReference : source.text?.slice(0, 50))}
                  </p>
                  {isSourceReference(source) && source.type && (
                    <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mt-1">
                      {source.type}
                    </span>
                  )}
                  {showRelevanceScore && source.relevanceScore !== undefined && (
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-500">Relevance:</span>
                      <div className="ml-2 bg-gray-200 h-2 w-24 rounded-full">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.round(source.relevanceScore * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {showMetadata && source.metadata && Object.keys(source.metadata).length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(source.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-600"
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
