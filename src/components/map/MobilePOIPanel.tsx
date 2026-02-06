import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Eye, EyeOff, MapPin } from "lucide-react";
import type { POICategory } from "./types";
import { poiCategories } from "./constants";
import { Z_INDEX } from "../../lib/z-index";

interface MobilePOIPanelProps {
  show: boolean;
  activePOICategories: Set<POICategory>;
  poisCount: number;
  onClose: () => void;
  onToggleCategory: (category: POICategory) => void;
  onClearAll: () => void;
}

const MobilePOIPanel = ({
  show,
  activePOICategories,
  poisCount,
  onClose,
  onToggleCategory,
  onClearAll,
}: MobilePOIPanelProps) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: Z_INDEX.SECONDARY_PANEL_BACKDROP }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden"
            style={{ zIndex: Z_INDEX.SECONDARY_PANEL }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Filter className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Points of Interest</h3>
                  <p className="text-sm text-gray-500">
                    {poisCount > 0 ? `${poisCount} places visible` : "Select categories to view"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Close POI panel"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(70vh-140px)]">
              <div className="p-4 space-y-3">
                {(Object.keys(poiCategories) as POICategory[]).map((category) => {
                  const { name, icon: Icon, color } = poiCategories[category];
                  const isActive = activePOICategories.has(category);
                  
                  return (
                    <motion.button
                      key={category}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onToggleCategory(category)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${
                        isActive 
                          ? "bg-gray-50 border-2 border-gray-200" 
                          : "bg-white border-2 border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          isActive ? "" : "bg-gray-100"
                        }`}
                        style={{ backgroundColor: isActive ? color : undefined }}
                      >
                        <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-500"}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold mb-1 ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                          {name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {isActive ? "Currently visible on map" : "Tap to show on map"}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isActive ? (
                          <div className="p-2 bg-green-100 rounded-xl">
                            <Eye className="w-5 h-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="p-2 bg-gray-100 rounded-xl">
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>Data from Local Backend</span>
                </div>
                {activePOICategories.size > 0 && (
                  <button
                    onClick={onClearAll}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobilePOIPanel;