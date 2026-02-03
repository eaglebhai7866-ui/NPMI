import { Router, Request, Response, NextFunction } from 'express';
import GraphHopperService from '../services/graphhopper';
import type { RouteRequest } from '../types/routing';
import { routeCache } from '../middleware/cache';
import logger from '../utils/logger';

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

    logger.info('Route request received', { start, end, mode, alternatives });

    // Validation
    if (!start || !end) {
      logger.warn('Invalid request: missing coordinates');
      return res.status(400).json({
        error: 'Invalid request',
        message: 'start and end coordinates are required',
      });
    }

    if (!Array.isArray(start) || start.length !== 2) {
      logger.warn('Invalid request: invalid start format');
      return res.status(400).json({
        error: 'Invalid request',
        message: 'start must be [lng, lat] array',
      });
    }

    if (!Array.isArray(end) || end.length !== 2) {
      logger.warn('Invalid request: invalid end format');
      return res.status(400).json({
        error: 'Invalid request',
        message: 'end must be [lng, lat] array',
      });
    }

    if (!['driving', 'cycling', 'walking'].includes(mode)) {
      logger.warn('Invalid request: invalid mode', { mode });
      return res.status(400).json({
        error: 'Invalid mode',
        message: 'mode must be driving, cycling, or walking',
      });
    }

    // Check cache first
    const useAlternatives = alternatives ?? true;
    const cachedRoutes = routeCache.get(start, end, mode, useAlternatives);
    
    if (cachedRoutes) {
      logger.info('Cache hit', { start, end, mode });
      return res.json({ routes: cachedRoutes, cached: true });
    }

    // Calculate route
    logger.info('Cache miss - calculating route');
    const routes = await graphhopper.calculateRoute({
      start,
      end,
      mode,
      alternatives: useAlternatives,
    });

    // Store in cache
    routeCache.set(start, end, mode, useAlternatives, routes);
    logger.info('Route cached', { routeCount: routes.length });

    res.json({ routes, cached: false });
  } catch (error) {
    logger.error('Route request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    next(error);
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const isHealthy = await graphhopper.healthCheck();
    const cacheStats = routeCache.getStats();

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'error',
      graphhopper: isHealthy ? 'ready' : 'unavailable',
      cache: cacheStats,
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

/**
 * POST /api/cache/clear
 * Clear route cache
 */
router.post('/cache/clear', (_req: Request, res: Response) => {
  routeCache.clear();
  res.json({
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString(),
  });
});

export default router;
