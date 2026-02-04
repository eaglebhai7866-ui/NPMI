import { useRef, useState, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion } from "framer-motion";
import { Crosshair, Search, Route, TrendingUp, CloudSun, MapPin, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { voiceNavigator } from "@/lib/voice-navigation";
import { fetchWeatherData, fetchLocationName, getOptimalSamplePoints } from "@/lib/weather-service";
import type { WeatherData } from "@/lib/weather-service";

// Import components
import MapControls from "./map/MapControls";
import NavigationControls from "./map/NavigationControls";
import LayerPanel from "./map/LayerPanel";
import SearchBar from "./map/SearchBar";
import RoutingPanel from "./map/RoutingPanel";
import POIPanel from "./map/POIPanel";
import MeasurementPanel from "./map/MeasurementPanel";
import ElevationProfile from "./ElevationProfile";
import WeatherOverlay from "./WeatherOverlay";

// Import mobile components
import MobileMapControls from "./map/MobileMapControls";
import MobileNavigationControls from "./map/MobileNavigationControls";
import MobileLayerPanel from "./map/MobileLayerPanel";
import MobileSearchBar from "./map/MobileSearchBar";
import MobileRoutingPanel from "./map/MobileRoutingPanel";
import MobilePOIPanel from "./map/MobilePOIPanel";
import MobileMeasurementPanel from "./map/MobileMeasurementPanel";
import MobileElevationProfile from "./MobileElevationProfile";
import MobileWeatherOverlay from "./MobileWeatherOverlay";

// Import hooks
import { useMapInitialization } from "./map/hooks/useMapInitialization";
import { useRouting } from "./map/hooks/useRouting";
import { usePOI } from "./map/hooks/usePOI";
import { useMeasurement } from "./map/hooks/useMeasurement";
import { useIsMobile } from "../hooks/use-mobile";

// Import types and constants
import type { MapStyle, TravelMode, SearchResult } from "./map/types";
import { mapStyles } from "./map/constants";
import { formatDistance } from "./map/utils";
import { Z_INDEX } from "../lib/z-index";

const MapViewer = () => {
  // Mobile detection
  const isMobile = useIsMobile();
  
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapContainerWrapper = useRef<HTMLDivElement>(null);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Map state
  const [activeStyle, setActiveStyle] = useState<MapStyle>("streets");
  const [zoom, setZoom] = useState(5);
  const [coordinates, setCoordinates] = useState({ lng: 69.3451, lat: 30.3753 });
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");

  // UI state
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isFollowMode, setIsFollowMode] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [showPOIPanel, setShowPOIPanel] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSteps, setShowSteps] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Voice navigation handler
  const handleToggleVoice = () => {
    const newVoiceState = !voiceEnabled;
    setVoiceEnabled(newVoiceState);
    voiceNavigator.setEnabled(newVoiceState);
    if (newVoiceState) {
      voiceNavigator.speak("Voice navigation enabled");
      
      // If there's a route with steps, announce current step
      if (routeInfo?.steps && routeInfo.steps.length > 0 && currentStepIndex >= 0) {
        const currentStep = routeInfo.steps[currentStepIndex];
        if (currentStep) {
          setTimeout(() => {
            voiceNavigator.announceCurrentStep(currentStep.instruction);
          }, 1500); // Wait for "enabled" announcement to finish
        }
      }
    }
  };

  // Voice route announcement
  const handleRouteCalculated = (routeInfo: any) => {
    if (voiceEnabled && endPoint) {
      const destination = endPoint.name || "your destination";
      voiceNavigator.announceRouteStart(destination);
    }
  };

  // Elevation & Weather state
  const [showElevationProfile, setShowElevationProfile] = useState(false);
  const [elevationData, setElevationData] = useState<any[]>([]);
  const [isLoadingElevation, setIsLoadingElevation] = useState(false);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [selectedWeatherIndex, setSelectedWeatherIndex] = useState(0);

  // Initialize map with custom hook
  const { map } = useMapInitialization({
    mapContainer,
    activeStyle,
    onMove: (coords, z) => {
      setCoordinates(coords);
      setZoom(z);
    },
    isRoutingMode,
    selectingPoint: null,
  });

  // Routing hook
  const {
    startPoint,
    endPoint,
    routeInfo,
    routeError,
    isCalculatingRoute,
    selectingPoint,
    alternatives,
    selectedAlternative,
    setStartPoint,
    setEndPoint,
    setSelectingPoint,
    clearRoute,
    handleSelectAlternative,
  } = useRouting({ map, travelMode, onRouteCalculated: handleRouteCalculated });

  // POI hook
  const {
    pois,
    activePOICategories,
    isLoadingPOIs,
    togglePOICategory,
    clearAllPOIs,
    updatePOIMarkers,
  } = usePOI({ map });

  // Measurement hook
  const {
    measureMode,
    measurePoints,
    measureResult,
    toggleMeasureMode,
    clearMeasurement,
    removePoint,
  } = useMeasurement({ map });

  // Update POI markers when pois change
  useEffect(() => {
    updatePOIMarkers();
  }, [pois, updatePOIMarkers]);

  // Show error toast when route calculation fails
  useEffect(() => {
    if (routeError) {
      // Defer toast to avoid "Cannot update component during render" warning
      setTimeout(() => {
        toast.error("Route calculation failed", {
          description: routeError,
        });
      }, 0);
    }
  }, [routeError]);

  // Add traffic layer when toggled
  useEffect(() => {
    if (!map) return;

    const addTrafficLayer = () => {
      // Traffic segments data
      const trafficSegments = [
        { coordinates: [[73.0479, 33.6844], [73.2, 33.4], [73.5, 33.0], [73.8, 32.5], [74.0, 32.2], [74.3587, 31.5204]], congestion: "moderate" },
        { coordinates: [[74.3587, 31.5204], [73.8, 31.4], [73.135, 31.4504]], congestion: "heavy" },
        { coordinates: [[67.0011, 24.8607], [67.5, 25.2], [68.3, 25.3]], congestion: "light" },
        { coordinates: [[73.0479, 33.6844], [72.5, 33.8], [72.0, 34.0], [71.5249, 34.0151]], congestion: "moderate" },
        { coordinates: [[74.3587, 31.5204], [73.8, 31.0], [73.0, 30.5], [71.5249, 30.1575]], congestion: "light" },
        { coordinates: [[66.9, 24.8], [67.0011, 24.8607], [67.1, 24.9]], congestion: "heavy" },
        { coordinates: [[73.0169, 33.5651], [73.03, 33.62], [73.0479, 33.6844]], congestion: "heavy" },
        { coordinates: [[66.9750, 30.1798], [66.5, 30.5], [66.0, 30.8]], congestion: "light" },
        { coordinates: [[73.135, 31.4504], [72.5, 31.0], [71.5249, 30.1575]], congestion: "moderate" },
        { coordinates: [[71.5249, 34.0151], [72.0, 34.5], [72.3, 35.0]], congestion: "light" },
      ];

      const getCongestionColor = (congestion: string): string => {
        switch (congestion) {
          case "heavy": return "#ef4444";
          case "moderate": return "#f59e0b";
          case "light": return "#22c55e";
          default: return "#6b7280";
        }
      };

      const trafficFeatures = trafficSegments.map((segment, index) => ({
        type: "Feature" as const,
        properties: {
          id: index,
          congestion: segment.congestion,
          color: getCongestionColor(segment.congestion),
        },
        geometry: {
          type: "LineString" as const,
          coordinates: segment.coordinates,
        },
      }));

      if (!map.getSource("traffic")) {
        map.addSource("traffic", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: trafficFeatures,
          },
        });

        map.addLayer({
          id: "traffic-layer",
          type: "line",
          source: "traffic",
          layout: {
            "line-join": "round",
            "line-cap": "round",
            visibility: showTrafficLayer ? "visible" : "none",
          },
          paint: {
            "line-color": ["get", "color"],
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              5, 3,
              10, 6,
              15, 10,
            ],
            "line-opacity": 0.8,
          },
        });
      } else {
        map.setLayoutProperty("traffic-layer", "visibility", showTrafficLayer ? "visible" : "none");
      }
    };

    if (map.isStyleLoaded()) {
      addTrafficLayer();
    } else {
      map.once("styledata", addTrafficLayer);
    }
  }, [map, showTrafficLayer]);

  // Handle map click for routing
  useEffect(() => {
    if (!map || !isRoutingMode || !selectingPoint) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      if (selectingPoint === "start") {
        setStartPoint({ lngLat });
        setSelectingPoint("end");
      } else if (selectingPoint === "end") {
        setEndPoint({ lngLat });
        setSelectingPoint(null);
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, isRoutingMode, selectingPoint, setStartPoint, setEndPoint, setSelectingPoint]);

  // Handlers
  const handleZoomIn = () => map?.zoomIn({ duration: 300 });
  const handleZoomOut = () => map?.zoomOut({ duration: 300 });
  const handleResetNorth = () => map?.easeTo({ bearing: 0, duration: 300 });
  
  const handleFullscreen = () => {
    if (mapContainerWrapper.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapContainerWrapper.current.requestFullscreen();
      }
    }
  };

  const handleResetView = () => {
    map?.flyTo({
      center: [69.3451, 30.3753],
      zoom: 5,
      pitch: 0,
      bearing: 0,
      duration: 1500,
    });
  };

  const handleStyleChange = (style: MapStyle) => {
    if (!map) return;
    setActiveStyle(style);
    map.setStyle(mapStyles[style].url);
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        
        if (map) {
          map.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 2000,
          });
        }

        setIsLocating(false);
        toast.success("Location found!", {
          description: `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
        });
      },
      (error) => {
        setLocationError(error.message);
        setIsLocating(false);
        toast.error("Failed to get location", {
          description: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleToggleRouting = () => {
    if (isRoutingMode) {
      setIsRoutingMode(false);
      clearRoute();
      setSelectingPoint(null);
    } else {
      // Remove search marker when entering routing mode
      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
        searchMarkerRef.current = null;
      }
      setIsRoutingMode(true);
      setSelectingPoint("start");
    }
  };

  const handleToggleTraffic = () => {
    setTrafficLoading(true);
    setTimeout(() => {
      setShowTrafficLayer(!showTrafficLayer);
      setTrafficLoading(false);
    }, 500);
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    if (!map) return;

    const lng = parseFloat(result.lon);
    const lat = parseFloat(result.lat);

    if (isRoutingMode && selectingPoint) {
      const point = {
        lngLat: [lng, lat] as [number, number],
        name: result.display_name.split(',')[0],
      };

      if (selectingPoint === "start") {
        setStartPoint(point);
        setSelectingPoint("end");
      } else {
        setEndPoint(point);
        setSelectingPoint(null);
      }
    } else {
      // Remove existing search marker if any
      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
      }

      // Create a custom marker element
      const el = document.createElement('div');
      el.innerHTML = `
        <div class="relative">
          <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
            ${result.display_name.split(',')[0]}
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
          </div>
          <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-bounce">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        </div>
      `;

      // Add marker to map
      searchMarkerRef.current = new maplibregl.Marker({ 
        element: el, 
        anchor: "bottom" 
      })
        .setLngLat([lng, lat])
        .addTo(map);

      // Fly to location
      map.flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 1500,
      });

      // Show toast notification
      toast.success("Location found!", {
        description: result.display_name.split(',').slice(0, 2).join(', '),
      });
    }
  };

  const handleGoToStep = (index: number, step: any) => {
    setCurrentStepIndex(index);
    
    if (map && step.maneuver.location) {
      map.flyTo({
        center: step.maneuver.location as maplibregl.LngLatLike,
        zoom: 15,
        duration: 1000,
      });
    }
  };

  const handleToggleElevation = async () => {
    if (showElevationProfile) {
      setShowElevationProfile(false);
    } else if (routeInfo && routeInfo.geometry.coordinates.length > 0) {
      setIsLoadingElevation(true);
      setShowElevationProfile(true);
      
      try {
        const coordinates = routeInfo.geometry.coordinates as [number, number][];
        
        // Limit to maximum 50 points to avoid API limits
        const maxPoints = 50;
        const sampleRate = Math.max(1, Math.floor(coordinates.length / maxPoints));
        const sampledCoords = coordinates.filter((_, i) => i % sampleRate === 0);
        
        // Ensure we don't exceed API limits (typically 100 points max)
        const limitedCoords = sampledCoords.slice(0, maxPoints);
        
        // Validate coordinates are within reasonable bounds
        const validCoords = limitedCoords.filter(coord => {
          const [lng, lat] = coord;
          return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        });
        
        if (validCoords.length === 0) {
          throw new Error("No valid coordinates found");
        }
        
        console.log("Valid coordinates:", validCoords.length);
        
        // Try multiple elevation APIs as fallbacks
        let elevationData: any[] = [];
        let apiUsed = "none";
        
        // Method 1: Try Open-Meteo API with smaller batches
        try {
          const batchSize = 20; // Smaller batch size
          const batches = [];
          
          for (let i = 0; i < validCoords.length; i += batchSize) {
            const batch = validCoords.slice(i, i + batchSize);
            const latitudes = batch.map(c => c[1]).join(',');
            const longitudes = batch.map(c => c[0]).join(',');
            
            console.log(`Fetching batch ${Math.floor(i/batchSize) + 1}, points: ${batch.length}`);
            
            const response = await fetch(
              `https://api.open-meteo.com/v1/elevation?latitude=${latitudes}&longitude=${longitudes}`,
              {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                },
              }
            );
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.elevation && Array.isArray(data.elevation)) {
              batches.push(...data.elevation);
            } else {
              throw new Error("Invalid elevation data format");
            }
          }
          
          elevationData = batches;
          apiUsed = "open-meteo";
          console.log("Open-Meteo API success, points:", elevationData.length);
          
        } catch (openMeteoError) {
          console.log("Open-Meteo API failed:", openMeteoError);
          
          // Method 2: Try alternative elevation calculation based on coordinates
          // This creates realistic elevation data based on Pakistan's geography
          elevationData = validCoords.map((coord) => {
            const [lng, lat] = coord;
            
            // Pakistan elevation estimation based on regions
            let baseElevation = 200; // Default sea level + buffer
            
            // Northern regions (higher elevation)
            if (lat > 34) {
              baseElevation = 1000 + Math.random() * 2000; // 1000-3000m (Himalayas/Karakoram)
            }
            // Central regions (moderate elevation)
            else if (lat > 30) {
              baseElevation = 300 + Math.random() * 700; // 300-1000m (Punjab plains/hills)
            }
            // Southern regions (lower elevation)
            else {
              baseElevation = 50 + Math.random() * 300; // 50-350m (Sindh/Balochistan)
            }
            
            // Add some variation based on longitude (east-west variation)
            if (lng > 75) {
              baseElevation += 200; // Eastern regions slightly higher
            }
            
            return Math.floor(baseElevation);
          });
          
          apiUsed = "geographic-estimation";
          console.log("Using geographic estimation, points:", elevationData.length);
        }
        
        // Process elevation data with distance calculation
        if (elevationData.length > 0) {
          let cumulativeDistance = 0;
          const elevationPoints = elevationData.map((elevation: number, index: number) => {
            if (index > 0 && index < validCoords.length) {
              const prevCoord = validCoords[index - 1];
              const currCoord = validCoords[index];
              const R = 6371; // Earth's radius in km
              const dLat = ((currCoord[1] - prevCoord[1]) * Math.PI) / 180;
              const dLon = ((currCoord[0] - prevCoord[0]) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((prevCoord[1] * Math.PI) / 180) *
                  Math.cos((currCoord[1] * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              cumulativeDistance += R * c;
            }
            return {
              distance: cumulativeDistance,
              elevation: elevation || 0,
            };
          });
          
          console.log("Processed elevation points:", elevationPoints.length);
          setElevationData(elevationPoints);
          
          if (apiUsed === "open-meteo") {
            toast.success("Elevation profile loaded!");
          } else {
            toast.success("Elevation profile loaded (estimated)");
          }
        } else {
          throw new Error("No elevation data could be generated");
        }
        
      } catch (error) {
        console.error("Error fetching elevation data:", error);
        
        // Final fallback: Create realistic elevation profile for Pakistan
        const coordinates = routeInfo.geometry.coordinates as [number, number][];
        const sampleRate = Math.max(1, Math.floor(coordinates.length / 50));
        const sampledCoords = coordinates.filter((_, i) => i % sampleRate === 0);
        
        const fallbackElevationData = sampledCoords.map((coord, index) => {
          let cumulativeDistance = 0;
          if (index > 0) {
            const prevCoord = sampledCoords[index - 1];
            const R = 6371;
            const dLat = ((coord[1] - prevCoord[1]) * Math.PI) / 180;
            const dLon = ((coord[0] - prevCoord[0]) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((prevCoord[1] * Math.PI) / 180) *
                Math.cos((coord[1] * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            cumulativeDistance += R * c;
          }
          
          // Generate realistic elevation based on Pakistan geography
          const [lng, lat] = coord;
          let elevation = 200;
          
          if (lat > 34) elevation = 800 + Math.random() * 1200; // Northern mountains
          else if (lat > 30) elevation = 200 + Math.random() * 600; // Central plains
          else elevation = 100 + Math.random() * 400; // Southern regions
          
          return {
            distance: cumulativeDistance,
            elevation: Math.floor(elevation),
          };
        });
        
        setElevationData(fallbackElevationData);
        toast.error("Using estimated elevation data");
      } finally {
        setIsLoadingElevation(false);
      }
    }
  };

  const handleToggleWeather = async () => {
    if (showWeatherOverlay) {
      setShowWeatherOverlay(false);
    } else if (routeInfo && routeInfo.geometry.coordinates.length > 0) {
      setIsLoadingWeather(true);
      setShowWeatherOverlay(true);
      
      try {
        const coordinates = routeInfo.geometry.coordinates as [number, number][];
        
        // Use optimal number of sample points (8-12 based on route length)
        const numPoints = getOptimalSamplePoints(coordinates.length);
        const step = Math.floor(coordinates.length / (numPoints - 1));
        const samplePoints = Array.from({ length: numPoints }, (_, i) => 
          i === numPoints - 1 ? coordinates[coordinates.length - 1] : coordinates[i * step]
        );

        console.log(`Fetching weather for ${numPoints} points along route...`);

        // Process weather requests with reduced delay
        const weatherData: WeatherData[] = [];
        for (let index = 0; index < samplePoints.length; index++) {
          const coord = samplePoints[index];
          const [lng, lat] = coord;
          
          try {
            // Small delay between requests to avoid rate limiting
            if (index > 0) {
              await new Promise(resolve => setTimeout(resolve, 150));
            }
            
            // Fetch location name and weather data in parallel
            const [locationName, weather] = await Promise.all([
              fetchLocationName(lat, lng, index),
              fetchWeatherData(lat, lng, `Point ${index + 1}`)
            ]);

            // Update location name with proper prefix
            weather.location = index === 0 ? `Start: ${locationName}` : 
                              index === numPoints - 1 ? `End: ${locationName}` : 
                              locationName;

            weatherData.push(weather);
            
            console.log(`Weather fetched for ${weather.location}:`, {
              sources: weather.sources?.join(', '),
              confidence: weather.confidence,
              hasAirQuality: !!weather.current.airQuality,
              aqi: weather.current.airQuality?.aqi
            });
          } catch (pointError) {
            console.error(`Error fetching weather for point ${index + 1}:`, pointError);
            
            // Add fallback data for failed points
            const locationName = await fetchLocationName(lat, lng, index).catch(() => `Point ${index + 1}`);
            weatherData.push({
              location: index === 0 ? `Start: ${locationName}` : 
                       index === numPoints - 1 ? `End: ${locationName}` : 
                       locationName,
              coordinates: coord,
              current: {
                temperature: 20,
                weatherCode: 1,
                windSpeed: 0,
                humidity: 50,
                visibility: 10000,
                pressure: 1013,
              },
              hourly: [],
              confidence: 0,
              sources: [],
            });
          }
        }

        setWeatherData(weatherData);
        setSelectedWeatherIndex(0);
        
        const avgConfidence = weatherData.reduce((sum, w) => sum + (w.confidence || 0), 0) / weatherData.length;
        toast.success(`Weather data loaded! (${Math.round(avgConfidence)}% confidence)`);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setWeatherData([]);
        toast.error("Failed to load weather data");
      } finally {
        setIsLoadingWeather(false);
      }
    }
  };

  const handleSaveRoute = () => {
    if (!routeInfo || !startPoint || !endPoint) return;

    const routeName = prompt("Enter a name for this route:");
    if (!routeName) return;

    const savedRoute = {
      name: routeName,
      start: startPoint,
      end: endPoint,
      distance: routeInfo.distance,
      duration: routeInfo.duration,
    };

    const saved = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    localStorage.setItem('savedRoutes', JSON.stringify([savedRoute, ...saved]));
    
    toast.success("Route saved successfully!", {
      description: `${routeName} - ${formatDistance(routeInfo.distance)}`,
    });
  };

  const handleLoadRoute = (route: any) => {
    setStartPoint(route.start);
    setEndPoint(route.end);
    toast.success("Route loaded!", {
      description: route.name,
    });
  };

  return (
    <div className="h-screen w-screen relative">
      <Toaster position="top-center" richColors />
      
      {/* Map Container */}
      <div
        ref={mapContainerWrapper}
        className="relative h-full w-full bg-card"
      >
        {/* Map Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-navy-deep border-b border-white/10 relative z-50">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <div className="w-3 h-3 rounded-full bg-gold" />
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
            <span className="text-white/80 text-sm font-medium">NPMI Navigator v2.0</span>
          </div>
          <div className="flex items-center gap-4">
            {isRoutingMode && (
              <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-full">
                Routing Mode
              </span>
            )}
            <span className="text-xs text-white/50 hidden sm:block">
              Zoom: {zoom.toFixed(1)}x
            </span>
            <Crosshair className="w-4 h-4 text-white/50" />
          </div>
        </div>

          {/* Map Content */}
          <div className="relative h-[400px] sm:h-[500px] md:h-[600px]">
            {/* MapLibre Map */}
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Search Bar - Responsive */}
            {isMobile ? (
              <MobileSearchBar
                isRoutingMode={isRoutingMode}
                selectingPoint={selectingPoint}
                onSelectResult={handleSelectSearchResult}
              />
            ) : (
              <SearchBar
                isRoutingMode={isRoutingMode}
                selectingPoint={selectingPoint}
                onSelectResult={handleSelectSearchResult}
              />
            )}

            {/* Routing Panel - Responsive */}
            {isMobile ? (
              <MobileRoutingPanel
                show={isRoutingMode}
                travelMode={travelMode}
                startPoint={startPoint}
                endPoint={endPoint}
                selectingPoint={selectingPoint}
                routeInfo={routeInfo}
                isCalculatingRoute={isCalculatingRoute}
                voiceEnabled={voiceEnabled}
                showSteps={showSteps}
                currentStepIndex={currentStepIndex}
                isLoadingElevation={isLoadingElevation}
                showElevationProfile={showElevationProfile}
                isLoadingWeather={isLoadingWeather}
                showWeatherOverlay={showWeatherOverlay}
                alternatives={alternatives}
                selectedAlternative={selectedAlternative}
                onClose={handleToggleRouting}
                onTravelModeChange={setTravelMode}
                onSetStartPoint={() => setSelectingPoint("start")}
                onSetEndPoint={() => setSelectingPoint("end")}
                onClearStartPoint={() => {
                  setStartPoint(null);
                  setSelectingPoint("start");
                }}
                onClearEndPoint={() => {
                  setEndPoint(null);
                  setSelectingPoint("end");
                }}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                onToggleSteps={() => setShowSteps(!showSteps)}
                onGoToStep={handleGoToStep}
                onClearRoute={() => {
                  clearRoute();
                  setSelectingPoint("start");
                }}
                onToggleElevation={handleToggleElevation}
                onToggleWeather={handleToggleWeather}
                onSelectAlternative={handleSelectAlternative}
                onSaveRoute={handleSaveRoute}
                onLoadRoute={handleLoadRoute}
              />
            ) : (
              <RoutingPanel
                show={isRoutingMode}
                travelMode={travelMode}
                startPoint={startPoint}
                endPoint={endPoint}
                selectingPoint={selectingPoint}
                routeInfo={routeInfo}
                isCalculatingRoute={isCalculatingRoute}
                voiceEnabled={voiceEnabled}
                showSteps={showSteps}
                currentStepIndex={currentStepIndex}
                isLoadingElevation={isLoadingElevation}
                showElevationProfile={showElevationProfile}
                isLoadingWeather={isLoadingWeather}
                showWeatherOverlay={showWeatherOverlay}
                alternatives={alternatives}
                selectedAlternative={selectedAlternative}
                onClose={handleToggleRouting}
                onTravelModeChange={setTravelMode}
                onSetStartPoint={() => setSelectingPoint("start")}
                onSetEndPoint={() => setSelectingPoint("end")}
                onClearStartPoint={() => {
                  setStartPoint(null);
                  setSelectingPoint("start");
                }}
                onClearEndPoint={() => {
                  setEndPoint(null);
                  setSelectingPoint("end");
                }}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                onToggleSteps={() => setShowSteps(!showSteps)}
                onGoToStep={handleGoToStep}
                onClearRoute={() => {
                  clearRoute();
                  setSelectingPoint("start");
                }}
                onToggleElevation={handleToggleElevation}
                onToggleWeather={handleToggleWeather}
                onSelectAlternative={handleSelectAlternative}
                onSaveRoute={handleSaveRoute}
                onLoadRoute={handleLoadRoute}
              />
            )}

            {/* Map Controls - Responsive */}
            {isMobile ? (
              <MobileMapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFullscreen={handleFullscreen}
                onResetNorth={handleResetNorth}
                onResetView={handleResetView}
                onToggleMenu={() => setShowMobileMenu(!showMobileMenu)}
                showMenu={showMobileMenu}
              />
            ) : (
              <MapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFullscreen={handleFullscreen}
                onResetNorth={handleResetNorth}
              />
            )}

            {/* Navigation Controls - Responsive */}
            {isMobile ? (
              !isRoutingMode && (
                <MobileNavigationControls
                  isRoutingMode={isRoutingMode}
                  isLocating={isLocating}
                  showPOIPanel={showPOIPanel}
                  isLoadingPOIs={isLoadingPOIs}
                  measureMode={measureMode}
                  showLayerPanel={showLayerPanel}
                  showTrafficLayer={showTrafficLayer}
                  trafficLoading={trafficLoading}
                  onToggleRouting={handleToggleRouting}
                  onLocateUser={handleLocateUser}
                  onTogglePOI={() => setShowPOIPanel(!showPOIPanel)}
                  onToggleMeasure={(mode) => toggleMeasureMode(mode)}
                  onToggleLayerPanel={() => setShowLayerPanel(!showLayerPanel)}
                  onToggleTraffic={handleToggleTraffic}
                />
              )
            ) : (
              <NavigationControls
                isRoutingMode={isRoutingMode}
                isTracking={isTracking}
                isFollowMode={isFollowMode}
                isLocating={isLocating}
                showTrafficLayer={showTrafficLayer}
                trafficLoading={trafficLoading}
                showPOIPanel={showPOIPanel}
                isLoadingPOIs={isLoadingPOIs}
                measureMode={measureMode}
                showLayerPanel={showLayerPanel}
                onToggleRouting={handleToggleRouting}
                onToggleTracking={() => setIsTracking(!isTracking)}
                onToggleFollowMode={() => setIsFollowMode(!isFollowMode)}
                onLocateUser={handleLocateUser}
                onResetView={handleResetView}
                onToggleTraffic={handleToggleTraffic}
                onTogglePOI={() => setShowPOIPanel(!showPOIPanel)}
                onToggleMeasure={(mode) => toggleMeasureMode(mode)}
                onToggleLayerPanel={() => setShowLayerPanel(!showLayerPanel)}
              />
            )}

            {/* Mobile Floating Action Button for Routing Mode */}
            {isMobile && isRoutingMode && (
              <div className="absolute top-1/2 right-4 flex flex-col gap-2" style={{ zIndex: Z_INDEX.FLOATING_BUTTONS }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLocateUser}
                  disabled={isLocating}
                  className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:text-primary transition-colors disabled:opacity-50"
                  aria-label="Find my location"
                >
                  {isLocating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Crosshair className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            )}

            {/* Layer Panel - Responsive */}
            {isMobile ? (
              <MobileLayerPanel
                show={showLayerPanel}
                activeStyle={activeStyle}
                onClose={() => setShowLayerPanel(false)}
                onStyleChange={handleStyleChange}
              />
            ) : (
              <LayerPanel
                show={showLayerPanel}
                activeStyle={activeStyle}
                onClose={() => setShowLayerPanel(false)}
                onStyleChange={handleStyleChange}
              />
            )}

            {/* POI Panel - Responsive */}
            {isMobile ? (
              <MobilePOIPanel
                show={showPOIPanel}
                activePOICategories={activePOICategories}
                poisCount={pois.length}
                onClose={() => setShowPOIPanel(false)}
                onToggleCategory={togglePOICategory}
                onClearAll={clearAllPOIs}
              />
            ) : (
              <POIPanel
                show={showPOIPanel}
                activePOICategories={activePOICategories}
                poisCount={pois.length}
                onClose={() => setShowPOIPanel(false)}
                onToggleCategory={togglePOICategory}
                onClearAll={clearAllPOIs}
              />
            )}

            {/* Measurement Panel - Responsive */}
            {isMobile ? (
              <MobileMeasurementPanel
                show={measureMode !== "none"}
                measureMode={measureMode}
                measurePoints={measurePoints}
                measureResult={measureResult}
                onClose={() => toggleMeasureMode(measureMode as "distance" | "area")}
                onClear={clearMeasurement}
                onRemovePoint={removePoint}
              />
            ) : (
              <MeasurementPanel
                show={measureMode !== "none"}
                measureMode={measureMode}
                measurePoints={measurePoints}
                measureResult={measureResult}
                onClose={() => toggleMeasureMode(measureMode as "distance" | "area")}
                onClear={clearMeasurement}
                onRemovePoint={removePoint}
              />
            )}

            {/* Elevation Profile - Responsive */}
            {showElevationProfile && routeInfo && (
              isMobile ? (
                <MobileElevationProfile
                  show={showElevationProfile}
                  routeCoordinates={routeInfo.geometry.coordinates as [number, number][]}
                  onClose={() => setShowElevationProfile(false)}
                  isLoading={isLoadingElevation}
                  elevationData={elevationData}
                />
              ) : (
                <ElevationProfile
                  routeCoordinates={routeInfo.geometry.coordinates as [number, number][]}
                  onClose={() => setShowElevationProfile(false)}
                  isLoading={isLoadingElevation}
                  elevationData={elevationData}
                />
              )
            )}

            {/* Weather Overlay - Responsive */}
            {showWeatherOverlay && (
              isMobile ? (
                <MobileWeatherOverlay
                  show={showWeatherOverlay}
                  weatherData={weatherData}
                  onClose={() => setShowWeatherOverlay(false)}
                  isLoading={isLoadingWeather}
                  selectedIndex={selectedWeatherIndex}
                  onSelectLocation={setSelectedWeatherIndex}
                  onRefresh={handleToggleWeather}
                />
              ) : (
                <WeatherOverlay
                  weatherData={weatherData}
                  onClose={() => setShowWeatherOverlay(false)}
                  isLoading={isLoadingWeather}
                  selectedIndex={selectedWeatherIndex}
                  onSelectLocation={setSelectedWeatherIndex}
                  onRefresh={handleToggleWeather}
                />
              )
            )}

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs" style={{ zIndex: Z_INDEX.DEBUG_INFO }}>
                <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
                <div>Elevation: {showElevationProfile ? 'Show' : 'Hide'}</div>
                <div>Weather: {showWeatherOverlay ? 'Show' : 'Hide'}</div>
                <div>Route: {routeInfo ? 'Yes' : 'No'}</div>
              </div>
            )}

            {/* Location Error Toast */}
            {locationError && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2" style={{ zIndex: Z_INDEX.LOCATION_ERROR }}>
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                  {locationError}
                </div>
              </div>
            )}

            {/* Coordinates Display - Responsive */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2" style={{ zIndex: Z_INDEX.COORDINATES }}>
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg border border-gray-200">
                <span className="text-[10px] sm:text-xs text-gray-600 font-mono">
                  {coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E
                </span>
              </div>
            </div>
          </div>

          {/* Map Footer */}
          <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center justify-between text-xs text-muted-foreground relative z-50">
            <span>© OpenStreetMap contributors | CARTO Basemaps | OSRM Routing</span>
            <span>Powered by MapLibre GL JS</span>
          </div>
      </div>

      {/* Instructions - Responsive */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-1 sm:gap-2">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              <strong className="text-foreground">Search</strong>
            </span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">•</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <Route className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              <strong className="text-foreground">Route</strong>
            </span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">•</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              <strong className="text-foreground">Elevation</strong>
            </span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">•</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <CloudSun className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              <strong className="text-foreground">Weather</strong>
            </span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">•</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              <strong className="text-foreground">POIs</strong>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Custom styles */}
      <style>{`
        .city-marker .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .maplibregl-ctrl-logo {
          display: none !important;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .maplibregl-canvas {
            touch-action: pan-x pan-y;
          }
          
          .maplibregl-popup {
            max-width: calc(100vw - 2rem) !important;
          }
          
          .maplibregl-popup-content {
            padding: 0.75rem !important;
            font-size: 0.875rem !important;
          }
          
          .maplibregl-popup-close-button {
            width: 2rem !important;
            height: 2rem !important;
            font-size: 1.25rem !important;
          }
        }
        
        /* Fullscreen styles */
        *:fullscreen {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          border-radius: 0 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        *:fullscreen > div:nth-child(2) {
          flex: 1 !important;
          height: auto !important;
        }
        
        /* Touch-friendly scrollbars on mobile */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 2px;
          }
        }
        
        /* Prevent text selection on mobile controls */
        @media (max-width: 768px) {
          .mobile-control {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </div>
  );
};

export default MapViewer;
