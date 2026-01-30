import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, MapPinned, Building, Mountain, Landmark } from "lucide-react";
import type { SearchResult } from "./types";
import LoadingSkeleton from "./LoadingSkeleton";

interface SearchBarProps {
  isRoutingMode: boolean;
  selectingPoint: "start" | "end" | null;
  onSelectResult: (result: SearchResult) => void;
}

const SearchBar = ({ isRoutingMode, selectingPoint, onSelectResult }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchPlaces = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pk&limit=8&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SearchResult[] = await response.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(query);
    }, 300);
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult(result);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const getPlaceIcon = (type: string, placeClass: string) => {
    if (placeClass === "building" || type === "house") return Building;
    if (placeClass === "natural" || type === "peak") return Mountain;
    if (placeClass === "tourism" || type === "attraction") return Landmark;
    return MapPinned;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        const resultsPanel = document.getElementById('search-results-panel');
        if (resultsPanel && !resultsPanel.contains(e.target as Node)) {
          setShowSearchResults(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
            placeholder={isRoutingMode && selectingPoint 
              ? `Search for ${selectingPoint === 'start' ? 'start' : 'destination'} point...`
              : "Search places, roads, landmarks in Pakistan..."
            }
            className="w-full pl-10 pr-10 py-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-gray-400"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 w-5 h-5 text-primary animate-spin" />
          )}
          {!isSearching && searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowSearchResults(false);
              }}
              className="absolute right-3 p-0.5 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearchResults && isSearching && (
            <motion.div
              id="search-results-panel"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-600">Searching...</span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <LoadingSkeleton type="search" />
            </motion.div>
          )}
          {showSearchResults && !isSearching && searchResults.length > 0 && (
            <motion.div
              id="search-results-panel"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-80 overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                <span className="text-xs font-medium text-gray-600">{searchResults.length} results</span>
                <button
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              {searchResults.map((result) => {
                const PlaceIcon = getPlaceIcon(result.type, result.class);
                return (
                  <button
                    key={result.place_id}
                    onClick={() => handleSelectResult(result)}
                    className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <PlaceIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.display_name.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {result.display_name.split(',').slice(1, 3).join(',')}
                      </div>
                      <div className="text-xs text-primary/70 mt-1 capitalize">
                        {result.type.replace(/_/g, ' ')}
                      </div>
                    </div>
                    {isRoutingMode && selectingPoint && (
                      <div className={`px-2 py-1 text-xs font-medium rounded ${
                        selectingPoint === 'start' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Set as {selectingPoint === 'start' ? 'A' : 'B'}
                      </div>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results Message */}
        <AnimatePresence>
          {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-600">No results</span>
                <button
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery("");
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="p-4 text-center">
                <MapPinned className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No places found for "{searchQuery}"</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchBar;
