import express from 'express';
import axios from 'axios';
import logger from '../utils/logger';

const router = express.Router();

/**
 * Proxy for Nominatim geocoding search
 * Avoids CORS issues by proxying through backend
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = '8' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const url = 'https://nominatim.openstreetmap.org/search';
    
    const response = await axios.get(url, {
      params: {
        format: 'json',
        q: q,
        countrycodes: 'pk',
        limit: limit,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'NPMI-Pakistan-Secure-Hub/1.0',
        'Accept-Language': 'en'
      },
      timeout: 10000
    });

    logger.info(`Geocoding search: "${q}" - ${response.data.length} results`);
    
    res.json(response.data);

  } catch (error: any) {
    logger.error('Geocoding search error:', error.message);
    
    if (error.response?.status === 403) {
      return res.status(403).json({ 
        error: 'Nominatim API access forbidden',
        message: 'Please check rate limits or use alternative geocoding service'
      });
    }
    
    res.status(500).json({ 
      error: 'Geocoding search failed',
      message: error.message 
    });
  }
});

/**
 * Reverse geocoding - get address from coordinates
 */
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude (lat) and longitude (lon) are required' });
    }

    const url = 'https://nominatim.openstreetmap.org/reverse';
    
    const response = await axios.get(url, {
      params: {
        format: 'json',
        lat: lat,
        lon: lon,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'NPMI-Pakistan-Secure-Hub/1.0',
        'Accept-Language': 'en'
      },
      timeout: 10000
    });

    logger.info(`Reverse geocoding: ${lat},${lon}`);
    
    res.json(response.data);

  } catch (error: any) {
    logger.error('Reverse geocoding error:', error.message);
    res.status(500).json({ 
      error: 'Reverse geocoding failed',
      message: error.message 
    });
  }
});

export default router;
