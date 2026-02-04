/**
 * Weather Service - Multi-source weather data with validation
 * Supports Open-Meteo and OpenWeatherMap APIs
 */

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
  confidence?: number; // 0-100, based on source agreement
  sources?: string[]; // Which APIs provided data
  lastUpdated?: string;
}

interface WeatherSource {
  name: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

// OpenWeatherMap API key (free tier: 1000 calls/day)
const OPENWEATHER_API_KEY = ''; // User can add their own key

/**
 * Fetch weather from Open-Meteo (primary source)
 */
async function fetchOpenMeteo(lat: number, lng: number): Promise<any> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,visibility,pressure_msl` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,precipitation` +
    `&timezone=auto&forecast_days=1`,
    {
      signal: AbortSignal.timeout(10000),
      headers: { 'Accept': 'application/json' }
    }
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('Open-Meteo response sample:', {
    hasPrecipitation: !!data.hourly?.precipitation,
    hourlyFields: Object.keys(data.hourly || {})
  });
  
  return data;
}

/**
 * Fetch air quality from Open-Meteo
 */
async function fetchAirQuality(lat: number, lng: number): Promise<any> {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?` +
      `latitude=${lat}&longitude=${lng}` +
      `&current=pm10,pm2_5,us_aqi` +
      `&timezone=auto`,
      {
        signal: AbortSignal.timeout(5000),
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Fetch weather from OpenWeatherMap (secondary source for validation)
 */
async function fetchOpenWeatherMap(lat: number, lng: number): Promise<any> {
  if (!OPENWEATHER_API_KEY) return null;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?` +
      `lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`,
      {
        signal: AbortSignal.timeout(8000),
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Map OpenWeatherMap condition to WMO weather code
 */
function mapOpenWeatherToWMO(owmCode: number, description: string): number {
  // OpenWeatherMap codes: https://openweathermap.org/weather-conditions
  if (owmCode >= 200 && owmCode < 300) return 95; // Thunderstorm
  if (owmCode >= 300 && owmCode < 400) return 51; // Drizzle
  if (owmCode >= 500 && owmCode < 600) return 61; // Rain
  if (owmCode >= 600 && owmCode < 700) return 71; // Snow
  if (owmCode >= 700 && owmCode < 800) return 45; // Fog/Mist
  if (owmCode === 800) return 0; // Clear
  if (owmCode === 801) return 1; // Few clouds
  if (owmCode === 802) return 2; // Scattered clouds
  if (owmCode >= 803) return 3; // Broken/overcast clouds
  return 1; // Default to partly cloudy
}

/**
 * Calculate confidence score based on source agreement
 */
function calculateConfidence(sources: WeatherSource[]): number {
  if (sources.length === 1) return 75; // Single source = 75% confidence

  // Compare temperatures
  const temps = sources.map(s => s.temperature);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const maxDiff = Math.max(...temps.map(t => Math.abs(t - avgTemp)));

  // If temperatures agree within 2°C, high confidence
  if (maxDiff <= 2) return 95;
  if (maxDiff <= 4) return 85;
  if (maxDiff <= 6) return 75;
  return 65;
}

/**
 * Get AQI category from US AQI value
 */
function getAQICategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Fetch weather from multiple sources and validate
 */
export async function fetchWeatherData(
  lat: number,
  lng: number,
  locationName: string
): Promise<WeatherData> {
  console.log(`[Weather Service] Fetching weather for ${locationName} at (${lat}, ${lng})`);
  
  const sources: WeatherSource[] = [];
  let primaryData: any = null;
  let airQualityData: any = null;

  // Fetch from all sources in parallel
  const [openMeteoData, openWeatherData, aqData] = await Promise.allSettled([
    fetchOpenMeteo(lat, lng),
    fetchOpenWeatherMap(lat, lng),
    fetchAirQuality(lat, lng),
  ]);

  console.log('[Weather Service] API responses:', {
    openMeteo: openMeteoData.status,
    openWeather: openWeatherData.status,
    airQuality: aqData.status
  });

  // Process Open-Meteo (primary)
  if (openMeteoData.status === 'fulfilled' && openMeteoData.value) {
    primaryData = openMeteoData.value;
    sources.push({
      name: 'Open-Meteo',
      temperature: primaryData.current?.temperature_2m || 0,
      weatherCode: primaryData.current?.weather_code || 0,
      windSpeed: primaryData.current?.wind_speed_10m || 0,
      humidity: primaryData.current?.relative_humidity_2m || 0,
    });
    console.log('[Weather Service] Open-Meteo data added to sources');
  } else {
    console.error('[Weather Service] Open-Meteo failed:', openMeteoData.status === 'rejected' ? openMeteoData.reason : 'No data');
  }

  // Process OpenWeatherMap (secondary)
  if (openWeatherData.status === 'fulfilled' && openWeatherData.value) {
    const owmData = openWeatherData.value;
    sources.push({
      name: 'OpenWeatherMap',
      temperature: owmData.main?.temp || 0,
      weatherCode: mapOpenWeatherToWMO(owmData.weather?.[0]?.id || 800, owmData.weather?.[0]?.description || ''),
      windSpeed: (owmData.wind?.speed || 0) * 3.6, // Convert m/s to km/h
      humidity: owmData.main?.humidity || 0,
    });
    console.log('[Weather Service] OpenWeatherMap data added to sources');
  } else {
    console.log('[Weather Service] OpenWeatherMap not available (no API key or failed)');
  }

  // Process Air Quality
  if (aqData.status === 'fulfilled' && aqData.value) {
    airQualityData = aqData.value;
    console.log('[Weather Service] Air quality data received');
  } else {
    console.log('[Weather Service] Air quality data not available');
  }

  // If no data from any source, throw error
  if (sources.length === 0) {
    console.error('[Weather Service] No data from any source!');
    throw new Error('Failed to fetch weather data from all sources');
  }

  console.log(`[Weather Service] Total sources: ${sources.length}`);

  // Calculate average values from all sources
  const avgTemp = sources.reduce((sum, s) => sum + s.temperature, 0) / sources.length;
  const avgWind = sources.reduce((sum, s) => sum + s.windSpeed, 0) / sources.length;
  const avgHumidity = sources.reduce((sum, s) => sum + s.humidity, 0) / sources.length;

  // Use primary data for detailed info, or first available source
  const detailSource = primaryData || sources[0];
  
  // Calculate confidence
  const confidence = calculateConfidence(sources);

  // Build weather data object
  const weatherData: WeatherData = {
    location: locationName,
    coordinates: [lng, lat],
    current: {
      temperature: Math.round(avgTemp * 10) / 10, // Round to 1 decimal
      weatherCode: sources[0].weatherCode, // Use primary source for weather code
      windSpeed: Math.round(avgWind * 10) / 10,
      humidity: Math.round(avgHumidity),
      visibility: primaryData?.current?.visibility || 10000,
      pressure: primaryData?.current?.pressure_msl || 1013,
    },
    hourly: (primaryData?.hourly?.time || []).slice(0, 24).map((time: string, i: number) => ({
      time,
      temperature: primaryData?.hourly?.temperature_2m?.[i] || 0,
      weatherCode: primaryData?.hourly?.weather_code?.[i] || 0,
      precipitationProbability: primaryData?.hourly?.precipitation_probability?.[i] || 0,
      precipitation: primaryData?.hourly?.precipitation?.[i] || 0, // May be 0 if not available
    })),
    confidence,
    sources: sources.map(s => s.name),
    lastUpdated: new Date().toISOString(),
  };

  // Add air quality if available
  if (airQualityData?.current) {
    const aqi = airQualityData.current.us_aqi || 0;
    console.log('Air quality data received:', { aqi, pm25: airQualityData.current.pm2_5, pm10: airQualityData.current.pm10 });
    weatherData.current.airQuality = {
      aqi: Math.round(aqi),
      pm25: Math.round(airQualityData.current.pm2_5 || 0),
      pm10: Math.round(airQualityData.current.pm10 || 0),
      category: getAQICategory(aqi),
    };
  } else {
    console.log('No air quality data available for this location');
  }

  console.log('Weather data prepared:', {
    location: locationName,
    confidence,
    sources: sources.map(s => s.name),
    hasAirQuality: !!weatherData.current.airQuality
  });

  return weatherData;
}

/**
 * Fetch location name from coordinates
 */
export async function fetchLocationName(lat: number, lng: number, index: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'NPMI-MapApp/1.0' }
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return data.address?.city || 
             data.address?.town || 
             data.address?.village || 
             data.address?.county || 
             `Point ${index + 1}`;
    }
  } catch {
    // Silently fail
  }
  return `Point ${index + 1}`;
}

/**
 * Get optimal number of sample points based on route length
 */
export function getOptimalSamplePoints(routeLength: number): number {
  // routeLength is number of coordinate points
  if (routeLength < 50) return 3;
  if (routeLength < 100) return 5;
  if (routeLength < 200) return 8;
  if (routeLength < 500) return 10;
  return 12; // Maximum 12 points
}
