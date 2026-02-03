import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routingRoutes from './routes/routing';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'NPMI Routing Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      route: 'POST /api/route',
    },
  });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 NPMI Routing Backend');
  console.log('========================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 GraphHopper: ${process.env.GRAPHHOPPER_URL || 'http://localhost:8989'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================');
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  POST http://localhost:${PORT}/api/route`);
  console.log('========================================');
});
