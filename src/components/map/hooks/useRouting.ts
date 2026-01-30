import { useState, useRef, useEffect, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type { RoutePoint, RouteInfo, TravelMode } from "../types";
import { useRouteAlternatives } from "./useRouteAlternatives";

interface UseRoutingProps {
  map: maplibregl.Map | null;
  travelMode: TravelMode;
  onRouteCalculated?: (routeInfo: RouteInfo) => void;
}

export const useRouting = ({ map, travelMode, onRouteCalculated }: UseRoutingProps) => {
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [selectingPoint, setSelectingPoint] = useState<"start" | "end" | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  
  const startMarker = useRef<maplibregl.Marker | null>(null);
  const endMarker = useRef<maplibregl.Marker | null>(null);
  const isCalculatingRef = useRef(false); // Prevent duplicate calculations
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Debounce timer

  // Use route alternatives hook
  const {
    alternatives,
    selectedAlternative,
    isCalculating: isCalculatingRoute,
    calculateAlternatives,
    selectAlternative,
  } = useRouteAlternatives({ travelMode });

  // Draw route on map
  const drawRoute = useCallback((geometry: GeoJSON.LineString) => {
    if (!map) return;

    // Remove existing route
    if (map.getSource("route")) {
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getLayer("route-line-outline")) map.removeLayer("route-line-outline");
      map.removeSource("route");
    }

    // Add route source and layers
    map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry,
      },
    });

    map.addLayer({
      id: "route-line-outline",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#1e40af",
        "line-width": 8,
        "line-opacity": 0.5,
      },
    });

    map.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 5,
      },
    });
  }, [map]);

  // Calculate route when both points are set
  useEffect(() => {
    // Clear any pending calculation
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }

    const calculateRoute = async () => {
      if (!startPoint || !endPoint || !map) return;
      
      // Prevent duplicate calculations
      if (isCalculatingRef.current) {
        console.log('Route calculation already in progress, skipping...');
        return;
      }

      isCalculatingRef.current = true;
      setRouteError(null); // Clear previous errors

      try {
        const route = await calculateAlternatives(startPoint, endPoint);
        
        if (route) {
          setRouteInfo(route);
          drawRoute(route.geometry);
          
          // Update marker positions to match actual route start/end (snapped to roads)
          const coordinates = route.geometry.coordinates as [number, number][];
          if (coordinates.length > 0) {
            const actualStart = coordinates[0];
            const actualEnd = coordinates[coordinates.length - 1];
            
            // Update start marker to actual route start
            if (startMarker.current) {
              startMarker.current.setLngLat(actualStart as maplibregl.LngLatLike);
            }
            
            // Update end marker to actual route end
            if (endMarker.current) {
              endMarker.current.setLngLat(actualEnd as maplibregl.LngLatLike);
            }
          }
          
          // Call voice callback if provided
          if (onRouteCalculated) {
            onRouteCalculated(route);
          }

          // Fit map to route
          const bounds = coordinates.reduce(
            (bounds, coord) => bounds.extend(coord as maplibregl.LngLatLike),
            new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
          );
          map.fitBounds(bounds, { padding: 80, duration: 1000 });
        } else {
          setRouteError('No route found between these points');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to calculate route';
        setRouteError(errorMessage);
        console.error('Route calculation failed:', error);
      } finally {
        isCalculatingRef.current = false;
      }
    };

    if (startPoint && endPoint && map) {
      // Debounce route calculation by 300ms
      calculationTimeoutRef.current = setTimeout(() => {
        calculateRoute();
      }, 300);
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startPoint, endPoint, map, travelMode]); // Only depend on the actual data, not the functions

  // Handle alternative route selection
  const handleSelectAlternative = useCallback((index: number) => {
    const route = selectAlternative(index);
    if (route && map) {
      setRouteInfo(route);
      drawRoute(route.geometry);

      // Update marker positions to match actual route start/end
      const coordinates = route.geometry.coordinates as [number, number][];
      if (coordinates.length > 0) {
        const actualStart = coordinates[0];
        const actualEnd = coordinates[coordinates.length - 1];
        
        // Update start marker to actual route start
        if (startMarker.current) {
          startMarker.current.setLngLat(actualStart as maplibregl.LngLatLike);
        }
        
        // Update end marker to actual route end
        if (endMarker.current) {
          endMarker.current.setLngLat(actualEnd as maplibregl.LngLatLike);
        }
      }

      // Fit map to route
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord as maplibregl.LngLatLike),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.fitBounds(bounds, { padding: 80, duration: 1000 });
    }
  }, [selectAlternative, map, drawRoute]);

  // Update markers when points change
  useEffect(() => {
    if (!map) return;

    // Update start marker
    if (startPoint) {
      if (startMarker.current) {
        startMarker.current.setLngLat(startPoint.lngLat);
      } else {
        const el = document.createElement("div");
        el.innerHTML = `
          <div class="relative">
            <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <span class="text-white text-sm font-bold">A</span>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rotate-45"></div>
          </div>
        `;
        startMarker.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(startPoint.lngLat)
          .addTo(map);
      }
    } else if (startMarker.current) {
      startMarker.current.remove();
      startMarker.current = null;
    }

    // Update end marker
    if (endPoint) {
      if (endMarker.current) {
        endMarker.current.setLngLat(endPoint.lngLat);
      } else {
        const el = document.createElement("div");
        el.innerHTML = `
          <div class="relative">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <span class="text-white text-sm font-bold">B</span>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
          </div>
        `;
        endMarker.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(endPoint.lngLat)
          .addTo(map);
      }
    } else if (endMarker.current) {
      endMarker.current.remove();
      endMarker.current = null;
    }
  }, [startPoint, endPoint, map]);

  const clearRoute = useCallback(() => {
    if (map) {
      if (map.getSource("route")) {
        if (map.getLayer("route-line")) map.removeLayer("route-line");
        if (map.getLayer("route-line-outline")) map.removeLayer("route-line-outline");
        map.removeSource("route");
      }
    }
    
    startMarker.current?.remove();
    startMarker.current = null;
    endMarker.current?.remove();
    endMarker.current = null;
    
    setStartPoint(null);
    setEndPoint(null);
    setRouteInfo(null);
    setRouteError(null);
    setSelectingPoint("start");
  }, [map]);

  return {
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
  };
};
