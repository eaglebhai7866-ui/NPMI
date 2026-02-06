import { useState, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type { POI, POICategory } from "../types";
import { poiCategories } from "../constants";

interface UsePOIProps {
  map: maplibregl.Map | null;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Map frontend categories to backend file names
const CATEGORY_MAP: Record<POICategory, string> = {
  hospital: 'hospitals',
  school: 'schools',
  fuel: 'fuel_stations',
  restaurant: 'restaurants',
  mosque: 'mosques',
  bank: 'banks',
  police: 'police',
  park: 'parks',
  hotel: 'hotels',
  shop: 'shops',
};

export const usePOI = ({ map }: UsePOIProps) => {
  const [pois, setPois] = useState<POI[]>([]);
  const [activePOICategories, setActivePOICategories] = useState<Set<POICategory>>(new Set());
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(false);
  const [poiCounts, setPOICounts] = useState<Record<POICategory, number>>({} as Record<POICategory, number>);
  const poiMarkersRef = useRef<maplibregl.Marker[]>([]);
  const mapMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPOIs = useCallback(async (category: POICategory) => {
    if (!map) return [];

    const bounds = map.getBounds();
    const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
    
    const backendCategory = CATEGORY_MAP[category] || category;

    try {
      // Try local backend first - no limit, load all POIs in viewport
      const response = await fetch(`${BACKEND_URL}/api/pois/${backendCategory}?bbox=${bbox}&limit=10000`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update count for this category
        setPOICounts(prev => ({
          ...prev,
          [category]: data.metadata?.returned || data.features.length
        }));
        
        return data.features.map((feature: any) => ({
          id: feature.properties.id,
          type: category,
          name: feature.properties.name || `Unnamed ${poiCategories[category].name.slice(0, -1)}`,
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
        }));
      } else {
        // Fallback to Overpass API if local backend fails
        console.warn(`Local POI backend not available for ${category}, falling back to Overpass API`);
        return await fetchPOIsFromOverpass(category, bbox);
      }
    } catch (error) {
      console.error(`Error fetching ${category} POIs from local backend:`, error);
      // Fallback to Overpass API
      return await fetchPOIsFromOverpass(category, bbox);
    }
  }, [map]);

  const fetchPOIsFromOverpass = async (category: POICategory, bbox: string) => {
    const [west, south, east, north] = bbox.split(',');
    const overpassBbox = `${south},${west},${north},${east}`;
    
    const query = `
      [out:json][timeout:25];
      (
        node[${poiCategories[category].query}](${overpassBbox});
        way[${poiCategories[category].query}](${overpassBbox});
      );
      out center 50;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.json();
      
      return data.elements.map((element: any) => ({
        id: element.id,
        type: category,
        name: element.tags?.name || `Unnamed ${poiCategories[category].name.slice(0, -1)}`,
        lat: element.lat || element.center?.lat,
        lon: element.lon || element.center?.lon,
      })).filter((poi: POI) => poi.lat && poi.lon);
    } catch (error) {
      console.error(`Error fetching ${category} POIs from Overpass:`, error);
      return [];
    }
  };

  const togglePOICategory = useCallback(async (category: POICategory) => {
    const newCategories = new Set(activePOICategories);
    
    if (newCategories.has(category)) {
      newCategories.delete(category);
      setActivePOICategories(newCategories);
      const remainingPois = pois.filter(poi => poi.type !== category);
      setPois(remainingPois);
      
      // Remove count for this category
      setPOICounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[category];
        return newCounts;
      });
    } else {
      newCategories.add(category);
      setActivePOICategories(newCategories);
      
      setIsLoadingPOIs(true);
      const newPOIs = await fetchPOIs(category);
      setPois(prev => [...prev, ...newPOIs]);
      setIsLoadingPOIs(false);
    }
  }, [activePOICategories, pois, fetchPOIs]);

  // Refresh POIs when map moves or zooms
  const refreshPOIs = useCallback(async () => {
    if (activePOICategories.size === 0) return;
    
    setIsLoadingPOIs(true);
    const allPOIs: POI[] = [];
    
    for (const category of Array.from(activePOICategories)) {
      const categoryPOIs = await fetchPOIs(category);
      allPOIs.push(...categoryPOIs);
    }
    
    setPois(allPOIs);
    setIsLoadingPOIs(false);
  }, [activePOICategories, fetchPOIs]);

  const clearAllPOIs = useCallback(() => {
    setActivePOICategories(new Set());
    setPois([]);
    setPOICounts({} as Record<POICategory, number>);
    poiMarkersRef.current.forEach(marker => marker.remove());
    poiMarkersRef.current = [];
  }, []);

  // Listen to map move/zoom events to refresh POIs
  useCallback(() => {
    if (!map) return;

    const handleMapMove = () => {
      if (mapMoveTimeoutRef.current) {
        clearTimeout(mapMoveTimeoutRef.current);
      }

      // Debounce: wait 500ms after user stops moving/zooming
      mapMoveTimeoutRef.current = setTimeout(() => {
        refreshPOIs();
      }, 500);
    };

    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);

    return () => {
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
      if (mapMoveTimeoutRef.current) {
        clearTimeout(mapMoveTimeoutRef.current);
      }
    };
  }, [map, refreshPOIs])();

  // Update POI markers
  const updatePOIMarkers = useCallback(() => {
    if (!map) return;

    poiMarkersRef.current.forEach(marker => marker.remove());
    poiMarkersRef.current = [];

    pois.forEach(poi => {
      const category = poiCategories[poi.type];
      const el = document.createElement("div");
      el.innerHTML = `
        <div class="relative group cursor-pointer">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="background-color: ${category.color}">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              ${getPOIIconSVG(poi.type)}
            </svg>
          </div>
          <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            <div class="bg-gray-900/90 text-white text-xs px-2 py-1 rounded shadow-lg max-w-[200px] truncate">
              ${poi.name}
            </div>
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([poi.lon, poi.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <div class="font-semibold text-sm">${poi.name}</div>
              <div class="text-xs text-gray-500 mt-1 capitalize">${poi.type}</div>
            </div>
          `)
        )
        .addTo(map);

      poiMarkersRef.current.push(marker);
    });
  }, [map, pois]);

  const getPOIIconSVG = (type: POICategory): string => {
    switch (type) {
      case "hospital":
        return '<path d="M8 21h8m-4-9v9m-6-3h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"/><path d="M9 7h6m-3-3v6"/>';
      case "school":
        return '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>';
      case "fuel":
        return '<path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16m0-16l4 4v10a2 2 0 01-2 2M7 8h4m-2 0v4"/>';
      case "restaurant":
        return '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20m14-18v4a4 4 0 01-4 4h-1v10"/>';
      case "mosque":
        return '<path d="M12 2l3 7h7l-5.5 4 2 7-6.5-5-6.5 5 2-7L2 9h7z"/>';
      case "bank":
        return '<path d="M3 21h18M3 10h18M5 6l7-3 7 3M6 10v11M10 10v11M14 10v11M18 10v11"/>';
      case "police":
        return '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>';
      case "park":
        return '<path d="M12 2v20M8 6a4 4 0 018 0M6 12a6 6 0 0012 0"/>';
      case "hotel":
        return '<path d="M3 21h18M3 10h18M5 6l7-3 7 3M6 10v11M18 10v11M9 10v3M15 10v3"/>';
      case "shop":
        return '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/>';
      default:
        return '<circle cx="12" cy="12" r="3"/>';
    }
  };

  return {
    pois,
    activePOICategories,
    isLoadingPOIs,
    poiCounts,
    togglePOICategory,
    clearAllPOIs,
    updatePOIMarkers,
    refreshPOIs,
  };
};
