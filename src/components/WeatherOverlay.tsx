import { motion } from "framer-motion";
import { useEffect } from "react";
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
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
} from "lucide-react";

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

interface WeatherOverlayProps {
  weatherData: WeatherData[];
  onClose: () => void;
  isLoading?: boolean;
  selectedIndex: number;
  onSelectLocation: (index: number) => void;
  onRefresh?: () => void;
}

// Weather code to icon and description mapping
const getWeatherInfo = (code: number): { icon: typeof Sun; description: string; color: string } => {
  // WMO Weather interpretation codes
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

const WeatherOverlay = ({
  weatherData,
  onClose,
  isLoading = false,
  selectedIndex,
  onSelectLocation,
  onRefresh,
}: WeatherOverlayProps) => {
  const selectedWeather = weatherData[selectedIndex];
  const recommendation = selectedWeather ? getWeatherRecommendation(selectedWeather) : null;

  // Debug log only when selectedWeather changes
  useEffect(() => {
    if (selectedWeather) {
      console.log('WeatherOverlay - Selected weather:', {
        location: selectedWeather.location,
        confidence: selectedWeather.confidence,
        hasAirQuality: !!selectedWeather.current?.airQuality,
        sources: selectedWeather.sources,
        aqi: selectedWeather.current?.airQuality?.aqi
      });
    }
  }, [selectedWeather?.location]); // Only log when location changes

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-20 z-20 w-[320px]"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-green-600">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-white" />
            <span className="font-semibold text-white">Weather Along Route</span>
          </div>
          <div className="flex items-center gap-1">
            {onRefresh && !isLoading && (
              <button
                onClick={onRefresh}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors group"
                title="Refresh weather data"
                aria-label="Refresh weather data"
              >
                <RefreshCw className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-500" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors group"
              title="Close"
              aria-label="Close weather overlay"
            >
              <X className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-500">Fetching weather data...</span>
              </div>
            </div>
          ) : weatherData.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-sm text-gray-500">No weather data available</span>
            </div>
          ) : (
            <>
              {/* Location Tabs */}
              <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                {weatherData.map((weather, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectLocation(index)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedIndex === index
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {weather.location}
                  </button>
                ))}
              </div>

              {/* Weather Recommendation */}
              {recommendation && (
                <div className={`mb-4 rounded-lg p-3 flex items-center gap-2 ${
                  recommendation.type === 'good' ? 'bg-green-50 border border-green-200' :
                  recommendation.type === 'caution' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <recommendation.icon className={`w-5 h-5 flex-shrink-0 ${
                    recommendation.type === 'good' ? 'text-green-600' :
                    recommendation.type === 'caution' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <span className={`text-sm font-medium ${
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
                  {/* Current Weather */}
                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{selectedWeather.location}</div>
                        <div className="text-4xl font-bold text-gray-900">
                          {Math.round(selectedWeather.current.temperature)}°C
                        </div>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const { icon: WeatherIcon, description, color } = getWeatherInfo(selectedWeather.current.weatherCode);
                          return (
                            <>
                              <WeatherIcon className={`w-12 h-12 ${color}`} />
                              <div className="text-xs text-gray-500 mt-1">{description}</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Weather Details */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                        <Wind className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Wind</div>
                          <div className="text-sm font-medium">{selectedWeather.current.windSpeed} km/h</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-xs text-gray-500">Humidity</div>
                          <div className="text-sm font-medium">{selectedWeather.current.humidity}%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Visibility</div>
                          <div className="text-sm font-medium">{(selectedWeather.current.visibility / 1000).toFixed(1)} km</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                        <Gauge className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Pressure</div>
                          <div className="text-sm font-medium">{selectedWeather.current.pressure} hPa</div>
                        </div>
                      </div>
                    </div>

                    {/* Air Quality */}
                    {selectedWeather.current.airQuality && (
                      <div className="mt-3 bg-white/60 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-gray-700">Air Quality</div>
                          <div className={`text-xs font-medium px-2 py-0.5 rounded ${
                            selectedWeather.current.airQuality.aqi <= 50 ? 'bg-green-100 text-green-700' :
                            selectedWeather.current.airQuality.aqi <= 100 ? 'bg-yellow-100 text-yellow-700' :
                            selectedWeather.current.airQuality.aqi <= 150 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {selectedWeather.current.airQuality.category}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedWeather.current.airQuality.aqi}
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div>PM2.5: {selectedWeather.current.airQuality.pm25} µg/m³</div>
                            <div>PM10: {selectedWeather.current.airQuality.pm10} µg/m³</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confidence & Sources */}
                    {selectedWeather.confidence && (
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {selectedWeather.confidence >= 90 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          ) : selectedWeather.confidence >= 75 ? (
                            <Info className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                          )}
                          <span className="text-gray-600">
                            {selectedWeather.confidence}% confidence
                          </span>
                        </div>
                        {selectedWeather.sources && selectedWeather.sources.length > 0 && (
                          <div className="text-gray-400">
                            {selectedWeather.sources.join(' + ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hourly Forecast */}
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Hourly Forecast</div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedWeather.hourly.slice(0, 8).map((hour, index) => {
                        const { icon: HourIcon, color } = getWeatherInfo(hour.weatherCode);
                        const time = new Date(hour.time).toLocaleTimeString([], { hour: '2-digit' });
                        const hasPrecipitation = hour.precipitation && hour.precipitation > 0;
                        return (
                          <div
                            key={index}
                            className="flex-shrink-0 flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-2 min-w-[50px]"
                          >
                            <div className="text-[10px] text-gray-500">{time}</div>
                            <HourIcon className={`w-5 h-5 ${color}`} />
                            <div className="text-xs font-medium">{Math.round(hour.temperature)}°</div>
                            <div className="flex items-center gap-0.5">
                              <Droplets className={`w-2.5 h-2.5 ${hasPrecipitation ? 'text-blue-600' : 'text-blue-400'}`} />
                              <span className={`text-[9px] ${hasPrecipitation ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                {hour.precipitationProbability}%
                              </span>
                            </div>
                            {hasPrecipitation && (
                              <div className="text-[9px] text-blue-600 font-medium">
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
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              Multi-source weather data
            </span>
            {selectedWeather?.lastUpdated && (
              <span className="text-[10px] text-gray-400">
                Updated {new Date(selectedWeather.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherOverlay;
