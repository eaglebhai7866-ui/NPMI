import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Square, X, PenTool, Trash2, Minus } from "lucide-react";
import type { MeasureMode } from "./types";
import { formatDistance, formatArea } from "./utils";

interface SegmentMeasurement {
  from: number;
  to: number;
  distance: number;
}

interface MeasurementPanelProps {
  show: boolean;
  measureMode: MeasureMode;
  measurePoints: [number, number][];
  measureResult: { distance?: number; area?: number; segments?: SegmentMeasurement[] } | null;
  onClose: () => void;
  onClear: () => void;
  onRemovePoint?: (index: number) => void;
}

const MeasurementPanel = ({
  show,
  measureMode,
  measurePoints,
  measureResult,
  onClose,
  onClear,
  onRemovePoint,
}: MeasurementPanelProps) => {
  if (measureMode === "none") return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute left-20 bottom-36 z-10"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 min-w-[220px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {measureMode === "distance" ? (
                  <Ruler className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Square className="w-4 h-4 text-indigo-500" />
                )}
                <span className="text-sm font-semibold text-gray-700">
                  {measureMode === "distance" ? "Distance Measurement" : "Area Measurement"}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Close"
                aria-label="Close measurement panel"
              >
                <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:scale-110 transition-all" />
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                {measureMode === "distance" 
                  ? "Click on the map to add points. The total distance will be calculated."
                  : "Click on the map to add at least 3 points to calculate the area."
                }
              </p>
              
              {measurePoints.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <PenTool className="w-3 h-3" />
                  <span>{measurePoints.length} point{measurePoints.length !== 1 ? 's' : ''} placed</span>
                </div>
              )}

              {measurePoints.length === 1 && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                  {measureMode === "distance" 
                    ? "Add at least 1 more point to measure distance"
                    : "Add at least 2 more points to measure area"
                  }
                </div>
              )}

              {measureResult && (
                <>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <div className="text-xs text-indigo-600 font-medium mb-1">
                      {measureMode === "distance" ? "Total Distance" : "Total Area"}
                    </div>
                    <div className="text-xl font-bold text-indigo-700">
                      {measureMode === "distance" && measureResult.distance !== undefined
                        ? formatDistance(measureResult.distance)
                        : measureResult.area !== undefined
                        ? formatArea(measureResult.area)
                        : "-"
                      }
                    </div>
                  </div>

                  {/* Segment Details */}
                  {measureResult.segments && measureResult.segments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        {measureMode === "distance" ? "Line Segments:" : "Polygon Sides:"}
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                        {measureResult.segments.map((segment, index) => {
                          // For polygons, each side connects two points
                          // We want to delete the "from" point of each segment
                          const pointToDelete = segment.from;
                          
                          return (
                            <motion.div
                              key={`${segment.from}-${segment.to}-${index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs hover:bg-gray-100 transition-colors group"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-gray-600">
                                  {measureMode === "distance" 
                                    ? `Segment ${index + 1}: Point ${segment.from + 1} → ${segment.to + 1}`
                                    : `Side ${index + 1}: Point ${segment.from + 1} → ${segment.to + 1}`
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800">
                                  {formatDistance(segment.distance)}
                                </span>
                                {onRemovePoint && (
                                  <button
                                    onClick={() => onRemovePoint(pointToDelete)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700"
                                    title={`Delete point ${pointToDelete + 1}`}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {measureMode === "distance" 
                          ? "Drag markers to adjust • Hover marker to delete"
                          : "Drag markers to adjust • Hover marker to delete"
                        }
                      </div>
                    </div>
                  )}
                </>
              )}

              {measurePoints.length > 0 && (
                <button
                  onClick={onClear}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Measurement
                </button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-[10px] text-gray-400">Click map to add measurement points</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MeasurementPanel;
