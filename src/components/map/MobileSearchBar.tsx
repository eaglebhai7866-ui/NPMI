import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Loader2, Navigation } from "lucide-react";
import type { SearchResult } from "./types";
import { Z_INDEX } from "../../lib/z-index";

interface MobileSearchBarProps {
  isRoutingMode: boolean;
  selectingPoint: "start" | "end" | null;
  onSelectResult: (result: SearchResult) => void;
}

const MobileSearchBar = ({
  isRoutingMode,
  selectingPoint,
  onSelectResult,
}: MobileSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchPlaces = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=8&countrycodes=pk&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.trim()) {
      searchTimeout.current = setTimeout(() => {
        searchPlaces(query.trim());
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult(result);
    setQuery("");
    setResults([]);
    setShowResults(false);
    setIsExpanded(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    setIsExpanded(false);
    inputRef.current?.blur();
  };

  const getPlaceholder = () => {
    if (isRoutingMode && selectingPoint) {
      return selectingPoint === "start" 
        ? "Search for start location..." 
        : "Search for destination...";
    }
    return "Search places in Pakistan...";
  };

  return (
    <>
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4" style={{ zIndex: Z_INDEX.SEARCH_BAR }}>
        <motion.div
          animate={{ 
            scale: isExpanded ? 1.02 : 1,
            y: isExpanded ? -2 : 0
          }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="flex items-center gap-3 p-4">
            {/* Search Icon */}
            <div className="flex-shrink-0">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onBlur={() => {
                // Delay to allow result selection
                setTimeout(() => {
                  if (!query) setIsExpanded(false);
                }, 150);
              }}
              placeholder={getPlaceholder()}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-base"
            />

            {/* Clear/Status */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {isRoutingMode && selectingPoint && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                  <Navigation className="w-3 h-3" />
                  {selectingPoint === "start" ? "Start" : "End"}
                </div>
              )}
              
              {query && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 max-h-80 overflow-y-auto"
            style={{ zIndex: Z_INDEX.SEARCH_RESULTS }}
          >
            {results.map((result, index) => (
              <motion.button
                key={result.place_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectResult(result)}
                className="w-full flex items-start gap-4 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 mb-1 line-clamp-1">
                    {result.display_name.split(",")[0]}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {result.display_name}
                  </div>
                  {result.type && (
                    <div className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg capitalize">
                      {result.type.replace("_", " ")}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {showResults && results.length === 0 && !isLoading && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 text-center"
            style={{ zIndex: Z_INDEX.SEARCH_RESULTS }}
          >
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <div className="text-gray-500 text-sm">
              No places found for "{query}"
            </div>
            <div className="text-gray-400 text-xs mt-1">
              Try searching with different keywords
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileSearchBar;