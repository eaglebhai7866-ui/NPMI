/**
 * Routing API Client
 * Handles communication with local GraphHopper backend or fallback to OSRM
 */

import type { RoutePoint, RouteInfo } from '../components/map/types';

const LOCAL_API_URL = 'http://localhost:3001/api';
// Always use local routing - no fallback to OSRM

interface LocalRouteRequest {
  start: [number, number];
  end: [number, number];
  mode: 'driving' | 'cycling' | 'walking';
  alternatives?: boolean;
}

interface LocalRouteResponse {
  routes: RouteInfo[];
}

/**
 * Check if local routing backend is available
 */
export async function checkLocalBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${LOCAL_API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.status === 'ok' && data.graphhopper === 'ready';
    }
    return false;
  } catch (error) {
    console.warn('Local routing backend not available:', error);
    return false;
  }
}

/**
 * Calculate route using local GraphHopper backend
 */
export async function calculateLocalRoute(
  startPoint: RoutePoint,
  endPoint: RoutePoint,
  mode: 'driving' | 'cycling' | 'walking',
  alternatives: boolean = true
): Promise<RouteInfo[]> {
  const request: LocalRouteRequest = {
    start: startPoint.lngLat,
    end: endPoint.lngLat,
    mode,
    alternatives,
  };

  const response = await fetch(`${LOCAL_API_URL}/route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(30000), // 30 second timeout
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const data: LocalRouteResponse = await response.json();
  
  if (!data.routes || data.routes.length === 0) {
    throw new Error('No routes found');
  }

  return data.routes;
}
