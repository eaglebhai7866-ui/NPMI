import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  Layers,
  Navigation,
  Crosshair,
  Maximize2,
  LocateFixed,
  Compass,
  Loader2,
} from "lucide-react";

type MapStyle = "streets" | "satellite" | "terrain";

const mapStyles: Record<MapStyle, { name: string; url: string }> = {
  streets: {
    name: "Streets",
    url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  satellite: {
    name: "Satellite",
    url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  terrain: {
    name: "Terrain",
    url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
};

// Major cities of Pakistan
const pakistanCities = [
  { name: "Islamabad", coordinates: [73.0479, 33.6844] as [number, number], type: "capital" },
  { name: "Lahore", coordinates: [74.3587, 31.5204] as [number, number], type: "city" },
  { name: "Karachi", coordinates: [67.0011, 24.8607] as [number, number], type: "city" },
  { name: "Peshawar", coordinates: [71.5249, 34.0151] as [number, number], type: "city" },
  { name: "Quetta", coordinates: [66.9750, 30.1798] as [number, number], type: "city" },
  { name: "Faisalabad", coordinates: [73.1350, 31.4504] as [number, number], type: "city" },
  { name: "Multan", coordinates: [71.5249, 30.1575] as [number, number], type: "city" },
  { name: "Rawalpindi", coordinates: [73.0169, 33.5651] as [number, number], type: "city" },
];

const MapViewer = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [activeStyle, setActiveStyle] = useState<MapStyle>("streets");
  const [zoom, setZoom] = useState(5);
  const [coordinates, setCoordinates] = useState({ lng: 69.3451, lat: 30.3753 });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyles[activeStyle].url,
      center: [69.3451, 30.3753], // Center of Pakistan
      zoom: 5,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    // Add attribution control
    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    // Add scale control
    map.current.addControl(
      new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }),
      "bottom-right"
    );

    // Update state on map move
    map.current.on("move", () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      setCoordinates({ lng: center.lng, lat: center.lat });
      setZoom(map.current.getZoom());
    });

    // Add city markers after style loads
    map.current.on("load", () => {
      addCityMarkers();
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add city markers
  const addCityMarkers = useCallback(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    pakistanCities.forEach((city) => {
      const el = document.createElement("div");
      el.className = "city-marker";
      el.innerHTML = `
        <div class="relative group cursor-pointer">
          <div class="absolute -inset-2 bg-emerald-500/30 rounded-full animate-ping"></div>
          <div class="relative w-4 h-4 ${city.type === "capital" ? "bg-amber-500" : "bg-emerald-500"} rounded-full border-2 border-white shadow-lg"></div>
          <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <div class="bg-gray-900/90 text-white text-xs px-2 py-1 rounded shadow-lg">
              ${city.name}${city.type === "capital" ? " ★" : ""}
            </div>
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(city.coordinates)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, []);

  // Change map style
  const handleStyleChange = (style: MapStyle) => {
    if (!map.current) return;
    setActiveStyle(style);
    map.current.setStyle(mapStyles[style].url);
    
    // Re-add markers after style change
    map.current.once("styledata", () => {
      addCityMarkers();
      if (userMarker.current) {
        const lngLat = userMarker.current.getLngLat();
        userMarker.current.remove();
        userMarker.current = createUserMarker(lngLat);
      }
    });
  };

  // Create user location marker
  const createUserMarker = (lngLat: maplibregl.LngLatLike) => {
    const el = document.createElement("div");
    el.innerHTML = `
      <div class="relative">
        <div class="absolute -inset-3 bg-blue-500/30 rounded-full animate-pulse"></div>
        <div class="relative w-5 h-5 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `;
    
    return new maplibregl.Marker({ element: el })
      .setLngLat(lngLat)
      .addTo(map.current!);
  };

  // Zoom controls
  const handleZoomIn = () => map.current?.zoomIn({ duration: 300 });
  const handleZoomOut = () => map.current?.zoomOut({ duration: 300 });

  // Reset view to Pakistan
  const handleResetView = () => {
    map.current?.flyTo({
      center: [69.3451, 30.3753],
      zoom: 5,
      pitch: 0,
      bearing: 0,
      duration: 1500,
    });
  };

  // Reset bearing (north up)
  const handleResetNorth = () => {
    map.current?.easeTo({ bearing: 0, duration: 300 });
  };

  // Get user location
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        
        if (map.current) {
          // Remove existing user marker
          if (userMarker.current) {
            userMarker.current.remove();
          }

          // Add new user marker
          userMarker.current = createUserMarker([longitude, latitude]);

          // Fly to user location
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 2000,
          });
        }

        setIsLocating(false);
      },
      (error) => {
        setLocationError(error.message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Toggle fullscreen
  const handleFullscreen = () => {
    if (mapContainer.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapContainer.current.requestFullscreen();
      }
    }
  };

  return (
    <section className="py-20 bg-secondary" id="map-demo">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Live Map Platform
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            Interactive Map Viewer
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time tile rendering with MapLibre GL JS. Pan, zoom, and explore Pakistan's geography 
            with smooth controls and GPS location support.
          </p>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card max-w-6xl mx-auto"
        >
          {/* Map Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-navy-deep border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-gold" />
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <span className="text-white/80 text-sm font-medium">NPMI Map Viewer v2.0</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/50 hidden sm:block">
                Zoom: {zoom.toFixed(1)}x
              </span>
              <Crosshair className="w-4 h-4 text-white/50" />
            </div>
          </div>

          {/* Map Content */}
          <div className="relative h-[550px]">
            {/* MapLibre Map */}
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Zoom Controls */}
            <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
              <button
                onClick={handleZoomIn}
                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-primary hover:text-white transition-all border border-gray-200"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-primary hover:text-white transition-all border border-gray-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={handleFullscreen}
                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-primary hover:text-white transition-all border border-gray-200"
                title="Fullscreen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleResetNorth}
                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-primary hover:text-white transition-all border border-gray-200"
                title="Reset North"
              >
                <Compass className="w-5 h-5" />
              </button>
            </div>

            {/* Layer Controls */}
            <div className="absolute left-4 top-4 z-10">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-1 flex flex-col gap-1 shadow-lg border border-gray-200">
                {(Object.keys(mapStyles) as MapStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => handleStyleChange(style)}
                    className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                      activeStyle === style
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {mapStyles[style].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute left-4 bottom-20 flex flex-col gap-2 z-10">
              <button
                onClick={handleLocateUser}
                disabled={isLocating}
                className={`p-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg transition-all border border-gray-200 ${
                  isLocating ? "bg-blue-50" : "hover:bg-primary hover:text-white"
                }`}
                title="My Location"
              >
                {isLocating ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <LocateFixed className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleResetView}
                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-primary hover:text-white transition-all border border-gray-200"
                title="Reset to Pakistan"
              >
                <Navigation className="w-5 h-5" />
              </button>
              <button
                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-primary hover:text-white transition-all border border-gray-200"
                title="Layers"
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>

            {/* Location Error Toast */}
            {locationError && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                  {locationError}
                </div>
              </div>
            )}

            {/* Coordinates Display */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200">
                <span className="text-xs text-gray-600 font-mono">
                  {coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E
                </span>
              </div>
            </div>
          </div>

          {/* Map Footer */}
          <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>© OpenStreetMap contributors | CARTO Basemaps</span>
            <span>Powered by MapLibre GL JS</span>
          </div>
        </motion.div>
      </div>

      {/* Custom marker styles */}
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
      `}</style>
    </section>
  );
};

export default MapViewer;
