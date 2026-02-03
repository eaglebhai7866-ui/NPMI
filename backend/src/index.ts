import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routingRoutes from './routes/routing';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  
  next();
});

// Routes
app.use('/api', routingRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'NPMI Routing Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      route: 'POST /api/route',
      clearCache: 'POST /api/cache/clear',
    },
  });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info('========================================');
  logger.info('🚀 NPMI Routing Backend');
  logger.info('========================================');
  logger.info(`✅ Server running on http://localhost:${PORT}`);
  logger.info(`📍 GraphHopper: ${process.env.GRAPHHOPPER_URL || 'http://localhost:8989'}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('========================================');
  logger.info('Endpoints:');
  logger.info(`  GET  http://localhost:${PORT}/api/health`);
  logger.info(`  POST http://localhost:${PORT}/api/route`);
  logger.info(`  POST http://localhost:${PORT}/api/cache/clear`);
  logger.info('========================================');
});
