import { motion } from "framer-motion";
import { Clock, Ruler, TrendingUp, Leaf, Zap, Check } from "lucide-react";
import type { RouteInfo } from "./types";
import { formatDistance, formatDuration } from "./utils";

interface RouteAlternative extends RouteInfo {
  type: "fastest" | "shortest" | "balanced";
  savings?: {
    time?: number;
    distance?: number;
  };
}

interface RouteAlternativesProps {
  routes: RouteAlternative[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const RouteAlternatives = ({ routes, selectedIndex, onSelect }: RouteAlternativesProps) => {
  const getRouteIcon = (type: string) => {
    switch (type) {
      case "fastest":
        return Zap;
      case "shortest":
        return TrendingUp;
      case "balanced":
        return Leaf;
      default:
        return Clock;
    }
  };

  const getRouteLabel = (type: string) => {
    switch (type) {
      case "fastest":
        return "Fastest";
      case "shortest":
        return "Shortest";
      case "balanced":
        return "Balanced";
      default:
        return "Route";
    }
  };

  const getRouteColor = (type: string) => {
    switch (type) {
      case "fastest":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "shortest":
        return "text-green-600 bg-green-50 border-green-200";
      case "balanced":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-2">
      {routes.map((route, index) => {
        const Icon = getRouteIcon(route.type);
        const isSelected = index === selectedIndex;
        
        return (
          <motion.button
            key={index}
            onClick={() => onSelect(index)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
            className={`w-full p-3 rounded-xl transition-all text-left relative overflow-hidden ${
              isSelected
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200"
                : "bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Route indicator line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              isSelected ? "bg-white" : "bg-purple-400"
            }`} />
            
            <div className="flex items-center justify-between mb-2 ml-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  isSelected ? 'bg-white/20' : 'bg-purple-100'
                }`}>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                </div>
                <div>
                  <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {getRouteLabel(route.type)}
                  </div>
                  {route.savings && (
                    <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      {route.savings.time && `Save ${Math.round(route.savings.time / 60)} min`}
                      {route.savings.distance && ` • ${(route.savings.distance / 1000).toFixed(1)} km shorter`}
                    </div>
                  )}
                </div>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
                >
                  <Check className="w-4 h-4 text-purple-600" />
                </motion.div>
              )}
            </div>
            
            <div className={`flex items-center gap-4 text-xs ml-2 ${
              isSelected ? 'text-white/90' : 'text-gray-600'
            }`}>
              <div className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(route.duration)}</span>
              </div>
              <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/50' : 'bg-gray-400'}`} />
              <div className="flex items-center gap-1.5 font-semibold">
                <Ruler className="w-3.5 h-3.5" />
                <span>{formatDistance(route.distance)}</span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default RouteAlternatives;
