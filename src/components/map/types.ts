export type MapStyle = "streets" | "satellite" | "terrain" | "osm";
export type TravelMode = "driving" | "cycling" | "walking";
export type POICategory = "hospital" | "school" | "fuel" | "restaurant";
export type MeasureMode = "none" | "distance" | "area";

export interface RoutePoint {
  lngLat: [number, number];
  name?: string;
}

export interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
  name: string;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
  steps: NavigationStep[];
}

export interface POI {
  id: number;
  type: POICategory;
  name: string;
  lat: number;
  lon: number;
}

export interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  importance: number;
}

export interface ElevationPoint {
  distance: number;
  elevation: number;
}
