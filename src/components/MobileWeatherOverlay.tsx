import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets,
  Eye,
  Gauge,
  CloudFog,
  CloudDrizzle,
  Loader2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";
import { Z_INDEX } from "../lib/z-index";

export interface WeatherData {
  location: string;
  coordinates: [number, number];
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
    visibility: number;
    pressure: number;
    airQuality?: {
      aqi: number;
      pm25: number;
      pm10: number;
      category: string;
    };
  };
  hourly: Array<{
    time: string;
    temperature: number;
    weatherCode: number;
    precipitationProbability: number;
    precipitation: number;
  }>;
  alerts?: Array<{
    event: string;
    severity: string;
    description: string;
    start: string;
    end: string;
  }>;
  confidence?: number;
  sources?: string[];
  lastUpdated?: string;
}

interface MobileWeatherOverlayProps {
  show: boolean;
  weatherData: WeatherData[];
  onClose: () => void;
  isLoading?: boolean;
  selectedIndex: number;
  onSelectLocation: (index: number) => void;
  onRefresh?: () => void;
}

// Weather code to icon and description mapping
const getWeatherInfo = (code: number): { icon: typeof Sun; description: string; color: string } => {
  if (code === 0) return { icon: Sun, description: "Clear sky", color: "text-yellow-500" };
  if (code === 1 || code === 2 || code === 3) return { icon: Cloud, description: "Partly cloudy", color: "text-gray-500" };
  if (code >= 45 && code <= 48) return { icon: CloudFog, description: "Foggy", color: "text-gray-400" };
  if (code >= 51 && code <= 55) return { icon: CloudDrizzle, description: "Drizzle", color: "text-blue-400" };
  if (code >= 56 && code <= 57) return { icon: CloudDrizzle, description: "Freezing drizzle", color: "text-cyan-400" };
  if (code >= 61 && code <= 65) return { icon: CloudRain, description: "Rain", color: "text-blue-500" };
  if (code >= 66 && code <= 67) return { icon: CloudRain, description: "Freezing rain", color: "text-cyan-500" };
  if (code >= 71 && code <= 77) return { icon: CloudSnow, description: "Snow", color: "text-blue-200" };
  if (code >= 80 && code <= 82) return { icon: CloudRain, description: "Rain showers", color: "text-blue-600" };
  if (code >= 85 && code <= 86) return { icon: CloudSnow, description: "Snow showers", color: "text-blue-300" };
  if (code >= 95 && code <= 99) return { icon: CloudLightning, description: "Thunderstorm", color: "text-purple-500" };
  return { icon: Cloud, description: "Cloudy", color: "text-gray-500" };
};

// Get weather-based recommendation
const getWeatherRecommendation = (weather: WeatherData): { 
  type: 'good' | 'caution' | 'warning'; 
  message: string;
  icon: typeof ThumbsUp;
} => {
  const { current, hourly } = weather;
  
  // Check for severe weather in next 3 hours
  const nextHours = hourly.slice(0, 3);
  const hasHeavyRain = nextHours.some(h => h.precipitation > 5);
  const hasThunderstorm = nextHours.some(h => h.weatherCode >= 95);
  const hasSnow = nextHours.some(h => h.weatherCode >= 71 && h.weatherCode <= 77);
  
  // Check air quality
  const poorAirQuality = current.airQuality && current.airQuality.aqi > 150;
  const moderateAirQuality = current.airQuality && current.airQuality.aqi > 100;
  
  // Check visibility
  const poorVisibility = current.visibility < 1000;
  const lowVisibility = current.visibility < 5000;
  
  // Warning conditions
  if (hasThunderstorm) {
    return { type: 'warning', message: 'Thunderstorm expected - consider delaying travel', icon: AlertCircle };
  }
  if (hasHeavyRain) {
    return { type: 'warning', message: 'Heavy rain expected - drive carefully', icon: AlertCircle };
  }
  if (poorAirQuality) {
    return { type: 'warning', message: 'Hazardous air quality - avoid outdoor exposure', icon: AlertCircle };
  }
  if (poorVisibility) {
    return { type: 'warning', message: 'Very poor visibility - extreme caution advised', icon: AlertCircle };
  }
  
  // Caution conditions
  if (hasSnow) {
    return { type: 'caution', message: 'Snow expected - prepare for winter conditions', icon: AlertTriangle };
  }
  if (moderateAirQuality) {
    return { type: 'caution', message: 'Moderate air quality - sensitive groups take precautions', icon: AlertTriangle };
  }
  if (lowVisibility) {
    return { type: 'caution', message: 'Reduced visibility - drive with caution', icon: AlertTriangle };
  }
  if (current.windSpeed > 40) {
    return { type: 'caution', message: 'Strong winds - be cautious of crosswinds', icon: AlertTriangle };
  }
  
  // Good conditions
  return { type: 'good', message: 'Good conditions for travel', icon: ThumbsUp };
};

const MobileWeatherOverlay = ({
  show,
  weatherData,
  onClose,
  isLoading = false,
  selectedIndex,
  onSelectLocation,
  onRefresh,
}: MobileWeatherOverlayProps) => {
  const selectedWeather = weatherData[selectedIndex];
  const recommendation = selectedWeather ? getWeatherRecommendation(selectedWeather) : null;

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
            style={{ zIndex: Z_INDEX.OVERLAY_PANEL_BACKDROP }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden max-w-full"
            style={{ zIndex: Z_INDEX.OVERLAY_PANEL }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-green-600 text-white">
              <div className="flex items-center gap-3">
                <Cloud className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">Weather Along Route</h3>
                  <p className="text-sm text-green-100">Current conditions & forecast</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onRefresh && !isLoading && (
                  <button
                    onClick={onRefresh}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    aria-label="Refresh weather data"
                  >
                    <RefreshCw className="w-5 h-5 hover:rotate-180 transition-transform duration-500" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  aria-label="Close weather overlay"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto overflow-x-hidden max-h-[calc(85vh-80px)]">
              <div className="p-4 max-w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                      <span className="text-gray-500">Fetching weather data...</span>
                    </div>
                  </div>
                ) : weatherData.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Cloud className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <span className="text-gray-500">No weather data available</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Location Navigation */}
                    {weatherData.length > 1 && (
                      <div className="mb-6">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                          {weatherData.map((weather, index) => (
                            <button
                              key={index}
                              onClick={() => onSelectLocation(index)}
                              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                selectedIndex === index
                                  ? "bg-blue-500 text-white shadow-lg"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {weather.location}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weather Recommendation */}
                    {recommendation && (
                      <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 max-w-full ${
                        recommendation.type === 'good' ? 'bg-green-50 border border-green-200' :
                        recommendation.type === 'caution' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-red-50 border border-red-200'
                      }`}>
                        <recommendation.icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                          recommendation.type === 'good' ? 'text-green-600' :
                          recommendation.type === 'caution' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                        <span className={`text-sm font-medium break-words ${
                          recommendation.type === 'good' ? 'text-green-700' :
                          recommendation.type === 'caution' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {recommendation.message}
                        </span>
                      </div>
                    )}

                    {selectedWeather && (
                      <>
                        {/* Current Weather Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 mb-6 max-w-full">
                          <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <span className="font-medium text-blue-900 truncate">{selectedWeather.location}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <div className="text-4xl font-bold text-gray-900 mb-1">
                                {Math.round(selectedWeather.current.temperature)}°C
                              </div>
                              <div className="text-sm text-gray-600">
                                Feels like current temperature
                              </div>
                            </div>
                            <div className="text-center">
                              {(() => {
                                const { icon: WeatherIcon, description, color } = getWeatherInfo(selectedWeather.current.weatherCode);
                                return (
                                  <>
                                    <WeatherIcon className={`w-16 h-16 ${color} mb-2`} />
                                    <div className="text-sm text-gray-600 font-medium">{description}</div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Weather Details Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                              <Wind className="w-5 h-5 text-gray-500" />
                              <div>
                                <div className="text-xs text-gray-500">Wind Speed</div>
                                <div className="font-semibold">{selectedWeather.current.windSpeed} km/h</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                              <Droplets className="w-5 h-5 text-blue-500" />
                              <div>
                                <div className="text-xs text-gray-500">Humidity</div>
                                <div className="font-semibold">{selectedWeather.current.humidity}%</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                              <Eye className="w-5 h-5 text-gray-500" />
                              <div>
                                <div className="text-xs text-gray-500">Visibility</div>
                                <div className="font-semibold">{(selectedWeather.current.visibility / 1000).toFixed(1)} km</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                              <Gauge className="w-5 h-5 text-gray-500" />
                              <div>
                                <div className="text-xs text-gray-500">Pressure</div>
                                <div className="font-semibold">{selectedWeather.current.pressure} hPa</div>
                              </div>
                            </div>
                          </div>

                          {/* Air Quality */}
                          {selectedWeather.current.airQuality && (
                            <div className="mt-4 bg-white/60 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-semibold text-gray-700">Air Quality Index</div>
                                <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                                  selectedWeather.current.airQuality.aqi <= 50 ? 'bg-green-100 text-green-700' :
                                  selectedWeather.current.airQuality.aqi <= 100 ? 'bg-yellow-100 text-yellow-700' :
                                  selectedWeather.current.airQuality.aqi <= 150 ? 'bg-orange-100 text-orange-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {selectedWeather.current.airQuality.category}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold text-gray-900">
                                  {selectedWeather.current.airQuality.aqi}
                                </div>
                                <div className="text-right text-xs text-gray-600">
                                  <div className="mb-1">PM2.5: <span className="font-semibold">{selectedWeather.current.airQuality.pm25}</span> µg/m³</div>
                                  <div>PM10: <span className="font-semibold">{selectedWeather.current.airQuality.pm10}</span> µg/m³</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Confidence & Sources */}
                          {selectedWeather.confidence && (
                            <div className="mt-4 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                {selectedWeather.confidence >= 90 ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : selectedWeather.confidence >= 75 ? (
                                  <Info className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                )}
                                <span className="text-gray-600 font-medium">
                                  {selectedWeather.confidence}% confidence
                                </span>
                              </div>
                              {selectedWeather.sources && selectedWeather.sources.length > 0 && (
                                <div className="text-gray-500">
                                  {selectedWeather.sources.join(' + ')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Hourly Forecast */}
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <h4 className="font-semibold text-gray-900 mb-4">24-Hour Forecast</h4>
                          <div className="flex gap-4 overflow-x-auto pb-2">
                            {selectedWeather.hourly.slice(0, 12).map((hour, index) => {
                              const { icon: HourIcon, color } = getWeatherInfo(hour.weatherCode);
                              const time = new Date(hour.time).toLocaleTimeString([], { hour: '2-digit' });
                              const hasPrecipitation = hour.precipitation && hour.precipitation > 0;
                              return (
                                <div
                                  key={index}
                                  className="flex-shrink-0 flex flex-col items-center gap-2 bg-white rounded-xl p-3 min-w-[70px] shadow-sm"
                                >
                                  <div className="text-xs text-gray-500 font-medium">{time}</div>
                                  <HourIcon className={`w-6 h-6 ${color}`} />
                                  <div className="text-sm font-bold text-gray-900">{Math.round(hour.temperature)}°</div>
                                  <div className="flex items-center gap-1">
                                    <Droplets className={`w-3 h-3 ${hasPrecipitation ? 'text-blue-600' : 'text-blue-400'}`} />
                                    <span className={`text-xs ${hasPrecipitation ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                                      {hour.precipitationProbability}%
                                    </span>
                                  </div>
                                  {hasPrecipitation && (
                                    <div className="text-xs text-blue-600 font-semibold">
                                      {hour.precipitation.toFixed(1)}mm
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Multi-source weather data
                  </p>
                  {selectedWeather?.lastUpdated && (
                    <p className="text-xs text-gray-400">
                      Updated {new Date(selectedWeather.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileWeatherOverlay;