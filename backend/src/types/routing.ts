export interface RouteRequest {
  start: [number, number]; // [lng, lat]
  end: [number, number];   // [lng, lat]
  mode: 'driving' | 'cycling' | 'walking';
  alternatives?: boolean;
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
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
  steps: NavigationStep[];
}

export interface RouteResponse {
  routes: RouteInfo[];
}

// GraphHopper API types
export interface GraphHopperInstruction {
  text: string;
  distance: number;
  time: number;
  sign: number;
  street_name?: string;
  interval?: [number, number];
}

export interface GraphHopperPath {
  distance: number;
  time: number;
  points: {
    type: string;
    coordinates: number[][];
  };
  instructions: GraphHopperInstruction[];
  snapped_waypoints?: {
    type: string;
    coordinates: number[][];
  };
}

export interface GraphHopperResponse {
  paths: GraphHopperPath[];
  info: {
    copyrights: string[];
    took: number;
  };
}
