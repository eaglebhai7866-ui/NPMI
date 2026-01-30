import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Route, X, Car, Bike, Footprints, Loader2, Clock, Ruler, 
  Volume2, VolumeX, List, ChevronDown, ChevronUp, RotateCcw,
  TrendingUp, CloudSun, ArrowLeft, ArrowRight, ArrowUp,
  CornerUpLeft, CornerUpRight, RotateCw, CircleDot, Flag, ChevronRight,
  Save, Bookmark
} from "lucide-react";
import type { TravelMode, RoutePoint, RouteInfo, NavigationStep } from "./types";
import { travelModes } from "./constants";
import { formatDistance, formatDuration } from "./utils";
import LoadingSkeleton from "./LoadingSkeleton";
import RouteAlternatives from "./RouteAlternatives";
import SavedRoutes from "./SavedRoutes";
import { voiceNavigator } from "@/lib/voice-navigation";

interface RouteAlternative extends RouteInfo {
  type: "fastest" | "shortest" | "balanced";
  savings?: {
    time?: number;
    distance?: number;
  };
}

interface RoutingPanelProps {
  show: boolean;
  travelMode: TravelMode;
  startPoint: RoutePoint | null;
  endPoint: RoutePoint | null;
  selectingPoint: "start" | "end" | null;
  routeInfo: RouteInfo | null;
  isCalculatingRoute: boolean;
  voiceEnabled: boolean;
  showSteps: boolean;
  currentStepIndex: number;
  isLoadingElevation: boolean;
  showElevationProfile: boolean;
  isLoadingWeather: boolean;
  showWeatherOverlay: boolean;
  alternatives?: RouteAlternative[];
  selectedAlternative?: number;
  onClose: () => void;
  onTravelModeChange: (mode: TravelMode) => void;
  onSetStartPoint: () => void;
  onSetEndPoint: () => void;
  onClearStartPoint: () => void;
  onClearEndPoint: () => void;
  onToggleVoice: () => void;
  onToggleSteps: () => void;
  onGoToStep: (index: number, step: NavigationStep) => void;
  onClearRoute: () => void;
  onToggleElevation: () => void;
  onToggleWeather: () => void;
  onSelectAlternative?: (index: number) => void;
  onSaveRoute?: () => void;
  onLoadRoute?: (route: any) => void;
}

const getManeuverIcon = (type: string, modifier?: string) => {
  switch (type) {
    case "turn":
      if (modifier?.includes("left")) return ArrowLeft;
      if (modifier?.includes("right")) return ArrowRight;
      return ArrowUp;
    case "new name":
    case "continue":
      return ArrowUp;
    case "merge":
    case "on ramp":
    case "off ramp":
      if (modifier?.includes("left")) return CornerUpLeft;
      if (modifier?.includes("right")) return CornerUpRight;
      return ArrowUp;
    case "fork":
      if (modifier?.includes("left")) return CornerUpLeft;
      if (modifier?.includes("right")) return CornerUpRight;
      return ArrowUp;
    case "end of road":
      if (modifier?.includes("left")) return ArrowLeft;
      if (modifier?.includes("right")) return ArrowRight;
      return ArrowUp;
    case "roundabout":
    case "rotary":
      return RotateCw;
    case "depart":
      return CircleDot;
    case "arrive":
      return Flag;
    default:
      return ChevronRight;
  }
};

const RoutingPanel = ({
  show,
  travelMode,
  startPoint,
  endPoint,
  selectingPoint,
  routeInfo,
  isCalculatingRoute,
  voiceEnabled,
  showSteps,
  currentStepIndex,
  isLoadingElevation,
  showElevationProfile,
  isLoadingWeather,
  showWeatherOverlay,
  alternatives = [],
  selectedAlternative = 0,
  onClose,
  onTravelModeChange,
  onSetStartPoint,
  onSetEndPoint,
  onClearStartPoint,
  onClearEndPoint,
  onToggleVoice,
  onToggleSteps,
  onGoToStep,
  onClearRoute,
  onToggleElevation,
  onToggleWeather,
  onSelectAlternative,
  onSaveRoute,
  onLoadRoute,
}: RoutingPanelProps) => {
  const [showSavedRoutes, setShowSavedRoutes] = useState(false);

  // Voice-enabled step navigation
  const handleGoToStep = (index: number, step: NavigationStep) => {
    onGoToStep(index, step);
    
    // Always announce the step when clicked if voice is enabled
    if (voiceEnabled) {
      const distance = step.distance ? `${Math.round(step.distance)}m` : undefined;
      voiceNavigator.announceStepOnClick(step.instruction, distance);
    }
  };

  // Keyboard navigation for steps
  const handleKeyNavigation = (event: React.KeyboardEvent) => {
    if (!routeInfo?.steps || !showSteps) return;
    
    if (event.key === 'ArrowUp' && currentStepIndex > 0) {
      event.preventDefault();
      const prevStep = routeInfo.steps[currentStepIndex - 1];
      handleGoToStep(currentStepIndex - 1, prevStep);
    } else if (event.key === 'ArrowDown' && currentStepIndex < routeInfo.steps.length - 1) {
      event.preventDefault();
      const nextStep = routeInfo.steps[currentStepIndex + 1];
      handleGoToStep(currentStepIndex + 1, nextStep);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="absolute left-4 top-4 w-72 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 z-20 max-h-[calc(100vh-8rem)] overflow-y-auto"
        >
          {/* Panel Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-primary text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              <span className="font-semibold">Route Planner</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors group"
              title="Close"
              aria-label="Close routing panel"
            >
              <X className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Travel Mode Selector */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(Object.keys(travelModes) as TravelMode[]).map((mode) => {
                const Icon = travelModes[mode].icon;
                return (
                  <button
                    key={mode}
                    onClick={() => onTravelModeChange(mode)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs font-medium transition-all ${
                      travelMode === mode
                        ? "bg-white shadow text-primary"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{travelModes[mode].name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Route Points */}
          <div className="p-3 space-y-3">
            {/* Start Point */}
            <div 
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                selectingPoint === "start" 
                  ? "border-emerald-500 bg-emerald-50" 
                  : startPoint 
                    ? "border-emerald-200 bg-emerald-50/50" 
                    : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => !startPoint && onSetStartPoint()}
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">Start Point</div>
                <div className="text-sm font-medium truncate">
                  {startPoint?.name || (selectingPoint === "start" ? "Click on map..." : "Select start")}
                </div>
              </div>
              {startPoint && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearStartPoint();
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Connector Line */}
            <div className="flex justify-center">
              <div className="w-0.5 h-4 bg-gray-300" />
            </div>

            {/* End Point */}
            <div 
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                selectingPoint === "end" 
                  ? "border-red-500 bg-red-50" 
                  : endPoint 
                    ? "border-red-200 bg-red-50/50" 
                    : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => startPoint && !endPoint && onSetEndPoint()}
            >
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                B
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">End Point</div>
                <div className="text-sm font-medium truncate">
                  {endPoint?.name || (selectingPoint === "end" ? "Click on map..." : "Select destination")}
                </div>
              </div>
              {endPoint && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearEndPoint();
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Route Info */}
          <AnimatePresence>
            {(isCalculatingRoute || routeInfo) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-100 overflow-hidden"
              >
                {isCalculatingRoute ? (
                  <LoadingSkeleton type="route" />
                ) : routeInfo && (
                  <div>
                    {/* Route Alternatives */}
                    {alternatives.length > 0 && onSelectAlternative && (
                      <div className="border-b border-gray-100">
                        <RouteAlternatives
                          routes={alternatives}
                          selectedIndex={selectedAlternative}
                          onSelect={onSelectAlternative}
                        />
                      </div>
                    )}

                    {/* Distance & ETA */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Ruler className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Distance</div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatDistance(routeInfo.distance)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Clock className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">ETA</div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatDuration(routeInfo.duration)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Voice & Steps Controls */}
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={onToggleVoice}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                            voiceEnabled 
                              ? "bg-primary text-white" 
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                          Voice
                        </button>
                        <button
                          onClick={onToggleSteps}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-all"
                        >
                          <List className="w-4 h-4" />
                          {routeInfo.steps.length} Steps
                          {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Elevation & Weather Buttons */}
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={onToggleElevation}
                          disabled={isLoadingElevation}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            showElevationProfile 
                              ? "bg-emerald-500 text-white" 
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {isLoadingElevation ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                          Elevation
                        </button>
                        <button
                          onClick={onToggleWeather}
                          disabled={isLoadingWeather}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            showWeatherOverlay 
                              ? "bg-emerald-500 text-white" 
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {isLoadingWeather ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudSun className="w-4 h-4" />}
                          Weather
                        </button>
                      </div>

                      {/* Save Route Button */}
                      {onSaveRoute && (
                        <button
                          onClick={onSaveRoute}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-medium transition-all"
                        >
                          <Save className="w-4 h-4" />
                          Save Route
                        </button>
                      )}
                    </div>

                    {/* Navigation Steps List */}
                    <AnimatePresence>
                      {showSteps && routeInfo.steps.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="max-h-64 overflow-y-auto border-t border-gray-100"
                          onKeyDown={handleKeyNavigation}
                          tabIndex={0}
                        >
                          {routeInfo.steps.map((step, index) => {
                            const StepIcon = getManeuverIcon(step.maneuver.type, step.maneuver.modifier);
                            const isActive = index === currentStepIndex;
                            
                            return (
                              <button
                                key={index}
                                onClick={() => handleGoToStep(index, step)}
                                className={`w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                                  isActive ? "bg-blue-50" : ""
                                }`}
                              >
                                <div className={`p-2 rounded-lg flex-shrink-0 ${
                                  isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                                }`}>
                                  <StepIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-medium ${isActive ? "text-primary" : "text-gray-900"}`}>
                                    {step.instruction}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span>{formatDistance(step.distance)}</span>
                                    <span>•</span>
                                    <span>{formatDuration(step.duration)}</span>
                                  </div>
                                </div>
                                {isActive && voiceEnabled && (
                                  <Volume2 className="w-4 h-4 text-primary flex-shrink-0 animate-pulse" />
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear Button */}
          {(startPoint || endPoint) && (
            <div className="sticky bottom-0 z-10 p-3 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
              <div className="flex gap-2">
                <button
                  onClick={onClearRoute}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Route
                </button>
                {onLoadRoute && (
                  <button
                    onClick={() => setShowSavedRoutes(!showSavedRoutes)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                    {showSavedRoutes ? "Hide" : "Saved"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Saved Routes Panel */}
          <AnimatePresence>
            {showSavedRoutes && onLoadRoute && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-100 overflow-hidden"
              >
                <div className="p-3">
                  <SavedRoutes onLoadRoute={onLoadRoute} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoutingPanel;
