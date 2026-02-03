import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { MapStyle } from "../types";
import { mapStyles, pakistanCities } from "../constants";

interface UseMapInitializationProps {
  mapContainer: React.RefObject<HTMLDivElement>;
  activeStyle: MapStyle;
  onMove?: (coordinates: { lng: number; lat: number }, zoom: number) => void;
  isRoutingMode?: boolean;
  selectingPoint?: "start" | "end" | null;
  onCityClick?: (coordinates: [number, number], name: string) => void;
}

export const useMapInitialization = ({
  mapContainer,
  activeStyle,
  onMove,
  isRoutingMode,
  selectingPoint,
  onCityClick,
}: UseMapInitializationProps) => {
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Pakistan bounds: [minLng, minLat, maxLng, maxLat]
    const pakistanBounds: [number, number, number, number] = [
      60.872, // West (Balochistan border)
      23.634, // South (Arabian Sea coast)
      77.840, // East (Kashmir border)
      37.097  // North (Gilgit-Baltistan)
    ];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyles[activeStyle].url,
      center: [69.3451, 30.3753], // Center of Pakistan
      zoom: 5,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      maxBounds: pakistanBounds, // Restrict map to Pakistan
      minZoom: 5, // Prevent zooming out too far
      maxZoom: 18, // Allow detailed zoom
    });

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.current.addControl(
      new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }),
      "bottom-right"
    );

    if (onMove) {
      map.current.on("move", () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        onMove({ lng: center.lng, lat: center.lat }, map.current.getZoom());
      });
    }

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
  const addCityMarkers = () => {
    if (!map.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    pakistanCities.forEach((city) => {
      const el = document.createElement("div");
      el.className = "city-marker";
      el.innerHTML = `
        <div class="relative group cursor-pointer">
          <div class="absolute -inset-2 bg-emerald-500/30 rounded-full animate-ping"></div>
          <div class="relative w-4 h-4 ${city.type === "capital" ? "bg-amber-500" : "bg-emerald-500"} rounded-full border-2 border-white shadow-lg"></div>
          <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            <div class="bg-gray-900/90 text-white text-xs px-2 py-1 rounded shadow-lg">
              ${city.name}${city.type === "capital" ? " ★" : ""}
            </div>
          </div>
        </div>
      `;

      if (onCityClick) {
        el.addEventListener("click", (e) => {
          if (isRoutingMode && selectingPoint) {
            e.stopPropagation();
            onCityClick(city.coordinates, city.name);
          }
        });
      }

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(city.coordinates)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  };

  // Re-add markers when routing mode changes
  useEffect(() => {
    if (map.current?.isStyleLoaded()) {
      addCityMarkers();
    }
  }, [isRoutingMode, selectingPoint]);

  return { map: map.current, markersRef };
};
