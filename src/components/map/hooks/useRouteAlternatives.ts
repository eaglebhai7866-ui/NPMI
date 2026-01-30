import { useState, useCallback } from "react";
import type { RoutePoint, RouteInfo, TravelMode } from "../types";
import { travelModes } from "../constants";
import { formatManeuver } from "../utils";

interface RouteAlternative extends RouteInfo {
  type: "fastest" | "shortest" | "balanced";
  savings?: {
    time?: number;
    distance?: number;
  };
}

interface UseRouteAlternativesProps {
  travelMode: TravelMode;
}

export const useRouteAlternatives = ({ travelMode }: UseRouteAlternativesProps) => {
  const [alternatives, setAlternatives] = useState<RouteAlternative[]>([]);
  const [selectedAlternative, setSelectedAlternative] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateAlternatives = useCallback(async (
    startPoint: RoutePoint,
    endPoint: RoutePoint,
    retryCount = 0
  ) => {
    setIsCalculating(true);
    setAlternatives([]);

    try {
      const profile = travelModes[travelMode].profile;
      const url = `https://router.project-osrm.org/route/v1/${profile}/${startPoint.lngLat[0]},${startPoint.lngLat[1]};${endPoint.lngLat[0]},${endPoint.lngLat[1]}?alternatives=2&overview=full&geometries=geojson&steps=true`;
      
      console.log(`Fetching route alternatives (attempt ${retryCount + 1}):`, url);
      
      // Add timeout to prevent hanging - increased to 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('OSRM Response:', data);

      if (data.code === "Ok" && data.routes.length > 0) {
        console.log(`Found ${data.routes.length} route(s)`);
        
        const processedRoutes: RouteAlternative[] = data.routes.map((route: any, index: number) => {
          const geometry = route.geometry as GeoJSON.LineString;
          
          const steps = [];
          if (route.legs && route.legs.length > 0) {
            route.legs.forEach((leg: any) => {
              if (leg.steps) {
                leg.steps.forEach((step: any) => {
                  steps.push({
                    instruction: step.maneuver?.instruction || formatManeuver(step.maneuver?.type, step.maneuver?.modifier, step.name),
                    distance: step.distance,
                    duration: step.duration,
                    maneuver: {
                      type: step.maneuver?.type || 'continue',
                      modifier: step.maneuver?.modifier,
                      location: step.maneuver?.location,
                    },
                    name: step.name || 'Unnamed road',
                  });
                });
              }
            });
          }

          // Determine route type
          let type: "fastest" | "shortest" | "balanced" = "balanced";
          if (index === 0) {
            type = "fastest"; // First route is usually fastest
          } else if (data.routes.length > 1) {
            const firstRoute = data.routes[0];
            if (route.distance < firstRoute.distance * 0.95) {
              type = "shortest";
            }
          }

          // Calculate savings compared to first route
          const savings = index > 0 ? {
            time: data.routes[0].duration - route.duration,
            distance: data.routes[0].distance - route.distance,
          } : undefined;

          return {
            distance: route.distance,
            duration: route.duration,
            geometry,
            steps,
            type,
            savings,
          };
        });

        console.log('Processed routes:', processedRoutes);
        setAlternatives(processedRoutes);
        setSelectedAlternative(0);
        return processedRoutes[0];
      } else {
        const errorMsg = data.message || 'No routes found';
        console.error('OSRM returned no routes or error:', data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error(`Error calculating alternatives (attempt ${retryCount + 1}):`, error);
      
      // Retry logic - retry up to 2 times on timeout or network errors
      if (retryCount < 2) {
        if (error instanceof Error) {
          if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
            console.log(`Retrying route calculation (${retryCount + 1}/2)...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            return calculateAlternatives(startPoint, endPoint, retryCount + 1);
          }
        }
      }
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Route calculation timed out after multiple attempts. The routing service may be slow or unavailable.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to routing service. Please check your internet connection.');
        } else {
          throw error;
        }
      }
      throw new Error('Failed to calculate route. Please try again.');
    } finally {
      setIsCalculating(false);
    }

    return null;
  }, [travelMode]);

  const selectAlternative = useCallback((index: number) => {
    if (index >= 0 && index < alternatives.length) {
      setSelectedAlternative(index);
      return alternatives[index];
    }
    return null;
  }, [alternatives]);

  return {
    alternatives,
    selectedAlternative,
    isCalculating,
    calculateAlternatives,
    selectAlternative,
  };
};
