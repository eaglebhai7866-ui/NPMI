import { useMemo } from "react";
import { motion } from "framer-motion";
import { X, TrendingUp, TrendingDown, Mountain, ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ElevationPoint {
  distance: number; // Distance from start in km
  elevation: number; // Elevation in meters
}

interface ElevationProfileProps {
  routeCoordinates: [number, number][]; // Array of [lng, lat] coordinates
  onClose: () => void;
  isLoading?: boolean;
  elevationData?: ElevationPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ElevationPoint;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg text-xs">
        <div className="flex items-center gap-1 mb-1">
          <Mountain className="w-3 h-3 text-emerald-400" />
          <span className="font-semibold">{data.elevation.toFixed(0)}m</span>
        </div>
        <div className="text-gray-400">
          {data.distance.toFixed(2)} km from start
        </div>
      </div>
    );
  }
  return null;
};

const ElevationProfile = ({
  onClose,
  isLoading = false,
  elevationData = [],
}: ElevationProfileProps) => {
  // Calculate statistics
  const stats = useMemo(() => {
    if (elevationData.length === 0) {
      return { min: 0, max: 0, totalGain: 0, totalLoss: 0, avgGrade: 0 };
    }

    let min = Infinity;
    let max = -Infinity;
    let totalGain = 0;
    let totalLoss = 0;

    elevationData.forEach((point, index) => {
      if (point.elevation < min) min = point.elevation;
      if (point.elevation > max) max = point.elevation;

      if (index > 0) {
        const diff = point.elevation - elevationData[index - 1].elevation;
        if (diff > 0) totalGain += diff;
        else totalLoss += Math.abs(diff);
      }
    });

    const totalDistance = elevationData.length > 0 
      ? elevationData[elevationData.length - 1].distance 
      : 0;
    const elevationChange = elevationData.length > 0 
      ? elevationData[elevationData.length - 1].elevation - elevationData[0].elevation 
      : 0;
    const avgGrade = totalDistance > 0 
      ? (elevationChange / (totalDistance * 1000)) * 100 
      : 0;

    return { min, max, totalGain, totalLoss, avgGrade };
  }, [elevationData]);

  const getGradeIcon = (grade: number) => {
    if (grade > 2) return <ArrowUp className="w-3 h-3 text-red-500" />;
    if (grade < -2) return <ArrowDown className="w-3 h-3 text-blue-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute left-4 right-4 bottom-20 z-20 md:left-auto md:right-4 md:w-[500px]"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-gray-700">Elevation Profile</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading elevation data...</span>
              </div>
            </div>
          ) : elevationData.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <span className="text-sm text-gray-500">No elevation data available</span>
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={elevationData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="distance"
                      tickFormatter={(val) => `${val.toFixed(0)}km`}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickFormatter={(val) => `${val}m`}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      domain={["dataMin - 50", "dataMax + 50"]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="elevation"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#elevationGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  </div>
                  <div className="text-sm font-bold text-gray-700">
                    +{stats.totalGain.toFixed(0)}m
                  </div>
                  <div className="text-[10px] text-gray-500">Elevation Gain</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  </div>
                  <div className="text-sm font-bold text-gray-700">
                    -{stats.totalLoss.toFixed(0)}m
                  </div>
                  <div className="text-[10px] text-gray-500">Elevation Loss</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ArrowUp className="w-3 h-3 text-blue-500" />
                  </div>
                  <div className="text-sm font-bold text-gray-700">
                    {stats.max.toFixed(0)}m
                  </div>
                  <div className="text-[10px] text-gray-500">Max Elevation</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {getGradeIcon(stats.avgGrade)}
                  </div>
                  <div className="text-sm font-bold text-gray-700">
                    {stats.avgGrade > 0 ? "+" : ""}{stats.avgGrade.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-gray-500">Avg Grade</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
          <span className="text-[10px] text-gray-400">
            Elevation data from Open-Meteo API
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ElevationProfile;
