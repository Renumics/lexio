import { useAtomValue, useSetAtom } from "jotai";
import { retrievedSourcesAtom, setActiveSourceIndexAtom } from "../../state/rag-state";
import { RetrievalResult, SourceReference } from "../../types";

const SourcesDisplay = () => {
  const retrievedSources = useAtomValue(retrievedSourcesAtom);

  const setActiveSourceIndex = useSetAtom(setActiveSourceIndexAtom);
  

  const isSourceReference = (source: RetrievalResult): source is SourceReference => {
    return 'source' in source;
  };


  return (
    <div className="w-full h-full overflow-y-auto p-4 bg-gray-50 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Retrieved Sources</h2>
      {retrievedSources.length === 0 ? (
        <p className="text-gray-500 italic">No sources available</p>
      ) : (
        <ul className="space-y-3">
          {retrievedSources.map((source, index) => (
            <li 
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => setActiveSourceIndex(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isSourceReference(source) ? (
                    <>
                      <p className="font-medium text-gray-800">{source.source}</p>
                      {source.type && (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mt-1">
                          {source.type}
                        </span>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">{source.text}</p>
                  )}
                  {source.relevanceScore !== undefined && (
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
              {source.metadata && Object.keys(source.metadata).length > 0 && (
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
