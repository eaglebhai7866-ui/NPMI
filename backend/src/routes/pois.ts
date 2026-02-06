import express from 'express';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

const router = express.Router();

// Path to POI data directory
const POI_DATA_DIR = path.join(__dirname, '../../data/pois');

// Cache for loaded POI data
const poiCache: Map<string, any> = new Map();

/**
 * Get available POI categories
 */
router.get('/categories', (_req, res) => {
  try {
    if (!fs.existsSync(POI_DATA_DIR)) {
      return res.json({
        categories: [],
        message: 'POI data not extracted yet. Run: node backend/scripts/extract-pois-simple.js'
      });
    }

    const files = fs.readdirSync(POI_DATA_DIR);
    const categories = files
      .filter(file => file.endsWith('.geojson'))
      .map(file => file.replace('.geojson', ''));

    res.json({
      categories,
      dataDir: POI_DATA_DIR
    });
  } catch (error) {
    logger.error('Error getting POI categories:', error);
    res.status(500).json({ error: 'Failed to get POI categories' });
  }
});

/**
 * Get POIs by category with optional bounding box filter
 */
router.get('/:category', (req, res) => {
  try {
    const { category } = req.params;
    const { bbox, limit = '1000' } = req.query;

    const filePath = path.join(POI_DATA_DIR, `${category}.geojson`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Category not found',
        message: `POI category "${category}" does not exist. Run extraction script first.`
      });
    }

    // Load from cache or file
    let geojson;
    if (poiCache.has(category)) {
      geojson = poiCache.get(category);
      logger.info(`Loaded ${category} POIs from cache`);
    } else {
      const data = fs.readFileSync(filePath, 'utf-8');
      geojson = JSON.parse(data);
      poiCache.set(category, geojson);
      logger.info(`Loaded ${category} POIs from file (${geojson.features.length} features)`);
    }

    let features = geojson.features;

    // Filter by bounding box if provided
    if (bbox) {
      const [minLon, minLat, maxLon, maxLat] = bbox.toString().split(',').map(Number);
      
      features = features.filter((feature: any) => {
        const [lon, lat] = feature.geometry.coordinates;
        return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
      });
    }

    // Apply limit
    const maxLimit = parseInt(limit as string, 10);
    if (features.length > maxLimit) {
      features = features.slice(0, maxLimit);
    }

    res.json({
      type: 'FeatureCollection',
      features,
      metadata: {
        category,
        total: geojson.features.length,
        returned: features.length,
        filtered: !!bbox
      }
    });

  } catch (error) {
    logger.error('Error getting POIs:', error);
    res.status(500).json({ error: 'Failed to get POIs' });
  }
});

/**
 * Search POIs by name
 */
router.get('/:category/search', (req, res) => {
  try {
    const { category } = req.params;
    const { q, limit = '50' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const filePath = path.join(POI_DATA_DIR, `${category}.geojson`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Load from cache or file
    let geojson;
    if (poiCache.has(category)) {
      geojson = poiCache.get(category);
    } else {
      const data = fs.readFileSync(filePath, 'utf-8');
      geojson = JSON.parse(data);
      poiCache.set(category, geojson);
    }

    // Search by name (case-insensitive)
    const searchTerm = q.toString().toLowerCase();
    let features = geojson.features.filter((feature: any) => {
      const name = feature.properties.name?.toLowerCase() || '';
      return name.includes(searchTerm);
    });

    // Apply limit
    const maxLimit = parseInt(limit as string, 10);
    if (features.length > maxLimit) {
      features = features.slice(0, maxLimit);
    }

    res.json({
      type: 'FeatureCollection',
      features,
      metadata: {
        category,
        query: q,
        total: features.length
      }
    });

  } catch (error) {
    logger.error('Error searching POIs:', error);
    res.status(500).json({ error: 'Failed to search POIs' });
  }
});

/**
 * Clear POI cache
 */
router.post('/cache/clear', (_req, res) => {
  poiCache.clear();
  logger.info('POI cache cleared');
  res.json({ message: 'POI cache cleared successfully' });
});

/**
 * Get POI statistics
 */
router.get('/stats/all', (_req, res) => {
  try {
    if (!fs.existsSync(POI_DATA_DIR)) {
      return res.json({
        stats: {},
        message: 'POI data not extracted yet'
      });
    }

    const files = fs.readdirSync(POI_DATA_DIR);
    const stats: any = {};

    files.forEach(file => {
      if (file.endsWith('.geojson')) {
        const category = file.replace('.geojson', '');
        const filePath = path.join(POI_DATA_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        stats[category] = {
          count: data.features.length,
          size: `${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB`
        };
      }
    });

    res.json({ stats });
  } catch (error) {
    logger.error('Error getting POI stats:', error);
    res.status(500).json({ error: 'Failed to get POI stats' });
  }
});

export default router;
