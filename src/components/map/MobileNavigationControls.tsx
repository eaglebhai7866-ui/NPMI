import { motion } from "framer-motion";
import { 
  Route, 
  MapPin, 
  Layers, 
  Ruler, 
  Square,
  Crosshair,
  Loader2,
  Eye,
  EyeOff,
  FileText
} from "lucide-react";
import type { MeasureMode } from "./types";
import { Z_INDEX } from "../../lib/z-index";

interface MobileNavigationControlsProps {
  isRoutingMode: boolean;
  isLocating: boolean;
  showPOIPanel: boolean;
  isLoadingPOIs: boolean;
  measureMode: MeasureMode;
  showLayerPanel: boolean;
  showTrafficLayer: boolean;
  trafficLoading: boolean;
  showDocsButton?: boolean;
  onToggleRouting: () => void;
  onLocateUser: () => void;
  onTogglePOI: () => void;
  onToggleMeasure: (mode: "distance" | "area") => void;
  onToggleLayerPanel: () => void;
  onToggleTraffic: () => void;
  onDocsClick?: () => void;
}

const MobileNavigationControls = ({
  isRoutingMode,
  isLocating,
  showPOIPanel,
  isLoadingPOIs,
  measureMode,
  showLayerPanel,
  showTrafficLayer,
  trafficLoading,
  showDocsButton = false,
  onToggleRouting,
  onLocateUser,
  onTogglePOI,
  onToggleMeasure,
  onToggleLayerPanel,
  onToggleTraffic,
  onDocsClick,
}: MobileNavigationControlsProps) => {
  return (
    <div className="absolute bottom-4 left-4 right-4" style={{ zIndex: Z_INDEX.NAVIGATION_CONTROLS }}>
      {/* Main Action Bar */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-3">
        <div className="grid grid-cols-5 gap-2">
          {/* Routing */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleRouting}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              isRoutingMode 
                ? "bg-primary text-white shadow-md" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}
            aria-label="Toggle routing"
          >
            <Route className="w-5 h-5" />
            <span className="text-xs font-medium">Route</span>
          </motion.button>

          {/* Location */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onLocateUser}
            disabled={isLocating}
            className="flex flex-col items-center gap-1 p-3 rounded-xl text-gray-600 hover:text-primary hover:bg-gray-50 transition-all disabled:opacity-50"
            aria-label="Find my location"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Crosshair className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">Location</span>
          </motion.button>

          {/* POI */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onTogglePOI}
            disabled={isLoadingPOIs}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              showPOIPanel 
                ? "bg-purple-500 text-white shadow-md" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}
            aria-label="Toggle points of interest"
          >
            {isLoadingPOIs ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">POI</span>
          </motion.button>

          {/* Distance Measure */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleMeasure("distance")}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              measureMode === "distance" 
                ? "bg-indigo-500 text-white shadow-md" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}
            aria-label="Measure distance"
          >
            <Ruler className="w-5 h-5" />
            <span className="text-xs font-medium">Distance</span>
          </motion.button>

          {/* Area Measure */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleMeasure("area")}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              measureMode === "area" 
                ? "bg-indigo-500 text-white shadow-md" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}
            aria-label="Measure area"
          >
            <Square className="w-5 h-5" />
            <span className="text-xs font-medium">Area</span>
          </motion.button>
        </div>

        {/* Secondary Controls */}
        <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-gray-200">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleLayerPanel}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showLayerPanel 
                ? "bg-blue-500 text-white shadow-md" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}
            aria-label="Toggle map layers"
          >
            <Layers className="w-4 h-4" />
            <span>Layers</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleTraffic}
            disabled={trafficLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showTrafficLayer 
                ? "bg-orange-500 text-white shadow-md" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}
            aria-label="Toggle traffic layer"
          >
            {trafficLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : showTrafficLayer ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            <span>Traffic</span>
          </motion.button>

          {/* Docs Button */}
          {showDocsButton && onDocsClick && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onDocsClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-all"
              aria-label="Open documentation"
            >
              <FileText className="w-4 h-4" />
              <span>Docs</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNavigationControls;