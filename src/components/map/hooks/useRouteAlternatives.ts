import { useState, useCallback } from "react";
import type { RoutePoint, RouteInfo, TravelMode } from "../types";
import { travelModes } from "../constants";
import { formatManeuver } from "../utils";
import { calculateLocalRoute, checkLocalBackendHealth } from "../../../lib/routing-api";

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
      // Check if local backend is available
      const isLocalAvailable = await checkLocalBackendHealth();
      
      if (!isLocalAvailable) {
        throw new Error('Local routing backend is not available. Please make sure GraphHopper and the backend API are running.');
      }

      console.log('Using local GraphHopper backend');
      
      const routes = await calculateLocalRoute(startPoint, endPoint, travelMode, true);
      console.log(`Local backend returned ${routes.length} route(s)`);
      
      // Transform to RouteAlternative format
      const processedRoutes: RouteAlternative[] = routes.map((route, index) => {
        // Determine route type
        let type: "fastest" | "shortest" | "balanced" = "balanced";
        if (index === 0) {
          type = "fastest";
        } else if (routes.length > 1) {
          const firstRoute = routes[0];
          if (route.distance < firstRoute.distance * 0.95) {
            type = "shortest";
          }
        }

        // Calculate savings compared to first route
        const savings = index > 0 ? {
          time: routes[0].duration - route.duration,
          distance: routes[0].distance - route.distance,
        } : undefined;

        return {
          ...route,
          type,
          savings,
        };
      });

      console.log('Processed local routes:', processedRoutes);
      setAlternatives(processedRoutes);
      setSelectedAlternative(0);
      return processedRoutes[0];
    } catch (error) {
      console.error('Error calculating route:', error);
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Cannot find point')) {
          throw new Error('Route not found. The selected location may be outside the coverage area or not accessible by road.');
        } else if (error.message.includes('not available')) {
          throw new Error('Local routing backend is not available. Please start GraphHopper and the backend API.');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          throw new Error('Unable to connect to routing backend. Please check if the backend is running on port 3001.');
        } else {
          throw error;
        }
      }
      throw new Error('Failed to calculate route. Please try again.');
    } finally {
      setIsCalculating(false);
    }
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
