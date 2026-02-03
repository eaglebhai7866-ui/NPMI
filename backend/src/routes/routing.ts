import { Router, Request, Response, NextFunction } from 'express';
import GraphHopperService from '../services/graphhopper';
import type { RouteRequest } from '../types/routing';

const router = Router();
const graphhopper = new GraphHopperService(
  process.env.GRAPHHOPPER_URL || 'http://localhost:8989'
);

/**
 * POST /api/route
 * Calculate route between two points
 */
router.post('/route', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end, mode, alternatives }: RouteRequest = req.body;

    // Validation
    if (!start || !end) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'start and end coordinates are required',
      });
    }

    if (!Array.isArray(start) || start.length !== 2) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'start must be [lng, lat] array',
      });
    }

    if (!Array.isArray(end) || end.length !== 2) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'end must be [lng, lat] array',
      });
    }

    if (!['driving', 'cycling', 'walking'].includes(mode)) {
      return res.status(400).json({
        error: 'Invalid mode',
        message: 'mode must be driving, cycling, or walking',
      });
    }

    // Calculate route
    const routes = await graphhopper.calculateRoute({
      start,
      end,
      mode,
      alternatives: alternatives ?? true,
    });

    res.json({ routes });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await graphhopper.healthCheck();

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'error',
      graphhopper: isHealthy ? 'ready' : 'unavailable',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      graphhopper: 'unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
