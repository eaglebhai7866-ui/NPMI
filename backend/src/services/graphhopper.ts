import axios, { AxiosInstance } from 'axios';
import type {
  RouteRequest,
  RouteInfo,
  NavigationStep,
  GraphHopperResponse,
  GraphHopperInstruction,
} from '../types/routing';

class GraphHopperService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8989') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Calculate route using GraphHopper
   */
  async calculateRoute(request: RouteRequest): Promise<RouteInfo[]> {
    const profile = this.getProfile(request.mode);
    const maxPaths = request.alternatives ? 3 : 1;

    try {
      const params: any = {
        profile,
        locale: 'en',
        instructions: true,
        calc_points: true,
        points_encoded: false,
        algorithm: 'alternative_route',  // Explicitly request alternative route algorithm
        'alternative_route.max_paths': maxPaths,
        'alternative_route.max_weight_factor': 2.0,
        'alternative_route.max_share_factor': 0.8,
      };

      // Add points as separate parameters (GraphHopper expects multiple 'point' params)
      const response = await this.client.get<GraphHopperResponse>('/route', {
        params,
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          
          // Add start and end points
          searchParams.append('point', `${request.start[1]},${request.start[0]}`);
          searchParams.append('point', `${request.end[1]},${request.end[0]}`);
          
          // Add other params
          Object.keys(params).forEach(key => {
            if (key !== 'point') {
              searchParams.append(key, params[key]);
            }
          });
          
          return searchParams.toString();
        },
      });

      return this.transformResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `GraphHopper error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Health check for GraphHopper server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Map travel mode to GraphHopper profile
   */
  private getProfile(mode: string): string {
    const profileMap: Record<string, string> = {
      driving: 'car',
      cycling: 'bike',
      walking: 'foot',
    };
    return profileMap[mode] || 'car';
  }

  /**
   * Transform GraphHopper response to our format
   */
  private transformResponse(data: GraphHopperResponse): RouteInfo[] {
    return data.paths.map((path) => ({
      distance: path.distance,
      duration: path.time / 1000, // Convert ms to seconds
      geometry: {
        type: 'LineString' as const,
        coordinates: path.points.coordinates,
      },
      steps: this.transformInstructions(path.instructions, path.points.coordinates),
    }));
  }

  /**
   * Transform GraphHopper instructions to navigation steps
   */
  private transformInstructions(
    instructions: GraphHopperInstruction[],
    coordinates: number[][]
  ): NavigationStep[] {
    return instructions.map((instruction, index) => {
      const maneuverType = this.getManeuverType(instruction.sign);
      const maneuverModifier = this.getManeuverModifier(instruction.sign);
      
      // Get location from interval or use coordinate index
      let location: [number, number] = [0, 0];
      if (instruction.interval && instruction.interval[0] < coordinates.length) {
        const coord = coordinates[instruction.interval[0]];
        location = [coord[0], coord[1]];
      } else if (index < coordinates.length) {
        const coord = coordinates[index];
        location = [coord[0], coord[1]];
      }

      return {
        instruction: instruction.text,
        distance: instruction.distance,
        duration: instruction.time / 1000, // Convert ms to seconds
        maneuver: {
          type: maneuverType,
          modifier: maneuverModifier,
          location,
        },
        name: instruction.street_name || '',
      };
    });
  }

  /**
   * Map GraphHopper sign codes to maneuver types
   */
  private getManeuverType(sign: number): string {
    // GraphHopper sign codes:
    // https://github.com/graphhopper/graphhopper/blob/master/docs/core/turn-instructions.md
    const signMap: Record<number, string> = {
      '-98': 'arrive',      // Arrived at destination (left)
      '-8': 'arrive',       // Arrived at destination (right)
      '-7': 'continue',     // Keep left
      '-6': 'roundabout',   // Roundabout
      '-3': 'turn',         // Sharp left
      '-2': 'turn',         // Left
      '-1': 'turn',         // Slight left
      0: 'continue',        // Continue straight
      1: 'turn',            // Slight right
      2: 'turn',            // Right
      3: 'turn',            // Sharp right
      4: 'depart',          // Depart
      5: 'depart',          // Depart (alternative)
      6: 'roundabout',      // Roundabout
      7: 'continue',        // Keep right
      8: 'arrive',          // Arrived
      98: 'arrive',         // Arrived (alternative)
    };
    return signMap[sign] || 'continue';
  }

  /**
   * Map GraphHopper sign codes to maneuver modifiers
   */
  private getManeuverModifier(sign: number): string | undefined {
    if (sign === -3) return 'sharp left';
    if (sign === -2) return 'left';
    if (sign === -1) return 'slight left';
    if (sign === 0) return 'straight';
    if (sign === 1) return 'slight right';
    if (sign === 2) return 'right';
    if (sign === 3) return 'sharp right';
    if (sign === -7) return 'left';
    if (sign === 7) return 'right';
    return undefined;
  }
}

export default GraphHopperService;
